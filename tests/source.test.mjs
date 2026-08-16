import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { parse } from "yaml";

const HTTP_METHODS = new Set(["get", "post", "put", "patch", "delete", "options", "head", "trace"]);
const STATUS_VALUES = new Set(["observed", "corroborated", "advertised-only", "vendor-spec"]);
const SHAPE_VALUES = new Set(["typed", "partial", "unknown"]);
const EFFECT_VALUES = new Set(["read", "private-write", "delete", "public-share", "public-rating", "device-link"]);

const spec = parse(await readFile(new URL("../openapi.yaml", import.meta.url), "utf8"));
const provenance = parse(await readFile(new URL("../provenance/sources.yaml", import.meta.url), "utf8"));
const sources = new Set(provenance.sources.map((source) => source.id));
const operations = [];

for (const [path, pathItem] of Object.entries(spec.paths)) {
  for (const [method, operation] of Object.entries(pathItem)) {
    if (HTTP_METHODS.has(method)) operations.push({ path, method, operation });
  }
}

function resolveLocalRef(ref) {
  assert.match(ref, /^#\//, `Expected a local reference, received ${ref}`);
  return ref.slice(2).split("/").reduce((value, token) => value[token.replaceAll("~1", "/").replaceAll("~0", "~")], spec);
}

function requestMedia(operation) {
  let body = operation.requestBody;
  if (body?.$ref) body = resolveLocalRef(body.$ref);
  return body?.content?.["application/json"];
}

test("canonical surface remains complete and unique", () => {
  assert.equal(spec.openapi, "3.1.1");
  assert.equal(Object.keys(spec.paths).length, 44);
  assert.equal(operations.length, 57);

  const operationIds = operations.map(({ operation }) => operation.operationId);
  assert.equal(new Set(operationIds).size, operationIds.length);
  assert.equal(spec.security, undefined, "security must be explicit per operation");
  assert.deepEqual(spec.servers, [{
    url: "https://cookidoo.pl",
    description: "Polish Cookidoo market gateway; other markets are unverified."
  }]);
});

test("path parameters and forbidden headers are modeled correctly", () => {
  for (const { path, operation } of operations) {
    const parameters = [...(spec.paths[path].parameters ?? []), ...(operation.parameters ?? [])]
      .map((parameter) => parameter.$ref ? resolveLocalRef(parameter.$ref) : parameter);
    const declared = new Set(parameters.filter((parameter) => parameter.in === "path").map((parameter) => parameter.name));
    const expected = new Set([...path.matchAll(/\{([^}]+)\}/g)].map((match) => match[1]));
    assert.deepEqual(declared, expected, `${operation.operationId} path parameters`);

    for (const parameter of parameters) {
      if (parameter.in !== "header") continue;
      assert.ok(!["accept", "content-type", "authorization"].includes(parameter.name.toLowerCase()), `${operation.operationId} uses a forbidden header parameter`);
    }
  }
});

test("every operation has explicit provenance, shape, security, and risk", () => {
  for (const { method, operation } of operations) {
    assert.ok(Array.isArray(operation.security) && operation.security.length > 0, `${operation.operationId} security`);
    const metadata = operation["x-cookidoo"];
    assert.ok(metadata, `${operation.operationId} metadata`);
    assert.ok(STATUS_VALUES.has(metadata.status), `${operation.operationId} status`);
    assert.equal(metadata.lastVerified, "2026-08-16");
    assert.equal(metadata.market, "pl");
    assert.ok(SHAPE_VALUES.has(metadata.responseShape), `${operation.operationId} response shape`);
    assert.ok(Array.isArray(metadata.evidence) && metadata.evidence.length > 0, `${operation.operationId} evidence`);

    for (const evidence of metadata.evidence) {
      assert.ok(sources.has(evidence.source), `${operation.operationId} references ${evidence.source}`);
      assert.ok(Array.isArray(evidence.supports) && evidence.supports.includes("path"));
    }

    assert.ok(EFFECT_VALUES.has(metadata.risk.effect), `${operation.operationId} risk effect`);
    for (const field of ["destructive", "externallyVisible", "exercised"]) {
      assert.equal(typeof metadata.risk[field], "boolean", `${operation.operationId} risk.${field}`);
    }
    if (method !== "get") assert.notEqual(metadata.risk.effect, "read", `${operation.operationId} mutation risk`);
  }
});

test("unknown response shapes use only the unconstrained JSON schema", () => {
  for (const { operation } of operations) {
    const metadata = operation["x-cookidoo"];
    const successResponses = Object.entries(operation.responses)
      .filter(([status]) => /^2\d\d$/.test(status))
      .map(([, response]) => response.$ref ? resolveLocalRef(response.$ref) : response);
    const usesUnknown = successResponses.some((response) => Object.values(response.content ?? {}).some((media) => media.schema?.$ref === "#/components/schemas/UnknownJson"));
    if (metadata.responseShape === "unknown") assert.ok(usesUnknown, `${operation.operationId} must use UnknownJson`);
    if (usesUnknown) assert.equal(metadata.responseShape, "unknown", `${operation.operationId} must disclose unknown shape`);
  }
  assert.deepEqual(spec.components.schemas.UnknownJson, {
    description: "Deliberately unconstrained JSON. No object shape is asserted."
  });
});

test("supported mutation payloads are closed and have synthetic examples", () => {
  for (const { method, operation } of operations) {
    if (method === "get") continue;
    const media = requestMedia(operation);
    if (!media) continue;
    let schema = media.schema;
    if (schema?.$ref) schema = resolveLocalRef(schema.$ref);
    if (media.schema?.$ref === "#/components/schemas/UnknownJson") {
      assert.equal(media.example, undefined, `${operation.operationId} must not invent an unknown payload`);
      continue;
    }
    assert.ok(media.example || schema.example, `${operation.operationId} needs a synthetic example`);
  }

  assert.equal(spec.components.schemas.CreateBlankRecipe.additionalProperties, false);
  assert.equal(spec.components.schemas.CopyRecipe.additionalProperties, false);
  assert.ok(!spec.components.schemas.CopyRecipe.required.includes("servingSize"));

  const update = spec.paths["/organize/{lang}/api/custom-list/{listId}"].put.requestBody.content["application/json"].schema;
  assert.ok(update.oneOf.every((branch) => branch.additionalProperties === false));

  const addRef = spec.paths["/shopping/{lang}/recipes/add"].post.requestBody.$ref;
  const removeRef = spec.paths["/shopping/{lang}/recipes/remove"].post.requestBody.$ref;
  assert.equal(addRef, "#/components/requestBodies/RecipeIdsAddBody");
  assert.equal(removeRef, "#/components/requestBodies/RecipeIdsRemoveBody");
  const removeSchema = resolveLocalRef(removeRef).content["application/json"].schema;
  assert.equal(removeSchema.properties.recipeIDs.minItems, 1);
  assert.equal(removeSchema.properties.recipeIDs.uniqueItems, true);
  assert.deepEqual(removeSchema.properties.recipeIDs.items, { type: "string" });
});

test("collection feed contract matches the independently normalized source facts", () => {
  const bootstrap = spec.paths["/recipes/feed-v2/collections/bootstrap"].get;
  const feed = spec.paths["/recipes/feed-v2/collections"].get;
  const pages = spec.paths["/recipes/feed-v2/collections/pages"].get;

  for (const operation of [bootstrap, feed, pages]) {
    assert.deepEqual(operation.security, [{ basicAuth: [] }]);
    assert.ok(operation.responses["200"].content["application/hal+json"]);
    assert.equal(operation["x-cookidoo"].status, "vendor-spec");
  }

  for (const operation of [feed, pages]) {
    const limit = operation.parameters.find((parameter) => parameter.name === "limit");
    assert.equal(limit.schema.$ref, "#/components/schemas/FeedLimit");
  }
  assert.deepEqual(spec.components.schemas.FeedLimit.enum, ["small", "medium", "large"]);
  assert.ok(pages.responses["303"]);
  const pageBefore = pages.parameters.find((parameter) => parameter.name === "pageBefore");
  assert.deepEqual(pageBefore.schema.oneOf.map((entry) => entry.type), ["string", "integer"]);
});

test("credential-like subscription route remains intentionally omitted", () => {
  assert.equal(spec.paths["/search/api/subscription/token"], undefined);
  assert.equal(spec["x-cookidoo-research"].omittedEndpoint, "/search/api/subscription/token");
});

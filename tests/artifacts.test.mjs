import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";
import { parse } from "yaml";

const dist = new URL("../dist/", import.meta.url);

test("bundle preserves the canonical public surface", async () => {
  const bundle = parse(await readFile(new URL("openapi.yaml", dist), "utf8"));
  const methods = new Set(["get", "post", "put", "patch", "delete", "options", "head", "trace"]);
  const operations = Object.values(bundle.paths).flatMap((pathItem) => Object.entries(pathItem).filter(([method]) => methods.has(method)));
  assert.equal(Object.keys(bundle.paths).length, 44);
  assert.equal(operations.length, 57);
});

test("static documentation is generated without an execution control", async () => {
  const html = await readFile(new URL("index.html", dist), "utf8");
  assert.match(html, /Cookidoo Web API \(Unofficial\)/);
  assert.doesNotMatch(html, /try it out/i);
  assert.match(html, /disableTelemetry":true/);
  assert.ok((await stat(new URL("index.html", dist))).size > 100_000);
});

test("TypeScript declarations are generated", async () => {
  const declarations = await readFile(new URL("openapi.d.ts", dist), "utf8");
  assert.match(declarations, /export interface paths/);
  assert.match(declarations, /getRecipe:/);
  assert.ok((await stat(new URL("openapi.d.ts", dist))).size > 10_000);
});

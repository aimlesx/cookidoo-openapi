import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { extname, relative } from "node:path";
import test from "node:test";

const root = new URL("../", import.meta.url);
const ignoredDirectories = new Set([".git", "dist", "node_modules"]);
const textExtensions = new Set(["", ".json", ".md", ".mjs", ".yaml", ".yml"]);
const forbiddenBasenames = new Set([
  "well-known.pl.json",
  "endpoint-catalog.json",
  "ui-routes.sanitized.json",
  "collection-feed-5.6.yaml"
]);
const allowedEmails = new Set(["security@vorwerk.com", "EUDataAct@vorwerk.com"]);
const cookieValuePattern = new RegExp(["Cook", "ie:"].join("") + "\\s*[^\\s=]+=[^\\s;]+", "i");

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const url = new URL(`${entry.name}${entry.isDirectory() ? "/" : ""}`, directory);
    if (entry.isDirectory()) files.push(...await walk(url));
    else files.push(url);
  }
  return files;
}

test("raw and vendor-authored evidence is absent", async () => {
  const files = await walk(root);
  for (const file of files) {
    const name = file.pathname.split("/").at(-1);
    assert.ok(!forbiddenBasenames.has(name), `forbidden evidence file: ${name}`);
  }
});

test("source tree contains no credential or capture signatures", async () => {
  const probe = ["__cre", "ami_api_", "probe_20260816", "_B__"].join("");
  const files = (await walk(root)).filter((file) => textExtensions.has(extname(file.pathname)));

  for (const file of files) {
    const text = await readFile(file, "utf8");
    const name = relative(new URL("../", import.meta.url).pathname, file.pathname);
    assert.ok(!text.includes(probe), `${name} contains the private probe identifier`);
    assert.doesNotMatch(text, /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, `${name} contains a private key`);
    assert.doesNotMatch(text, /Authorization:\s*(?:Bearer|Basic)\s+\S+/i, `${name} contains an authorization value`);
    assert.doesNotMatch(text, cookieValuePattern, `${name} contains a cookie value`);
    assert.doesNotMatch(text, /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/, `${name} contains a JWT-like value`);
    assert.doesNotMatch(text, /<\s*(?:html|script)\b/i, `${name} contains captured HTML or script content`);

    for (const email of text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? []) {
      assert.ok(allowedEmails.has(email), `${name} contains unexpected email ${email}`);
    }
  }
});

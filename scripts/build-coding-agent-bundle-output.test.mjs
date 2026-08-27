import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("./build-coding-agent-bundle.mjs", import.meta.url), "utf8");

test("bundle builds may target an atomic staging directory", () => {
  assert.match(source, /environment\.PI_BUNDLE_OUTPUT_DIR/);
  assert.match(source, /resolve\(environment\.PI_BUNDLE_OUTPUT_DIR\)/);
  assert.match(source, /const bundleDir = resolveBundleDir\(\)/);
});

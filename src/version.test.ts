import { test } from "node:test";
import assert from "node:assert/strict";
import { pickLatest } from "./version.ts";

test("ignores the per-package tag namespaces", () => {
  assert.equal(
    pickLatest(["py-core-v0.2.2", "java-v0.2.3", "core-v0.2.3", "v0.2.1"]),
    "0.2.1",
  );
});

test("ignores pre-release suffixes", () => {
  assert.equal(pickLatest(["v0.2.1-phs", "v0.2.0"]), "0.2.0");
});

test("orders numerically, not lexicographically", () => {
  // The whole reason this isn't a plain .sort(): as strings, "v0.2.9" > "v0.2.10".
  assert.equal(pickLatest(["v0.2.9", "v0.2.10"]), "0.2.10");
  assert.equal(pickLatest(["v0.9.0", "v0.10.0"]), "0.10.0");
  assert.equal(pickLatest(["v1.0.0", "v0.99.99"]), "1.0.0");
});

test("returns null when nothing is a release tag", () => {
  assert.equal(pickLatest(["java-v1.0.0", "nightly"]), null);
  assert.equal(pickLatest([]), null);
});

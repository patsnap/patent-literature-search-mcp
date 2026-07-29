import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_REMOTE_URL, loadConfig } from "../src/config.js";

test("uses the production PatSnap endpoint by default", () => {
  const config = loadConfig({});
  assert.equal(config.remoteUrl.toString(), DEFAULT_REMOTE_URL);
  assert.equal(config.apiKey, undefined);
});

test("adds an API key without exposing it as separate configuration", () => {
  const config = loadConfig({ PATSNAP_API_KEY: "secret-value" });
  assert.equal(config.apiKey, "secret-value");
  assert.equal(config.remoteUrl.searchParams.get("apikey"), "secret-value");
});

test("allows insecure URLs only in tests", () => {
  assert.throws(
    () => loadConfig({ PATSNAP_MCP_URL: "http://localhost:3000/mcp" }),
    /must use HTTPS/,
  );

  const config = loadConfig({
    NODE_ENV: "test",
    PATSNAP_MCP_URL: "http://localhost:3000/mcp?apikey=test-key",
  });
  assert.equal(config.apiKey, "test-key");
});

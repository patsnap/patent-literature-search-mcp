import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import {
  StdioClientTransport,
  getDefaultEnvironment,
} from "@modelcontextprotocol/sdk/client/stdio.js";

if (!process.env.PATSNAP_TEST_API_KEY) {
  throw new Error(
    "PATSNAP_TEST_API_KEY is required for the opt-in upstream integration test.",
  );
}

const transport = new StdioClientTransport({
  command: process.execPath,
  args: ["src/index.js"],
  cwd: process.cwd(),
  env: {
    ...getDefaultEnvironment(),
    NODE_ENV: "production",
    PATSNAP_API_KEY: process.env.PATSNAP_TEST_API_KEY,
  },
  stderr: "pipe",
});
const client = new Client(
  { name: "upstream-smoke-test", version: "1.0.0" },
  { capabilities: {} },
);

try {
  await client.connect(transport);
  const result = await client.callTool({
    name: "patsnap_search",
    arguments: {
      semantic_query: "lithium-ion battery recycling",
      search_strategy: ["semantic"],
      source: "patent",
      limit: 1,
    },
  });

  assert.notEqual(result.isError, true, "The PatSnap upstream returned an MCP error.");
  assert.ok(result.content.length > 0, "The PatSnap upstream returned no content.");
  process.stdout.write("PatSnap upstream MCP smoke test passed.\n");
} finally {
  await client.close();
}

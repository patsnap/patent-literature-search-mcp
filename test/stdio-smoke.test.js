import assert from "node:assert/strict";
import test from "node:test";
import {
  StdioClientTransport,
  getDefaultEnvironment,
} from "@modelcontextprotocol/sdk/client/stdio.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

test("the production entrypoint completes an MCP handshake without an API key", async () => {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ["src/index.js"],
    cwd: process.cwd(),
    env: {
      ...getDefaultEnvironment(),
      NODE_ENV: "production",
    },
    stderr: "pipe",
  });
  const client = new Client(
    { name: "stdio-smoke-test", version: "1.0.0" },
    { capabilities: {} },
  );

  try {
    await client.connect(transport);
    const result = await client.listTools();
    assert.deepEqual(
      result.tools.map((tool) => tool.name),
      ["patsnap_search", "patsnap_fetch"],
    );

    const missingKey = await client.callTool({
      name: "patsnap_search",
      arguments: {
        search_strategy: ["semantic"],
        semantic_query: "battery recycling",
        source: "patent",
      },
    });
    assert.equal(missingKey.isError, true);
    assert.match(missingKey.content[0].text, /PATSNAP_API_KEY/);
  } finally {
    await client.close();
  }
});

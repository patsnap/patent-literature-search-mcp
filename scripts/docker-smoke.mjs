import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const image = process.env.MCP_DOCKER_IMAGE || "patent-literature-search-mcp:test";
const transport = new StdioClientTransport({
  command: "docker",
  args: ["run", "--rm", "-i", image],
  stderr: "inherit",
});
const client = new Client(
  { name: "docker-smoke-test", version: "1.0.0" },
  { capabilities: {} },
);

try {
  await client.connect(transport);
  const result = await client.listTools();
  assert.deepEqual(
    result.tools.map((tool) => tool.name),
    ["patsnap_search", "patsnap_fetch"],
  );
  process.stdout.write(`Docker MCP handshake passed for ${image}.\n`);
} finally {
  await client.close();
}

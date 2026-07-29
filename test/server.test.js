import assert from "node:assert/strict";
import test from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createPatSnapServer } from "../src/server.js";

async function createConnectedPair(callRemoteTool) {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const server = createPatSnapServer({ callRemoteTool });
  const client = new Client(
    { name: "patsnap-test-client", version: "1.0.0" },
    { capabilities: {} },
  );

  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

  return {
    client,
    async close() {
      await Promise.allSettled([client.close(), server.close()]);
    },
  };
}

test("lists static, read-only tool definitions without contacting PatSnap", async () => {
  let remoteCalls = 0;
  const pair = await createConnectedPair(async () => {
    remoteCalls += 1;
    throw new Error("The remote should not be contacted by tools/list.");
  });

  try {
    const result = await pair.client.listTools();
    assert.deepEqual(
      result.tools.map((tool) => tool.name),
      ["patsnap_search", "patsnap_fetch"],
    );
    assert.equal(remoteCalls, 0);

    for (const tool of result.tools) {
      assert.equal(tool.annotations?.readOnlyHint, true);
      assert.equal(tool.annotations?.destructiveHint, false);
      assert.equal(tool.annotations?.idempotentHint, true);
    }

    const fetchTool = result.tools.find((tool) => tool.name === "patsnap_fetch");
    assert.deepEqual(fetchTool.inputSchema.required, ["keys"]);
  } finally {
    await pair.close();
  }
});

test("forwards validated tool arguments and preserves structured results", async () => {
  const calls = [];
  const pair = await createConnectedPair(async (name, args) => {
    calls.push({ name, args });
    return {
      content: [{ type: "text", text: "ok" }],
      structuredContent: { count: 1 },
    };
  });

  try {
    const result = await pair.client.callTool({
      name: "patsnap_search",
      arguments: {
        semantic_query: "solid-state battery electrolyte",
        search_strategy: ["semantic", "filter"],
        source: "patent",
        limit: 10,
        filters: { jurisdictions: ["US", "EP"] },
      },
    });

    assert.deepEqual(calls, [
      {
        name: "patsnap_search",
        args: {
          semantic_query: "solid-state battery electrolyte",
          search_strategy: ["semantic", "filter"],
          source: "patent",
          limit: 10,
          filters: { jurisdictions: ["US", "EP"] },
        },
      },
    ]);
    assert.deepEqual(result.content, [{ type: "text", text: "ok" }]);
    assert.deepEqual(result.structuredContent, { count: 1 });
  } finally {
    await pair.close();
  }
});

test("returns upstream failures as MCP tool errors without crashing", async () => {
  const pair = await createConnectedPair(async () => {
    throw new Error(
      "PATSNAP_API_KEY is required. https://example.test/mcp?apikey=secret-value",
    );
  });

  try {
    const result = await pair.client.callTool({
      name: "patsnap_fetch",
      arguments: { keys: ["US1234567A"] },
    });

    assert.equal(result.isError, true);
    assert.match(result.content[0].text, /PATSNAP_API_KEY/);
    assert.doesNotMatch(result.content[0].text, /secret-value/);
    assert.match(result.content[0].text, /apikey=\[REDACTED\]/);

    const tools = await pair.client.listTools();
    assert.equal(tools.tools.length, 2);
  } finally {
    await pair.close();
  }
});

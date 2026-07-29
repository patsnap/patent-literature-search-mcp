import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

export function createRemoteToolClient({ apiKey, remoteUrl }) {
  let client;
  let connecting;

  async function getClient() {
    if (!apiKey) {
      throw new Error(
        "PATSNAP_API_KEY is required for PatSnap search and fetch calls. " +
          "Create a key at https://open.patsnap.com.",
      );
    }

    if (client) return client;

    if (!connecting) {
      connecting = (async () => {
        const nextClient = new Client(
          {
            name: "patsnap-patent-literature-search-bridge",
            version: "1.1.0",
          },
          { capabilities: {} },
        );

        await nextClient.connect(new StreamableHTTPClientTransport(remoteUrl));
        client = nextClient;
        return nextClient;
      })().finally(() => {
        connecting = undefined;
      });
    }

    return connecting;
  }

  return {
    async callTool(name, args) {
      const remoteClient = await getClient();
      return remoteClient.callTool({ name, arguments: args });
    },

    async close() {
      const currentClient = client;
      client = undefined;
      if (currentClient) await currentClient.close();
    },
  };
}

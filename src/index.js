import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./config.js";
import { createRemoteToolClient } from "./remote-client.js";
import { createPatSnapServer } from "./server.js";

const config = loadConfig();
const remote = createRemoteToolClient(config);
const server = createPatSnapServer({
  callRemoteTool: (name, args) => remote.callTool(name, args),
});

let closing = false;

async function close() {
  if (closing) return;
  closing = true;
  await Promise.allSettled([remote.close(), server.close()]);
}

process.once("SIGINT", () => {
  void close().finally(() => process.exit(0));
});

process.once("SIGTERM", () => {
  void close().finally(() => process.exit(0));
});

await server.connect(new StdioServerTransport());

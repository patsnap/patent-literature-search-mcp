const DEFAULT_REMOTE_URL = "https://connect.patsnap.com/2b0355/logic-mcp";

export function loadConfig(env = process.env) {
  const remoteUrl = new URL(env.PATSNAP_MCP_URL || DEFAULT_REMOTE_URL);

  if (!["https:", "http:"].includes(remoteUrl.protocol)) {
    throw new Error("PATSNAP_MCP_URL must use HTTP or HTTPS.");
  }

  if (remoteUrl.protocol !== "https:" && env.NODE_ENV !== "test") {
    throw new Error("PATSNAP_MCP_URL must use HTTPS outside test environments.");
  }

  const apiKey =
    env.PATSNAP_API_KEY?.trim() || remoteUrl.searchParams.get("apikey")?.trim();
  if (apiKey) {
    remoteUrl.searchParams.set("apikey", apiKey);
  }

  return {
    apiKey,
    remoteUrl,
  };
}

export { DEFAULT_REMOTE_URL };

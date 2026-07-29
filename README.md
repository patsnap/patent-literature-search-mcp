# Patent & Literature Search MCP

[![Smithery badge](https://smithery.ai/badge/openpatsnap/patsnap-patent-literature-search)](https://smithery.ai/servers/openpatsnap/patsnap-patent-literature-search)

Search 200M+ patents and scientific literature in natural language,
directly inside Claude, Cursor, or any MCP-compatible AI tool.
Powered by Patsnap's proprietary R&D intelligence database.

## About Patsnap

Patsnap is a global innovation intelligence platform covering 200M+
patents across 170+ jurisdictions (USPTO, EPO, WIPO and more), 216M+
scientific papers, and R&D data.

To explore Patsnap data interactively, try
[Eureka](https://eureka.patsnap.com), Patsnap's AI-native R&D
assistant. To access data programmatically, use the MCP servers or
REST API via [Patsnap Open Platform](https://open.patsnap.com).

## What It Does

Patent & Literature Search MCP gives your AI agent direct access to
Patsnap's patent and academic literature databases — searchable
together in a single query, in natural language, without switching
tools or learning Boolean syntax.

- **Patent search** — keyword, assignee, inventor, IPC class, legal
  status, date range, and citation filters
- **Literature search** — semantic and keyword search across
  peer-reviewed scientific papers
- **Fusion search** — orchestrate patent and paper searches using the
  same tool and combine the structured results for AI reasoning
- **Natural language input** — describe your problem or topic in
  plain English or Chinese; the MCP constructs the search strategy
- **Precision filtering** — filter by assignee, inventor, legal
  status, jurisdiction, date range, and citation count simultaneously

## Quick Start

### 1. Get your API key

Register at [Patsnap Open Platform](https://open.patsnap.com) and
generate a free API key from the
[Patent & Literature Search MCP page](https://open.patsnap.com/marketplace/mcp-servers/patsnap-search).
New accounts include 10,000 free credits. No credit card required.

### 2. Add to Claude Code

```bash
claude mcp add --transport http search-tool \
  "https://connect.patsnap.com/2b0355/logic-mcp?apikey=YOUR_API_KEY"
```

Restart Claude Code and type `/mcp` to confirm it loaded.

### 3. Add to Cursor or Windsurf

Add the following to your MCP configuration file:

```json
{
  "mcpServers": {
    "patsnap_patent_literature": {
      "url": "https://connect.patsnap.com/2b0355/logic-mcp?apikey=YOUR_API_KEY",
      "type": "streamableHttp"
    }
  }
}
```

Replace `YOUR_API_KEY` with your key from Patsnap Open Platform.

## Run the Containerized MCP Bridge

The repository includes a local stdio bridge for environments that
install or deploy MCP servers from source. It exposes static tool
definitions without credentials and forwards tool calls to the hosted
Patsnap Streamable HTTP service when `PATSNAP_API_KEY` is configured.

### Docker

```bash
docker build -t patsnap-patent-literature-search .
docker run --rm -i \
  -e PATSNAP_API_KEY=YOUR_API_KEY \
  patsnap-patent-literature-search
```

MCP client configuration:

```json
{
  "mcpServers": {
    "patsnap_patent_literature": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "-e",
        "PATSNAP_API_KEY",
        "ghcr.io/patsnap/patent-literature-search-mcp:latest"
      ],
      "env": {
        "PATSNAP_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}
```

The GitHub Actions workflow publishes version tags such as `v1.1.0`
to GHCR as both `1.1.0` and `latest`.

An optional live upstream check can be run manually from GitHub
Actions. Add `PATSNAP_TEST_API_KEY` as a repository Actions secret,
start the workflow with **Run workflow**, and enable
`run_upstream`. Pull requests never receive or use this secret.

## Tools

- `patsnap_search` — Search either patents or scientific literature in a
  request. Supports natural-language and semantic queries, precise keyword
  and BM25-based text search, and filters such as assignee, inventor, IPC
  classification, legal status, jurisdiction, date range, and citations.
  Call it once per source when both corpora are required.
- `patsnap_fetch` — Retrieve a patent or literature record as Markdown using
  one or more result URLs. Patent records can also be fetched by publication
  number and may include bibliographic data, claims, descriptions, drawings,
  citations, legal data, and patent-family data. Literature records include
  core bibliographic and abstract metadata.

## Development

Requires Node.js 20 or newer.

```bash
npm ci
npm test
npm start
```

The test suite verifies:

- static tool discovery without an API key;
- argument validation and upstream forwarding;
- structured MCP error handling;
- a real stdio `initialize` and `tools/list` handshake.

To verify the container locally:

```bash
docker build -t patent-literature-search-mcp:test .
npm run test:docker
```

The server writes MCP JSON-RPC only to stdout. Application errors are
returned as MCP tool results, and credentials are never included in logs.

## Glama Release

After claiming the server on Glama:

1. Open the server's Dockerfile Admin page.
2. Select the repository-root `Dockerfile`.
3. Add `PATSNAP_API_KEY` as a secret deployment environment variable.
4. Use `node src/index.js` as the command if Glama does not infer the
   Dockerfile `CMD`.
5. Run **Deploy**, verify the MCP build test, and create a release.

## Example Prompts

```
What is Tesla actually working on in battery technology — show me
their recent patent filings, group by technology area, and identify
who is leading each.
```

```
Which GLP-1 receptor agonist patents are expiring before 2028,
and what does recent literature say about next-generation mechanisms?
```

```
My EV battery loses 40% range in cold weather. What technical
solutions exist in patents and academic papers?
```

## Resources

- [Patsnap](https://www.patsnap.com)
- [Patsnap Open Platform](https://open.patsnap.com)
- [Patent & Literature Search MCP](https://open.patsnap.com/marketplace/mcp-servers/patsnap-search)
- [Eureka](https://eureka.patsnap.com)
- [All Patsnap MCP Servers](https://github.com/patsnap/mcp)

## License

Apache-2.0

---

Powered by [Patsnap](https://www.patsnap.com). Innovate with Confidence.

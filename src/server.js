import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const searchInputSchema = {
  semantic_query: z
    .string()
    .optional()
    .describe("Natural-language description of the technical problem or concept to search."),
  search_strategy: z
    .array(z.enum(["semantic", "keyword", "filter"]))
    .min(1)
    .optional()
    .describe(
      "Search strategies to combine: semantic search, BM25 keyword matching, and structured filtering.",
    ),
  keywords: z
    .array(z.string())
    .optional()
    .describe("Technical terms used for BM25 keyword matching."),
  offset: z
    .number()
    .int()
    .min(0)
    .optional()
    .describe("Number of results to skip. offset + limit must not exceed 1000."),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .describe("Number of results to return, from 1 to 100."),
  source: z
    .enum(["patent", "paper"])
    .optional()
    .describe(
      "Single corpus to search. Use patent for global patent data or paper for scientific literature.",
    ),
  filters: z
    .record(z.unknown())
    .optional()
    .describe(
      "Structured filters such as assignees, inventors, IPC classifications, jurisdictions, dates, legal status, or citations.",
    ),
  sort: z
    .string()
    .optional()
    .describe(
      "Sort order. Use relevance or a provider-supported field; prefix a field with - for descending order.",
    ),
};

const fetchInputSchema = {
  key_type: z
    .enum(["url", "pn"])
    .optional()
    .describe("Identifier type: url for result URLs or pn for patent publication numbers."),
  compress: z
    .boolean()
    .optional()
    .describe("Return gzip-compressed, base64-encoded Markdown to reduce response size."),
  keys: z
    .array(z.string())
    .min(1)
    .max(100)
    .describe("Result URLs or patent publication numbers to fetch, up to 100 entries."),
  module: z
    .array(z.enum(["basic", "citation", "legal", "family"]))
    .min(1)
    .optional()
    .describe(
      "Content modules to retrieve. Patent records support basic, citation, legal, and family; papers support basic.",
    ),
  include_images: z
    .boolean()
    .optional()
    .describe("Include signed patent drawing URLs when available."),
};

function errorResult(error) {
  const unsafeMessage = error instanceof Error ? error.message : String(error);
  const message = unsafeMessage
    .replace(/([?&]apikey=)[^&\s]+/gi, "$1[REDACTED]")
    .replace(/\bBearer\s+[A-Za-z0-9._~+/=-]+/gi, "Bearer [REDACTED]");
  return {
    content: [{ type: "text", text: message }],
    isError: true,
  };
}

function normalizeToolResult(result) {
  const normalized = {
    content: Array.isArray(result?.content)
      ? result.content
      : [{ type: "text", text: JSON.stringify(result ?? null) }],
  };

  if (result?.isError) normalized.isError = true;
  if (result?.structuredContent !== undefined) {
    normalized.structuredContent = result.structuredContent;
  }

  return normalized;
}

export function createPatSnapServer({ callRemoteTool }) {
  const server = new McpServer({
    name: "patsnap-patent-literature-search",
    version: "1.1.0",
  });

  server.registerTool(
    "patsnap_search",
    {
      title: "Search PatSnap patents and scientific literature",
      description:
        "Search PatSnap's global patent or scientific-literature database using semantic concepts, BM25 keywords, and multidimensional filters. Search one corpus per call and preserve returned record URLs for patsnap_fetch.",
      inputSchema: searchInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        return normalizeToolResult(await callRemoteTool("patsnap_search", args));
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "patsnap_fetch",
    {
      title: "Fetch PatSnap patent or literature records",
      description:
        "Retrieve Markdown for PatSnap patent or scientific-literature records using result URLs, or fetch patents by publication number. Patent output may include bibliographic data, claims, descriptions, legal data, families, citations, and drawings.",
      inputSchema: fetchInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        return normalizeToolResult(await callRemoteTool("patsnap_fetch", args));
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  return server;
}

export { fetchInputSchema, searchInputSchema };

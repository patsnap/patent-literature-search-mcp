FROM node:22-bookworm-slim

LABEL io.modelcontextprotocol.server.name="io.github.patsnap/patent-literature-search-mcp"

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts \
    && npm cache clean --force

COPY --chown=node:node src ./src

USER node

CMD ["node", "src/index.js"]

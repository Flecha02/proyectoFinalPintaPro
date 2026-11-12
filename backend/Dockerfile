FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

USER node

COPY --chown=node:node --from=deps /app/node_modules ./node_modules
COPY --chown=node:node package.json ./
COPY --chown=node:node index.js ./
COPY --chown=node:node swagger-output.json ./
COPY --chown=node:node swagger.js ./
COPY --chown=node:node src ./src

EXPOSE 4000

CMD ["node", "index.js"]

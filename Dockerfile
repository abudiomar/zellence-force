FROM oven/bun:1.3.2-slim AS bun-runtime

FROM node:22-bookworm-slim AS builder

WORKDIR /app

COPY --from=bun-runtime /usr/local/bin/bun /usr/local/bin/bun
RUN ln -s /usr/local/bin/bun /usr/local/bin/bunx

COPY package.json bun.lock turbo.json tsconfig.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY apps/worker/package.json apps/worker/package.json
COPY packages/application/package.json packages/application/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/contracts/package.json packages/contracts/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/domain/package.json packages/domain/package.json
COPY packages/ui/package.json packages/ui/package.json

RUN bun install --frozen-lockfile

COPY . .

ARG NEXT_PUBLIC_API_URL=https://force.zellence.dev
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN bunx turbo build --filter='!@zellforce/web'
RUN cd apps/web && node node_modules/next/dist/bin/next build

FROM oven/bun:1.3.2-slim AS api

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app /app

EXPOSE 4000
CMD ["bun", "run", "apps/api/src/server.ts"]

FROM node:22-bookworm-slim AS web

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/messages ./apps/web/messages

EXPOSE 3000
CMD ["node", "apps/web/server.js"]

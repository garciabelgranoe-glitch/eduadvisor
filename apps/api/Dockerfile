FROM node:20-bookworm-slim

RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/database/package.json packages/database/package.json

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm --filter @eduadvisor/api prisma:generate
RUN pnpm --filter @eduadvisor/api build

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

CMD ["pnpm", "--filter", "@eduadvisor/api", "start"]

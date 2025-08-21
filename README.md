# quick-bite monorepo

Monorepo for Quick Bite QR Ordering MVP. Clean architecture, microservice-ready.

## Apps & Services

- apps/web: Next.js diner/staff/KDS UI
- services/api-gateway: Fastify TypeScript API (BFF) with Postgres migrations
- packages/\*: shared libraries (domain models, DTOs, UI, config)

## Prerequisites

- Node.js LTS
- Docker

## Getting Started

```bash
npm i -g turbo
npm install
docker compose up -d postgres
```

Then in separate terminals:

```bash
npm run dev
```

This will run all dev servers in parallel.

# API Gateway (Fastify + Drizzle)

Commands:

```bash
npm install
export DATABASE_URL=postgres://quickbite:quickbite@localhost:5432/quickbite
npx drizzle-kit generate
npm run migrate
npx tsx scripts/seed.ts
npm run dev
```

Endpoints:

- GET /health
- GET /api/menu/:restaurantId
- POST /api/orders
- GET /api/orders/active/:restaurantId

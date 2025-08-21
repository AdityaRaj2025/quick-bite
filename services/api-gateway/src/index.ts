import Fastify from "fastify";
import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import { registerMenuRoutes } from "./routes/menu";
import { registerOrderRoutes } from "./routes/orders";
import { registerAuthRoutes } from "./routes/auth";
import { registerAdminRoutes } from "./routes/admin";

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });
await app.register(sensible);

app.get("/health", async () => ({ ok: true }));

await registerMenuRoutes(app);
await registerOrderRoutes(app);
await registerAuthRoutes(app);
await registerAdminRoutes(app);

const port = Number(process.env.PORT ?? 4000);
app.listen({ port, host: "0.0.0.0" }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});

import { FastifyInstance } from "fastify";
import { getMenuUseCase } from "@quick-bite/core";
import { menuRepository } from "../adapters/drizzle-repositories";

export async function registerMenuRoutes(app: FastifyInstance) {
  app.get("/api/menu/:restaurantId", async (req) => {
    const restaurantId = (req.params as any).restaurantId as string;
    return getMenuUseCase(menuRepository, restaurantId);
  });
}

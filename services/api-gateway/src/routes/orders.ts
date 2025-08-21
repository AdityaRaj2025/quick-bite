import { FastifyInstance } from "fastify";
import { createOrderUseCase } from "@quick-bite/core";
import {
  orderRepository,
  tableRepository,
} from "../adapters/drizzle-repositories";
import { db } from "../db/client";
import { orders } from "../db/schema";
import { eq, desc } from "drizzle-orm";

export async function registerOrderRoutes(app: FastifyInstance) {
  app.post("/api/orders", async (req) => {
    const body = req.body as any;
    return createOrderUseCase(orderRepository, tableRepository, body);
  });

  app.get("/api/orders/active/:restaurantId", async (req) => {
    const restaurantId = (req.params as any).restaurantId as string;
    const rows = await db
      .select()
      .from(orders)
      .where(eq(orders.restaurantId, restaurantId))
      .orderBy(desc(orders.createdAt))
      .limit(200);
    return rows;
  });
}

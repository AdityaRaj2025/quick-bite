import { FastifyInstance } from "fastify";
import { db } from "../db/client";
import { categories, items, restaurants, tables } from "../db/schema";
import { eq } from "drizzle-orm";

export async function registerAdminRoutes(app: FastifyInstance) {
  // Bootstrap restaurant (for signup flow)
  app.post("/api/admin/bootstrap-restaurant", async (req) => {
    const body = req.body as any;
    const [r] = await db
      .insert(restaurants)
      .values({ name: body.name, localeDefault: "ja" })
      .returning();
    // create a few tables
    for (const code of ["T01", "T02", "T03"]) {
      await db
        .insert(tables)
        .values({ restaurantId: r.id, code, displayName: code })
        .onConflictDoNothing();
    }
    return r;
  });
  // Categories CRUD
  app.post("/api/admin/:restaurantId/categories", async (req) => {
    const { restaurantId } = req.params as any;
    const body = req.body as any;
    const [row] = await db
      .insert(categories)
      .values({
        restaurantId,
        nameI18n: body.nameI18n,
        sortOrder: body.sortOrder ?? 0,
        isActive: true,
      })
      .returning();
    return row;
  });

  app.patch("/api/admin/:restaurantId/categories/:id", async (req) => {
    const { restaurantId, id } = req.params as any;
    const body = req.body as any;
    const [row] = await db
      .update(categories)
      .set({
        nameI18n: body.nameI18n,
        sortOrder: body.sortOrder,
        isActive: body.isActive,
      })
      .where(eq(categories.id, id))
      .returning();
    return row;
  });

  // Items CRUD
  app.post("/api/admin/:restaurantId/items", async (req) => {
    const { restaurantId } = req.params as any;
    const body = req.body as any;
    const [row] = await db
      .insert(items)
      .values({
        restaurantId,
        categoryId: body.categoryId ?? null,
        nameI18n: body.nameI18n,
        priceJpy: body.priceJpy,
        sortOrder: body.sortOrder ?? 0,
        isActive: true,
      })
      .returning();
    return row;
  });

  app.patch("/api/admin/:restaurantId/items/:id", async (req) => {
    const { id } = req.params as any;
    const body = req.body as any;
    const [row] = await db
      .update(items)
      .set({
        nameI18n: body.nameI18n,
        priceJpy: body.priceJpy,
        sortOrder: body.sortOrder,
        isActive: body.isActive,
      })
      .where(eq(items.id, id))
      .returning();
    return row;
  });
}

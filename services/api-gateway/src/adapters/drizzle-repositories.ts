import { db } from "../db/client";
import {
  categories,
  items,
  orders,
  orderItemOptions,
  orderItems,
  tables,
} from "../db/schema";
import { and, desc, eq } from "drizzle-orm";
import type {
  MenuRepositoryPort,
  OrderRepositoryPort,
  TableRepositoryPort,
} from "@quick-bite/core";

export const menuRepository: MenuRepositoryPort = {
  async getCategories(restaurantId) {
    return db
      .select()
      .from(categories)
      .where(eq(categories.restaurantId, restaurantId))
      .orderBy(categories.sortOrder);
  },
  async getItems(restaurantId) {
    return db
      .select()
      .from(items)
      .where(
        and(eq(items.restaurantId, restaurantId), eq(items.isActive, true))
      )
      .orderBy(items.sortOrder);
  },
};

export const tableRepository: TableRepositoryPort = {
  async findByRestaurantAndCode(restaurantId, code) {
    return db.query.tables.findFirst({
      where: (t, { eq, and }) =>
        and(eq(t.restaurantId, restaurantId), eq(t.code, code)),
    });
  },
};

export const orderRepository: OrderRepositoryPort = {
  async create(order) {
    const [row] = await db
      .insert(orders)
      .values({
        restaurantId: order.restaurantId,
        tableId: order.tableId,
        tableCode: order.tableCode,
        locale: order.locale,
        status: order.status,
        subtotalJpy: order.subtotalJpy,
        taxJpy: order.taxJpy,
        serviceChargeJpy: order.serviceChargeJpy,
        totalJpy: order.totalJpy,
        notes: order.notes ?? null,
      })
      .returning();
    return row as any;
  },
  async addItems(orderId, itemsPayload) {
    for (const li of itemsPayload) {
      const [row] = await db
        .insert(orderItems)
        .values({
          orderId,
          itemId: li.itemId ?? null,
          nameSnapshot: li.nameSnapshot,
          quantity: li.quantity,
          basePriceJpy: li.basePriceJpy,
          lineTotalJpy: li.lineTotalJpy,
        })
        .returning();
      // options can be added when we wire it
      void row;
    }
  },
};

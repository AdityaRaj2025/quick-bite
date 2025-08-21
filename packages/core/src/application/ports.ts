import { Category, Item, Order, OrderItem, Table } from "../domain/entities";

export interface MenuRepositoryPort {
  getCategories(restaurantId: string): Promise<Category[]>;
  getItems(restaurantId: string): Promise<Item[]>;
}

export interface TableRepositoryPort {
  findByRestaurantAndCode(
    restaurantId: string,
    code: string
  ): Promise<Table | null>;
}

export interface OrderRepositoryPort {
  create(order: Omit<Order, "id">): Promise<Order>;
  addItems(
    orderId: string,
    items: Omit<OrderItem, "id" | "orderId">[]
  ): Promise<void>;
}

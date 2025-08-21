import {
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
  jsonb,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/pg-core";

export const orderStatus = pgEnum("order_status", [
  "placed",
  "acknowledged",
  "in_kitchen",
  "ready",
  "served",
  "cancelled",
]);

export const restaurants = pgTable("restaurants", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  localeDefault: text("locale_default").notNull().default("en"),
  taxRate: text("tax_rate").notNull().default("10.00"),
  serviceCharge: text("service_charge").notNull().default("0.00"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const tables = pgTable(
  "tables",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    displayName: text("display_name"),
  },
  (t) => ({
    uniqRestaurantCode: uniqueIndex("tables_restaurant_code_unique").on(
      t.restaurantId,
      t.code
    ),
  })
);

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  restaurantId: uuid("restaurant_id")
    .notNull()
    .references(() => restaurants.id, { onDelete: "cascade" }),
  nameI18n: jsonb("name_i18n").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const items = pgTable("items", {
  id: uuid("id").primaryKey().defaultRandom(),
  restaurantId: uuid("restaurant_id")
    .notNull()
    .references(() => restaurants.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  nameI18n: jsonb("name_i18n").notNull(),
  descriptionI18n: jsonb("description_i18n"),
  priceJpy: integer("price_jpy").notNull(),
  allergens: text("allergens").array(),
  imagePath: text("image_path"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const optionGroups = pgTable("option_groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  restaurantId: uuid("restaurant_id")
    .notNull()
    .references(() => restaurants.id, { onDelete: "cascade" }),
  nameI18n: jsonb("name_i18n").notNull(),
  minSelect: integer("min_select").notNull().default(0),
  maxSelect: integer("max_select").notNull().default(1),
});

export const itemOptionGroups = pgTable(
  "item_option_groups",
  {
    itemId: uuid("item_id").references(() => items.id, { onDelete: "cascade" }),
    groupId: uuid("group_id").references(() => optionGroups.id, {
      onDelete: "cascade",
    }),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.itemId, t.groupId] }),
  })
);

export const options = pgTable("options", {
  id: uuid("id").primaryKey().defaultRandom(),
  groupId: uuid("group_id")
    .notNull()
    .references(() => optionGroups.id, { onDelete: "cascade" }),
  nameI18n: jsonb("name_i18n").notNull(),
  priceDeltaJpy: integer("price_delta_jpy").notNull().default(0),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  restaurantId: uuid("restaurant_id")
    .notNull()
    .references(() => restaurants.id, { onDelete: "cascade" }),
  tableId: uuid("table_id")
    .notNull()
    .references(() => tables.id),
  tableCode: text("table_code").notNull(),
  locale: text("locale").notNull(),
  status: orderStatus("status").notNull().default("placed"),
  subtotalJpy: integer("subtotal_jpy").notNull(),
  taxJpy: integer("tax_jpy").notNull(),
  serviceChargeJpy: integer("service_charge_jpy").notNull().default(0),
  totalJpy: integer("total_jpy").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  itemId: uuid("item_id").references(() => items.id),
  nameSnapshot: text("name_snapshot").notNull(),
  quantity: integer("quantity").notNull(),
  basePriceJpy: integer("base_price_jpy").notNull(),
  lineTotalJpy: integer("line_total_jpy").notNull(),
});

export const orderItemOptions = pgTable("order_item_options", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderItemId: uuid("order_item_id")
    .notNull()
    .references(() => orderItems.id, { onDelete: "cascade" }),
  nameSnapshot: text("name_snapshot").notNull(),
  priceDeltaJpy: integer("price_delta_jpy").notNull(),
});

export const orderEvents = pgTable("order_events", {
  id: serial("id").primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  fromStatus: orderStatus("from_status"),
  toStatus: orderStatus("to_status").notNull(),
  actorRole: text("actor_role").notNull(),
  actorId: uuid("actor_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const staffUsers = pgTable("staff_users", {
  id: uuid("id").primaryKey(),
  restaurantId: uuid("restaurant_id")
    .notNull()
    .references(() => restaurants.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  displayName: text("display_name"),
});

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: text("role").notNull(),
    restaurantId: uuid("restaurant_id").references(() => restaurants.id, {
      onDelete: "cascade",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    emailUnique: uniqueIndex("users_email_unique").on(t.email),
  })
);

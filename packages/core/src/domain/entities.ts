export type UUID = string;

export type Restaurant = {
  id: UUID;
  name: string;
  localeDefault: string;
  taxRatePercent: number;
};

export type Table = {
  id: UUID;
  restaurantId: UUID;
  code: string;
  displayName?: string | null;
};

export type Category = {
  id: UUID;
  restaurantId: UUID;
  nameI18n: Record<string, string>;
  sortOrder: number;
  isActive: boolean;
};

export type Item = {
  id: UUID;
  restaurantId: UUID;
  categoryId: UUID | null;
  nameI18n: Record<string, string>;
  descriptionI18n?: Record<string, string> | null;
  priceJpy: number;
  allergens?: string[] | null;
  imagePath?: string | null;
  isActive: boolean;
  sortOrder: number;
};

export type Order = {
  id: UUID;
  restaurantId: UUID;
  tableId: UUID;
  tableCode: string;
  locale: string;
  status:
    | "placed"
    | "acknowledged"
    | "in_kitchen"
    | "ready"
    | "served"
    | "cancelled";
  subtotalJpy: number;
  taxJpy: number;
  serviceChargeJpy: number;
  totalJpy: number;
  notes?: string | null;
};

export type OrderItem = {
  id: UUID;
  orderId: UUID;
  itemId: UUID | null;
  nameSnapshot: string;
  quantity: number;
  basePriceJpy: number;
  lineTotalJpy: number;
};

import { OrderRepositoryPort, TableRepositoryPort } from "../application/ports";
import { computeTax, computeTotal } from "../domain/value-objects";

type CreateOrderItemInput = {
  nameSnapshot: string;
  quantity: number;
  basePriceJpy: number;
  lineTotalJpy: number;
  options?: { nameSnapshot: string; priceDeltaJpy: number }[];
  itemId?: string | null;
};

export type CreateOrderInput = {
  restaurantId: string;
  tableCode: string;
  locale: string;
  items: CreateOrderItemInput[];
  notes?: string;
  taxRatePercent?: number;
};

export async function createOrderUseCase(
  orderRepo: OrderRepositoryPort,
  tableRepo: TableRepositoryPort,
  input: CreateOrderInput
) {
  const table = await tableRepo.findByRestaurantAndCode(
    input.restaurantId,
    input.tableCode
  );
  if (!table) throw new Error("Invalid table");

  let subtotal = 0;
  for (const li of input.items) subtotal += li.lineTotalJpy;
  const tax = computeTax(subtotal, input.taxRatePercent ?? 10);
  const total = computeTotal(subtotal, tax, 0);

  const created = await orderRepo.create({
    restaurantId: input.restaurantId,
    tableId: table.id,
    tableCode: input.tableCode,
    locale: input.locale,
    status: "placed",
    subtotalJpy: subtotal,
    taxJpy: tax,
    serviceChargeJpy: 0,
    totalJpy: total,
    notes: input.notes ?? null,
  });

  const orderItemPayloads = input.items.map((li) => ({
    itemId: li.itemId ?? null,
    nameSnapshot: li.nameSnapshot,
    quantity: li.quantity,
    basePriceJpy: li.basePriceJpy,
    lineTotalJpy: li.lineTotalJpy,
  }));
  await orderRepo.addItems(created.id, orderItemPayloads);

  return { orderId: created.id };
}

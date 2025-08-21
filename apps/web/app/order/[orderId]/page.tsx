"use client";
import { useOrderStatus } from "../../../hooks/useOrderStatus";

export default function OrderStatusPage({
  params,
}: {
  params: { orderId: string };
}) {
  const { order, loading, error } = useOrderStatus(params.orderId);
  return (
    <main className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-semibold">Order Status</h1>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {order && (
        <div className="p-4 border rounded">
          <div className="flex justify-between">
            <span>Order</span>
            <span>{order.id}</span>
          </div>
          <div className="flex justify-between">
            <span>Table</span>
            <span>{order.tableCode}</span>
          </div>
          <div className="flex justify-between">
            <span>Status</span>
            <span>{order.status}</span>
          </div>
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>¥{order.subtotalJpy}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>¥{order.taxJpy}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>¥{order.totalJpy}</span>
          </div>
        </div>
      )}
    </main>
  );
}

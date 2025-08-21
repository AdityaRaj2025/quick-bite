"use client";
import { useEffect, useState } from "react";

type MenuItem = { id: string; name: string; priceJpy: number };

export default function TablePage({
  params,
}: {
  params: { restaurantId: string; tableCode: string };
}) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const api = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  useEffect(() => {
    (async () => {
      const res = await fetch(`${api}/api/menu/${params.restaurantId}`);
      const data = await res.json();
      setItems(
        data.items?.map((i: any) => ({
          id: i.id,
          name: i.nameI18n?.en ?? "Item",
          priceJpy: i.priceJpy,
        })) ?? []
      );
    })();
  }, [params.restaurantId]);

  const subtotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = items.find((i) => i.id === id);
    return sum + (item ? item.priceJpy * qty : 0);
  }, 0);
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;

  function add(id: string) {
    setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  }
  function remove(id: string) {
    setCart((c) => {
      const next = { ...c };
      if (!next[id]) return next;
      next[id] -= 1;
      if (next[id] <= 0) delete next[id];
      return next;
    });
  }

  async function placeOrder() {
    const lineItems = Object.entries(cart).map(([id, qty]) => {
      const it = items.find((i) => i.id === id)!;
      return {
        itemId: id,
        nameSnapshot: it.name,
        quantity: qty,
        basePriceJpy: it.priceJpy,
        lineTotalJpy: it.priceJpy * qty,
      };
    });
    const res = await fetch(`${api}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        restaurantId: params.restaurantId,
        tableCode: params.tableCode,
        locale: "ja",
        items: lineItems,
      }),
    });
    const data = await res.json();
    alert(`Order Placed: ${data.orderId}`);
    setCart({});
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Menu</h1>
      <ul className="grid grid-cols-2 gap-3">
        {items.map((i) => (
          <li key={i.id} className="p-3 border rounded">
            <div className="font-medium">{i.name}</div>
            <div className="text-sm text-gray-600">¥{i.priceJpy}</div>
            <div className="mt-2 flex gap-2">
              <button
                className="px-2 py-1 border rounded"
                onClick={() => remove(i.id)}
              >
                -
              </button>
              <span>{cart[i.id] ?? 0}</span>
              <button
                className="px-2 py-1 border rounded"
                onClick={() => add(i.id)}
              >
                +
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="p-4 border rounded">
        <div>Subtotal: ¥{subtotal}</div>
        <div>Tax: ¥{tax}</div>
        <div className="font-medium">Total: ¥{total}</div>
        <button
          className="mt-2 bg-black text-white px-4 py-2 rounded"
          onClick={placeOrder}
          disabled={Object.keys(cart).length === 0}
        >
          Place Order
        </button>
      </div>
    </main>
  );
}

"use client";
import { useEffect, useState } from "react";

export default function StaffDashboard() {
  const [restaurantId, setRestaurantId] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const api = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  useEffect(() => {
    if (!restaurantId) return;
    const tick = async () => {
      const data = await fetch(`${api}/api/orders/active/${restaurantId}`).then(
        (r) => r.json()
      );
      setOrders(data);
    };
    tick();
    const id = setInterval(tick, 3000);
    return () => clearInterval(id);
  }, [restaurantId]);

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Staff Dashboard</h1>
      <input
        className="border rounded p-2 w-full"
        placeholder="Restaurant ID"
        value={restaurantId}
        onChange={(e) => setRestaurantId(e.target.value)}
      />
      <ul className="space-y-2">
        {orders.map((o) => (
          <li key={o.id} className="p-3 border rounded">
            <div className="flex justify-between">
              <div>Table {o.tableCode}</div>
              <div className="text-sm">{o.status}</div>
            </div>
            <div className="text-sm text-gray-600">¥{o.totalJpy}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}

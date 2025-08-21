"use client";
import { useEffect, useState } from "react";

export default function AdminMenuPage() {
  const [restaurantId, setRestaurantId] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const api = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  useEffect(() => {
    (async () => {
      if (!restaurantId) return;
      const m = await fetch(`${api}/api/menu/${restaurantId}`).then((r) =>
        r.json()
      );
      setCategories(m.categories);
      setItems(m.items);
    })();
  }, [restaurantId]);

  async function addCategory() {
    if (!restaurantId) return;
    const name = prompt("Category name (en)") || "New";
    const ja = prompt("Category name (ja)") || name;
    const r = await fetch(`${api}/api/admin/${restaurantId}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nameI18n: { en: name, ja } }),
    }).then((r) => r.json());
    setCategories((c) => [...c, r]);
  }

  async function addItem(categoryId?: string) {
    if (!restaurantId) return;
    const name = prompt("Item name (en)") || "Item";
    const ja = prompt("Item name (ja)") || name;
    const price = Number(prompt("Price (JPY)") || "500");
    const r = await fetch(`${api}/api/admin/${restaurantId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoryId: categoryId ?? null,
        nameI18n: { en: name, ja },
        priceJpy: price,
      }),
    }).then((r) => r.json());
    setItems((it) => [...it, r]);
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Admin: Menu</h1>
      <input
        className="border rounded p-2 w-full"
        placeholder="Restaurant ID"
        value={restaurantId}
        onChange={(e) => setRestaurantId(e.target.value)}
      />
      <div className="flex gap-2">
        <button
          className="bg-black text-white px-3 py-2 rounded"
          onClick={addCategory}
        >
          Add Category
        </button>
        <button
          className="bg-black text-white px-3 py-2 rounded"
          onClick={() => addItem()}
        >
          Add Item (no category)
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <section>
          <h2 className="font-medium">Categories</h2>
          <ul className="space-y-2">
            {categories.map((c) => (
              <li
                key={c.id}
                className="p-2 border rounded flex items-center justify-between"
              >
                <span>
                  {c.nameI18n?.en} / {c.nameI18n?.ja}
                </span>
                <button
                  className="text-sm underline"
                  onClick={() => addItem(c.id)}
                >
                  Add Item
                </button>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="font-medium">Items</h2>
          <ul className="space-y-2">
            {items.map((i) => (
              <li
                key={i.id}
                className="p-2 border rounded flex items-center justify-between"
              >
                <span>
                  {i.nameI18n?.en} / {i.nameI18n?.ja} - ¥{i.priceJpy}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}

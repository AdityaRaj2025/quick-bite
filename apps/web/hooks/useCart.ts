"use client";
import { useMemo, useState } from "react";

export type CartLine = {
  itemId: string;
  nameSnapshot: string;
  quantity: number;
  basePriceJpy: number;
};

export function useCart() {
  const [lines, setLines] = useState<CartLine[]>([]);

  function add(line: Omit<CartLine, "quantity">, qty = 1) {
    setLines((prev) => {
      const i = prev.findIndex((l) => l.itemId === line.itemId);
      if (i >= 0) {
        const copy = [...prev];
        copy[i] = { ...copy[i], quantity: copy[i].quantity + qty };
        return copy;
      }
      return [...prev, { ...line, quantity: qty }];
    });
  }

  function remove(itemId: string, qty = 1) {
    setLines((prev) => {
      const i = prev.findIndex((l) => l.itemId === itemId);
      if (i < 0) return prev;
      const copy = [...prev];
      const nextQty = copy[i].quantity - qty;
      if (nextQty <= 0) return copy.filter((l) => l.itemId !== itemId);
      copy[i] = { ...copy[i], quantity: nextQty };
      return copy;
    });
  }

  function clear() {
    setLines([]);
  }

  const subtotal = useMemo(
    () => lines.reduce((s, l) => s + l.basePriceJpy * l.quantity, 0),
    [lines]
  );
  const tax = useMemo(() => Math.round(subtotal * 0.1), [subtotal]);
  const total = useMemo(() => subtotal + tax, [subtotal, tax]);

  return { lines, add, remove, clear, subtotal, tax, total };
}

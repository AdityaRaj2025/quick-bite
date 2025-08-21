"use client";
import { useEffect, useState } from "react";
import { getJson } from "../lib/api";

export type Order = {
  id: string;
  status: string;
  tableCode: string;
  subtotalJpy: number;
  taxJpy: number;
  totalJpy: number;
};

export function useOrderStatus(orderId?: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    async function fetchOnce() {
      setLoading(true);
      setError(null);
      try {
        const data = await getJson<Order>(`/api/orders/${orderId}`);
        if (!cancelled) setOrder(data);
      } catch (e: any) {
        if (!cancelled) setError(String(e?.message || e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchOnce();
    const id = setInterval(fetchOnce, 3000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [orderId]);

  return { order, loading, error };
}

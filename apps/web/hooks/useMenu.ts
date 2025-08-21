"use client";
import { useEffect, useState } from "react";
import { getJson } from "../lib/api";

export type MenuCategory = {
  id: string;
  nameI18n: Record<string, string>;
  sortOrder: number;
  isActive: boolean;
};
export type MenuItem = {
  id: string;
  nameI18n: Record<string, string>;
  priceJpy: number;
  sortOrder: number;
  isActive: boolean;
};

export function useMenu(restaurantId?: string) {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!restaurantId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getJson<{ categories: MenuCategory[]; items: MenuItem[] }>(
      `/api/menu/${restaurantId}`
    )
      .then((data) => {
        if (cancelled) return;
        setCategories(data.categories ?? []);
        setItems(data.items ?? []);
      })
      .catch((e) => !cancelled && setError(String(e?.message || e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  return { categories, items, loading, error };
}

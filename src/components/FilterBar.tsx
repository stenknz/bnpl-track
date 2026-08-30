"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Store {
  id: string;
  name: string;
}

export function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [stores, setStores] = useState<Store[]>([]);

  useEffect(() => {
    fetch("/api/stores").then((r) => r.json()).then(setStores);
  }, []);

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/payments?${params.toString()}`);
  }

  return (
    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
      <input
        type="date"
        defaultValue={searchParams.get("from") || ""}
        onChange={(e) => setParam("from", e.target.value)}
        className="w-full sm:w-auto px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-neutral-100 [color-scheme:light] dark:[color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
        placeholder="From"
      />
      <input
        type="date"
        defaultValue={searchParams.get("to") || ""}
        onChange={(e) => setParam("to", e.target.value)}
        className="w-full sm:w-auto px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-neutral-100 [color-scheme:light] dark:[color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
        placeholder="To"
      />
      <select
        defaultValue={searchParams.get("storeId") || ""}
        onChange={(e) => setParam("storeId", e.target.value)}
        className="w-full sm:w-auto px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-neutral-100 [color-scheme:light] dark:[color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
      >
        <option value="">All stores</option>
        {stores.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
      <select
        defaultValue={searchParams.get("status") || ""}
        onChange={(e) => setParam("status", e.target.value)}
        className="w-full sm:w-auto px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-neutral-100 [color-scheme:light] dark:[color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
      >
        <option value="">All statuses</option>
        <option value="ACTIVE">Active</option>
        <option value="COMPLETED">Completed</option>
        <option value="CANCELLED">Cancelled</option>
      </select>
    </div>
  );
}

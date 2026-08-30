"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { KpiCard } from "@/components/KpiCard";
import { BarChartCard } from "@/components/charts/BarChartCard";
import { LineChartCard } from "@/components/charts/LineChartCard";
import { DoughnutChartCard } from "@/components/charts/DoughnutChartCard";
import { SafeImage } from "@/components/SafeImage";

interface Metrics {
  totalOwed: number;
  dueNext15: number;
  dueNext30: number;
  dueNext90: number;
  overdueTotal: number;
  activePlans: number;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
  upcomingPayments: { date: string; amount: number }[];
  topStores: { name: string; count: number; totalValue: number }[];
}

interface DashboardData {
  totalOwed: number;
  dueNext15: number;
  dueNext30: number;
  dueNext90: number;
  overdueTotal: number;
  activePlans: number;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
  upcomingPayments: { date: string; amount: number }[];
  topStores: { name: string; count: number; totalValue: number }[];
  sharedView: boolean;
  own?: Metrics;
  shared?: Metrics;
}

export default function DashboardPage() {
  const { data: session, update: updateSession } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [shared, setShared] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    fetch(`/api/dashboard${shared ? "?shared=true" : ""}`)
      .then((r) => r.json())
      .then(setData);
  }, [shared]);

  const fmt = (n: number) => `$${n.toFixed(2)}`;

  const user = session?.user as
    | { name?: string; email?: string; id?: string; avatarPath?: string }
    | undefined;

  const handleAvatarUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "avatar");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      const { path } = await res.json();
      const profRes = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarPath: path }),
      });
      if (!profRes.ok) throw new Error(`Profile update failed: ${profRes.status}`);
      await updateSession();
    } catch (e) {
      console.error("Avatar upload error:", e);
      alert("Avatar upload failed. Check console for details.");
    }
    setUploadingAvatar(false);
  }, [updateSession]);

  return (
    <div className="p-6 space-y-6 max-w-[1280px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <label className="relative group cursor-pointer shrink-0">
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
            <div className="w-12 h-12 rounded-full bg-white dark:bg-white/10 flex items-center justify-center overflow-hidden border-2 border-brand-200 dark:border-brand-800 group-hover:border-brand-400 transition-colors">
              <SafeImage
                src={user?.avatarPath}
                alt=""
                className="w-full h-full object-cover"
                fallback={<span className="text-lg font-display font-bold text-brand-600">
                  {(user?.name || user?.email || "?")[0].toUpperCase()}
                </span>}
              />
              <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <svg className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            {uploadingAvatar && (
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </label>
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-espresso-500 dark:text-brand-100">Dashboard</h1>
            {user && (
              <p className="text-sm text-espresso-400 dark:text-brand-300">
                Welcome back, <span className="font-semibold text-espresso-500 dark:text-brand-100">{user.name || user.email}</span>
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 bg-brand-100 dark:bg-white/5 rounded-full p-1 border border-brand-200 dark:border-white/10 shrink-0">
          <button
            onClick={() => setShared(false)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${!shared ? "bg-espresso-500 text-white shadow-sm" : "text-espresso-400 hover:text-espresso-500 dark:text-brand-300 dark:hover:text-brand-100"}`}
          >
            My View
          </button>
          <button
            onClick={() => setShared(true)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${shared ? "bg-espresso-500 text-white shadow-sm" : "text-espresso-400 hover:text-espresso-500 dark:text-brand-300 dark:hover:text-brand-100"}`}
          >
            Shared
          </button>
        </div>
      </div>

      {shared && data?.own && data?.shared && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="ledger-card p-4">
            <p className="text-[11px] tracking-[0.08em] uppercase font-medium text-espresso-400 dark:text-brand-300">Your totals</p>
            <p className="text-2xl font-display font-bold tabular-nums text-brand-500">{fmt(data.own.totalOwed)}</p>
            <p className="text-espresso-400 dark:text-brand-300 text-xs">{data.own.activePlans} active plans</p>
          </div>
          <div className="ledger-card p-4">
            <p className="text-[11px] tracking-[0.08em] uppercase font-medium text-espresso-400 dark:text-brand-300">Partner shared</p>
            <p className="text-2xl font-display font-bold tabular-nums text-amber-500">{fmt(data.shared.totalOwed)}</p>
            <p className="text-espresso-400 dark:text-brand-300 text-xs">{data.shared.activePlans} shared plans</p>
          </div>
        </div>
      )}

      {/* Hero — Total Owed */}
      <div className="rounded-2xl p-6 lg:p-8 bg-gradient-to-br from-espresso-500 via-espresso-600 to-espresso-700 dark:from-[#2A1810] dark:via-[#331C12] dark:to-[#2A1810] border border-espresso-400/20 dark:border-brand-900/30 shadow-lg shadow-espresso-500/10 dark:shadow-none">
        <div className="relative">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <p className="text-xs tracking-[0.14em] uppercase font-medium text-brand-300">Total Owed</p>
              <p className="mt-2 font-display font-bold tabular-nums tracking-tight text-4xl lg:text-5xl text-white">{data ? fmt(data.totalOwed) : "—"}</p>
              <p className="mt-2 text-sm text-brand-200">{data ? `${data.activePlans} active plans • ${data.pendingCount} upcoming • ${data.overdueCount} overdue` : "Loading…"}</p>
            </div>
            <div className="flex gap-3">
              <Link href="/payments/my-upcoming" className="px-4 py-2 rounded-full bg-white text-espresso-600 dark:!text-espresso-700 dark:bg-white text-sm font-semibold hover:bg-brand-50 dark:hover:bg-white/90 transition-colors shadow-md">View upcoming</Link>
              <Link href="/payments" className="px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors border border-white/20">All payments</Link>
            </div>
          </div>
          {data && data.overdueTotal > 0 && (
            <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-400/30 text-sm text-white">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              <span className="font-medium">{fmt(data.overdueTotal)} overdue</span>
              <span className="text-white/50">•</span>
              <span className="text-white/70">{data.overdueCount} installments</span>
            </div>
          )}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Upcoming" value={data ? fmt(data.dueNext30) : "—"} icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" color="brand" />
        <KpiCard label="Paid" value={data ? String(data.paidCount) : "—"} icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" color="emerald" />
        <KpiCard label="Overdue" value={data ? fmt(data.overdueTotal) : "—"} icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" color="rose" />
        <div className="ledger-card p-5">
          <p className="text-[11px] tracking-[0.08em] uppercase font-semibold text-espresso-400 dark:text-brand-300">Due in 90 days</p>
          <p className="mt-1 text-2xl font-display font-bold tabular-nums tracking-tight text-espresso-500 dark:text-brand-100">{data ? fmt(data.dueNext90) : "—"}</p>
          <p className="mt-1 text-xs font-medium text-espresso-400 dark:text-brand-300">All pending</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChartCard
          dueNext15={shared ? (data?.own?.dueNext15 ?? 0) : (data?.dueNext15 ?? 0)}
          dueNext30={shared ? (data?.own?.dueNext30 ?? 0) : (data?.dueNext30 ?? 0)}
          dueNext90={shared ? (data?.own?.dueNext90 ?? 0) : (data?.dueNext90 ?? 0)}
          partnerDueNext15={shared ? data?.shared?.dueNext15 : undefined}
          partnerDueNext30={shared ? data?.shared?.dueNext30 : undefined}
          partnerDueNext90={shared ? data?.shared?.dueNext90 : undefined}
        />
        <LineChartCard
          data={shared ? (data?.own?.upcomingPayments ?? []) : (data?.upcomingPayments ?? [])}
          partnerData={shared ? data?.shared?.upcomingPayments : undefined}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="ledger-card p-6">
          <h3 className="font-display font-bold text-espresso-500 dark:text-brand-100">Payment Timeline</h3>
          <p className="text-xs font-medium text-espresso-400 dark:text-brand-300 mt-1">Next due dates at a glance</p>
          <div className="mt-4 relative">
            <div className="absolute left-[11px] top-2 bottom-2 w-px bg-brand-200 dark:bg-brand-900/30" />
            {(data?.upcomingPayments ?? []).slice(0, 5).map((p, i) => (
              <div key={p.date} className="relative flex items-center gap-3 py-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 bg-white dark:bg-[#1E1410] ${i === 0 ? "border-brand-500 text-brand-500" : "border-brand-300 dark:border-brand-800 text-espresso-400 dark:text-brand-400"}`}>
                  <span className="w-2 h-2 rounded-full bg-current" />
                </div>
                <div className="flex-1 min-w-0 flex items-center justify-between">
                  <span className="text-sm font-semibold text-espresso-500 dark:text-brand-100">{new Date(p.date).toLocaleDateString("en-NZ", { month: "short", day: "numeric" })}</span>
                  <span className="font-mono text-sm font-bold tabular-nums text-espresso-500 dark:text-brand-100">{fmt(p.amount)}</span>
                </div>
              </div>
            ))}
            {(data?.upcomingPayments?.length ?? 0) === 0 && (
              <p className="text-sm text-espresso-400 dark:text-brand-300 py-8 text-center">No upcoming payments</p>
            )}
          </div>
        </div>

        <div className="ledger-card p-6">
          <h3 className="font-display font-bold text-espresso-500 dark:text-brand-100">Transaction List</h3>
          <p className="text-xs font-medium text-espresso-400 dark:text-brand-300 mt-1">Recent installments by status</p>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/50 dark:border-emerald-500/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-espresso-500 dark:text-brand-100">Paid</p>
                  <p className="text-xs text-espresso-400 dark:text-brand-300">{data?.paidCount ?? 0} installments</p>
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200/50 dark:border-amber-500/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-white">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /></svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-espresso-500 dark:text-brand-100">Upcoming</p>
                  <p className="text-xs text-espresso-400 dark:text-brand-300">{data?.pendingCount ?? 0} pending</p>
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200/50 dark:border-red-500/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" /></svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-espresso-500 dark:text-brand-100">Overdue</p>
                  <p className="text-xs text-espresso-400 dark:text-brand-300">{data?.overdueCount ?? 0} installments • {data ? fmt(data.overdueTotal) : "—"}</p>
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-red-500" />
            </div>
          </div>
          <div className="mt-4">
            <DoughnutChartCard paid={data?.paidCount ?? 0} pending={data?.pendingCount ?? 0} overdue={data?.overdueCount ?? 0} />
          </div>
        </div>
      </div>

      <div className="ledger-card p-6">
        <h3 className="font-display font-bold text-espresso-500 dark:text-brand-100">Top Stores</h3>
        {data && data.topStores.length > 0 ? (
          <div className="mt-3 divide-y divide-brand-100 dark:divide-brand-900/20">
            {data.topStores.map((store, i) => (
              <div key={store.name} className="flex items-center gap-3 py-3">
                <span className="w-6 text-sm font-mono font-medium text-espresso-300 dark:text-brand-400 text-right">{String(i + 1).padStart(2, "0")}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-espresso-500 dark:text-brand-100 truncate">{store.name}</p>
                  <p className="text-xs text-espresso-400 dark:text-brand-300">{store.count} plans • {fmt(store.totalValue)} total</p>
                </div>
                <span className={`w-2 h-2 rounded-full ${i === 0 ? "bg-brand-500" : "bg-brand-200 dark:bg-brand-800"}`} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-espresso-400 dark:text-brand-300 mt-3">No stores with active plans yet.</p>
        )}
      </div>
    </div>
  );
}

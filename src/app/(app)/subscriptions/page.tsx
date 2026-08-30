"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogoUploader } from "@/components/LogoUploader";
import { SafeImage } from "@/components/SafeImage";
import { ConfirmDialog } from "@/components/ConfirmDialog";

import { formatDate } from "@/lib/formatDate";
import { getNextPaymentDates } from "@/lib/subscription-dates";

interface Subscription {
  id: string;
  name: string;
  price: number;
  dayOfMonth: number;
  billingCycle: string;
  logoPath: string | null;
  visibility: string;
  user?: { name: string | null; email: string };
}

function getNextPaymentDate(dayOfMonth: number): string {
  const next = getNextPaymentDates(dayOfMonth, 1);
  return next.length > 0 ? formatDate(next[0]) : "";
}

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [partnerSubs, setPartnerSubs] = useState<Subscription[]>([]);
  const [ownTotal, setOwnTotal] = useState(0);
  const [partnerTotal, setPartnerTotal] = useState(0);
  const [shared, setShared] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [dayOfMonth, setDayOfMonth] = useState("");
  const [logoPath, setLogoPath] = useState<string | null>(null);
  const [visibility, setVisibility] = useState("PRIVATE");
  const [billingCycle, setBillingCycle] = useState("MONTHLY");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const url = `/api/subscriptions${shared ? "?shared=true" : ""}`;
    const res = await fetch(url);
    const data = await res.json();
    setSubs(data.own || []);
    setPartnerSubs(data.partner || []);
    setOwnTotal(data.ownTotal || 0);
    setPartnerTotal(data.partnerTotal || 0);
    setLoading(false);
  }, [shared]);

  useEffect(() => { load(); }, [load]);

  function resetForm() {
    setName("");
    setPrice("");
    setDayOfMonth("");
    setLogoPath(null);
    setVisibility("PRIVATE");
    setBillingCycle("MONTHLY");
    setEditId(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const url = editId ? `/api/subscriptions/${editId}` : "/api/subscriptions";
    const method = editId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, price: Number(price), dayOfMonth: Number(dayOfMonth), billingCycle, logoPath, visibility }),
    });
    setSaving(false);
    if (res.ok) {
      resetForm();
      setShowForm(false);
      load();
    }
  }

  function handleEdit(sub: Subscription) {
    setEditId(sub.id);
    setName(sub.name);
    setPrice(sub.price.toString());
    setDayOfMonth(sub.dayOfMonth.toString());
    setLogoPath(sub.logoPath);
    setVisibility(sub.visibility);
    setBillingCycle(sub.billingCycle || "MONTHLY");
    setShowForm(true);
  }

  async function handleDelete() {
    if (!deleteId) return;
    await fetch(`/api/subscriptions/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    load();
  }

  const freqLabel: Record<string, string> = { MONTHLY: "/mo", QUARTERLY: "/qtr", BI_ANNUAL: "/6mo", YEARLY: "/yr" };
  const allSubs = [...subs, ...partnerSubs];
  const router = useRouter();

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-espresso-500 dark:text-white pl-12 lg:pl-0">Subscriptions</h1>
        <div className="flex items-center gap-2 bg-white dark:bg-white/10 rounded-full p-1 border border-brand-200 dark:border-white/10 shrink-0">
          <button onClick={() => setShared(false)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${!shared ? "bg-espresso-500 dark:bg-white text-white dark:text-espresso-500 shadow-sm" : "text-espresso-400 dark:text-white/70 hover:text-espresso-500 dark:hover:text-white"}`}
          >My View</button>
          <button onClick={() => setShared(true)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${shared ? "bg-espresso-500 dark:bg-white text-white dark:text-espresso-500 shadow-sm" : "text-espresso-400 dark:text-white/70 hover:text-espresso-500 dark:hover:text-white"}`}
          >Shared View</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="ledger-card p-5">
          <p className="text-sm text-neutral-500">Monthly Cost</p>
          <p className="text-3xl font-bold dark:text-brand-100">
            {shared ? (
              <>
                <span className="text-brand-500">${ownTotal.toFixed(2)}</span>
                {partnerTotal > 0 && (
                  <span className="text-neutral-400 text-xl ml-2">+ ${partnerTotal.toFixed(2)} shared</span>
                )}
              </>
            ) : `$${ownTotal.toFixed(2)}`}
          </p>
        </div>
        <div className="ledger-card p-5">
          <p className="text-sm text-neutral-500">Active Subscriptions</p>
          <p className="text-3xl font-bold dark:text-brand-100">{allSubs.length}</p>
        </div>
      </div>

      <button
        onClick={() => { resetForm(); setShowForm(!showForm); }}
        className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-medium transition-colors text-sm"
      >
        {showForm ? "Cancel" : "+ Add Subscription"}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="ledger-card p-5 space-y-4 max-w-2xl">
          <h3 className="font-semibold dark:text-brand-100">{editId ? "Edit Subscription" : "New Subscription"}</h3>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-brand-100">Service Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              placeholder="Netflix" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-brand-100">Price ($)</label>
              <input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required
                className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 dark:text-brand-100"
                placeholder="19.99" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-brand-100">Payment Day</label>
              <input type="number" min="1" max="31" value={dayOfMonth} onChange={(e) => setDayOfMonth(e.target.value)} required
                className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                placeholder="15" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-brand-100">Billing Cycle</label>
            <select value={billingCycle} onChange={(e) => setBillingCycle(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 text-sm text-neutral-900 dark:text-neutral-100 [color-scheme:light] dark:[color-scheme:dark]">
              <option value="MONTHLY">Monthly</option>
              <option value="QUARTERLY">Quarterly</option>
              <option value="BI_ANNUAL">Bi-Annual</option>
              <option value="YEARLY">Yearly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-brand-100">Logo</label>
            <LogoUploader currentLogo={logoPath} onUpload={setLogoPath} type="subscription" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-brand-100">Sharing</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="vis" value="PRIVATE" checked={visibility === "PRIVATE"}
                  onChange={() => setVisibility("PRIVATE")} className="text-brand-500 focus:ring-brand-500" />
                <span className="text-sm dark:text-brand-100">Private</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="vis" value="SHARED" checked={visibility === "SHARED"}
                  onChange={() => setVisibility("SHARED")} className="text-brand-500 focus:ring-brand-500" />
                <span className="text-sm dark:text-brand-100">Shared with partners</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-medium transition-colors text-sm">
              {saving ? "Saving..." : editId ? "Save Changes" : "Add Subscription"}
            </button>
            <button type="button" onClick={() => { resetForm(); setShowForm(false); }}
              className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 text-neutral-400">Loading...</div>
      ) : allSubs.length === 0 ? (
        <div className="text-center py-12 text-neutral-400">No subscriptions yet. Add your first one!</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allSubs.map((sub) => {
            const isPartner = partnerSubs.some((p) => p.id === sub.id);
            return (
              <div key={sub.id} onClick={() => router.push(`/subscriptions/${sub.id}`)}
                className="cursor-pointer ledger-card p-5 hover:border-brand-300 dark:hover:border-brand-700 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden shrink-0">
                    <SafeImage
                      src={sub.logoPath}
                      alt={sub.name}
                      className="w-full h-full object-contain"
                       fallback={<span className="text-lg font-bold text-brand-500">{sub.name[0]}</span>}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold dark:text-brand-100">{sub.name}</h3>
                      {!isPartner && sub.visibility === "SHARED" && (
                         <span className="text-xs bg-brand-50 dark:bg-brand-900/20 text-brand-500 dark:text-brand-400 px-1.5 py-0.5 rounded font-medium shrink-0">Shared</span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-500">${sub.price.toFixed(2)}{freqLabel[sub.billingCycle || "MONTHLY"]}</p>
                    <p className="text-xs text-neutral-400">Next: {getNextPaymentDate(sub.dayOfMonth)}</p>
                    {isPartner && sub.user && (
                      <p className="text-xs text-brand-500 mt-1">{sub.user.name || sub.user.email}</p>
                    )}
                  </div>
                  {!isPartner && (
                    <div className="flex gap-1 shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); handleEdit(sub); }}
                        className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-brand-500 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteId(sub.id); }}
                        className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-red-600 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Subscription"
        message="Delete this subscription? This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

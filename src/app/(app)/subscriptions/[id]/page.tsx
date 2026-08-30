"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/formatDate";
import { SafeImage } from "@/components/SafeImage";
import { getNextPaymentDates } from "@/lib/subscription-dates";

interface Subscription {
  id: string;
  name: string;
  price: number;
  dayOfMonth: number;
  billingCycle: string;
  startDate: string;
  logoPath: string | null;
  visibility: string;
  userId: string;
}

interface Payment {
  id: string;
  amount: number;
  paidAt: string;
  notes: string | null;
}

export default function SubscriptionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [sub, setSub] = useState<Subscription | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [paidAt, setPaidAt] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch(`/api/subscriptions/${id}/payments`);
    if (!res.ok) { router.push("/subscriptions"); return; }
    const data = await res.json();
    setSub(data.sub);
    setPayments(data.payments);
    setCurrentUserId(data.userId);
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  async function handleRecord(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/subscriptions/${id}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(amount), paidAt, notes: notes || null }),
    });
    setSaving(false);
    if (res.ok) {
      setShowForm(false);
      setAmount("");
      setPaidAt(new Date().toISOString().slice(0, 10));
      setNotes("");
      load();
    }
  }

  async function handleDeletePayment(paymentId: string) {
    if (!confirm("Delete this payment record?")) return;
    await fetch(`/api/subscriptions/${id}/payments/${paymentId}`, { method: "DELETE" });
    load();
  }

  if (loading) return <div className="p-6 text-neutral-400">Loading...</div>;
  if (!sub) return null;

  const isOwner = sub.userId === currentUserId;
  const freqLabel: Record<string, string> = { MONTHLY: "/mo", QUARTERLY: "/qtr", BI_ANNUAL: "/6mo", YEARLY: "/yr" };
  const cycleLabel: Record<string, string> = { MONTHLY: "month", QUARTERLY: "quarter", BI_ANNUAL: "6 months", YEARLY: "year" };
  const cycle = sub.billingCycle || "MONTHLY";
  const futureDates = getNextPaymentDates(sub.dayOfMonth, 12, new Date(), cycle);

  const sortedPayments = [...payments].sort((a, b) =>
    new Date(a.paidAt).getTime() - new Date(b.paidAt).getTime()
  );
  const paidIndices = new Set<number>();
  let payIdx = 0;
  for (let i = 0; i < futureDates.length; i++) {
    const due = futureDates[i];
    const prevDue = new Date(due);
    prevDue.setMonth(prevDue.getMonth() - 1);
    for (; payIdx < sortedPayments.length; payIdx++) {
      const payDate = new Date(sortedPayments[payIdx].paidAt);
      if (payDate > prevDue && payDate <= due) {
        paidIndices.add(i);
        payIdx++;
        break;
      }
      if (payDate > due) break;
    }
  }
  const upcomingDates = futureDates.filter((_, i) => !paidIndices.has(i)).slice(0, 6);

  async function handleQuickPay(date: Date) {
    if (!sub) return;
    const dateStr = date.toISOString().slice(0, 10);
    const alreadyPaid = payments.some((p) => new Date(p.paidAt).toISOString().slice(0, 10) === dateStr);
    if (alreadyPaid) return;
    setSaving(true);
    const today = new Date();
    await fetch(`/api/subscriptions/${id}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: sub.price,
        paidAt: dateStr,
        notes: `Paid on ${formatDate(today)}`,
      }),
    });
    await load();
    setSaving(false);
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <Link href="/subscriptions" className="text-sm text-brand-500 hover:underline inline-block">&larr; Back to Subscriptions</Link>

      <div className="ledger-card p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden shrink-0">
            <SafeImage
              src={sub.logoPath}
              alt={sub.name}
              className="w-full h-full object-contain"
               fallback={<span className="text-2xl font-bold text-brand-500">{sub.name[0]}</span>}
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold dark:text-brand-100">{sub.name}</h1>
            <p className="text-lg text-neutral-500">${sub.price.toFixed(2)}{freqLabel[cycle]}</p>
            <p className="text-sm text-neutral-400">Bills on the {sub.dayOfMonth}{sub.dayOfMonth === 1 ? "st" : sub.dayOfMonth === 2 ? "nd" : sub.dayOfMonth === 3 ? "rd" : "th"} each {cycleLabel[cycle]}</p>
          </div>
        </div>
      </div>

      {isOwner && (
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-medium transition-colors text-sm">
          {showForm ? "Cancel" : "+ Record Payment"}
        </button>
      )}

      {showForm && (
        <form onSubmit={handleRecord} className="ledger-card p-5 space-y-4">
          <h3 className="font-semibold dark:text-brand-100">Record Payment</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-brand-100">Amount ($)</label>
              <input type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} required
                className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                placeholder={sub.price.toFixed(2)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-brand-100">Date Paid</label>
              <input type="date" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} required
                className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 dark:text-brand-100" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-brand-100">Notes (optional)</label>
            <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              placeholder="e.g. paid early" />
          </div>
          <button type="submit" disabled={saving}
            className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-medium transition-colors text-sm">
            {saving ? "Saving..." : "Save Payment"}
          </button>
        </form>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-3 dark:text-brand-100">Payment History</h2>
        {payments.length === 0 ? (
          <p className="text-sm text-neutral-400">No payments recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {payments.map((p) => (
              <div key={p.id} className="ledger-card p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold dark:text-brand-100">${p.amount.toFixed(2)}</p>
                  <p className="text-xs text-neutral-400">{formatDate(new Date(p.paidAt))}</p>
                  {p.notes && <p className="text-xs text-neutral-500 mt-0.5">{p.notes}</p>}
                </div>
                {isOwner && (
                  <button onClick={() => handleDeletePayment(p.id)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3 dark:text-brand-100">Upcoming Payments</h2>
        <div className="space-y-2">
            {upcomingDates.map((date, i) => (
              <div key={i} className="ledger-card p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium dark:text-brand-100">${sub.price.toFixed(2)}</p>
                  <p className="text-xs text-neutral-400">{formatDate(date)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-900/20 text-amber-600">Pending</span>
                  {isOwner && (
                    <button onClick={() => handleQuickPay(date)} disabled={saving}
                      className="px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-xs font-medium transition-colors">
                      Pay Now
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

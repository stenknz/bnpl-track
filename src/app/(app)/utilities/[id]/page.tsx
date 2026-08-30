"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { LogoUploader } from "@/components/LogoUploader";
import { SafeImage } from "@/components/SafeImage";
import { formatDate } from "@/lib/formatDate";

interface Utility {
  id: string;
  name: string;
  amountDue: number;
  dueDate: string;
  status: string;
  visibility?: string;
  logoPath: string | null;
  notes: string | null;
  userId: string;
  payments: UtilityPayment[];
  user?: { name: string | null; email: string };
}

interface UtilityPayment {
  id: string;
  amount: number;
  paidAt: string;
  notes: string | null;
}

function getStatusColor(status: string): string {
  if (status === "PAID") return "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600";
  if (status === "PART_PAID") return "bg-amber-50 dark:bg-amber-900/20 text-amber-600";
  return "bg-red-50 dark:bg-red-900/20 text-red-600";
}

export default function UtilityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [util, setUtil] = useState<Utility | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRecord, setShowRecord] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [amount, setAmount] = useState("");
  const [paidAt, setPaidAt] = useState(new Date().toISOString().slice(0, 10));
  const [payNotes, setPayNotes] = useState("");
  const [editName, setEditName] = useState("");
  const [editAmountDue, setEditAmountDue] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editLogo, setEditLogo] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch(`/api/utilities/${id}`);
    if (!res.ok) { router.push("/utilities"); return; }
    const data = await res.json();
    setUtil(data.utility);
    setCurrentUserId(data.currentUserId);
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  async function handleRecordPayment(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/utilities/${id}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(amount), paidAt, notes: payNotes || null }),
    });
    setSaving(false);
    if (res.ok) {
      setShowRecord(false);
      setAmount("");
      setPaidAt(new Date().toISOString().slice(0, 10));
      setPayNotes("");
      load();
    }
  }

  async function handleDeletePayment(paymentId: string) {
    if (!confirm("Delete this payment record?")) return;
    await fetch(`/api/utilities/${id}/payments/${paymentId}`, { method: "DELETE" });
    load();
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/utilities/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, amountDue: Number(editAmountDue), dueDate: editDueDate, logoPath: editLogo, notes: editNotes || null }),
    });
    setSaving(false);
    if (res.ok) {
      setShowEdit(false);
      load();
    }
  }

  function openEdit() {
    if (!util) return;
    setEditName(util.name);
    setEditAmountDue(util.amountDue.toString());
    setEditDueDate(new Date(util.dueDate).toISOString().slice(0, 10));
    setEditLogo(util.logoPath);
    setEditNotes(util.notes || "");
    setShowEdit(true);
  }

  async function handleDelete() {
    await fetch(`/api/utilities/${id}`, { method: "DELETE" });
    router.push("/utilities");
  }

  if (loading) return <div className="p-6 text-neutral-400">Loading...</div>;
  if (!util) return null;

  const isOwner = util.userId === currentUserId;
  const totalPaid = util.payments.reduce((s, p) => s + p.amount, 0);
  const remaining = Math.max(0, util.amountDue - totalPaid);

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <Link href="/utilities" className="text-sm text-brand-500 hover:underline inline-block">&larr; Back to Utilities</Link>

      <div className="ledger-card p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden shrink-0">
            <SafeImage
              src={util.logoPath}
              alt={util.name}
              className="w-full h-full object-contain"
               fallback={<span className="text-2xl font-bold text-brand-500">{util.name[0]}</span>}
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold dark:text-brand-100">{util.name}</h1>
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${getStatusColor(util.status)}`}>
                {util.status === "UNPAID" ? "Unpaid" : util.status === "PART_PAID" ? "Part Paid" : "Paid"}
              </span>
            </div>
            <p className="text-lg text-neutral-500">${util.amountDue.toFixed(2)} due</p>
            <p className="text-sm text-neutral-400">
              ${totalPaid.toFixed(2)} paid &middot; ${remaining.toFixed(2)} remaining
              &middot; Due {formatDate(new Date(util.dueDate))}
            </p>
            {util.notes && <p className="text-sm text-neutral-500 mt-1">{util.notes}</p>}
            {!isOwner && util.user && (
              <p className="text-xs text-brand-500 mt-1">{util.user.name || util.user.email}</p>
            )}
          </div>
        </div>
        {isOwner && (
        <div className="mt-3 flex gap-2">
          <button onClick={() => setShowRecord(!showRecord)}
            className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-medium transition-colors text-sm">
            {showRecord ? "Cancel" : "+ Record Payment"}
          </button>
          <button onClick={openEdit}
            className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-sm">
            Edit
          </button>
          <button onClick={() => setShowDelete(true)}
            className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-red-600 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm">
            Delete
          </button>
        </div>
        )}
      </div>

      {showRecord && (
        <form onSubmit={handleRecordPayment} className="ledger-card p-5 space-y-4">
          <h3 className="font-semibold dark:text-brand-100">Record Payment</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-brand-100">Amount ($)</label>
              <input type="number" step="0.01" min="0" max={remaining} value={amount} onChange={(e) => setAmount(e.target.value)} required
                className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                placeholder={remaining.toFixed(2)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-brand-100">Date Paid</label>
              <input type="date" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} required
                className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 dark:text-brand-100" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-brand-100">Notes (optional)</label>
            <input type="text" value={payNotes} onChange={(e) => setPayNotes(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500" />
          </div>
          <button type="submit" disabled={saving}
            className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-medium transition-colors text-sm">
            {saving ? "Saving..." : "Save Payment"}
          </button>
        </form>
      )}

      {showEdit && (
        <form onSubmit={handleEditSubmit} className="ledger-card p-5 space-y-4">
          <h3 className="font-semibold dark:text-brand-100">Edit Utility Bill</h3>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-brand-100">Name</label>
            <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required
              className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-brand-100">Amount Due ($)</label>
              <input type="number" step="0.01" min="0" value={editAmountDue} onChange={(e) => setEditAmountDue(e.target.value)} required
                className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 dark:text-brand-100" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-brand-100">Due Date</label>
              <input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} required
                className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-brand-100">Logo</label>
            <LogoUploader currentLogo={editLogo} onUpload={setEditLogo} type="utility" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-brand-100">Notes</label>
            <input type="text" value={editNotes} onChange={(e) => setEditNotes(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500" />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-medium transition-colors text-sm">
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button type="button" onClick={() => setShowEdit(false)}
              className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-3 dark:text-brand-100">Payment History</h2>
        {util.payments.length === 0 ? (
          <p className="text-sm text-neutral-400">No payments recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {util.payments.map((p) => (
              <div key={p.id} className="ledger-card p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-emerald-600">${p.amount.toFixed(2)}</p>
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

      <ConfirmDialog
        open={showDelete}
        title="Delete Utility Bill"
        message="Delete this utility bill and all its payment records? This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}

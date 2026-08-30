"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LogoUploader } from "@/components/LogoUploader";
import { SafeImage } from "@/components/SafeImage";
import { ConfirmDialog } from "@/components/ConfirmDialog";
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
  payments: { amount: number }[];
  user?: { name: string | null; email: string };
}

interface UtilitiesData {
  utilities: Utility[];
  own: Utility[];
  partner: Utility[];
  totalDue: number;
  totalPaid: number;
  remaining: number;
  activeCount: number;
  overdueCount: number;
  partnerTotalDue: number;
}

function getStatusColor(status: string): string {
  if (status === "PAID") return "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600";
  if (status === "PART_PAID") return "bg-amber-50 dark:bg-amber-900/20 text-amber-600";
  return "bg-red-50 dark:bg-red-900/20 text-red-600";
}

export default function UtilitiesPage() {
  const router = useRouter();
  const [data, setData] = useState<UtilitiesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [shared, setShared] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [amountDue, setAmountDue] = useState("");
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [logoPath, setLogoPath] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [visibility, setVisibility] = useState("PRIVATE");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const url = `/api/utilities${shared ? "?shared=true" : ""}`;
    const res = await fetch(url);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }, [shared]);

  useEffect(() => { load(); }, [load]);

  function resetForm() {
    setName("");
    setAmountDue("");
    setDueDate(new Date().toISOString().slice(0, 10));
    setLogoPath(null);
    setNotes("");
    setVisibility("PRIVATE");
    setEditId(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const url = editId ? `/api/utilities/${editId}` : "/api/utilities";
    const method = editId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, amountDue: Number(amountDue), dueDate, logoPath, notes: notes || null, visibility }),
    });
    setSaving(false);
    if (res.ok) {
      resetForm();
      setShowForm(false);
      load();
    }
  }

  function handleEdit(util: Utility) {
    setEditId(util.id);
    setName(util.name);
    setAmountDue(util.amountDue.toString());
    setDueDate(util.dueDate.slice(0, 10));
    setLogoPath(util.logoPath);
    setNotes(util.notes || "");
    setVisibility(util.visibility || "PRIVATE");
    setShowForm(true);
  }

  async function handleDelete() {
    if (!deleteId) return;
    await fetch(`/api/utilities/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    load();
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-espresso-500 dark:text-white pl-12 lg:pl-0">Utilities</h1>
        <div className="flex items-center gap-2 bg-white dark:bg-white/10 rounded-full p-1 border border-brand-200 dark:border-white/10 shrink-0">
          <button onClick={() => setShared(false)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${!shared ? "bg-espresso-500 dark:bg-white text-white dark:text-espresso-500 shadow-sm" : "text-espresso-400 dark:text-white/70 hover:text-espresso-500 dark:hover:text-white"}`}
          >My View</button>
          <button onClick={() => setShared(true)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${shared ? "bg-espresso-500 dark:bg-white text-white dark:text-espresso-500 shadow-sm" : "text-espresso-400 dark:text-white/70 hover:text-espresso-500 dark:hover:text-white"}`}
          >Shared View</button>
        </div>
      </div>

      {shared && data && data.partner.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="ledger-card p-4 border border-brand-200 dark:border-brand-800">
            <p className="font-medium text-brand-700 dark:text-brand-300">Your totals</p>
            <p className="text-2xl font-bold text-brand-500">${data.totalDue.toFixed(2)}</p>
            <p className="text-neutral-500">{data.activeCount} active bills</p>
          </div>
          <div className="ledger-card p-4 border border-brand-200 dark:border-brand-800">
            <p className="font-medium text-brand-700 dark:text-brand-300">Partner&apos;s shared totals</p>
            <p className="text-2xl font-bold text-brand-500">${(data.partnerTotalDue || 0).toFixed(2)}</p>
            <p className="text-neutral-500">{data.partner.length} shared bills</p>
          </div>
        </div>
      )}

      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          <div className="ledger-card p-4">
            <p className="text-xs text-neutral-500">Total Due</p>
            <p className="text-xl font-bold dark:text-brand-100">${data.totalDue.toFixed(2)}</p>
          </div>
          <div className="ledger-card p-4">
            <p className="text-xs text-neutral-500">Total Paid</p>
            <p className="text-xl font-bold text-emerald-600">${data.totalPaid.toFixed(2)}</p>
          </div>
          <div className="ledger-card p-4">
            <p className="text-xs text-neutral-500">Remaining</p>
            <p className="text-xl font-bold text-amber-600">${data.remaining.toFixed(2)}</p>
          </div>
          <div className="ledger-card p-4">
            <p className="text-xs text-neutral-500">Active Bills</p>
            <p className="text-xl font-bold dark:text-brand-100">{data.activeCount}</p>
          </div>
          <div className="ledger-card p-4">
            <p className="text-xs text-neutral-500">Overdue</p>
            <p className="text-xl font-bold text-red-600">{data.overdueCount}</p>
          </div>
        </div>
      )}

      <button
        onClick={() => { resetForm(); setShowForm(!showForm); }}
        className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-medium transition-colors text-sm"
      >
        {showForm ? "Cancel" : "+ Add Utility Bill"}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="ledger-card p-5 space-y-4 max-w-2xl">
          <h3 className="font-semibold dark:text-brand-100">{editId ? "Edit Utility" : "New Utility Bill"}</h3>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-brand-100">Service / Provider Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              placeholder="Power" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-brand-100">Amount Due ($)</label>
              <input type="number" step="0.01" min="0" value={amountDue} onChange={(e) => setAmountDue(e.target.value)} required
                className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 dark:text-brand-100"
                placeholder="120.00" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-brand-100">Due Date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required
                className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-brand-100">Logo</label>
            <LogoUploader currentLogo={logoPath} onUpload={setLogoPath} type="utility" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-brand-100">Notes</label>
            <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              placeholder="e.g. Account #12345" />
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
              {saving ? "Saving..." : editId ? "Save Changes" : "Add Utility"}
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
      ) : data && data.utilities.length === 0 ? (
        <div className="text-center py-12 text-neutral-400">No utility bills yet. Add your first one!</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.utilities.map((util) => {
            const isPartner = !!util.user;
            const paid = util.payments.reduce((s, p) => s + p.amount, 0);
            const remaining = Math.max(0, util.amountDue - paid);
            const pct = util.amountDue > 0 ? Math.min(100, (paid / util.amountDue) * 100) : 0;
            return (
              <div key={util.id} onClick={() => router.push(`/utilities/${util.id}`)}
                className="cursor-pointer ledger-card p-5 hover:border-brand-300 dark:hover:border-brand-700 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden shrink-0">
                    <SafeImage
                      src={util.logoPath}
                      alt={util.name}
                      className="w-full h-full object-contain"
                       fallback={<span className="text-lg font-bold text-brand-500">{util.name[0]}</span>}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold dark:text-brand-100">{util.name}</h3>
                      {!isPartner && util.visibility === "SHARED" && (
                         <span className="text-xs bg-brand-50 dark:bg-brand-900/20 text-brand-500 dark:text-brand-400 px-1.5 py-0.5 rounded font-medium shrink-0">Shared</span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-500">
                      ${paid.toFixed(2)} / ${util.amountDue.toFixed(2)}
                    </p>
                    <p className="text-xs text-neutral-400">Due {formatDate(new Date(util.dueDate))}</p>
                    {util.notes && <p className="text-xs text-neutral-400 mt-0.5 truncate">{util.notes}</p>}
                    {isPartner && util.user && (
                      <p className="text-xs text-brand-500 mt-1">{util.user.name || util.user.email}</p>
                    )}
                  </div>
                  <div className="flex items-start gap-2 shrink-0">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${getStatusColor(util.status)}`}>
                      {util.status === "UNPAID" ? "Unpaid" : util.status === "PART_PAID" ? "Part Paid" : "Paid"}
                    </span>
                    {!isPartner && (
                      <div className="flex gap-1">
                        <button onClick={(e) => { e.stopPropagation(); handleEdit(util); }}
                          className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-brand-500 transition-colors">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setDeleteId(util.id); }}
                          className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-red-600 transition-colors">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{
                    width: `${pct}%`,
                    backgroundColor: util.status === "PAID" ? "#22c55e" : util.status === "PART_PAID" ? "#F6B45F" : "#C04740",
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Utility Bill"
        message="Delete this utility bill? This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

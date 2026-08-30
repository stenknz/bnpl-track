"use client";

import { useEffect, useState } from "react";
import { LogoUploader } from "@/components/LogoUploader";
import { SafeImage } from "@/components/SafeImage";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface Store {
  id: string;
  name: string;
  logoPath: string | null;
  _count: { paymentPlans: number };
}

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [logoPath, setLogoPath] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = () => fetch("/api/stores").then((r) => r.json()).then(setStores);

  useEffect(() => { load(); }, []);

  async function save() {
    const url = editId ? `/api/stores/${editId}` : "/api/stores";
    const method = editId ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, logoPath }) });
    setShowForm(false);
    setEditId(null);
    setName("");
    setLogoPath("");
    load();
  }

  async function del() {
    if (!deleteId) return;
    await fetch(`/api/stores/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    load();
  }

  function edit(store: Store) {
    setEditId(store.id);
    setName(store.name);
    setLogoPath(store.logoPath || "");
    setShowForm(true);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-espresso-500 dark:text-white pl-12 lg:pl-0">Stores</h1>
        <button onClick={() => { setShowForm(true); setEditId(null); setName(""); setLogoPath(""); }} className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-colors">
          + Add Store
        </button>
      </div>

      {showForm && (
         <div className="ledger-card p-5 space-y-4">
          <h3 className="font-semibold dark:text-brand-100">{editId ? "Edit Store" : "New Store"}</h3>
          <div>
            <label className="block text-sm font-medium mb-1.5 dark:text-brand-100">Store Name</label>
             <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500" placeholder="e.g. Nike, Amazon" />
          </div>
          <LogoUploader currentLogo={logoPath} onUpload={setLogoPath} />
          <div className="flex gap-2">
             <button onClick={save} className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-colors">{editId ? "Save" : "Create"}</button>
            <button onClick={() => { setShowForm(false); setEditId(null); }} className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stores.map((store) => (
          <div key={store.id} className="ledger-card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden shrink-0">
              <SafeImage
                src={store.logoPath}
                alt={store.name}
                className="w-full h-full object-contain"
                 fallback={<span className="text-lg font-bold text-brand-500">{store.name[0]}</span>}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate dark:text-brand-100">{store.name}</p>
              <p className="text-sm text-neutral-500">{store._count.paymentPlans} plans</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => edit(store)} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-brand-500 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button onClick={() => setDeleteId(store.id)} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-red-500 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
        {stores.length === 0 && !showForm && (
          <div className="col-span-full text-center py-12 text-neutral-400">No stores yet. Add your first store to get started.</div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete store?"
        message="This will unlink all payment plans. The plans themselves will not be deleted."
        onConfirm={del}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

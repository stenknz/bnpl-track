"use client";

import { useState, useEffect } from "react";

interface PartnerUser {
  id: string;
  name: string | null;
  email: string;
}

interface PartnerLink {
  id: string;
  user: PartnerUser;
}

export function PartnerManager({ onUpdate }: { onUpdate?: () => void }) {
  const [sharingWith, setSharingWith] = useState<PartnerLink[]>([]);
  const [sharedBy, setSharedBy] = useState<PartnerLink[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/partners")
      .then((r) => r.json())
      .then((data) => {
        setSharingWith(data.sharingWith ?? []);
        setSharedBy(data.sharedBy ?? []);
      });
  }, []);

  async function addPartner(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim()) return;
    setLoading(true);
    const res = await fetch("/api/partners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setSharingWith((prev) => [...prev, data]);
    setEmail("");
    onUpdate?.();
  }

  async function removePartner(id: string) {
    const res = await fetch(`/api/partners/${id}`, { method: "DELETE" });
    if (res.ok) {
      setSharingWith((prev) => prev.filter((l) => l.id !== id));
      onUpdate?.();
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={addPartner} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="partner@example.com"
          className="flex-1 px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30 text-sm dark:text-brand-100 dark:placeholder:text-neutral-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
        >
          {loading ? "..." : "Add"}
        </button>
      </form>
      {error && <p className="text-sm text-red-500">{error}</p>}

      {sharingWith.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2 dark:text-brand-100">Sharing your payments with:</p>
          <div className="space-y-2">
            {sharingWith.map((link) => (
              <div key={link.id} className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                <div>
                  <p className="text-sm font-medium dark:text-brand-100">{link.user.name || link.user.email}</p>
                  {link.user.name && <p className="text-xs text-neutral-500">{link.user.email}</p>}
                </div>
                <button
                  onClick={() => removePartner(link.id)}
                  className="text-xs px-3 py-1 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {sharedBy.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2 dark:text-brand-100">People sharing with you:</p>
          <div className="space-y-2">
            {sharedBy.map((link) => (
              <div key={link.id} className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                <div>
                  <p className="text-sm font-medium dark:text-brand-100">{link.user.name || link.user.email}</p>
                  {link.user.name && <p className="text-xs text-neutral-500">{link.user.email}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {sharingWith.length === 0 && sharedBy.length === 0 && (
        <p className="text-sm text-neutral-400">No partners yet.</p>
      )}
    </div>
  );
}

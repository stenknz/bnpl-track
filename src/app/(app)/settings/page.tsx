"use client";

import { useSession } from "next-auth/react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PartnerManager } from "@/components/PartnerManager";
import { LogoUploader } from "@/components/LogoUploader";
import { useState, useEffect } from "react";

interface Vendor {
  id: string;
  name: string;
  logoPath: string | null;
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const [key, setKey] = useState(0);
  const [vendorKey, setVendorKey] = useState(0);
  const [siteLogo, setSiteLogo] = useState<string | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((d) => setSiteLogo(d.logoPath));
    fetch("/api/vendors").then((r) => r.json()).then(setVendors);
  }, [key, vendorKey]);

  async function handleSiteLogo(path: string) {
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logoPath: path }),
    });
    setSiteLogo(path);
  }

  async function handleVendorLogo(vendorId: string, path: string) {
    await fetch(`/api/vendors/${vendorId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logoPath: path }),
    });
    setVendorKey((k) => k + 1);
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-espresso-500 dark:text-white pl-12 lg:pl-0">Settings</h1>

      <div className="ledger-card p-5 space-y-4">
        <h3 className="font-semibold dark:text-brand-100">Profile</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-neutral-500 mb-1">Name</label>
            <p className="font-medium dark:text-brand-100">{session?.user?.name || "—"}</p>
          </div>
          <div>
            <label className="block text-sm text-neutral-500 mb-1">Email</label>
            <p className="font-medium dark:text-brand-100">{session?.user?.email || "—"}</p>
          </div>
        </div>
      </div>

      <div className="ledger-card p-5 space-y-4">
        <h3 className="font-semibold dark:text-brand-100">Site Branding</h3>
        <p className="text-sm text-neutral-500">Upload a logo to replace the app logo in the sidebar.</p>
        <LogoUploader currentLogo={siteLogo} onUpload={handleSiteLogo} type="site" />
      </div>

      <div className="ledger-card p-5 space-y-4">
        <h3 className="font-semibold dark:text-brand-100">Vendor Logos</h3>
        <p className="text-sm text-neutral-500">Upload logo images for each BNPL provider. These will appear on payment cards and detail pages.</p>
        {vendors.map((v) => (
          <div key={v.id} className="space-y-2">
            <p className="font-medium text-sm dark:text-brand-100">{v.name}</p>
            <LogoUploader currentLogo={v.logoPath} onUpload={(path) => handleVendorLogo(v.id, path)} type="vendor" />
          </div>
        ))}
      </div>

      <div className="ledger-card p-5 space-y-4">
        <h3 className="font-semibold dark:text-brand-100">Shared Payments</h3>
        <p className="text-sm text-neutral-500">
          Share your payments with a partner so they can see your totals and payment details.
          Add someone by their email — they must have an account.
        </p>
        <PartnerManager key={key} onUpdate={() => setKey((k) => k + 1)} />
      </div>

      <div className="ledger-card p-5 space-y-4">
        <h3 className="font-semibold dark:text-brand-100">Appearance</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium dark:text-brand-100">Theme</p>
            <p className="text-sm text-neutral-500">Toggle between light and dark mode</p>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="ledger-card p-5 space-y-4">
        <h3 className="font-semibold dark:text-brand-100">About</h3>
        <p className="text-sm text-neutral-500">DueFlow v1.0.6</p>
        <p className="text-sm text-neutral-500">Track BNPL plans and subscriptions with partner sharing.</p>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { formatDate } from "@/lib/formatDate";
import { SafeImage } from "./SafeImage";

interface Store {
  id: string;
  name: string;
  logoPath: string | null;
}

interface Installment {
  id: string;
  amount: number;
  dueDate: Date;
  status: string;
}

interface PaymentCardProps {
  plan: {
    id: string;
    totalAmount: number;
    installmentAmount: number;
    frequency: string;
    startDate: Date;
    status: string;
    title: string | null;
    archivedAt: Date | null;
    store: Store | null;
    vendor: { id: string; name: string; logoPath: string | null } | null;
    installments: Installment[];
    userId?: string;
    user?: { id: string; name: string | null; email: string } | null;
  };
  currentUserId?: string;
}

export function PaymentCard({ plan, currentUserId }: PaymentCardProps) {
  const now = new Date();
  const nextDue = plan.installments.find(
    (i) => i.status === "PENDING" && new Date(i.dueDate) >= now
  );
  const overdue = plan.installments.filter(
    (i) => i.status === "PENDING" && new Date(i.dueDate) < now
  ).length;
  const paid = plan.installments.filter((i) => i.status === "PAID").length;
  const total = plan.installments.length;
  const progress = total > 0 ? Math.round((paid / total) * 100) : 0;
  const isOwner = !currentUserId || plan.userId === currentUserId;
  const paidAmount = plan.installments
    .filter((i) => i.status === "PAID")
    .reduce((sum, i) => sum + i.amount, 0);
  const amountLeft = plan.totalAmount - paidAmount;

  return (
    <Link
      href={`/payments/${plan.id}`}
      className="block ledger-card p-5 hover:border-brand-300 dark:hover:border-brand-700"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-white/5 border border-brand-200/60 dark:border-white/10 flex items-center justify-center overflow-hidden shrink-0">
          <SafeImage
            src={plan.store?.logoPath}
            alt={plan.store?.name || "Store"}
            className="w-full h-full object-contain"
            fallback={<svg className="w-5 h-5 text-espresso-300 dark:text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-display font-semibold tracking-tight text-espresso-500 dark:text-brand-100 truncate">{plan.title || plan.store?.name || "Untitled Plan"}</h3>
            {plan.vendor?.logoPath && (
              <SafeImage src={plan.vendor.logoPath} alt={plan.vendor.name} className="h-5 w-auto shrink-0" fallback={null} />
            )}
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${plan.status === "ACTIVE" ? "bg-emerald-500" : plan.status === "COMPLETED" ? "bg-sky-500" : "bg-espresso-300"}`} />
            <span className="text-xs tracking-[0.04em] uppercase font-medium text-espresso-400 dark:text-brand-300">{plan.status.charAt(0) + plan.status.slice(1).toLowerCase()}</span>
            {plan.archivedAt && <span className="text-xs text-espresso-300 dark:text-brand-500 font-medium">Archived</span>}
            {!isOwner && plan.user && (
              <span className="text-xs text-brand-500 dark:text-brand-400 font-medium ml-1">
                {plan.user.name || plan.user.email}
              </span>
            )}
          </div>
          <p className="text-sm text-espresso-400 dark:text-brand-300 font-mono tabular-nums">
            ${plan.totalAmount.toFixed(2)} <span className="text-espresso-300 dark:text-brand-600">·</span> {plan.frequency.charAt(0) + plan.frequency.slice(1).toLowerCase()}
          </p>
        </div>

        <div className="text-right shrink-0">
          <p className="text-lg font-display font-semibold tabular-nums text-espresso-500 dark:text-brand-100">${plan.installmentAmount.toFixed(2)}</p>
          <p className="text-xs tracking-[0.06em] uppercase font-medium text-espresso-400 dark:text-brand-300">per installment</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3 text-xs text-espresso-400 dark:text-brand-300">
        {nextDue && <span className="font-mono tabular-nums">Next: {formatDate(new Date(nextDue.dueDate))}</span>}
        {overdue > 0 && <span className="text-red-600 dark:text-red-400 font-medium">{overdue} overdue</span>}
        <span className="ml-auto font-mono tabular-nums">{paid}/{total} paid</span>
      </div>

      <div className="mt-2 h-1.5 rounded-full bg-brand-100 dark:bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full bg-brand-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-espresso-400 dark:text-brand-300 font-mono tabular-nums">
          ${paidAmount.toFixed(2)} of ${plan.totalAmount.toFixed(2)} paid
        </span>
        {amountLeft > 0 && (
          <span className="font-mono font-medium tabular-nums text-brand-600 dark:text-brand-400">
            ${amountLeft.toFixed(2)} left
          </span>
        )}
      </div>
    </Link>
  );
}

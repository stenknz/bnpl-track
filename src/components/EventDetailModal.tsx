"use client";

import { useEffect } from "react";
import Link from "next/link";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  backgroundColor: string;
  extendedProps: {
    type?: string;
    status: string;
    amount: number;
    planId?: string;
    utilityId?: string;
    subscriptionId?: string;
    storeName: string;
    userName?: string;
    isOwn: boolean;
  };
}

interface EventDetailModalProps {
  event: CalendarEvent | null;
  onClose: () => void;
}

export function EventDetailModal({ event, onClose }: EventDetailModalProps) {
  useEffect(() => {
    if (!event) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [event, onClose]);

  if (!event) return null;

  const ep = event.extendedProps;
  const href = ep.type === "utility"
    ? `/utilities/${ep.utilityId}`
    : ep.type === "subscription"
    ? `/subscriptions/${ep.subscriptionId}`
    : `/payments/${ep.planId}`;

  const statusColors: Record<string, string> = {
    PAID: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600",
    OVERDUE: "bg-red-50 dark:bg-red-900/20 text-red-600",
    PENDING: "bg-amber-50 dark:bg-amber-900/20 text-amber-600",
    UNPAID: "bg-red-50 dark:bg-red-900/20 text-red-600",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div
        className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-xl border border-neutral-200 dark:border-neutral-800 w-full max-w-sm mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: event.backgroundColor }} />
            <h3 className="font-semibold text-lg">{ep.storeName}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-500">Amount</span>
            <span className="font-semibold">${ep.amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-500">Date</span>
            <span className="text-sm">
              {new Date(event.start).toLocaleDateString("en-US", {
                weekday: "short", month: "short", day: "numeric", year: "numeric",
              })}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-500">Status</span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[ep.status] || "bg-neutral-100 text-neutral-600"}`}>
              {ep.status.charAt(0) + ep.status.slice(1).toLowerCase()}
            </span>
          </div>
          {ep.userName && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-500">Owner</span>
               <span className="text-sm text-brand-500">{ep.userName}</span>
            </div>
          )}
        </div>

        <Link
          href={href}
          className="mt-5 block w-full text-center px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

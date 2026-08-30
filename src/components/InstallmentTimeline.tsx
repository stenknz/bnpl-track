"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Installment {
  id: string;
  amount: number;
  dueDate: Date;
  status: string;
  paidAt: Date | null;
}

interface InstallmentTimelineProps {
  installments: Installment[];
}

export function InstallmentTimeline({ installments }: InstallmentTimelineProps) {
  const router = useRouter();
  const [updating, setUpdating] = useState<string | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  async function markPaid(id: string) {
    setUpdating(id);
    await fetch(`/api/installments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "PAID" }),
    });
    setUpdating(null);
    router.refresh();
  }

  const now = new Date();
  const allPaid = installments.every((i) => i.status === "PAID");
  const paidCount = installments.filter((i) => i.status === "PAID").length;
  const progress = installments.length > 0 ? Math.round((paidCount / installments.length) * 100) : 0;

  return (
    <div>
      {/* Progress header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs tracking-[0.08em] uppercase font-semibold text-espresso-400 dark:text-brand-300">
          {paidCount} of {installments.length} paid
        </span>
        <span className="text-sm font-mono font-bold tabular-nums text-brand-500">{progress}%</span>
      </div>

      {/* The rail */}
      <div className="flex gap-0.5 h-8 rounded-lg overflow-hidden">
        {installments.map((inst, i) => {
          const dueDate = new Date(inst.dueDate);
          const isOverdue = inst.status === "PENDING" && dueDate < now;
          const isPaid = inst.status === "PAID";
          const isHovered = hoveredIdx === i;

          let bg = "bg-brand-200 dark:bg-brand-900/40";
          if (isPaid) bg = "bg-gradient-to-r from-brand-500 to-brand-400";
          else if (isOverdue) bg = "bg-red-400";

          return (
            <button
              key={inst.id}
              className={`relative flex-1 min-w-[20px] transition-all duration-150 ${bg} ${i === 0 ? "rounded-l-lg" : ""} ${i === installments.length - 1 ? "rounded-r-lg" : ""} ${isHovered ? "scale-y-110 shadow-md z-10" : "hover:scale-y-105"}`}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              onClick={() => !isPaid && markPaid(inst.id)}
              disabled={updating === inst.id || isPaid}
              title={`${inst.amount.toFixed(2)} — ${dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
            >
              {isHovered && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg bg-espresso-500 dark:bg-[#2A1810] text-white text-xs font-medium whitespace-nowrap shadow-lg z-20 pointer-events-none">
                  <span className="font-mono font-bold">${inst.amount.toFixed(2)}</span>
                  <span className="text-brand-200 ml-1.5">{dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-espresso-500 dark:border-t-[#2A1810]" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Detail row */}
      {hoveredIdx !== null && (
        <div className="mt-4 p-4 rounded-xl bg-brand-50 dark:bg-white/5 border border-brand-200/50 dark:border-white/10">
          {(() => {
            const inst = installments[hoveredIdx];
            const dueDate = new Date(inst.dueDate);
            const isOverdue = inst.status === "PENDING" && dueDate < now;
            const isPaid = inst.status === "PAID";
            return (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display font-bold text-lg text-espresso-500 dark:text-brand-100">${inst.amount.toFixed(2)}</p>
                  <p className="text-sm text-espresso-400 dark:text-brand-300">
                    {dueDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                  </p>
                  {inst.paidAt && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                      Paid on {new Date(inst.paidAt).toLocaleDateString()}
                    </p>
                  )}
                  {isOverdue && (
                    <p className="text-xs text-red-500 mt-1">Overdue by {Math.floor((now.getTime() - dueDate.getTime()) / 86400000)} days</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isPaid ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" : isOverdue ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400" : "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"}`}>
                    {isPaid ? "Paid" : isOverdue ? "Overdue" : "Pending"}
                  </span>
                  {inst.status === "PENDING" && (
                    <button
                      onClick={() => markPaid(inst.id)}
                      disabled={updating === inst.id}
                      className="px-3 py-1.5 rounded-lg bg-brand-500 text-white text-xs font-medium hover:bg-brand-600 disabled:opacity-50 transition-colors"
                    >
                      {updating === inst.id ? "..." : "Mark paid"}
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {allPaid && installments.length > 0 && (
        <div className="text-center py-6 text-emerald-600 dark:text-emerald-400 font-medium font-display">
          All installments paid!
        </div>
      )}
    </div>
  );
}

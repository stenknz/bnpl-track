"use client";

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

interface DayDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  events: CalendarEvent[];
}

export function DayDetailDrawer({ open, onClose, events }: DayDetailDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div
        className="w-full max-w-md bg-white dark:bg-neutral-900 h-full overflow-y-auto p-6 shadow-xl border-l border-neutral-200 dark:border-neutral-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold dark:text-brand-100">
            {events.length > 0
              ? new Date(events[0].start).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })
              : "Selected Date"}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {events.length === 0 ? (
          <p className="text-neutral-400 text-center py-8">No payments due on this date.</p>
        ) : (
          <div className="space-y-3">
            {events.map((event) => {
              const href = event.extendedProps.type === "utility"
                ? `/utilities/${event.extendedProps.utilityId}`
                : event.extendedProps.type === "subscription"
                ? `/subscriptions/${event.extendedProps.subscriptionId}`
                : `/payments/${event.extendedProps.planId}`;

              const statusLabel = event.extendedProps.type === "utility"
                ? (event.extendedProps.status === "UNPAID" ? "Unpaid" : event.extendedProps.status === "PART_PAID" ? "Part Paid" : "Paid")
                : event.extendedProps.type === "subscription" ? "Pending" : event.extendedProps.status;

              const statusColors: Record<string, string> = event.extendedProps.type === "utility"
                ? {
                    UNPAID: "bg-red-50 dark:bg-red-900/20 text-red-600",
                    PART_PAID: "bg-amber-50 dark:bg-amber-900/20 text-amber-600",
                    PAID: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600",
                  }
                : {
                    PAID: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600",
                    OVERDUE: "bg-red-50 dark:bg-red-900/20 text-red-600",
                    PENDING: "bg-amber-50 dark:bg-amber-900/20 text-amber-600",
                  };

              return (
              <Link
                key={event.id}
                href={href}
                className="block p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-brand-300 dark:hover:border-brand-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: event.backgroundColor }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate dark:text-brand-100">
                      {event.extendedProps.storeName}
                      {event.extendedProps.userName && (
                         <span className="text-sm font-normal text-brand-500 ml-2">
                          {event.extendedProps.userName}
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-neutral-500">${event.extendedProps.amount.toFixed(2)}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[event.extendedProps.status] || "bg-neutral-100 text-neutral-600"}`}>
                    {statusLabel}
                  </span>
                </div>
              </Link>
            );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

interface StatusBadgeProps {
  status: string;
}

const styles: Record<string, string> = {
  PAID: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
  PENDING: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
  OVERDUE: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
  ACTIVE: "bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400",
  COMPLETED: "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400",
  CANCELLED: "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-500",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.PENDING}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

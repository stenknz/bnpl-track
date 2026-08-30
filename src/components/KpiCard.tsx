interface KpiCardProps {
  label: string;
  value: string;
  icon: string;
  color: "brand" | "accent" | "warm" | "emerald" | "rose";
}

const colorMap = {
  brand: "bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-300",
  accent: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-300",
  warm: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-300",
  emerald: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-300",
  rose: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300",
};

export function KpiCard({ label, value, icon, color }: KpiCardProps) {
  return (
    <div className="ledger-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] tracking-[0.08em] uppercase font-semibold text-espresso-400 dark:text-brand-300">{label}</p>
          <p className="mt-1 text-2xl font-display font-bold tabular-nums tracking-tight text-espresso-500 dark:text-brand-100">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
          </svg>
        </div>
      </div>
    </div>
  );
}

"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface DoughnutChartCardProps {
  paid: number;
  pending: number;
  overdue: number;
}

const COLORS = ["#22c55e", "#F6B45F", "#C06340"];

export function DoughnutChartCard({ paid, pending, overdue }: DoughnutChartCardProps) {
  const data = [
    { name: "Paid", value: paid },
    { name: "Pending", value: pending },
    { name: "Overdue", value: overdue },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="ledger-card p-5">
        <h3 className="font-display font-bold text-espresso-500 dark:text-brand-100 mb-4">Payment Status</h3>
        <div className="h-64 flex items-center justify-center text-espresso-400 dark:text-brand-400">No data yet</div>
      </div>
    );
  }

  return (
    <div className="ledger-card p-5">
      <h3 className="font-display font-bold text-espresso-500 dark:text-brand-100 mb-4">Payment Status</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} initialDimension={{ width: 1, height: 1 }}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: "12px", border: "1px solid #E8DDD0", background: "white" }}
              formatter={(value) => [value, "Installments"]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

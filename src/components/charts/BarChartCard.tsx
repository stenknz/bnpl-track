"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface BarChartCardProps {
  dueNext15: number;
  dueNext30: number;
  dueNext90: number;
  partnerDueNext15?: number;
  partnerDueNext30?: number;
  partnerDueNext90?: number;
}

export function BarChartCard({ dueNext15, dueNext30, dueNext90, partnerDueNext15, partnerDueNext30, partnerDueNext90 }: BarChartCardProps) {
  const hasPartner = partnerDueNext15 !== undefined && partnerDueNext30 !== undefined && partnerDueNext90 !== undefined;

  const data = [
    {
      name: "15 Days",
      Yours: dueNext15,
      ...(hasPartner ? { "Partner": partnerDueNext15 } : {}),
    },
    {
      name: "30 Days",
      Yours: dueNext30 - dueNext15,
      ...(hasPartner ? { "Partner": partnerDueNext30 - partnerDueNext15 } : {}),
    },
    {
      name: "90 Days",
      Yours: dueNext90 - dueNext30,
      ...(hasPartner ? { "Partner": partnerDueNext90 - partnerDueNext30 } : {}),
    },
  ];

  return (
    <div className="ledger-card p-5">
      <h3 className="font-display font-bold text-espresso-500 dark:text-brand-100 mb-4">Due Amounts</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} initialDimension={{ width: 1, height: 1 }}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8DDD0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#8E5C42" />
            <YAxis tick={{ fontSize: 12 }} stroke="#8E5C42" />
            <Tooltip
              contentStyle={{ borderRadius: "12px", border: "1px solid #E8DDD0", background: "white" }}
              formatter={(value) => [`$${Number(value).toFixed(2)}`, undefined]}
            />
            {hasPartner && <Legend />}
            <Bar dataKey="Yours" fill="#A84A2E" radius={[6, 6, 0, 0]} />
            {hasPartner && <Bar dataKey="Partner" fill="#D4895E" radius={[6, 6, 0, 0]} />}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatDate } from "@/lib/formatDate";

interface LineChartCardProps {
  data: { date: string; amount: number }[];
  partnerData?: { date: string; amount: number }[];
}

export function LineChartCard({ data, partnerData }: LineChartCardProps) {
  const hasPartner = partnerData !== undefined && partnerData.length > 0;

  const merged = (() => {
    const allDates = new Set<string>();
    for (const d of data) allDates.add(d.date);
    if (partnerData) for (const d of partnerData) allDates.add(d.date);

    const sorted = Array.from(allDates).sort();
    const ownMap = new Map(data.map((d) => [d.date, d.amount]));
    const partnerMap = partnerData ? new Map(partnerData.map((d) => [d.date, d.amount])) : new Map();

    return sorted.map((date) => ({
      date,
      Yours: ownMap.get(date) || 0,
      ...(hasPartner ? { Partner: partnerMap.get(date) || 0 } : {}),
    }));
  })();

  return (
    <div className="ledger-card p-5">
      <h3 className="font-display font-bold text-espresso-500 dark:text-brand-100 mb-4">Upcoming Payments</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} initialDimension={{ width: 1, height: 1 }}>
          <LineChart data={merged}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8DDD0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10 }}
              stroke="#8E5C42"
              tickFormatter={(v) => {
                const d = new Date(v);
                return formatDate(d);
              }}
            />
            <YAxis tick={{ fontSize: 12 }} stroke="#8E5C42" />
            <Tooltip
              contentStyle={{ borderRadius: "12px", border: "1px solid #E8DDD0", background: "white" }}
              formatter={(value, name) => [`$${Number(value).toFixed(2)}`, name]}
              labelFormatter={(v) => formatDate(new Date(v))}
            />
            {hasPartner && <Legend />}
            <Line
              type="monotone"
              dataKey="Yours"
              stroke="#A84A2E"
              strokeWidth={2}
              dot={{ fill: "#A84A2E", r: 3 }}
              activeDot={{ r: 5 }}
            />
            {hasPartner && (
              <Line
                type="monotone"
                dataKey="Partner"
                stroke="#D4895E"
                strokeWidth={2}
                strokeDasharray="4 2"
                dot={{ fill: "#D4895E", r: 3 }}
                activeDot={{ r: 5 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

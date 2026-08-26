"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

const COLORS = ["#072e21", "#4c9b76", "#f59e0b", "#ef4444", "#06b6d4", "#8b5cf6"];

export function TopicsDonutChart({
  data,
}: {
  data: Array<{ name: string; value: number }>;
}) {
  if (data.length === 0) {
    return (
      <div className="h-[180px] flex items-center justify-center text-sm text-gray-400">
        Sin datos todavía
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6">
      <ResponsiveContainer width={140} height={180}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={45}
            outerRadius={70}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <ul className="space-y-2 text-xs">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center gap-2 text-gray-600">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: COLORS[i % COLORS.length] }}
            />
            {d.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

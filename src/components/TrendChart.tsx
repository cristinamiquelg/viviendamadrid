"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Granularity } from "@/lib/types";
import { interpolateMonthly } from "@/lib/interpolate";

type Series = { code: string; name: string; color: string; points: { year: number; price: number }[] };

const MONTHS_ES = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

export default function TrendChart({
  series,
  granularity,
}: {
  series: Series[];
  granularity: Granularity;
}) {
  const { data, keys } = useMemo(() => {
    const merged = new Map<string, Record<string, number | string>>();
    const order: string[] = [];

    for (const s of series) {
      const points =
        granularity === "year"
          ? s.points.map((p) => ({ label: String(p.year), sortKey: p.year * 12, price: p.price }))
          : interpolateMonthly(s.points).map((p) => ({
              label: `${MONTHS_ES[p.month - 1]} ${p.year}`,
              sortKey: p.year * 12 + p.month,
              price: p.price,
            }));

      for (const p of points) {
        if (!merged.has(p.label)) {
          merged.set(p.label, { label: p.label, __sort: p.sortKey });
          order.push(p.label);
        }
        merged.get(p.label)![s.code] = p.price;
      }
    }

    const data = Array.from(merged.values()).sort(
      (a, b) => (a.__sort as number) - (b.__sort as number)
    );
    return { data, keys: series.map((s) => s.code) };
  }, [series, granularity]);

  if (series.length === 0 || data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-[var(--text-muted)]">
        Sin datos que mostrar todavía.
      </div>
    );
  }

  const colorByCode = new Map(series.map((s) => [s.code, s.color]));
  const nameByCode = new Map(series.map((s) => [s.code, s.name]));

  // For month view, only show a tick every other January — 180 monthly
  // labels would otherwise overlap on a narrow chart.
  const yearTicks =
    granularity === "month"
      ? (data as { label: string }[])
          .filter((d) => d.label.startsWith(`${MONTHS_ES[0]} `))
          .filter((_, i) => i % 2 === 0)
          .map((d) => d.label)
      : undefined;

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="var(--gridline)" vertical={false} />
          <XAxis
            dataKey="label"
            stroke="var(--axis)"
            tick={{ fill: "var(--text-muted)", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "var(--axis)" }}
            ticks={yearTicks}
            interval={granularity === "month" ? 0 : 1}
            minTickGap={20}
            tickFormatter={granularity === "month" ? (label: string) => label.split(" ")[1] : undefined}
          />
          <YAxis
            stroke="var(--axis)"
            tick={{ fill: "var(--text-muted)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={56}
            tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}k`}
          />
          <Tooltip
            contentStyle={{
              background: "var(--surface-1)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "var(--text-primary)", fontWeight: 500 }}
            formatter={(value, key) => [
              `${Number(value).toLocaleString("es-ES")} €/m²`,
              nameByCode.get(String(key)) ?? String(key),
            ]}
          />
          {keys.map((code) => (
            <Line
              key={code}
              type="monotone"
              dataKey={code}
              name={nameByCode.get(code)}
              stroke={colorByCode.get(code)}
              strokeWidth={2}
              strokeDasharray={granularity === "month" ? "4 3" : undefined}
              dot={granularity === "year" ? { r: 3, strokeWidth: 0 } : false}
              connectNulls
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

"use client";

import { sequentialBlue } from "@/lib/color";

type Row = { id: number; code: string; name: string; price: number | undefined };

export default function DistrictBars({
  rows,
  domain,
  selectedIds,
  onToggle,
}: {
  rows: Row[];
  domain: [number, number];
  selectedIds: Set<number>;
  onToggle: (id: number, name: string) => void;
}) {
  const [min, max] = domain;
  const sorted = [...rows].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
  const maxPrice = Math.max(...rows.map((r) => r.price ?? 0), 1);

  return (
    <div className="flex flex-col gap-1.5">
      {sorted.map((row) => {
        const price = row.price;
        const t = price !== undefined && max > min ? (price - min) / (max - min) : 0;
        const widthPct = price !== undefined ? Math.max(4, (price / maxPrice) * 100) : 2;
        const selected = selectedIds.has(row.id);
        return (
          <button
            key={row.id}
            type="button"
            onClick={() => onToggle(row.id, row.name)}
            className={`group flex items-center gap-3 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-[var(--page)] ${
              selected ? "ring-1 ring-[#2a78d6]" : ""
            }`}
          >
            <span className="w-32 shrink-0 truncate text-xs text-[var(--text-primary)]">
              {row.name}
            </span>
            <span className="relative h-4 flex-1 overflow-hidden rounded bg-[var(--gridline)]">
              <span
                className="absolute inset-y-0 left-0 rounded"
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: price !== undefined ? sequentialBlue(t) : "transparent",
                }}
              />
            </span>
            <span className="w-16 shrink-0 text-right text-xs tabular-nums text-[var(--text-secondary)]">
              {price !== undefined ? `${price.toLocaleString("es-ES")} €` : "—"}
            </span>
          </button>
        );
      })}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import type { Neighborhood } from "@/lib/types";

type Props = {
  neighborhoods: Neighborhood[];
  selectedCodes: Set<string>;
  onToggle: (code: string, name: string) => void;
  maxSelected: number;
};

export default function BarrioSearch({ neighborhoods, selectedCodes, onToggle, maxSelected }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return neighborhoods
      .filter(
        (n) =>
          n.name.toLowerCase().includes(q) || n.district_name.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [query, neighborhoods]);

  const atLimit = selectedCodes.size >= maxSelected;

  return (
    <div className="relative w-full max-w-sm">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Buscar barrio o distrito…"
        className="w-full rounded-md border border-[var(--border)] bg-[var(--surface-1)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#2a78d6]"
      />
      {open && results.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-[var(--border)] bg-[var(--surface-1)] shadow-lg">
          {results.map((n) => {
            const selected = selectedCodes.has(n.code);
            const disabled = !selected && atLimit;
            return (
              <li key={n.code}>
                <button
                  type="button"
                  disabled={disabled}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onToggle(n.code, n.name);
                    setQuery("");
                  }}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-[var(--page)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="text-[var(--text-primary)]">{n.name}</span>
                  <span className="text-xs text-[var(--text-muted)]">{n.district_name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {atLimit && (
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Máximo {maxSelected} barrios a la vez para mantener el gráfico legible.
        </p>
      )}
    </div>
  );
}

"use client";

import { sequentialBlue } from "@/lib/color";

export default function MapLegend({ domain }: { domain: [number, number] }) {
  const [min, max] = domain;
  const stops = 24;
  return (
    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
      <span>{Math.round(min).toLocaleString("es-ES")} €/m²</span>
      <div
        className="h-2 w-40 rounded-full"
        style={{
          background: `linear-gradient(to right, ${Array.from({ length: stops }, (_, i) =>
            sequentialBlue(i / (stops - 1))
          ).join(", ")})`,
        }}
      />
      <span>{Math.round(max).toLocaleString("es-ES")} €/m²</span>
    </div>
  );
}

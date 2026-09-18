"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { geoMercator, geoPath } from "d3-geo";
import { sequentialBlue } from "@/lib/color";

type BarrioFeature = {
  type: "Feature";
  geometry: GeoJSON.Geometry;
  properties: {
    distrito_codigo: string;
    distrito_nombre: string;
    barrio_codigo: string;
    barrio_nombre: string;
  };
};

type BarrioGeoJSON = {
  type: "FeatureCollection";
  features: BarrioFeature[];
};

type Props = {
  priceByCode: Map<string, number>;
  domain: [number, number];
  selectedCodes: Set<string>;
  onToggle: (code: string, name: string) => void;
};

const WIDTH = 640;
const HEIGHT = 640;

export default function MadridMap({ priceByCode, domain, selectedCodes, onToggle }: Props) {
  const [geo, setGeo] = useState<BarrioGeoJSON | null>(null);
  const [hover, setHover] = useState<{ x: number; y: number; code: string; name: string } | null>(
    null
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/data/barrios.geojson")
      .then((r) => r.json())
      .then(setGeo);
  }, []);

  const projection = useMemo(() => {
    if (!geo) return null;
    return geoMercator().fitSize([WIDTH, HEIGHT], geo as unknown as GeoJSON.FeatureCollection);
  }, [geo]);

  const path = useMemo(() => (projection ? geoPath(projection) : null), [projection]);

  if (!geo || !path) {
    return (
      <div className="flex h-[640px] w-full items-center justify-center text-sm text-[var(--text-muted)]">
        Cargando mapa…
      </div>
    );
  }

  const [min, max] = domain;

  return (
    <div ref={containerRef} className="relative w-full">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full"
        role="img"
        aria-label="Mapa de barrios de Madrid coloreado por precio de venta"
      >
        {geo.features.map((f) => {
          const code = f.properties.barrio_codigo;
          const price = priceByCode.get(code);
          const t = price !== undefined && max > min ? (price - min) / (max - min) : 0;
          const fill = price !== undefined ? sequentialBlue(t) : "#e1e0d9";
          const isSelected = selectedCodes.has(code);
          return (
            <path
              key={code}
              d={path(f as unknown as GeoJSON.Feature) ?? undefined}
              fill={fill}
              stroke={isSelected ? "#0b0b0b" : "#fcfcfb"}
              strokeWidth={isSelected ? 2 : 0.75}
              className="cursor-pointer transition-[stroke-width] duration-100"
              onClick={() => onToggle(code, f.properties.barrio_nombre)}
              onMouseMove={(e) => {
                const rect = containerRef.current?.getBoundingClientRect();
                if (!rect) return;
                setHover({
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top,
                  code,
                  name: f.properties.barrio_nombre,
                });
              }}
              onMouseLeave={() => setHover(null)}
            >
              <title>
                {f.properties.barrio_nombre} ({f.properties.distrito_nombre})
                {price !== undefined ? ` — ${price.toLocaleString("es-ES")} €/m²` : " — sin dato"}
              </title>
            </path>
          );
        })}
      </svg>

      {hover && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md border border-[var(--border)] bg-[var(--surface-1)] px-2.5 py-1.5 text-xs shadow-md"
          style={{ left: hover.x, top: hover.y - 8 }}
        >
          <div className="font-medium text-[var(--text-primary)]">{hover.name}</div>
          <div className="text-[var(--text-secondary)]">
            {priceByCode.get(hover.code) !== undefined
              ? `${priceByCode.get(hover.code)!.toLocaleString("es-ES")} €/m²`
              : "Sin dato para este año"}
          </div>
        </div>
      )}
    </div>
  );
}

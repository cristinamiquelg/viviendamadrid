"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchAlquilerPrices,
  fetchDistricts,
  fetchNeighborhoods,
  fetchVentaPrices,
} from "@/lib/data";
import type { District, Granularity, Neighborhood, PricePoint, RentPoint } from "@/lib/types";
import { CATEGORICAL } from "@/lib/color";
import MadridMap from "./MadridMap";
import MapLegend from "./MapLegend";
import YearSlider from "./YearSlider";
import BarrioSearch from "./BarrioSearch";
import SelectedChips from "./SelectedChips";
import TrendChart from "./TrendChart";
import DistrictBars from "./DistrictBars";

const MAX_SELECTED = 8;

type Selection = { code: string; name: string; color: string };

function assignColor(existing: Selection[]): string {
  const used = new Set(existing.map((s) => s.color));
  return CATEGORICAL.find((c) => !used.has(c)) ?? CATEGORICAL[existing.length % CATEGORICAL.length];
}

export default function Dashboard() {
  const [tab, setTab] = useState<"venta" | "alquiler">("venta");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [ventaPoints, setVentaPoints] = useState<PricePoint[]>([]);
  const [rentPoints, setRentPoints] = useState<RentPoint[]>([]);

  const [granularity, setGranularity] = useState<Granularity>("year");
  const [year, setYear] = useState(2016);
  const [selectedBarrios, setSelectedBarrios] = useState<Selection[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<Selection[]>([]);

  useEffect(() => {
    Promise.all([fetchNeighborhoods(), fetchDistricts(), fetchVentaPrices(), fetchAlquilerPrices()])
      .then(([nb, dt, vp, rp]) => {
        setNeighborhoods(nb);
        setDistricts(dt);
        setVentaPoints(vp);
        setRentPoints(rp);
      })
      .catch((e) => setError(e.message ?? "Error cargando datos"))
      .finally(() => setLoading(false));
  }, []);

  const idToCode = useMemo(
    () => new Map(neighborhoods.map((n) => [n.id, n.code])),
    [neighborhoods]
  );
  const codeToName = useMemo(
    () => new Map(neighborhoods.map((n) => [n.code, n.name])),
    [neighborhoods]
  );
  const idToName = useMemo(() => new Map(districts.map((d) => [d.id, d.name])), [districts]);

  const years = useMemo(() => {
    const ys = new Set(ventaPoints.map((p) => p.year));
    return Array.from(ys).sort((a, b) => a - b);
  }, [ventaPoints]);
  const minYear = years[0] ?? 2001;
  const maxYear = years[years.length - 1] ?? 2016;

  const ventaDomain = useMemo<[number, number]>(() => {
    if (ventaPoints.length === 0) return [0, 1];
    let min = Infinity;
    let max = -Infinity;
    for (const p of ventaPoints) {
      if (p.price < min) min = p.price;
      if (p.price > max) max = p.price;
    }
    return [min, max];
  }, [ventaPoints]);

  const rentDomain = useMemo<[number, number]>(() => {
    if (rentPoints.length === 0) return [0, 1];
    let min = Infinity;
    let max = -Infinity;
    for (const p of rentPoints) {
      if (p.price < min) min = p.price;
      if (p.price > max) max = p.price;
    }
    return [min, max];
  }, [rentPoints]);

  const priceByCodeForYear = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of ventaPoints) {
      if (p.year === year) {
        const code = idToCode.get(p.neighborhood_id);
        if (code) m.set(code, p.price);
      }
    }
    return m;
  }, [ventaPoints, year, idToCode]);

  const rentByDistrictForYear = useMemo(() => {
    const m = new Map<number, number>();
    for (const p of rentPoints) {
      if (p.year === year) m.set(p.district_id, p.price);
    }
    return m;
  }, [rentPoints, year]);

  function toggleBarrio(code: string, name: string) {
    setSelectedBarrios((prev) => {
      const exists = prev.find((s) => s.code === code);
      if (exists) return prev.filter((s) => s.code !== code);
      if (prev.length >= MAX_SELECTED) return prev;
      return [...prev, { code, name, color: assignColor(prev) }];
    });
  }

  function toggleDistrict(id: number, name: string) {
    const code = String(id);
    setSelectedDistricts((prev) => {
      const exists = prev.find((s) => s.code === code);
      if (exists) return prev.filter((s) => s.code !== code);
      if (prev.length >= MAX_SELECTED) return prev;
      return [...prev, { code, name, color: assignColor(prev) }];
    });
  }

  const barrioSeries = useMemo(
    () =>
      selectedBarrios.map((sel) => {
        const nb = neighborhoods.find((n) => n.code === sel.code);
        const points = ventaPoints
          .filter((p) => p.neighborhood_id === nb?.id)
          .map((p) => ({ year: p.year, price: p.price }))
          .sort((a, b) => a.year - b.year);
        return { code: sel.code, name: sel.name, color: sel.color, points };
      }),
    [selectedBarrios, neighborhoods, ventaPoints]
  );

  const districtSeries = useMemo(
    () =>
      selectedDistricts.map((sel) => {
        const id = Number(sel.code);
        const points = rentPoints
          .filter((p) => p.district_id === id)
          .map((p) => ({ year: p.year, price: p.price }))
          .sort((a, b) => a.year - b.year);
        return { code: sel.code, name: sel.name, color: sel.color, points };
      }),
    [selectedDistricts, rentPoints]
  );

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-sm text-[var(--text-muted)]">
        Cargando datos de Madrid…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center text-sm text-red-600">
        No se pudieron cargar los datos: {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 border-b border-[var(--border)]">
        {(["venta", "alquiler"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              tab === t
                ? "border-[#2a78d6] text-[var(--text-primary)]"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            {t === "venta" ? "Precio de venta · por barrio" : "Precio de alquiler · por distrito"}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <YearSlider year={year} minYear={minYear} maxYear={maxYear} onChange={setYear} />
        <div className="flex items-center gap-1 rounded-full border border-[var(--border)] p-0.5 text-xs">
          {(["year", "month"] as const).map((g) => (
            <button
              key={g}
              onClick={() => setGranularity(g)}
              className={`rounded-full px-2.5 py-1 font-medium transition-colors ${
                granularity === g
                  ? "bg-[#2a78d6] text-white"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              {g === "year" ? "Año" : "Mes (estimado)"}
            </button>
          ))}
        </div>
      </div>
      {granularity === "month" && (
        <p className="-mt-4 text-xs text-[var(--text-muted)]">
          La fuente oficial solo publica precios anuales. La vista mensual interpola linealmente
          entre los datos anuales reales para facilitar la lectura de la tendencia — no son cifras
          publicadas mes a mes.
        </p>
      )}

      {tab === "venta" ? (
        <>
          <div className="grid gap-6 lg:grid-cols-[640px_1fr]">
            <div className="flex flex-col gap-3">
              <MadridMap
                priceByCode={priceByCodeForYear}
                domain={ventaDomain}
                selectedCodes={new Set(selectedBarrios.map((s) => s.code))}
                onToggle={toggleBarrio}
              />
              <MapLegend domain={ventaDomain} />
            </div>
            <div className="flex flex-col gap-4">
              <BarrioSearch
                neighborhoods={neighborhoods}
                selectedCodes={new Set(selectedBarrios.map((s) => s.code))}
                onToggle={toggleBarrio}
                maxSelected={MAX_SELECTED}
              />
              <SelectedChips items={selectedBarrios} onRemove={(code) => toggleBarrio(code, codeToName.get(code) ?? code)} />
              <TrendChart series={barrioSeries} granularity={granularity} />
            </div>
          </div>
        </>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <DistrictBars
            rows={districts.map((d) => ({
              id: d.id,
              code: d.code,
              name: d.name,
              price: rentByDistrictForYear.get(d.id),
            }))}
            domain={rentDomain}
            selectedIds={new Set(selectedDistricts.map((s) => Number(s.code)))}
            onToggle={toggleDistrict}
          />
          <div className="flex flex-col gap-4">
            <SelectedChips
              items={selectedDistricts}
              onRemove={(code) => toggleDistrict(Number(code), idToName.get(Number(code)) ?? code)}
            />
            <TrendChart series={districtSeries} granularity={granularity} />
          </div>
        </div>
      )}
    </div>
  );
}

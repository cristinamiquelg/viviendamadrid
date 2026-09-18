"use client";

type Props = {
  year: number;
  minYear: number;
  maxYear: number;
  onChange: (year: number) => void;
};

export default function YearSlider({ year, minYear, maxYear, onChange }: Props) {
  return (
    <div className="flex w-full items-center gap-3">
      <span className="text-xs text-[var(--text-muted)]">{minYear}</span>
      <input
        type="range"
        min={minYear}
        max={maxYear}
        step={1}
        value={year}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[var(--gridline)] accent-[#2a78d6]"
        aria-label="Año"
      />
      <span className="text-xs text-[var(--text-muted)]">{maxYear}</span>
      <span className="ml-2 min-w-[3.5rem] rounded-md border border-[var(--border)] px-2 py-1 text-center text-sm font-medium tabular-nums text-[var(--text-primary)]">
        {year}
      </span>
    </div>
  );
}

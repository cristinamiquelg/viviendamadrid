// Linear interpolation of monthly points between official annual observations.
// Clearly a client-side estimate: the source data is annual, not monthly.
export type YearValue = { year: number; price: number };
export type MonthValue = { year: number; month: number; price: number };

export function interpolateMonthly(points: YearValue[]): MonthValue[] {
  const sorted = [...points].sort((a, b) => a.year - b.year);
  if (sorted.length === 0) return [];
  const out: MonthValue[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    const next = sorted[i + 1];
    if (!next) {
      out.push({ year: current.year, month: 1, price: current.price });
      break;
    }
    const gapYears = next.year - current.year;
    const monthsInGap = gapYears * 12;
    for (let m = 0; m < monthsInGap; m++) {
      const t = m / monthsInGap;
      const price = current.price + (next.price - current.price) * t;
      const totalMonth = current.year * 12 + m; // 0-indexed month index (Jan = 0)
      const year = Math.floor(totalMonth / 12);
      const month = (totalMonth % 12) + 1;
      out.push({ year, month, price: Math.round(price) });
    }
  }
  return out;
}

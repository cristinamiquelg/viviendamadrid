// Sequential blue ramp (light -> dark), validated palette from the dataviz skill.
const SEQUENTIAL_BLUE: [number, string][] = [
  [0, "#cde2fb"],
  [1 / 6, "#9ec5f4"],
  [2 / 6, "#5598e7"],
  [3 / 6, "#2a78d6"],
  [4 / 6, "#1c5cab"],
  [5 / 6, "#104281"],
  [1, "#0d366b"],
];

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function sequentialBlue(t: number): string {
  const clamped = Math.max(0, Math.min(1, t));
  let i = 0;
  while (i < SEQUENTIAL_BLUE.length - 2 && SEQUENTIAL_BLUE[i + 1][0] < clamped) i++;
  const [t0, c0] = SEQUENTIAL_BLUE[i];
  const [t1, c1] = SEQUENTIAL_BLUE[i + 1];
  const localT = t1 === t0 ? 0 : (clamped - t0) / (t1 - t0);
  const [r0, g0, b0] = hexToRgb(c0);
  const [r1, g1, b1] = hexToRgb(c1);
  const r = Math.round(lerp(r0, r1, localT));
  const g = Math.round(lerp(g0, g1, localT));
  const b = Math.round(lerp(b0, b1, localT));
  return `rgb(${r}, ${g}, ${b})`;
}

// Categorical palette, fixed order (validated for adjacent-pair CVD safety on lines).
export const CATEGORICAL: string[] = [
  "#2a78d6", // blue
  "#eb6834", // orange
  "#1baf7a", // aqua
  "#eda100", // yellow
  "#e87ba4", // magenta
  "#008300", // green
  "#4a3aa7", // violet
  "#e34948", // red
];

export const CATEGORICAL_DARK: string[] = [
  "#3987e5",
  "#d95926",
  "#199e70",
  "#c98500",
  "#d55181",
  "#008300",
  "#9085e9",
  "#e66767",
];

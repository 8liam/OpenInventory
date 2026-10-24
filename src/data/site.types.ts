export type Figure = { label: string; value: number; prefix: string; suffix: string; decimals: number };

export type Chapter = {
  figure: Figure;
  hint: string;
  id: string;
  view: string;
  route: string;
  title: string;
  body: string;
  points: readonly string[];
};

export type Stat = { value: string; label: string; note: string };
export type ConfigRow = { name: string; fallback: string; purpose: string };
export type ConfigPoint = { title: string; body: string };

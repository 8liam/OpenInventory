export type Figure = {
  label: string;
  value: number;
  prefix: string;
  suffix: string;
  decimals: number;
};

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

/** One tab of the hero segmented control, pointing at the same demo the story uses. */
export type Lens = { id: string; label: string; caption: string };

export type Step = { title: string; body: string };

export type Faq = { q: string; a: string };

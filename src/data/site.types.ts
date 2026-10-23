import type { ImageMetadata } from 'astro';

export type Chapter = {
  id: string;
  view: string;
  route: string;
  title: string;
  body: string;
  points: readonly string[];
  alt: string;
  image: ImageMetadata;
};

export type Stat = { value: string; label: string; note: string };
export type ConfigRow = { name: string; fallback: string; purpose: string };
export type ConfigPoint = { title: string; body: string };

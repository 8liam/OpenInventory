/**
 * Doppler and Gamma Doppler phases by paint kit id, per weapon.
 * Source: https://github.com/ByMykel/CSGO-API (public/api/en/skins.json at commit c52da3543f4cb57958d1e5c1847e6b692c02af4c; paint_index and phase per skin)
 * Source: https://steamdb.com/en/articles/cs2-doppler-phases-guide (tier order, June 2026 price snapshot, published 2026-07-02)
 * Retrieved: 2026-11-07.
 * Tiers: T1 gems (Ruby, Sapphire, Black Pearl, Emerald; kept tied because sources dispute their order), T2 Phase 2 (priciest numbered phase),
 * T3 Butterfly Knife Doppler Phase 4 (the article names it as the one numbered phase with its own premium). Phases 1 and 3 get no tier.
 * Butterfly Knife and Shadow Daggers use their own paint kit ids for Black Pearl (617), Phase 2 (618) and Sapphire (619).
 * Generated once from the sources above (script not committed). Extend by hand: keep tiers in source order and update the Source and Retrieved lines.
 */
import type { PhaseTable } from "../pattern-tiers.types.ts";

export const PHASE_TABLES: readonly PhaseTable[] = [
  {
    weapon: "Bayonet",
    finish: "Doppler",
    tierCount: 2,
    phases: [
      { paintIndex: 415, label: "Ruby", tier: 1 },
      { paintIndex: 416, label: "Sapphire", tier: 1 },
      { paintIndex: 417, label: "Black Pearl", tier: 1 },
      { paintIndex: 419, label: "Phase 2", tier: 2 },
    ],
  },
  {
    weapon: "Bayonet",
    finish: "Gamma Doppler",
    tierCount: 2,
    phases: [
      { paintIndex: 568, label: "Emerald", tier: 1 },
      { paintIndex: 570, label: "Phase 2", tier: 2 },
    ],
  },
  {
    weapon: "Bowie Knife",
    finish: "Doppler",
    tierCount: 2,
    phases: [
      { paintIndex: 415, label: "Ruby", tier: 1 },
      { paintIndex: 416, label: "Sapphire", tier: 1 },
      { paintIndex: 417, label: "Black Pearl", tier: 1 },
      { paintIndex: 419, label: "Phase 2", tier: 2 },
    ],
  },
  {
    weapon: "Bowie Knife",
    finish: "Gamma Doppler",
    tierCount: 2,
    phases: [
      { paintIndex: 568, label: "Emerald", tier: 1 },
      { paintIndex: 570, label: "Phase 2", tier: 2 },
    ],
  },
  {
    weapon: "Butterfly Knife",
    finish: "Doppler",
    tierCount: 3,
    phases: [
      { paintIndex: 415, label: "Ruby", tier: 1 },
      { paintIndex: 421, label: "Phase 4", tier: 3 },
      { paintIndex: 617, label: "Black Pearl", tier: 1 },
      { paintIndex: 618, label: "Phase 2", tier: 2 },
      { paintIndex: 619, label: "Sapphire", tier: 1 },
    ],
  },
  {
    weapon: "Butterfly Knife",
    finish: "Gamma Doppler",
    tierCount: 2,
    phases: [
      { paintIndex: 568, label: "Emerald", tier: 1 },
      { paintIndex: 570, label: "Phase 2", tier: 2 },
    ],
  },
  {
    weapon: "Falchion Knife",
    finish: "Doppler",
    tierCount: 2,
    phases: [
      { paintIndex: 415, label: "Ruby", tier: 1 },
      { paintIndex: 416, label: "Sapphire", tier: 1 },
      { paintIndex: 417, label: "Black Pearl", tier: 1 },
      { paintIndex: 419, label: "Phase 2", tier: 2 },
    ],
  },
  {
    weapon: "Falchion Knife",
    finish: "Gamma Doppler",
    tierCount: 2,
    phases: [
      { paintIndex: 568, label: "Emerald", tier: 1 },
      { paintIndex: 570, label: "Phase 2", tier: 2 },
    ],
  },
  {
    weapon: "Flip Knife",
    finish: "Doppler",
    tierCount: 2,
    phases: [
      { paintIndex: 415, label: "Ruby", tier: 1 },
      { paintIndex: 416, label: "Sapphire", tier: 1 },
      { paintIndex: 417, label: "Black Pearl", tier: 1 },
      { paintIndex: 419, label: "Phase 2", tier: 2 },
    ],
  },
  {
    weapon: "Flip Knife",
    finish: "Gamma Doppler",
    tierCount: 2,
    phases: [
      { paintIndex: 568, label: "Emerald", tier: 1 },
      { paintIndex: 570, label: "Phase 2", tier: 2 },
    ],
  },
  {
    weapon: "Glock-18",
    finish: "Gamma Doppler",
    tierCount: 2,
    phases: [
      { paintIndex: 1119, label: "Emerald", tier: 1 },
      { paintIndex: 1121, label: "Phase 2", tier: 2 },
    ],
  },
  {
    weapon: "Gut Knife",
    finish: "Doppler",
    tierCount: 2,
    phases: [
      { paintIndex: 415, label: "Ruby", tier: 1 },
      { paintIndex: 416, label: "Sapphire", tier: 1 },
      { paintIndex: 417, label: "Black Pearl", tier: 1 },
      { paintIndex: 419, label: "Phase 2", tier: 2 },
    ],
  },
  {
    weapon: "Gut Knife",
    finish: "Gamma Doppler",
    tierCount: 2,
    phases: [
      { paintIndex: 568, label: "Emerald", tier: 1 },
      { paintIndex: 570, label: "Phase 2", tier: 2 },
    ],
  },
  {
    weapon: "Huntsman Knife",
    finish: "Doppler",
    tierCount: 2,
    phases: [
      { paintIndex: 415, label: "Ruby", tier: 1 },
      { paintIndex: 416, label: "Sapphire", tier: 1 },
      { paintIndex: 417, label: "Black Pearl", tier: 1 },
      { paintIndex: 419, label: "Phase 2", tier: 2 },
    ],
  },
  {
    weapon: "Huntsman Knife",
    finish: "Gamma Doppler",
    tierCount: 2,
    phases: [
      { paintIndex: 568, label: "Emerald", tier: 1 },
      { paintIndex: 570, label: "Phase 2", tier: 2 },
    ],
  },
  {
    weapon: "Karambit",
    finish: "Doppler",
    tierCount: 2,
    phases: [
      { paintIndex: 415, label: "Ruby", tier: 1 },
      { paintIndex: 416, label: "Sapphire", tier: 1 },
      { paintIndex: 417, label: "Black Pearl", tier: 1 },
      { paintIndex: 419, label: "Phase 2", tier: 2 },
    ],
  },
  {
    weapon: "Karambit",
    finish: "Gamma Doppler",
    tierCount: 2,
    phases: [
      { paintIndex: 568, label: "Emerald", tier: 1 },
      { paintIndex: 570, label: "Phase 2", tier: 2 },
    ],
  },
  {
    weapon: "M9 Bayonet",
    finish: "Doppler",
    tierCount: 2,
    phases: [
      { paintIndex: 415, label: "Ruby", tier: 1 },
      { paintIndex: 416, label: "Sapphire", tier: 1 },
      { paintIndex: 417, label: "Black Pearl", tier: 1 },
      { paintIndex: 419, label: "Phase 2", tier: 2 },
    ],
  },
  {
    weapon: "M9 Bayonet",
    finish: "Gamma Doppler",
    tierCount: 2,
    phases: [
      { paintIndex: 568, label: "Emerald", tier: 1 },
      { paintIndex: 570, label: "Phase 2", tier: 2 },
    ],
  },
  {
    weapon: "Navaja Knife",
    finish: "Doppler",
    tierCount: 2,
    phases: [
      { paintIndex: 415, label: "Ruby", tier: 1 },
      { paintIndex: 416, label: "Sapphire", tier: 1 },
      { paintIndex: 417, label: "Black Pearl", tier: 1 },
      { paintIndex: 419, label: "Phase 2", tier: 2 },
    ],
  },
  {
    weapon: "Nomad Knife",
    finish: "Doppler",
    tierCount: 2,
    phases: [
      { paintIndex: 415, label: "Ruby", tier: 1 },
      { paintIndex: 416, label: "Sapphire", tier: 1 },
      { paintIndex: 417, label: "Black Pearl", tier: 1 },
      { paintIndex: 419, label: "Phase 2", tier: 2 },
    ],
  },
  {
    weapon: "Paracord Knife",
    finish: "Doppler",
    tierCount: 2,
    phases: [
      { paintIndex: 415, label: "Ruby", tier: 1 },
      { paintIndex: 416, label: "Sapphire", tier: 1 },
      { paintIndex: 417, label: "Black Pearl", tier: 1 },
      { paintIndex: 419, label: "Phase 2", tier: 2 },
    ],
  },
  {
    weapon: "Shadow Daggers",
    finish: "Doppler",
    tierCount: 2,
    phases: [
      { paintIndex: 415, label: "Ruby", tier: 1 },
      { paintIndex: 617, label: "Black Pearl", tier: 1 },
      { paintIndex: 618, label: "Phase 2", tier: 2 },
      { paintIndex: 619, label: "Sapphire", tier: 1 },
    ],
  },
  {
    weapon: "Shadow Daggers",
    finish: "Gamma Doppler",
    tierCount: 2,
    phases: [
      { paintIndex: 568, label: "Emerald", tier: 1 },
      { paintIndex: 570, label: "Phase 2", tier: 2 },
    ],
  },
  {
    weapon: "Skeleton Knife",
    finish: "Doppler",
    tierCount: 2,
    phases: [
      { paintIndex: 415, label: "Ruby", tier: 1 },
      { paintIndex: 416, label: "Sapphire", tier: 1 },
      { paintIndex: 417, label: "Black Pearl", tier: 1 },
      { paintIndex: 419, label: "Phase 2", tier: 2 },
    ],
  },
  {
    weapon: "Stiletto Knife",
    finish: "Doppler",
    tierCount: 2,
    phases: [
      { paintIndex: 415, label: "Ruby", tier: 1 },
      { paintIndex: 416, label: "Sapphire", tier: 1 },
      { paintIndex: 417, label: "Black Pearl", tier: 1 },
      { paintIndex: 419, label: "Phase 2", tier: 2 },
    ],
  },
  {
    weapon: "Survival Knife",
    finish: "Doppler",
    tierCount: 2,
    phases: [
      { paintIndex: 415, label: "Ruby", tier: 1 },
      { paintIndex: 416, label: "Sapphire", tier: 1 },
      { paintIndex: 417, label: "Black Pearl", tier: 1 },
      { paintIndex: 419, label: "Phase 2", tier: 2 },
    ],
  },
  {
    weapon: "Talon Knife",
    finish: "Doppler",
    tierCount: 2,
    phases: [
      { paintIndex: 415, label: "Ruby", tier: 1 },
      { paintIndex: 416, label: "Sapphire", tier: 1 },
      { paintIndex: 417, label: "Black Pearl", tier: 1 },
      { paintIndex: 853, label: "Phase 2", tier: 2 },
    ],
  },
  {
    weapon: "Ursus Knife",
    finish: "Doppler",
    tierCount: 2,
    phases: [
      { paintIndex: 415, label: "Ruby", tier: 1 },
      { paintIndex: 416, label: "Sapphire", tier: 1 },
      { paintIndex: 417, label: "Black Pearl", tier: 1 },
      { paintIndex: 419, label: "Phase 2", tier: 2 },
    ],
  },
];

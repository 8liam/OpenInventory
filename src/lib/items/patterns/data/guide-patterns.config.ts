/**
 * Seed tier lists from Steam community guides for single finishes and phases.
 * Source: https://github.com/GODrums/cs-tierlist (generated/<file>.json at commit 3156179139e4fe5e2f55784432771a48e9ecfa7d)
 * Retrieved: 2026-11-07.
 * Tiers: T1 is the most valuable. Tiers are kept while a group's cumulative seed count stays within 100 (T1 always kept); lower published tiers are omitted as not notable.
 * Seed tiers are data from the Steam community guides credited in the repository README; the repository is MIT licensed.
 * Groups with paintIndexes only apply to those paint kits (Doppler and Gamma Doppler phases).
 * Generated from the sources above by a one-off script; edit by re-running the sources, not by hand.
 */
import type { PatternTable } from "../pattern-tiers.types.ts";

export const GUIDE_PATTERN_TABLES: readonly PatternTable[] = [
  // https://steamcommunity.com/sharedfiles/filedetails/?id=2598147723 (Cyan Gamma Doppler Phase 3 Karambit) via generated/cyanbit_karambit.json
  {
    weapon: "Karambit",
    finish: "Gamma Doppler",
    groups: [
      {
        label: "Cyanbit Delta",
        paintIndexes: [571],
        tiers: [
          { seeds: [168, 481, 513, 586, 608, 762, 782, 956] },
          { seeds: [47, 73, 136, 403, 648, 664, 690, 719, 742, 749, 798, 917] },
          { seeds: [389, 399, 465, 838, 886] },
        ],
      },
      {
        label: "Cyanbit Sigma",
        paintIndexes: [571],
        tiers: [
          { seeds: [658, 740] },
          { seeds: [283, 447, 571, 601] },
          { seeds: [29, 666, 687, 898, 974] },
        ],
      },
    ],
  },
  // https://steamcommunity.com/sharedfiles/filedetails/?id=2352059734 via generated/phoenix_galil.json
  {
    weapon: "Galil AR",
    finish: "Phoenix Blacklight",
    groups: [
      { label: "2 Heads", tiers: [{ seeds: [] }, { seeds: [] }, { seeds: [] }, { seeds: [819] }] },
      {
        label: "Body",
        tiers: [
          { seeds: [289, 419, 432, 619, 729, 755, 963, 978] },
          { seeds: [58, 69, 224, 270, 406, 469, 622, 865] },
        ],
      },
      {
        label: "Grip",
        tiers: [
          { seeds: [169, 303, 475, 573, 643, 893] },
          { seeds: [73, 322, 358, 749, 798, 886] },
        ],
      },
      { label: "Text on Body", tiers: [{ seeds: [] }, { seeds: [] }, { seeds: [211, 979] }] },
      { label: "Text on Grip", tiers: [{ seeds: [] }, { seeds: [] }, { seeds: [324, 915] }] },
    ],
  },
  // https://steamcommunity.com/sharedfiles/filedetails/?id=2772035880 via generated/overprint_gloves.json
  {
    weapon: "Hand Wraps",
    finish: "Overprint",
    groups: [
      {
        label: "Arrow",
        tiers: [
          { seeds: [52, 122, 162, 307, 308, 467, 658, 891, 892] },
          { seeds: [92, 161, 183, 441, 462, 954] },
          { seeds: [37, 71, 81, 182, 237, 288, 289, 402, 463, 841, 875, 916, 952] },
        ],
      },
      {
        label: "Polygon",
        tiers: [
          { seeds: [24, 64, 341, 427, 544, 564, 611, 641, 671, 744, 806, 807, 810] },
          { seeds: [33, 133, 187, 251, 367, 602, 623, 788, 815, 919, 924, 937, 945] },
          { seeds: [148, 224, 348, 675, 789, 869, 877] },
        ],
      },
    ],
  },
  // https://steamcommunity.com/sharedfiles/filedetails/?id=3205067980 (Karambit Doppler Phase 2, paint kit 419) via generated/pink_galaxy_karambit.json
  {
    weapon: "Karambit",
    finish: "Doppler",
    groups: [
      {
        label: "Pink galaxy",
        paintIndexes: [419],
        tiers: [
          { seeds: [239, 350, 495, 565, 623, 682, 748, 987] },
          { seeds: [19, 56, 101, 192, 214, 474, 501, 505, 585, 635, 707, 877, 938, 986] },
          {
            seeds: [
              15, 35, 144, 159, 199, 200, 258, 261, 343, 355, 439, 581, 603, 618, 620, 629, 644,
              671, 741, 833, 870, 927, 964, 967, 973,
            ],
          },
        ],
      },
    ],
  },
];

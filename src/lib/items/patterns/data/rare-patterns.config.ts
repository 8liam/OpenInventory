/**
 * Other seed-sensitive finishes with a published per-pattern tier list.
 * Source: https://csgoskins.gg/blog/<guide> (URL above each table; guides published 2023-2024)
 * Retrieved: 2026-11-07.
 * Tiers: T1 is the most valuable. Tiers are kept while a group's cumulative seed count stays within 100 (T1 always kept); lower published tiers are omitted as not notable.
 * Each pattern type is its own group with its own tier numbering (a seed is listed under one type only).
 * Generated from the sources above by a one-off script; edit by re-running the sources, not by hand.
 */
import type { PatternTable } from "../pattern-tiers.types.ts";

export const RARE_PATTERN_TABLES: readonly PatternTable[] = [
  // https://csgoskins.gg/blog/awp-paw-guide-all-rare-seed-patterns
  {
    weapon: "AWP",
    finish: "PAW",
    groups: [
      {
        label: "Gold cat",
        tiers: [
          { seeds: [41, 350] },
          { seeds: [19, 35, 177, 531, 581, 624, 644, 675, 744] },
          { seeds: [138, 192, 304, 321, 368, 393, 480, 493, 565, 741, 802, 807, 895, 919, 999] },
        ],
      },
      {
        label: "Gold grenade",
        tiers: [
          { seeds: [429, 926, 954] },
          {
            seeds: [
              3, 4, 26, 38, 53, 63, 73, 78, 103, 122, 156, 158, 163, 182, 186, 216, 232, 234, 247,
              270, 279, 307, 334, 347, 411, 430, 463, 467, 575, 749, 819, 891, 917, 952, 957, 961,
            ],
          },
        ],
      },
      {
        label: "Gas mask",
        tiers: [
          { seeds: [29, 97, 685, 900] },
          { seeds: [62, 75, 120] },
          { seeds: [2, 32, 209, 291, 294, 458, 492, 566, 647, 916, 992] },
        ],
      },
      {
        label: "Gold cat knife",
        tiers: [
          { seeds: [212, 628, 737] },
          { seeds: [84, 339, 366, 472, 859, 864] },
          { seeds: [114, 319, 322, 396, 406, 509, 559, 804, 830, 977] },
        ],
      },
      { label: "Stoner cat", tiers: [{ seeds: [420, 788] }, { seeds: [187, 306] }] },
    ],
  },
  // https://csgoskins.gg/blog/pop-awp-guide-all-rare-seed-patterns
  {
    weapon: "AWP",
    finish: "POP AWP",
    groups: [
      {
        label: "Max white",
        tiers: [
          { seeds: [87, 636, 651, 910, 911] },
          { seeds: [205, 834, 856, 914] },
          { seeds: [46, 422, 712, 824, 925] },
        ],
      },
      {
        label: "Checkerboard",
        tiers: [
          { seeds: [8, 412, 457, 493, 545, 761, 780, 873, 931] },
          { seeds: [150, 448, 593, 705, 736, 909, 930, 958] },
          { seeds: [216, 337, 452, 454, 590, 966, 988] },
        ],
      },
      {
        label: "Circle",
        tiers: [
          { seeds: [81, 261, 389, 517, 566, 993] },
          { seeds: [510, 829, 837, 862] },
          { seeds: [458, 533, 654, 878] },
        ],
      },
      {
        label: "Curved rainbow",
        tiers: [
          { seeds: [403, 473, 602, 805, 809] },
          { seeds: [252, 354, 614, 656, 941, 976] },
          { seeds: [332, 372, 393, 465, 631, 971] },
        ],
      },
      {
        label: "Vertical art",
        tiers: [
          { seeds: [93, 292, 326, 341, 348, 380, 520, 763] },
          { seeds: [147, 356, 428, 521, 714, 742, 793, 832, 874] },
          { seeds: [494, 653, 664, 975] },
        ],
      },
    ],
  },
  // https://csgoskins.gg/blog/deagle-emerald-jormungandr-guide-all-serpent-seed-patterns
  {
    weapon: "Desert Eagle",
    finish: "Emerald J\u00f6rmungandr",
    groups: [
      {
        label: "Tip snake",
        tiers: [
          { seeds: [221, 222, 301, 712, 725, 808, 847, 966] },
          { seeds: [200, 452, 609, 713, 814, 947, 967, 970] },
          { seeds: [46, 618, 653, 745, 988] },
        ],
      },
      {
        label: "Grip snake",
        tiers: [
          { seeds: [239, 757] },
          { seeds: [189, 337, 457, 707, 852] },
          { seeds: [8, 54, 94, 341, 367, 408] },
        ],
      },
      {
        label: "Sticker snake",
        tiers: [
          { seeds: [21, 23, 166, 259, 772, 774, 854] },
          { seeds: [323, 526, 541, 662, 784, 890, 935] },
          { seeds: [70, 140, 172, 231, 596, 738] },
        ],
      },
      {
        label: "2 snakes",
        tiers: [
          { seeds: [351, 378, 691] },
          { seeds: [256, 564, 617, 723, 741] },
          { seeds: [393, 428, 631, 689] },
        ],
      },
      {
        label: "3 snakes",
        tiers: [
          { seeds: [150, 377, 401, 793, 822] },
          { seeds: [235, 282, 315, 380] },
          { seeds: [400, 580, 812] },
        ],
      },
      {
        label: "Back snake",
        tiers: [
          { seeds: [127, 251, 381, 525, 838, 887] },
          { seeds: [91, 125, 549, 717] },
          { seeds: [35, 273, 292, 513, 799] },
        ],
      },
      {
        label: "Hammer snake",
        tiers: [
          { seeds: [58, 467, 626] },
          { seeds: [348, 390, 954] },
          { seeds: [26, 291, 952, 957] },
        ],
      },
    ],
  },
  // https://csgoskins.gg/blog/xm1014-xoxo-guide-all-rare-seed-patterns
  {
    weapon: "XM1014",
    finish: "XOXO",
    groups: [
      {
        label: "Skull",
        tiers: [
          { seeds: [178, 579, 766] },
          { seeds: [135, 225, 547, 818, 864] },
          { seeds: [7, 307, 526, 546, 573] },
        ],
      },
      {
        label: "Mohawk",
        tiers: [{ seeds: [289, 475, 519, 737] }, { seeds: [311, 617] }, { seeds: [784, 935] }],
      },
      {
        label: "XXX",
        tiers: [
          { seeds: [31, 394, 511, 684, 814] },
          { seeds: [532, 702, 713, 791] },
          { seeds: [471, 497, 736, 798] },
        ],
      },
      {
        label: "Cyan glyph",
        tiers: [
          { seeds: [242, 398, 623, 755, 970] },
          { seeds: [244, 267, 476] },
          { seeds: [166, 171, 567, 806, 942] },
        ],
      },
      {
        label: "Pink mesh",
        tiers: [
          { seeds: [16, 51, 218, 372, 443] },
          { seeds: [220, 255, 282, 569, 977] },
          { seeds: [81, 280, 313, 711, 730] },
        ],
      },
      {
        label: "Black smiley",
        tiers: [
          { seeds: [110, 498, 549, 637] },
          { seeds: [467, 541, 645, 773] },
          { seeds: [42, 234, 316, 395, 422] },
        ],
      },
      {
        label: "Pink smiley",
        tiers: [{ seeds: [65, 326, 643] }, { seeds: [659, 833] }, { seeds: [323] }],
      },
      { label: "Burn it down", tiers: [{ seeds: [320, 369] }, { seeds: [345, 357, 822] }] },
      {
        label: "Live your life",
        tiers: [
          { seeds: [94, 301, 347, 764, 992] },
          { seeds: [19, 83, 492] },
          { seeds: [107, 111, 575, 740, 841] },
        ],
      },
      {
        label: "Yeah right",
        tiers: [{ seeds: [652, 775, 919] }, { seeds: [235, 328] }, { seeds: [99, 250] }],
      },
      {
        label: "Black sign",
        tiers: [{ seeds: [204, 330, 733] }, { seeds: [4, 593] }, { seeds: [636, 726] }],
      },
      { label: "Orange sign", tiers: [{ seeds: [522, 626] }, { seeds: [512, 654] }] },
      {
        label: "Pink & blue",
        tiers: [
          { seeds: [66, 274, 393, 606, 671] },
          { seeds: [68, 112, 142, 237] },
          { seeds: [415, 494, 975] },
        ],
      },
      {
        label: "Pink & yellow",
        tiers: [
          { seeds: [1, 618, 873, 915] },
          { seeds: [34, 61, 401, 763, 781] },
          { seeds: [160, 306, 801, 820, 885] },
        ],
      },
    ],
  },
  // https://csgoskins.gg/blog/crimson-kimono-gloves-guide-all-rare-seed-patterns
  {
    weapon: "Specialist Gloves",
    finish: "Crimson Kimono",
    groups: [
      {
        label: "Max red",
        tiers: [
          { seeds: [458, 515, 559, 560, 684, 692, 699, 932] },
          {
            seeds: [
              6, 79, 80, 115, 208, 215, 241, 290, 330, 385, 402, 491, 498, 698, 721, 753, 841, 842,
              866, 958, 968,
            ],
          },
          {
            seeds: [
              26, 37, 52, 81, 91, 92, 102, 129, 130, 147, 152, 155, 182, 183, 184, 205, 209, 224,
              232, 233, 285, 305, 317, 329, 357, 394, 447, 467, 497, 516, 576, 587, 591, 592, 655,
              656, 679, 731, 875, 881, 891, 892, 916, 930, 931, 952, 953, 954, 957, 973,
            ],
          },
        ],
      },
    ],
  },
];

/**
 * Crimson Web and Emerald Web tiers. Single, double and triple web are separate groups with their own tiers.
 * Source: https://github.com/GODrums/cs-tierlist (generated/<file>.json at commit 3156179139e4fe5e2f55784432771a48e9ecfa7d)
 * Retrieved: 2026-11-07.
 * Tiers: T1 is the most valuable. Tiers are kept while a group's cumulative seed count stays within 100 (T1 always kept); lower published tiers are omitted as not notable.
 * Seed tiers are data from the Steam community guides credited in the repository README; the repository is MIT licensed.
 * Generated from the sources above by a one-off script; edit by re-running the sources, not by hand.
 */
import type { PatternTable } from "../pattern-tiers.types.ts";

export const WEB_TABLES: readonly PatternTable[] = [
  // https://steamcommunity.com/sharedfiles/filedetails/?id=2973876979 via generated/crimson_web_m9.json
  {
    weapon: "M9 Bayonet",
    finish: "Crimson Web",
    groups: [
      {
        label: "Double Web",
        tiers: [
          {
            seeds: [
              16, 146, 173, 180, 241, 268, 344, 381, 393, 420, 575, 602, 611, 697, 704, 778, 853,
              858, 937, 972, 994,
            ],
          },
        ],
      },
      {
        label: "Single Web",
        tiers: [
          {
            seeds: [
              8, 53, 138, 150, 167, 188, 224, 256, 281, 325, 378, 396, 405, 453, 489, 518, 528, 531,
              604, 614, 642, 658, 667, 687, 701, 709, 716, 717, 723, 745, 755, 773, 800, 808, 826,
              832, 872, 879, 931, 938, 952, 953, 955, 958,
            ],
          },
        ],
      },
      {
        label: "Triple Web",
        tiers: [
          { seeds: [13, 72, 133, 145, 297, 441, 459, 469, 718, 756, 857] },
          { seeds: [38, 181, 260, 349, 490, 525, 590, 725, 759, 785, 962] },
          {
            seeds: [
              39, 51, 64, 77, 85, 90, 121, 153, 156, 229, 231, 329, 371, 488, 516, 533, 553, 609,
              638, 665, 797, 861, 870,
            ],
          },
        ],
      },
    ],
  },
  // https://steamcommunity.com/sharedfiles/filedetails/?id=2980565820 via generated/crimson_web_karambit.json
  {
    weapon: "Karambit",
    finish: "Crimson Web",
    groups: [
      {
        label: "Double Web",
        tiers: [{ seeds: [76, 103, 171, 441, 608, 640, 676, 722, 725, 726, 930, 960] }],
      },
      {
        label: "Single Web",
        tiers: [
          {
            seeds: [
              10, 21, 59, 60, 86, 92, 112, 148, 162, 172, 189, 235, 251, 257, 309, 310, 324, 334,
              335, 340, 377, 382, 390, 391, 411, 417, 453, 460, 461, 515, 526, 532, 571, 591, 629,
              689, 692, 779, 786, 796, 803, 813, 842, 846, 904, 911, 958, 964, 977, 983,
            ],
          },
        ],
      },
    ],
  },
  // https://steamcommunity.com/sharedfiles/filedetails/?id=2976420129 via generated/crimson_web_nomad.json
  {
    weapon: "Nomad Knife",
    finish: "Crimson Web",
    groups: [
      {
        label: "Double Web",
        tiers: [
          { seeds: [178, 209, 286, 613, 831] },
          { seeds: [91, 235, 245, 257, 360, 461, 565, 852, 969] },
          { seeds: [12, 70, 155, 358, 482, 635, 700, 770, 838] },
        ],
      },
      {
        label: "Single Web",
        tiers: [
          {
            seeds: [
              16, 27, 29, 30, 44, 59, 98, 118, 128, 134, 143, 159, 161, 200, 201, 211, 214, 227,
              237, 273, 274, 276, 282, 337, 342, 353, 377, 379, 389, 404, 406, 413, 431, 440, 443,
              451, 454, 471, 491, 494, 499, 503, 538, 579, 586, 604, 611, 619, 629, 642, 648, 655,
              691, 717, 741, 747, 755, 776, 816, 825, 828, 832, 918, 922, 937, 954, 963, 981, 993,
              994,
            ],
          },
        ],
      },
    ],
  },
  // https://steamcommunity.com/sharedfiles/filedetails/?id=2818147579 via generated/crimson_web_gloves.json
  {
    weapon: "Specialist Gloves",
    finish: "Crimson Web",
    groups: [
      {
        label: "Double Web",
        tiers: [
          { seeds: [89, 323, 330, 774] },
          { seeds: [208, 398, 559, 656, 722, 800, 866, 922, 936, 965] },
          { seeds: [344, 369, 420, 466, 573, 695, 735, 745, 813] },
        ],
      },
      {
        label: "Left Hand",
        tiers: [
          {
            seeds: [
              2, 128, 197, 198, 204, 233, 275, 504, 508, 561, 610, 718, 753, 829, 882, 940, 996,
            ],
          },
          { seeds: [37, 113, 133, 196, 263, 311, 532, 587, 615, 721, 732, 754, 788, 860, 979] },
          {
            seeds: [
              21, 23, 109, 194, 310, 459, 479, 614, 655, 689, 734, 743, 837, 906, 912, 913, 927,
              933, 972,
            ],
          },
        ],
      },
      {
        label: "Right Hand",
        tiers: [
          { seeds: [73, 107, 115, 123, 130, 216, 313, 356, 411, 454, 691, 820, 958] },
          { seeds: [138, 209, 250, 252, 279, 581, 651, 698, 730, 826, 907, 959] },
          {
            seeds: [
              44, 90, 98, 145, 166, 189, 335, 409, 416, 447, 529, 575, 605, 699, 749, 904, 920, 945,
              988,
            ],
          },
        ],
      },
      {
        label: "Triple Web",
        tiers: [{ seeds: [202, 534, 563, 626, 789, 869, 914] }, { seeds: [916, 980] }],
      },
    ],
  },
  // https://steamcommunity.com/sharedfiles/filedetails/?id=2817501759 via generated/emerald_web_gloves.json
  {
    weapon: "Specialist Gloves",
    finish: "Emerald Web",
    groups: [
      {
        label: "Double Web",
        tiers: [
          { seeds: [89, 323, 330, 774] },
          { seeds: [208, 398, 559, 656, 722, 800, 866, 922, 965] },
          { seeds: [344, 420, 466, 573, 695, 735, 745] },
        ],
      },
      {
        label: "Left Hand",
        tiers: [
          {
            seeds: [
              2, 128, 197, 198, 204, 233, 275, 504, 508, 561, 610, 718, 753, 829, 882, 940, 996,
            ],
          },
          { seeds: [37, 113, 133, 196, 263, 311, 532, 587, 615, 721, 732, 754, 788, 860, 979] },
          {
            seeds: [
              21, 23, 109, 194, 310, 459, 479, 614, 655, 689, 734, 743, 837, 906, 912, 913, 927,
              933, 972,
            ],
          },
        ],
      },
      {
        label: "Right Hand",
        tiers: [
          { seeds: [73, 107, 115, 123, 130, 216, 313, 356, 411, 454, 691, 820, 958] },
          { seeds: [138, 209, 250, 252, 279, 369, 581, 651, 698, 730, 826, 907, 959] },
          {
            seeds: [
              44, 90, 98, 145, 166, 189, 335, 409, 416, 447, 529, 575, 605, 699, 749, 904, 920, 945,
              988,
            ],
          },
        ],
      },
      {
        label: "Triple Web",
        tiers: [{ seeds: [202, 534, 563, 626, 789, 869, 914] }, { seeds: [916, 980] }],
      },
    ],
  },
];

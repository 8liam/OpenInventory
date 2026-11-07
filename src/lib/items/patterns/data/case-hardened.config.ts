/**
 * Case Hardened blue gem tiers per weapon (same seed ranks differently per weapon).
 * Source: https://csgoskins.gg/blog/<weapon>-case-hardened-blue-gem-seed-patterns (one article per weapon, URL above each table; articles published 2023-2024)
 * Retrieved: 2026-11-07.
 * Tiers: T1 is the most valuable. Tiers are kept while a group's cumulative seed count stays within 100 (T1 always kept); lower published tiers are omitted as not notable.
 * The source's T4 (blue-tinted) tier is omitted for every weapon by that rule.
 * Generated once from the sources above (script not committed). Extend by hand: keep tiers in source order and update the Source and Retrieved lines.
 */
import type { PatternTable } from "../pattern-tiers.types.ts";

export const CASE_HARDENED_TABLES: readonly PatternTable[] = [
  // https://csgoskins.gg/blog/ak-47-case-hardened-blue-gem-seed-patterns
  {
    weapon: "AK-47",
    finish: "Case Hardened",
    groups: [
      {
        label: "Blue gem",
        tiers: [
          { seeds: [151, 179, 321, 387, 661, 670, 955] },
          { seeds: [4, 13, 168, 429, 592, 905] },
          {
            seeds: [
              11, 74, 82, 92, 103, 112, 139, 147, 172, 189, 228, 236, 278, 310, 322, 363, 375, 426,
              430, 434, 442, 450, 463, 497, 512, 555, 690, 695, 698, 708, 711, 713, 721, 733, 750,
              760, 782, 791, 823, 828, 844, 849, 862, 868, 887, 917, 950, 961, 969, 978, 996,
            ],
          },
        ],
      },
    ],
  },
  // https://csgoskins.gg/blog/bayonet-case-hardened-blue-gem-seed-patterns
  {
    weapon: "Bayonet",
    finish: "Case Hardened",
    groups: [
      {
        label: "Blue gem",
        tiers: [
          { seeds: [151, 179, 555, 592, 670] },
          { seeds: [168, 209, 228, 321, 387, 661, 695, 828, 955, 969] },
          {
            seeds: [
              4, 13, 82, 103, 112, 137, 202, 281, 325, 363, 430, 493, 512, 532, 537, 617, 678, 710,
              715, 733, 750, 760, 790, 791, 797, 823, 844, 868, 872, 887, 894, 905, 922, 996,
            ],
          },
        ],
      },
    ],
  },
  // https://csgoskins.gg/blog/bowie-knife-case-hardened-blue-gem-seed-patterns
  {
    weapon: "Bowie Knife",
    finish: "Case Hardened",
    groups: [
      {
        label: "Blue gem",
        tiers: [
          { seeds: [182, 398] },
          { seeds: [29, 214, 358, 371, 638, 652, 838] },
          {
            seeds: [
              74, 147, 208, 256, 282, 283, 330, 335, 407, 457, 494, 499, 598, 629, 713, 720, 721,
              749, 768, 782, 839, 858, 868, 885, 891, 902, 913, 917, 919, 928, 964, 965, 989,
            ],
          },
        ],
      },
    ],
  },
  // https://csgoskins.gg/blog/butterfly-knife-case-hardened-blue-gem-seed-patterns
  {
    weapon: "Butterfly Knife",
    finish: "Case Hardened",
    groups: [
      {
        label: "Blue gem",
        tiers: [
          { seeds: [29, 182, 398, 494, 652, 838] },
          { seeds: [73, 147, 214, 283, 330, 371, 638, 721, 749, 839, 868, 881, 891, 917, 919] },
          {
            seeds: [
              61, 74, 92, 108, 112, 130, 194, 248, 256, 282, 306, 335, 358, 407, 411, 424, 457, 458,
              488, 499, 510, 522, 618, 629, 664, 694, 702, 703, 713, 720, 776, 782, 798, 803, 809,
              811, 853, 858, 902, 913, 924, 928, 964, 965,
            ],
          },
        ],
      },
    ],
  },
  // https://csgoskins.gg/blog/classic-knife-case-hardened-blue-gem-seed-patterns
  {
    weapon: "Classic Knife",
    finish: "Case Hardened",
    groups: [
      {
        label: "Blue gem",
        tiers: [
          { seeds: [58, 169, 316, 403, 456, 577, 601, 681] },
          { seeds: [55, 210, 281, 351, 449, 585, 634, 704, 922] },
          {
            seeds: [
              67, 103, 107, 116, 157, 162, 166, 170, 180, 187, 202, 239, 262, 269, 288, 336, 345,
              349, 372, 374, 383, 393, 417, 430, 447, 496, 503, 529, 533, 537, 556, 583, 588, 624,
              628, 632, 668, 715, 797, 837, 850, 867, 880, 887, 915, 916, 954,
            ],
          },
        ],
      },
    ],
  },
  // https://csgoskins.gg/blog/falchion-knife-case-hardened-blue-gem-seed-patterns
  {
    weapon: "Falchion Knife",
    finish: "Case Hardened",
    groups: [
      {
        label: "Blue gem",
        tiers: [
          { seeds: [112, 130, 182, 283, 371, 398, 494, 638, 749, 838, 868, 891, 917] },
          {
            seeds: [
              38, 61, 73, 116, 194, 214, 282, 330, 335, 488, 510, 522, 547, 575, 630, 631, 652, 664,
              694, 721, 770, 798, 803, 809, 841, 881, 885, 902, 919, 964, 989,
            ],
          },
          {
            seeds: [
              29, 42, 74, 92, 256, 262, 269, 273, 322, 334, 375, 407, 411, 414, 426, 453, 499, 528,
              598, 618, 642, 702, 713, 717, 768, 776, 808, 811, 823, 839, 844, 846, 853, 854, 858,
              893, 905, 913, 916, 924, 928, 965,
            ],
          },
        ],
      },
    ],
  },
  // https://csgoskins.gg/blog/five-seven-case-hardened-blue-gem-seed-patterns
  {
    weapon: "Five-SeveN",
    finish: "Case Hardened",
    groups: [
      {
        label: "Blue gem",
        tiers: [
          { seeds: [278, 363, 670, 690, 768, 868] },
          {
            seeds: [
              13, 103, 126, 151, 273, 321, 344, 387, 396, 434, 468, 555, 557, 592, 661, 770, 823,
              844, 872, 879, 905, 927, 955,
            ],
          },
          {
            seeds: [
              4, 14, 61, 112, 168, 174, 179, 180, 187, 189, 215, 262, 325, 333, 381, 383, 413, 414,
              426, 428, 429, 430, 447, 456, 497, 512, 526, 532, 577, 627, 628, 632, 648, 685, 689,
              700, 715, 724, 750, 791, 795, 809, 828, 849, 862, 874, 887, 888, 902, 922, 935, 948,
              969, 985,
            ],
          },
        ],
      },
    ],
  },
  // https://csgoskins.gg/blog/flip-knife-case-hardened-blue-gem-seed-patterns
  {
    weapon: "Flip Knife",
    finish: "Case Hardened",
    groups: [
      {
        label: "Blue gem",
        tiers: [
          { seeds: [151, 321, 555, 592, 661, 670] },
          { seeds: [103, 168, 179, 363, 387, 750, 760, 823, 828, 844, 868, 955, 969] },
          {
            seeds: [
              4, 13, 28, 112, 137, 169, 189, 209, 228, 278, 325, 429, 430, 456, 479, 526, 532, 577,
              628, 681, 689, 690, 695, 715, 733, 768, 770, 791, 872, 878, 879, 887, 905, 922, 961,
              996,
            ],
          },
        ],
      },
    ],
  },
  // https://csgoskins.gg/blog/gut-knife-case-hardened-blue-gem-seed-patterns
  {
    weapon: "Gut Knife",
    finish: "Case Hardened",
    groups: [
      {
        label: "Blue gem",
        tiers: [
          { seeds: [60, 125, 567, 962] },
          {
            seeds: [
              140, 165, 171, 215, 232, 384, 591, 644, 723, 724, 756, 799, 870, 939, 974, 977, 997,
            ],
          },
          {
            seeds: [
              40, 50, 66, 86, 175, 218, 245, 350, 388, 477, 540, 552, 662, 691, 729, 730, 785, 806,
              836, 953, 971,
            ],
          },
          {
            seeds: [
              9, 37, 45, 53, 81, 92, 167, 193, 213, 272, 286, 294, 342, 417, 420, 426, 435, 466,
              476, 514, 525, 539, 584, 619, 647, 743, 759, 766, 808, 826, 829, 832, 875, 890, 906,
              920, 965, 979, 998,
            ],
          },
        ],
      },
    ],
  },
  // https://csgoskins.gg/blog/huntsman-knife-case-hardened-blue-gem-seed-patterns
  {
    weapon: "Huntsman Knife",
    finish: "Case Hardened",
    groups: [
      {
        label: "Blue gem",
        tiers: [
          { seeds: [29, 618, 652, 721] },
          {
            seeds: [
              112, 130, 248, 283, 306, 371, 494, 505, 575, 576, 638, 702, 770, 798, 838, 881, 891,
              917,
            ],
          },
          {
            seeds: [
              34, 56, 61, 72, 73, 108, 147, 153, 182, 255, 330, 428, 458, 488, 497, 510, 609, 629,
              631, 703, 707, 741, 749, 839, 844, 858, 867, 868, 919, 927,
            ],
          },
        ],
      },
    ],
  },
  // https://csgoskins.gg/blog/karambit-case-hardened-blue-gem-seed-patterns
  {
    weapon: "Karambit",
    finish: "Case Hardened",
    groups: [
      {
        label: "Blue gem",
        tiers: [
          { seeds: [73, 269, 321, 387, 442, 507, 776, 853, 902, 955] },
          {
            seeds: [
              4, 74, 82, 130, 179, 182, 273, 282, 341, 375, 377, 453, 470, 494, 510, 541, 661, 664,
              670, 698, 713, 721, 798, 809, 823, 828, 838, 868, 891, 905, 917,
            ],
          },
          {
            seeds: [
              11, 20, 30, 34, 92, 112, 139, 202, 236, 256, 262, 283, 306, 310, 322, 330, 371, 398,
              407, 420, 429, 463, 515, 522, 555, 575, 580, 598, 631, 632, 638, 711, 770, 782, 803,
              811, 841, 844, 856, 888, 914, 916, 919, 965, 989,
            ],
          },
        ],
      },
    ],
  },
  // https://csgoskins.gg/blog/kukri-knife-case-hardened-blue-gem-seed-patterns
  {
    weapon: "Kukri Knife",
    finish: "Case Hardened",
    groups: [
      {
        label: "Blue gem",
        tiers: [
          { seeds: [112, 494, 575, 618, 652, 770, 838, 844, 868, 891, 917] },
          {
            seeds: [
              38, 61, 130, 182, 283, 330, 371, 468, 510, 629, 631, 638, 664, 702, 721, 798, 841,
              881,
            ],
          },
          {
            seeds: [
              14, 29, 34, 73, 74, 92, 116, 194, 248, 256, 262, 273, 282, 306, 334, 335, 347, 375,
              398, 411, 414, 426, 442, 453, 488, 499, 505, 522, 528, 547, 576, 612, 630, 643, 657,
              694, 698, 708, 711, 713, 749, 768, 776, 788, 808, 809, 811, 823, 853, 854, 858, 883,
              885, 902, 916, 919, 961, 985, 989,
            ],
          },
        ],
      },
    ],
  },
  // https://csgoskins.gg/blog/m9-bayonet-case-hardened-blue-gem-seed-patterns
  {
    weapon: "M9 Bayonet",
    finish: "Case Hardened",
    groups: [
      {
        label: "Blue gem",
        tiers: [
          { seeds: [417, 601] },
          { seeds: [58, 349, 403, 406, 503, 523] },
          {
            seeds: [
              59, 107, 113, 150, 202, 224, 239, 281, 345, 346, 430, 449, 585, 610, 698, 715, 750,
              837, 897, 915, 959,
            ],
          },
        ],
      },
    ],
  },
  // https://csgoskins.gg/blog/mac-10-case-hardened-blue-gem-seed-patterns
  {
    weapon: "MAC-10",
    finish: "Case Hardened",
    groups: [
      {
        label: "Blue gem",
        tiers: [
          { seeds: [18, 95, 114, 222, 239, 315, 406, 546, 587, 667, 898] },
          {
            seeds: [
              6, 29, 80, 144, 147, 182, 195, 199, 251, 285, 292, 311, 328, 345, 358, 379, 381, 400,
              414, 475, 503, 570, 598, 629, 652, 788, 807, 885, 889, 899, 924, 959, 964, 972,
            ],
          },
        ],
      },
    ],
  },
  // https://csgoskins.gg/blog/navaja-knife-case-hardened-blue-gem-seed-patterns
  {
    weapon: "Navaja Knife",
    finish: "Case Hardened",
    groups: [
      {
        label: "Blue gem",
        tiers: [
          { seeds: [74, 182, 273, 371, 398, 401, 407, 638, 713, 720, 749, 838, 839, 919] },
          {
            seeds: [
              30, 139, 282, 283, 321, 322, 332, 335, 358, 420, 424, 453, 463, 515, 598, 632, 635,
              773, 782, 797, 798, 809, 811, 877, 891, 902, 913, 917, 928, 965, 975, 989,
            ],
          },
          {
            seeds: [
              29, 67, 73, 92, 136, 185, 194, 214, 256, 265, 269, 284, 330, 341, 377, 387, 418, 460,
              466, 490, 494, 499, 507, 510, 522, 615, 630, 642, 655, 664, 694, 727, 776, 793, 808,
              846, 847, 853, 868, 884, 889, 905, 942, 974,
            ],
          },
        ],
      },
    ],
  },
  // https://csgoskins.gg/blog/nomad-knife-case-hardened-blue-gem-seed-patterns
  {
    weapon: "Nomad Knife",
    finish: "Case Hardened",
    groups: [
      {
        label: "Blue gem",
        tiers: [
          { seeds: [55, 169, 187, 316, 403, 447, 456, 577, 628, 681, 704, 850, 922] },
          {
            seeds: [
              13, 14, 166, 180, 210, 262, 281, 336, 351, 383, 429, 442, 496, 529, 556, 583, 588,
              634, 668, 698, 700, 797, 872, 880, 916,
            ],
          },
          {
            seeds: [
              10, 58, 67, 91, 103, 151, 168, 170, 179, 202, 212, 227, 235, 239, 286, 294, 325, 345,
              363, 372, 387, 393, 449, 516, 525, 533, 547, 558, 585, 624, 632, 640, 648, 719, 723,
              750, 776, 818, 828, 853, 879, 887, 902, 915, 935, 954, 955,
            ],
          },
        ],
      },
    ],
  },
  // https://csgoskins.gg/blog/paracord-knife-case-hardened-blue-gem-seed-patterns
  {
    weapon: "Paracord Knife",
    finish: "Case Hardened",
    groups: [
      {
        label: "Blue gem",
        tiers: [
          { seeds: [58, 169, 316, 403, 456, 577, 681] },
          { seeds: [55, 180, 239, 281, 345, 351, 447, 449, 583, 585, 601, 634, 668, 704, 922] },
          {
            seeds: [
              67, 88, 103, 116, 157, 166, 170, 176, 187, 202, 210, 262, 269, 288, 336, 349, 372,
              374, 383, 417, 430, 496, 503, 507, 525, 529, 533, 556, 588, 628, 632, 669, 797, 812,
              837, 850, 880, 887, 899, 915, 916, 954, 959,
            ],
          },
        ],
      },
    ],
  },
  // https://csgoskins.gg/blog/shadow-daggers-case-hardened-blue-gem-seed-patterns
  {
    weapon: "Shadow Daggers",
    finish: "Case Hardened",
    groups: [
      {
        label: "Blue gem",
        tiers: [
          { seeds: [56, 417, 505, 609, 866] },
          { seeds: [176, 576, 657, 707, 771, 830] },
          { seeds: [602] },
          { seeds: [346, 367, 570, 706, 933] },
        ],
      },
    ],
  },
  // https://csgoskins.gg/blog/skeleton-knife-case-hardened-blue-gem-seed-patterns
  {
    weapon: "Skeleton Knife",
    finish: "Case Hardened",
    groups: [
      {
        label: "Blue gem",
        tiers: [
          { seeds: [58, 169, 316, 403, 456, 577, 681] },
          {
            seeds: [55, 180, 210, 262, 281, 345, 351, 447, 449, 556, 583, 668, 704, 850, 880, 922],
          },
          {
            seeds: [
              14, 67, 103, 116, 157, 166, 170, 187, 202, 239, 294, 336, 372, 383, 429, 442, 496,
              503, 516, 525, 529, 533, 547, 585, 588, 601, 624, 628, 632, 634, 698, 700, 797, 837,
              915, 916, 954,
            ],
          },
        ],
      },
    ],
  },
  // https://csgoskins.gg/blog/stiletto-knife-case-hardened-blue-gem-seed-patterns
  {
    weapon: "Stiletto Knife",
    finish: "Case Hardened",
    groups: [
      {
        label: "Blue gem",
        tiers: [
          { seeds: [182, 494, 713] },
          {
            seeds: [
              74, 92, 112, 139, 321, 322, 398, 407, 453, 664, 721, 798, 838, 868, 891, 905, 917,
              965,
            ],
          },
          {
            seeds: [
              11, 29, 73, 82, 130, 147, 194, 208, 214, 242, 244, 248, 256, 269, 273, 278, 282, 283,
              330, 332, 335, 341, 358, 371, 375, 387, 420, 442, 463, 470, 507, 510, 522, 632, 638,
              670, 694, 720, 749, 770, 776, 782, 788, 803, 809, 811, 839, 842, 846, 853, 913, 919,
              928, 964,
            ],
          },
        ],
      },
    ],
  },
  // https://csgoskins.gg/blog/survival-knife-case-hardened-blue-gem-seed-patterns
  {
    weapon: "Survival Knife",
    finish: "Case Hardened",
    groups: [
      {
        label: "Blue gem",
        tiers: [
          { seeds: [58, 169, 281, 316, 403, 456, 577, 681, 704] },
          {
            seeds: [55, 180, 210, 351, 447, 449, 556, 583, 585, 601, 628, 634, 668, 850, 880, 922],
          },
          {
            seeds: [
              67, 103, 157, 162, 166, 170, 179, 187, 202, 239, 262, 286, 288, 336, 345, 349, 372,
              383, 387, 393, 429, 430, 496, 516, 529, 533, 588, 624, 632, 698, 700, 797, 812, 837,
              867, 872, 887, 915, 916, 954,
            ],
          },
        ],
      },
    ],
  },
  // https://csgoskins.gg/blog/talon-knife-case-hardened-blue-gem-seed-patterns
  {
    weapon: "Talon Knife",
    finish: "Case Hardened",
    groups: [
      {
        label: "Blue gem",
        tiers: [
          { seeds: [10, 55, 180, 222, 241, 316, 528, 602, 837, 899, 923] },
          {
            seeds: [
              3, 14, 56, 80, 114, 116, 170, 176, 185, 199, 283, 299, 311, 345, 351, 357, 365, 379,
              468, 501, 506, 570, 576, 583, 609, 657, 707, 805, 807, 819, 866,
            ],
          },
          {
            seeds: [
              18, 19, 46, 58, 95, 111, 130, 137, 186, 203, 291, 328, 367, 374, 456, 473, 488, 491,
              505, 516, 533, 599, 621, 658, 660, 669, 693, 749, 761, 798, 815, 830, 873, 883, 891,
              941, 960, 976,
            ],
          },
        ],
      },
    ],
  },
  // https://csgoskins.gg/blog/ursus-knife-case-hardened-blue-gem-seed-patterns
  {
    weapon: "Ursus Knife",
    finish: "Case Hardened",
    groups: [
      {
        label: "Blue gem",
        tiers: [
          { seeds: [112, 494, 575, 618, 652, 770] },
          {
            seeds: [130, 283, 330, 371, 468, 510, 629, 702, 721, 798, 838, 844, 868, 881, 891, 917],
          },
          {
            seeds: [
              14, 38, 56, 61, 73, 108, 116, 182, 188, 248, 256, 282, 306, 334, 347, 375, 411, 414,
              426, 442, 488, 497, 505, 522, 528, 547, 576, 612, 630, 631, 638, 643, 657, 658, 664,
              694, 749, 776, 808, 811, 823, 841, 853, 854, 858, 883, 902, 916, 919, 961, 985, 989,
            ],
          },
        ],
      },
    ],
  },
];

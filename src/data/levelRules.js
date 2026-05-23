export const CAMPAIGN_MAX_LEVEL = 100;
export const FIRST_GENERATED_LEVEL = 6;

export const LEVEL_BOUNDS = {
  left: 40,
  right: 920,
  top: 56,
  bottom: 420,
};

export const LEVEL_LAYOUT_PATTERNS = {
  columns: {
    id: "columns",
    name: "Sentinel Columns",
    visualVariant: "cyan_ruins",
  },
  fortress: {
    id: "fortress",
    name: "Moss Fortress",
    visualVariant: "moss_depths",
  },
  gaps: {
    id: "gaps",
    name: "Broken Causeway",
    visualVariant: "sunlit_stone",
  },
  chevrons: {
    id: "chevrons",
    name: "Chevron Garden",
    visualVariant: "cyan_ruins",
  },
  gauntlet: {
    id: "gauntlet",
    name: "Mossback Gate",
    visualVariant: "moss_depths",
  },
  arc: {
    id: "arc",
    name: "Arcway",
    visualVariant: "ember_glow",
  },
  split: {
    id: "split",
    name: "Split Approach",
    visualVariant: "frost_haze",
  },
  spiral: {
    id: "spiral",
    name: "Spiral Gate",
    visualVariant: "storm_charge",
  },
  lattice: {
    id: "lattice",
    name: "Lattice",
    visualVariant: "crystal_glow",
  },
};

export const GENERATED_LEVEL_SEQUENCE = {
  6: LEVEL_LAYOUT_PATTERNS.columns,
  7: LEVEL_LAYOUT_PATTERNS.fortress,
  8: LEVEL_LAYOUT_PATTERNS.gaps,
  9: LEVEL_LAYOUT_PATTERNS.chevrons,
  10: LEVEL_LAYOUT_PATTERNS.gauntlet,
};

export const GENERATED_PATTERN_SEQUENCE = [
  LEVEL_LAYOUT_PATTERNS.columns,
  LEVEL_LAYOUT_PATTERNS.gaps,
  LEVEL_LAYOUT_PATTERNS.chevrons,
  LEVEL_LAYOUT_PATTERNS.fortress,
  LEVEL_LAYOUT_PATTERNS.arc,
  LEVEL_LAYOUT_PATTERNS.split,
  LEVEL_LAYOUT_PATTERNS.lattice,
  LEVEL_LAYOUT_PATTERNS.spiral,
  LEVEL_LAYOUT_PATTERNS.gauntlet,
];

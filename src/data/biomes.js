export const BIOMES = {
  grasslands_training_ruins: {
    id: "grasslands_training_ruins",
    name: "Grasslands / Training Ruins",
    levelStart: 1,
    levelEnd: 10,
    backgroundAsset: "bg_grasslands_training_ruins_arena",
    brickHpMultiplier: 1,
    armorBonus: 0,
    palette: {
      primary: "#61d7c6",
      secondary: "#e6c15b",
      brick: "#7f936e",
      particle: "#dff1a4",
    },
    backgroundVariants: {
      default: {
        colors: ["#10231d", "#283f28", "#143a38"],
        grid: "rgba(218, 232, 184, 0.08)",
      },
      sunlit_stone: {
        colors: ["#17251d", "#3f4524", "#1d3c36"],
        grid: "rgba(230, 193, 91, 0.1)",
      },
      cyan_ruins: {
        colors: ["#0e2422", "#214331", "#123e43"],
        grid: "rgba(97, 215, 198, 0.1)",
      },
      moss_depths: {
        colors: ["#0c1d17", "#263b20", "#102f2b"],
        grid: "rgba(205, 224, 150, 0.09)",
      },
    },
  },
  ember_caverns: {
    id: "ember_caverns",
    name: "Ember Caverns",
    levelStart: 11,
    levelEnd: 20,
    backgroundAsset: "bg_ember_caverns_arena",
    brickHpMultiplier: 1.03,
    armorBonus: 0,
    palette: {
      primary: "#ff8a4c",
      secondary: "#ffd36b",
      brick: "#8f5546",
      particle: "#ffc15c",
    },
    backgroundVariants: {
      default: {
        colors: ["#241313", "#4d2418", "#1d1a19"],
        grid: "rgba(255, 138, 76, 0.1)",
      },
      ember_glow: {
        colors: ["#301411", "#69301c", "#211916"],
        grid: "rgba(255, 211, 107, 0.12)",
      },
      gauntlet: {
        colors: ["#1f1112", "#51251a", "#2b1713"],
        grid: "rgba(255, 102, 61, 0.12)",
      },
    },
  },
  frozen_spires: {
    id: "frozen_spires",
    name: "Frozen Spires",
    levelStart: 21,
    levelEnd: 30,
    backgroundAsset: "bg_frozen_spires_arena",
    brickHpMultiplier: 1.06,
    armorBonus: 0,
    palette: {
      primary: "#86d7ff",
      secondary: "#f4fbff",
      brick: "#6f8ba0",
      particle: "#d8f4ff",
    },
    backgroundVariants: {
      default: {
        colors: ["#0d1d24", "#1f3d4c", "#201b36"],
        grid: "rgba(134, 215, 255, 0.12)",
      },
      frost_haze: {
        colors: ["#11222c", "#30516a", "#211f42"],
        grid: "rgba(244, 251, 255, 0.11)",
      },
    },
  },
  toxic_marsh: {
    id: "toxic_marsh",
    name: "Toxic Marsh",
    levelStart: 31,
    levelEnd: 40,
    backgroundAsset: "bg_toxic_marsh_arena",
    brickHpMultiplier: 1.08,
    armorBonus: 1,
    palette: {
      primary: "#b8f25f",
      secondary: "#b36df0",
      brick: "#627b43",
      particle: "#d4ff6a",
    },
    backgroundVariants: {
      default: {
        colors: ["#101b13", "#253a1d", "#261532"],
        grid: "rgba(184, 242, 95, 0.1)",
      },
    },
  },
  storm_citadel: {
    id: "storm_citadel",
    name: "Storm Citadel",
    levelStart: 41,
    levelEnd: 50,
    backgroundAsset: "bg_storm_citadel_arena",
    brickHpMultiplier: 1.1,
    armorBonus: 1,
    palette: {
      primary: "#5fd8ff",
      secondary: "#fff17a",
      brick: "#66768f",
      particle: "#c8f2ff",
    },
    backgroundVariants: {
      default: {
        colors: ["#101822", "#24395a", "#171625"],
        grid: "rgba(95, 216, 255, 0.12)",
      },
      storm_charge: {
        colors: ["#0c1722", "#1f4470", "#1b1d33"],
        grid: "rgba(255, 241, 122, 0.1)",
      },
    },
  },
  crystal_mines: {
    id: "crystal_mines",
    name: "Crystal Mines",
    levelStart: 51,
    levelEnd: 60,
    backgroundAsset: "bg_crystal_mines_arena",
    brickHpMultiplier: 1.12,
    armorBonus: 1,
    palette: {
      primary: "#73f0ff",
      secondary: "#ff7de8",
      brick: "#675f91",
      particle: "#f0f7ff",
    },
    backgroundVariants: {
      default: {
        colors: ["#12172b", "#273261", "#2b1641"],
        grid: "rgba(115, 240, 255, 0.11)",
      },
      crystal_glow: {
        colors: ["#14172d", "#1f4561", "#3c174d"],
        grid: "rgba(255, 125, 232, 0.1)",
      },
    },
  },
  haunted_foundry: {
    id: "haunted_foundry",
    name: "Haunted Foundry",
    levelStart: 61,
    levelEnd: 70,
    backgroundAsset: "bg_haunted_foundry_arena",
    brickHpMultiplier: 1.14,
    armorBonus: 2,
    palette: {
      primary: "#9df080",
      secondary: "#b88cff",
      brick: "#6e5d4d",
      particle: "#c9ffb8",
    },
    backgroundVariants: {
      default: {
        colors: ["#151815", "#3a2b22", "#231833"],
        grid: "rgba(157, 240, 128, 0.09)",
      },
    },
  },
  solar_desert: {
    id: "solar_desert",
    name: "Solar Desert",
    levelStart: 71,
    levelEnd: 80,
    backgroundAsset: "bg_solar_desert_arena",
    brickHpMultiplier: 1.16,
    armorBonus: 2,
    palette: {
      primary: "#ffd66e",
      secondary: "#68d8cf",
      brick: "#a3814f",
      particle: "#fff0a8",
    },
    backgroundVariants: {
      default: {
        colors: ["#251b11", "#5b4220", "#163d3d"],
        grid: "rgba(255, 214, 110, 0.1)",
      },
    },
  },
  void_laboratory: {
    id: "void_laboratory",
    name: "Void Laboratory",
    levelStart: 81,
    levelEnd: 90,
    backgroundAsset: "bg_void_laboratory_arena",
    brickHpMultiplier: 1.18,
    armorBonus: 2,
    palette: {
      primary: "#ff6ef0",
      secondary: "#9f8cff",
      brick: "#534a74",
      particle: "#ffd8fb",
    },
    backgroundVariants: {
      default: {
        colors: ["#0d0d14", "#201735", "#32133f"],
        grid: "rgba(255, 110, 240, 0.1)",
      },
    },
  },
  elemental_nexus: {
    id: "elemental_nexus",
    name: "Elemental Nexus",
    levelStart: 91,
    levelEnd: 100,
    backgroundAsset: "bg_elemental_nexus_arena",
    brickHpMultiplier: 1.2,
    armorBonus: 3,
    palette: {
      primary: "#eef8ea",
      secondary: "#ffb45c",
      brick: "#747488",
      particle: "#ffffff",
    },
    backgroundVariants: {
      default: {
        colors: ["#101820", "#263250", "#32203f"],
        grid: "rgba(238, 248, 234, 0.1)",
      },
    },
  },
};

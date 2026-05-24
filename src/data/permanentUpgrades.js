export const PERMANENT_UPGRADES = [
  {
    id: "perm_power_core",
    name: "Power Core",
    shortLabel: "Power",
    description: "+1 permanent ball damage",
    category: "Permanent Damage",
    maxStacks: 25,
    weight: 14,
    statModifiers: { ballDamageAdd: 1 },
  },
  {
    id: "perm_guard_core",
    name: "Guard Core",
    shortLabel: "Guard",
    description: "+4 permanent paddle width",
    category: "Permanent Paddle",
    maxStacks: 20,
    weight: 12,
    statModifiers: { paddleWidthAdd: 4 },
  },
  {
    id: "perm_focus_core",
    name: "Focus Core",
    shortLabel: "Focus",
    description: "+1.5% permanent critical chance",
    category: "Permanent Crit",
    maxStacks: 20,
    weight: 9,
    statModifiers: { critChanceAdd: 0.015 },
  },
  {
    id: "perm_velocity_core",
    name: "Velocity Core",
    shortLabel: "Speed",
    description: "+8 permanent ball speed",
    category: "Permanent Speed",
    maxStacks: 15,
    weight: 8,
    statModifiers: { ballSpeedAdd: 8 },
  },
  {
    id: "perm_ward_core",
    name: "Ward Core",
    shortLabel: "Ward",
    description: "+1 permanent shield each level",
    category: "Permanent Safety",
    maxStacks: 3,
    weight: 4,
    statModifiers: { shieldSavesAdd: 1 },
  },
];

const PERMANENT_BY_ID = new Map(PERMANENT_UPGRADES.map((upgrade) => [upgrade.id, upgrade]));

export function getPermanentUpgrade(id) {
  return PERMANENT_BY_ID.get(id) || null;
}

export function listAvailablePermanentUpgrades(profilePermanentUpgrades = {}) {
  return PERMANENT_UPGRADES.filter((upgrade) =>
    (profilePermanentUpgrades[upgrade.id] || 0) < upgrade.maxStacks
  );
}

export function getPermanentUpgradeDisplay(id) {
  const upgrade = getPermanentUpgrade(id);
  if (upgrade) return upgrade;
  return {
    id,
    name: "Legacy Core",
    shortLabel: "Core",
    description: "Permanent profile progress",
    category: "Permanent",
    maxStacks: 99,
    weight: 0,
    statModifiers: {},
  };
}

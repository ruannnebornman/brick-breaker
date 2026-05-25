// Neutral weights keep legacy pickers stable until Phase 3 replaces their pools.
export const STORE_UPGRADE_DEFINITIONS = [
  {
    key: "ball_damage",
    permanentId: "perm_ball_damage",
    runId: "run_ball_damage",
    name: "Ball Damage",
    shortLabel: "Damage",
    icon: "D",
    effectText: "+1 ball damage",
    storeDescription: "+1 ball damage forever",
    runDescription: "+1 ball damage this run",
    category: "Ball",
    maxStacks: 25,
    firstCost: 25,
    weight: 1,
    statModifiers: { ballDamageAdd: 1 },
  },
  {
    key: "ball_speed",
    permanentId: "perm_ball_speed",
    runId: "run_ball_speed",
    name: "Ball Speed",
    shortLabel: "Speed",
    icon: "S",
    effectText: "+8 ball speed",
    storeDescription: "+8 ball speed forever",
    runDescription: "+8 ball speed this run",
    category: "Ball",
    maxStacks: 15,
    firstCost: 25,
    weight: 1,
    statModifiers: { ballSpeedAdd: 8 },
  },
  {
    key: "extra_ball",
    permanentId: "perm_extra_ball",
    runId: "run_extra_ball",
    name: "Extra Ball",
    shortLabel: "Ball",
    icon: "B",
    effectText: "+1 launched ball",
    storeDescription: "+1 launched ball forever",
    runDescription: "+1 launched ball this run",
    category: "Ball",
    maxStacks: 10,
    firstCost: 80,
    weight: 1,
    statModifiers: { ballCountAdd: 1 },
  },
  {
    key: "shield_charge",
    permanentId: "perm_shield_charge",
    runId: "run_shield_charge",
    name: "Shield Charge",
    shortLabel: "Shield",
    icon: "H",
    effectText: "+1 shielded relaunch each level",
    storeDescription: "+1 shielded relaunch each level forever",
    runDescription: "+1 shielded relaunch each level this run",
    category: "Safety",
    maxStacks: 3,
    firstCost: 100,
    weight: 1,
    statModifiers: { shieldSavesAdd: 1 },
  },
  {
    key: "cannon_unlock",
    permanentId: "perm_cannon_unlock",
    runId: "run_cannon_unlock",
    name: "Cannon Unlock",
    shortLabel: "Cannon",
    icon: "C",
    effectText: "Unlock paddle cannon",
    storeDescription: "Unlock paddle cannon forever",
    runDescription: "Unlock paddle cannon this run",
    category: "Cannon",
    maxStacks: 1,
    firstCost: 250,
    weight: 1,
    statModifiers: { cannonEnabled: true, cannonProjectileCountAdd: 1 },
  },
  {
    key: "cannon_power",
    permanentId: "perm_cannon_power",
    runId: "run_cannon_power",
    name: "Cannon Power",
    shortLabel: "Power",
    icon: "CP",
    effectText: "+0.12 cannon damage multiplier",
    storeDescription: "+0.12 cannon damage multiplier",
    runDescription: "+0.12 cannon damage multiplier this run",
    category: "Cannon",
    maxStacks: 3,
    firstCost: 150,
    weight: 1,
    statModifiers: { cannonDamageMultiplierAdd: 0.12 },
  },
  {
    key: "cannon_cooldown",
    permanentId: "perm_cannon_cooldown",
    runId: "run_cannon_cooldown",
    name: "Cannon Cooldown",
    shortLabel: "Cooldown",
    icon: "CC",
    effectText: "-0.18 cannon cooldown",
    storeDescription: "-0.18 cannon cooldown",
    runDescription: "-0.18 cannon cooldown this run",
    category: "Cannon",
    maxStacks: 3,
    firstCost: 150,
    weight: 1,
    statModifiers: { cannonCooldownAdd: -0.18 },
  },
  {
    key: "cannon_splitter",
    permanentId: "perm_cannon_splitter",
    runId: "run_cannon_splitter",
    name: "Cannon Splitter",
    shortLabel: "Splitter",
    icon: "CS",
    effectText: "+1 cannon projectile",
    storeDescription: "+1 cannon projectile",
    runDescription: "+1 cannon projectile this run",
    category: "Cannon",
    maxStacks: 2,
    firstCost: 300,
    weight: 1,
    statModifiers: { cannonProjectileCountAdd: 1 },
  },
  {
    key: "pierce_training",
    permanentId: "perm_pierce_training",
    runId: "run_pierce_training",
    name: "Pierce Training",
    shortLabel: "Pierce",
    icon: "P",
    effectText: "+5% non-boss pierce chance",
    storeDescription: "+5% non-boss pierce chance",
    runDescription: "+5% non-boss pierce chance this run",
    category: "Pierce",
    maxStacks: 5,
    firstCost: 120,
    weight: 1,
    statModifiers: { pierceChanceAdd: 0.05 },
  },
];

export const PERMANENT_UPGRADES = STORE_UPGRADE_DEFINITIONS.map((definition) => ({
  id: definition.permanentId,
  name: definition.name,
  shortLabel: definition.shortLabel,
  icon: definition.icon,
  description: definition.storeDescription,
  effectText: definition.effectText,
  category: definition.category,
  maxStacks: definition.maxStacks,
  firstCost: definition.firstCost,
  weight: definition.weight,
  statModifiers: { ...definition.statModifiers },
  sharedUpgradeKey: definition.key,
  runScopedId: definition.runId,
}));

export const RUN_SCOPED_UPGRADES = STORE_UPGRADE_DEFINITIONS.map((definition) => ({
  id: definition.runId,
  permanentId: definition.permanentId,
  name: definition.name,
  shortLabel: definition.shortLabel,
  icon: definition.icon,
  description: definition.runDescription,
  effectText: definition.effectText,
  category: definition.category,
  maxStacks: definition.maxStacks,
  weight: definition.weight,
  statModifiers: { ...definition.statModifiers },
  sharedUpgradeKey: definition.key,
}));

const PERMANENT_BY_ID = new Map(PERMANENT_UPGRADES.map((upgrade) => [upgrade.id, upgrade]));
const RUN_SCOPED_BY_ID = new Map(RUN_SCOPED_UPGRADES.map((upgrade) => [upgrade.id, upgrade]));
const RUN_SCOPED_BY_PERMANENT_ID = new Map(RUN_SCOPED_UPGRADES.map((upgrade) => [upgrade.permanentId, upgrade]));

export function getPermanentUpgrade(id) {
  return PERMANENT_BY_ID.get(id) || null;
}

export function getRunScopedUpgrade(id) {
  return RUN_SCOPED_BY_ID.get(id) || null;
}

export function getRunScopedUpgradeForPermanent(permanentId) {
  return RUN_SCOPED_BY_PERMANENT_ID.get(permanentId) || null;
}

export function listAvailablePermanentUpgrades(profilePermanentUpgrades = {}) {
  return PERMANENT_UPGRADES.filter((upgrade) =>
    (profilePermanentUpgrades[upgrade.id] || 0) < upgrade.maxStacks
  );
}

export function listAvailableRunScopedUpgrades(profilePermanentUpgrades = {}, runScopedUpgrades = {}) {
  return RUN_SCOPED_UPGRADES.filter((upgrade) =>
    getEffectiveStoreUpgradeStacks(upgrade.permanentId, profilePermanentUpgrades, runScopedUpgrades) < upgrade.maxStacks
  );
}

export function getEffectiveStoreUpgradeStacks(permanentId, profilePermanentUpgrades = {}, runScopedUpgrades = {}) {
  const permanent = getPermanentUpgrade(permanentId);
  if (!permanent) return 0;
  const runScoped = getRunScopedUpgradeForPermanent(permanentId);
  const permanentStacks = clampStackCount(profilePermanentUpgrades[permanent.id], permanent.maxStacks);
  const runStacks = clampStackCount(runScopedUpgrades[runScoped?.id], permanent.maxStacks);
  return Math.min(permanent.maxStacks, permanentStacks + runStacks);
}

export function getPermanentUpgradeCost(id, ownedStacks = 0) {
  const upgrade = typeof id === "string" ? getPermanentUpgrade(id) : id;
  if (!upgrade) return Infinity;
  const stack = Math.max(0, Math.trunc(Number(ownedStacks) || 0));
  return upgrade.firstCost * 2 ** stack;
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

function clampStackCount(value, maxStacks) {
  const number = Math.trunc(Number(value) || 0);
  return Math.max(0, Math.min(number, maxStacks));
}

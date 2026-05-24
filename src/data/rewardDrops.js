import { Random } from "../core/Random.js";
import { RUN_UPGRADES } from "./upgrades.js";
import {
  getPermanentUpgrade,
  listAvailablePermanentUpgrades,
  PERMANENT_UPGRADES,
} from "./permanentUpgrades.js";

const RUN_UPGRADE_BY_ID = new Map(RUN_UPGRADES.map((upgrade) => [upgrade.id, upgrade]));

const RUN_REWARD_SEQUENCE = [
  "ball_damage",
  "multiball",
  "paddle_width",
  "crit_chance",
  "fire_burn",
  "lightning_chain",
  "frost_brittle",
  "acid_corrosion",
  "piercing_angle",
  "elemental_amplifier",
  "paddle_cannon",
  "cannon_tuning",
  "cannon_multishot",
  "shield_life",
];

export function getPermanentRewardChance(levelNumber) {
  const level = Math.max(1, Number(levelNumber) || 1);
  if (level <= 10) {
    return interpolate(level, 1, 10, 0.99, 0.9);
  }
  if (level <= 50) {
    return interpolate(level, 10, 50, 0.9, 0.5);
  }
  return 0.5;
}

export function rollLevelPermanentReward(levelNumber, seed = 1, salt = 0) {
  const rng = new Random((seed + levelNumber * 32452843 + salt * 49979687 + 0x9e3779b9) >>> 0);
  return rng.chance(getPermanentRewardChance(levelNumber));
}

export function createRewardForLevelSlot(levelNumber, slot, seed = 1, { isBossLevel = false } = {}) {
  const rng = new Random((seed + levelNumber * 7919 + slot * 104729) >>> 0);
  const hasPermanentReward = rollLevelPermanentReward(levelNumber, seed, 1);

  if (slot === 0 && hasPermanentReward) {
    return permanentRewardForLevel(levelNumber, slot, seed);
  }

  const rewardSlot = Math.max(0, hasPermanentReward ? slot - 1 : slot);

  if (levelNumber === 3 && rewardSlot === 0) {
    return instantBallsReward(1, "First Cache");
  }

  if (levelNumber === 7) {
    return rewardSlot === 0
      ? runUpgradeReward("ball_damage")
      : instantBallsReward(3, "Triple Serve");
  }

  if (levelNumber === 14) {
    return temporaryStatReward("temp_multiball_3", "+3 Balls", 2, { ballCountAdd: 3 }, "Temporary");
  }

  if (isBossLevel && rewardSlot === 0) {
    return runUpgradeReward(pickRunUpgradeId(levelNumber, rewardSlot, rng));
  }

  if (rewardSlot === 0) {
    return runUpgradeReward(pickRunUpgradeId(levelNumber, rewardSlot, rng));
  }

  if (levelNumber >= 14 && rng.chance(0.5)) {
    return temporaryStatReward("temp_multiball_3", "+3 Balls", 2, { ballCountAdd: 3 }, "Temporary");
  }

  if (rng.chance(0.35)) {
    return temporaryStatReward("temp_damage_4", "+4 Damage", 2, { ballDamageAdd: 4 }, "Temporary");
  }

  return temporaryStatReward("temp_shield_1", "+1 Shield", 2, { shieldSavesAdd: 1 }, "Temporary");
}

export function getRewardBlockCount(levelNumber, { isBossLevel = false } = {}) {
  if (levelNumber === 7) return 2;
  if (isBossLevel) return 2;
  if (levelNumber >= 14 && levelNumber % 7 === 0) return 2;
  return 1;
}

export function createStageBonusChoices({
  seed,
  levelNumber,
  permanentAlreadyEarned = false,
  profilePermanentUpgrades = {},
}) {
  const rng = new Random((seed + levelNumber * 15485863 + 17) >>> 0);
  const canOfferPermanent = !permanentAlreadyEarned && rollLevelPermanentReward(levelNumber, seed, 2);
  const permanentChoices = canOfferPermanent
    ? createPermanentChoices({ seed, levelNumber, profilePermanentUpgrades })
    : [];
  const pool = permanentChoices.length > 0 ? permanentChoices : [
    temporaryStatReward("bonus_damage_2", "+2 Damage", 1, { ballDamageAdd: 2 }, "Next Level"),
    temporaryStatReward("bonus_ball_1", "+1 Ball", 1, { ballCountAdd: 1 }, "Next Level"),
    temporaryStatReward("bonus_shield_1", "+1 Shield", 1, { shieldSavesAdd: 1 }, "Next Level"),
    temporaryStatReward("bonus_speed_35", "+35 Speed", 1, { ballSpeedAdd: 35 }, "Next Level"),
  ];
  const choices = [];
  while (choices.length < 3 && choices.length < pool.length) {
    const index = rng.int(0, pool.length - 1);
    const [choice] = pool.splice(index, 1);
    choices.push(choice);
  }
  return choices;
}

export function cloneReward(reward) {
  return reward ? {
    ...reward,
    statModifiers: reward.statModifiers ? { ...reward.statModifiers } : undefined,
  } : null;
}

export function getRewardStyle(reward) {
  if (!reward) return rewardStyles.common;
  if (reward.kind === "permanentUpgrade") return rewardStyles.permanent;
  if (reward.kind === "runUpgrade") return rewardStyles.run;
  if (reward.kind === "temporaryUpgrade") return rewardStyles.temporary;
  if (reward.kind === "currency") return rewardStyles.currency;
  return rewardStyles.common;
}

function pickRunUpgradeId(levelNumber, slot, rng) {
  const offset = rng.int(0, RUN_REWARD_SEQUENCE.length - 1);
  return RUN_REWARD_SEQUENCE[(levelNumber + slot * 3 + offset) % RUN_REWARD_SEQUENCE.length];
}

function pickPermanentUpgrade(levelNumber, slot, seed, profilePermanentUpgrades = {}) {
  const rng = new Random((seed + levelNumber * 67867967 + slot * 86028121 + 0x51f15e) >>> 0);
  const pool = listAvailablePermanentUpgrades(profilePermanentUpgrades);
  const available = pool.length > 0 ? pool : PERMANENT_UPGRADES;
  const total = available.reduce((sum, upgrade) => sum + upgrade.weight, 0);
  let roll = rng.range(0, total || 1);
  for (const upgrade of available) {
    roll -= upgrade.weight;
    if (roll <= 0) return upgrade;
  }
  return available[available.length - 1];
}

function createPermanentChoices({ seed, levelNumber, profilePermanentUpgrades }) {
  if (listAvailablePermanentUpgrades(profilePermanentUpgrades).length === 0) {
    return [];
  }
  const choices = [];
  const chosen = new Set();
  let slot = 0;
  let attempts = 0;

  while (choices.length < 3 && choices.length < PERMANENT_UPGRADES.length && attempts < 24) {
    const upgrade = pickPermanentUpgrade(levelNumber, slot, seed, profilePermanentUpgrades);
    slot += 1;
    attempts += 1;
    if (!upgrade || chosen.has(upgrade.id)) continue;
    chosen.add(upgrade.id);
    const current = profilePermanentUpgrades[upgrade.id] || 0;
    choices.push(permanentReward(upgrade.id, upgrade.name, {
      id: `stage_${levelNumber}_${upgrade.id}`,
      description: upgrade.description,
      category: upgrade.category,
      stack: current,
      maxStacks: upgrade.maxStacks,
    }));
  }

  return choices;
}

function permanentRewardForLevel(levelNumber, slot, seed) {
  const upgrade = pickPermanentUpgrade(levelNumber, slot, seed);
  return permanentReward(upgrade.id, upgrade.name, {
    id: `perm_${levelNumber}_${slot}_${upgrade.id}`,
    description: upgrade.description,
    category: upgrade.category,
    maxStacks: upgrade.maxStacks,
  });
}

function runUpgradeReward(upgradeId) {
  const upgrade = RUN_UPGRADE_BY_ID.get(upgradeId) || RUN_UPGRADE_BY_ID.get("ball_damage");
  return {
    kind: "runUpgrade",
    id: `run_${upgrade.id}`,
    upgradeId: upgrade.id,
    label: upgrade.name,
    description: upgrade.description,
    rarity: upgrade.rarity || "Run",
    category: upgrade.category || "Run Upgrade",
  };
}

function instantBallsReward(count, label) {
  return {
    kind: "instant",
    id: `instant_balls_${count}`,
    label,
    description: `+${count} ${count === 1 ? "ball" : "balls"} this level`,
    rarity: "Common",
    category: "Instant",
    statModifiers: { ballCountAdd: count },
  };
}

function temporaryStatReward(id, label, durationLevels, statModifiers, rarity) {
  return {
    kind: "temporaryUpgrade",
    id,
    label,
    description: `${label} for ${durationLevels} ${durationLevels === 1 ? "level" : "levels"}`,
    rarity,
    category: "Temporary",
    durationLevels,
    statModifiers,
  };
}

function permanentReward(permanentId, label, options = {}) {
  const upgrade = getPermanentUpgrade(permanentId);
  return {
    kind: "permanentUpgrade",
    id: options.id || `permanent_${permanentId}`,
    permanentId,
    label,
    description: options.description || upgrade?.description || "Permanent profile progress",
    rarity: "Permanent",
    category: options.category || upgrade?.category || "Permanent",
    stack: options.stack ?? null,
    maxStacks: options.maxStacks ?? upgrade?.maxStacks ?? null,
  };
}

function interpolate(value, fromLevel, toLevel, fromChance, toChance) {
  const t = (value - fromLevel) / (toLevel - fromLevel);
  return fromChance + (toChance - fromChance) * Math.max(0, Math.min(1, t));
}

const rewardStyles = {
  common: {
    fill: "rgba(97, 215, 198, 0.28)",
    stroke: "rgba(185, 255, 238, 0.92)",
    glow: "rgba(97, 215, 198, 0.9)",
    text: "I",
    fallSpeed: 160,
    magnetStrength: 0,
    collectOnClear: false,
  },
  temporary: {
    fill: "rgba(72, 134, 255, 0.34)",
    stroke: "rgba(186, 213, 255, 0.95)",
    glow: "rgba(72, 134, 255, 0.94)",
    text: "T",
    fallSpeed: 135,
    magnetStrength: 80,
    collectOnClear: false,
  },
  run: {
    fill: "rgba(230, 165, 63, 0.35)",
    stroke: "rgba(255, 232, 150, 0.98)",
    glow: "rgba(255, 189, 76, 0.95)",
    text: "R",
    fallSpeed: 130,
    magnetStrength: 95,
    collectOnClear: false,
  },
  permanent: {
    fill: "rgba(255, 246, 206, 0.46)",
    stroke: "rgba(255, 255, 255, 0.98)",
    glow: "rgba(255, 232, 150, 1)",
    text: "P",
    fallSpeed: 105,
    magnetStrength: 140,
    collectOnClear: true,
  },
  currency: {
    fill: "rgba(139, 221, 125, 0.28)",
    stroke: "rgba(206, 255, 164, 0.95)",
    glow: "rgba(139, 221, 125, 0.9)",
    text: "$",
    fallSpeed: 165,
    magnetStrength: 40,
    collectOnClear: false,
  },
};

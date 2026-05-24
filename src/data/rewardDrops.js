import { Random } from "../core/Random.js";
import { RUN_UPGRADES } from "./upgrades.js";
import { getLevelReward } from "./scaling.js";

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

export function createRewardForLevelSlot(levelNumber, slot, seed = 1, { isBossLevel = false } = {}) {
  const rng = new Random((seed + levelNumber * 7919 + slot * 104729) >>> 0);

  if (levelNumber === 3 && slot === 0) {
    return instantBallsReward(1, "First Cache");
  }

  if (levelNumber === 7) {
    return slot === 0
      ? runUpgradeReward("ball_damage")
      : instantBallsReward(3, "Triple Serve");
  }

  if (levelNumber === 14) {
    return temporaryStatReward("temp_multiball_3", "+3 Balls", 2, { ballCountAdd: 3 }, "Temporary");
  }

  if (isBossLevel && levelNumber >= 20 && slot === 1) {
    return permanentReward(`perm_boss_${levelNumber}`, "Permanent Core");
  }

  if (isBossLevel && slot === 0) {
    return runUpgradeReward(pickRunUpgradeId(levelNumber, slot, rng));
  }

  if (slot === 0) {
    return runUpgradeReward(pickRunUpgradeId(levelNumber, slot, rng));
  }

  if (levelNumber >= 14 && rng.chance(0.5)) {
    return temporaryStatReward("temp_multiball_3", "+3 Balls", 2, { ballCountAdd: 3 }, "Temporary");
  }

  if (rng.chance(0.35)) {
    return temporaryStatReward("temp_damage_4", "+4 Damage", 2, { ballDamageAdd: 4 }, "Temporary");
  }

  return currencyReward(20 + levelNumber * 3, "Coin Cache");
}

export function getRewardBlockCount(levelNumber, { isBossLevel = false } = {}) {
  if (levelNumber < 3) return 0;
  if (levelNumber === 7) return 2;
  if (isBossLevel) return levelNumber >= 20 ? 2 : 1;
  if (levelNumber >= 14 && levelNumber % 7 === 0) return 2;
  return 1;
}

export function createStageBonusChoices({ seed, levelNumber }) {
  const rng = new Random((seed + levelNumber * 15485863 + 17) >>> 0);
  const reward = getLevelReward(levelNumber, { isBossLevel: levelNumber % 10 === 0 });
  const pool = [
    currencyReward(Math.max(12, Math.round(reward.coins * 0.45)), "Coin Bonus"),
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

function permanentReward(id, label) {
  return {
    kind: "permanentUpgrade",
    id,
    permanentId: id,
    label,
    description: "Permanent profile progress",
    rarity: "Permanent",
    category: "Permanent",
  };
}

function currencyReward(amount, label) {
  return {
    kind: "currency",
    id: `coins_${amount}`,
    label,
    description: `+${amount} coins`,
    rarity: "Bonus",
    category: "Coins",
    amount,
  };
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
    fill: "rgba(105, 151, 255, 0.3)",
    stroke: "rgba(186, 213, 255, 0.95)",
    glow: "rgba(105, 151, 255, 0.9)",
    text: "T",
    fallSpeed: 135,
    magnetStrength: 80,
    collectOnClear: false,
  },
  run: {
    fill: "rgba(230, 193, 91, 0.32)",
    stroke: "rgba(255, 232, 150, 0.98)",
    glow: "rgba(230, 193, 91, 0.9)",
    text: "R",
    fallSpeed: 130,
    magnetStrength: 95,
    collectOnClear: false,
  },
  permanent: {
    fill: "rgba(255, 246, 206, 0.36)",
    stroke: "rgba(255, 255, 255, 0.98)",
    glow: "rgba(255, 246, 206, 0.98)",
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

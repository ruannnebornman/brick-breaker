import { Random } from "../core/Random.js";
import { RUN_UPGRADES } from "../data/upgrades.js";

export class UpgradeSystem {
  constructor() {
    this.upgrades = RUN_UPGRADES;
    this.byId = new Map(this.upgrades.map((upgrade) => [upgrade.id, upgrade]));
  }

  countStacks(runUpgrades = []) {
    return runUpgrades.reduce((counts, id) => {
      counts[id] = (counts[id] || 0) + 1;
      return counts;
    }, {});
  }

  applyToStats(baseStats, runUpgrades = [], temporaryUpgrades = []) {
    const stats = {
      ...baseStats,
      ballCount: 2,
      burnPower: 0,
      lightningPower: 0,
      frostPower: 0,
      acidPower: 0,
      shieldSaves: 0,
      cannonEnabled: false,
      cannonProjectileCount: 0,
      cannonCooldown: baseStats.cannonCooldown,
      cannonDamageMultiplier: baseStats.cannonDamageMultiplier,
      activeElements: [],
    };
    for (const id of runUpgrades) {
      const upgrade = this.byId.get(id);
      if (!upgrade) continue;
      applyModifiers(stats, upgrade.statModifiers || {});
    }

    for (const upgrade of temporaryUpgrades) {
      applyModifiers(stats, upgrade?.statModifiers || {});
    }

    if (stats.activeElements.length === 0) {
      stats.activeElements = [stats.element];
    }

    stats.ballSpeed = Math.min(stats.ballSpeed, stats.ballMaxSpeed);
    stats.paddleWidth = Math.min(stats.paddleWidth, 260);
    stats.critChance = Math.min(stats.critChance, 0.75);
    stats.ballCount = Math.min(stats.ballCount, 13);
    stats.elementChance = Math.min(stats.elementChance, 0.85);
    stats.statusDuration = Math.min(stats.statusDuration, 2.4);
    stats.pierceChance = Math.min(stats.pierceChance, 0.7);
    stats.maxSecondaryHitEvents = Math.min(stats.maxSecondaryHitEvents, 18);
    stats.cannonCooldown = Math.max(0.45, stats.cannonCooldown);
    stats.cannonDamageMultiplier = Math.min(stats.cannonDamageMultiplier, 1.1);
    stats.cannonProjectileCount = Math.min(stats.cannonProjectileCount, 3);
    return stats;
  }

  canTakeUpgrade(upgradeId, runUpgrades = []) {
    const upgrade = this.byId.get(upgradeId);
    if (!upgrade || upgrade.fallbackOnly) return false;
    const stacks = this.countStacks(runUpgrades);
    const selectedIds = new Set(runUpgrades);
    return (
      (stacks[upgrade.id] || 0) < upgrade.maxStacks &&
      (upgrade.prerequisites || []).every((id) => selectedIds.has(id))
    );
  }

  offerChoices({ seed, levelNumber, runUpgrades }) {
    const stacks = this.countStacks(runUpgrades);
    const selectedIds = new Set(runUpgrades);
    const normalAvailable = this.upgrades.filter((upgrade) =>
      !upgrade.fallbackOnly &&
      (stacks[upgrade.id] || 0) < upgrade.maxStacks &&
      (upgrade.prerequisites || []).every((id) => selectedIds.has(id))
    );
    const fallbackAvailable = this.upgrades.filter((upgrade) =>
      upgrade.fallbackOnly &&
      (stacks[upgrade.id] || 0) < upgrade.maxStacks &&
      (upgrade.prerequisites || []).every((id) => selectedIds.has(id))
    );
    const available = normalAvailable.length > 0 ? normalAvailable : fallbackAvailable;
    const rng = new Random((seed + levelNumber * 1009 + runUpgrades.length * 9176) >>> 0);
    const choices = [];
    const broadlyUseful = available.filter((upgrade) =>
      ["ball_damage", "paddle_width", "ball_speed"].includes(upgrade.id),
    );

    if (broadlyUseful.length > 0) {
      choices.push(this.pickWeighted(broadlyUseful, rng, choices));
    }

    while (choices.length < 3 && choices.length < available.length) {
      const pick = this.pickWeighted(available, rng, choices);
      if (pick) choices.push(pick);
    }

    return choices.map((upgrade) => ({
      id: upgrade.id,
      name: upgrade.name,
      description: upgrade.description,
      rarity: upgrade.rarity,
      category: upgrade.category,
      stack: stacks[upgrade.id] || 0,
      maxStacks: upgrade.maxStacks,
    }));
  }

  pickWeighted(upgrades, rng, chosen) {
    const chosenIds = new Set(chosen.map((upgrade) => upgrade.id));
    const pool = upgrades.filter((upgrade) => !chosenIds.has(upgrade.id));
    const total = pool.reduce((sum, upgrade) => sum + upgrade.weight, 0);
    let roll = rng.range(0, total);
    for (const upgrade of pool) {
      roll -= upgrade.weight;
      if (roll <= 0) return upgrade;
    }
    return pool[pool.length - 1] || null;
  }
}

function applyModifiers(stats, mods) {
  stats.ballDamage += mods.ballDamageAdd || 0;
  stats.ballSpeed += mods.ballSpeedAdd || 0;
  stats.paddleWidth += mods.paddleWidthAdd || 0;
  stats.critChance += mods.critChanceAdd || 0;
  stats.ballCount += mods.ballCountAdd || 0;
  stats.burnPower += mods.burnPowerAdd || 0;
  stats.lightningPower += mods.lightningPowerAdd || 0;
  stats.frostPower += mods.frostPowerAdd || 0;
  stats.acidPower += mods.acidPowerAdd || 0;
  stats.shieldSaves += mods.shieldSavesAdd || 0;
  stats.elementChance += mods.elementChanceAdd || 0;
  stats.statusDuration += mods.statusDurationAdd || 0;
  stats.pierceChance += mods.pierceChanceAdd || 0;
  stats.maxSecondaryHitEvents += mods.secondaryHitBudgetAdd || 0;
  stats.cannonCooldown += mods.cannonCooldownAdd || 0;
  stats.cannonDamageMultiplier += mods.cannonDamageMultiplierAdd || 0;
  stats.cannonProjectileCount += mods.cannonProjectileCountAdd || 0;
  if (mods.cannonEnabled) {
    stats.cannonEnabled = true;
  }
  if (mods.element) {
    stats.element = mods.element;
    if (!stats.activeElements.includes(mods.element)) {
      stats.activeElements.push(mods.element);
    }
  }
}

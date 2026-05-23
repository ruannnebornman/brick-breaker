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

  applyToStats(baseStats, runUpgrades = []) {
    const stats = { ...baseStats, ballCount: 1, burnPower: 0, shieldSaves: 0 };
    for (const id of runUpgrades) {
      const upgrade = this.byId.get(id);
      if (!upgrade) continue;
      const mods = upgrade.statModifiers || {};
      stats.ballDamage += mods.ballDamageAdd || 0;
      stats.ballSpeed += mods.ballSpeedAdd || 0;
      stats.paddleWidth += mods.paddleWidthAdd || 0;
      stats.critChance += mods.critChanceAdd || 0;
      stats.ballCount += mods.ballCountAdd || 0;
      stats.burnPower += mods.burnPowerAdd || 0;
      stats.shieldSaves += mods.shieldSavesAdd || 0;
      if (mods.element) {
        stats.element = mods.element;
      }
    }

    stats.ballSpeed = Math.min(stats.ballSpeed, stats.ballMaxSpeed);
    stats.paddleWidth = Math.min(stats.paddleWidth, 260);
    stats.critChance = Math.min(stats.critChance, 0.75);
    stats.ballCount = Math.min(stats.ballCount, 4);
    return stats;
  }

  offerChoices({ seed, levelNumber, runUpgrades }) {
    const stacks = this.countStacks(runUpgrades);
    const available = this.upgrades.filter((upgrade) => (stacks[upgrade.id] || 0) < upgrade.maxStacks);
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

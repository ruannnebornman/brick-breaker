export class ElementSystem {
  applyHit(hitEvent, target, game) {
    const crit = Math.random() < hitEvent.critChance;
    const rawDamage = hitEvent.baseDamage * (crit ? hitEvent.critDamage : 1);
    const armorMultiplier = 100 / (100 + (target.armor || 0) * 14);
    const finalDamage = Math.max(1, rawDamage * armorMultiplier);

    this.applyDamage(target, finalDamage, game);

    if (target.active && hitEvent.element === "fire" && game.stats.burnPower > 0) {
      this.applyBurn(target, hitEvent, game);
    }

    return {
      damage: finalDamage,
      crit,
      destroyed: !target.active,
    };
  }

  applyDamage(target, damage, game) {
    target.hp -= damage;
    game.saveData.statistics.totalDamageDealt += damage;

    if (target.hp <= 0 && target.active) {
      target.active = false;
      if (target.kind === "brick") {
        game.saveData.statistics.totalBricksDestroyed += 1;
      }
      if (target.kind === "boss") {
        game.saveData.statistics.totalBossesDefeated += 1;
      }
    }
  }

  applyBurn(target, hitEvent, game) {
    const maxStacks = 3;
    const duration = 2.2 + game.stats.burnPower * 0.35;
    const bossMultiplier = target.kind === "boss" ? 0.65 : 1;
    const potency = (hitEvent.baseDamage * 0.16 + game.stats.burnPower * 1.4) * bossMultiplier;
    const existing = target.statusEffects.find((effect) => effect.type === "burn");

    if (existing) {
      existing.remaining = duration;
      existing.duration = duration;
      existing.stacks = Math.min(maxStacks, existing.stacks + 1);
      existing.potency = Math.max(existing.potency, potency);
      return;
    }

    target.statusEffects.push({
      type: "burn",
      sourceId: hitEvent.sourceId,
      remaining: duration,
      duration,
      tickInterval: 0.5,
      tickTimer: 0.5,
      stacks: 1,
      potency,
      maxStacks,
      metadata: {},
    });
  }

  updateStatuses(targets, game, delta) {
    for (const target of targets) {
      if (!target?.active) continue;
      for (const effect of target.statusEffects) {
        effect.remaining -= delta;
        effect.tickTimer -= delta;
        while (effect.tickTimer <= 0 && effect.remaining > 0 && target.active) {
          effect.tickTimer += effect.tickInterval;
          if (effect.type === "burn") {
            const damage = effect.potency * effect.stacks;
            const wasActive = target.active;
            this.applyDamage(target, damage, game);
            game.particleSystem.burn(game.level, target.x + target.width / 2, target.y + target.height / 2);
            if (wasActive && !target.active) {
              game.particleSystem.burst(game.level, target.x + target.width / 2, target.y + target.height / 2);
            }
          }
        }
      }
      target.statusEffects = target.statusEffects.filter((effect) => effect.remaining > 0);
    }
  }
}

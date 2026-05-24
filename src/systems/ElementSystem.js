import { getBallElement } from "../data/ballElements.js";

export class ElementSystem {
  applyHit(hitEvent, target, game) {
    const element = getBallElement(hitEvent.element);
    const activeElements = this.getActiveElements(hitEvent);
    const crit = Math.random() < hitEvent.critChance;
    const elementMultiplier = this.getElementDamageMultiplier(target, element.id);
    const rawDamage = hitEvent.baseDamage * element.baseDamageMultiplier * elementMultiplier * (crit ? hitEvent.critDamage : 1);
    const finalDamage = this.calculateDamage(target, rawDamage, game, { consumeBrittle: true });

    this.applyDamage(target, finalDamage, game);
    for (const activeElement of activeElements) {
      this.applyElementEffect(activeElement, target, hitEvent, finalDamage, game);
    }

    return {
      damage: finalDamage,
      crit,
      destroyed: !target.active,
      pierced: this.shouldPierce(activeElements, target, hitEvent, game),
      hitColor: element.hitColor,
    };
  }

  getActiveElements(hitEvent) {
    const ids = Array.isArray(hitEvent.elements) && hitEvent.elements.length > 0
      ? hitEvent.elements
      : [hitEvent.element];
    return [...new Set(ids.filter(Boolean))].map((id) => getBallElement(id));
  }

  calculateDamage(target, rawDamage, game, { consumeBrittle = false } = {}) {
    const brittle = target.statusEffects?.find((effect) => effect.type === "brittle" && effect.remaining > 0);
    const brittleMultiplier = brittle ? 1 + brittle.potency * brittle.stacks : 1;
    if (consumeBrittle && brittle) {
      brittle.stacks -= 1;
      if (brittle.stacks <= 0) {
        brittle.remaining = 0;
      }
    }

    const corrosion = target.statusEffects?.find((effect) => effect.type === "corrosion" && effect.remaining > 0);
    const armorReduction = corrosion ? corrosion.metadata.armorReduction * corrosion.stacks : 0;
    const effectiveArmor = Math.max(0, (target.armor || 0) - armorReduction);
    const armorMultiplier = 100 / (100 + effectiveArmor * 14);
    return Math.max(1, rawDamage * brittleMultiplier * armorMultiplier);
  }

  getElementDamageMultiplier(target, elementId) {
    return (target.weaknesses?.[elementId] || 1) * (target.resistances?.[elementId] || 1);
  }

  applyDamage(target, damage, game) {
    if (!target.active) return;
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
      game.handleDestroyedTarget?.(target);
    }
  }

  applyElementEffect(element, target, hitEvent, finalDamage, game) {
    if (!target.active) return;
    if (element.id !== "normal" && !this.rollElementProc(game)) return;

    if (element.id === "fire" && game.stats.burnPower > 0) {
      this.applyBurn(element, target, hitEvent, game);
      return;
    }

    if (element.id === "lightning" && game.stats.lightningPower > 0) {
      this.applyStatic(element, target, hitEvent, game);
      this.applyLightningChain(element, target, hitEvent, finalDamage, game);
      return;
    }

    if (element.id === "frost" && game.stats.frostPower > 0) {
      this.applyFrost(element, target, hitEvent, game);
      return;
    }

    if (element.id === "acid" && game.stats.acidPower > 0) {
      this.applyCorrosion(element, target, hitEvent, game);
    }
  }

  rollElementProc(game) {
    return Math.random() < Math.min(1, 0.85 + (game.stats.elementChance || 0));
  }

  applyBurn(element, target, hitEvent, game) {
    const burn = element.burn;
    const duration = (burn.duration + game.stats.burnPower * burn.durationPerPower) * game.stats.statusDuration;
    const bossMultiplier = target.kind === "boss" ? burn.bossPotencyMultiplier : 1;
    const potency = (hitEvent.baseDamage * burn.damageRatio + game.stats.burnPower * burn.damagePerPower) * bossMultiplier;
    const maxStacks = target.kind === "boss" ? Math.min(burn.maxStacks, burn.bossMaxStacks) : burn.maxStacks;

    this.applyStatus(target, {
      type: "burn",
      sourceId: hitEvent.sourceId,
      duration,
      tickInterval: burn.tickInterval,
      potency,
      maxStacks,
      metadata: {},
    });
  }

  applyStatic(element, target, hitEvent, game) {
    const data = element.static;
    const duration = data.duration * game.stats.statusDuration * (target.kind === "boss" ? data.bossDurationMultiplier : 1);
    const maxStacks = target.kind === "boss" ? Math.min(data.maxStacks, data.bossMaxStacks) : data.maxStacks;
    this.applyStatus(target, {
      type: "static",
      sourceId: hitEvent.sourceId,
      duration,
      tickInterval: null,
      potency: 0,
      maxStacks,
      metadata: {},
    });
  }

  applyFrost(element, target, hitEvent, game) {
    const brittle = element.brittle;
    const potency = (
      brittle.damageMultiplier + game.stats.frostPower * brittle.damageMultiplierPerPower
    ) * (target.kind === "boss" ? brittle.bossPotencyMultiplier : 1);
    const maxStacks = target.kind === "boss" ? Math.min(brittle.maxStacks, brittle.bossMaxStacks) : brittle.maxStacks;

    this.applyStatus(target, {
      type: "brittle",
      sourceId: hitEvent.sourceId,
      duration: (brittle.duration + game.stats.frostPower * brittle.durationPerPower) * game.stats.statusDuration,
      tickInterval: null,
      potency,
      maxStacks,
      metadata: {},
    });

    const chill = element.chill;
    this.applyStatus(target, {
      type: "chill",
      sourceId: hitEvent.sourceId,
      duration: chill.duration * game.stats.statusDuration * (target.kind === "boss" ? chill.bossDurationMultiplier : 1),
      tickInterval: null,
      potency: 0,
      maxStacks: target.kind === "boss" ? Math.min(chill.maxStacks, chill.bossMaxStacks) : chill.maxStacks,
      metadata: {},
    });
  }

  applyCorrosion(element, target, hitEvent, game) {
    const corrosion = element.corrosion;
    const bossMultiplier = target.kind === "boss" ? corrosion.bossPotencyMultiplier : 1;
    const potency = (hitEvent.baseDamage * corrosion.damageRatio + game.stats.acidPower * corrosion.damagePerPower) * bossMultiplier;
    const maxStacks = target.kind === "boss"
      ? Math.min(corrosion.maxStacks, corrosion.bossMaxStacks)
      : corrosion.maxStacks;

    this.applyStatus(target, {
      type: "corrosion",
      sourceId: hitEvent.sourceId,
      duration: (corrosion.duration + game.stats.acidPower * corrosion.durationPerPower) * game.stats.statusDuration,
      tickInterval: corrosion.tickInterval,
      potency,
      maxStacks,
      metadata: {
        armorReduction: corrosion.armorReduction + game.stats.acidPower * corrosion.armorReductionPerPower,
      },
    });
  }

  applyStatus(target, status) {
    const existing = target.statusEffects.find((effect) => effect.type === status.type);

    if (existing) {
      existing.remaining = status.duration;
      existing.duration = status.duration;
      existing.tickInterval = status.tickInterval;
      existing.tickTimer = status.tickInterval ?? null;
      existing.stacks = Math.min(status.maxStacks, existing.stacks + 1);
      existing.potency = Math.max(existing.potency, status.potency);
      existing.maxStacks = status.maxStacks;
      existing.metadata = { ...existing.metadata, ...status.metadata };
      return;
    }

    target.statusEffects.push({
      type: status.type,
      sourceId: status.sourceId,
      remaining: status.duration,
      duration: status.duration,
      tickInterval: status.tickInterval,
      tickTimer: status.tickInterval ?? null,
      stacks: 1,
      potency: status.potency,
      maxStacks: status.maxStacks,
      metadata: status.metadata,
    });
  }

  applyLightningChain(element, sourceTarget, hitEvent, primaryDamage, game) {
    const chain = element.chain;
    const maxJumps = Math.min(5, Math.max(1, Math.floor(chain.maxJumps + game.stats.lightningPower * chain.jumpsPerPower)));
    const range = chain.range + game.stats.lightningPower * chain.rangePerPower;
    const visited = new Set([stableTargetKey(sourceTarget)]);
    let current = sourceTarget;
    let damage = primaryDamage * chain.falloff;

    for (let jump = 0; jump < maxJumps; jump += 1) {
      if (!this.consumeSecondaryEvent(game)) return;
      const target = this.findNearestChainTarget(current, visited, range, game);
      if (!target) return;

      visited.add(stableTargetKey(target));
      const chainDamage = this.calculateDamage(target, Math.max(hitEvent.baseDamage * chain.minDamageRatio, damage), game);
      this.applyDamage(target, chainDamage, game);

      const from = centerOf(current);
      const to = centerOf(target);
      game.particleSystem.chain(game.level, from.x, from.y, to.x, to.y, element.hitColor);
      game.particleSystem.hit(game.level, to.x, to.y, element.hitColor);
      if (!target.active) {
        game.particleSystem.burst(game.level, to.x, to.y, "rgba(180, 236, 255, 0.86)");
      }

      current = target;
      damage *= chain.falloff;
    }
  }

  findNearestChainTarget(sourceTarget, visited, range, game) {
    const source = centerOf(sourceTarget);
    const candidates = [
      ...game.level.bricks,
      ...game.level.enemies,
      ...(game.level.boss ? [game.level.boss] : []),
    ].filter((target) => target.active && !visited.has(stableTargetKey(target)));

    let best = null;
    for (const target of candidates) {
      const targetCenter = centerOf(target);
      const distance = Math.hypot(targetCenter.x - source.x, targetCenter.y - source.y);
      if (distance > range) continue;
      if (!best || distance < best.distance || (distance === best.distance && target.id < best.target.id)) {
        best = { target, distance };
      }
    }
    return best?.target || null;
  }

  shouldPierce(elements, target, hitEvent, game) {
    if (!target.active || target.kind === "boss") return false;
    if (Math.random() < (hitEvent.pierceChance || 0)) return true;

    const acid = elements.find((element) => element.id === "acid");
    if (!acid || game.stats.acidPower <= 0) return false;
    const corrosion = target.statusEffects.find((effect) => effect.type === "corrosion" && effect.remaining > 0);
    const enoughCorrosion = (corrosion?.stacks || 0) >= acid.corrosionPierceStacks;
    const weakened = target.hpRatio <= acid.weakenedPierceThreshold;
    return enoughCorrosion || weakened;
  }

  consumeSecondaryEvent(game) {
    if (!game.hitEventBudget) return true;
    if (game.hitEventBudget.secondary >= game.hitEventBudget.maxSecondary) {
      return false;
    }
    game.hitEventBudget.secondary += 1;
    return true;
  }

  updateStatuses(targets, game, delta) {
    for (const target of targets) {
      if (!target?.active) continue;
      for (const effect of target.statusEffects) {
        effect.remaining -= delta;
        if (effect.tickInterval == null) continue;
        effect.tickTimer -= delta;
        while (effect.tickTimer <= 0 && effect.remaining > 0 && target.active) {
          effect.tickTimer += effect.tickInterval;
          if (effect.type === "burn" || effect.type === "corrosion") {
            this.applyTickDamage(target, effect, game);
          }
        }
      }
      target.statusEffects = target.statusEffects.filter((effect) => effect.remaining > 0 && effect.stacks > 0);
    }
  }

  applyTickDamage(target, effect, game) {
    const damage = effect.potency * effect.stacks;
    const wasActive = target.active;
    this.applyDamage(target, damage, game);
    const x = target.x + target.width / 2;
    const y = target.y + target.height / 2;
    if (effect.type === "burn") {
      game.particleSystem.burn(game.level, x, y);
    } else {
      game.particleSystem.corrosion(game.level, x, y);
    }
    if (wasActive && !target.active) {
      game.particleSystem.burst(game.level, x, y);
    }
  }
}

function centerOf(entity) {
  return {
    x: entity.x + entity.width / 2,
    y: entity.y + entity.height / 2,
  };
}

function stableTargetKey(target) {
  return `${target.kind}:${target.id}`;
}

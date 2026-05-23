import { Brick } from "../entities/Brick.js";
import { Projectile } from "../entities/Projectile.js";
import { BRICK_TYPES } from "../data/brickTypes.js";
import { ARENA, clamp } from "../core/Physics.js";

export class BossSystem {
  update(game, delta) {
    const boss = game.level?.boss;
    if (!boss?.active) return;

    boss.update(delta);
    this.updatePhase(boss, game);
    this.updateAttacks(boss, game, delta);
  }

  updatePhase(boss, game) {
    const nextPhase = boss.phaseThresholds.find((threshold) =>
      boss.phase < threshold.phase && boss.hpRatio <= threshold.hpRatio
    );
    if (!nextPhase) return;

    boss.phase = nextPhase.phase;
    boss.armor = boss.baseArmor + (nextPhase.armorBonus || 0);
    game.particleSystem.burst(
      game.level,
      boss.x + boss.width / 2,
      boss.y + boss.height / 2,
      boss.palette?.core || "rgba(155, 212, 106, 0.86)",
    );
  }

  updateAttacks(boss, game, delta) {
    for (const attack of boss.attacks) {
      const state = boss.attackState[attack.id];
      state.timer -= delta;
      if (state.timer > 0) continue;

      this.executeAttack(boss, attack, game);
      const phaseMultiplier = boss.phase >= 3 ? 0.62 : boss.phase >= 2 ? 0.78 : 1;
      state.timer = attack.cooldown * phaseMultiplier;
    }
  }

  executeAttack(boss, attack, game) {
    if (attack.kind === "spawnGuardBricks") {
      this.spawnGuardBricks(boss, attack, game);
    }
    if (attack.kind === "rockProjectiles") {
      this.spawnRockProjectiles(boss, attack, game);
    }
    if (attack.kind === "fallingProjectiles") {
      this.spawnFallingProjectiles(boss, attack, game);
    }
    if (attack.kind === "fanProjectiles") {
      this.spawnFanProjectiles(boss, attack, game);
    }
  }

  spawnGuardBricks(boss, attack, game) {
    const activeGuards = game.level.bricks.filter((brick) =>
      brick.active && brick.ownerId === boss.id && brick.tags.includes("boss_summon")
    );
    if (activeGuards.length >= attack.maxActive) return;

    const count = this.getPhaseCount(boss, attack);
    const slots = this.getGuardSlots(boss);
    const openSlots = slots.filter((slot) =>
      !game.level.bricks.some((brick) =>
        brick.active && Math.abs(brick.x - slot.x) < 4 && Math.abs(brick.y - slot.y) < 4
      )
    );

    const spawnCount = Math.min(count, Math.max(0, attack.maxActive - activeGuards.length));
    for (const slot of openSlots.slice(0, spawnCount)) {
      const guard = this.createGuardBrick(boss, slot, game);
      game.level.bricks.push(guard);
      game.particleSystem.hit(
        game.level,
        guard.x + guard.width / 2,
        guard.y + guard.height / 2,
        boss.palette?.accent || "rgba(219, 232, 137, 0.9)",
      );
    }
  }

  createGuardBrick(boss, slot, game) {
    const definition = {
      ...boss.summons.guardBrick,
      x: slot.x,
      y: slot.y,
      tags: ["boss_summon"],
      ownerId: boss.id,
    };
    const type = BRICK_TYPES[definition.type] || BRICK_TYPES.basic;
    return new Brick(game.level.nextBrickId++, definition, type);
  }

  getGuardSlots(boss) {
    const y = boss.y + boss.height + 24;
    const width = boss.summons.guardBrick.width;
    return [-2.5, -1.5, -0.5, 0.5, 1.5, 2.5].map((offset) => ({
      x: boss.x + boss.width / 2 + offset * (width + 10) - width / 2,
      y,
    }));
  }

  spawnRockProjectiles(boss, attack, game) {
    const count = this.getPhaseCount(boss, attack);
    const originY = boss.y + boss.height * (attack.originYRatio ?? 0.68);
    const targetX = game.level.paddle.x;
    const spread = attack.targetSpread ?? (count > 1 ? 58 : 0);
    const originStart = attack.originStart ?? 0.32;
    const originEnd = attack.originEnd ?? 0.68;
    const originSpan = originEnd - originStart;

    for (let index = 0; index < count; index += 1) {
      const offset = (index - (count - 1) / 2) * spread;
      const originRatio = count === 1 ? (originStart + originEnd) / 2 : originStart + originSpan * (index / Math.max(1, count - 1));
      const originX = boss.x + boss.width * originRatio;
      const aimX = targetX + offset;
      const dx = aimX - originX;
      const dy = game.level.paddle.y - 30 - originY;
      const length = Math.hypot(dx, dy) || 1;
      const speed = this.getPhaseSpeed(boss, attack);
      this.spawnProjectile(game, boss, attack, {
        x: originX,
        y: originY,
        vx: (dx / length) * speed,
        vy: (dy / length) * speed,
      });
    }
  }

  spawnFallingProjectiles(boss, attack, game) {
    const count = this.getPhaseCount(boss, attack);
    const speed = this.getPhaseSpeed(boss, attack);
    const radius = attack.radius || 9;
    const spread = attack.spread ?? 260;
    const originY = attack.origin === "boss" ? boss.y + boss.height * (attack.originYRatio ?? 0.72) : ARENA.top + radius;
    const wobble = attack.wobble || 0;

    for (let index = 0; index < count; index += 1) {
      const offset = (index - (count - 1) / 2) * (count > 1 ? spread / Math.max(1, count - 1) : 0);
      const laneX = ARENA.left + ((index + 1) / (count + 1)) * (ARENA.right - ARENA.left);
      const targetX = attack.aimMode === "lanes"
        ? laneX
        : game.level.paddle.x + offset + Math.sin(boss.driftTime * 1.7 + index) * wobble;
      const x = clamp(targetX, ARENA.left + radius, ARENA.right - radius);
      const drift = attack.aimMode === "lanes" ? Math.sin(boss.driftTime + index) * 18 : offset * 0.08;

      this.spawnProjectile(game, boss, attack, {
        x,
        y: originY,
        vx: drift,
        vy: speed,
      });
    }
  }

  spawnFanProjectiles(boss, attack, game) {
    const count = this.getPhaseCount(boss, attack);
    const speed = this.getPhaseSpeed(boss, attack);
    const centerAngle = attack.angleCenter ?? 90;
    const spread = attack.angleSpread ?? 60;
    const originX = boss.x + boss.width * (attack.originXRatio ?? 0.5);
    const originY = boss.y + boss.height * (attack.originYRatio ?? 0.68);

    for (let index = 0; index < count; index += 1) {
      const progress = count === 1 ? 0.5 : index / (count - 1);
      const angle = (centerAngle - spread / 2 + spread * progress) * (Math.PI / 180);
      this.spawnProjectile(game, boss, attack, {
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
      });
    }
  }

  spawnProjectile(game, boss, attack, motion) {
    game.level.projectiles.push(new Projectile(game.level.nextProjectileId++, {
      owner: "boss",
      ownerId: boss.id,
      type: attack.projectileType || attack.id || "boss_projectile",
      x: motion.x,
      y: motion.y,
      vx: motion.vx,
      vy: motion.vy,
      radius: attack.radius || 10,
      damage: attack.damage || 1,
      color: attack.color || boss.palette?.core || "rgba(133, 118, 91, 0.95)",
      accent: attack.accent || boss.palette?.accent || "rgba(226, 203, 143, 0.9)",
      life: attack.life || 7,
    }));
  }

  getPhaseCount(boss, attack) {
    if (boss.phase >= 3 && attack.phase3Count != null) return attack.phase3Count;
    if (boss.phase >= 2 && attack.phase2Count != null) return attack.phase2Count;
    return attack.count || 1;
  }

  getPhaseSpeed(boss, attack) {
    const phaseMultiplier = boss.phase >= 3 ? 1.22 : boss.phase >= 2 ? 1.12 : 1;
    return (attack.speed || 170) * phaseMultiplier;
  }
}

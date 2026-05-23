import { ARENA, circleRectCollision } from "../core/Physics.js";

export class ProjectileSystem {
  update(game, delta) {
    if (!game.level?.projectiles) return;

    for (const projectile of game.level.projectiles) {
      if (!projectile.active) continue;
      const distance = Math.hypot(projectile.vx, projectile.vy) * delta;
      const maxStepDistance = Math.max(4, projectile.radius);
      const substeps = Math.min(12, Math.max(1, Math.ceil(distance / maxStepDistance)));
      const step = delta / substeps;

      for (let i = 0; i < substeps; i += 1) {
        projectile.update(step);
        if (this.isOutOfBounds(projectile)) {
          projectile.active = false;
          break;
        }

        if (projectile.owner === "player") {
          this.resolvePlayerProjectile(projectile, game);
        } else if (circleRectCollision(projectile, game.level.paddle.rect)) {
          projectile.active = false;
          game.particleSystem.hit(game.level, projectile.x, projectile.y, "rgba(255, 126, 97, 0.95)");
          game.takeHostileHit(projectile);
          if (game.mode !== "playing" || !game.level) return;
        }

        if (!projectile.active) break;
      }
    }

    game.level.projectiles = game.level.projectiles.filter((projectile) => projectile.active);
  }

  resolvePlayerProjectile(projectile, game) {
    const hit = this.findTargetCollision(projectile, [
      ...game.level.bricks,
      ...game.level.enemies,
      ...(game.level.boss ? [game.level.boss] : []),
    ]);
    if (!hit) return;

    const { target, collision } = hit;
    const result = game.elementSystem.applyHit(
      {
        sourceId: projectile.id,
        sourceKind: projectile.kind,
        targetId: target.id,
        targetKind: target.kind,
        element: projectile.element,
        elements: projectile.elements,
        baseDamage: projectile.damage,
        critChance: projectile.critChance,
        critDamage: projectile.critDamage,
        pierceChance: projectile.pierceChance,
        statusPayload: null,
        collisionNormal: collision.normal,
        position: { x: collision.closestX, y: collision.closestY },
      },
      target,
      game,
    );

    if (result.destroyed) {
      game.particleSystem.burst(game.level, target.x + target.width / 2, target.y + target.height / 2);
    } else {
      game.particleSystem.hit(game.level, collision.closestX, collision.closestY, result.hitColor);
    }

    if (!result.pierced) {
      projectile.active = false;
    }
  }

  findTargetCollision(projectile, targets) {
    let best = null;
    for (const target of targets) {
      if (!target.active) continue;
      const collision = circleRectCollision(projectile, target);
      if (!collision) continue;
      if (
        !best ||
        collision.penetration > best.collision.penetration ||
        (collision.penetration === best.collision.penetration && stableTargetKey(target) < stableTargetKey(best.target))
      ) {
        best = { target, collision };
      }
    }
    return best;
  }

  isOutOfBounds(projectile) {
    return (
      projectile.x + projectile.radius < ARENA.left - 60 ||
      projectile.x - projectile.radius > ARENA.right + 60 ||
      projectile.y + projectile.radius < ARENA.top - 80 ||
      projectile.y - projectile.radius > ARENA.bottom + 120
    );
  }
}

function stableTargetKey(target) {
  return `${target.kind}:${target.id}`;
}

import {
  ARENA,
  circleRectCollision,
  clampSpeed,
  enforceVerticalVelocity,
  paddleBounceVelocity,
  reflectVelocity,
} from "../core/Physics.js";

export class CollisionSystem {
  updateBall(ball, game, delta) {
    if (!ball.active) return;
    ball.hitTargetsThisFrame.clear();

    if (ball.stuckToPaddle) {
      ball.stickTo(game.level.paddle);
      return;
    }

    const distance = Math.hypot(ball.vx, ball.vy) * delta;
    const maxStepDistance = Math.max(4, ball.radius * 0.55);
    const substeps = Math.min(18, Math.max(1, Math.ceil(distance / maxStepDistance)));
    const step = delta / substeps;

    for (let i = 0; i < substeps; i += 1) {
      ball.x += ball.vx * step;
      ball.y += ball.vy * step;

      this.resolveWalls(ball, game.stats);

      if (ball.vy > 0) {
        const paddleHit = circleRectCollision(ball, game.level.paddle.rect);
        if (paddleHit) {
          this.resolvePaddle(ball, game);
          continue;
        }
      }

      const targetHit = this.findTargetCollision(ball, game.level.bricks) ||
        this.findTargetCollision(ball, game.level.enemies) ||
        this.findTargetCollision(ball, game.level.boss ? [game.level.boss] : []);
      if (targetHit) {
        this.resolveTarget(ball, targetHit, game);
      }
    }
  }

  resolveWalls(ball, stats) {
    if (ball.x - ball.radius < ARENA.left) {
      ball.x = ARENA.left + ball.radius;
      ball.vx = Math.abs(ball.vx);
    } else if (ball.x + ball.radius > ARENA.right) {
      ball.x = ARENA.right - ball.radius;
      ball.vx = -Math.abs(ball.vx);
    }

    if (ball.y - ball.radius < ARENA.top) {
      ball.y = ARENA.top + ball.radius;
      ball.vy = Math.abs(ball.vy);
    }

    clampSpeed(ball, stats.ballMinSpeed, stats.ballMaxSpeed);
    enforceVerticalVelocity(ball);
  }

  resolvePaddle(ball, game) {
    const paddle = game.level.paddle;
    ball.y = paddle.y - paddle.height / 2 - ball.radius - 0.5;
    paddleBounceVelocity(ball, paddle, ball.speed);
    clampSpeed(ball, game.stats.ballMinSpeed, game.stats.ballMaxSpeed);
    enforceVerticalVelocity(ball, 0.3);
    game.audio.play("hit");
  }

  findTargetCollision(ball, targets) {
    let best = null;
    for (const target of targets) {
      const targetKey = stableTargetKey(target);
      if (!target.active || ball.hitTargetsThisFrame.has(targetKey)) continue;
      const collision = circleRectCollision(ball, target);
      if (!collision) continue;
      if (
        !best ||
        collision.penetration > best.collision.penetration ||
        (collision.penetration === best.collision.penetration && targetKey < stableTargetKey(best.target))
      ) {
        best = { target, collision };
      }
    }
    return best;
  }

  resolveTarget(ball, hit, game) {
    const { target, collision } = hit;
    ball.hitTargetsThisFrame.add(stableTargetKey(target));
    ball.x += collision.normal.x * (collision.penetration + 0.5);
    ball.y += collision.normal.y * (collision.penetration + 0.5);

    const result = game.elementSystem.applyHit(
      {
        sourceId: ball.id,
        sourceKind: ball.kind,
        targetId: target.id,
        targetKind: target.kind,
        element: ball.element,
        elements: ball.elements,
        baseDamage: ball.damage,
        critChance: ball.critChance,
        critDamage: ball.critDamage,
        pierceChance: ball.pierceChance,
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
      game.particleSystem.hit(
        game.level,
        collision.closestX,
        collision.closestY,
        result.hitColor,
      );
    }

    if (!result.pierced) {
      reflectVelocity(ball, collision.normal);
    }
    clampSpeed(ball, game.stats.ballMinSpeed, game.stats.ballMaxSpeed);
    enforceVerticalVelocity(ball);
    game.audio.play(result.destroyed ? "break" : "hit");
  }
}

function stableTargetKey(target) {
  return `${target.kind}:${target.id}`;
}

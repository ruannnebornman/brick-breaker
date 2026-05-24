import { ARENA, clamp } from "../core/Physics.js";

export class HazardSystem {
  update(game, delta) {
    if (!game.level?.hazards) return;

    for (const hazard of game.level.hazards) {
      if (!hazard.active) continue;
      hazard.update(delta);

      if (!rectsOverlap(hazard.rect, game.level.paddle.rect)) continue;

      if (hazard.contactBehavior === "block") {
        const moved = resolveBlockingHazard(hazard, game.level.paddle);
        if (moved && hazard.cooldownTimer <= 0) {
          hazard.cooldownTimer = hazard.tickRate;
          game.particleSystem.hit(
            game.level,
            game.level.paddle.x,
            game.level.paddle.y,
            "rgba(255, 190, 112, 0.92)",
          );
        }
        continue;
      }

      if (hazard.cooldownTimer <= 0) {
        hazard.cooldownTimer = hazard.tickRate;
        game.particleSystem.hit(
          game.level,
          game.level.paddle.x,
          game.level.paddle.y,
          "rgba(255, 126, 97, 0.95)",
        );
        game.takeHostileHit(hazard);
        if (game.mode !== "playing" || !game.level) return;
      }
    }
  }
}

function resolveBlockingHazard(hazard, paddle) {
  const minCenter = ARENA.left + paddle.width / 2;
  const maxCenter = ARENA.right - paddle.width / 2;
  const leftCenter = hazard.x - paddle.width / 2 - 0.5;
  const rightCenter = hazard.x + hazard.width + paddle.width / 2 + 0.5;
  const candidates = [];

  if (leftCenter >= minCenter) candidates.push(leftCenter);
  if (rightCenter <= maxCenter) candidates.push(rightCenter);

  if (candidates.length === 0) {
    candidates.push(clamp(leftCenter, minCenter, maxCenter));
    candidates.push(clamp(rightCenter, minCenter, maxCenter));
  }

  const originalX = paddle.x;
  const nextX = candidates.sort((a, b) => Math.abs(a - originalX) - Math.abs(b - originalX))[0];
  paddle.x = clamp(nextX, minCenter, maxCenter);
  paddle.targetX = paddle.x;

  return Math.abs(paddle.x - originalX) > 0.01;
}

function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

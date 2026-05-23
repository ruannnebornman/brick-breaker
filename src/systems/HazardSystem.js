import { circleRectCollision } from "../core/Physics.js";

export class HazardSystem {
  update(game, delta) {
    if (!game.level?.hazards) return;

    for (const hazard of game.level.hazards) {
      if (!hazard.active) continue;
      hazard.update(delta);
      if (hazard.cooldownTimer <= 0 && circleRectCollision(hazardHitCircle(hazard), game.level.paddle.rect)) {
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

function hazardHitCircle(hazard) {
  return {
    x: hazard.x + hazard.width / 2,
    y: hazard.y + hazard.height / 2,
    radius: Math.max(hazard.width, hazard.height) / 2,
  };
}

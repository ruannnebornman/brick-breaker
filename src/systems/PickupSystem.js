import { circleRectCollision } from "../core/Physics.js";

export class PickupSystem {
  update(game, delta) {
    const level = game.level;
    if (!level?.pickups) return;

    for (const pickup of level.pickups) {
      if (!pickup.active || pickup.collected) continue;
      pickup.update(delta, level.paddle);
      if (circleRectCollision(pickup, level.paddle.rect)) {
        game.collectPickup(pickup);
        continue;
      }
      if (pickup.y - pickup.radius > 620) {
        pickup.active = false;
        pickup.missed = true;
      }
    }

    level.pickups = level.pickups.filter((pickup) =>
      pickup.active || (pickup.collectOnClear && !pickup.collected)
    );
  }
}

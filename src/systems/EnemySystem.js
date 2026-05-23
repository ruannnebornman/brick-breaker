import { Projectile } from "../entities/Projectile.js";

export class EnemySystem {
  update(game, delta) {
    if (!game.level?.enemies) return;

    for (const enemy of game.level.enemies) {
      if (!enemy.active) continue;
      enemy.update(delta);
      if (enemy.behavior === "driftShooter") {
        this.updateShooter(enemy, game, delta);
      }
    }

    game.level.enemies = game.level.enemies.filter((enemy) => enemy.active);
  }

  updateShooter(enemy, game, delta) {
    if (!enemy.projectileCooldown) return;
    enemy.projectileTimer -= delta;
    if (enemy.projectileTimer > 0) return;
    enemy.projectileTimer = enemy.projectileCooldown;

    const originX = enemy.x + enemy.width / 2;
    const originY = enemy.y + enemy.height;
    const dx = game.level.paddle.x - originX;
    const dy = game.level.paddle.y - originY;
    const length = Math.hypot(dx, dy) || 1;
    const speed = 150;

    game.level.projectiles.push(new Projectile(game.level.nextProjectileId++, {
      owner: "enemy",
      ownerId: enemy.id,
      type: "training_bolt",
      x: originX,
      y: originY,
      vx: (dx / length) * speed,
      vy: (dy / length) * speed,
      radius: 8,
      damage: 1,
      color: "rgba(71, 126, 120, 0.96)",
      accent: "rgba(97, 215, 198, 0.92)",
      life: 6,
    }));
  }
}

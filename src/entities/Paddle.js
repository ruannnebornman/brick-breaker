import { ARENA, clamp } from "../core/Physics.js";

export class Paddle {
  constructor(stats) {
    this.kind = "paddle";
    this.x = ARENA.width / 2;
    this.y = 548;
    this.width = stats.paddleWidth;
    this.height = 18;
    this.speed = stats.paddleSpeed;
    this.targetX = this.x;
    this.cannonEnabled = stats.cannonEnabled || false;
    this.cannonCooldownDuration = stats.cannonCooldown || 1.15;
    this.cannonCooldownRemaining = 0;
    this.cannonProjectileCount = stats.cannonProjectileCount || 1;
    this.cannonDamageMultiplier = stats.cannonDamageMultiplier || 0.55;
  }

  update(delta, input, settings) {
    this.cannonCooldownRemaining = Math.max(0, this.cannonCooldownRemaining - delta);

    let direction = 0;
    if (input.isDown("ArrowLeft", "KeyA")) direction -= 1;
    if (input.isDown("ArrowRight", "KeyD")) direction += 1;

    if (direction !== 0) {
      this.x += direction * this.speed * delta;
      this.targetX = this.x;
    } else if (settings.mouseControl && input.pointer.active) {
      this.targetX = input.pointer.x;
      this.x = this.targetX;
    }

    this.x = clamp(this.x, ARENA.left + this.width / 2, ARENA.right - this.width / 2);
  }

  canFireCannon() {
    return this.cannonEnabled && this.cannonCooldownRemaining <= 0;
  }

  markCannonFired() {
    this.cannonCooldownRemaining = this.cannonCooldownDuration;
  }

  get rect() {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height / 2,
      width: this.width,
      height: this.height,
    };
  }
}

import { getRewardStyle } from "../data/rewardDrops.js";

export class Pickup {
  constructor(id, definition) {
    const style = getRewardStyle(definition.reward);
    this.id = id;
    this.kind = "pickup";
    this.reward = definition.reward;
    this.x = definition.x;
    this.y = definition.y;
    this.vx = definition.vx || 0;
    this.vy = definition.vy || style.fallSpeed;
    this.radius = definition.radius || 15;
    this.magnetStrength = definition.magnetStrength ?? style.magnetStrength;
    this.magnetRadius = definition.magnetRadius || 150;
    this.collectOnClear = definition.collectOnClear ?? style.collectOnClear;
    this.flightMode = definition.flightMode || "fall";
    this.flightDuration = definition.flightDuration || 0.32;
    this.startX = this.x;
    this.startY = this.y;
    this.absorbComplete = false;
    this.age = 0;
    this.active = true;
    this.collected = false;
    this.missed = false;
  }

  update(delta, paddle) {
    this.age += delta;
    if (this.flightMode === "absorb" && paddle) {
      const progress = Math.min(1, this.age / this.flightDuration);
      const eased = 1 - (1 - progress) ** 3;
      this.x = this.startX + (paddle.x - this.startX) * eased;
      this.y = this.startY + (paddle.y - this.startY) * eased;
      this.absorbComplete = progress >= 1;
      return;
    }

    if (this.magnetStrength > 0 && paddle) {
      const dx = paddle.x - this.x;
      const distance = Math.abs(dx);
      if (distance < this.magnetRadius) {
        const pull = (1 - distance / this.magnetRadius) * this.magnetStrength * delta;
        this.x += Math.sign(dx) * Math.min(distance, pull);
      }
    }
    this.x += this.vx * delta;
    this.y += this.vy * delta;
  }
}

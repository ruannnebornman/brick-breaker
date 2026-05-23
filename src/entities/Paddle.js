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
  }

  update(delta, input, settings) {
    let direction = 0;
    if (input.isDown("ArrowLeft", "KeyA")) direction -= 1;
    if (input.isDown("ArrowRight", "KeyD")) direction += 1;

    if (direction !== 0) {
      this.x += direction * this.speed * delta;
      this.targetX = this.x;
    } else if (settings.mouseControl && input.pointer.active) {
      this.targetX = input.pointer.x;
      const diff = this.targetX - this.x;
      const maxMove = this.speed * 1.35 * delta;
      this.x += clamp(diff, -maxMove, maxMove);
    }

    this.x = clamp(this.x, ARENA.left + this.width / 2, ARENA.right - this.width / 2);
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

export class Ball {
  constructor({ x, y, radius, speed, damage, critChance, critDamage, element = "normal" }) {
    this.id = crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
    this.kind = "ball";
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.radius = radius;
    this.speed = speed;
    this.damage = damage;
    this.critChance = critChance;
    this.critDamage = critDamage;
    this.element = element;
    this.stuckToPaddle = true;
    this.active = true;
    this.age = 0;
    this.hitTargetsThisFrame = new Set();
  }

  stickTo(paddle) {
    this.x = paddle.x;
    this.y = paddle.y - paddle.height / 2 - this.radius - 1;
    this.vx = 0;
    this.vy = 0;
    this.stuckToPaddle = true;
  }

  launch(angleOffset = 0) {
    const angle = (-90 + angleOffset) * (Math.PI / 180);
    this.vx = Math.cos(angle) * this.speed;
    this.vy = Math.sin(angle) * this.speed;
    this.stuckToPaddle = false;
  }
}

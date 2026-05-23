export class Enemy {
  constructor(id, definition, type) {
    this.id = id;
    this.kind = "enemy";
    this.type = type.id;
    this.name = type.name;
    this.x = definition.x;
    this.y = definition.y;
    this.baseX = definition.x;
    this.width = definition.width ?? type.width;
    this.height = definition.height ?? type.height;
    this.maxHp = definition.hp ?? type.baseHp;
    this.hp = this.maxHp;
    this.armor = definition.armor ?? type.armor;
    this.contactDamage = definition.contactDamage ?? type.contactDamage;
    this.requiredForClear = definition.requiredForClear ?? type.requiredForClear;
    this.behavior = definition.behavior ?? type.behavior;
    this.speed = definition.speed ?? type.speed;
    this.patrolMinX = definition.patrolMinX ?? this.x - 70;
    this.patrolMaxX = definition.patrolMaxX ?? this.x + 70;
    this.projectileCooldown = definition.projectileCooldown ?? type.projectileCooldown ?? 0;
    this.projectileTimer = definition.initialProjectileCooldown ?? this.projectileCooldown;
    this.assetId = type.assetId;
    this.palette = definition.palette || type.palette;
    this.statusEffects = [];
    this.active = true;
    this.direction = 1;
    this.driftTime = 0;
  }

  update(delta) {
    this.driftTime += delta;
    if (this.behavior === "horizontalPatrol") {
      this.x += this.direction * this.speed * delta;
      if (this.x <= this.patrolMinX || this.x + this.width >= this.patrolMaxX) {
        this.direction *= -1;
        this.x = Math.max(this.patrolMinX, Math.min(this.x, this.patrolMaxX - this.width));
      }
    } else if (this.behavior === "driftShooter") {
      this.x = this.baseX + Math.sin(this.driftTime * 0.9) * 58;
      this.y += Math.sin(this.driftTime * 1.4) * 4 * delta;
    }
  }

  get hpRatio() {
    return Math.max(0, this.hp / this.maxHp);
  }
}

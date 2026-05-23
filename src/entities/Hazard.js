export class Hazard {
  constructor(id, definition, type) {
    this.id = id;
    this.kind = "hazard";
    this.type = type.id;
    this.name = type.name;
    this.x = definition.x;
    this.y = definition.y;
    this.width = definition.width ?? type.width;
    this.height = definition.height ?? type.height;
    this.damage = definition.damage ?? type.damage;
    this.tickRate = definition.tickRate ?? type.tickRate;
    this.cooldownTimer = definition.initialCooldown ?? 0;
    this.assetId = type.assetId;
    this.palette = definition.palette || type.palette;
    this.active = true;
  }

  update(delta) {
    this.cooldownTimer = Math.max(0, this.cooldownTimer - delta);
  }
}

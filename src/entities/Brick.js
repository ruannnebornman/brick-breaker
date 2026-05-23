export class Brick {
  constructor(id, definition, type) {
    this.id = id;
    this.kind = "brick";
    this.type = type.id;
    this.x = definition.x;
    this.y = definition.y;
    this.width = definition.width;
    this.height = definition.height;
    this.maxHp = definition.hp ?? type.baseHp;
    this.hp = this.maxHp;
    this.armor = definition.armor ?? type.armor;
    this.requiredForClear = definition.requiredForClear ?? type.requiredForClear;
    this.active = true;
    this.assetHealthy = type.assetHealthy;
    this.assetDamaged = type.assetDamaged;
    this.statusEffects = [];
  }

  get hpRatio() {
    return Math.max(0, this.hp / this.maxHp);
  }
}

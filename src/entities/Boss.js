export class Boss {
  constructor(definition) {
    this.id = definition.id;
    this.kind = "boss";
    this.name = definition.name;
    this.x = definition.x;
    this.y = definition.y;
    this.baseX = definition.x;
    this.width = definition.width;
    this.height = definition.height;
    this.maxHp = definition.hp;
    this.hp = this.maxHp;
    this.armor = definition.armor || 0;
    this.requiredForClear = true;
    this.active = true;
    this.statusEffects = [];
    this.assetIdle = definition.assetIdle;
    this.assetDamaged = definition.assetDamaged;
    this.driftTime = 0;
  }

  update(delta) {
    this.driftTime += delta;
    this.x = this.baseX + Math.sin(this.driftTime * 0.9) * 18;
  }

  get hpRatio() {
    return Math.max(0, this.hp / this.maxHp);
  }
}

export class Boss {
  constructor(definition) {
    this.id = definition.id;
    this.kind = "boss";
    this.name = definition.name;
    this.level = definition.level || 0;
    const hitbox = definition.hitbox || definition;
    this.x = hitbox.x;
    this.y = hitbox.y;
    this.baseX = hitbox.x;
    this.width = hitbox.width;
    this.height = hitbox.height;
    this.maxHp = definition.hp ?? definition.baseHp;
    this.hp = this.maxHp;
    this.armor = definition.armor || 0;
    this.baseArmor = this.armor;
    this.resistances = definition.resistances || {};
    this.weaknesses = definition.weaknesses || {};
    this.requiredForClear = true;
    this.active = true;
    this.statusEffects = [];
    this.assetIdle = definition.assetIdle;
    this.assetDamaged = definition.assetDamaged;
    this.palette = definition.palette || null;
    this.visual = definition.visual || {};
    this.phase = 1;
    this.phaseThresholds = definition.phaseThresholds || [];
    this.attacks = definition.attacks || [];
    this.attackState = Object.fromEntries(this.attacks.map((attack) => [
      attack.id,
      { timer: attack.initialCooldown ?? attack.cooldown ?? 1 },
    ]));
    this.summons = definition.summons || {};
    this.behavior = definition.behavior || { kind: "trainingDrift", amplitude: 18, speed: 0.9 };
    this.driftTime = 0;
  }

  update(delta) {
    this.driftTime += delta;
    const amplitude = this.behavior.amplitude ?? 18;
    const speed = this.behavior.speed ?? 0.9;
    this.x = this.baseX + Math.sin(this.driftTime * speed) * amplitude;
  }

  get hpRatio() {
    return Math.max(0, this.hp / this.maxHp);
  }
}

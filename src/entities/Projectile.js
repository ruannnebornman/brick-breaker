export class Projectile {
  constructor(id, definition) {
    this.id = id;
    this.kind = "projectile";
    this.owner = definition.owner || "boss";
    this.ownerId = definition.ownerId || null;
    this.type = definition.type || "rock";
    this.assetId = definition.assetId || null;
    this.x = definition.x;
    this.y = definition.y;
    this.vx = definition.vx || 0;
    this.vy = definition.vy || 0;
    this.radius = definition.radius || 10;
    this.damage = definition.damage || 1;
    this.element = definition.element || "normal";
    this.elements = normalizeElements(definition.elements, this.element);
    this.critChance = definition.critChance || 0;
    this.critDamage = definition.critDamage || 1.5;
    this.pierceChance = definition.pierceChance || 0;
    this.color = definition.color || "rgba(133, 118, 91, 0.95)";
    this.accent = definition.accent || "rgba(226, 203, 143, 0.9)";
    this.life = definition.life || 7;
    this.age = 0;
    this.active = true;
  }

  update(delta) {
    this.age += delta;
    this.x += this.vx * delta;
    this.y += this.vy * delta;
    if (this.age >= this.life) {
      this.active = false;
    }
  }
}

function normalizeElements(elements, fallback) {
  const list = Array.isArray(elements) && elements.length > 0 ? elements : [fallback];
  return [...new Set(list.filter(Boolean))];
}

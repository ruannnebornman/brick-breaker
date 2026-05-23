export const BRICK_TYPES = {
  basic: {
    id: "basic",
    name: "Basic",
    baseHp: 10,
    armor: 0,
    requiredForClear: true,
    assetHealthy: "brick_basic_healthy",
    assetDamaged: "brick_basic_damaged",
  },
  armored: {
    id: "armored",
    name: "Armored",
    baseHp: 16,
    armor: 2,
    requiredForClear: true,
    assetHealthy: "brick_armored_healthy",
    assetDamaged: "brick_armored_damaged",
  },
};

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function getDifficulty(levelNumber) {
  const levelIndex = Math.max(0, levelNumber - 5);
  const biomeIndex = Math.floor(levelIndex / 10);
  return 1 + levelIndex * 0.018 + biomeIndex * 0.06;
}

export function getBrickHealth(levelNumber, brickType, biome) {
  const multiplier = biome?.brickHpMultiplier ?? 1;
  if (levelNumber < 15) {
    return Math.max(1, Math.round(brickType.baseHp * multiplier));
  }
  return Math.max(1, Math.round(brickType.baseHp * getDifficulty(levelNumber) * multiplier));
}

export function getBrickArmor(levelNumber, brickType, biome) {
  const baseArmor = brickType.armor ?? brickType.baseArmor ?? 0;
  if (levelNumber < 15) {
    return biome?.armorBonus ?? 0;
  }
  return baseArmor + Math.floor(levelNumber / 15) + (biome?.armorBonus ?? 0);
}

export function getBrickCount(levelNumber) {
  if (levelNumber < 15) {
    return clamp(3 + Math.floor((levelNumber - 1) * 0.35), 3, 7);
  }
  const biomeIndex = Math.floor(Math.max(0, levelNumber - 1) / 10);
  return clamp(5 + Math.floor((levelNumber - 15) * 0.16) + biomeIndex, 5, 24);
}

export function getSpecialBrickChance(levelNumber) {
  if (levelNumber < 15) return 0.02;
  return clamp(0.035 + levelNumber * 0.003, 0.035, 0.38);
}

export function getLevelReward(levelNumber, { isBossLevel = false } = {}) {
  const baseCoins = 20 + levelNumber * 7;
  return {
    coins: Math.round(baseCoins * (isBossLevel ? 1.6 : 1)),
  };
}

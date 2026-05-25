import { Random } from "../core/Random.js";
import { BIOMES } from "./biomes.js";
import { BOSSES } from "./bosses.js";
import { BRICK_TYPES } from "./brickTypes.js";
import {
  CAMPAIGN_MAX_LEVEL,
  FIRST_GENERATED_LEVEL,
  GENERATED_PATTERN_SEQUENCE,
  GENERATED_LEVEL_SEQUENCE,
  LEVEL_BOUNDS,
  LEVEL_LAYOUT_PATTERNS,
} from "./levelRules.js";
import {
  getBrickArmor,
  getBrickCount,
  getBrickHealth,
  getSpecialBrickChance,
} from "./scaling.js";
import {
  cloneReward,
  createRewardForLevelSlot,
  getRewardBlockCount,
} from "./rewardDrops.js";

export { CAMPAIGN_MAX_LEVEL, FIRST_GENERATED_LEVEL };

export const AUTHORED_LEVELS = [
  {
    levelNumber: 1,
    seedOffset: 101,
    biomeId: "grasslands_training_ruins",
    isBossLevel: false,
    name: "Training Rows",
    layoutPattern: "authored_rows",
    visualVariant: "default",
    bricks: grid([
      "bbb",
    ], 240, 108, 140, 52, 30, 8),
  },
  {
    levelNumber: 2,
    seedOffset: 202,
    biomeId: "grasslands_training_ruins",
    isBossLevel: false,
    name: "Broken Gate",
    layoutPattern: "authored_gate",
    visualVariant: "sunlit_stone",
    bricks: grid([
      "bbbbb",
    ], 160, 92, 112, 42, 20, 10),
  },
  {
    levelNumber: 3,
    seedOffset: 303,
    biomeId: "grasslands_training_ruins",
    isBossLevel: false,
    name: "Training Wall",
    layoutPattern: "authored_wall",
    visualVariant: "default",
    bricks: grid([
      "bbabb",
      " bb ",
    ], 160, 84, 112, 40, 20, 10),
  },
  {
    levelNumber: 4,
    seedOffset: 404,
    biomeId: "grasslands_training_ruins",
    isBossLevel: false,
    name: "Ruin Steps",
    layoutPattern: "authored_steps",
    visualVariant: "moss_depths",
    bricks: grid([
      "bbabb",
      "bbbb ",
    ], 160, 76, 112, 40, 20, 10),
  },
  {
    levelNumber: 5,
    seedOffset: 505,
    biomeId: "grasslands_training_ruins",
    isBossLevel: true,
    name: "Training Core",
    layoutPattern: "training_core",
    visualVariant: "cyan_ruins",
    bricks: [],
    boss: {
      id: "training_core",
      name: "Training Core",
      x: 300,
      y: 88,
      width: 360,
      height: 128,
      hp: 90,
      armor: 1,
      assetIdle: "boss_training_core_idle",
      assetDamaged: "boss_training_core_damaged",
    },
  },
];

export const MVP_LEVELS = AUTHORED_LEVELS;

const FIRST_THORN_HAZARD_LEVEL = 36;
const SECOND_THORN_HAZARD_LEVEL = 48;

export function getLevelDefinition(levelNumber, runSeed = 1, rewardContext = {}) {
  const safeLevel = clampLevel(levelNumber);
  const authored = AUTHORED_LEVELS.find((level) => level.levelNumber === safeLevel);
  if (authored) {
    return attachRewardBlocks(cloneDefinition(authored), runSeed, rewardContext);
  }

  const boss = getBossDefinition(safeLevel);
  if (boss) {
    return createBossLevel(boss, runSeed, rewardContext);
  }

  const generated = attachRewardBlocks(generateCampaignLevel(safeLevel, runSeed), runSeed, rewardContext);
  const validation = validateLevelDefinition(generated);
  if (validation.valid) {
    return generated;
  }

  return attachRewardBlocks(createFallbackLevel(safeLevel, runSeed, validation.errors), runSeed, rewardContext);
}

export function validateLevelDefinition(definition) {
  const errors = [];
  const requiredBricks = definition.bricks.filter((brick) => brick.requiredForClear !== false);

  if (requiredBricks.length === 0 && !definition.boss) {
    errors.push("level has no required clear target");
  }

  definition.bricks.forEach((brick, index) => {
    if (!Number.isFinite(brick.x) || !Number.isFinite(brick.y)) {
      errors.push(`brick ${index + 1} has invalid position`);
    }
    if (brick.width <= 0 || brick.height <= 0) {
      errors.push(`brick ${index + 1} has invalid size`);
    }
    if (
      brick.x < LEVEL_BOUNDS.left ||
      brick.y < LEVEL_BOUNDS.top ||
      brick.x + brick.width > LEVEL_BOUNDS.right ||
      brick.y + brick.height > LEVEL_BOUNDS.bottom
    ) {
      errors.push(`brick ${index + 1} is outside safe bounds`);
    }
  });

  (definition.enemies || []).forEach((enemy, index) => {
    if (!Number.isFinite(enemy.x) || !Number.isFinite(enemy.y)) {
      errors.push(`enemy ${index + 1} has invalid position`);
    }
    if (
      enemy.x < LEVEL_BOUNDS.left ||
      enemy.y < LEVEL_BOUNDS.top ||
      enemy.x + 60 > LEVEL_BOUNDS.right ||
      enemy.y + 50 > LEVEL_BOUNDS.bottom
    ) {
      errors.push(`enemy ${index + 1} is outside safe bounds`);
    }
  });

  (definition.hazards || []).forEach((hazard, index) => {
    if (!Number.isFinite(hazard.x) || !Number.isFinite(hazard.y)) {
      errors.push(`hazard ${index + 1} has invalid position`);
    }
    if (
      hazard.x < LEVEL_BOUNDS.left ||
      hazard.y < LEVEL_BOUNDS.top ||
      hazard.x + (hazard.width || 132) > LEVEL_BOUNDS.right ||
      hazard.y + (hazard.height || 26) > 570
    ) {
      errors.push(`hazard ${index + 1} is outside safe bounds`);
    }
  });

  for (let i = 0; i < definition.bricks.length; i += 1) {
    for (let j = i + 1; j < definition.bricks.length; j += 1) {
      if (rectsOverlap(definition.bricks[i], definition.bricks[j])) {
        errors.push(`bricks ${i + 1} and ${j + 1} overlap`);
      }
    }
  }

  if (definition.boss) {
    const boss = definition.boss;
    if (
      boss.x < LEVEL_BOUNDS.left ||
      boss.y < LEVEL_BOUNDS.top ||
      boss.x + boss.width > LEVEL_BOUNDS.right ||
      boss.y + boss.height > LEVEL_BOUNDS.bottom
    ) {
      errors.push("boss is outside safe bounds");
    }
    if (definition.bricks.some((brick) => rectsOverlap(brick, boss))) {
      errors.push("boss overlaps a brick");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function generateCampaignLevel(levelNumber, runSeed) {
  const seed = levelSeed(runSeed, levelNumber);
  const rng = new Random(seed);
  const pattern = getPatternForLevel(levelNumber, rng);
  const biome = getBiomeForLevel(levelNumber);
  const quickRamp = levelNumber < 15;
  const chapterProgress = ((levelNumber - 1) % 10) / 9;
  const biomeIndex = Math.floor((levelNumber - 1) / 10);
  const rows = quickRamp ? 3 : Math.min(6, 4 + Math.floor(chapterProgress * 3));
  const columns = quickRamp ? 6 : Math.min(10, 7 + Math.floor(biomeIndex / 2));
  const brickWidth = quickRamp ? 104 : columns >= 10 ? 56 : columns >= 9 ? 60 : 66;
  const brickHeight = quickRamp ? 42 : 28;
  const gapX = quickRamp ? 14 : 8;
  const gapY = quickRamp ? 12 : 8;
  const totalWidth = columns * brickWidth + (columns - 1) * gapX;
  const startX = Math.round((960 - totalWidth) / 2);
  const startY = pattern.id === "gauntlet" ? 58 : 66 + rng.int(-8, 8);
  const targetCount = Math.min(rows * columns, getBrickCount(levelNumber));
  const cells = choosePatternCells(pattern.id, rows, columns, targetCount, rng);
  const specialChance = getSpecialBrickChance(levelNumber) + (pattern.id === "gauntlet" ? 0.04 : 0);

  return {
    levelNumber,
    seed,
    seedOffset: levelNumber * 101,
    biomeId: biome.id,
    isBossLevel: false,
    name: getGeneratedLevelName(biome, pattern, levelNumber),
    layoutPattern: pattern.id,
    visualVariant: pattern.visualVariant,
    generated: true,
    enemies: createGeneratedEnemies(levelNumber, rng),
    hazards: createGeneratedHazards(levelNumber),
    bricks: cells.map((cell, index) => {
      const forcedArmor = pattern.id === "gauntlet" && (cell.row === 0 || index % 7 === 0);
      const typeId = forcedArmor || rng.chance(specialChance) ? "armored" : "basic";
      return createGeneratedBrick({
        typeId,
        x: startX + cell.column * (brickWidth + gapX),
        y: startY + cell.row * (brickHeight + gapY),
        width: brickWidth,
        height: brickHeight,
        levelNumber,
        biome,
        patternId: pattern.id,
      });
    }),
  };
}

function choosePatternCells(patternId, rows, columns, targetCount, rng) {
  const allCells = [];
  const chosen = [];

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const cell = { row, column };
      allCells.push(cell);
      if (matchesPattern(patternId, row, column, rows, columns, rng)) {
        chosen.push(cell);
      }
    }
  }

  if (chosen.length < targetCount) {
    const chosenKeys = new Set(chosen.map(cellKey));
    const extras = shuffle(allCells.filter((cell) => !chosenKeys.has(cellKey(cell))), rng);
    chosen.push(...extras.slice(0, targetCount - chosen.length));
  }

  const selected = chosen.length > targetCount ? shuffle(chosen, rng).slice(0, targetCount) : chosen;
  return selected.sort((a, b) => a.row - b.row || a.column - b.column);
}

function matchesPattern(patternId, row, column, rows, columns, rng) {
  const center = (columns - 1) / 2;

  if (patternId === "columns") {
    return column % 3 !== 1 || row >= rows - 2 || rng.chance(0.2);
  }

  if (patternId === "fortress") {
    const isOuter = row === 0 || row === rows - 1 || column === 0 || column === columns - 1;
    const isInnerBrace = row >= 2 && row <= rows - 2 && Math.abs(column - center) <= 1;
    return isOuter || isInnerBrace || rng.chance(0.28);
  }

  if (patternId === "gaps") {
    const lane = 2 + ((row * 2 + columns) % Math.max(3, columns - 3));
    return Math.abs(column - lane) > 0 && rng.chance(row % 2 === 0 ? 0.84 : 0.68);
  }

  if (patternId === "chevrons") {
    const distance = Math.abs(column - center);
    const chevron = Math.abs(distance - (row + 1)) <= 1 || row === rows - 1;
    return chevron || rng.chance(0.38);
  }

  if (patternId === "gauntlet") {
    const gateColumn = Math.floor(center);
    const gateGap = row < 3 && Math.abs(column - gateColumn) <= 1;
    return !gateGap || row === rows - 1 || rng.chance(0.35);
  }

  if (patternId === "arc") {
    const arc = Math.abs(row - Math.round(Math.abs(column - center) * 0.65)) <= 1;
    return arc || row === rows - 1 || rng.chance(0.25);
  }

  if (patternId === "split") {
    const splitGap = Math.abs(column - center) < 1 && row < rows - 1;
    return !splitGap && (row % 2 === 0 || rng.chance(0.65));
  }

  if (patternId === "spiral") {
    const ring = row === 0 || column === 0 || row === rows - 1 || column === columns - 1;
    const turn = row >= 1 && row <= rows - 2 && column >= 2 && column <= columns - 3 && (row + column) % 3 !== 0;
    return ring || turn || rng.chance(0.18);
  }

  if (patternId === "lattice") {
    return row % 2 === 0 || column % 3 === 0 || rng.chance(0.22);
  }

  return rng.chance(0.7);
}

function createFallbackLevel(levelNumber, runSeed, errors) {
  const biome = getBiomeForLevel(levelNumber);
  const seed = levelSeed(runSeed, levelNumber);
  const bricks = grid([
    "bbbbbbbb",
    "bbbaabbb",
    " bbbbbb ",
    "  bbbb  ",
  ], 232, 82, 62, 28, 6, 8).map((brick) => createGeneratedBrick({
    typeId: brick.type,
    x: brick.x,
    y: brick.y,
    width: brick.width,
    height: brick.height,
    levelNumber,
    biome,
    patternId: "fallback",
  }));

  return {
    levelNumber,
    seed,
    seedOffset: levelNumber * 101,
    biomeId: biome.id,
    isBossLevel: false,
    name: "Safe Training Grid",
    layoutPattern: "fallback",
    visualVariant: "default",
    generated: true,
    fallbackReason: errors.join("; "),
    enemies: [],
    hazards: [],
    bricks,
  };
}

function createBossLevel(boss, runSeed, rewardContext = {}) {
  const seed = levelSeed(runSeed, boss.level);
  return {
    levelNumber: boss.level,
    seed,
    seedOffset: boss.level * 101,
    biomeId: boss.biomeId,
    isBossLevel: true,
    name: boss.name,
    layoutPattern: boss.id,
    visualVariant: boss.visualVariant || "default",
    generated: true,
    bricks: createBossRewardBricks(boss, seed, rewardContext),
    enemies: [],
    hazards: [],
    boss: {
      ...boss,
      hp: boss.baseHp,
    },
  };
}

function createBossRewardBricks(boss, seed, rewardContext = {}) {
  const count = getRewardBlockCount(boss.level, { isBossLevel: true });
  if (count <= 0) return [];
  const slots = [
    { x: 338, y: 252 },
    { x: 506, y: 252 },
  ];
  const reservedRunScopedUpgrades = {};
  return slots.slice(0, count).map((slot, index) => {
    const reward = createRewardForLevelSlot(boss.level, index, seed, {
      ...rewardContext,
      reservedRunScopedUpgrades,
      isBossLevel: true,
    });
    reserveReward(reward, reservedRunScopedUpgrades);
    return {
      type: "basic",
      x: slot.x,
      y: slot.y,
      width: 116,
      height: 34,
      hp: 18 + Math.floor(boss.level / 10) * 3,
      armor: Math.floor(boss.level / 30),
      requiredForClear: true,
      palette: { fill: "#6c5f3f", accent: "#ffe896" },
      reward,
    };
  });
}

function createGeneratedEnemies(levelNumber, rng) {
  if (levelNumber < 14 || levelNumber % 10 === 0) return [];

  const enemies = [];
  if (levelNumber >= 14) {
    enemies.push({
      type: "slow_sentry",
      x: rng.int(236, 330),
      y: 262,
      patrolMinX: 210,
      patrolMaxX: 430,
      requiredForClear: true,
    });
  }

  if (levelNumber >= 18) {
    enemies.push({
      type: "training_drone",
      x: rng.int(560, 650),
      y: 248,
      initialProjectileCooldown: 5.2,
      requiredForClear: true,
    });
  }

  if (levelNumber >= 24) {
    enemies.push({
      type: "slow_sentry",
      x: rng.int(616, 700),
      y: 318,
      patrolMinX: 560,
      patrolMaxX: 790,
      requiredForClear: true,
    });
  }

  return enemies;
}

function createGeneratedHazards(levelNumber) {
  if (levelNumber < FIRST_THORN_HAZARD_LEVEL || levelNumber % 10 === 0) return [];

  const hazards = [
    {
      type: "thorn_patch",
      x: 88,
      y: 530,
      width: 132,
      height: 26,
    },
  ];

  if (levelNumber >= SECOND_THORN_HAZARD_LEVEL) {
    hazards.push({
      type: "thorn_patch",
      x: 740,
      y: 530,
      width: 132,
      height: 26,
    });
  }

  return hazards;
}

function createGeneratedBrick({ typeId, x, y, width, height, levelNumber, biome, patternId }) {
  const type = BRICK_TYPES[typeId] || BRICK_TYPES.basic;
  return {
    type: type.id,
    x,
    y,
    width,
    height,
    hp: getBrickHealth(levelNumber, type, biome),
    armor: getBrickArmor(levelNumber, type, biome),
    requiredForClear: true,
    palette: getBrickPalette(type.id, patternId, biome),
  };
}

function attachRewardBlocks(definition, runSeed, rewardContext = {}) {
  const rewardCount = getRewardBlockCount(definition.levelNumber, {
    isBossLevel: definition.isBossLevel === true,
  });
  if (rewardCount <= 0) return definition;

  const seed = definition.seed || levelSeed(runSeed, definition.levelNumber);
  if (definition.bricks.length === 0 && definition.boss) {
    return {
      ...definition,
      bricks: createBossCacheRewardBricks(definition.levelNumber, rewardCount, seed, rewardContext),
    };
  }

  if (definition.bricks.length === 0) return definition;

  const rng = new Random((seed + 0x51f15e) >>> 0);
  const requiredIndices = definition.bricks
    .map((brick, index) => ({ brick, index }))
    .filter(({ brick }) => brick.requiredForClear !== false)
    .map(({ index }) => index);
  const shuffled = shuffle(requiredIndices, rng).slice(0, rewardCount);
  const rewardIndices = new Set(shuffled);
  const reservedRunScopedUpgrades = {};
  let slot = 0;

  return {
    ...definition,
    bricks: definition.bricks.map((brick, index) => {
      if (!rewardIndices.has(index)) return brick;
      const reward = createRewardForLevelSlot(definition.levelNumber, slot, seed, {
        ...rewardContext,
        reservedRunScopedUpgrades,
        isBossLevel: definition.isBossLevel === true,
      });
      reserveReward(reward, reservedRunScopedUpgrades);
      slot += 1;
      return {
        ...brick,
        reward: cloneReward(reward),
      };
    }),
  };
}

function createBossCacheRewardBricks(levelNumber, rewardCount, seed, rewardContext = {}) {
  const slots = [
    { x: 338, y: 252 },
    { x: 506, y: 252 },
  ];
  const reservedRunScopedUpgrades = {};
  return slots.slice(0, rewardCount).map((slot, index) => {
    const reward = createRewardForLevelSlot(levelNumber, index, seed, {
      ...rewardContext,
      reservedRunScopedUpgrades,
      isBossLevel: true,
    });
    reserveReward(reward, reservedRunScopedUpgrades);
    return {
      type: "basic",
      x: slot.x,
      y: slot.y,
      width: 116,
      height: 34,
      hp: 14 + Math.floor(levelNumber / 10) * 3,
      armor: Math.floor(levelNumber / 30),
      requiredForClear: true,
      palette: { fill: "#6c5f3f", accent: "#ffe896" },
      reward: cloneReward(reward),
    };
  });
}

function reserveReward(reward, reservedRunScopedUpgrades) {
  if (reward?.kind !== "runScopedUpgrade" || !reward.upgradeId) return;
  reservedRunScopedUpgrades[reward.upgradeId] = (reservedRunScopedUpgrades[reward.upgradeId] || 0) + 1;
}

function getBrickPalette(typeId, patternId, biome = BIOMES.grasslands_training_ruins) {
  const biomePalette = biome.palette || BIOMES.grasslands_training_ruins.palette;
  if (typeId === "armored") {
    return patternId === "gauntlet"
      ? { fill: "#5c6561", accent: biomePalette.secondary }
      : { fill: "#657079", accent: biomePalette.primary };
  }

  if (patternId === "moss_depths" || patternId === "fortress" || patternId === "gauntlet") {
    return { fill: biomePalette.brick, accent: biomePalette.secondary };
  }

  if (patternId === "sunlit_stone" || patternId === "gaps") {
    return { fill: biomePalette.brick, accent: biomePalette.secondary };
  }

  return { fill: biomePalette.brick, accent: biomePalette.primary };
}

function grid(rows, startX, startY, width, height, gapX, gapY) {
  const bricks = [];
  rows.forEach((row, rowIndex) => {
    [...row].forEach((cell, columnIndex) => {
      if (cell === " ") return;
      bricks.push({
        type: cell === "a" ? "armored" : "basic",
        x: startX + columnIndex * (width + gapX),
        y: startY + rowIndex * (height + gapY),
        width,
        height,
        requiredForClear: true,
      });
    });
  });
  return bricks;
}

function cloneDefinition(definition) {
  return {
    ...definition,
    bricks: definition.bricks.map((brick) => ({
      ...brick,
      palette: brick.palette ? { ...brick.palette } : undefined,
      reward: cloneReward(brick.reward),
    })),
    enemies: (definition.enemies || []).map((enemy) => ({ ...enemy })),
    hazards: (definition.hazards || []).map((hazard) => ({ ...hazard })),
    boss: definition.boss ? { ...definition.boss } : undefined,
  };
}

function clampLevel(levelNumber) {
  const parsed = Math.trunc(Number(levelNumber));
  if (!Number.isFinite(parsed)) return 1;
  return Math.max(1, Math.min(CAMPAIGN_MAX_LEVEL, parsed));
}

function getBiomeForLevel(levelNumber) {
  return Object.values(BIOMES).find((biome) =>
    levelNumber >= biome.levelStart && levelNumber <= biome.levelEnd
  ) || BIOMES.grasslands_training_ruins;
}

function getBossDefinition(levelNumber) {
  if (levelNumber % 10 !== 0) return null;
  return Object.values(BOSSES).find((boss) => boss.level === levelNumber) || null;
}

function getPatternForLevel(levelNumber, rng) {
  const fixed = GENERATED_LEVEL_SEQUENCE[levelNumber];
  if (fixed) return fixed;
  const regularIndex = Math.max(0, levelNumber - FIRST_GENERATED_LEVEL);
  const sequencePick = GENERATED_PATTERN_SEQUENCE[regularIndex % GENERATED_PATTERN_SEQUENCE.length];
  return sequencePick || rng.choice(Object.values(LEVEL_LAYOUT_PATTERNS));
}

function getGeneratedLevelName(biome, pattern, levelNumber) {
  if (levelNumber <= 10) return pattern.name;
  const biomeName = biome.name.split(" / ")[0];
  return `${biomeName}: ${pattern.name}`;
}

function levelSeed(runSeed, levelNumber) {
  let seed = Number(runSeed) >>> 0;
  seed ^= Math.imul(levelNumber + 0x9e3779b9, 0x85ebca6b);
  seed ^= seed >>> 16;
  return seed >>> 0 || 1;
}

function shuffle(items, rng) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = rng.int(0, i);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function cellKey(cell) {
  return `${cell.row}:${cell.column}`;
}

function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

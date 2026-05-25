import { Random } from "../core/Random.js";

export const BOSS_ELEMENT_CHOICE_COUNT = 3;
export const BOSS_ELEMENT_FALLBACK_COIN_REWARD = 250;

export const ELEMENT_FAMILIES = [
  {
    id: "classic",
    name: "Classic",
    rarity: "Common",
    weight: 70,
  },
  {
    id: "arcade",
    name: "Arcade Physics",
    rarity: "Uncommon",
    weight: 25,
  },
  {
    id: "mystic",
    name: "Mystic Material",
    rarity: "Rare",
    weight: 5,
  },
];

export const BASE_ELEMENTS = [
  {
    id: "element_fire",
    ballElementId: "fire",
    name: "Fire",
    icon: "F",
    family: "classic",
    description: "Adds burn effects, flame spread hooks, and fire combo access.",
  },
  {
    id: "element_water",
    ballElementId: "water",
    name: "Water",
    icon: "W",
    family: "classic",
    description: "Adds splash effects, wet marks, cleanse hooks, and water combo access.",
  },
  {
    id: "element_wind",
    ballElementId: "wind",
    name: "Wind",
    icon: "N",
    family: "classic",
    description: "Adds gust effects, directional nudges, curve hooks, and wind combo access.",
  },
  {
    id: "element_earth",
    ballElementId: "earth",
    name: "Earth",
    icon: "E",
    family: "classic",
    description: "Adds heavy impacts, tremor hooks, defensive hooks, and earth combo access.",
  },
  {
    id: "element_spark",
    ballElementId: "spark",
    name: "Spark",
    icon: "K",
    family: "arcade",
    description: "Adds chain arcs, charge marks, speed hooks, and spark combo access.",
  },
  {
    id: "element_resin",
    ballElementId: "resin",
    name: "Resin",
    icon: "R",
    family: "arcade",
    description: "Adds sticky coatings, linked-brick hooks, slow zones, and resin combo access.",
  },
  {
    id: "element_echo",
    ballElementId: "echo",
    name: "Echo",
    icon: "O",
    family: "arcade",
    description: "Adds delayed repeat-hit hooks, pulse waves, and echo combo access.",
  },
  {
    id: "element_gravity",
    ballElementId: "gravity",
    name: "Gravity",
    icon: "G",
    family: "arcade",
    description: "Adds gravity wells, pull effects, orbit hooks, and gravity combo access.",
  },
  {
    id: "element_ash",
    ballElementId: "ash",
    name: "Ash",
    icon: "A",
    family: "mystic",
    description: "Adds decay marks, armor weakening hooks, and ash combo access.",
  },
  {
    id: "element_glass",
    ballElementId: "glass",
    name: "Glass",
    icon: "L",
    family: "mystic",
    description: "Adds shard splitting, ricochet hooks, prism effects, and glass combo access.",
  },
  {
    id: "element_mist",
    ballElementId: "mist",
    name: "Mist",
    icon: "M",
    family: "mystic",
    description: "Adds haze fields, phase hooks, soft area damage, and mist combo access.",
  },
  {
    id: "element_iron",
    ballElementId: "iron",
    name: "Iron",
    icon: "I",
    family: "mystic",
    description: "Adds magnetic pull, heavy impact hooks, armor interactions, and iron combo access.",
  },
];

const ELEMENT_BY_ID = new Map(BASE_ELEMENTS.map((element) => [element.id, element]));
const FAMILY_BY_ID = new Map(ELEMENT_FAMILIES.map((family) => [family.id, family]));

export function getBaseElement(id) {
  return ELEMENT_BY_ID.get(id) || null;
}

export function getElementFamily(familyId) {
  return FAMILY_BY_ID.get(familyId) || null;
}

export function getOwnedBaseElements(ownedElements = []) {
  const owned = new Set(ownedElements);
  return BASE_ELEMENTS.filter((element) => owned.has(element.id));
}

export function getOwnedBallElementIds(ownedElements = []) {
  return getOwnedBaseElements(ownedElements).map((element) => element.ballElementId);
}

export function createBossElementChoices({ seed = 1, levelNumber = 1, ownedElements = [] } = {}) {
  const owned = new Set(ownedElements);
  const rng = new Random((seed + levelNumber * 2654435761 + owned.size * 1013904223) >>> 0);
  const choices = [];
  const remaining = BASE_ELEMENTS.filter((element) => !owned.has(element.id));

  while (choices.length < BOSS_ELEMENT_CHOICE_COUNT && remaining.length > 0) {
    const family = pickAvailableFamily(remaining, rng);
    const familyPool = remaining.filter((element) => element.family === family.id);
    const [element] = familyPool.splice(rng.int(0, familyPool.length - 1), 1);
    choices.push(elementChoice(element));
    remaining.splice(remaining.findIndex((item) => item.id === element.id), 1);
  }

  while (choices.length < BOSS_ELEMENT_CHOICE_COUNT) {
    choices.push(coinFallbackChoice(levelNumber, choices.length));
  }

  return choices;
}

function pickAvailableFamily(elements, rng) {
  const availableFamilies = ELEMENT_FAMILIES.filter((family) =>
    elements.some((element) => element.family === family.id)
  );
  const total = availableFamilies.reduce((sum, family) => sum + family.weight, 0);
  let roll = rng.range(0, total || 1);
  for (const family of availableFamilies) {
    roll -= family.weight;
    if (roll <= 0) return family;
  }
  return availableFamilies[availableFamilies.length - 1];
}

function elementChoice(element) {
  const family = getElementFamily(element.family);
  return {
    kind: "elementChoice",
    id: element.id,
    elementId: element.id,
    ballElementId: element.ballElementId,
    name: element.name,
    label: element.name,
    description: element.description,
    rarity: family?.rarity || "Element",
    category: family?.name || "Element",
    icon: element.icon,
  };
}

function coinFallbackChoice(levelNumber, slot) {
  // Temporary v0.26 default: the plan defines fallback coin slots but leaves their value open.
  return {
    kind: "currency",
    id: `boss_coin_${levelNumber}_${slot}`,
    name: `${BOSS_ELEMENT_FALLBACK_COIN_REWARD} Coins`,
    label: `+${BOSS_ELEMENT_FALLBACK_COIN_REWARD} Coins`,
    description: "Element pool fallback reward",
    rarity: "Fallback",
    category: "Coins",
    amount: BOSS_ELEMENT_FALLBACK_COIN_REWARD,
  };
}

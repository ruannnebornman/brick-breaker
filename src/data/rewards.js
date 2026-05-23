import { getLevelReward } from "./scaling.js";

export function getReward(levelNumber, options = {}) {
  return getLevelReward(levelNumber, options);
}

export function getMvpReward(levelNumber) {
  return getReward(levelNumber);
}

import { getReward } from "../data/rewards.js";

export class RewardSystem {
  grantLevelReward(game, levelNumber) {
    const reward = getReward(levelNumber, {
      isBossLevel: game.level?.definition?.isBossLevel === true,
    });
    game.profile.coins += reward.coins;
    game.activeRun.coinsEarned += reward.coins;
    return reward;
  }
}

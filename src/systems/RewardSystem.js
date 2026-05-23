import { getMvpReward } from "../data/rewards.js";

export class RewardSystem {
  grantLevelReward(game, levelNumber) {
    const reward = getMvpReward(levelNumber);
    game.profile.coins += reward.coins;
    game.activeRun.coinsEarned += reward.coins;
    return reward;
  }
}

import { getReward } from "../data/rewards.js";
import { cloneReward, createStageBonusChoices, getRewardStyle } from "../data/rewardDrops.js";
import { Pickup } from "../entities/Pickup.js";

export class RewardSystem {
  grantLevelReward(game, levelNumber) {
    const reward = getReward(levelNumber, {
      isBossLevel: game.level?.definition?.isBossLevel === true,
    });
    game.profile.coins += reward.coins;
    game.activeRun.coinsEarned += reward.coins;
    return reward;
  }

  offerStageBonusChoices({ seed, levelNumber, permanentAlreadyEarned = false, profilePermanentUpgrades = {} }) {
    return createStageBonusChoices({
      seed,
      levelNumber,
      permanentAlreadyEarned,
      profilePermanentUpgrades,
    }).map((choice) => ({
      ...cloneReward(choice),
      name: choice.label,
      stack: choice.stack ?? null,
      maxStacks: choice.maxStacks ?? null,
    }));
  }

  spawnPickupFromBrick(game, brick) {
    if (!brick.reward || !game.level) return null;
    const reward = cloneReward(brick.reward);
    const style = getRewardStyle(reward);
    const pickup = new Pickup(game.level.nextPickupId++, {
      reward,
      x: brick.x + brick.width / 2,
      y: brick.y + brick.height / 2,
      vy: style.fallSpeed,
      magnetStrength: style.magnetStrength,
      collectOnClear: true,
      flightMode: "absorb",
      flightDuration: 0.34,
    });
    game.level.pickups.push(pickup);
    return pickup;
  }
}

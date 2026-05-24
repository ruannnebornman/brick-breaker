import { Brick } from "../entities/Brick.js";
import { Paddle } from "../entities/Paddle.js";
import { Ball } from "../entities/Ball.js";
import { Boss } from "../entities/Boss.js";
import { Enemy } from "../entities/Enemy.js";
import { Hazard } from "../entities/Hazard.js";
import { BRICK_TYPES } from "../data/brickTypes.js";
import { ENEMY_TYPES } from "../data/enemyTypes.js";
import { HAZARD_TYPES } from "../data/hazardTypes.js";
import { getLevelDefinition } from "../data/levels.js";

export class LevelSystem {
  createLevel(levelNumber, stats, runSeed = 1) {
    const definition = getLevelDefinition(levelNumber, runSeed);
    const paddle = new Paddle(stats);
    const balls = Array.from({ length: stats.ballCount || 1 }, (_, index) => new Ball({
        x: paddle.x,
        y: paddle.y - paddle.height / 2 - stats.ballRadius - 1,
        radius: stats.ballRadius,
        speed: stats.ballSpeed,
        damage: stats.ballDamage,
        critChance: stats.critChance,
        critDamage: stats.critDamage,
        element: stats.element,
        elements: stats.activeElements,
        pierceChance: stats.pierceChance,
      }));
    balls.forEach((ball, index) => {
      ball.stickTo(paddle);
      ball.x += (index - (balls.length - 1) / 2) * stats.ballRadius * 2.5;
    });

    const bricks = definition.bricks.map((brick, index) => {
      const type = BRICK_TYPES[brick.type] || BRICK_TYPES.basic;
      return new Brick(index + 1, brick, type);
    });
    const enemies = (definition.enemies || []).map((enemy, index) => {
      const type = ENEMY_TYPES[enemy.type] || ENEMY_TYPES.slow_sentry;
      return new Enemy(index + 1, enemy, type);
    });
    const hazards = (definition.hazards || []).map((hazard, index) => {
      const type = HAZARD_TYPES[hazard.type] || HAZARD_TYPES.thorn_patch;
      return new Hazard(index + 1, hazard, type);
    });

    return {
      definition,
      paddle,
      balls,
      bricks,
      boss: definition.boss ? new Boss(definition.boss) : null,
      enemies,
      hazards,
      pickups: [],
      projectiles: [],
      particles: [],
      floatingTexts: [],
      collectedRewardLog: [],
      nextBrickId: bricks.length + 1,
      nextProjectileId: 1,
      nextPickupId: 1,
      hasLaunchedBalls: false,
      stagedRewards: createEmptyStagedRewards(),
      elapsed: 0,
      completed: false,
    };
  }

  isClear(level) {
    const requiredBricksCleared = level.bricks.every((brick) => !brick.active || !brick.requiredForClear);
    const requiredEnemiesCleared = level.enemies.every((enemy) => !enemy.active || !enemy.requiredForClear);
    const bossCleared = !level.boss || !level.boss.requiredForClear || !level.boss.active;
    return requiredBricksCleared && requiredEnemiesCleared && bossCleared;
  }
}

function createEmptyStagedRewards() {
  return {
    runUpgrades: [],
    temporaryUpgrades: [],
    permanentUpgrades: [],
    coins: 0,
  };
}

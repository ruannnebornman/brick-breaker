import { Brick } from "../entities/Brick.js";
import { Paddle } from "../entities/Paddle.js";
import { Ball } from "../entities/Ball.js";
import { Boss } from "../entities/Boss.js";
import { BRICK_TYPES } from "../data/brickTypes.js";
import { MVP_LEVELS } from "../data/levels.js";

export class LevelSystem {
  createLevel(levelNumber, stats) {
    const definition = MVP_LEVELS.find((level) => level.levelNumber === levelNumber) || MVP_LEVELS[0];
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
      }));
    balls.forEach((ball, index) => {
      ball.stickTo(paddle);
      ball.x += (index - (balls.length - 1) / 2) * stats.ballRadius * 2.5;
    });

    return {
      definition,
      paddle,
      balls,
      bricks: definition.bricks.map((brick, index) => {
        const type = BRICK_TYPES[brick.type] || BRICK_TYPES.basic;
        return new Brick(index + 1, brick, type);
      }),
      boss: definition.boss ? new Boss(definition.boss) : null,
      particles: [],
      floatingTexts: [],
      elapsed: 0,
      completed: false,
    };
  }

  isClear(level) {
    const requiredBricksCleared = level.bricks.every((brick) => !brick.active || !brick.requiredForClear);
    const bossCleared = !level.boss || !level.boss.requiredForClear || !level.boss.active;
    return requiredBricksCleared && bossCleared;
  }
}

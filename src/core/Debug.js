export class Debug {
  constructor() {
    this.enabled = new URLSearchParams(window.location.search).get("debug") === "1";
    this.frameTimes = [];
    this.fps = 0;
  }

  update(delta) {
    if (!this.enabled) return;
    this.frameTimes.push(delta);
    if (this.frameTimes.length > 30) {
      this.frameTimes.shift();
    }
    const average = this.frameTimes.reduce((sum, value) => sum + value, 0) / this.frameTimes.length;
    this.fps = average > 0 ? Math.round(1 / average) : 0;
  }

  draw(ctx, game) {
    const lines = [
      "DEBUG",
      `fps ${this.fps}`,
      `mode ${game.mode}`,
      `level ${game.activeRun?.currentLevel ?? "-"}`,
      `seed ${game.activeRun?.seed ?? "-"}`,
      `balls ${game.level?.balls.filter((ball) => ball.active).length ?? 0}`,
      `bricks ${game.level?.bricks.filter((brick) => brick.active).length ?? 0}`,
      `boss ${game.level?.boss?.active ? Math.ceil(game.level.boss.hp) : "-"}`,
    ];
    ctx.save();
    ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
    ctx.textBaseline = "top";
    const width = 190;
    const height = lines.length * 17 + 12;
    ctx.fillStyle = "rgba(4, 12, 11, 0.78)";
    ctx.strokeStyle = "rgba(97, 215, 198, 0.45)";
    ctx.fillRect(960 - width - 12, 600 - height - 12, width, height);
    ctx.strokeRect(960 - width - 12, 600 - height - 12, width, height);
    ctx.fillStyle = "#d9fff8";
    lines.forEach((line, index) => {
      ctx.fillText(line, 960 - width, 600 - height + index * 17 - 5);
    });
    if (game.level) {
      this.drawCollision(ctx, game);
    }
    ctx.restore();
  }

  drawCollision(ctx, game) {
    ctx.save();
    ctx.strokeStyle = "rgba(97, 215, 198, 0.8)";
    ctx.lineWidth = 1;
    const paddle = game.level.paddle.rect;
    ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
    for (const brick of game.level.bricks) {
      if (!brick.active) continue;
      ctx.strokeStyle = brick.requiredForClear ? "rgba(230, 193, 91, 0.75)" : "rgba(255, 255, 255, 0.35)";
      ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
    }
    if (game.level.boss?.active) {
      const boss = game.level.boss;
      ctx.strokeStyle = "rgba(255, 126, 97, 0.85)";
      ctx.strokeRect(boss.x, boss.y, boss.width, boss.height);
    }
    ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
    for (const ball of game.level.balls) {
      if (!ball.active) continue;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
}

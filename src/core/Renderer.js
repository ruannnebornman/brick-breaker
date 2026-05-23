const LOGICAL_WIDTH = 960;
const LOGICAL_HEIGHT = 600;

export class Renderer {
  constructor(canvas, assets) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false });
    this.assets = assets;
    this.width = LOGICAL_WIDTH;
    this.height = LOGICAL_HEIGHT;
    this.dpr = 1;
    this.resize();
  }

  resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(LOGICAL_WIDTH * this.dpr);
    this.canvas.height = Math.round(LOGICAL_HEIGHT * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  render(game) {
    const ctx = this.ctx;
    ctx.save();
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.drawBackground(ctx, game);
    this.drawArenaFrame(ctx);
    if (game.level && ["playing", "paused", "levelComplete", "upgradeSelect"].includes(game.mode)) {
      this.drawLevel(ctx, game);
    } else if (["mainMenu", "settings", "gameOver", "victory"].includes(game.mode)) {
      this.drawAttractScene(ctx, game);
    }
    if (game.debug.enabled) {
      game.debug.draw(ctx, game);
    }
    ctx.restore();
  }

  drawBackground(ctx) {
    const bg = this.assets.get("bg_grasslands_training_ruins_arena");
    if (bg) {
      ctx.drawImage(bg, 0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
      return;
    }

    const gradient = ctx.createLinearGradient(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
    gradient.addColorStop(0, "#10231d");
    gradient.addColorStop(0.45, "#283f28");
    gradient.addColorStop(1, "#143a38");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

    ctx.strokeStyle = "rgba(218, 232, 184, 0.08)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= LOGICAL_WIDTH; x += 48) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, LOGICAL_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y <= LOGICAL_HEIGHT; y += 48) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(LOGICAL_WIDTH, y);
      ctx.stroke();
    }
  }

  drawArenaFrame(ctx) {
    const frame = this.assets.get("arena_frame_grasslands");
    if (frame) {
      ctx.drawImage(frame, 0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
      return;
    }

    ctx.strokeStyle = "rgba(230, 193, 91, 0.45)";
    ctx.lineWidth = 5;
    ctx.strokeRect(10, 10, LOGICAL_WIDTH - 20, LOGICAL_HEIGHT - 20);
    ctx.strokeStyle = "rgba(97, 215, 198, 0.22)";
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, LOGICAL_WIDTH - 40, LOGICAL_HEIGHT - 40);
  }

  drawAttractScene(ctx, game) {
    const t = game.elapsed;
    ctx.save();
    ctx.globalAlpha = 0.72;
    for (let i = 0; i < 9; i += 1) {
      const x = 135 + i * 88;
      const y = 138 + Math.sin(t * 1.4 + i) * 9;
      this.drawPlaceholderBrick(ctx, x, y, 68, 28, i % 3 === 0 ? "armored" : "basic", 1);
    }
    this.drawPlaceholderPaddle(ctx, 480, 520, 150, 18);
    this.drawPlaceholderBall(ctx, 480 + Math.cos(t * 2.4) * 130, 365 + Math.sin(t * 1.8) * 55, 9, "normal");
    ctx.restore();
  }

  drawLevel(ctx, game) {
    const { level } = game;
    for (const brick of level.bricks) {
      if (!brick.active) continue;
      this.drawBrick(ctx, brick);
    }

    if (level.boss?.active) {
      this.drawBoss(ctx, level.boss);
    }

    this.drawParticles(ctx, level.particles, "trail");

    for (const ball of level.balls) {
      if (!ball.active) continue;
      this.drawBall(ctx, ball);
    }

    this.drawPaddle(ctx, level.paddle);
    this.drawParticles(ctx, level.particles, "spark");
    this.drawParticles(ctx, level.particles, "chip");
  }

  drawPaddle(ctx, paddle) {
    const image = this.assets.get("paddle_basic");
    if (image) {
      ctx.drawImage(
        image,
        paddle.x - paddle.width / 2,
        paddle.y - paddle.height / 2,
        paddle.width,
        paddle.height,
      );
      return;
    }
    this.drawPlaceholderPaddle(ctx, paddle.x, paddle.y, paddle.width, paddle.height);
  }

  drawBall(ctx, ball) {
    const image = this.assets.get(ball.element === "fire" ? "ball_fire" : "ball_normal");
    if (image) {
      ctx.drawImage(
        image,
        ball.x - ball.radius,
        ball.y - ball.radius,
        ball.radius * 2,
        ball.radius * 2,
      );
      return;
    }
    this.drawPlaceholderBall(ctx, ball.x, ball.y, ball.radius, ball.element);
  }

  drawBrick(ctx, brick) {
    const assetId = brick.hpRatio < 0.5 ? brick.assetDamaged : brick.assetHealthy;
    const image = this.assets.get(assetId);
    if (image) {
      ctx.drawImage(image, brick.x, brick.y, brick.width, brick.height);
      return;
    }
    this.drawPlaceholderBrick(ctx, brick.x, brick.y, brick.width, brick.height, brick.type, brick.hpRatio);
  }

  drawBoss(ctx, boss) {
    const assetId = boss.hpRatio < 0.45 ? boss.assetDamaged : boss.assetIdle;
    const image = this.assets.get(assetId);
    if (image) {
      ctx.drawImage(image, boss.x, boss.y, boss.width, boss.height);
      return;
    }

    ctx.save();
    const gradient = ctx.createLinearGradient(boss.x, boss.y, boss.x, boss.y + boss.height);
    gradient.addColorStop(0, boss.hpRatio < 0.45 ? "#526158" : "#697b60");
    gradient.addColorStop(1, "#26352e");
    ctx.fillStyle = gradient;
    ctx.strokeStyle = "#e6c15b";
    ctx.lineWidth = 4;
    roundedRect(ctx, boss.x, boss.y, boss.width, boss.height, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgba(97, 215, 198, 0.85)";
    ctx.shadowColor = "#61d7c6";
    ctx.shadowBlur = 18;
    roundedRect(ctx, boss.x + boss.width * 0.35, boss.y + boss.height * 0.24, boss.width * 0.3, boss.height * 0.42, 8);
    ctx.fill();
    ctx.shadowBlur = 0;

    if (boss.hpRatio < 0.65) {
      ctx.strokeStyle = "rgba(20, 16, 12, 0.75)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(boss.x + boss.width * 0.22, boss.y + boss.height * 0.2);
      ctx.lineTo(boss.x + boss.width * 0.36, boss.y + boss.height * 0.74);
      ctx.lineTo(boss.x + boss.width * 0.3, boss.y + boss.height * 0.92);
      ctx.moveTo(boss.x + boss.width * 0.72, boss.y + boss.height * 0.14);
      ctx.lineTo(boss.x + boss.width * 0.6, boss.y + boss.height * 0.84);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawParticles(ctx, particles, kind) {
    for (const particle of particles) {
      if (particle.kind !== kind) continue;
      const ratio = Math.max(0, particle.life / particle.maxLife);
      ctx.save();
      ctx.globalAlpha = ratio;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius * (kind === "trail" ? ratio : 1), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  drawPlaceholderPaddle(ctx, x, y, width, height) {
    const radius = height / 2;
    ctx.save();
    ctx.fillStyle = "#61d7c6";
    ctx.strokeStyle = "#e6c15b";
    ctx.lineWidth = 3;
    roundedRect(ctx, x - width / 2, y - height / 2, width, height, radius);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(255, 255, 255, 0.32)";
    ctx.fillRect(x - width * 0.32, y - height * 0.32, width * 0.64, 3);
    ctx.restore();
  }

  drawPlaceholderBall(ctx, x, y, radius, element) {
    const glow = element === "fire" ? "#ff663d" : "#61d7c6";
    const core = element === "fire" ? "#ffd36b" : "#f5fff5";
    const gradient = ctx.createRadialGradient(x - radius * 0.35, y - radius * 0.35, 2, x, y, radius * 1.35);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(0.45, core);
    gradient.addColorStop(1, glow);
    ctx.save();
    ctx.shadowColor = glow;
    ctx.shadowBlur = 18;
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawPlaceholderBrick(ctx, x, y, width, height, type, hpRatio) {
    const fill = type === "armored" ? "#68717b" : "#7f936e";
    const accent = type === "armored" ? "#bbc9d2" : "#cde096";
    ctx.save();
    ctx.fillStyle = fill;
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    roundedRect(ctx, x, y, width, height, 5);
    ctx.fill();
    ctx.stroke();
    if (hpRatio < 0.65) {
      ctx.strokeStyle = "rgba(25, 18, 14, 0.7)";
      ctx.beginPath();
      ctx.moveTo(x + width * 0.24, y + height * 0.22);
      ctx.lineTo(x + width * 0.44, y + height * 0.56);
      ctx.lineTo(x + width * 0.38, y + height * 0.84);
      ctx.moveTo(x + width * 0.63, y + height * 0.16);
      ctx.lineTo(x + width * 0.72, y + height * 0.76);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function roundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

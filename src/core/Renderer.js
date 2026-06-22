import { BIOMES } from "../data/biomes.js";
import { getBallElement } from "../data/ballElements.js";
import { getRewardStyle } from "../data/rewardDrops.js";

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
    if (game.hitFeedback) {
      this.drawHitFeedback(ctx, game.hitFeedback);
    }
    if (game.debug.enabled) {
      game.debug.draw(ctx, game);
    }
    ctx.restore();
  }

  drawBackground(ctx, game) {
    const definition = game.level?.definition;
    const biome = BIOMES[definition?.biomeId] || BIOMES.grasslands_training_ruins;
    const variant = biome.backgroundVariants?.[definition?.visualVariant] || biome.backgroundVariants?.default;
    const bg = this.assets.get(biome.backgroundAsset);
    if (bg) {
      ctx.drawImage(bg, 0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
      return;
    }

    const gradient = ctx.createLinearGradient(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
    const colors = variant?.colors || ["#10231d", "#283f28", "#143a38"];
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(0.45, colors[1]);
    gradient.addColorStop(1, colors[2]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

    ctx.strokeStyle = variant?.grid || "rgba(218, 232, 184, 0.08)";
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

    ctx.save();
    ctx.shadowColor = "rgba(83, 217, 255, 0.18)";
    ctx.shadowBlur = 10;
    ctx.strokeStyle = "rgba(255, 201, 90, 0.18)";
    ctx.lineWidth = 2;
    ctx.strokeRect(11, 11, LOGICAL_WIDTH - 22, LOGICAL_HEIGHT - 22);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(83, 217, 255, 0.12)";
    ctx.lineWidth = 1;
    ctx.strokeRect(20, 20, LOGICAL_WIDTH - 40, LOGICAL_HEIGHT - 40);
    ctx.restore();
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
    this.drawPaddle(ctx, { x: 480, y: 520, width: 150, height: 18 }, t);
    this.drawPlaceholderBall(ctx, 480 + Math.cos(t * 2.4) * 130, 365 + Math.sin(t * 1.8) * 55, 9, "normal");
    ctx.restore();
  }

  drawLevel(ctx, game) {
    const { level } = game;
    this.drawHazards(ctx, level.hazards);

    for (const brick of level.bricks) {
      if (!brick.active) continue;
      this.drawBrick(ctx, brick);
    }

    for (const enemy of level.enemies) {
      if (!enemy.active) continue;
      this.drawEnemy(ctx, enemy);
    }

    if (level.boss?.active) {
      this.drawBoss(ctx, level.boss);
    }

    this.drawProjectiles(ctx, level.projectiles);
    this.drawPickups(ctx, level.pickups);
    this.drawParticles(ctx, level.particles, "beam");
    this.drawParticles(ctx, level.particles, "trail");

    for (const ball of level.balls) {
      if (!ball.active) continue;
      this.drawBall(ctx, ball);
    }

    this.drawPaddle(ctx, level.paddle, game.elapsed);
    this.drawParticles(ctx, level.particles, "spark");
    this.drawParticles(ctx, level.particles, "chip");
    this.drawFloatingTexts(ctx, level.floatingTexts);
  }

  drawPaddle(ctx, paddle, time = 0) {
    const animatedImage = this.assets.get("paddle_pet_unicorn_idle");
    const image = animatedImage || this.assets.get("paddle_basic");
    if (image) {
      const meta = this.assets.getMeta(animatedImage ? "paddle_pet_unicorn_idle" : "paddle_basic");
      if (meta?.fallback?.kind === "paddlePet") {
        const frame = this.getAnimationFrame(meta, time);
        const sourceWidth = frame?.width || meta.width || image.naturalWidth || paddle.width;
        const sourceHeight = frame?.height || meta.height || image.naturalHeight || paddle.height;
        const aspect = sourceWidth / sourceHeight;
        const visualHeight = Math.min(68, Math.max(paddle.height * 2.8, paddle.width / aspect));
        const visualWidth = visualHeight * aspect;
        const x = paddle.x - visualWidth / 2;
        const y = paddle.y - visualHeight + paddle.height * 0.65;
        ctx.save();
        ctx.globalAlpha = 0.94;
        ctx.filter = "blur(0.28px) saturate(0.92) contrast(0.9) brightness(0.97)";
        if (frame) {
          ctx.drawImage(image, frame.x, frame.y, frame.width, frame.height, x, y, visualWidth, visualHeight);
        } else {
          ctx.drawImage(image, x, y, visualWidth, visualHeight);
        }
        ctx.restore();
      } else {
        ctx.drawImage(
          image,
          paddle.x - paddle.width / 2,
          paddle.y - paddle.height / 2,
          paddle.width,
          paddle.height,
        );
      }
      return;
    }
    this.drawPlaceholderPaddle(ctx, paddle.x, paddle.y, paddle.width, paddle.height);
  }

  getAnimationFrame(meta, time) {
    const animation = meta?.animation;
    if (!animation?.frames) return null;
    const frameCount = Math.max(1, animation.frames);
    const fps = animation.fps || 12;
    const frameIndex = Math.floor(time * fps) % frameCount;
    const columns = animation.columns || frameCount;
    const width = animation.frameWidth || meta.width;
    const height = animation.frameHeight || meta.height;
    return {
      x: (frameIndex % columns) * width,
      y: Math.floor(frameIndex / columns) * height,
      width,
      height,
    };
  }

  drawBall(ctx, ball) {
    const image = this.assets.get(`ball_${ball.element}`);
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
    } else {
      this.drawPlaceholderBrick(
        ctx,
        brick.x,
        brick.y,
        brick.width,
        brick.height,
        { type: brick.type, ...(brick.palette || {}) },
        brick.hpRatio,
      );
    }

    if (brick.reward) {
      this.drawRewardCore(ctx, brick);
    }
  }

  drawBoss(ctx, boss) {
    const assetId = boss.hpRatio < 0.45 ? boss.assetDamaged : boss.assetIdle;
    const image = this.assets.get(assetId);
    if (image) {
      ctx.drawImage(image, boss.x, boss.y, boss.width, boss.height);
      return;
    }

    ctx.save();
    const palette = boss.palette || {};
    const gradient = ctx.createLinearGradient(boss.x, boss.y, boss.x, boss.y + boss.height);
    gradient.addColorStop(0, boss.hpRatio < 0.45 ? palette.damagedFill || "#526158" : palette.fill || "#697b60");
    gradient.addColorStop(1, "#26352e");
    ctx.fillStyle = gradient;
    ctx.strokeStyle = palette.accent || "#e6c15b";
    ctx.lineWidth = 4;
    roundedRect(ctx, boss.x, boss.y, boss.width, boss.height, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = palette.core || "rgba(97, 215, 198, 0.85)";
    ctx.shadowColor = palette.core || "#61d7c6";
    ctx.shadowBlur = 18;
    roundedRect(ctx, boss.x + boss.width * 0.35, boss.y + boss.height * 0.24, boss.width * 0.3, boss.height * 0.42, 8);
    ctx.fill();
    ctx.shadowBlur = 0;

    this.drawBossMotif(ctx, boss, palette);

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

    if (boss.phase >= 2) {
      ctx.fillStyle = palette.armor || "#7f8f73";
      ctx.strokeStyle = "rgba(20, 16, 12, 0.65)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i += 1) {
        const plateX = boss.x + boss.width * (0.16 + i * 0.18);
        roundedRect(ctx, plateX, boss.y + boss.height * 0.08, boss.width * 0.12, boss.height * 0.25, 6);
        ctx.fill();
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  drawBossMotif(ctx, boss, palette) {
    const motif = boss.visual?.motif || "golem";
    const x = boss.x;
    const y = boss.y;
    const w = boss.width;
    const h = boss.height;
    const accent = palette.accent || "#e6c15b";
    const core = palette.core || "#61d7c6";
    const armor = palette.armor || "#7f8f73";

    ctx.save();
    ctx.lineWidth = 3;
    ctx.strokeStyle = accent;
    ctx.fillStyle = armor;

    if (motif === "golem") {
      for (let i = 1; i < 4; i += 1) {
        ctx.beginPath();
        ctx.moveTo(x + w * (i / 4), y + h * 0.12);
        ctx.lineTo(x + w * (i / 4), y + h * 0.86);
        ctx.stroke();
      }
    } else if (motif === "wyrm") {
      for (let i = 0; i < 6; i += 1) {
        ctx.beginPath();
        ctx.ellipse(x + w * (0.18 + i * 0.11), y + h * (0.28 + Math.sin(i) * 0.05), w * 0.07, h * 0.12, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      drawEye(ctx, x + w * 0.78, y + h * 0.34, core);
    } else if (motif === "crown") {
      for (let i = 0; i < 5; i += 1) {
        const px = x + w * (0.24 + i * 0.13);
        ctx.beginPath();
        ctx.moveTo(px - w * 0.05, y + h * 0.24);
        ctx.lineTo(px, y + h * 0.06);
        ctx.lineTo(px + w * 0.05, y + h * 0.24);
        ctx.fill();
        ctx.stroke();
      }
    } else if (motif === "ooze") {
      for (let i = 0; i < 5; i += 1) {
        const px = x + w * (0.2 + i * 0.15);
        ctx.beginPath();
        ctx.arc(px, y + h * 0.76, h * (0.08 + (i % 2) * 0.03), 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    } else if (motif === "storm") {
      ctx.beginPath();
      for (let i = 0; i < 4; i += 1) {
        const px = x + w * (0.22 + i * 0.17);
        ctx.moveTo(px, y + h * 0.12);
        ctx.lineTo(px + w * 0.04, y + h * 0.34);
        ctx.lineTo(px - w * 0.01, y + h * 0.34);
        ctx.lineTo(px + w * 0.05, y + h * 0.62);
      }
      ctx.stroke();
    } else if (motif === "hydra") {
      for (let i = 0; i < 3; i += 1) {
        const px = x + w * (0.3 + i * 0.2);
        ctx.beginPath();
        ctx.moveTo(x + w * 0.5, y + h * 0.56);
        ctx.quadraticCurveTo(px, y + h * 0.32, px, y + h * 0.16);
        ctx.stroke();
        drawEye(ctx, px, y + h * 0.18, core);
      }
    } else if (motif === "furnace") {
      roundedRect(ctx, x + w * 0.32, y + h * 0.42, w * 0.36, h * 0.32, 10);
      ctx.stroke();
      for (let i = 0; i < 4; i += 1) {
        ctx.beginPath();
        ctx.moveTo(x + w * (0.28 + i * 0.14), y + h * 0.18);
        ctx.quadraticCurveTo(x + w * (0.32 + i * 0.14), y + h * 0.02, x + w * (0.36 + i * 0.14), y + h * 0.18);
        ctx.stroke();
      }
    } else if (motif === "sun") {
      for (let i = 0; i < 10; i += 1) {
        const angle = (i / 10) * Math.PI * 2;
        const cx = x + w * 0.5;
        const cy = y + h * 0.45;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * w * 0.14, cy + Math.sin(angle) * h * 0.18);
        ctx.lineTo(cx + Math.cos(angle) * w * 0.25, cy + Math.sin(angle) * h * 0.32);
        ctx.stroke();
      }
    } else if (motif === "void") {
      for (let i = 0; i < 4; i += 1) {
        const px = x + w * (0.28 + i * 0.15);
        ctx.save();
        ctx.translate(px, y + h * 0.5);
        ctx.rotate(Math.PI / 4);
        ctx.strokeRect(-w * 0.035, -w * 0.035, w * 0.07, w * 0.07);
        ctx.restore();
      }
    } else if (motif === "nexus") {
      const points = [
        [0.32, 0.3, "#ff8a4c"],
        [0.68, 0.3, "#86d7ff"],
        [0.32, 0.68, "#fff17a"],
        [0.68, 0.68, "#b8f25f"],
      ];
      points.forEach(([px, py, color]) => {
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(x + w * 0.5, y + h * 0.45);
        ctx.lineTo(x + w * px, y + h * py);
        ctx.stroke();
        drawEye(ctx, x + w * px, y + h * py, color);
      });
    }

    ctx.restore();
  }

  drawEnemy(ctx, enemy) {
    const image = this.assets.get(enemy.assetId);
    if (image) {
      ctx.drawImage(image, enemy.x, enemy.y, enemy.width, enemy.height);
      return;
    }

    const palette = enemy.palette || {};
    ctx.save();
    ctx.fillStyle = palette.fill || "#657363";
    ctx.strokeStyle = palette.accent || "#e6c15b";
    ctx.lineWidth = 2;
    roundedRect(ctx, enemy.x, enemy.y, enemy.width, enemy.height, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = palette.core || "#61d7c6";
    ctx.shadowColor = palette.core || "#61d7c6";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(enemy.x + enemy.width / 2, enemy.y + enemy.height * 0.46, Math.min(enemy.width, enemy.height) * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    if (enemy.hpRatio < 0.65) {
      ctx.strokeStyle = "rgba(20, 16, 12, 0.74)";
      ctx.beginPath();
      ctx.moveTo(enemy.x + enemy.width * 0.24, enemy.y + enemy.height * 0.22);
      ctx.lineTo(enemy.x + enemy.width * 0.44, enemy.y + enemy.height * 0.72);
      ctx.moveTo(enemy.x + enemy.width * 0.68, enemy.y + enemy.height * 0.18);
      ctx.lineTo(enemy.x + enemy.width * 0.56, enemy.y + enemy.height * 0.78);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawHazards(ctx, hazards = []) {
    for (const hazard of hazards) {
      if (!hazard.active) continue;
      const image = this.assets.get(hazard.assetId);
      if (image) {
        ctx.drawImage(image, hazard.x, hazard.y, hazard.width, hazard.height);
        continue;
      }

      const palette = hazard.palette || {};
      ctx.save();
      ctx.fillStyle = palette.fill || "rgba(73, 112, 59, 0.58)";
      ctx.strokeStyle = hazard.cooldownTimer > 0
        ? "rgba(219, 232, 137, 0.42)"
        : palette.danger || "rgba(255, 126, 97, 0.58)";
      ctx.lineWidth = 2;
      roundedRect(ctx, hazard.x, hazard.y, hazard.width, hazard.height, 8);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = palette.thorn || "rgba(219, 232, 137, 0.92)";
      ctx.lineWidth = 2;
      for (let x = hazard.x + 12; x < hazard.x + hazard.width - 8; x += 18) {
        ctx.beginPath();
        ctx.moveTo(x, hazard.y + hazard.height - 4);
        ctx.lineTo(x + 7, hazard.y + 5);
        ctx.lineTo(x + 14, hazard.y + hazard.height - 4);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  drawProjectiles(ctx, projectiles = []) {
    for (const projectile of projectiles) {
      if (!projectile.active) continue;
      const image = projectile.assetId ? this.assets.get(projectile.assetId) : null;
      if (image) {
        ctx.save();
        const size = projectile.radius * 4;
        ctx.translate(projectile.x, projectile.y);
        ctx.rotate(Math.atan2(projectile.vy, projectile.vx) + Math.PI / 2);
        ctx.drawImage(image, -size / 2, -size / 2, size, size);
        ctx.restore();
        continue;
      }
      ctx.save();
      ctx.fillStyle = projectile.color;
      ctx.strokeStyle = projectile.accent;
      ctx.lineWidth = 2;
      ctx.shadowColor = projectile.accent;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.stroke();
      ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
      ctx.beginPath();
      ctx.arc(projectile.x - projectile.radius * 0.25, projectile.y - projectile.radius * 0.3, projectile.radius * 0.28, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  drawPickups(ctx, pickups = []) {
    for (const pickup of pickups) {
      if (!pickup.active || pickup.collected) continue;
      const style = getRewardStyle(pickup.reward);
      ctx.save();
      ctx.translate(pickup.x, pickup.y);
      ctx.shadowColor = style.glow;
      ctx.shadowBlur = pickup.reward?.kind === "permanentUpgrade" ? 24 : 16;
      ctx.fillStyle = style.fill;
      ctx.strokeStyle = style.stroke;
      ctx.lineWidth = 2;
      if (pickup.reward?.kind === "permanentUpgrade") {
        ctx.rotate(Math.PI / 4);
        roundedRect(ctx, -pickup.radius * 0.75, -pickup.radius * 0.75, pickup.radius * 1.5, pickup.radius * 1.5, 4);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, pickup.radius, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.stroke();
      if (pickup.reward?.kind === "permanentUpgrade") {
        ctx.rotate(-Math.PI / 4);
      }
      ctx.fillStyle = style.stroke;
      ctx.font = "bold 12px ui-sans-serif, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(style.text, 0, 0.5);
      ctx.restore();
    }
  }

  drawParticles(ctx, particles, kind) {
    for (const particle of particles) {
      if (particle.kind !== kind) continue;
      const ratio = Math.max(0, particle.life / particle.maxLife);
      ctx.save();
      ctx.globalAlpha = ratio;
      if (kind === "beam") {
        ctx.strokeStyle = particle.color;
        ctx.lineWidth = 2 + ratio * 3;
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(particle.x2, particle.y2);
        ctx.stroke();
        ctx.restore();
        continue;
      }
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius * (kind === "trail" ? ratio : 1), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  drawFloatingTexts(ctx, floatingTexts = []) {
    for (const text of floatingTexts) {
      if (text.delay > 0) continue;
      const ratio = Math.max(0, text.life / text.maxLife);
      ctx.save();
      ctx.globalAlpha = Math.min(1, ratio * 1.25);
      ctx.font = "700 16px ui-sans-serif, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgba(4, 10, 8, 0.82)";
      ctx.fillStyle = text.color;
      ctx.shadowColor = text.color;
      ctx.shadowBlur = 12;
      ctx.strokeText(text.text, text.x, text.y);
      ctx.fillText(text.text, text.x, text.y);
      ctx.restore();
    }
  }

  drawHitFeedback(ctx, feedback) {
    const ratio = Math.max(0, feedback.life / feedback.maxLife);
    ctx.save();
    ctx.globalAlpha = ratio * 0.22;
    ctx.fillStyle = feedback.kind === "shield"
      ? "rgba(134, 215, 255, 0.9)"
      : "rgba(255, 126, 97, 0.9)";
    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
    ctx.globalAlpha = ratio * 0.45;
    ctx.strokeStyle = feedback.color;
    ctx.lineWidth = 8;
    ctx.strokeRect(24, 24, LOGICAL_WIDTH - 48, LOGICAL_HEIGHT - 48);
    ctx.restore();
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
    const definition = getBallElement(element);
    const glow = definition.glowColor;
    const core = definition.color;
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
    const palette = typeof type === "object" ? type : null;
    const typeId = palette ? palette.type : type;
    const fill = palette?.fill || (typeId === "armored" ? "#68717b" : "#7f936e");
    const accent = palette?.accent || (typeId === "armored" ? "#bbc9d2" : "#cde096");
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

  drawRewardCore(ctx, brick) {
    const style = getRewardStyle(brick.reward);
    const cx = brick.x + brick.width / 2;
    const cy = brick.y + brick.height / 2;
    const radius = Math.min(brick.width, brick.height) * 0.28;
    ctx.save();
    ctx.shadowColor = style.glow;
    ctx.shadowBlur = brick.reward?.kind === "permanentUpgrade" ? 24 : 14;
    ctx.fillStyle = style.fill;
    ctx.strokeStyle = style.stroke;
    ctx.lineWidth = 2;
    if (brick.reward?.kind === "permanentUpgrade") {
      ctx.translate(cx, cy);
      ctx.rotate(Math.PI / 4);
      roundedRect(ctx, -radius * 0.82, -radius * 0.82, radius * 1.64, radius * 1.64, 4);
    } else {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.stroke();
    if (brick.reward?.kind === "permanentUpgrade") {
      ctx.rotate(-Math.PI / 4);
      ctx.translate(-cx, -cy);
    }
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.22, 0, Math.PI * 2);
    ctx.strokeStyle = style.glow;
    ctx.globalAlpha = 0.5;
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = style.stroke;
    ctx.font = "bold 11px ui-sans-serif, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(style.text, cx, cy + 0.5);
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

function drawEye(ctx, x, y, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(x, y, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.beginPath();
  ctx.arc(x - 3, y - 3, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

import { getBallElement } from "../data/ballElements.js";

export class ParticleSystem {
  trail(level, ball) {
    if (ball.stuckToPaddle || ball.age - (ball.lastTrailAt || 0) < 0.025) return;
    ball.lastTrailAt = ball.age;
    const element = getBallElement(ball.element);
    level.particles.push({
      kind: "trail",
      x: ball.x,
      y: ball.y,
      vx: -ball.vx * 0.025,
      vy: -ball.vy * 0.025,
      radius: ball.radius * 0.9,
      color: element.trailColor,
      life: 0.18,
      maxLife: 0.18,
    });
  }

  hit(level, x, y, color = "rgba(255, 244, 180, 0.9)") {
    for (let i = 0; i < 7; i += 1) {
      const angle = (Math.PI * 2 * i) / 7;
      const speed = 60 + i * 9;
      level.particles.push({
        kind: "spark",
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2.5,
        color,
        life: 0.18,
        maxLife: 0.18,
      });
    }
  }

  burst(level, x, y, color = "rgba(219, 207, 164, 0.86)") {
    for (let i = 0; i < 16; i += 1) {
      const angle = (Math.PI * 2 * i) / 16;
      const speed = 80 + (i % 5) * 22;
      level.particles.push({
        kind: "chip",
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2.5 + (i % 3),
        color,
        life: 0.42,
        maxLife: 0.42,
      });
    }
  }

  burn(level, x, y) {
    level.particles.push({
      kind: "spark",
      x,
      y,
      vx: (Math.random() - 0.5) * 30,
      vy: -40 - Math.random() * 35,
      radius: 4,
      color: "rgba(255, 112, 48, 0.78)",
      life: 0.28,
      maxLife: 0.28,
    });
  }

  corrosion(level, x, y) {
    level.particles.push({
      kind: "spark",
      x,
      y,
      vx: (Math.random() - 0.5) * 36,
      vy: -24 - Math.random() * 24,
      radius: 3.6,
      color: "rgba(152, 244, 84, 0.78)",
      life: 0.3,
      maxLife: 0.3,
    });
  }

  chain(level, x1, y1, x2, y2, color = "rgba(180, 236, 255, 0.95)") {
    level.particles.push({
      kind: "beam",
      x: x1,
      y: y1,
      x2,
      y2,
      vx: 0,
      vy: 0,
      radius: 2,
      color,
      life: 0.12,
      maxLife: 0.12,
    });
  }

  floatingText(level, { x, y, text, color = "rgba(255, 255, 255, 0.95)", delay = 0 }) {
    if (!level?.floatingTexts || !text) return;
    level.floatingTexts.push({
      x,
      y,
      text,
      color,
      delay,
      life: 1.45,
      maxLife: 1.45,
      vy: -42,
    });
  }

  update(level, delta) {
    if (!level) return;
    for (const particle of level.particles) {
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;
      particle.vy += particle.kind === "chip" ? 220 * delta : 0;
      particle.life -= delta;
    }
    level.particles = level.particles.filter((particle) => particle.life > 0).slice(-220);

    for (const text of level.floatingTexts || []) {
      if (text.delay > 0) {
        text.delay -= delta;
        continue;
      }
      text.y += text.vy * delta;
      text.life -= delta;
    }
    level.floatingTexts = (level.floatingTexts || [])
      .filter((text) => text.delay > 0 || text.life > 0)
      .slice(-18);
  }
}

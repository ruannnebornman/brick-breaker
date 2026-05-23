export class ParticleSystem {
  trail(level, ball) {
    if (ball.stuckToPaddle || ball.age - (ball.lastTrailAt || 0) < 0.025) return;
    ball.lastTrailAt = ball.age;
    level.particles.push({
      kind: "trail",
      x: ball.x,
      y: ball.y,
      vx: -ball.vx * 0.025,
      vy: -ball.vy * 0.025,
      radius: ball.radius * 0.9,
      color: ball.element === "fire" ? "rgba(255, 116, 55, 0.72)" : "rgba(97, 215, 198, 0.62)",
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

  update(level, delta) {
    if (!level) return;
    for (const particle of level.particles) {
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;
      particle.vy += particle.kind === "chip" ? 220 * delta : 0;
      particle.life -= delta;
    }
    level.particles = level.particles.filter((particle) => particle.life > 0).slice(-220);
  }
}

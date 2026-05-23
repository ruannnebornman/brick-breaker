import { BIOMES } from "../data/biomes.js";
import { getBallElement } from "../data/ballElements.js";

export class HUD {
  constructor(root) {
    this.root = root;
    this.last = "";
  }

  update(game) {
    if (!["playing", "paused"].includes(game.mode)) {
      if (this.last !== "") {
        this.root.innerHTML = "";
        this.last = "";
      }
      return;
    }

    const run = game.activeRun;
    const boss = game.level?.boss;
    const biome = BIOMES[game.level?.definition?.biomeId];
    const biomeLabel = biome?.name?.split(" / ")[0] || "Grasslands";
    const elementLabel = getElementLabel(game.stats);
    const cannon = game.level?.paddle?.cannonEnabled
      ? `<span class="hud-pill">Cannon ${game.level.paddle.cannonCooldownRemaining <= 0 ? "Ready" : game.level.paddle.cannonCooldownRemaining.toFixed(1)}</span>`
      : "";
    const bossHtml = boss?.active ? `
      <div class="boss-hud">
        <span>${boss.name}</span>
        <div class="boss-meter"><i style="width: ${Math.max(0, boss.hpRatio * 100)}%"></i></div>
      </div>
    ` : "";
    const html = `
      <div class="hud-bar">
        <div class="hud-group">
          <span class="hud-pill">Level ${run?.currentLevel ?? 1}</span>
          <span class="hud-pill">${biomeLabel}</span>
        </div>
        <div class="hud-group">
          <span class="hud-pill">Lives ${run?.lives ?? 0}</span>
          <span class="hud-pill">Balls ${game.level?.balls.filter((ball) => ball.active).length ?? 0}</span>
          <span class="hud-pill">${elementLabel}</span>
          ${cannon}
          <span class="hud-pill">Shields ${game.levelShieldCharges ?? 0}</span>
          <span class="hud-pill">Coins ${run?.coinsEarned ?? 0}</span>
        </div>
      </div>
      ${bossHtml}
    `;
    if (html !== this.last) {
      this.root.innerHTML = html;
      this.last = html;
    }
  }
}

function getElementLabel(stats) {
  const activeElements = Array.isArray(stats?.activeElements) && stats.activeElements.length > 0
    ? stats.activeElements
    : [stats?.element || "normal"];
  return [...new Set(activeElements)].map((id) => getBallElement(id).name).join(" + ");
}

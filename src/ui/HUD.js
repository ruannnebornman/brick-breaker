import { BIOMES } from "../data/biomes.js";
import { getBallElement } from "../data/ballElements.js";
import { getOwnedBaseElements } from "../data/baseElements.js";
import { getElementCombo } from "../data/elementCombos.js";
import { getPermanentUpgradeDisplay, PERMANENT_UPGRADES } from "../data/permanentUpgrades.js";

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
    const cannon = renderCannonIndicator(game);
    const rewardRails = renderRewardRails(game);
    const comboReveal = renderComboReveal(game.comboReveal);
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
          ${renderHearts(run?.lives ?? 0, game.hitFeedback?.kind === "life")}
          <span class="hud-pill">Balls ${game.level?.balls.filter((ball) => ball.active).length ?? 0}</span>
          <span class="hud-pill">${elementLabel}</span>
          ${cannon}
          <span class="hud-pill">Shields ${game.levelShieldCharges ?? 0}</span>
        </div>
      </div>
      ${rewardRails}
      ${comboReveal}
      ${bossHtml}
    `;
    if (html !== this.last) {
      this.root.innerHTML = html;
      this.last = html;
    }
  }
}

function renderHearts(lives, isHit) {
  const total = Math.max(3, Math.min(9, lives));
  const hearts = [];
  for (let index = 0; index < total; index += 1) {
    const full = index < lives;
    hearts.push(`<span class="heart ${full ? "heart--full" : "heart--empty"}">&hearts;</span>`);
  }
  return `
    <span class="hud-pill heart-row ${isHit ? "heart-row--hit" : ""}" aria-label="${lives} hearts remaining">
      ${hearts.join("")}
    </span>
  `;
}

function renderCannonIndicator(game) {
  const paddle = game.level?.paddle;
  const owned = paddle?.cannonEnabled;
  const launched = game.level?.hasLaunchedBalls;
  const cooldown = paddle?.cannonCooldownRemaining ?? 0;
  const status = !owned
    ? "None"
    : !launched
      ? "Locked"
      : cooldown <= 0
        ? "Ready"
        : `${cooldown.toFixed(1)}s`;
  const state = !owned
    ? "none"
    : !launched
      ? "locked"
      : cooldown <= 0
        ? "ready"
        : "cooldown";
  return `<span class="hud-pill cannon-indicator cannon-indicator--${state}">Cannon ${status}${owned ? " · Space" : ""}</span>`;
}

function renderRewardRails(game) {
  const permanentItems = getPermanentItems(game);
  return `
    <div class="reward-rails" aria-label="Reward state">
      <aside class="reward-rail reward-rail--permanent" aria-label="Permanent upgrades">
        <strong>Permanent</strong>
        ${renderRailItems(permanentItems, "No cores")}
      </aside>
      <aside class="reward-rail reward-rail--elements" aria-label="Elements and active combo">
        ${renderElementPanel(game)}
      </aside>
    </div>
  `;
}

function renderElementPanel(game) {
  const ownedElements = getOwnedBaseElements(game.activeRun?.ownedElements || []);
  const activeCombo = getElementCombo(game.activeRun?.activeComboId);
  const elementHtml = ownedElements.length > 0
    ? ownedElements.map(renderElementChip).join("")
    : `<span class="reward-rail-empty">No elements</span>`;
  const comboHtml = activeCombo ? `
    <div class="combo-card">
      <span>Active Combo ${activeCombo.order}</span>
      <strong>${activeCombo.name}</strong>
      <p>${activeCombo.description}</p>
    </div>
  ` : `
    <div class="combo-card combo-card--empty">
      <span>Active Combo</span>
      <strong>None</strong>
      <p>Collect boss elements to unlock reactions.</p>
    </div>
  `;

  return `
    <strong>Elements</strong>
    <div class="element-list">
      ${elementHtml}
    </div>
    ${comboHtml}
  `;
}

function renderElementChip(element) {
  const ballElement = getBallElement(element.ballElementId);
  return `
    <span class="element-chip" style="--element-color: ${ballElement.glowColor}; --element-fill: ${ballElement.trailColor}">
      <b>${element.icon}</b>
      <span>${element.name}</span>
    </span>
  `;
}

function renderRailItems(items, emptyLabel) {
  if (!items.length) {
    return `<span class="reward-rail-empty">${emptyLabel}</span>`;
  }
  return items.slice(0, 7).map((item) => `
    <span class="reward-rail-item">
      <b>${item.prefix}</b>
      <span>${item.label}</span>
      <em>${item.value}</em>
    </span>
  `).join("");
}

function getPermanentItems(game) {
  const counts = { ...(game.profile?.permanentUpgrades || {}) };
  for (const permanentId of game.level?.stagedRewards?.permanentUpgrades || []) {
    counts[permanentId] = (counts[permanentId] || 0) + 1;
  }
  const order = new Map(PERMANENT_UPGRADES.map((upgrade, index) => [upgrade.id, index]));
  return Object.entries(counts)
    .filter(([, count]) => count > 0)
    .sort(([a], [b]) => (order.get(a) ?? 99) - (order.get(b) ?? 99) || a.localeCompare(b))
    .map(([id, count]) => {
      const upgrade = getPermanentUpgradeDisplay(id);
      return {
        prefix: "P",
        label: upgrade.shortLabel,
        value: `x${count}`,
      };
    });
}

function getElementLabel(stats) {
  const activeElements = Array.isArray(stats?.activeElements) && stats.activeElements.length > 0
    ? stats.activeElements
    : [stats?.element || "normal"];
  return [...new Set(activeElements)].map((id) => getBallElement(id).name).join(" + ");
}

function renderComboReveal(reveal) {
  if (!reveal) return "";
  const progress = Math.max(0, Math.min(1, 1 - reveal.life / reveal.maxLife));
  return `
    <div class="combo-reveal" style="--combo-progress: ${progress}">
      <div class="combo-reveal-card">
        <span>Combo ${reveal.order}</span>
        <strong>${reveal.name}</strong>
        <p>${reveal.description}</p>
      </div>
    </div>
  `;
}

import { CAMPAIGN_MAX_LEVEL } from "../data/levels.js";
import { getPermanentUpgradeCost, PERMANENT_UPGRADES } from "../data/permanentUpgrades.js";
import { renderUpgradeCards } from "./UpgradeCards.js";

export class ScreenManager {
  constructor(root) {
    this.root = root;
    this.renderedMode = null;
    this.boundGame = null;
  }

  update(game, force = false) {
    this.boundGame = game;
    if (!force && this.renderedMode === game.mode) return;
    this.renderedMode = game.mode;

    if (game.mode === "mainMenu") {
      this.renderMainMenu(game);
    } else if (game.mode === "paused") {
      this.renderPaused(game);
    } else if (game.mode === "settings") {
      this.renderSettings(game);
    } else if (game.mode === "store") {
      this.renderStore(game);
    } else if (game.mode === "levelComplete") {
      this.renderLevelComplete(game);
    } else if (game.mode === "upgradeSelect") {
      this.renderUpgradeSelect(game);
    } else if (game.mode === "gameOver") {
      this.renderGameOver(game);
    } else if (game.mode === "victory") {
      this.renderVictory(game);
    } else if (game.mode === "playing") {
      this.renderGameplayLayer(game);
    } else {
      this.root.innerHTML = "";
    }
  }

  renderMainMenu(game) {
    const run = game.activeRun;
    this.root.innerHTML = `
      <section class="overlay-panel" role="dialog" aria-labelledby="menuTitle">
        <h1 id="menuTitle">Paddle Pets</h1>
        <p class="panel-subtitle">Everything is a paddle · ${CAMPAIGN_MAX_LEVEL} levels</p>
        <div class="save-summary">
          <span>Highest level: ${game.profile.highestLevelUnlocked}</span>
          <span>Permanent upgrades: ${countPermanentCores(game.profile.permanentUpgrades)}</span>
          <span>${run ? run.pendingReward ? `Reward ready after level ${run.pendingReward.levelCompleted}` : `Run level ${run.currentLevel}, lives ${run.lives}` : "No active run"}</span>
        </div>
        <div class="button-stack">
          <button data-action="continue" ${run ? "" : "disabled"}>Continue Run</button>
          <button data-action="new">New Run</button>
          <button data-action="store">Store</button>
          <button data-action="settings">Settings</button>
        </div>
      </section>
    `;
    this.bindPanelActions(game);
  }

  renderGameplayLayer(game) {
    if (!game.debug.enabled) {
      this.root.innerHTML = "";
      return;
    }
    this.root.innerHTML = `
      <div class="debug-tools" aria-label="Debug tools">
        <strong>Debug</strong>
        <button data-action="debug-next-level">Next Level</button>
        <button data-action="debug-reset">Reset Save</button>
      </div>
    `;
    this.bindPanelActions(game);
  }

  renderPaused(game) {
    this.root.innerHTML = `
      <section class="overlay-panel" role="dialog" aria-labelledby="pauseTitle">
        <h2 id="pauseTitle">Paused</h2>
        <p class="panel-subtitle">Level ${game.activeRun?.currentLevel ?? 1}</p>
        <div class="button-stack">
          <button data-action="resume">Resume</button>
          <button data-action="restart">Restart Level</button>
          <button data-action="settings">Settings</button>
          <button data-action="menu">Main Menu</button>
        </div>
      </section>
    `;
    this.bindPanelActions(game);
  }

  renderSettings(game) {
    const s = game.settings;
    this.root.innerHTML = `
      <section class="overlay-panel" role="dialog" aria-labelledby="settingsTitle">
        <h2 id="settingsTitle">Settings</h2>
        <div class="settings-list">
          <div class="setting-row">
            <label for="audioMuted">Mute audio</label>
            <input id="audioMuted" type="checkbox" data-setting="audioMuted" ${s.audioMuted ? "checked" : ""}>
          </div>
          <div class="setting-row">
            <label for="sfxVolume">SFX volume</label>
            <input id="sfxVolume" type="range" min="0" max="1" step="0.05" data-setting="sfxVolume" value="${s.sfxVolume}">
          </div>
          <div class="setting-row">
            <label for="screenShake">Screen shake</label>
            <input id="screenShake" type="range" min="0" max="1" step="0.05" data-setting="screenShake" value="${s.screenShake}">
          </div>
          <div class="setting-row">
            <label for="mouseControl">Mouse control</label>
            <input id="mouseControl" type="checkbox" data-setting="mouseControl" ${s.mouseControl ? "checked" : ""}>
          </div>
          <div class="setting-row">
            <label for="reducedMotion">Reduced motion</label>
            <input id="reducedMotion" type="checkbox" data-setting="reducedMotion" ${s.reducedMotion ? "checked" : ""}>
          </div>
        </div>
        <div class="secondary-row">
          <button data-action="back">Back</button>
          <button data-action="reset">Reset Save</button>
        </div>
      </section>
    `;
    this.bindPanelActions(game);
    this.root.querySelectorAll("[data-setting]").forEach((input) => {
      input.addEventListener("input", () => {
        const key = input.dataset.setting;
        const value = input.type === "checkbox" ? input.checked : Number(input.value);
        game.updateSettings({ [key]: value });
      });
    });
  }

  renderStore(game) {
    const coins = game.profile?.coins || 0;
    this.root.innerHTML = `
      <section class="overlay-panel store-panel" role="dialog" aria-labelledby="storeTitle">
        <div class="store-heading">
          <div>
            <h2 id="storeTitle">Store</h2>
            <p class="panel-subtitle">Permanent upgrades</p>
          </div>
          <strong class="coin-balance">${formatCoins(coins)} coins</strong>
        </div>
        <div class="store-list">
          ${PERMANENT_UPGRADES.map((upgrade) => renderStoreItem(upgrade, game.profile.permanentUpgrades, coins)).join("")}
        </div>
        <div class="secondary-row">
          <button data-action="menu">Main Menu</button>
        </div>
      </section>
    `;
    this.bindPanelActions(game);
    this.root.querySelectorAll("[data-permanent-upgrade]").forEach((button) => {
      button.addEventListener("click", () => {
        game.purchasePermanentUpgrade(button.dataset.permanentUpgrade);
      });
    });
  }

  renderLevelComplete(game) {
    this.root.innerHTML = `
      <section class="overlay-panel" role="dialog" aria-labelledby="clearTitle">
        <h2 id="clearTitle">Level Clear</h2>
        <p class="panel-subtitle">Collision test level complete.</p>
        <div class="button-stack">
          <button data-action="restart">Replay Level</button>
          <button data-action="menu">Main Menu</button>
        </div>
      </section>
    `;
    this.bindPanelActions(game);
  }

  renderUpgradeSelect(game) {
    const pending = game.activeRun?.pendingReward;
    const title = getUpgradeSelectTitle(pending);
    const subtitle = getUpgradeSelectSubtitle(pending);
    const collectedSummary = pending?.collectedSummary?.length
      ? `
        <div class="reward-summary" aria-label="Collected rewards">
          ${pending.collectedSummary.map((item) => `<span>${item}</span>`).join("")}
        </div>
      `
      : "";
    this.root.innerHTML = `
      <section class="overlay-panel upgrade-panel" role="dialog" aria-labelledby="upgradeTitle">
        <h2 id="upgradeTitle">${title}</h2>
        <p class="panel-subtitle">${subtitle}</p>
        ${collectedSummary}
        ${renderUpgradeCards(pending?.choices || [])}
        <div class="secondary-row">
          <button data-action="menu">Main Menu</button>
        </div>
      </section>
    `;
    this.bindPanelActions(game);
    this.root.querySelectorAll("[data-upgrade]").forEach((button) => {
      button.addEventListener("click", () => game.chooseUpgrade(button.dataset.upgrade));
    });
  }

  renderGameOver(game) {
    const summary = game.lastRunSummary;
    this.root.innerHTML = `
      <section class="overlay-panel" role="dialog" aria-labelledby="gameOverTitle">
        <h2 id="gameOverTitle">Game Over</h2>
        <p class="panel-subtitle">Reached level ${summary?.reachedLevel ?? 1}</p>
        <div class="button-stack">
          <button data-action="new">New Run</button>
          <button data-action="menu">Main Menu</button>
        </div>
      </section>
    `;
    this.bindPanelActions(game);
  }

  renderVictory(game) {
    const summary = game.lastRunSummary;
    this.root.innerHTML = `
      <section class="overlay-panel" role="dialog" aria-labelledby="victoryTitle">
        <h2 id="victoryTitle">Chapter Complete</h2>
        <p class="panel-subtitle">Cleared level ${summary?.reachedLevel ?? CAMPAIGN_MAX_LEVEL}</p>
        <div class="button-stack">
          <button data-action="new">New Run</button>
          <button data-action="menu">Main Menu</button>
        </div>
      </section>
    `;
    this.bindPanelActions(game);
  }

  bindPanelActions(game) {
    this.root.querySelectorAll("[data-action]").forEach((button) => {
      button.addEventListener("click", () => {
        const action = button.dataset.action;
        if (action === "continue") game.continueRun();
        if (action === "new") game.newRun();
        if (action === "store") game.openStore();
        if (action === "settings") game.openSettings();
        if (action === "resume") game.resume();
        if (action === "restart") game.restartLevel();
        if (action === "menu") game.returnToMenu();
        if (action === "back") game.closeSettings();
        if (action === "reset" && confirm("Reset save data?")) game.resetSave();
        if (action === "debug-next-level") game.debugNextLevel();
        if (action === "debug-reset" && confirm("Reset save data?")) game.debugResetSave();
      });
    });
  }
}

function countPermanentCores(permanentUpgrades = {}) {
  return Object.values(permanentUpgrades || {}).reduce((sum, count) => sum + (Number(count) || 0), 0);
}

function getUpgradeSelectTitle(pending) {
  if (pending?.kind === "bossElementChoice") return "Boss Element";
  if (pending?.kind === "stageBonus") {
    return pending.rewardMode === "permanent" ? "Permanent Core" : "Temporary Boost";
  }
  return "Choose Upgrade";
}

function getUpgradeSelectSubtitle(pending) {
  if (pending?.kind === "bossElementChoice") {
    return `Level ${pending?.levelCompleted ?? 1} boss clear · +${pending?.coinsAwarded ?? 0} coins`;
  }
  if (pending?.kind === "stageBonus") {
    return pending.rewardMode === "permanent"
      ? `Level ${pending?.levelCompleted ?? 1} clear · second-chance permanent roll hit`
      : `Level ${pending?.levelCompleted ?? 1} clear · choose a temporary boost`;
  }
  return `Level ${pending?.levelCompleted ?? 1} clear · +${pending?.coins ?? 0} coins`;
}

function renderStoreItem(upgrade, permanentUpgrades = {}, coins = 0) {
  const owned = permanentUpgrades[upgrade.id] || 0;
  const maxed = owned >= upgrade.maxStacks;
  const cost = maxed ? null : getPermanentUpgradeCost(upgrade, owned);
  const canAfford = !maxed && coins >= cost;
  const buttonText = maxed ? "Maxed" : `Buy ${formatCoins(cost)}`;
  return `
    <article class="store-item ${maxed ? "store-item--maxed" : ""}">
      <span class="store-icon" aria-hidden="true">${upgrade.icon || upgrade.shortLabel}</span>
      <div class="store-copy">
        <strong>${upgrade.name}</strong>
        <span>${upgrade.effectText}</span>
        <small>${upgrade.description}</small>
      </div>
      <div class="store-meta">
        <span>${owned}/${upgrade.maxStacks}</span>
        <span>${maxed ? "Maxed" : `Next: ${upgrade.effectText}`}</span>
      </div>
      <button data-permanent-upgrade="${upgrade.id}" ${canAfford ? "" : "disabled"}>${buttonText}</button>
    </article>
  `;
}

function formatCoins(value) {
  return Math.max(0, Math.round(Number(value) || 0)).toLocaleString("en-US");
}

import { BossSystem } from "../systems/BossSystem.js";
import { CollisionSystem } from "../systems/CollisionSystem.js";
import { ElementSystem } from "../systems/ElementSystem.js";
import { EnemySystem } from "../systems/EnemySystem.js";
import { HazardSystem } from "../systems/HazardSystem.js";
import { LevelSystem } from "../systems/LevelSystem.js";
import { ParticleSystem } from "../systems/ParticleSystem.js";
import { PickupSystem } from "../systems/PickupSystem.js";
import { ProjectileSystem } from "../systems/ProjectileSystem.js";
import { RewardSystem } from "../systems/RewardSystem.js";
import { UpgradeSystem } from "../systems/UpgradeSystem.js";
import { CAMPAIGN_MAX_LEVEL } from "../data/levels.js";
import { Ball } from "../entities/Ball.js";
import { Projectile } from "../entities/Projectile.js";
import { getBallElement } from "../data/ballElements.js";
import {
  createBossElementChoices,
  getBaseElement,
  getOwnedBallElementIds,
} from "../data/baseElements.js";
import {
  getActiveElementCombo,
  getElementCombo,
  listMatchingElementCombos,
} from "../data/elementCombos.js";
import { BOSS_COIN_REWARD, getRewardStyle } from "../data/rewardDrops.js";
import { getPermanentUpgrade, getPermanentUpgradeCost } from "../data/permanentUpgrades.js";

const BASE_STATS = {
  paddleWidth: 80,
  paddleSpeed: 650,
  ballRadius: 9,
  ballSpeed: 520,
  ballMinSpeed: 420,
  ballMaxSpeed: 860,
  ballDamage: 10,
  critChance: 0.05,
  critDamage: 1.5,
  element: "normal",
  elementChance: 0,
  statusDuration: 1,
  pierceChance: 0,
  maxSecondaryHitEvents: 8,
  cannonCooldown: 1.15,
  cannonDamageMultiplier: 0.55,
};

const STARTER_ASSIST = {
  useLevelOneAssistForAllLevels: true,
  authoredEndLevel: 5,
  generatedStartLevel: 6,
  generatedEndLevel: 18,
  generatedAssistRatio: 0.7,
  paddleWidthBonus: 93,
  ballSpeedBonus: 90,
  ballMinSpeedBonus: 70,
  ballRadiusBonus: 2,
};

export class Game {
  constructor({ input, renderer, saveSystem, screens, hud, debug, audio }) {
    this.input = input;
    this.renderer = renderer;
    this.saveSystem = saveSystem;
    this.screens = screens;
    this.hud = hud;
    this.debug = debug;
    this.audio = audio;
    this.mode = "boot";
    this.elapsed = 0;
    this.saveData = null;
    this.profile = null;
    this.settings = null;
    this.activeRun = null;
    this.lastPlayableMode = "mainMenu";
    this.levelSystem = new LevelSystem();
    this.bossSystem = new BossSystem();
    this.collisionSystem = new CollisionSystem();
    this.elementSystem = new ElementSystem();
    this.enemySystem = new EnemySystem();
    this.hazardSystem = new HazardSystem();
    this.particleSystem = new ParticleSystem();
    this.pickupSystem = new PickupSystem();
    this.projectileSystem = new ProjectileSystem();
    this.rewardSystem = new RewardSystem();
    this.upgradeSystem = new UpgradeSystem();
    this.level = null;
    this.stats = { ...BASE_STATS };
    this.clearTimer = 0;
    this.levelShieldCharges = 0;
    this.lastRunSummary = null;
    this.hitEventBudget = { secondary: 0, maxSecondary: BASE_STATS.maxSecondaryHitEvents };
    this.hitFeedback = null;
    this.comboReveal = null;
    this.comboRevealQueue = [];
  }

  boot() {
    this.saveData = this.saveSystem.load();
    this.profile = this.saveData.profile;
    this.settings = this.saveData.settings;
    this.activeRun = this.saveData.activeRun;
    this.audio.applySettings(this.settings);
    this.setMode("mainMenu");
  }

  update(delta) {
    this.elapsed += delta;
    this.debug.update(delta);
    this.updateHitFeedback(delta);
    const comboRevealWasActive = this.mode === "playing" && Boolean(this.comboReveal);
    if (comboRevealWasActive) {
      this.updateComboReveal(delta);
    }

    if (!this.input.isFormFocused()) {
      if (this.mode === "playing" && this.input.consumePressed("Escape")) {
        this.pause();
      } else if (this.mode === "paused" && this.input.consumePressed("Escape")) {
        this.resume();
      } else if (this.mode === "upgradeSelect") {
        this.handleUpgradeInput();
      }
    }

    if (this.mode === "playing" && !comboRevealWasActive && !this.comboReveal) {
      this.updatePlaying(delta);
    }

    this.hud.update(this);
    this.screens.update(this);
  }

  render() {
    this.renderer.render(this);
  }

  setMode(mode) {
    this.mode = mode;
    this.screens.update(this, true);
    this.hud.update(this);
  }

  newRun() {
    const now = new Date().toISOString();
    this.activeRun = {
      exists: true,
      runId: crypto.randomUUID?.() || `${Date.now()}`,
      seed: Math.floor(Math.random() * 2147483647),
      currentLevel: 1,
      lives: 3,
      runUpgrades: [],
      runScopedUpgrades: {},
      temporaryUpgrades: [],
      ownedElements: [],
      activeComboId: null,
      discoveredComboIds: [],
      coinsEarned: 0,
      pendingReward: null,
      startedAt: now,
      lastSavedAt: now,
    };
    this.saveData.statistics.totalRuns += 1;
    this.persist();
    this.startLevel(this.activeRun.currentLevel);
  }

  continueRun() {
    if (!this.activeRun) return;
    if (this.activeRun.pendingReward) {
      this.setMode("upgradeSelect");
      return;
    }
    this.startLevel(this.activeRun.currentLevel);
  }

  pause() {
    if (this.mode !== "playing") return;
    this.lastPlayableMode = "playing";
    this.setMode("paused");
  }

  resume() {
    if (this.mode !== "paused") return;
    this.setMode(this.lastPlayableMode);
  }

  restartLevel() {
    if (!this.activeRun) {
      this.setMode("mainMenu");
      return;
    }
    this.activeRun.pendingReward = null;
    this.persist();
    this.startLevel(this.activeRun.currentLevel);
  }

  openSettings() {
    this.lastPlayableMode = this.mode;
    this.setMode("settings");
  }

  openStore() {
    this.setMode("store");
  }

  closeSettings() {
    this.setMode(this.lastPlayableMode === "settings" ? "mainMenu" : this.lastPlayableMode);
  }

  returnToMenu() {
    this.persist();
    this.setMode("mainMenu");
  }

  updateSettings(patch) {
    this.settings = { ...this.settings, ...patch };
    this.saveData.settings = this.settings;
    this.audio.applySettings(this.settings);
    this.persist();
  }

  resetSave() {
    this.saveData = this.saveSystem.reset();
    this.profile = this.saveData.profile;
    this.settings = this.saveData.settings;
    this.activeRun = this.saveData.activeRun;
    this.audio.applySettings(this.settings);
    this.setMode("mainMenu");
  }

  debugNextLevel() {
    if (!this.debug.enabled || !this.activeRun) return;
    this.activeRun.pendingReward = null;
    if (this.activeRun.currentLevel >= CAMPAIGN_MAX_LEVEL) {
      this.lastRunSummary = {
        result: "victory",
        reachedLevel: CAMPAIGN_MAX_LEVEL,
        coinsEarned: this.activeRun.coinsEarned,
        upgrades: [...this.activeRun.runUpgrades],
      };
      this.activeRun = null;
      this.level = null;
      this.persist();
      this.setMode("victory");
      return;
    }
    this.activeRun.currentLevel += 1;
    this.persist();
    this.startLevel(this.activeRun.currentLevel);
  }

  debugResetSave() {
    if (!this.debug.enabled) return;
    this.resetSave();
  }

  startLevel(levelNumber, { autoLaunch = false, clearNotification = null } = {}) {
    this.updateRunCombo({ reveal: false });
    this.stats = this.calculateStats();
    this.level = this.levelSystem.createLevel(levelNumber, this.stats, this.activeRun?.seed, {
      profilePermanentUpgrades: this.profile?.permanentUpgrades || {},
      runScopedUpgrades: this.activeRun?.runScopedUpgrades || {},
    });
    this.clearTimer = 0;
    this.levelShieldCharges = this.stats.shieldSaves || 0;
    this.persist();
    this.setMode("playing");
    if (clearNotification) {
      this.showClearNotification(clearNotification);
    }
    if (autoLaunch) {
      this.launchStuckBalls();
    }
  }

  calculateStats({ includeStaged = false } = {}) {
    const staged = includeStaged ? this.level?.stagedRewards : null;
    const runUpgrades = [
      ...(this.activeRun?.runUpgrades || []),
      ...(staged?.runUpgrades || []),
    ];
    const temporaryUpgrades = [
      ...(this.activeRun?.temporaryUpgrades || []),
      ...(staged?.temporaryUpgrades || []),
    ];
    const runScopedUpgrades = mergeStackMaps(
      this.activeRun?.runScopedUpgrades,
      staged?.runScopedUpgrades,
    );
    const stats = this.upgradeSystem.applyToStats(
      BASE_STATS,
      runUpgrades,
      temporaryUpgrades,
      this.profile?.permanentUpgrades || {},
      runScopedUpgrades,
    );
    applyOwnedElementStats(stats, this.activeRun?.ownedElements || []);
    const activeCombo = getActiveElementCombo(this.activeRun?.ownedElements || []);
    stats.activeComboId = activeCombo?.id || null;
    stats.activeCombo = activeCombo;
    const levelNumber = this.activeRun?.currentLevel || 1;
    const assistRatio = getStarterAssistRatio(levelNumber);

    if (assistRatio > 0) {
      stats.paddleWidth = Math.min(260, stats.paddleWidth + Math.round(STARTER_ASSIST.paddleWidthBonus * assistRatio));
      stats.ballSpeed = Math.min(stats.ballMaxSpeed, stats.ballSpeed + Math.round(STARTER_ASSIST.ballSpeedBonus * assistRatio));
      stats.ballMinSpeed = Math.min(
        stats.ballSpeed,
        stats.ballMinSpeed + Math.round(STARTER_ASSIST.ballMinSpeedBonus * assistRatio),
      );
      stats.ballRadius = Math.min(11, stats.ballRadius + Math.round(STARTER_ASSIST.ballRadiusBonus * assistRatio));
    }

    return stats;
  }

  resetHitEventBudget() {
    this.hitEventBudget = {
      secondary: 0,
      maxSecondary: this.stats.maxSecondaryHitEvents || BASE_STATS.maxSecondaryHitEvents,
    };
  }

  updatePlaying(delta) {
    if (!this.level || !this.activeRun) {
      this.returnToMenu();
      return;
    }

    this.level.elapsed += delta;
    this.resetHitEventBudget();
    this.level.paddle.update(delta, this.input, this.settings);

    const launchRequested = !this.input.isFormFocused() && this.input.consumePointerPress();
    if (launchRequested) {
      this.launchStuckBalls();
    }
    if (!this.input.isFormFocused() && this.input.consumePressed("Space")) {
      this.fireCannon();
    }

    this.enemySystem.update(this, delta);
    if (this.mode !== "playing" || !this.level) return;
    this.bossSystem.update(this, delta);
    this.hazardSystem.update(this, delta);
    if (this.mode !== "playing" || !this.level) return;
    this.projectileSystem.update(this, delta);
    if (this.mode !== "playing" || !this.level) return;
    this.pickupSystem.update(this, delta);

    for (const ball of this.level.balls) {
      ball.age += delta;
      this.particleSystem.trail(this.level, ball);
      this.collisionSystem.updateBall(ball, this, delta);
    }

    this.elementSystem.updateStatuses(
      [
        ...this.level.bricks,
        ...this.level.enemies,
        ...(this.level.boss ? [this.level.boss] : []),
      ],
      this,
      delta,
    );
    this.particleSystem.update(this.level, delta);

    if (this.levelSystem.isClear(this.level)) {
      this.clearTimer += delta;
      if (this.clearTimer > 0.25) {
        this.completeLevel();
      }
      return;
    } else {
      this.clearTimer = 0;
    }

    this.handleLostBalls();
  }

  takeHostileHit(source) {
    if (!this.activeRun || !this.level) return;
    if (this.levelShieldCharges > 0) {
      this.levelShieldCharges -= 1;
      this.level.projectiles = [];
      this.triggerDefenseFeedback("shield");
      this.respawnBalls();
      this.persist();
      return;
    }

    this.activeRun.lives -= source.damage ?? 1;
    if (this.activeRun.lives <= 0) {
      this.triggerDefenseFeedback("life");
      this.gameOver();
      return;
    }

    this.level.projectiles = [];
    this.triggerDefenseFeedback("life");
    this.respawnBalls();
    this.persist();
  }

  handleDestroyedTarget(target) {
    if (target.kind === "brick" && target.reward) {
      this.rewardSystem.spawnPickupFromBrick(this, target);
    }
    if (target.kind === "boss") {
      this.awardBossClearCoins();
    }
  }

  collectPickup(pickup, { auto = false, suppressText = false } = {}) {
    if (!pickup || pickup.collected) return;
    pickup.collected = true;
    pickup.active = false;
    this.applyReward(pickup.reward, { immediate: true, stageForCommit: true });
    const entry = this.logCollectedReward(pickup.reward, { auto });
    const impactX = this.level?.paddle?.x ?? pickup.x;
    const impactY = this.level?.paddle?.y ?? pickup.y;
    if (!suppressText && entry) {
      this.showRewardText(entry.text, {
        x: impactX,
        y: this.level?.paddle ? impactY - 34 : pickup.y,
        color: entry.color,
      });
    }
    this.particleSystem.hit(this.level, impactX, impactY, "rgba(255, 232, 150, 0.95)");
    this.particleSystem.burst(this.level, impactX, impactY - 4, entry?.color || "rgba(255, 232, 150, 0.95)");
    this.audio.play("select");
    return entry;
  }

  autoCollectPendingPickups() {
    if (!this.level?.pickups) return;
    const entries = [];
    for (const pickup of this.level.pickups) {
      if (pickup.collected) continue;
      if (pickup.active || pickup.collectOnClear) {
        const entry = this.collectPickup(pickup, { auto: true, suppressText: true });
        if (entry) entries.push(entry);
      }
    }
    this.level.pickups = this.level.pickups.filter((pickup) => !pickup.collected);
    this.showAutoCollectText(entries);
  }

  logCollectedReward(reward, { auto = false } = {}) {
    if (!reward || !this.level) return null;
    const style = getRewardStyle(reward);
    const entry = {
      kind: reward.kind,
      label: reward.label || reward.name || reward.id,
      text: formatRewardText(reward, { auto }),
      color: style.stroke,
      auto,
    };
    this.level.collectedRewardLog.push(entry);
    return entry;
  }

  showRewardText(text, { x, y, color, delay = 0 } = {}) {
    if (!this.level || !text) return;
    this.particleSystem.floatingText(this.level, {
      x: x ?? this.level.paddle.x,
      y: y ?? this.level.paddle.y - 34,
      text,
      color,
      delay,
    });
  }

  showAutoCollectText(entries) {
    if (!entries?.length || !this.level) return;
    const x = this.level.paddle.x;
    const y = this.level.paddle.y - 48;
    if (entries.length <= 2) {
      entries.forEach((entry, index) => {
        this.showRewardText(entry.text, {
          x,
          y: y - index * 22,
          color: entry.color,
          delay: index * 0.18,
        });
      });
      return;
    }

    this.showRewardText(`Auto-collected: ${entries.length} rewards`, {
      x,
      y,
      color: "rgba(255, 255, 255, 0.95)",
    });
    entries.slice(0, 3).forEach((entry, index) => {
      this.showRewardText(entry.text.replace("Auto: ", ""), {
        x,
        y: y - 24 - index * 22,
        color: entry.color,
        delay: 0.18 + index * 0.16,
      });
    });
  }

  showClearNotification(text) {
    if (!this.level || !text) return;
    this.showRewardText(text, {
      x: 480,
      y: 150,
      color: "rgba(238, 248, 234, 0.95)",
    });
  }

  applyReward(reward, { immediate = false, stageForCommit = false, commitNow = false } = {}) {
    if (!reward) return;

    if (reward.kind === "currency") {
      this.addCoins(reward.amount || 0, commitNow);
      return;
    }

    if (reward.kind === "permanentUpgrade") {
      if (commitNow) {
        this.addPermanentUpgrade(reward.permanentId || reward.id);
      } else if (stageForCommit && this.level) {
        this.level.stagedRewards.permanentUpgrades.push(reward.permanentId || reward.id);
      }
      return;
    }

    if (reward.kind === "elementChoice") {
      const added = this.addRunElement(reward.elementId);
      if (added) {
        this.updateRunCombo({ reveal: true });
        if (immediate && this.mode === "playing") {
          this.applyCurrentLevelStats();
        }
      }
      return;
    }

    if (reward.kind === "runUpgrade") {
      const upgradeId = reward.upgradeId;
      const selected = [
        ...(this.activeRun?.runUpgrades || []),
        ...(this.level?.stagedRewards?.runUpgrades || []),
      ];
      if (!this.upgradeSystem.canTakeUpgrade(upgradeId, selected)) {
        this.applyReward(createDuplicateRunFallbackReward(), { immediate, stageForCommit, commitNow });
        return;
      }
      if (commitNow) {
        this.activeRun.runUpgrades.push(upgradeId);
      } else if (stageForCommit && this.level) {
        this.level.stagedRewards.runUpgrades.push(upgradeId);
      }
      if (immediate) {
        this.applyCurrentLevelStats();
      }
      return;
    }

    if (reward.kind === "runScopedUpgrade") {
      const upgradeId = reward.upgradeId || reward.id;
      const selected = mergeStackMaps(
        this.activeRun?.runScopedUpgrades,
        this.level?.stagedRewards?.runScopedUpgrades,
      );
      if (!this.upgradeSystem.canTakeRunScopedUpgrade(
        upgradeId,
        this.profile?.permanentUpgrades || {},
        selected,
      )) {
        return;
      }
      if (commitNow) {
        this.addRunScopedUpgrade(upgradeId);
      } else if (stageForCommit && this.level) {
        incrementStack(this.level.stagedRewards.runScopedUpgrades, upgradeId);
      }
      if (immediate) {
        this.applyCurrentLevelStats();
      }
      return;
    }

    if (reward.kind === "temporaryUpgrade" || reward.kind === "instant") {
      const duration = reward.kind === "temporaryUpgrade"
        ? 0
        : Math.max(0, reward.durationLevels ?? 0);
      const entry = {
        id: reward.id,
        label: reward.label || reward.id,
        remainingLevels: commitNow ? duration : Math.max(0, duration - 1),
        statModifiers: { ...(reward.statModifiers || {}) },
      };
      if (commitNow && entry.remainingLevels > 0) {
        this.activeRun.temporaryUpgrades.push(entry);
      } else if (stageForCommit && this.level) {
        this.level.stagedRewards.temporaryUpgrades.push(entry);
      }
      if (immediate) {
        this.applyCurrentLevelStats();
      }
    }
  }

  addCoins(amount, commitNow) {
    const coins = Math.max(0, Math.round(amount || 0));
    if (coins <= 0) return;
    if (commitNow || !this.level) {
      this.profile.coins += coins;
      this.activeRun.coinsEarned += coins;
      return;
    }
    this.level.stagedRewards.coins += coins;
  }

  addPermanentUpgrade(permanentId) {
    const upgrade = getPermanentUpgrade(permanentId);
    if (!upgrade) return false;
    const current = this.profile.permanentUpgrades[permanentId] || 0;
    if (current >= upgrade.maxStacks) return false;
    this.profile.permanentUpgrades[permanentId] = current + 1;
    return true;
  }

  purchasePermanentUpgrade(permanentId) {
    const upgrade = getPermanentUpgrade(permanentId);
    if (!upgrade) return false;
    const owned = this.profile.permanentUpgrades[permanentId] || 0;
    if (owned >= upgrade.maxStacks) return false;
    const cost = getPermanentUpgradeCost(upgrade, owned);
    if (this.profile.coins < cost) return false;

    this.profile.coins -= cost;
    this.addPermanentUpgrade(permanentId);
    this.persist();
    this.audio.play("select");
    this.setMode("store");
    return true;
  }

  addRunScopedUpgrade(upgradeId) {
    if (!upgradeId || !this.activeRun) return;
    if (!this.upgradeSystem.canTakeRunScopedUpgrade(
      upgradeId,
      this.profile?.permanentUpgrades || {},
      this.activeRun.runScopedUpgrades || {},
    )) {
      return;
    }
    this.activeRun.runScopedUpgrades = this.activeRun.runScopedUpgrades || {};
    incrementStack(this.activeRun.runScopedUpgrades, upgradeId);
  }

  addRunElement(elementId) {
    if (!this.activeRun || !getBaseElement(elementId)) return false;
    this.activeRun.ownedElements = this.activeRun.ownedElements || [];
    if (this.activeRun.ownedElements.includes(elementId)) return false;
    this.activeRun.ownedElements.push(elementId);
    return true;
  }

  enableTestElement(elementId) {
    if (!this.activeRun || !getBaseElement(elementId)) return false;
    const added = this.addRunElement(elementId);
    this.updateRunCombo({ reveal: false });
    this.applyCurrentLevelStats();
    this.persist();
    return added;
  }

  clearTestElements() {
    if (!this.activeRun) return false;
    const hadElements = (this.activeRun.ownedElements || []).length > 0;
    this.activeRun.ownedElements = [];
    this.activeRun.activeComboId = null;
    this.activeRun.discoveredComboIds = [];
    this.comboReveal = null;
    this.comboRevealQueue = [];
    this.applyCurrentLevelStats();
    this.persist();
    return hadElements;
  }

  updateRunCombo({ reveal = false } = {}) {
    if (!this.activeRun) return null;
    this.activeRun.ownedElements = this.activeRun.ownedElements || [];
    const previousComboId = this.activeRun.activeComboId || null;
    const matchingCombos = listMatchingElementCombos(this.activeRun.ownedElements);
    const activeCombo = getActiveElementCombo(this.activeRun.ownedElements);
    const discoveredIds = new Set(
      (this.activeRun.discoveredComboIds || []).filter((comboId) => getElementCombo(comboId)),
    );
    const newlyDiscovered = matchingCombos.filter((combo) => !discoveredIds.has(combo.id));

    for (const combo of newlyDiscovered) {
      discoveredIds.add(combo.id);
    }

    this.activeRun.activeComboId = activeCombo?.id || null;
    this.activeRun.discoveredComboIds = [...discoveredIds];

    if (reveal && activeCombo && activeCombo.id !== previousComboId) {
      const revealCombos = selectComboReveals(newlyDiscovered, activeCombo);
      this.queueComboReveals(revealCombos.length > 0 ? revealCombos : [activeCombo]);
    }

    return activeCombo;
  }

  queueComboReveals(combos = []) {
    const queuedIds = new Set(this.comboRevealQueue.map((combo) => combo.id));
    if (this.comboReveal) {
      queuedIds.add(this.comboReveal.id);
    }

    for (const combo of combos) {
      if (!combo || queuedIds.has(combo.id)) continue;
      this.comboRevealQueue.push(combo);
      queuedIds.add(combo.id);
    }

    this.startNextComboReveal();
  }

  startNextComboReveal() {
    if (this.comboReveal || this.comboRevealQueue.length === 0) return;
    const combo = this.comboRevealQueue.shift();
    const maxLife = this.settings?.reducedMotion ? 1.15 : 1.65;
    this.comboReveal = {
      id: combo.id,
      name: combo.name,
      description: combo.description,
      order: combo.order,
      life: maxLife,
      maxLife,
    };
    this.triggerComboRevealBurst(combo);
  }

  updateComboReveal(delta) {
    if (!this.comboReveal) return;
    this.comboReveal.life -= delta;
    if (this.comboReveal.life > 0) return;

    this.comboReveal = null;
    this.startNextComboReveal();
  }

  triggerComboRevealBurst(combo) {
    if (!this.level) return;
    const color = combo.order >= 4
      ? "rgba(255, 232, 150, 0.96)"
      : combo.order >= 3
        ? "rgba(134, 215, 255, 0.95)"
        : "rgba(97, 215, 198, 0.95)";
    this.particleSystem.burst(this.level, 480, 300, color);
    this.particleSystem.burst(this.level, 480, 300, "rgba(255, 255, 255, 0.88)");
    this.showRewardText(`${combo.name} Combo`, {
      x: 480,
      y: 188,
      color,
    });
    this.audio.play("hit");
  }

  awardBossClearCoins() {
    if (!this.level || this.level.bossClearCoinsAwarded) return 0;
    this.level.bossClearCoinsAwarded = true;
    this.addCoins(BOSS_COIN_REWARD, true);
    this.showRewardText(`+${BOSS_COIN_REWARD} Coins`, {
      x: 480,
      y: 128,
      color: "rgba(255, 232, 150, 0.95)",
    });
    this.persist();
    return BOSS_COIN_REWARD;
  }

  applyCurrentLevelStats() {
    if (!this.level) return;
    const previousStats = this.stats;
    this.stats = this.calculateStats({ includeStaged: true });
    const paddle = this.level.paddle;
    paddle.width = this.stats.paddleWidth;
    paddle.speed = this.stats.paddleSpeed;
    paddle.cannonEnabled = this.stats.cannonEnabled || false;
    paddle.cannonCooldownDuration = this.stats.cannonCooldown || paddle.cannonCooldownDuration;
    paddle.cannonProjectileCount = this.stats.cannonProjectileCount || paddle.cannonProjectileCount;
    paddle.cannonDamageMultiplier = this.stats.cannonDamageMultiplier || paddle.cannonDamageMultiplier;

    const shieldGain = Math.max(0, (this.stats.shieldSaves || 0) - (previousStats.shieldSaves || 0));
    this.levelShieldCharges += shieldGain;

    for (const ball of this.level.balls) {
      if (!ball.active) continue;
      ball.speed = this.stats.ballSpeed;
      ball.damage = this.stats.ballDamage;
      ball.critChance = this.stats.critChance;
      ball.critDamage = this.stats.critDamage;
      ball.element = this.stats.element;
      ball.elements = [...this.stats.activeElements];
      ball.pierceChance = this.stats.pierceChance;
      ball.radius = this.stats.ballRadius;
      if (ball.stuckToPaddle) {
        ball.stickTo(paddle);
      }
    }

    const activeBallCount = this.level.balls.filter((ball) => ball.active).length;
    const missing = Math.max(0, this.stats.ballCount - activeBallCount);
    if (missing > 0) {
      this.spawnBonusBalls(missing);
    }
  }

  spawnBonusBalls(count) {
    const paddle = this.level.paddle;
    for (let index = 0; index < count; index += 1) {
      const ball = new Ball({
        x: paddle.x,
        y: paddle.y - paddle.height / 2 - this.stats.ballRadius - 1,
        radius: this.stats.ballRadius,
        speed: this.stats.ballSpeed,
        damage: this.stats.ballDamage,
        critChance: this.stats.critChance,
        critDamage: this.stats.critDamage,
        element: this.stats.element,
        elements: this.stats.activeElements,
        pierceChance: this.stats.pierceChance,
      });
      const offset = (index - (count - 1) / 2) * this.stats.ballRadius * 2.5;
      ball.stickTo(paddle);
      ball.x += offset;
      if (this.level.hasLaunchedBalls) {
        ball.launch(offset * 0.7);
      }
      this.level.balls.push(ball);
    }
  }

  launchStuckBalls() {
    const stuck = this.level.balls.filter((ball) => ball.active && ball.stuckToPaddle);
    stuck.forEach((ball, index) => {
      const offset = stuck.length > 1 ? (index - (stuck.length - 1) / 2) * 14 : 0;
      ball.launch(offset);
    });
    if (stuck.length > 0) {
      this.level.hasLaunchedBalls = true;
      this.audio.play("select");
    }
  }

  fireCannon() {
    const paddle = this.level?.paddle;
    if (!this.level?.hasLaunchedBalls) return;
    if (!paddle?.canFireCannon()) return;

    const count = Math.max(1, paddle.cannonProjectileCount);
    const element = getBallElement(this.stats.element);
    const spacing = 18;
    const speed = 620;

    for (let index = 0; index < count; index += 1) {
      const offset = (index - (count - 1) / 2) * spacing;
      const angleOffset = (index - (count - 1) / 2) * 0.12;
      this.level.projectiles.push(new Projectile(this.level.nextProjectileId++, {
        owner: "player",
        ownerId: "paddle",
        type: "cannon",
        assetId: "projectile_player_cannon",
        x: paddle.x + offset,
        y: paddle.y - paddle.height / 2 - 8,
        vx: Math.sin(angleOffset) * speed,
        vy: -Math.cos(angleOffset) * speed,
        radius: 5,
        damage: this.stats.ballDamage * paddle.cannonDamageMultiplier,
        element: this.stats.element,
        elements: this.stats.activeElements,
        critChance: this.stats.critChance * 0.75,
        critDamage: this.stats.critDamage,
        pierceChance: 0,
        color: element.glowColor,
        accent: element.color,
        life: 1.45,
      }));
    }

    paddle.markCannonFired();
    this.audio.play("hit");
  }

  handleLostBalls() {
    const activeBalls = this.level.balls.filter((ball) => ball.active);
    for (const ball of activeBalls) {
      if (ball.y - ball.radius > 620) {
        ball.active = false;
        this.saveData.statistics.totalBallsLost += 1;
      }
    }

    if (this.level.balls.some((ball) => ball.active)) {
      return;
    }

    if (this.levelShieldCharges > 0) {
      this.levelShieldCharges -= 1;
      this.triggerDefenseFeedback("shield");
      this.respawnBalls();
      return;
    }

    this.activeRun.lives -= 1;
    if (this.activeRun.lives <= 0) {
      this.triggerDefenseFeedback("life");
      this.gameOver();
      return;
    }

    this.triggerDefenseFeedback("life");
    this.respawnBalls();
    this.persist();
  }

  updateHitFeedback(delta) {
    if (!this.hitFeedback) return;
    this.hitFeedback.life -= delta;
    if (this.hitFeedback.life <= 0) {
      this.hitFeedback = null;
    }
  }

  triggerDefenseFeedback(kind) {
    if (!this.level) return;
    const color = kind === "shield" ? "rgba(134, 215, 255, 0.95)" : "rgba(255, 126, 97, 0.95)";
    const text = kind === "shield" ? "Shield Shattered" : "Heart Lost";
    this.hitFeedback = {
      kind,
      life: 0.58,
      maxLife: 0.58,
      color,
    };
    this.particleSystem.burst(this.level, this.level.paddle.x, this.level.paddle.y - 6, color);
    this.showRewardText(text, {
      x: this.level.paddle.x,
      y: this.level.paddle.y - 42,
      color,
    });
  }

  respawnBalls() {
    const freshLevel = this.levelSystem.createLevel(this.activeRun.currentLevel, this.stats, this.activeRun.seed, {
      profilePermanentUpgrades: this.profile?.permanentUpgrades || {},
      runScopedUpgrades: this.activeRun?.runScopedUpgrades || {},
    });
    freshLevel.balls.forEach((ball, index) => {
      ball.stickTo(this.level.paddle);
      ball.x += (index - (freshLevel.balls.length - 1) / 2) * this.stats.ballRadius * 2.5;
    });
    this.level.balls = freshLevel.balls;
    this.level.hasLaunchedBalls = false;
  }

  completeLevel() {
    const completedLevel = this.activeRun.currentLevel;
    const wasBossLevel = this.level?.definition?.isBossLevel === true;
    this.autoCollectPendingPickups();
    if (wasBossLevel) {
      this.awardBossClearCoins();
    }
    this.decayCommittedTemporaryUpgrades();
    this.commitStagedRewards();
    this.profile.highestLevelUnlocked = Math.max(
      this.profile.highestLevelUnlocked,
      Math.min(completedLevel + 1, CAMPAIGN_MAX_LEVEL),
    );

    if (completedLevel >= CAMPAIGN_MAX_LEVEL) {
      this.lastRunSummary = {
        result: "victory",
        reachedLevel: completedLevel,
        coinsEarned: this.activeRun.coinsEarned,
        upgrades: [...this.activeRun.runUpgrades],
      };
      this.profile.totalVictories += 1;
      this.activeRun = null;
      this.level = null;
      this.persist();
      this.setMode("victory");
      return;
    }

    if (!wasBossLevel) {
      this.activeRun.currentLevel = Math.min(completedLevel + 1, CAMPAIGN_MAX_LEVEL);
      this.activeRun.pendingReward = null;
      this.persist();
      this.startLevel(this.activeRun.currentLevel, {
        autoLaunch: true,
        clearNotification: `Level ${completedLevel} Clear`,
      });
      return;
    }

    const choices = createBossElementChoices({
      seed: this.activeRun.seed,
      levelNumber: completedLevel,
      ownedElements: this.activeRun.ownedElements || [],
    });
    this.activeRun.pendingReward = {
      kind: "bossElementChoice",
      levelCompleted: completedLevel,
      choices,
      coinsAwarded: BOSS_COIN_REWARD,
    };
    this.persist();
    this.setMode("upgradeSelect");
  }

  decayCommittedTemporaryUpgrades() {
    this.activeRun.temporaryUpgrades = (this.activeRun.temporaryUpgrades || [])
      .map((upgrade) => ({
        ...upgrade,
        remainingLevels: Math.max(0, (upgrade.remainingLevels || 0) - 1),
      }))
      .filter((upgrade) => upgrade.remainingLevels > 0);
  }

  commitStagedRewards() {
    const staged = this.level?.stagedRewards;
    if (!staged) return;

    for (const upgradeId of staged.runUpgrades) {
      if (this.upgradeSystem.canTakeUpgrade(upgradeId, this.activeRun.runUpgrades)) {
        this.activeRun.runUpgrades.push(upgradeId);
      }
    }

    for (const [upgradeId, count] of Object.entries(staged.runScopedUpgrades || {})) {
      for (let index = 0; index < count; index += 1) {
        this.addRunScopedUpgrade(upgradeId);
      }
    }

    this.activeRun.temporaryUpgrades.push(
      ...staged.temporaryUpgrades
        .filter((upgrade) => (upgrade.remainingLevels || 0) > 0)
        .map((upgrade) => ({
          ...upgrade,
          statModifiers: { ...(upgrade.statModifiers || {}) },
        })),
    );

    for (const permanentId of staged.permanentUpgrades) {
      this.addPermanentUpgrade(permanentId);
    }

    if (staged.coins > 0) {
      this.profile.coins += staged.coins;
      this.activeRun.coinsEarned += staged.coins;
    }
  }

  handleUpgradeInput() {
    const codes = ["Digit1", "Digit2", "Digit3", "Digit4"];
    const index = codes.findIndex((code) => this.input.consumePressed(code));
    if (index >= 0) {
      const choice = this.activeRun?.pendingReward?.choices?.[index];
      if (choice) this.chooseUpgrade(choice.id);
    }
  }

  chooseUpgrade(upgradeId) {
    const pending = this.activeRun?.pendingReward;
    const choice = pending?.choices?.find((item) => item.id === upgradeId);
    const allowed = Boolean(choice);
    if (!pending || !allowed) return;

    if (pending.kind === "stageBonus" || pending.kind === "bossElementChoice" || choice.kind) {
      this.applyReward(choice, { commitNow: true });
    } else {
      this.activeRun.runUpgrades.push(upgradeId);
    }

    this.activeRun.currentLevel = Math.min(pending.levelCompleted + 1, CAMPAIGN_MAX_LEVEL);
    this.activeRun.pendingReward = null;
    this.persist();
    this.audio.play("select");
    this.startLevel(this.activeRun.currentLevel, {
      autoLaunch: true,
      clearNotification: pending.kind === "bossElementChoice" ? `Boss Clear +${pending.coinsAwarded || 0} Coins` : null,
    });
  }

  gameOver() {
    this.lastRunSummary = {
      result: "defeat",
      reachedLevel: this.activeRun?.currentLevel ?? 1,
      coinsEarned: this.activeRun?.coinsEarned ?? 0,
      upgrades: [...(this.activeRun?.runUpgrades || [])],
    };
    this.saveData.statistics.totalDeaths += 1;
    this.activeRun = null;
    this.level = null;
    this.persist();
    this.setMode("gameOver");
  }

  handleHidden() {
    if (this.mode === "playing") {
      this.pause();
    }
  }

  persist() {
    if (this.activeRun) {
      this.activeRun.lastSavedAt = new Date().toISOString();
    }
    this.saveData.profile = this.profile;
    this.saveData.settings = this.settings;
    this.saveData.activeRun = this.activeRun;
    this.saveData = this.saveSystem.save(this.saveData);
  }
}

function createDuplicateRunFallbackReward() {
  return {
    kind: "temporaryUpgrade",
    id: "fallback_temp_damage_2",
    label: "+2 Damage",
    durationLevels: 1,
    statModifiers: { ballDamageAdd: 2 },
  };
}

function mergeStackMaps(...maps) {
  const merged = {};
  for (const map of maps) {
    if (!map || typeof map !== "object") continue;
    for (const [id, count] of Object.entries(map)) {
      const value = Math.trunc(Number(count) || 0);
      if (value > 0) {
        merged[id] = (merged[id] || 0) + value;
      }
    }
  }
  return merged;
}

function incrementStack(map, id, amount = 1) {
  if (!map || !id) return;
  const value = Math.trunc(Number(amount) || 0);
  if (value <= 0) return;
  map[id] = (map[id] || 0) + value;
}

function selectComboReveals(newlyDiscovered, activeCombo) {
  if (!activeCombo) return [];
  const sameOrder = newlyDiscovered
    .filter((combo) => combo.order === activeCombo.order)
    .sort((a, b) => a.priority - b.priority);
  return sameOrder.length > 0 ? sameOrder : [activeCombo];
}

function applyOwnedElementStats(stats, ownedElements = []) {
  const ownedBallElements = getOwnedBallElementIds(ownedElements);
  if (ownedBallElements.length === 0) return;

  const activeElements = new Set((stats.activeElements || []).filter((id) => id && id !== "normal"));
  for (const elementId of ownedBallElements) {
    activeElements.add(elementId);
  }
  stats.activeElements = [...activeElements];
  stats.element = stats.activeElements[0] || "normal";
}

function formatRewardText(reward, { auto = false } = {}) {
  const prefix = auto ? "Auto: " : "";
  const label = reward.label || reward.name || reward.id;
  if (reward.kind === "permanentUpgrade") return `${prefix}Permanent: ${label}`;
  if (reward.kind === "elementChoice") return `${prefix}Element: ${label}`;
  if (reward.kind === "runUpgrade") return `${prefix}Run: ${label}`;
  if (reward.kind === "runScopedUpgrade") return `${prefix}Run: ${label}`;
  if (reward.kind === "temporaryUpgrade") {
    const duration = reward.durationLevels || 1;
    return `${prefix}Temp: ${label} (${duration} ${duration === 1 ? "level" : "levels"})`;
  }
  if (reward.kind === "instant") return `${prefix}${label}`;
  if (reward.kind === "currency") return `${prefix}${label}`;
  return `${prefix}${label}`;
}

function summarizeCollectedRewards(entries) {
  if (!entries?.length) return [];
  return entries.slice(-6).map((entry) => entry.text.replace("Auto: ", ""));
}

function getStarterAssistRatio(levelNumber) {
  if (STARTER_ASSIST.useLevelOneAssistForAllLevels) {
    return 1;
  }

  if (levelNumber < STARTER_ASSIST.authoredEndLevel) {
    return Math.max(
      0,
      (STARTER_ASSIST.authoredEndLevel - levelNumber) / (STARTER_ASSIST.authoredEndLevel - 1),
    );
  }

  if (levelNumber >= STARTER_ASSIST.generatedStartLevel && levelNumber < STARTER_ASSIST.generatedEndLevel) {
    const span = STARTER_ASSIST.generatedEndLevel - STARTER_ASSIST.generatedStartLevel;
    return Math.max(
      0,
      ((STARTER_ASSIST.generatedEndLevel - levelNumber) / span) * STARTER_ASSIST.generatedAssistRatio,
    );
  }

  return 0;
}

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

const BASE_STATS = {
  paddleWidth: 120,
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
  paddleWidthBonus: 140,
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

    if (!this.input.isFormFocused()) {
      if (this.mode === "playing" && this.input.consumePressed("Escape")) {
        this.pause();
      } else if (this.mode === "paused" && this.input.consumePressed("Escape")) {
        this.resume();
      } else if (this.mode === "upgradeSelect") {
        this.handleUpgradeInput();
      }
    }

    if (this.mode === "playing") {
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
      temporaryUpgrades: [],
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

  startLevel(levelNumber) {
    this.stats = this.calculateStats();
    this.level = this.levelSystem.createLevel(levelNumber, this.stats, this.activeRun?.seed);
    this.clearTimer = 0;
    this.levelShieldCharges = this.stats.shieldSaves || 0;
    this.persist();
    this.setMode("playing");
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
    const stats = this.upgradeSystem.applyToStats(BASE_STATS, runUpgrades, temporaryUpgrades);
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

    const launchRequested = !this.input.isFormFocused() && (
      this.input.consumePressed("Space") ||
      this.input.consumePointerPress()
    );
    if (launchRequested) {
      this.launchStuckBalls();
    }
    if (!this.input.isFormFocused() && this.input.consumePressed("KeyF")) {
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
      this.respawnBalls();
      this.persist();
      return;
    }

    this.activeRun.lives -= source.damage ?? 1;
    if (this.activeRun.lives <= 0) {
      this.gameOver();
      return;
    }

    this.level.projectiles = [];
    this.respawnBalls();
    this.persist();
  }

  handleDestroyedTarget(target) {
    if (target.kind === "brick" && target.reward) {
      this.rewardSystem.spawnPickupFromBrick(this, target);
    }
  }

  collectPickup(pickup) {
    if (!pickup || pickup.collected) return;
    pickup.collected = true;
    pickup.active = false;
    this.applyReward(pickup.reward, { immediate: true, stageForCommit: true });
    this.particleSystem.hit(this.level, pickup.x, pickup.y, "rgba(255, 232, 150, 0.95)");
    this.audio.play("select");
  }

  autoCollectPendingPickups() {
    if (!this.level?.pickups) return;
    for (const pickup of this.level.pickups) {
      if (pickup.collected) continue;
      if (pickup.active || pickup.collectOnClear) {
        this.collectPickup(pickup);
      }
    }
    this.level.pickups = this.level.pickups.filter((pickup) => !pickup.collected);
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

    if (reward.kind === "runUpgrade") {
      const upgradeId = reward.upgradeId;
      const selected = [
        ...(this.activeRun?.runUpgrades || []),
        ...(this.level?.stagedRewards?.runUpgrades || []),
      ];
      if (!this.upgradeSystem.canTakeUpgrade(upgradeId, selected)) {
        this.addCoins(25, commitNow);
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

    if (reward.kind === "temporaryUpgrade" || reward.kind === "instant") {
      const duration = Math.max(0, reward.durationLevels ?? (reward.kind === "instant" ? 0 : 1));
      const entry = {
        id: reward.id,
        label: reward.label || reward.id,
        remainingLevels: commitNow ? duration : Math.max(0, duration - 1),
        statModifiers: { ...(reward.statModifiers || {}) },
      };
      if (commitNow) {
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
    if (!permanentId) return;
    this.profile.permanentUpgrades[permanentId] = (this.profile.permanentUpgrades[permanentId] || 0) + 1;
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
      this.respawnBalls();
      return;
    }

    this.activeRun.lives -= 1;
    if (this.activeRun.lives <= 0) {
      this.gameOver();
      return;
    }

    this.respawnBalls();
    this.persist();
  }

  respawnBalls() {
    const freshLevel = this.levelSystem.createLevel(this.activeRun.currentLevel, this.stats, this.activeRun.seed);
    freshLevel.balls.forEach((ball, index) => {
      ball.stickTo(this.level.paddle);
      ball.x += (index - (freshLevel.balls.length - 1) / 2) * this.stats.ballRadius * 2.5;
    });
    this.level.balls = freshLevel.balls;
    this.level.hasLaunchedBalls = false;
  }

  completeLevel() {
    const completedLevel = this.activeRun.currentLevel;
    this.autoCollectPendingPickups();
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

    const choices = this.rewardSystem.offerStageBonusChoices({
      seed: this.activeRun.seed,
      levelNumber: completedLevel,
    });
    this.activeRun.pendingReward = {
      kind: "stageBonus",
      levelCompleted: completedLevel,
      choices,
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

    if (pending.kind === "stageBonus" || choice.kind) {
      this.applyReward(choice, { commitNow: true });
    } else {
      this.activeRun.runUpgrades.push(upgradeId);
    }

    this.activeRun.currentLevel = Math.min(pending.levelCompleted + 1, CAMPAIGN_MAX_LEVEL);
    this.activeRun.pendingReward = null;
    this.persist();
    this.audio.play("select");
    this.startLevel(this.activeRun.currentLevel);
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

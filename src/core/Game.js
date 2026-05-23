import { CollisionSystem } from "../systems/CollisionSystem.js";
import { ElementSystem } from "../systems/ElementSystem.js";
import { LevelSystem } from "../systems/LevelSystem.js";
import { ParticleSystem } from "../systems/ParticleSystem.js";
import { RewardSystem } from "../systems/RewardSystem.js";
import { UpgradeSystem } from "../systems/UpgradeSystem.js";

const BASE_STATS = {
  paddleWidth: 120,
  paddleSpeed: 650,
  ballRadius: 7,
  ballSpeed: 360,
  ballMinSpeed: 280,
  ballMaxSpeed: 760,
  ballDamage: 10,
  critChance: 0.05,
  critDamage: 1.5,
  element: "normal",
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
    this.collisionSystem = new CollisionSystem();
    this.elementSystem = new ElementSystem();
    this.particleSystem = new ParticleSystem();
    this.rewardSystem = new RewardSystem();
    this.upgradeSystem = new UpgradeSystem();
    this.level = null;
    this.stats = { ...BASE_STATS };
    this.clearTimer = 0;
    this.levelShieldCharges = 0;
    this.lastRunSummary = null;
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
    if (this.activeRun.currentLevel >= 5) {
      this.lastRunSummary = {
        result: "victory",
        reachedLevel: 5,
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
    this.level = this.levelSystem.createLevel(levelNumber, this.stats);
    this.clearTimer = 0;
    this.levelShieldCharges = this.stats.shieldSaves || 0;
    this.persist();
    this.setMode("playing");
  }

  calculateStats() {
    return this.upgradeSystem.applyToStats(BASE_STATS, this.activeRun?.runUpgrades || []);
  }

  updatePlaying(delta) {
    if (!this.level || !this.activeRun) {
      this.returnToMenu();
      return;
    }

    this.level.elapsed += delta;
    this.level.paddle.update(delta, this.input, this.settings);
    this.level.boss?.update(delta);

    const launchRequested = !this.input.isFormFocused() && (
      this.input.consumePressed("Space") ||
      this.input.consumePointerPress()
    );
    if (launchRequested) {
      this.launchStuckBalls();
    }

    for (const ball of this.level.balls) {
      ball.age += delta;
      this.particleSystem.trail(this.level, ball);
      this.collisionSystem.updateBall(ball, this, delta);
    }

    this.elementSystem.updateStatuses(
      [...this.level.bricks, ...(this.level.boss ? [this.level.boss] : [])],
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

  launchStuckBalls() {
    const stuck = this.level.balls.filter((ball) => ball.active && ball.stuckToPaddle);
    stuck.forEach((ball, index) => {
      const offset = stuck.length > 1 ? (index - (stuck.length - 1) / 2) * 14 : 0;
      ball.launch(offset);
    });
    if (stuck.length > 0) {
      this.audio.play("select");
    }
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
    const freshLevel = this.levelSystem.createLevel(this.activeRun.currentLevel, this.stats);
    freshLevel.balls.forEach((ball, index) => {
      ball.stickTo(this.level.paddle);
      ball.x += (index - (freshLevel.balls.length - 1) / 2) * this.stats.ballRadius * 2.5;
    });
    this.level.balls = freshLevel.balls;
  }

  completeLevel() {
    const completedLevel = this.activeRun.currentLevel;
    const reward = this.rewardSystem.grantLevelReward(this, completedLevel);
    this.profile.highestLevelUnlocked = Math.max(this.profile.highestLevelUnlocked, Math.min(completedLevel + 1, 5));

    if (completedLevel >= 5) {
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

    const choices = this.upgradeSystem.offerChoices({
      seed: this.activeRun.seed,
      levelNumber: completedLevel,
      runUpgrades: this.activeRun.runUpgrades,
    });
    this.activeRun.pendingReward = {
      levelCompleted: completedLevel,
      coins: reward.coins,
      choices,
    };
    this.persist();
    this.setMode("upgradeSelect");
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
    const allowed = pending?.choices?.some((choice) => choice.id === upgradeId);
    if (!pending || !allowed) return;
    this.activeRun.runUpgrades.push(upgradeId);
    this.activeRun.currentLevel = Math.min(pending.levelCompleted + 1, 5);
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

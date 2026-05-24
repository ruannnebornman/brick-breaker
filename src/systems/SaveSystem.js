import { CAMPAIGN_MAX_LEVEL } from "../data/levels.js";

const STORAGE_KEY = "brickBreakerElementalBarrage.save.v1";
const BACKUP_KEY = `${STORAGE_KEY}.backup`;
const SAVE_VERSION = 1;
const CONFIG_VERSION = "campaign-100";

export class SaveSystem {
  load() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return this.createDefaultSave();
    }

    try {
      const parsed = JSON.parse(raw);
      return this.normalize(parsed);
    } catch (error) {
      localStorage.setItem(BACKUP_KEY, raw);
      console.warn("Save data was corrupt; a backup copy was preserved.", error);
      return this.createDefaultSave();
    }
  }

  save(data) {
    const normalized = this.normalize(data);
    normalized.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  }

  reset() {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) {
      localStorage.setItem(BACKUP_KEY, existing);
    }
    const defaults = this.createDefaultSave();
    this.save(defaults);
    return defaults;
  }

  createDefaultSave() {
    const now = new Date().toISOString();
    return {
      version: SAVE_VERSION,
      configVersion: CONFIG_VERSION,
      createdAt: now,
      updatedAt: now,
      settings: {
        audioMuted: true,
        musicVolume: 0.5,
        sfxVolume: 0.7,
        screenShake: 0.6,
        showDamageNumbers: true,
        mouseControl: true,
        reducedMotion: false,
      },
      profile: {
        highestLevelUnlocked: 1,
        coins: 0,
        shards: 0,
        permanentUpgrades: {},
        unlockedElements: ["normal", "fire", "lightning", "frost", "acid"],
        completedBosses: [],
        bestLevelTimes: {},
        totalVictories: 0,
      },
      activeRun: null,
      statistics: {
        totalRuns: 0,
        totalDeaths: 0,
        totalBricksDestroyed: 0,
        totalBossesDefeated: 0,
        totalBallsLost: 0,
        totalDamageDealt: 0,
        favoriteElement: "normal",
      },
    };
  }

  normalize(data) {
    const defaults = this.createDefaultSave();
    const source = data && typeof data === "object" ? data : {};
    return {
      ...defaults,
      ...source,
      version: SAVE_VERSION,
      configVersion: CONFIG_VERSION,
      settings: { ...defaults.settings, ...(source.settings || {}) },
      profile: normalizeProfile(defaults.profile, source.profile),
      activeRun: normalizeActiveRun(source.activeRun),
      statistics: { ...defaults.statistics, ...(source.statistics || {}) },
    };
  }
}

function normalizeProfile(defaultProfile, profile) {
  const source = profile && typeof profile === "object" ? profile : {};
  return {
    ...defaultProfile,
    ...source,
    highestLevelUnlocked: clampInt(source.highestLevelUnlocked, 1, CAMPAIGN_MAX_LEVEL),
    coins: nonNegativeNumber(source.coins),
    shards: nonNegativeNumber(source.shards),
    permanentUpgrades: source.permanentUpgrades && typeof source.permanentUpgrades === "object"
      ? source.permanentUpgrades
      : {},
    unlockedElements: Array.isArray(source.unlockedElements) ? source.unlockedElements : defaultProfile.unlockedElements,
    completedBosses: Array.isArray(source.completedBosses) ? source.completedBosses : [],
    bestLevelTimes: source.bestLevelTimes && typeof source.bestLevelTimes === "object" ? source.bestLevelTimes : {},
    totalVictories: nonNegativeNumber(source.totalVictories),
  };
}

function normalizeActiveRun(activeRun) {
  if (!activeRun || activeRun.exists !== true) {
    return null;
  }
  return {
    exists: true,
    runId: String(activeRun.runId || crypto.randomUUID?.() || Date.now()),
    seed: Number(activeRun.seed || Date.now()),
    currentLevel: clampInt(activeRun.currentLevel, 1, CAMPAIGN_MAX_LEVEL),
    lives: clampInt(activeRun.lives, 0, 9),
    runUpgrades: Array.isArray(activeRun.runUpgrades) ? activeRun.runUpgrades : [],
    temporaryUpgrades: normalizeTemporaryUpgrades(activeRun.temporaryUpgrades),
    coinsEarned: Number(activeRun.coinsEarned || 0),
    pendingReward: activeRun.pendingReward || null,
    startedAt: activeRun.startedAt || new Date().toISOString(),
    lastSavedAt: activeRun.lastSavedAt || new Date().toISOString(),
  };
}

function normalizeTemporaryUpgrades(upgrades) {
  if (!Array.isArray(upgrades)) return [];
  return upgrades
    .map((upgrade) => {
      if (!upgrade || typeof upgrade !== "object") return null;
      return {
        id: String(upgrade.id || "temporary"),
        label: String(upgrade.label || upgrade.id || "Temporary"),
        remainingLevels: clampInt(upgrade.remainingLevels, 0, 20),
        statModifiers: upgrade.statModifiers && typeof upgrade.statModifiers === "object"
          ? { ...upgrade.statModifiers }
          : {},
      };
    })
    .filter((upgrade) => upgrade && upgrade.remainingLevels > 0);
}

function clampInt(value, min, max) {
  const number = Math.trunc(Number(value));
  if (!Number.isFinite(number)) return min;
  return Math.max(min, Math.min(max, number));
}

function nonNegativeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, number) : 0;
}

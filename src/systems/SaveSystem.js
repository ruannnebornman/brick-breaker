const STORAGE_KEY = "brickBreakerElementalBarrage.save.v1";
const BACKUP_KEY = `${STORAGE_KEY}.backup`;
const SAVE_VERSION = 1;
const CONFIG_VERSION = "mvp-1";

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
        unlockedElements: ["normal", "fire"],
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
      configVersion: source.configVersion || CONFIG_VERSION,
      settings: { ...defaults.settings, ...(source.settings || {}) },
      profile: { ...defaults.profile, ...(source.profile || {}) },
      activeRun: normalizeActiveRun(source.activeRun),
      statistics: { ...defaults.statistics, ...(source.statistics || {}) },
    };
  }
}

function normalizeActiveRun(activeRun) {
  if (!activeRun || activeRun.exists !== true) {
    return null;
  }
  return {
    exists: true,
    runId: String(activeRun.runId || crypto.randomUUID?.() || Date.now()),
    seed: Number(activeRun.seed || Date.now()),
    currentLevel: clampInt(activeRun.currentLevel, 1, 5),
    lives: clampInt(activeRun.lives, 0, 9),
    runUpgrades: Array.isArray(activeRun.runUpgrades) ? activeRun.runUpgrades : [],
    coinsEarned: Number(activeRun.coinsEarned || 0),
    pendingReward: activeRun.pendingReward || null,
    startedAt: activeRun.startedAt || new Date().toISOString(),
    lastSavedAt: activeRun.lastSavedAt || new Date().toISOString(),
  };
}

function clampInt(value, min, max) {
  const number = Math.trunc(Number(value));
  if (!Number.isFinite(number)) return min;
  return Math.max(min, Math.min(max, number));
}

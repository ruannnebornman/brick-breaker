import { chromium } from "@playwright/test";
import { createReadStream, promises as fs } from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HOST = "127.0.0.1";
const SAVE_KEY = "brickBreakerElementalBarrage.save.v26";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_PORT = Number(process.env.PORT || 8765);
const DURATION_MS = Number(process.env.BOT_DURATION_MS || 180000);
const STEP_MS = Number(process.env.BOT_STEP_MS || 33);
const SLOW_MO_MS = Number(process.env.BOT_SLOWMO_MS || 20);
const KEEP_SAVE = process.env.BOT_KEEP_SAVE === "1";
const RESTART_ON_DEATH = process.env.BOT_RESTART_ON_DEATH === "1";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

const server = createStaticServer(ROOT);
const port = await listen(server, DEFAULT_PORT);
const baseUrl = `http://${HOST}:${port}`;

console.log(`Serving ${ROOT}`);
console.log(`Opening headed Playwright bot at ${baseUrl}/?debug=1`);
console.log("Set BOT_KEEP_SAVE=1 to continue the current save instead of starting fresh.");

const browser = await chromium.launch({
  headless: false,
  slowMo: SLOW_MO_MS,
});

const context = await browser.newContext({
  viewport: { width: 1280, height: 860 },
  deviceScaleFactor: 1,
});

if (!KEEP_SAVE) {
  await context.addInitScript((storageKey) => {
    localStorage.removeItem(storageKey);
  }, SAVE_KEY);
}

const page = await context.newPage();
page.on("pageerror", (error) => console.error(`[pageerror] ${error.message}`));
page.on("console", (message) => {
  if (process.env.BOT_LOG_BROWSER === "1" && message.type() === "error") {
    console.error(`[browser:${message.type()}] ${message.text()}`);
  }
});

await page.goto(`${baseUrl}/?debug=1`);
await page.waitForSelector("#gameCanvas");
await page.waitForFunction(() => window.__elementalBarrage?.game);
await enterRun(page);
const summary = await driveRun(page, Date.now() + DURATION_MS);
printSummary(summary);

await browser.close();
await new Promise((resolve) => server.close(resolve));

function createStaticServer(root) {
  return http.createServer(async (request, response) => {
    const requestUrl = new URL(request.url || "/", `http://${HOST}`);
    const pathname = decodeURIComponent(requestUrl.pathname);
    const relativePath = pathname.endsWith("/") ? `${pathname}index.html` : pathname;
    const filePath = path.resolve(root, `.${relativePath}`);

    if (!filePath.startsWith(`${root}${path.sep}`) && filePath !== root) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    try {
      const stat = await fs.stat(filePath);
      const resolvedPath = stat.isDirectory() ? path.join(filePath, "index.html") : filePath;
      response.setHeader("Content-Type", MIME_TYPES[path.extname(resolvedPath).toLowerCase()] || "application/octet-stream");
      createReadStream(resolvedPath).pipe(response);
    } catch {
      response.writeHead(404);
      response.end("Not found");
    }
  });
}

function listen(serverToStart, preferredPort) {
  return new Promise((resolve, reject) => {
    const onError = (error) => {
      if (error.code !== "EADDRINUSE" || preferredPort === 0) {
        reject(error);
        return;
      }
      serverToStart.removeListener("error", onError);
      serverToStart.listen(0, HOST, () => resolve(serverToStart.address().port));
    };

    serverToStart.once("error", onError);
    serverToStart.listen(preferredPort, HOST, () => {
      serverToStart.removeListener("error", onError);
      resolve(serverToStart.address().port);
    });
  });
}

async function enterRun(page) {
  const mode = await getMode(page);
  if (mode !== "mainMenu") return;

  if (KEEP_SAVE) {
    const continueButton = page.locator('[data-action="continue"]');
    if (await continueButton.isEnabled()) {
      await continueButton.click();
      return;
    }
  }

  await page.locator('[data-action="new"]').click();
}

async function driveRun(page, endTime) {
  const startedAt = Date.now();
  let bestLevel = 0;
  let lastState = null;

  while (Date.now() < endTime) {
    const state = await readGameState(page);
    if (!state) {
      await page.waitForTimeout(STEP_MS);
      continue;
    }
    lastState = state;
    bestLevel = Math.max(bestLevel, state.levelNumber || state.lastRunSummary?.reachedLevel || 0);

    if (state.mode === "mainMenu") {
      await enterRun(page);
    } else if (state.mode === "upgradeSelect") {
      await chooseUpgrade(page);
    } else if (state.mode === "gameOver") {
      if (!RESTART_ON_DEATH) {
        return summarizeRun("defeat", bestLevel, startedAt, state);
      }
      await page.locator('[data-action="new"]').click();
    } else if (state.mode === "victory") {
      return summarizeRun("victory", bestLevel, startedAt, state);
    } else if (state.mode === "playing") {
      await playFrame(page, state);
    }

    await page.waitForTimeout(STEP_MS);
  }

  return summarizeRun("duration-limit", bestLevel, startedAt, lastState);
}

async function playFrame(page, state) {
  if (!state.paddle) return;

  const targetX = choosePaddleTarget(state);
  const point = await gameToClient(page, targetX, state.paddle.y);
  await page.mouse.move(point.x, point.y, { steps: 2 });

  if (state.balls.some((ball) => ball.stuckToPaddle)) {
    await page.mouse.click(point.x, point.y);
  }

  if (state.cannonReady) {
    await page.keyboard.press("Space");
  }
}

async function chooseUpgrade(page) {
  const firstChoice = page.locator("[data-upgrade]").first();
  if (await firstChoice.count()) {
    await firstChoice.click();
  }
}

async function getMode(page) {
  return page.evaluate(() => window.__elementalBarrage?.game?.mode || null);
}

async function readGameState(page) {
  return page.evaluate(() => {
    const game = window.__elementalBarrage?.game;
    const level = game?.level;
    return game ? {
      mode: game.mode,
      levelNumber: game.activeRun?.currentLevel || 0,
      lives: game.activeRun?.lives || 0,
      coinsEarned: game.activeRun?.coinsEarned || 0,
      upgradeCount: game.activeRun?.runUpgrades?.length || 0,
      lastRunSummary: game.lastRunSummary || null,
      cannonReady: Boolean(level?.paddle?.canFireCannon?.()),
      paddle: level?.paddle ? {
        x: level.paddle.x,
        y: level.paddle.y,
        width: level.paddle.width,
      } : null,
      balls: level?.balls?.filter((ball) => ball.active).map((ball) => ({
        x: ball.x,
        y: ball.y,
        vx: ball.vx,
        vy: ball.vy,
        stuckToPaddle: ball.stuckToPaddle,
      })) || [],
    } : null;
  });
}

function choosePaddleTarget(state) {
  const stuckBall = state.balls.find((ball) => ball.stuckToPaddle);
  if (stuckBall) return stuckBall.x;

  const predictions = state.balls
    .filter((ball) => ball.vy > 20)
    .map((ball) => {
      const time = (state.paddle.y - ball.y) / ball.vy;
      return {
        x: reflectArenaX(ball.x + ball.vx * time),
        time,
      };
    })
    .filter((prediction) => prediction.time > 0)
    .sort((a, b) => a.time - b.time);

  if (predictions[0]) return predictions[0].x;

  const nearestBall = [...state.balls].sort((a, b) => b.y - a.y)[0];
  return nearestBall?.x || state.paddle.x;
}

function reflectArenaX(rawX) {
  const left = 20;
  const right = 940;
  const width = right - left;
  const cycle = width * 2;
  let offset = (rawX - left) % cycle;
  if (offset < 0) offset += cycle;
  return offset <= width ? left + offset : right - (offset - width);
}

async function gameToClient(page, gameX, gameY) {
  const rect = await page.locator("#gameCanvas").boundingBox();
  if (!rect) return { x: gameX, y: gameY };
  return {
    x: rect.x + (gameX / 960) * rect.width,
    y: rect.y + (gameY / 600) * rect.height,
  };
}

function summarizeRun(reason, bestLevel, startedAt, state) {
  return {
    reason,
    elapsedSeconds: (Date.now() - startedAt) / 1000,
    bestLevel,
    mode: state?.mode || "unknown",
    currentLevel: state?.levelNumber || 0,
    lives: state?.lives || 0,
    coinsEarned: state?.coinsEarned || state?.lastRunSummary?.coinsEarned || 0,
    upgradeCount: state?.upgradeCount || state?.lastRunSummary?.upgrades?.length || 0,
    reachedLevel: state?.lastRunSummary?.reachedLevel || bestLevel,
  };
}

function printSummary(summary) {
  console.log("Playtest summary:");
  console.log(`- Outcome: ${summary.reason}`);
  console.log(`- Reached level: ${summary.reachedLevel}`);
  console.log(`- Best active level: ${summary.bestLevel}`);
  console.log(`- Final mode: ${summary.mode}`);
  console.log(`- Lives: ${summary.lives}`);
  console.log(`- Coins earned: ${summary.coinsEarned}`);
  console.log(`- Upgrades taken: ${summary.upgradeCount}`);
  console.log(`- Elapsed: ${summary.elapsedSeconds.toFixed(1)}s`);
}

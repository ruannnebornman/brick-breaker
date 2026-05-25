# Brick Breaker: Elemental Barrage

A fast browser brick-breaker roguelite about turning one clean paddle bounce into a screen full of elemental chaos.

Play it here:

https://ruannnebornman.github.io/brick-breaker

Current build: `v0.25.0`

## What It Is

Brick Breaker: Elemental Barrage is a static GitHub Pages game built with Canvas and plain JavaScript modules. Runs start simple, then escalate through upgrade picks, stacked elements, multiball builds, paddle cannon shots, hazards, enemies, and biome bosses.

The goal is quick arcade momentum: short levels, punchy upgrades, readable chaos, and a campaign scaffold that can grow into a full 100-level run.

## Features

- 100-level campaign scaffold across 10 biomes.
- Element stacking: Fire, Lightning, Frost, Acid, and Normal can combine in one run.
- Upgrade-driven builds with multiball, crit, pierce, shields, cannon tech, and elemental amplification.
- Major bosses every 10 levels, each with distinct first-pass attack identities.
- Reward blocks now drop falling pickups with clearer permanent and temporary reward feedback.
- Boss attacks are paced more gently early, then scale back up later.
- Static-site friendly: no backend, no build step, GitHub Pages compatible.
- Visible bottom-right version stamp so deployed builds are easy to verify.

## Controls

- Move paddle: mouse, touch drag, `A` / `D`, or arrow keys.
- Launch balls: click or tap.
- Fire cannon: `Space` after the balls have launched and the cannon upgrade is active.
- Pause: `Escape`.

## Local Run

You can open `index.html` directly, or serve the folder locally:

```bash
python3 -m http.server 8765
```

Then open:

```text
http://127.0.0.1:8765
```

## Playtesting

A headed Playwright bot is available for watched test runs:

```bash
npm install
npm run playtest:headed
```

Useful environment variables:

- `BOT_DURATION_MS=300000` controls max run length.
- `BOT_KEEP_SAVE=1` continues the current local save.
- `BOT_RESTART_ON_DEATH=1` loops after defeats.

## Project Docs

- [Implementation Plan](docs/IMPLEMENTATION_PLAN.md)
- [Asset Required List](docs/ASSET_REQUIRED_LIST.md)
- [Archived Plans and Progress](docs/archive/)

## Versioning

The deployed build version lives in:

- [`VERSION`](VERSION)
- [`src/data/version.js`](src/data/version.js)

The game also renders the version in the bottom-right corner. If the live page does not show the expected version, GitHub Pages may still be deploying or your browser may have cached an older build.

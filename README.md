# Paddle Pets

A fast arcade roguelite where everything is a paddle: cute pet companions, paddle-shaped bricks, magical balls, boss fights, and upgrade chaos.

Play it here:

https://ruannnebornman.github.io/paddle-pets

Current build: `v0.26.0`

## What It Is

Paddle Pets is a static GitHub Pages game built with Canvas and plain JavaScript modules. Runs start simple, then escalate through upgrade picks, stacked elements, multiball builds, paddle cannon shots, hazards, enemies, and biome bosses.

The goal is quick arcade momentum with a cute toy-fantasy identity: short levels, punchy upgrades, readable chaos, and a campaign scaffold that can grow into a full 100-level run.

The repo was renamed from `brick-breaker` to `paddle-pets`; the local remote now points at:

```text
git@github.com:ruannnebornman/paddle-pets.git
```

## Current Style Direction

The game is being restyled around a **Paddle Pets** look: glossy toy-fantasy art, rounded capsule silhouettes, jewel accents, bright purple/cyan/gold color, and the rule that every major gameplay object should feel like it is secretly a paddle.

Current default pet:

- `unicorn` is wired as the default player paddle.
- `dragon` exists as the first alternate pet asset.
- Pet-specific powers are intentionally deferred until the visual skin pass is stable.

Generated assets currently in the repo:

- `assets/images/paddle-pets/pets/paddle_pet_unicorn.png`
- `assets/images/paddle-pets/pets/paddle_pet_dragon.png`
- `assets/images/paddle-pets/backgrounds/bg_paddle_pets_castle_arena.png`

The old missing asset paths still fall back to canvas-drawn placeholders until the remaining Paddle Pets frame, ball, brick, boss, enemy, and effect assets are generated.

## Features

- 100-level campaign scaffold across 10 biomes.
- Paddle Pets visual direction with generated unicorn, dragon, and castle arena assets.
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
- [Paddle Pets Style Update Plan](docs/PADDLE_PETS_STYLE_UPDATE_PLAN.md)
- [Archived Plans and Progress](docs/archive/)

The next recommended style micro-phase is one of:

- CSS token pass for the Paddle Pets palette.
- Generate the first Paddle Pets arena frame.
- Generate the first Paddle Pets brick and ball set.

## Versioning

The deployed build version lives in:

- [`VERSION`](VERSION)
- [`src/data/version.js`](src/data/version.js)

The game also renders the version in the bottom-right corner. If the live page does not show the expected version, GitHub Pages may still be deploying or your browser may have cached an older build.

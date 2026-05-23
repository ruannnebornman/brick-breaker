# Implementation Progress

This file records implementation progress against `IMPLEMENTATION_PLAN.md` without changing the approved plan.

## Step 1 - Milestone 1: Static Shell, Menu, Save, and Loop

Status: Complete

Completed:
- Created the static GitHub Pages-compatible browser shell.
- Added a responsive 960 x 600 Canvas with capped device pixel ratio handling.
- Added the fixed-step requestAnimationFrame loop and tab-hidden pause behavior.
- Added input tracking for keyboard, mouse, and pointer/touch-ready events.
- Added code-drawn placeholder rendering and an asset manifest/loader that tolerates missing images.
- Added versioned localStorage save defaults for settings, profile progress, coins, and active run summary.
- Added Main Menu, Continue Run, New Run, Pause, Settings, and reset-save confirmation UI.
- Added a debug FPS/state overlay gated behind `?debug=1`.

Files changed:
- `index.html`
- `styles.css`
- `src/main.js`
- `src/data/assets.js`
- `src/core/AssetLoader.js`
- `src/core/AudioSystem.js`
- `src/core/Debug.js`
- `src/core/Game.js`
- `src/core/Input.js`
- `src/core/Renderer.js`
- `src/systems/SaveSystem.js`
- `src/ui/HUD.js`
- `src/ui/ScreenManager.js`
- `IMPLEMENTATION_PROGRESS.md`

Defaults documented:
- Settings default to muted audio so browser audio policy never blocks the shell.
- Missing P0 image assets use code-drawn fallbacks from the manifest.

## Step 2 - Milestone 2: Core Brick Breaker Feel and Collision Contract

Status: Complete

Completed:
- Added paddle movement by keyboard and mouse/pointer.
- Added a single stuck ball that launches with Space, click, or tap.
- Added wall, paddle, and brick collision using substepped circle movement.
- Added basic brick HP, armor-aware damage, destruction, and a shared hit event shape.
- Added a hand-authored level 1 collision test layout.
- Added all-balls-lost life loss, stuck-to-paddle respawn, and game over.
- Added speed clamps and anti-horizontal bounce enforcement.
- Added debug collision boxes plus seed, level, ball, and brick counts under `?debug=1`.

Files changed:
- `src/core/Game.js`
- `src/core/Renderer.js`
- `src/core/Debug.js`
- `src/core/Physics.js`
- `src/entities/Ball.js`
- `src/entities/Brick.js`
- `src/entities/Paddle.js`
- `src/systems/CollisionSystem.js`
- `src/systems/ElementSystem.js`
- `src/systems/LevelSystem.js`
- `src/data/brickTypes.js`
- `src/data/levels.js`
- `src/ui/HUD.js`
- `src/ui/ScreenManager.js`
- `IMPLEMENTATION_PROGRESS.md`

Defaults documented:
- Level completion currently uses a simple collision-test clear screen; rewards and upgrade flow are intentionally left for the next approved milestone.
- Lost balls below the arena are removed once their circle has fully passed the lower play area.

## Step 3 - Milestone 3: First Playable Demo Loop

Status: Complete

Completed:
- Added the Grasslands / Training Ruins biome config.
- Added five hand-authored MVP level definitions.
- Added basic and armored brick configs.
- Added level rewards, coin persistence, and profile highest-level updates.
- Added three-card upgrade selection after levels 1-4.
- Added run upgrade stacking for damage, speed, paddle width, crit chance, multiball, Fire path, and shield/life safety.
- Added number-key and click upgrade selection while gameplay input is blocked.
- Added saved pending rewards so reload/Continue returns to upgrade choice instead of re-granting rewards.
- Added next-level flow and demo-complete victory after level 5.

Files changed:
- `styles.css`
- `src/core/Game.js`
- `src/core/Random.js`
- `src/core/Renderer.js`
- `src/data/biomes.js`
- `src/data/brickTypes.js`
- `src/data/levels.js`
- `src/data/rewards.js`
- `src/data/upgrades.js`
- `src/systems/LevelSystem.js`
- `src/systems/RewardSystem.js`
- `src/systems/UpgradeSystem.js`
- `src/ui/HUD.js`
- `src/ui/ScreenManager.js`
- `src/ui/UpgradeCards.js`
- `IMPLEMENTATION_PROGRESS.md`

Defaults documented:
- Rewards are granted immediately when a level clears, then the exact pending upgrade choices are saved.
- Fire upgrade selection switches balls to the Fire path now; the actual capped burn behavior is reserved for the next milestone, as specified.

## Step 4 - Milestone 4: Fire, Mini-Boss, and MVP Polish

Status: Complete

Completed:
- Implemented Normal baseline behavior and Fire-only capped burn.
- Added generic status ticking for burn with capped stacks, duration refresh, and boss burn reduction for balance.
- Converted level 5 into the Training Core mini-boss encounter with one rectangular hitbox, HP bar, and gentle passive drift.
- Added boss collision, damage, destruction, clear condition, and statistics tracking.
- Added minimal particles for ball trails, hit sparks, brick/core break bursts, and burn ticks.
- Added compact boss HUD display.
- Kept audio optional and gesture-unlocked, with muted settings support and placeholder hit/select/break tones.
- Added touch-action handling so drag/tap controls stay on the Canvas.
- Kept generated image hot-swap support through the manifest while all new boss visuals have code-drawn fallbacks.

Files changed:
- `styles.css`
- `src/core/AudioSystem.js`
- `src/core/Debug.js`
- `src/core/Game.js`
- `src/core/Renderer.js`
- `src/data/assets.js`
- `src/data/levels.js`
- `src/entities/Boss.js`
- `src/systems/CollisionSystem.js`
- `src/systems/ElementSystem.js`
- `src/systems/LevelSystem.js`
- `src/systems/ParticleSystem.js`
- `src/ui/HUD.js`
- `IMPLEMENTATION_PROGRESS.md`

Defaults documented:
- Training Core burn damage is reduced to keep the mini-boss from melting too quickly during the MVP balance pass.
- The mini-boss uses passive drift only; no summons, projectiles, or phases were added.

## Step 5 - Milestone 5: MVP Validation and GitHub Pages Check

Status: Complete

Completed:
- Added debug-only state-changing tools behind `?debug=1`: Next Level and Reset Save.
- Kept FPS, collision boxes, seed display, level display, entity counts, and boss HP visible only in debug mode.
- Fixed clear-condition ordering so a completed objective wins over last-ball loss.
- Ran JavaScript syntax checks across all modules.
- Ran module-level smoke checks for level creation, upgrade stat application, Fire path selection, multiball, reward flow, upgrade choice, and level 5 victory.
- Started a local static server and confirmed `index.html`, `styles.css`, and `src/main.js` load over HTTP with relative paths.
- Ran rendered Chromium/Playwright smoke checks against both local static hosting and the live GitHub Pages URL.
- Confirmed menu, New Run, launch input, pause/resume, reload recovery, Continue Run, saved pending reward recovery, upgrade card selection, level transition, debug Next Level, demo victory, Canvas rendering, and orientation notice behavior.
- Confirmed the hosted demo at `https://ruannnebornman.github.io/brick-breaker/` loads and runs as a static GitHub Pages site.

Files changed:
- `styles.css`
- `src/core/Game.js`
- `src/ui/ScreenManager.js`
- `IMPLEMENTATION_PROGRESS.md`

Defaults documented:
- The debug Next Level tool advances without granting rewards, so it is useful for progression smoke tests without mutating economy balance.
- Missing P0 image requests return expected 404s until generated assets are added; Canvas fallback rendering was verified as nonblank on both local and hosted builds.

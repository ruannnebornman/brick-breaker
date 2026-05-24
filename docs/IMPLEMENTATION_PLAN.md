# Brick Breaker: Elemental Barrage - Technical Implementation Plan

## A. High-Level Game Design Summary

**Brick Breaker: Elemental Barrage** is a browser-based arcade roguelite built with plain HTML, CSS, vanilla JavaScript modules, and the Canvas API. The player controls a paddle near the bottom of the arena, launches and redirects balls, destroys bricks, fights enemies, survives hazards, chooses temporary upgrades after each level, and spends persistent currency on permanent upgrades.

The design goal is a juicy, replayable, expandable game that still stays realistic for one developer:

- Static site only, hostable on GitHub Pages.
- No backend, build tools, or heavy frameworks.
- Canvas handles gameplay rendering.
- HTML/CSS overlays handle menus, upgrade cards, pause screens, and settings.
- `localStorage` stores progress, options, permanent upgrades, and active run state.
- 100-level campaign generated from data-driven rules.
- Boss fights every 10 levels, with random field boss encounters on regular levels.
- Biomes control visuals, hazards, enemies, modifiers, boss identity, and difficulty flavor.

The first implementation should prioritize a tight, playable core loop before adding all upgrade and biome complexity. The final architecture should make it easy to add content by editing data files rather than rewriting systems.

### MVP Direction After Review

The reviewed MVP is a five-level browser demo, not a compressed version of the full 100-level game. It should prove the feel of ball control, collision stability, upgrade choice, save/reload behavior, and static hosting before adding the larger content plan.

MVP scope decisions:

- One biome: Grasslands / Training Ruins.
- Five levels, with levels 1-4 as normal brick layouts and level 5 as a simple mini-boss or large target fight.
- Hand-authored or tightly templated layouts first; seeded procedural generation comes after the core feel is proven.
- Normal baseline balls plus Fire as an always-available run-upgrade path. No permanent element unlock logic in the MVP.
- Fire only applies capped burn in the MVP. Fire spread, explosions, resistance, and other elements are later work.
- No enemies, hazards, field bosses, permanent shop, advanced paddle abilities, moving bricks, portals, gravity wells, or complex status stacking in the first playable demo.
- Save/load, menu flow, and reload recovery are early requirements, not late polish.

## B. Technical Architecture

### Runtime Model

- `index.html` loads the game shell and a single ES module entry point.
- `styles.css` provides responsive layout, menu panels, upgrade cards, HUD overlays, and canvas framing.
- `src/main.js` initializes configuration, save data, input, canvas, game state, and starts the loop.
- Canvas uses a fixed logical resolution and scales to fit the browser window.
- Canvas caps device pixel ratio, likely with `Math.min(window.devicePixelRatio || 1, 2)`, to avoid wasting fill rate on high-DPI screens.
- JavaScript modules are split by responsibility: core loop, entities, systems, data, and UI.
- No bundler is required. All imports use relative paths that work on GitHub Pages.
- Early implementation may use fewer modules than the final file structure. Split files when boundaries become useful, not just because the final architecture lists them.

### Rendering Split

- **Canvas:** arena, paddle, balls, bricks, enemies, bosses, projectiles, particles, trails, damage numbers, hazard zones, screen shake, background effects.
- **HTML overlays:** main menu, level select, upgrade rewards, permanent upgrade shop, pause, game over, victory, settings, save import/export.

This keeps gameplay rendering fast while avoiding complex canvas text layout for card-heavy UI.

### Asset Loading and Placeholder Strategy

Final art assets are not required before MVP implementation. The game should start with code-drawn placeholders and hot-swap generated images later without changing gameplay logic.

Rules:

- Use stable asset IDs from `ASSET_REQUIRED_LIST.md`, such as `paddle_basic`, `brick_basic_healthy`, `ball_fire`, and `bg_grasslands_training_ruins_arena`.
- Keep asset references in a central manifest, likely `src/data/assets.js`, with IDs, relative paths, intended dimensions, anchor points, and fallback style hints.
- Add an `AssetLoader` or equivalent helper that preloads images, tracks loaded/error states, and returns `null` or fallback metadata when an asset is unavailable.
- Renderer code must draw a code-generated fallback for every gameplay-critical asset.
- Gameplay hitboxes, HP, physics, and clear conditions must come from data and entity state, not from image dimensions.
- Canvas rendering controls scale, rotation, anchor, glow, tint, and damage overlays so replacing an image does not alter collision behavior.
- Missing or failed images should never block starting a run, continuing a save, or clearing a level.
- Use transparent PNGs for sprites/effects and 16:10 images for backgrounds when generated assets are added.
- Keep paths relative, for example `./assets/images/p0/paddle_basic.png`, so GitHub Pages project paths keep working.

MVP placeholder expectations:

- Bricks can be rounded rectangles with code-drawn cracks or tint changes.
- Balls can be circles with simple gradients/trails.
- Paddle can be a rectangle or capsule shape.
- Background can be a code-drawn low-contrast gradient/grid.
- Particles can be generated directly in Canvas.

This lets implementation prove collision, feel, save/load, and UI flow first. Art can be generated in batches and swapped in by updating the manifest and image files.

### State Ownership

`Game` owns the active state and delegates to systems:

- `LevelSystem` creates levels and tracks clear conditions.
- `CollisionSystem` resolves physics interactions.
- `ElementSystem` applies elemental effects and status ticks.
- `UpgradeSystem` calculates stats from base values, run upgrades, and permanent upgrades.
- `BossSystem` updates boss phases and attacks.
- `RewardSystem` grants currency and upgrade choices.
- `SaveSystem` reads/writes persistent data.
- `ParticleSystem` manages short-lived visual effects.
- `AudioSystem` plays generated placeholder sounds.
- `UISystem` synchronizes HTML overlays with game state.

The game should avoid a heavy entity-component framework. Plain classes plus data-driven configs are enough.

Active runs must be declarative. Saves should store profile progress, settings, current level, run seed, lives, coins earned, and chosen upgrades. They should not store live entities, particles, projectiles, timers, generated internals, or boss attack state. On continue, the current level is regenerated from the saved seed and run summary.

## C. File Structure

```text
/index.html
/styles.css
/VERSION

/src/main.js

/src/core/Game.js
/src/core/Input.js
/src/core/Renderer.js
/src/core/Physics.js
/src/core/Random.js
/src/core/Camera.js
/src/core/AudioSystem.js
/src/core/Debug.js

/src/entities/Ball.js
/src/entities/Paddle.js
/src/entities/Brick.js
/src/entities/Boss.js
/src/entities/Enemy.js
/src/entities/Projectile.js
/src/entities/Hazard.js
/src/entities/FloatingText.js

/src/systems/CollisionSystem.js
/src/systems/UpgradeSystem.js
/src/systems/ElementSystem.js
/src/systems/LevelSystem.js
/src/systems/BiomeSystem.js
/src/systems/BossSystem.js
/src/systems/RewardSystem.js
/src/systems/SaveSystem.js
/src/systems/ParticleSystem.js
/src/systems/ProjectileSystem.js

/src/data/ballElements.js
/src/data/upgrades.js
/src/data/permanentUpgrades.js
/src/data/biomes.js
/src/data/bosses.js
/src/data/fieldBosses.js
/src/data/brickTypes.js
/src/data/enemyTypes.js
/src/data/hazardTypes.js
/src/data/levelRules.js
/src/data/scaling.js
/src/data/rewards.js

/src/ui/HUD.js
/src/ui/Menu.js
/src/ui/UpgradeCards.js
/src/ui/PermanentShop.js
/src/ui/ScreenManager.js

/docs/README.md
/docs/IMPLEMENTATION_PLAN.md
/docs/IMPLEMENTATION_PROGRESS.md
/docs/ASSET_REQUIRED_LIST.md
/docs/V0.23_FIX_PLAN.md
```

Optional later folders:

```text
/assets/images/
/assets/audio/
/assets/fonts/
```

External assets are not required for the first version. If assets are added later, keep paths relative so GitHub Pages works from either the root domain or a project subpath.

## D. Core Classes and Module Responsibilities

### `main.js`

- Finds the canvas and UI root nodes.
- Creates `Game`, `Input`, `Renderer`, `SaveSystem`, and UI managers.
- Loads save data.
- Starts `requestAnimationFrame`.
- Handles resize events.

### `Game`

Primary coordinator.

Responsibilities:

- Holds `state`, `mode`, `levelNumber`, `activeRun`, `profile`, and entity arrays.
- Owns high-level flow: menu, playing, paused, level complete, upgrade select, shop, game over, victory.
- Calls systems in a predictable order.
- Starts levels, restarts runs, advances levels, and exits to menu.
- Stores transient game values like combo, score, shake, elapsed level time.

### `Input`

- Tracks keyboard state, mouse position, mouse buttons, just-pressed buttons, and touch-ready hooks if later desired.
- Supports:
  - `A` / `D` and arrow keys for paddle movement.
  - Mouse movement for paddle target.
  - `Space` or click to launch balls or fire.
  - `Escape` to pause.
  - Number keys for upgrade selection.
- Exposes frame-safe queries like `isDown`, `wasPressed`, `consumePressed`.

### `Renderer`

- Owns canvas context setup and device pixel ratio scaling.
- Uses a capped device pixel ratio for performance.
- Clears and draws the game scene.
- Applies camera shake.
- Draws backgrounds, entities, particles, floating text, and debug overlays.
- Keeps drawing functions small and deterministic.

### `Physics`

Utility module with geometry helpers:

- Circle vs rectangle overlap.
- Swept or substepped circle movement.
- Reflection vectors.
- Clamp and normalization helpers.
- Paddle impact angle calculation.

### `Random`

- Seeded pseudo-random generator for level generation.
- Ensures generated levels can be recreated from a saved seed.
- Provides helpers like `range`, `int`, `choice`, `weightedChoice`, and `chance`.

### `Camera`

- Tracks screen shake and possible future zoom effects.
- Exposes shake intensity decay.

### `AudioSystem`

- Uses Web Audio API for simple generated sounds.
- Initializes only after a user gesture.
- Treats audio as optional: if `AudioContext` is unavailable or suspended, sound calls safely no-op.
- Resumes or rechecks audio after tab focus changes and user interaction.
- Sounds:
  - Ball launch.
  - Paddle hit.
  - Brick hit.
  - Brick break.
  - Critical hit.
  - Element proc.
  - Boss phase shift.
  - Upgrade selected.
  - Game over.
- Must start only after user interaction due to browser audio policies.
- Can be muted in settings.
- MVP should ship muted-by-setting support and one or two placeholder sounds at most. Audio polish is not required before the core loop works.

### `Debug`

Enabled by `?debug=1` or a local toggle.

MVP features:

- FPS and entity counts.
- Seed and level info.
- Collision box overlay.
- Next-level hotkey.
- Reset save with confirmation.

Later features:

- Active status effect overlay.
- Hotkeys for next level, spawn upgrade, spawn boss, clear level, add currency, and reset save.
- Save export/import for testing.
- Dangerous or state-changing tools, including reset save, currency grants, spawn tools, and clear level, are available only when `?debug=1` is present.
- Debug UI must be visually labeled so test state is never confused with normal play.

## E. Game State Flow

Recommended modes:

```text
boot
mainMenu
levelSelect
permanentShop
playing
paused
levelComplete
upgradeSelect
gameOver
victory
settings
```

Flow:

1. `boot`
   - Load save.
   - Initialize audio muted/unmuted state.
   - Initialize profile defaults.
   - Move to `mainMenu`.

2. `mainMenu`
   - MVP options: Continue Run, New Run, Settings.
   - Later options: Level Select and Permanent Upgrades.
   - Continue is available only if `activeRun` exists.

3. `levelSelect`
   - Post-MVP feature.
   - Treat as practice or campaign checkpoint mode, not the main roguelite run identity.
   - Starting from a selected level begins without temporary run upgrades unless a later checkpoint design says otherwise.

4. `playing`
   - Updates input, physics, entities, collisions, statuses, boss AI, projectiles, hazards, particles.
   - Checks fail and clear conditions.
   - If all active balls are lost, the player loses one life and a fresh ball relaunches from the paddle.
   - Individual lost balls during multiball do not cost lives until no balls remain.

5. `paused`
   - Freezes simulation.
   - Options: Resume, Restart Level, Settings, Main Menu.
   - Later run modes may add Abandon Run.

6. `levelComplete`
   - Grants rewards.
   - Updates highest unlocked level.
   - Saves progress.
   - Opens `upgradeSelect` unless level 100 victory is reached.

7. `upgradeSelect`
   - Presents 3 upgrade cards by default.
   - Number keys or mouse choose one.
   - Applies run upgrade.
   - Saves active run and starts next level.
   - Gameplay input is blocked while the overlay is active.

8. `gameOver`
   - Shows summary and currency earned.
   - Clears temporary run upgrades unless the design later supports a continue token.
   - Saves permanent progress.

9. `victory`
   - Shows completion summary after level 100.
   - Unlocks post-clear difficulty options later if desired.

Tab visibility behavior:

- When the page becomes hidden, simulation pauses and accumulated time is discarded.
- When the page becomes visible again, render resumes immediately but simulation waits for the next normal frame.
- This prevents a burst of catch-up physics after tab switching.

## F. Main Game Loop Design

Use `requestAnimationFrame` with a fixed simulation step for stable collision behavior.

Recommended loop:

- MVP target simulation step: `1 / 60` seconds.
- Later target simulation step may move to `1 / 120` only if profiling proves it is needed and affordable.
- Maximum accumulated time: `0.25` seconds to avoid spiral-of-death after tab switching.
- Render once per animation frame.
- Pause stops simulation updates but still allows overlay rendering.
- Ball movement is substepped based on distance traveled, with a hard maximum substep count per ball per frame.

Update order during `playing`:

1. Read input snapshot.
2. Update paddle intent and cooldowns.
3. Spawn balls/projectiles from player actions.
4. Update balls with substeps.
5. Update enemies, bosses, hazards, projectiles.
6. Resolve collisions.
7. Apply element effects from collision events.
8. Tick status effects and damage over time.
9. Remove dead entities and spawn drops/effects.
10. Check level clear or failure.
11. Update particles, floating texts, camera shake.
12. Sync HUD values.

Rendering order:

1. Biome background.
2. Arena bounds and subtle grid/depth effects.
3. Hazards and environmental zones.
4. Bricks.
5. Enemies and boss.
6. Projectiles.
7. Balls and trails.
8. Paddle and paddle effects.
9. Particles and floating damage numbers.
10. Canvas HUD accents such as boss bar glow.
11. Debug overlay if enabled.

## G. Entity, Component, and Data Model

Use plain classes with common fields rather than a full ECS.

### Common Entity Fields

```text
id
kind
x, y
vx, vy
width, height or radius
hp, maxHp
armor
active
tags
statusEffects
```

### Ball

Fields:

- `x`, `y`, `vx`, `vy`, `radius`
- `element`
- `damage`
- `speed`
- `critChance`
- `critDamage`
- `pierceChance`
- `remainingPierces`
- `remainingBounces`
- `splitChance`
- `chainRange`
- `explosionRadius`
- `statusDuration`
- `owner`
- `trailColor`
- `stuckToPaddle`
- `magnetStrength`
- `age`

Behavior:

- Launch from paddle.
- Bounce from walls, paddle, bricks, enemies, bosses.
- Apply damage and element effect on hit.
- Be lost when falling below the arena unless shield, firewall, magnet, recall, or extra-life effects save it.
- Optionally split into additional balls when upgraded.

### Paddle

Fields:

- `x`, `y`, `width`, `height`
- `speed`
- `targetX`
- `fireCooldown`
- `cannonCooldown`
- `shieldCharge`
- `repulseCooldown`
- `firewallCooldown`
- `activeEffects`

Behavior:

- Move from keyboard or mouse.
- Clamp inside arena.
- Launch balls.
- Fire cannon projectiles if upgraded.
- Trigger active-style effects when rules allow.

### Brick

Fields:

- `x`, `y`, `width`, `height`
- `type`
- `hp`, `maxHp`
- `armor`
- `requiredForClear`
- `resistances`
- `statusEffects`
- `movementPattern`
- `shieldedBy`
- `onDeathEffect`
- `lootWeight`

Types:

- Basic.
- Tough.
- Armored.
- Shielded.
- Moving.
- Explosive.
- Elemental.
- Regenerating.
- Brittle.
- Portal or teleport brick in later biomes.

### Enemy

Fields:

- `x`, `y`, `vx`, `vy`
- `type`
- `hp`, `maxHp`
- `contactDamage`
- `behavior`
- `attackCooldown`
- `statusEffects`

Behavior examples:

- Drift horizontally.
- Patrol around brick formations.
- Shoot slow projectiles.
- Guard shielded bricks.
- Chase paddle within limits.
- Spawn hazard zones.

### Boss

Fields:

- `definitionId`
- `x`, `y`, `width`, `height`
- `hp`, `maxHp`
- `phase`
- `phaseThresholds`
- `attackTimer`
- `attackPatternState`
- `weakPoints`
- `resistances`
- `statusEffects`
- `enrageTimer`

Behavior:

- Update attack scheduler.
- Transition phases at HP thresholds.
- Spawn bricks, hazards, enemies, shields, or projectiles.
- React to element statuses with resistance modifiers.
- Take collision damage from balls and projectiles.

### Projectile

Fields:

- `x`, `y`, `vx`, `vy`
- `radius` or `width/height`
- `damage`
- `owner`
- `element`
- `piercing`
- `lifetime`
- `statusPayload`

Owners:

- Player cannon.
- Boss.
- Enemy.
- Hazard.

### Hazard

Fields:

- `x`, `y`, `width`, `height`, `radius`
- `type`
- `damage`
- `duration`
- `tickRate`
- `effect`
- `warningTime`

Examples:

- Fire vents.
- Ice zones.
- Acid pools.
- Lightning arcs.
- Gravity wells.
- Void portals.

## H. Collision and Physics Approach

### Coordinate System

- Logical arena size: `960 x 600`.
- Paddle baseline near `y = 550`.
- Bricks occupy the upper and middle area.
- Bosses generally occupy top or upper-middle space.
- Balls are circles.
- Bricks, paddle, and most bosses are rectangles.

### Ball Movement

Ball movement uses substeps to reduce tunneling:

- Calculate total distance for the frame.
- Split movement so each substep moves no more than roughly half the ball radius or a configured maximum such as `6px`.
- Cap total substeps per ball per frame. If the cap is hit, clamp remaining movement for that frame rather than allowing runaway CPU cost.
- In each substep:
  - Move ball.
  - Check wall collision.
  - Check paddle collision.
  - Check bricks/enemies/bosses.
  - Resolve at most a small number of collisions to prevent infinite loops.

This is simpler than full swept collision and sufficient for a one-developer arcade game.

### Paddle Bounce Angle

When a ball hits the paddle:

- Compute normalized hit offset:
  - `offset = (ball.x - paddle.centerX) / (paddle.width / 2)`
  - Clamp to `[-1, 1]`.
- Convert to outgoing angle:
  - Center hit sends ball mostly upward.
  - Edge hit sends ball sharply sideways.
  - Recommended range: 25 to 155 degrees measured from positive X, with upward direction enforced.
- Preserve or slightly boost speed based on upgrades.

### Brick Collision

For circle vs rectangle:

1. Find the closest point on the rectangle to the circle center.
2. If distance is less than radius, collision occurred.
3. Determine collision normal:
   - Use minimum penetration axis when inside/near corners.
   - Reflect velocity across the normal.
4. Apply damage and effects.
5. Nudge the ball out of collision to avoid sticking.

### Piercing and Bounce Rules

- If a ball pierces, it applies damage/effects but does not reflect.
- If a ball does not pierce, it reflects.
- `remainingPierces` and `remainingBounces` are derived from current stats and upgrade effects.
- Acid may conditionally pierce weakened or corroded bricks.
- Bosses should usually stop balls unless a special piercing effect triggers.

### Broadphase

MVP:

- Direct checks against all active bricks, enemies, bosses, and hazards.
- Cap normal levels to a manageable number of entities.

Later optimization:

- Uniform spatial grid for bricks and hazards.
- Query only nearby cells for each ball/projectile.

### MVP Collision Contract

Collision rules need to be deterministic before implementation.

Priority within each ball substep:

1. Arena walls.
2. Paddle.
3. Bricks.
4. Mini-boss or boss target.
5. Later entities: enemies, projectiles, hazards.

MVP collision rules:

- Resolve at most one non-wall gameplay collision per ball per substep.
- If a ball overlaps multiple bricks in the same substep, choose the target with the deepest penetration, then lowest `id` as a stable tie-breaker.
- If a paddle and brick collision happen in the same substep, paddle wins only when the ball is moving downward and intersects the paddle zone.
- Nudge the ball out along the chosen collision normal before reflecting.
- Prevent nearly horizontal bounces by enforcing a minimum absolute vertical velocity after paddle and brick reflections.
- Clamp ball speed between defined minimum and maximum values after every stat calculation and collision response.
- If a ball remains overlapped after the allowed collision attempts, move it to the nearest safe point along the collision normal and skip further damage for that target this frame.
- Piercing balls may damage multiple targets per frame, but MVP should cap this to one target per substep and a small per-frame maximum.
- Boss and mini-boss hitboxes do not overlap required bricks in MVP.

### Life, Loss, and Respawn Rules

- The player starts each MVP level with a fixed life count, such as 3.
- Losing an individual ball during multiball does not cost a life while at least one active ball remains.
- Losing all active balls costs one life.
- If lives remain, the next ball spawns stuck to the paddle at the paddle center and launches on Space, click, or tap.
- If lives reach zero, the run enters `gameOver`.
- MVP has no enemy projectiles or hazards to clear on respawn. Later versions should clear hostile projectiles and temporary warning-only hazards on life loss unless a mode explicitly keeps them.

### Hit and Damage Event Shape

Every damaging interaction should go through one event shape and one damage function.

```text
hitEvent:
  sourceId
  sourceKind
  targetId
  targetKind
  element
  baseDamage
  critChance
  critDamage
  statusPayload
  collisionNormal
  position
```

Damage pipeline:

1. Build `hitEvent`.
2. Calculate crit.
3. Apply armor and resistance.
4. Apply the final damage to HP.
5. Apply allowed status effects.
6. Emit particles, floating text, combo events, and reward hooks.

The MVP should support armor, crit, and Fire burn through this pipeline. Splash, chain, pierce expansion, chill, corrosion, and boss resistance caps can be added later without creating separate damage paths.

## I. Element and Status Effect System

### Design Principles

- Elements are data-driven.
- Status effects are generic and reusable across bricks, enemies, and bosses.
- Each effect has clear stacking rules.
- Bosses can resist, reduce, or cap hard control effects like stun and freeze.
- Visual effects should make element procs obvious.

### Status Effect Shape

```text
type
sourceId
remaining
duration
tickInterval
tickTimer
stacks
potency
maxStacks
metadata
```

### Normal

Role:

- Reliable baseline damage.
- Strong scaling through damage, speed, crit chance, crit damage, and bounce count.

Effects:

- No status by default.
- Higher crit consistency.
- Can unlock "kinetic" upgrades later, such as ricochet power or impact shockwaves.

### Fire

Role:

- Area damage and damage over time.
- MVP role: optional burn build from the run-upgrade pool.

Effects:

- Applies `burn`:
  - Ticks damage every `0.5s`.
  - Duration scales with `statusDuration`.
  - Stacks refresh duration, with limited stack count.
- Later spread chance:
  - On hit or burn tick, nearby bricks within `spreadRange` may receive a smaller burn.
- Later explosion chance:
  - On hit or kill, deals splash damage in `explosionRadius`.

Balance notes:

- Strong against dense brick layouts.
- Weaker against fire-resistant Ember enemies and bosses.
- MVP Fire has burn only. No spread, explosion, Fire resistance, or Fire enemy interactions until after the first playable demo.

### Lightning

Role:

- Chain damage, burst, and short disruption.

Effects:

- Chain hit:
  - Finds nearest valid targets within `chainRange`.
  - Each jump deals reduced damage, for example 70 percent then 50 percent.
  - Fork upgrades can add additional branches.
- Stun chance:
  - Enemies can be stunned briefly.
  - Bosses receive a very short interrupt or "static" debuff instead of full stun.
- Visual:
  - Bright jagged line segments between targets.

Balance notes:

- Strong against spread-out targets.
- Needs chain limits and per-hit cooldowns to avoid infinite loops.

### Frost

Role:

- Control and vulnerability setup.

Effects:

- Applies `chill`:
  - Reduces enemy/hazard movement speed.
  - Reduces boss attack speed slightly.
- Applies `brittle` to bricks:
  - Increases next hit damage.
  - May make frozen bricks shatter at low HP.
- Freeze chance:
  - Briefly stops eligible bricks/enemies.
  - Bosses only receive partial slow.
- Ice zones:
  - Temporary zones can alter ball speed or enemy movement.

Balance notes:

- Strong defensive element.
- Should not make bosses trivial.

### Acid

Role:

- Armor reduction, corrosion, and conditional pierce.

Effects:

- Applies `corrosion`:
  - Damage over time.
  - Reduces armor/resistance while active.
- Weakened pierce:
  - If target is below a health threshold or has enough corrosion stacks, acid balls may pierce.
- Armor shred:
  - Stacks up to a cap.

Balance notes:

- Strong against armored and high-health targets.
- Lower immediate burst than fire or lightning.

### Element Proc Calculation

Each ball has:

- A primary element.
- `elementChance` for enhanced effect procs.
- Element-specific stats like explosion radius or chain range.

On hit:

1. Roll crit.
2. Apply base damage after armor/resistance.
3. Roll element effect.
4. Apply status or secondary damage.
5. Spawn particles/trails/floating text.
6. Notify reward/combo systems.

MVP element handling:

- Normal is the default ball behavior.
- Fire is available immediately through upgrade choices and does not require permanent unlocks.
- Fire upgrades add or improve capped burn.
- Lightning, Frost, and Acid can exist as empty registered configs for future compatibility, but they are not offered or spawned in MVP.

## J. Upgrade System

### Two Progression Layers

#### Run Upgrades

- Temporary.
- Chosen after clearing each level.
- Reset on game over or abandoned run.
- Encourage build variety.
- Presented as upgrade cards.
- Can stack up to defined limits.

#### Permanent Upgrades

- Bought with persistent currency.
- Stored in `localStorage`.
- Improve baseline stats or unlock systems.
- Designed to reduce early grind without trivializing late levels.

### Upgrade Data Shape

```text
id
name
description
rarity
category
maxStacks
prerequisites
tags
weight
statModifiers
effectHooks
```

### Rarities

Recommended:

- Common.
- Uncommon.
- Rare.
- Epic.
- Legendary.

Rarity affects:

- Numeric magnitude.
- Special behavior probability.
- Card visual treatment.
- Offering weight.

### Run Upgrade Categories

MVP run upgrades should stay simple and avoid creating new collision shapes beyond multiball:

- Damage.
- Speed.
- Critical hit chance.
- Paddle width.
- Extra ball or multiball.
- Fire burn.
- Shield or life safety.

Post-MVP ball upgrades:

- Element chance.
- Critical damage.
- Pierce chance.
- Bounce count.
- Split chance.
- Explosion radius.
- Chain range.
- Status duration.

Post-MVP paddle and ability upgrades:

- Fire rate.
- Multi-shot.
- Cannons.
- Firewall.
- Repulse.
- Ball magnetism.
- Shield charge.
- Elemental amplifier.

Delayed or experimental:

- Lucky Shot.
- Coin bonus upgrades.

### Example Upgrade Behaviors

Multi-shot:

- Launches additional balls at small angle offsets.
- Early stacks add `+1` ball.
- Later stacks increase spread control or reduce damage penalty.

Fire Rate:

- Reduces launch and cannon cooldowns.
- Should have a minimum cooldown cap.

Cannons:

- Adds side cannon projectiles.
- Projectiles travel upward and damage bricks/enemies.
- Can inherit crit and element chance at reduced strength.

Firewall:

- Creates temporary horizontal barrier above the paddle.
- Damages enemies/bricks that touch it.
- Saves falling balls once per activation by bouncing them upward.

Repulse:

- Pushes nearby balls upward.
- Pushes enemies, projectiles, or hazards away from the paddle.
- Useful as a defensive cooldown or passive charge trigger.

Lucky Shot:

- Excluded from MVP.
- Should stay out of early balancing because it is high variance and hard to tune.
- Small chance on hit to trigger one rare outcome:
  - Massive damage.
  - Spawn bonus ball.
  - Duplicate reward roll.
  - Free temporary shield.
  - Elemental nova.
- Should have an internal cooldown.

Ball Magnetism:

- Slightly curves nearby falling balls toward paddle center.
- Should be subtle to preserve skill.

Shield Charge:

- Charges from hits or time.
- When full, protects from one lost-ball event or enemy projectile.

Elemental Amplifier:

- Increases element proc chance and status potency.
- Later stacks may make the current biome's weakness more important.

### Stat Calculation and Stacking Rules

Apply stat changes in this order:

1. Base level/player stats.
2. Permanent upgrades.
3. Run upgrades.
4. Temporary buffs.
5. Status effects.
6. Caps and diminishing returns.

MVP caps:

- Ball speed has a hard minimum and maximum.
- Paddle width has a hard maximum.
- Active ball count has a hard maximum.
- Crit chance cannot reach 100 percent.
- Burn has a max stack count and max tick rate.

Conflict rules:

- Upgrades that add more hit events, such as multiball, pierce, chain, explosions, and rapid projectiles, need explicit per-frame event budgets before they can be combined.
- Cooldown reduction cannot reduce active abilities below their minimum cooldown.
- Defensive upgrades should prevent mistakes, not erase ball-loss risk entirely.
- Economy upgrades are delayed until the base reward curve is known.

### Upgrade Offering Rules

After each cleared level:

- Offer 3 choices by default.
- Permanent upgrades can increase choices to 4.
- Avoid offering upgrades already at max stacks.
- Respect prerequisites.
- Use weighted rarity table based on level and difficulty.
- Guarantee at least one broadly useful upgrade.

Recommended rarity weights:

```text
Levels 1-10:   Common 70, Uncommon 25, Rare 5,  Epic 0,  Legendary 0
Levels 11-30:  Common 55, Uncommon 32, Rare 11, Epic 2,  Legendary 0
Levels 31-60:  Common 42, Uncommon 34, Rare 18, Epic 5,  Legendary 1
Levels 61-90:  Common 32, Uncommon 34, Rare 23, Epic 9,  Legendary 2
Levels 91-100: Common 24, Uncommon 32, Rare 28, Epic 12, Legendary 4
```

## K. Level Generation and 100-Level Progression

### Overall Structure

Full game target:

- 100 levels total.
- 10 biomes, 10 levels each.
- Every 10th level is a major boss.
- Non-boss levels are generated from biome rules, level number, seed, and difficulty budget.
- Field bosses can appear on non-boss levels after the early tutorial stretch.

MVP target:

- 5 levels total.
- One biome.
- Levels are hand-authored or generated from very constrained templates.
- Level 5 is a simple mini-boss or large target, not a full three-phase boss.
- No field bosses, enemies, hazards, moving bricks, or procedural layout surprises.

### Level Data Shape

```text
levelNumber
seed
biomeId
isBossLevel
layoutPattern
brickBudget
enemyBudget
hazardBudget
modifiers
fieldBoss
rewardMultiplier
```

### Generation Process

MVP process:

1. Load a hand-authored or tightly templated level definition.
2. Validate brick positions against arena margins and the forbidden paddle zone.
3. Create required bricks and optional non-required decorations.
4. Fall back to a known safe layout if validation fails.

Full generation process:

1. Determine biome from level number.
2. Determine whether level is boss level.
3. Create seeded random generator from profile seed plus level number.
4. Select a layout pattern:
   - Grid.
   - Fortress.
   - Rings.
   - Columns.
   - Gaps.
   - Shield clusters.
   - Moving lanes.
   - Boss arena.
5. Calculate difficulty budgets.
6. Place required bricks.
7. Add special bricks from weighted type tables.
8. Add enemies and hazards based on biome.
9. Roll field boss chance if eligible.
10. Validate:
   - Required targets exist.
   - No impossible overlapping placements.
   - Boss has enough open space.
   - Paddle area is clear.
   - If validation fails after a small retry count, use a safe fallback layout instead of retrying indefinitely.

### Clear Conditions

Normal level clears when:

- All required bricks are destroyed.
- All required enemies are defeated.
- Any field boss is defeated if spawned.

Boss level clears when:

- Boss HP reaches zero.
- Optional summoned bricks do not need to be cleared unless marked as required.

Strict clear-condition rules:

- A target counts toward completion only if it is created with `requiredForClear: true`.
- MVP required targets are only required bricks and the level 5 mini-boss target.
- Summoned, spawned, or regenerated bricks default to `requiredForClear: false`.
- Regenerating bricks are considered cleared once their required original instance has been destroyed, unless a later level explicitly marks the regenerated form as required.
- Shield sources block damage but do not count for clear unless they are also marked required.
- Hazards never count for clear.
- If a required brick becomes unreachable or stuck because of a bug, debug builds should flag the level invalid and normal builds should expose a safe fallback clear or restart path rather than trapping the player.
- Level completion is checked after damage resolution and entity removals, not during collision iteration.

### Level Progression Pacing

- Levels 1-3: Tutorial-like simple layouts, no field bosses, no punishing hazards.
- Levels 4-9: Introduce enemy and special brick basics.
- Every new biome introduces one or two new mechanics, then combines them.
- Boss level tests the biome mechanic.
- Levels 91-100 combine all elemental themes and require mature builds.

## L. Biome Plan

| Levels | Biome | Visual Palette | Hazards | Enemy Theme | Environmental Modifier | Boss |
| --- | --- | --- | --- | --- | --- | --- |
| 1-10 | Grasslands / Training Ruins | Green, gold, stone, cyan highlights | Thorn patches, falling rubble | Slow sentries, training drones | Occasional healing or bonus bricks | Mossback Golem |
| 11-20 | Ember Caverns | Red, orange, black stone, molten yellow | Fire vents, lava cracks | Fire wisps, ember crawlers | Fire bricks may explode on death | Ember Wyrm |
| 21-30 | Frozen Spires | Ice blue, white, violet, dark teal | Ice zones, frost gusts | Snow shades, frost turrets | Some zones slow balls or enemies | Frost Monarch |
| 31-40 | Toxic Marsh | Acid green, purple, murky black | Acid pools, poison clouds | Slimes, spore pods | Corrosion pools reduce armor/control | Acid Bog Titan |
| 41-50 | Storm Citadel | Electric blue, silver, dark navy | Lightning arcs, charged pylons | Storm orbs, shield drones | Random arcs energize bricks | Storm Herald |
| 51-60 | Crystal Mines | Magenta, cyan, deep indigo, white | Crystal spikes, refractors | Crystal beetles, prism nodes | Some bricks reflect or split balls | Crystal Hydra |
| 61-70 | Haunted Foundry | Sickly green, rust, iron, violet | Flame chains, ghost anvils | Wraiths, furnace skulls | Bricks may revive once as ghosts | Wraith Furnace |
| 71-80 | Solar Desert | Gold, white, red, turquoise shadows | Solar beams, heat mirages | Sun scarabs, mirror sentries | Heat waves bend ball paths slightly | Solar Colossus |
| 81-90 | Void Laboratory | Black, violet, neon pink, sterile white | Gravity wells, portals | Void drones, lab constructs | Teleport bricks and gravity shifts | Void Architect |
| 91-100 | Elemental Nexus | Rotating elemental palette | Mixed elemental hazards | Hybrid enemies | Multiple modifiers rotate mid-level | Elemental Nexus Core |

### Biome Implementation

Each biome config should define:

- `id`, `name`, `levelStart`, `levelEnd`.
- Background gradient colors.
- Brick palette.
- Particle palette.
- Music/sound style placeholder identifiers.
- Hazard weights.
- Enemy weights.
- Brick type weights.
- Boss id.
- Modifier hooks.
- Resistance and weakness hints.

## M. Boss and Field Boss Design

### MVP Mini-Boss

The first playable demo should use one simple level 5 mini-boss or large target:

- One rectangular hitbox.
- One HP bar.
- One passive behavior or one simple attack.
- No summons.
- No phases unless the phase is purely visual.
- No overlapping required bricks.
- No status resistance matrix beyond taking reduced burn if needed for balance.

This validates boss damage, HP display, and level-complete flow without committing to the full boss framework.

### Boss System

Bosses are data-driven definitions plus reusable behavior helpers.

Boss definition fields:

```text
id
name
level
biomeId
baseHp
hitbox
resistances
weaknesses
phaseThresholds
attacks
summons
arenaModifiers
rewardMultiplier
```

Boss update loop:

1. Check HP threshold and transition phase if needed.
2. Update current attack timers.
3. Select attacks from phase-specific weighted list.
4. Spawn projectiles, bricks, minions, or hazards.
5. Apply status effects with boss-specific caps.
6. Expose weak points or shields based on phase.

### Major Bosses

Level 10, Mossback Golem:

- Intro boss.
- Spawns mossy guard bricks.
- Slow rock projectiles.
- Phase 2 grows armor plates.
- Weak to fire.

Level 20, Ember Wyrm:

- Moves in arcs across top.
- Spawns explosive fire bricks.
- Breath attack sweeps lanes.
- Resistant to fire, weak to frost.

Level 30, Frost Monarch:

- Creates ice shields.
- Freezes random brick rows.
- Slows balls in frost zones.
- Resistant to frost, weak to fire and acid.

Level 40, Acid Bog Titan:

- Creates acid pools.
- Armored shell that acid can shred.
- Spawns slime minions.
- Weak to lightning burst and normal crit builds.

Level 50, Storm Herald:

- Teleports between pylons.
- Chains lightning between charged bricks.
- Brief vulnerability windows after big attacks.
- Resistant to stun, weak to acid corrosion.

Level 60, Crystal Hydra:

- Multiple heads or weak points.
- Heads regenerate if not defeated close together.
- Crystal prisms refract balls/projectiles.
- Weak to explosive/fire area damage.

Level 70, Wraith Furnace:

- Alternates physical and ghost phases.
- Revives destroyed bricks as haunted versions.
- Shoots furnace waves.
- Weak to lightning chains and frost slows.

Level 80, Solar Colossus:

- Large central boss with orbiting shield bricks.
- Solar beams create warning lanes.
- Heat shimmer slightly bends trajectories.
- Weak to acid armor shred and frost control.

Level 90, Void Architect:

- Rearranges brick layouts mid-fight.
- Creates portals and gravity wells.
- Summons lab constructs.
- Weakness rotates by phase.

Level 100, Elemental Nexus Core:

- Final multi-phase boss.
- Rotates through elemental forms.
- Uses attacks from earlier biome bosses.
- Requires adapting to resistance changes.
- Final phase exposes core while arena modifiers cycle.

### Field Boss Encounters

Field boss rules:

- Disabled on levels 1-4 and major boss levels.
- Chance increases with level.
- Only one field boss per level.
- Uses smaller HP and fewer phases than major bosses.
- Drops extra currency and higher rarity upgrade odds.

Recommended field boss chance:

```text
fieldBossChance = min(0.05 + levelNumber * 0.0025, 0.22)
```

Examples:

- Moss Guardian.
- Ember Drakelet.
- Frost Knight.
- Bog Horror.
- Storm Captain.
- Crystal Maw.
- Furnace Wraith.
- Solar Djinn.
- Void Surgeon.
- Nexus Aberration.

## N. Difficulty Scaling Formulas

Use formulas from `src/data/scaling.js` and tune values after playtesting.

### Shared Values

```text
levelIndex = levelNumber - 1
biomeIndex = floor((levelNumber - 1) / 10)
chapterProgress = ((levelNumber - 1) % 10) / 9
difficulty = 1 + levelIndex * 0.105 + biomeIndex * 0.18
```

### Brick Scaling

```text
brickHealth = round(brickType.baseHp * difficulty * biome.brickHpMultiplier)
brickArmor = brickType.baseArmor + floor(levelNumber / 15) + biome.armorBonus
brickCount = clamp(22 + floor(levelNumber * 1.35) + biomeIndex * 2, 22, 88)
specialBrickChance = clamp(0.06 + levelNumber * 0.006, 0.06, 0.55)
movingBrickChance = clamp((levelNumber - 12) * 0.004, 0, 0.28)
shieldedBrickChance = clamp((levelNumber - 18) * 0.004, 0, 0.24)
```

Damage after armor:

```text
armorMultiplier = 100 / (100 + armor * 14)
finalDamage = max(1, rawDamage * armorMultiplier)
```

Acid corrosion can reduce effective armor before this calculation.

### Enemy Scaling

```text
enemyHealth = round(enemyType.baseHp * (1 + levelNumber * 0.14) * biome.enemyHpMultiplier)
enemySpeed = enemyType.baseSpeed * (1 + levelNumber * 0.01 + biomeIndex * 0.025)
enemyAttackCooldown = enemyType.baseCooldown / (1 + levelNumber * 0.006)
enemyBudget = floor(levelNumber / 4) + biomeIndex
```

### Boss Scaling

```text
bossHealth = round(boss.baseHp * (1 + levelNumber * 0.22) * (1 + biomeIndex * 0.15))
bossDamage = boss.baseDamage * (1 + levelNumber * 0.08)
bossAttackRate = boss.baseAttackRate * (1 + biomeIndex * 0.06)
```

Boss phase thresholds:

```text
Phase 1: 100-66 percent HP
Phase 2: 66-33 percent HP
Phase 3: 33-0 percent HP
Final boss may use 4 or 5 phases
```

### Hazard Scaling

```text
hazardBudget = floor(levelNumber / 5) + floor(biomeIndex / 2)
hazardDamage = baseHazardDamage * (1 + levelNumber * 0.075)
hazardFrequency = baseFrequency * (1 + biomeIndex * 0.05)
```

### Reward Scaling

```text
baseCoins = 20 + levelNumber * 7
clearBonus = round(baseCoins * clearRatingMultiplier)
fieldBossBonus = round(baseCoins * 0.75)
bossBonus = round(baseCoins * 1.6)
shardChance = clamp(0.08 + levelNumber * 0.003, 0.08, 0.4)
```

Clear rating multiplier can use:

- `1.0` normal clear.
- `1.1` no lost balls.
- `1.15` fast clear.
- `1.25` boss flawless bonus.

### Upgrade Rarity Scaling

```text
rareBonus = floor(levelNumber / 10) * 0.015
epicBonus = floor(levelNumber / 20) * 0.01
legendaryBonus = levelNumber >= 50 ? (levelNumber - 50) * 0.0008 : 0
```

Field bosses and major bosses can temporarily increase rare-or-better odds for the next upgrade selection.

## O. Save and Load Structure Using localStorage

### Storage Key

```text
brickBreakerElementalBarrage.save.v1
```

### Save Shape

```text
version
configVersion
createdAt
updatedAt
settings
profile
activeRun
statistics
```

### Settings

```text
audioMuted
musicVolume
sfxVolume
screenShake
showDamageNumbers
mouseControl
reducedMotion
```

### Profile

```text
highestLevelUnlocked
coins
shards
permanentUpgrades
unlockedElements
completedBosses
bestLevelTimes
totalVictories
```

MVP can omit or leave empty `shards`, `permanentUpgrades`, `unlockedElements`, `completedBosses`, `bestLevelTimes`, and `totalVictories`. Keep the save reader tolerant of missing post-MVP fields.

### Active Run

```text
exists
runId
seed
currentLevel
lives
runUpgrades
coinsEarned
pendingReward
startedAt
lastSavedAt
```

Do not save live level state. Do not persist active balls, brick HP, particles, projectiles, timers, collision state, generated arrays, or boss scheduler internals. Continuing a run regenerates the current level from `seed`, `currentLevel`, `lives`, and `runUpgrades`.

### Statistics

```text
totalRuns
totalDeaths
totalBricksDestroyed
totalBossesDefeated
totalBallsLost
totalDamageDealt
favoriteElement
```

### Save Rules

Save after:

- Starting a new run.
- Starting a level.
- Completing a level.
- Choosing an upgrade.
- Buying permanent upgrades.
- Changing settings.
- Game over.
- Victory.
- Returning to menu.

Do not save every frame. For crash resilience, autosave the active run at level start and after major transitions.

### Migration and Safety

- Store a `version`.
- Store a lightweight `configVersion` or content version so development-time data changes can be detected.
- Validate loaded data.
- If corrupt, keep a backup copy under a `.backup` key before replacing.
- Provide debug export/import for manual testing.
- Use default values for missing fields.
- If config data changes in a way that invalidates an active run during development, preserve permanent progress and clear only the active run.
- If migration fails, move the bad save to backup, load defaults, and show a reset/import option.

## P. UI Screens and HUD Plan

### Main Menu

MVP buttons:

- Continue Run.
- New Run.
- Settings.

Also show:

- Highest unlocked level.
- Coins.
- Current run summary if a run can continue.

Later buttons:

- Level Select.
- Permanent Upgrades.

### Level Select

- Post-MVP.
- Grid of levels 1-100.
- Locked levels are disabled.
- Boss levels visually marked.
- Biome bands or color-coded groups.
- On mobile, prefer biome pages or compact chapter rows over a dense 100-button grid.
- Its role must be decided before implementation: practice mode, campaign checkpoint, or true run start.

### Permanent Upgrade Shop

- Post-MVP.

Categories:

- Ball Core.
- Paddle Core.
- Element Unlocks.
- Economy.
- Utility.

Examples:

- Base ball damage.
- Starting paddle width.
- Starting multiball chance.
- Extra upgrade choice.
- Unlock Lightning/Frost/Acid and later Fire variants. MVP Fire burn is not locked behind the shop.
- Starting shield charge.
- Increased coin gain.

### HUD During Gameplay

Canvas or HTML overlay should show:

- Current level.
- Biome name.
- Coins earned this run/level.
- Ball count.
- Lives or shield state.
- Boss HP bar when boss exists.
- Paddle ability cooldowns.
- Active run upgrade icons.
- Combo or streak meter.
- Pause hint.

Keep HUD compact and readable. The gameplay area should remain visually dominant.

### Upgrade Selection Screen

- 3 cards by default.
- Each card shows:
  - Name.
  - Rarity.
  - Category icon/style.
  - Short mechanical description.
  - Current stack count if applicable.
- Number keys `1`, `2`, `3`, `4` choose cards.
- Mouse click also chooses.
- Space, click, and gameplay hotkeys do not affect gameplay while this screen is open.
- If focus is inside a button, slider, checkbox, input, or confirmation dialog, keyboard shortcuts should not trigger unrelated actions.

### Pause Screen

- Resume.
- Restart Level.
- Settings.
- Main Menu.
- Reset Save behind confirmation, available from settings or debug-only controls.
- Later modes may add Abandon Run.

### Game Over Screen

- Reached level.
- Bricks destroyed.
- Bosses defeated.
- Coins earned.
- Shards earned later if shards are added.
- Most impactful upgrades.
- MVP buttons: New Run, Main Menu.
- Later buttons: Permanent Upgrades.

### Victory Screen

- Completion time.
- Final build.
- Total rewards.
- Unlock post-clear badge or harder mode later.

### Settings

- Mute audio.
- SFX/music volume.
- Mouse control on/off.
- Screen shake amount.
- Damage numbers on/off.
- Reduced motion.
- Reset save with confirmation.

### Focus and Input Rules

- Gameplay input is active only in `playing`.
- Overlay buttons and form controls receive normal browser focus.
- Number keys select upgrade cards only when the upgrade overlay owns input.
- Space launches the ball only during `playing` and never while a focused button or dialog is active.
- Escape closes overlays or pauses according to the current mode, with no hidden gameplay side effects.
- Reset save always requires confirmation.

### Touch and Mobile Rules

MVP mobile target:

- Support modern mobile Safari and Chrome in landscape orientation.
- Use drag-to-move paddle.
- Use tap to launch.
- Keep pause/settings reachable with a visible button.
- Show a simple orientation message if the viewport is too narrow or short.

Virtual buttons for abilities can wait until those abilities exist.

## Q. Implementation Milestones

### Milestone 1: Static Shell, Menu, Save, and Loop

- Create the initial file structure.
- Add `index.html`, `styles.css`, and module entry.
- Canvas responsive scaling with capped device pixel ratio.
- Game loop with `boot`, `mainMenu`, `playing`, `paused`, and `settings`.
- Input manager.
- Basic renderer.
- Asset manifest and loader stub with code-drawn fallbacks for missing images.
- `SaveSystem` with versioned defaults, settings, highest unlocked level, coins, and active run summary.
- Main menu with New Run, Continue Run, and Settings.
- Pause menu with Resume, Restart Level, Settings, and Main Menu.
- Debug FPS overlay.

Done when:

- Browser opens from static files.
- Canvas resizes correctly.
- Missing image assets fall back to code-drawn placeholders.
- Loop runs without errors.
- Pause/menu state transitions work.
- Settings and progress survive reload.
- A saved active run can be continued by regenerating the level from its summary.

### Milestone 2: Core Brick Breaker Feel and Collision Contract

- Paddle movement.
- Single ball launch.
- Wall, paddle, and brick collisions using the MVP collision contract.
- Basic brick HP and destruction.
- One hand-authored test level.
- Ball loss, life loss, stuck-to-paddle respawn, and game over.
- Stable hit event and damage function.
- Speed clamps and anti-horizontal bounce rules.
- Debug collision overlay and seed/level display.

Done when:

- A simple level can be played and cleared.
- Ball angles feel controllable.
- No obvious collision sticking.
- Losing all balls costs one life and relaunches cleanly.
- Collision behavior is deterministic enough to debug.

### Milestone 3: First Playable Demo Loop

- Add one biome config.
- Add brick type configs.
- Implement 5 hand-authored or tightly templated levels.
- Add basic bricks and one special brick type, preferably armored.
- Add level complete, rewards, upgrade choice, next-level flow, game over, and victory/demo-complete flow.
- Add 6-8 simple run upgrades: damage, speed, paddle width, crit chance, multiball, Fire burn, shield/life safety.
- Save active run summary after level start, level complete, and upgrade choice.

Done when:

- A run from level 1 through level 5 works.
- Upgrade choices noticeably affect play.
- Reloading during a run resumes from the saved level summary.
- Temporary upgrades reset after game over or new run.

### Milestone 4: Fire, Mini-Boss, and MVP Polish

- Implement Normal and Fire behavior only.
- Fire applies capped burn only.
- Add level 5 mini-boss or large target with HP bar and one simple behavior.
- Add minimal particles: hit flash, brick break burst, and ball trail.
- Add generated Web Audio unlock/mute support with one or two placeholder sounds or safe no-op calls.
- Add compact HUD.
- Add focus-safe overlay input rules.
- Add basic touch controls: drag paddle and tap to launch.
- Hot-swap any generated P0 images that already exist, while keeping placeholders for missing ones.

Done when:

- The five-level demo feels complete enough to share.
- Effects stay readable.
- Audio does not break when unavailable or blocked.
- Keyboard, mouse, and touch input do not conflict with overlays.
- Asset loading errors do not block play.

### Milestone 5: MVP Validation and GitHub Pages Check

- Manual test pass for collisions, save/load, upgrade application, clear conditions, mobile layout, and tab visibility.
- Debug tools gated behind `?debug=1`: FPS, collision overlay, next level, reset save, seed display.
- GitHub Pages deployment smoke test.
- Performance pass for low-end laptop and mobile browser.
- Tune the first five levels and rewards.

Done when:

- The game runs as a static site on GitHub Pages.
- The first playable demo has no blocking save, collision, or progression bugs.
- The plan is ready to expand beyond MVP.

### Milestone 6: Data-Driven Expansion

- Split early modules into the fuller architecture as patterns stabilize.
- Add seeded level generation with safe fallback layouts.
- Expand to levels 1-10.
- Add biome visual variation and more brick layout patterns.
- Add permanent upgrade shop if the economy is ready.

Done when:

- Restarting a level with the same seed reproduces layout.
- Generated levels validate reliably.
- The first biome has enough variety without breaking the core feel.

### Milestone 7: Full Element and Upgrade Systems

- Add Lightning, Frost, and Acid.
- Add status stacking rules and boss resistance caps.
- Add post-MVP upgrades such as pierce, chain, explosions, magnetism, cannons, firewall, repulse, and elemental amplifier.
- Add event budgets for combined hit effects.

Done when:

- Each element has a distinct visible and mechanical identity.
- Upgrade combinations stay within performance and readability budgets.

### Milestone 8: Boss, Enemy, Hazard, and Ability Frameworks

- Add full boss entity and reusable attack helpers.
- Build Level 10 Mossback Golem with deliberately limited phases.
- Add minimal enemy, hazard, and projectile systems.
- Add paddle ability support once projectiles and cooldowns are stable.

Done when:

- Level 10 is a complete boss fight.
- New hostile systems use the existing damage, collision, save, and debug contracts.

### Milestone 9: Full 100-Level Content Pass

- Add all 10 biomes.
- Add all major boss definitions.
- Add field bosses.
- Add biome-specific hazards and enemy types.
- Tune generation rules.
- Add level select only after its role is resolved.

Done when:

- The game can be played from level 1 to 100.
- Each biome has a clear identity.

### Milestone 10: Juice, Balance, and Release

- Expand particles, trails, screen shake, and floating damage numbers within readability budgets.
- Add generated audio placeholders.
- Tune scaling and reward economy.
- Cross-browser testing.
- GitHub Pages deployment check.

Done when:

- The game feels responsive and readable.
- There are no blocking save, collision, or progression bugs.
- The project runs as a static site on GitHub Pages.

## R. Risk Areas and Simplifications

### Collision Tunneling

Risk:

- Fast balls may skip through thin bricks.
- Corner cases such as simultaneous paddle/brick hits, overlapping bricks, and high-speed multiball can become nondeterministic.

Mitigation:

- Use substep movement.
- Cap ball speed.
- Increase collision thickness slightly for bricks.
- Add debug collision overlay.
- Use the MVP collision contract before adding pierce, chain, explosions, moving bricks, or boss overlap cases.

### Scope Creep From 100 Levels

Risk:

- Hand-making 100 levels is too much.
- Building the 100-level generator before the core feel is stable can hide basic pacing and collision problems.

Mitigation:

- Hand-author or tightly template the first five levels.
- Add generated levels from biome rules only after the demo loop works.
- Hand-author boss definitions, layout patterns, and special modifiers.

### Boss Complexity

Risk:

- Ten bosses with unique mechanics can become too large.
- A first boss with summons, phases, shields, hazards, and resistances can consume the whole project.

Mitigation:

- Use a one-behavior level 5 mini-boss for MVP.
- Build a reusable attack library:
  - Spawn bricks.
  - Fire projectile fan.
  - Sweep beam.
  - Summon minions.
  - Shield phase.
  - Hazard zone.
  - Teleport.
- Bosses combine these attacks with different parameters.

### Upgrade Balance

Risk:

- Stacking upgrades can break difficulty.
- Stacking hit-event upgrades can also break performance and readability.

Mitigation:

- Use caps.
- Use diminishing returns for speed, cooldown, chain count, and crit.
- Add debug build presets.
- Track level clear time and ball count during playtesting.
- Add per-frame event budgets before combining multiball, pierce, chain, explosions, and rapid projectiles.

### Visual Clarity

Risk:

- Too many particles, balls, and hazards can obscure gameplay.
- Element colors, biome backgrounds, damage numbers, and screen shake can compete with the ball.

Mitigation:

- Keep ball outlines bright.
- Use consistent color language for each element.
- Add reduced motion option.
- Limit particle counts.
- Fade non-critical background effects.
- Keep MVP effects minimal and privilege readability over spectacle.

### localStorage Corruption

Risk:

- Bad save data could block play.
- Saved live entity state could become impossible to migrate.

Mitigation:

- Validate save shape.
- Provide reset save.
- Keep backup key.
- Use version migration.
- Save declarative active run summaries only.
- Clear invalid active runs while preserving permanent progress when config data changes.

### GitHub Pages Module Paths

Risk:

- Absolute paths break under project pages.

Mitigation:

- Use relative imports.
- Use `./src/main.js` from `index.html`.
- Avoid dynamic imports that depend on root paths.

### Mobile and Browser Support

Risk:

- Safari, mobile Safari, and touch input can expose Canvas scaling, audio unlock, storage, and focus issues late.

Mitigation:

- Target current stable Chrome, Firefox, Safari, and mobile Safari.
- Test landscape mobile layout during MVP.
- Initialize audio only after user gesture and gracefully no-op if unavailable.
- Avoid relying on keyboard-only flows.
- Keep a visible pause/settings control for touch users.

### UI Focus Conflicts

Risk:

- Space, number keys, or Escape can trigger gameplay while a menu, upgrade card, slider, or reset confirmation is focused.

Mitigation:

- Route input by game mode.
- Let focused form controls consume keyboard input.
- Block gameplay input while overlays own focus.
- Confirm destructive actions.

## S. First Playable Prototype Scope

The first playable prototype should be intentionally small.

Included:

- Static page with responsive canvas.
- Code-drawn placeholders for gameplay-critical assets, with generated images hot-swappable through the asset manifest.
- Main menu with New Run, Continue Run, and Settings.
- Pause menu with Resume, Restart Level, Settings, and Main Menu.
- One biome: Grasslands / Training Ruins.
- 5 hand-authored or tightly templated levels.
- One simple mini-boss or large target on level 5.
- Paddle movement by keyboard and mouse.
- Basic touch support: drag paddle and tap to launch.
- Ball launch with paddle angle control.
- Multiple active balls supported internally, even if only one upgrade uses it.
- Basic bricks with HP.
- One special brick type: armored.
- Normal baseline balls and Fire as an always-available run-upgrade path.
- 6-8 run upgrades:
  - Ball damage.
  - Ball speed.
  - Paddle length.
  - Crit chance.
  - Extra ball or multiball.
  - Fire burn.
  - Shield or life safety.
- Simple reward screen.
- Basic `localStorage` save for settings, highest level, coins, and declarative active run summary.
- Minimal particles and hit flashes.
- Debug overlay gated behind `?debug=1` for state-changing tools.
- Placeholder audio support that unlocks after user gesture and safely no-ops if unavailable.

Excluded from first prototype:

- Full 100 levels.
- All biomes.
- Lightning, Frost, and Acid.
- Fire spread, Fire explosions, and Fire resistance.
- Permanent upgrade shop.
- Level select.
- Full boss roster.
- Complex enemies.
- Advanced hazards.
- Field bosses.
- Moving bricks.
- Advanced paddle abilities such as cannons, firewall, repulse, and magnetism.
- Coin bonus upgrades and Lucky Shot.
- Audio polish.

Prototype success criteria:

- The core ball/paddle feel is fun.
- Level clear and reward loop works.
- Upgrade choices noticeably change play.
- Save/load works after page reload.
- A continued active run regenerates cleanly from the run summary.
- Keyboard, mouse, and touch controls do not conflict with overlays.
- Static hosting works.

## T. Polished v1.0 Scope

Included:

- Full 100-level campaign.
- 10 biomes with unique palettes, hazards, modifiers, and enemy themes.
- 10 major bosses with phases.
- Field boss encounters.
- All 5 ball elements:
  - Normal.
  - Fire.
  - Lightning.
  - Frost.
  - Acid.
- Full run upgrade pool with rarity tiers.
- Permanent upgrade shop.
- Multiple active balls.
- Paddle abilities:
  - Multi-shot.
  - Cannons.
  - Firewall.
  - Repulse.
  - Ball magnetism.
  - Shield charge.
  - Elemental amplifier.
- Lucky Shot only if late balancing shows the game benefits from a high-variance upgrade.
- Data-driven level generation.
- Boss health bars and phase effects.
- Floating damage numbers.
- Elemental trails.
- Particle bursts.
- Screen shake.
- Placeholder Web Audio sounds.
- Settings screen.
- Save export/import in debug mode.
- GitHub Pages deployment.

Quality targets:

- Regular levels last about 1.5 to 3 minutes.
- Boss levels last about 3 to 5 minutes.
- No upgrade is mandatory for all builds.
- Every element has a clear strength.
- Every biome introduces a recognizable gameplay wrinkle.
- Late-game screens remain readable with many balls and effects active.

## Data Configuration Plan

### Ball Elements

`src/data/ballElements.js` should define:

```text
normal:
  color
  trailColor
  baseDamageMultiplier
  status
  effectRules

fire:
  color
  burnDamageRatio
  burnDuration

lightning:
  color
  chainRange
  maxChains
  forkChance
  stunChance
  chainFalloff

frost:
  color
  slowPercent
  brittleDamageMultiplier
  freezeChance
  iceZoneChance

acid:
  color
  corrosionDamageRatio
  armorReduction
  pierceWeakenedThreshold
  maxStacks
```

MVP only needs `normal` and the Fire burn fields. Add Fire spread/explosion fields, Lightning, Frost, and Acid when those systems are unlocked.

### Brick Types

`src/data/brickTypes.js` should define:

- Basic.
- Tough.
- Armored.
- Shielded.
- Moving.
- Explosive.
- Elemental Fire.
- Elemental Frost.
- Elemental Acid.
- Regenerating.
- Portal.
- Boss Summon.

Each type includes:

- Base HP.
- Armor.
- Color modifier.
- Score/reward weight.
- Required-for-clear default.
- On-hit behavior.
- On-death behavior.
- Resistance profile.

### Level Rules

`src/data/levelRules.js` should define:

- Layout patterns.
- Brick grid dimensions.
- Row/column spacing.
- Density curves.
- Special brick weights by biome and level.
- Enemy/hazard budgets.
- Field boss eligibility.
- Tutorial restrictions for early levels.

### Scaling

`src/data/scaling.js` should define pure functions:

- `getDifficulty(levelNumber)`.
- `getBrickHealth(levelNumber, brickType, biome)`.
- `getEnemyHealth(levelNumber, enemyType, biome)`.
- `getBossHealth(levelNumber, boss, biome)`.
- `getReward(levelNumber, clearStats)`.
- `getUpgradeRarityWeights(levelNumber, modifiers)`.

### Rewards

`src/data/rewards.js` should define:

- Base coin rewards.
- Shard drop chances.
- Boss bonus multipliers.
- Field boss bonus multipliers.
- Clear rating bonuses.
- Late experimental reward modifiers, if any.

## Balancing Targets

### Starting Player Stats

```text
paddleWidth: 120
paddleSpeed: 650 px/sec
ballRadius: 7
ballSpeed: 360 px/sec
ballDamage: 10
critChance: 5 percent
critDamage: 1.5x
lives: 3
launchCooldown: 0.3 sec
```

### Soft Caps

```text
ballSpeed: 760 px/sec
critChance: 75 percent
critDamage: 3.5x
pierceChance: 70 percent
splitChance: 35 percent
chainCount: 8
paddleWidth: 260
cooldownReduction: 70 percent
```

### Build Archetypes

Normal crit:

- High consistency.
- Strong boss damage.
- Fewer screen effects.

Fire swarm:

- Explosions and burn spread.
- Strong brick clearing.
- Moderate boss damage.

Lightning chain:

- Strong against mixed enemies and scattered bricks.
- Burst windows.
- Good field boss control.

Frost control:

- Slower but safer.
- Strong setup for brittle damage.
- Helps survive dense hazard levels.

Acid shred:

- Strong against armor and bosses.
- Rewards sustained pressure.
- Enables pierce builds.

Paddle tech:

- Cannons, firewall, shields, repulse, magnetism.
- More defensive and ability-driven.

## GitHub Pages Deployment Plan

Requirements:

- Keep all files static.
- Use relative paths.
- No local server required for deployment.
- During development, a simple local server can be used because ES modules may be blocked by direct `file://` access in some browsers.

Recommended local development command:

```text
python3 -m http.server 8000
```

Deployment:

- Push to GitHub.
- Enable GitHub Pages from the repository settings.
- Set source to main branch root or `/docs` if the project later moves files there.
- Confirm `index.html` loads from the GitHub Pages URL.
- Confirm save data is scoped to the deployed origin.

## Practical Build Order

The recommended order is:

1. Core canvas shell.
2. Menu, settings, save/load, and reload recovery.
3. Paddle, ball, brick collision feel.
4. Level complete and upgrade choice loop.
5. Five-level MVP demo with Normal and Fire burn.
6. Data-driven biomes and scaling.
7. Full element system.
8. Paddle abilities and projectiles.
9. Boss framework and hostile systems.
10. Full content expansion.
11. Juice, polish, and balance.

This order keeps the fun part testable early and avoids building a large content system before the core brick-breaking feel is proven.

## Resolved Review Decisions

The review notes have been folded into the main plan. These are the explicit decisions that replaced the open questions:

- First playable demo: five-level mini-campaign in one biome, with a simple level 5 mini-boss or large target.
- Fire timing: Fire is available in the MVP upgrade pool without permanent unlock logic. The default ball remains Normal until the player chooses Fire upgrades.
- Fire behavior: burn only for MVP. Spread, explosions, resistance, and Fire-specific enemies wait.
- Lives: losing all active balls costs one life. Individual multiball losses do not cost lives while another ball remains active.
- Respawn: after life loss, a fresh ball spawns stuck to the paddle and waits for launch.
- Level select: not in MVP. Later implementation must define whether it is practice, checkpoint, or true run start.
- Active run save: yes for MVP, but only as a declarative summary. Reloading regenerates the current level from seed, current level, lives, coins earned, and chosen upgrades.
- Mobile: MVP should support basic landscape touch play with drag paddle and tap-to-launch.
- Simulation: MVP uses a 60 Hz fixed step, distance-based ball substeps, max substep caps, and capped device pixel ratio.
- Collision: deterministic priority and hit limits are required before adding advanced collision effects.
- Debug: core overlay comes early, but state-changing hotkeys are gated behind `?debug=1`.
- Audio: generated Web Audio remains optional and must unlock after user gesture with safe no-op fallback.

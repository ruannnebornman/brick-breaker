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

## B. Technical Architecture

### Runtime Model

- `index.html` loads the game shell and a single ES module entry point.
- `styles.css` provides responsive layout, menu panels, upgrade cards, HUD overlays, and canvas framing.
- `src/main.js` initializes configuration, save data, input, canvas, game state, and starts the loop.
- Canvas uses a fixed logical resolution and scales to fit the browser window.
- JavaScript modules are split by responsibility: core loop, entities, systems, data, and UI.
- No bundler is required. All imports use relative paths that work on GitHub Pages.

### Rendering Split

- **Canvas:** arena, paddle, balls, bricks, enemies, bosses, projectiles, particles, trails, damage numbers, hazard zones, screen shake, background effects.
- **HTML overlays:** main menu, level select, upgrade rewards, permanent upgrade shop, pause, game over, victory, settings, save import/export.

This keeps gameplay rendering fast while avoiding complex canvas text layout for card-heavy UI.

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

## C. File Structure

```text
/index.html
/styles.css
/README.md
/IMPLEMENTATION_PLAN.md

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
```

Optional later folders:

```text
/assets/audio/
/assets/fonts/
/docs/
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

### `Debug`

Enabled by `?debug=1` or a local toggle.

Features:

- FPS and entity counts.
- Seed and level info.
- Collision box overlay.
- Active status effect overlay.
- Hotkeys for next level, spawn upgrade, spawn boss, clear level, add currency, and reset save.
- Save export/import for testing.

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
   - Options: Continue Run, New Run, Level Select, Permanent Upgrades, Settings.
   - Continue is available only if `activeRun` exists.

3. `levelSelect`
   - Shows unlocked levels.
   - Starting from a selected level begins a run using permanent upgrades and no temporary run upgrades unless resuming an active run.

4. `playing`
   - Updates input, physics, entities, collisions, statuses, boss AI, projectiles, hazards, particles.
   - Checks fail and clear conditions.

5. `paused`
   - Freezes simulation.
   - Options: Resume, Restart Level, Abandon Run, Settings, Main Menu.

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

8. `gameOver`
   - Shows summary and currency earned.
   - Clears temporary run upgrades unless the design later supports a continue token.
   - Saves permanent progress.

9. `victory`
   - Shows completion summary after level 100.
   - Unlocks post-clear difficulty options later if desired.

## F. Main Game Loop Design

Use `requestAnimationFrame` with a fixed simulation step for stable collision behavior.

Recommended loop:

- Target simulation step: `1 / 120` seconds for smoother ball collision.
- Maximum accumulated time: `0.25` seconds to avoid spiral-of-death after tab switching.
- Render once per animation frame.
- Pause stops simulation updates but still allows overlay rendering.

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

Effects:

- Applies `burn`:
  - Ticks damage every `0.5s`.
  - Duration scales with `statusDuration`.
  - Stacks refresh duration, with limited stack count.
- Spread chance:
  - On hit or burn tick, nearby bricks within `spreadRange` may receive a smaller burn.
- Explosion chance:
  - On hit or kill, deals splash damage in `explosionRadius`.

Balance notes:

- Strong against dense brick layouts.
- Weaker against fire-resistant Ember enemies and bosses.

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

Ball upgrades:

- Damage.
- Speed.
- Element chance.
- Critical hit chance.
- Critical damage.
- Pierce chance.
- Bounce count.
- Split chance.
- Explosion radius.
- Chain range.
- Status duration.

Paddle upgrades:

- Paddle length.
- Fire rate.
- Multi-shot.
- Crit rate.
- Cannons.
- Firewall.
- Repulse.
- Lucky shot.
- Ball magnetism.
- Shield charge.
- Elemental amplifier.

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

- 100 levels total.
- 10 biomes, 10 levels each.
- Every 10th level is a major boss.
- Non-boss levels are generated from biome rules, level number, seed, and difficulty budget.
- Field bosses can appear on non-boss levels after the early tutorial stretch.

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

### Clear Conditions

Normal level clears when:

- All required bricks are destroyed.
- All required enemies are defeated.
- Any field boss is defeated if spawned.

Boss level clears when:

- Boss HP reaches zero.
- Optional summoned bricks do not need to be cleared unless marked as required.

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

### Active Run

```text
exists
runId
seed
currentLevel
lives
runUpgrades
temporaryStats
pendingReward
startedAt
lastSavedAt
```

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

- Completing a level.
- Choosing an upgrade.
- Buying permanent upgrades.
- Changing settings.
- Game over.
- Victory.
- Returning to menu.

Do not save every frame. For crash resilience, optionally autosave the active run at level start and after major transitions.

### Migration and Safety

- Store a `version`.
- Validate loaded data.
- If corrupt, keep a backup copy under a `.backup` key before replacing.
- Provide debug export/import for manual testing.
- Use default values for missing fields.

## P. UI Screens and HUD Plan

### Main Menu

Buttons:

- Continue Run.
- New Run.
- Level Select.
- Permanent Upgrades.
- Settings.

Also show:

- Highest unlocked level.
- Coins/shards.
- Current permanent upgrade tier summary.

### Level Select

- Grid of levels 1-100.
- Locked levels are disabled.
- Boss levels visually marked.
- Biome bands or color-coded groups.
- Selecting a level starts a run from that level with permanent upgrades.

### Permanent Upgrade Shop

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
- Unlock Fire/Lightning/Frost/Acid.
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

### Pause Screen

- Resume.
- Restart Level.
- Settings.
- Abandon Run.
- Main Menu.

### Game Over Screen

- Reached level.
- Bricks destroyed.
- Bosses defeated.
- Coins/shards earned.
- Most impactful upgrades.
- Buttons: New Run, Permanent Upgrades, Main Menu.

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

## Q. Implementation Milestones

### Milestone 1: Static Shell and Core Loop

- Create file structure.
- Add `index.html`, `styles.css`, and module entry.
- Canvas responsive scaling.
- Game loop with states.
- Input manager.
- Basic renderer.
- Debug FPS overlay.

Done when:

- Browser opens from static files.
- Canvas resizes correctly.
- Loop runs without errors.
- Pause/menu state transitions work.

### Milestone 2: Core Brick Breaker Prototype

- Paddle movement.
- Single ball launch.
- Wall, paddle, and brick collisions.
- Basic brick HP and destruction.
- Level clear detection.
- Ball loss and restart.

Done when:

- A simple level can be played and cleared.
- Ball angles feel controllable.
- No obvious collision sticking.

### Milestone 3: Data-Driven Levels and Biomes

- Add biome configs.
- Add brick type configs.
- Add seeded level generation.
- Implement levels 1-10 with generated layouts.
- Add biome background and brick palettes.

Done when:

- Levels can be generated from data.
- Restarting a level with the same seed reproduces layout.

### Milestone 4: Run Rewards and Upgrades

- Add run upgrade data.
- Add reward screen with 3 cards.
- Implement core ball and paddle stat modifiers.
- Add coin rewards.
- Add active run state.

Done when:

- Clearing a level gives upgrade choices.
- Chosen upgrades affect gameplay.
- Temporary upgrades reset correctly.

### Milestone 5: Element System

- Add Normal, Fire, Lightning, Frost, and Acid configs.
- Implement status effect ticking.
- Implement burn, chain, chill/brittle, corrosion.
- Add elemental trails and hit effects.

Done when:

- Each element has a distinct visible and mechanical identity.
- Effects are balanced enough to continue development.

### Milestone 6: Paddle Abilities and Projectiles

- Add cannons.
- Add firewall.
- Add repulse.
- Add shield charge.
- Add multi-shot and magnetism.
- Implement projectile system.

Done when:

- Paddle builds feel meaningfully different from pure ball builds.

### Milestone 7: Boss Framework and First Boss

- Add boss entity and boss system.
- Add boss health bar.
- Implement phases and attack scheduler.
- Build Level 10 Mossback Golem.

Done when:

- Level 10 is a complete boss fight with at least 3 phase behaviors.

### Milestone 8: Persistence and Menus

- Add `SaveSystem`.
- Add main menu.
- Add continue/new run.
- Add level select.
- Add permanent upgrade shop.
- Save settings and progress.

Done when:

- Progress survives reload.
- Permanent upgrades can be bought and applied.

### Milestone 9: Full 100-Level Content Pass

- Add all 10 biomes.
- Add all major boss definitions.
- Add field bosses.
- Add biome-specific hazards and enemy types.
- Tune generation rules.

Done when:

- The game can be played from level 1 to 100.
- Each biome has a clear identity.

### Milestone 10: Juice, Balance, and Release

- Add particles, trails, screen shake, floating damage numbers.
- Add generated audio placeholders.
- Tune scaling and reward economy.
- Add debug tools.
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

Mitigation:

- Use substep movement.
- Cap ball speed.
- Increase collision thickness slightly for bricks.
- Add debug collision overlay.

### Scope Creep From 100 Levels

Risk:

- Hand-making 100 levels is too much.

Mitigation:

- Use generated levels from biome rules.
- Hand-author only boss definitions, layout patterns, and special modifiers.

### Boss Complexity

Risk:

- Ten bosses with unique mechanics can become too large.

Mitigation:

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

Mitigation:

- Use caps.
- Use diminishing returns for speed, cooldown, chain count, and crit.
- Add debug build presets.
- Track level clear time and ball count during playtesting.

### Visual Clarity

Risk:

- Too many particles, balls, and hazards can obscure gameplay.

Mitigation:

- Keep ball outlines bright.
- Use consistent color language for each element.
- Add reduced motion option.
- Limit particle counts.
- Fade non-critical background effects.

### localStorage Corruption

Risk:

- Bad save data could block play.

Mitigation:

- Validate save shape.
- Provide reset save.
- Keep backup key.
- Use version migration.

### GitHub Pages Module Paths

Risk:

- Absolute paths break under project pages.

Mitigation:

- Use relative imports.
- Use `./src/main.js` from `index.html`.
- Avoid dynamic imports that depend on root paths.

## S. First Playable Prototype Scope

The first playable prototype should be intentionally small.

Included:

- Static page with responsive canvas.
- Main menu with Start.
- One biome: Grasslands / Training Ruins.
- 5 generated levels.
- One basic boss or mini-boss on level 5.
- Paddle movement by keyboard and mouse.
- Ball launch with paddle angle control.
- Multiple active balls supported internally, even if only one upgrade uses it.
- Basic bricks with HP.
- One special brick type: explosive or armored.
- Normal and Fire balls only.
- 6-8 run upgrades:
  - Ball damage.
  - Ball speed.
  - Paddle length.
  - Multi-shot.
  - Fire burn.
  - Crit chance.
  - Shield charge.
  - Coin bonus.
- Simple reward screen.
- Basic localStorage save for highest level and coins.
- Minimal particles and hit flashes.
- Debug overlay.

Excluded from first prototype:

- Full 100 levels.
- All biomes.
- All elements.
- Permanent upgrade shop depth.
- Full boss roster.
- Complex enemies.
- Advanced hazards.
- Audio polish.

Prototype success criteria:

- The core ball/paddle feel is fun.
- Level clear and reward loop works.
- Upgrade choices noticeably change play.
- Save/load works after page reload.
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
  - Lucky Shot.
  - Ball magnetism.
  - Shield charge.
  - Elemental amplifier.
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
  spreadChance
  explosionChance
  explosionRadius

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
- Duplicate reward chance behavior from Lucky Shot.

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
2. Paddle, ball, brick collision feel.
3. Level complete and upgrade choice loop.
4. Save/load.
5. Data-driven biomes and scaling.
6. Elements.
7. Paddle abilities.
8. Boss framework.
9. Full content expansion.
10. Juice, polish, and balance.

This order keeps the fun part testable early and avoids building a large content system before the core brick-breaking feel is proven.

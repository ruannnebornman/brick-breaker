# Paddle Pets Style Update Plan

Drafted: 2026-06-22

## Goal

Rename and restyle the whole game around the reference direction in `docs/images-ref/ee21da63-c3de-4cb6-ada0-26b995edbf0f.png`: a bright "Paddle Pets" world where nearly every important visual element reads as a rounded paddle, a paddle-shaped pet, or a paddle-framed UI object.

The pet card references in `docs/images-ref/pets/` should become the basis for custom visual skins, ability themes, upgrade icons, and generated asset batches. The style update should preserve the existing brick-breaker physics, collision sizes, save data shape, and static-site deployment model.

## Locked Decisions

- Public game name: `Paddle Pets`.
- GitHub repo slug: `paddle-pets`.
- Default pet: `unicorn`.
- First alternate pet: `dragon`.
- Pet-specific powers stay out of scope until the visual skin pass is stable.

## Visual North Star

Use the `ee2` reference as the primary direction:

- Long rounded capsule silhouettes that clearly read as paddles.
- Cute expressive faces, tiny limbs, wings, horns, tails, ears, gems, crowns, shields, or props attached to the paddle body.
- Glossy bevels, soft glow, gold trim, jewel accents, and chunky toy-like fantasy construction.
- Bright purple, magenta, cyan, gold, candy red, and moonlit blue, balanced with readable dark backgrounds.
- Playful fantasy over serious high-fantasy. The existing `a5b81bf9-956e-4828-a0df-2f82b6c3ef3a.png` reference can inform ornate frames, but the game should move closer to the cute paddle-pet look.
- Strong silhouettes at gameplay scale. If a generated asset looks great full-size but becomes visual noise at 64 to 128 pixels, simplify it.

Core rule: if it is a gameplay object, ask "how is this secretly a paddle?"

## Current Repo Touchpoints

The game already has the right hooks for this style pass:

- `src/data/assets.js` defines stable asset IDs, image paths, dimensions, anchors, and fallback hints.
- `src/core/AssetLoader.js` preloads images and returns `null` on missing assets.
- `src/core/Renderer.js` already has image-first drawing plus canvas fallback functions for paddle, ball, brick, boss, enemy, hazard, projectile, pickups, particles, and background.
- `styles.css` controls the current HUD, menus, upgrade cards, store, settings, and overlay surfaces.
- `src/ui/HUD.js`, `src/ui/ScreenManager.js`, and `src/ui/UpgradeCards.js` render the DOM structure that needs the Paddle Pets UI treatment.
- There is no committed `assets/` folder yet, so the first implementation pass should create the asset folder structure without replacing gameplay logic.

## Art System

### Shape Language

- Player paddle: the hero pet, always a long capsule body with a face and one readable theme.
- Balls: tiny magical toys, gems, stars, moons, candies, or elemental orbs that visually belong to the active pet.
- Bricks: short mini-paddles, toy blocks, jewel plaques, clouds, castle blocks, mushrooms, candy bars, or framed badges.
- Bosses: oversized paddle pets or giant paddle plaques with expressive faces and phase-specific attachments.
- Enemies: shorter autonomous paddle-creatures or paddle charms.
- Hazards: paddle-shaped traps, rails, clouds, puddles, vines, portals, or warning strips.
- Pickups: small floating pet charms or gem buttons.
- Projectiles: mini paddles, spark bolts, star shots, breath puffs, bubbles, or magic streaks.
- UI panels: paddle plaques and jewel-framed boards, not plain rectangles.
- Buttons: stacked plank or paddle signs like the `PLAY`, `COLLECT`, `UPGRADE`, and `MAGIC` buttons in the reference.

### Palette

Use a brighter multi-hue palette so the game does not collapse into a single dark green/slate theme:

- Royal purple: `#7a3fe0`
- Candy magenta: `#ff5bd8`
- Sky cyan: `#53d9ff`
- Warm gold: `#ffc95a`
- Gem red: `#f05245`
- Leaf green: `#69c85f`
- Moon blue: `#4059d8`
- Deep night: `#140b35`
- Soft cream text: `#fff3c4`

The playfield background can stay darker, but gameplay objects should pop with warm edge light and high-contrast silhouettes.

### Typography

Generated images should not contain required readable text. Render names, labels, controls, and descriptions with HTML/CSS or canvas text so the game remains editable and accessible.

The UI can use the current system fonts at first, styled with gold/cream color, heavier weight, shadow, and compact spacing. A decorative display font can be a later optional asset if licensing is handled.

## Asset Generation Plan

Yes, Codex can generate raster asset images now. For this project, the safest workflow is:

1. Use the built-in image generation path for concept sheets, backgrounds, UI plates, and sprite sources.
2. Use the `ee2` image as the primary style reference.
3. Use the matching pet card image as the subject reference for each pet-specific asset.
4. For transparent gameplay sprites, generate on a flat chroma-key background, remove the key locally, and save final PNGs in the workspace.
5. Keep project-bound generated assets under `assets/images/paddle-pets/`.
6. Register every usable asset in `src/data/assets.js`.
7. Keep canvas fallbacks so a missing or failed image never blocks the run.

Recommended folders:

```text
assets/images/paddle-pets/p0/
assets/images/paddle-pets/p1/
assets/images/paddle-pets/p2/
assets/images/paddle-pets/pets/
assets/images/paddle-pets/ui/
assets/images/paddle-pets/backgrounds/
```

### Generation Rules

- Transparent PNG for sprites, projectiles, pickups, effects, enemies, bosses, and UI decals.
- 1920 x 1200 for 16:10 backgrounds.
- 960 x 600 for arena frame overlays.
- 256 x 64 or 512 x 128 for playable paddle pets.
- 128 x 48 for brick-like mini paddles.
- 64 x 64 for balls and small icons.
- 128 x 128 for upgrade icons and ability medallions.
- 384 x 192 or 512 x 256 for bosses.
- No watermarks.
- No readable text inside generated gameplay images.
- Center sprites with padding so glow and rotation do not clip.
- Prefer simplified hard-edged pet designs over fur/feather detail when the asset needs clean transparency.

### Prompt Template: Paddle Pet Sprite

```text
Use case: stylized-concept
Asset type: transparent gameplay sprite source for a browser canvas game
Primary request: a cute paddle-shaped pet based on <PET THEME>, with a long rounded capsule body and expressive face
Input images: Image 1 is the Paddle Pets style reference; Image 2 is the pet subject reference
Style/medium: glossy 2D fantasy game art, toy-like, chunky bevels, gold trim, jewel accents
Composition/framing: side-view horizontal sprite, centered, generous padding, readable at small size
Color palette: match the pet reference, with bright highlights and a dark-edge outline
Materials/textures: polished enamel, soft glow, gem inlays, simple readable decorative details
Text: none
Constraints: must clearly read as a paddle first and a pet second; no background; no watermark
Avoid: realistic fur detail, tiny text, thin fragile limbs, cluttered silhouette
```

For built-in transparent workflow, generate the source on a flat chroma-key background and remove it locally before committing the asset.

### Prompt Template: Paddle Brick

```text
Use case: stylized-concept
Asset type: transparent brick sprite for a browser canvas game
Primary request: a short mini-paddle brick themed around <ELEMENT OR PET>, with a rounded capsule shape
Input images: Image 1 is the Paddle Pets style reference
Style/medium: glossy 2D fantasy game art, toy-like, high contrast
Composition/framing: horizontal brick, same hitbox shape, centered with padding
Materials/textures: beveled enamel, gold pins, jewel core, simple cracks for damaged variants
Text: none
Constraints: readable at 128 x 48; same silhouette for healthy and damaged states
Avoid: readable lettering, busy background, irregular hitbox shape
```

### Prompt Template: UI Plaque

```text
Use case: ui-mockup
Asset type: reusable UI plaque/button texture
Primary request: a glossy rounded paddle-shaped fantasy button plaque
Input images: Image 1 is the Paddle Pets style reference
Style/medium: polished 2D game UI asset, chunky bevels, gold trim, jewel screws
Composition/framing: horizontal capsule plaque, empty center for live HTML text
Color palette: purple body, gold trim, cyan/magenta jewel accents
Text: none
Constraints: transparent background; leave the middle clean for CSS-rendered labels
Avoid: embedded words, watermark, complex background
```

## Micro-Phase Plan

This plan is intentionally small-chunked so work can stop and resume across short sessions. Each micro-phase should be safe to complete on its own, with a clear "done when" and a narrow validation step.

### Resume Rules

- Start each session by reading this section, then pick the first unchecked micro-phase.
- Do not start a later micro-phase until the current one has been validated or explicitly skipped.
- Keep each commit or work batch focused on one micro-phase when possible.
- Prefer visible, playable progress over broad asset generation.
- If a phase is too large once work starts, split it before continuing.
- Keep gameplay mechanics stable until the visual pass is proven in-game.

### Micro-Phase 0A: Lock Direction

Status: complete

Scope:

- Confirm whether the public title stays `Brick Breaker: Elemental Barrage` or moves toward `Paddle Pets`.
- Pick the first default hero pet: recommended `unicorn` for cute brand read or `dragon` for arcade/fire read.
- Confirm that pet abilities are visual flavor first, not new mechanics yet.

Done when:

- These decisions are written into this plan.

Validation:

- The next session can start asset/CSS work without asking brand-scope questions again.

### Micro-Phase 0B: Asset Folder Scaffold

Status: complete

Scope:

- Create `assets/images/paddle-pets/`.
- Add subfolders for `p0`, `p1`, `p2`, `pets`, `ui`, and `backgrounds`.
- Add an optional placeholder README in the asset folder if useful.

Done when:

- Folder structure exists in the repo under `assets/images/paddle-pets/`.

Validation:

- `find assets/images/paddle-pets -maxdepth 2 -type d` shows the expected folders.

### Micro-Phase 0C: Manifest Contract

Status: partial

Scope:

- Add Paddle Pets asset IDs to `src/data/assets.js` without deleting old IDs.
- Do not change renderer draw calls yet unless the asset aliases are clear.
- Include width, height, anchor, and fallback metadata for the first P0 asset IDs.

Suggested first IDs:

| Asset ID | Purpose |
| --- | --- |
| `bg_paddle_pets_castle_arena` | 1920 x 1200 arena background |
| `bg_paddle_pets_menu` | 1920 x 1200 menu/attract background |
| `arena_frame_paddle_pets` | 960 x 600 transparent frame overlay |
| `paddle_pet_unicorn` | First cute hero paddle pet |
| `paddle_pet_dragon` | Fire-themed alternate hero pet |
| `ball_paddle_normal` | Gem/star normal ball |
| `ball_paddle_fire` | Fire candy/gem ball |
| `brick_paddle_basic_healthy` | Basic mini-paddle brick |
| `brick_paddle_basic_damaged` | Damaged basic mini-paddle brick |
| `brick_paddle_armored_healthy` | Armored mini-paddle brick |
| `brick_paddle_armored_damaged` | Damaged armored mini-paddle brick |

Done when:

- `src/data/assets.js` has the first Paddle Pets manifest entries for `bg_paddle_pets_castle_arena`, `bg_paddle_pets_menu`, `paddle_basic`, `paddle_pet_unicorn`, and `paddle_pet_dragon`.

Validation:

- The game still loads when these files are missing, because fallbacks still handle unavailable images.

### Micro-Phase 1A: CSS Tokens Only

Status: not started

Scope:

- Update `:root` color tokens in `styles.css` toward the Paddle Pets palette.
- Avoid layout changes in this phase.
- Keep text readable and button states obvious.

Done when:

- The existing UI uses purple/gold/cyan/candy accents through variables.

Validation:

- Open the game and confirm menus remain readable before deeper restyling.

### Micro-Phase 1B: Buttons and Menu Plaques

Status: not started

Scope:

- Restyle primary buttons as rounded paddle plaques.
- Restyle `.overlay-panel` enough for main menu, pause, settings, and game over screens.
- Keep live HTML text, not generated text images.

Done when:

- Main menu visibly moves toward the `ee2` Paddle Pets button/sign style.

Validation:

- Continue, new run, settings, back, and menu buttons remain clickable and responsive.

### Micro-Phase 1C: HUD Plaques

Status: not started

Scope:

- Restyle `.hud-pill`, `.boss-hud`, boss meter, hearts, cannon indicator, and element chips.
- Keep compact sizing so HUD does not cover gameplay.

Done when:

- HUD elements read as small toy/paddle plaques without layout overlap.

Validation:

- Play one level and confirm the paddle, balls, and bricks remain visible under the HUD.

### Micro-Phase 1D: Upgrade and Store Cards

Status: not started

Scope:

- Restyle `.upgrade-card`, `.store-item`, `.coin-balance`, `.combo-card`, and reward summary chips.
- Keep long descriptions from overflowing.

Done when:

- Upgrade selection feels like pet ability plaques.

Validation:

- Trigger an upgrade screen and check all card text fits.

### Micro-Phase 2A: Canvas Fallback Paddle

Status: not started

Scope:

- Update `drawPlaceholderPaddle` to look like a Paddle Pets capsule.
- Add helper functions only if they reduce repeated drawing work.
- Keep the same paddle position, width, height, and collision behavior.

Done when:

- The player paddle looks like a simple pet paddle even with no images loaded.

Validation:

- Launch balls and confirm paddle bounce behavior is unchanged.

### Micro-Phase 2B: Canvas Fallback Bricks and Balls

Status: not started

Scope:

- Update `drawPlaceholderBrick` into mini-paddle bricks.
- Update `drawPlaceholderBall` into toy/gem balls.
- Keep damaged brick readability.

Done when:

- A no-asset run still looks Paddle Pets themed.

Validation:

- Start a level and confirm basic, armored, damaged, normal ball, and fire ball states are readable.

### Micro-Phase 2C: Canvas Fallback Bosses, Enemies, Hazards

Status: not started

Scope:

- Update boss/enemy/hazard fallback drawing to use paddle/capsule silhouettes.
- Keep attacks and danger zones visually distinct from friendly pickups.

Done when:

- Non-brick gameplay objects fit the Paddle Pets shape language.

Validation:

- Run far enough or use debug flow to see at least one boss/enemy/hazard state.

### Micro-Phase 3A: Generate First Pet Sprite Concepts

Status: complete

Scope:

- Generate only `unicorn` and `dragon` paddle sprite concepts first.
- Use `docs/images-ref/ee21da63-c3de-4cb6-ada0-26b995edbf0f.png` as the style reference.
- Use the matching pet card files as subject references.
- Save project-bound final assets under `assets/images/paddle-pets/pets/`.

Done when:

- Two generated pet sprites exist in the workspace:
  - `assets/images/paddle-pets/pets/paddle_pet_unicorn.png`
  - `assets/images/paddle-pets/pets/paddle_pet_dragon.png`

Validation:

- Inspect at gameplay scale, not just full size.

### Micro-Phase 3B: Wire One Pet Into Gameplay

Status: complete

Scope:

- Point the current default paddle art path to one chosen pet sprite.
- Keep or alias `paddle_basic` if that is less risky than changing renderer logic.
- Do not add pet selection yet.

Done when:

- The playable paddle uses the unicorn Paddle Pets sprite through the `paddle_basic` manifest alias.

Validation:

- Open a run and confirm the sprite is centered, not clipped, and bounce behavior is unchanged.

### Micro-Phase 3C: Generate First Arena Background

Status: complete

Scope:

- Generate one Paddle Pets castle/garden arena background.
- Keep the center low-noise so bricks and balls remain readable.
- Save under `assets/images/paddle-pets/backgrounds/`.

Done when:

- One generated arena background exists and is registered at `assets/images/paddle-pets/backgrounds/bg_paddle_pets_castle_arena.png`.

Validation:

- Start a level and confirm the background does not fight the gameplay objects.

### Micro-Phase 3D: Generate First Arena Frame

Status: not started

Scope:

- Generate or create one transparent arena frame overlay.
- Keep it decorative around the edges only.
- Save under `assets/images/paddle-pets/ui/` or `assets/images/paddle-pets/p0/`.

Done when:

- One frame overlay exists and is registered.

Validation:

- Frame shows arena bounds without covering HUD, paddle, balls, or bricks.

### Micro-Phase 3E: Generate First Brick and Ball Set

Status: not started

Scope:

- Generate normal/fire balls.
- Generate basic and armored mini-paddle bricks, healthy and damaged.
- Save under `assets/images/paddle-pets/p0/`.

Done when:

- The first P0 gameplay sprite set exists and is registered.

Validation:

- Start a level and confirm the generated sprites remain readable at actual canvas size.

### Micro-Phase 4A: Screenshot Review

Status: not started

Scope:

- Capture screenshots after the first visible style slice.
- Check main menu, active gameplay, upgrade select, pause, and store if available.

Done when:

- Screenshots are saved or reviewed in-session.

Validation:

- List specific readability issues before generating more assets.

### Micro-Phase 4B: First Playtest Pass

Status: not started

Scope:

- Run `npm run playtest:headed`.
- Watch for layout overlap, clipped sprites, bad contrast, and broken interactions.
- Do not fix unrelated gameplay balance issues in this phase unless the style pass caused them.

Done when:

- Playtest result is recorded.

Validation:

- Any style regressions are added as follow-up micro-phases.

### Micro-Phase 5A: Pet Theme Data

Status: not started

Scope:

- Add `src/data/paddlePets.js` only after one pet sprite works in-game.
- Store pet ID, name, asset ID, palette, reference path, and upgrade themes.
- Do not add new pet mechanics yet.

Done when:

- Pet data can drive visual selection later.

Validation:

- Existing saves and runs still work.

Suggested data shape:

```js
{
  id: "unicorn",
  name: "Lumistra",
  reference: "docs/images-ref/pets/unicorn.png",
  assetId: "paddle_pet_unicorn",
  palette: {
    primary: "#f6f1ff",
    accent: "#ff5bd8",
    glow: "#53d9ff",
    trim: "#ffc95a"
  },
  upgradeThemes: ["magic", "multiball", "shield", "fortune"]
}
```

### Micro-Phase 5B: Simple Pet Selection Placeholder

Status: not started

Scope:

- Add a minimal visual-only selection path, likely store or settings.
- Only switch paddle skin and UI accent.
- Do not add abilities yet.

Done when:

- The player can switch between two pet skins without changing mechanics.

Validation:

- Start a run with each pet and confirm save/load does not break.

### Micro-Phase 6A: Second Pet Batch

Status: not started

Scope:

- Generate three more pets only after the first two work in-game.
- Recommended next set: `phoenix`, `yeti`, `space-invader` for strong color contrast and gameplay themes.

Done when:

- Three more pet paddle sprites are available.

Validation:

- Review all five pets together at gameplay scale.

### Micro-Phase 6B: Ability Icon Batch

Status: not started

Scope:

- Generate or draw the first small ability icons for selected pets.
- Start with icons that map to existing upgrades.

Done when:

- First icon set exists and can be used by upgrade cards later.

Validation:

- Icons remain readable at 64 x 64 and 128 x 128.

### Micro-Phase 7A: Full Conversion Backlog

Status: not started

Scope:

- Convert remaining element balls, trails, effects, projectiles, pickups, hazards, enemies, and bosses in small future passes.
- Each future pass should cover one object family, not the whole game.

Done when:

- All gameplay object families have Paddle Pets assets or themed fallbacks.

Validation:

- Final full-game screenshot pass and headed playtest.

## Pet-Specific Style Plans

These are visual and upgrade-theme briefs based on the reference files in `docs/images-ref/pets/`.

| Pet Ref | Visual Plan | Upgrade/Gameplay Theme | First Assets |
| --- | --- | --- | --- |
| `angel.png` | White/gold winged paddle with halo rings and soft feather shapes simplified into clean arcs. | Healing, shields, second chances, blessing rewards. | Paddle sprite, shield icon, life icon, soft-gold hit flash. |
| `cerberus.png` | Dark three-headed guard paddle with ember eyes and bronze studs. Keep the three heads readable but compact. | Multi-hit, guarding, extra lives, triple-shot. | Paddle sprite, triple-bite projectile, guard shield icon. |
| `chimera.png` | Mixed creature paddle with lion face, serpent tail, and jewel sections split into multiple materials. | Hybrid element combos, adaptive upgrades, random bonus rolls. | Paddle sprite, combo icon, mixed-element ball trim. |
| `demon.png` | Red/black horned paddle with bat wings, lava glow, and sharp but rounded edges. | Fire damage, risk/reward, crit, burst damage. | Paddle sprite, fire ball skin, crit icon. |
| `dragon.png` | Red dragon paddle with horns, wings, scale panels, and tail flame. | Fire, cannon shots, burn, offensive scaling. | Paddle sprite, fire projectile, burn upgrade icon. |
| `fairy.png` | Pink translucent-wing paddle with sparkles, flowers, and soft gem glow. | Luck, pickups, gentle multiball, charm effects. | Paddle sprite, pickup charm, fortune icon. |
| `flipflop.png` | Comedic sandal-like paddle with beachy aqua trim and playful jewel straps. | Bounce control, ricochet, slipperiness, oddball utility. | Paddle sprite, bounce icon, water-splash trail. |
| `gargoyle.png` | Stone purple guardian paddle with carved scrollwork and small wings. | Armor, damage reduction, stationary defense, reflect. | Paddle sprite, stone shield icon, armored brick variant. |
| `gnome.png` | Small earthy paddle with hat, curls, garden metalwork, and warm green/gold trim. | Economy, repair, growth, store discounts. | Paddle sprite, coin icon, growth pickup. |
| `goblin.png` | Green gadget paddle with mischievous face, brass bits, and purple gem machinery. | Loot, cheap upgrades, traps, chaotic projectiles. | Paddle sprite, loot icon, trick-shot projectile. |
| `griffin.png` | White/gold winged lion-bird paddle with feather crest and regal trim. | Speed, aerial shots, precision, crit. | Paddle sprite, speed icon, wing-streak trail. |
| `hydra.png` | Aquatic green multi-neck paddle with several heads implied by decorative arcs. | Multiball, chain reactions, regeneration, poison/acid. | Paddle sprite, acid ball trim, chain icon. |
| `kraken.png` | Blue ocean paddle with tentacles as decorative curls and pearl/gold inlays. | Pull fields, slow zones, splash damage, control. | Paddle sprite, pull-field icon, bubble projectile. |
| `minotaur.png` | Bronze/brown horned paddle with maze patterns and sturdy hoof-like endcaps. | Charge, impact damage, boss damage, toughness. | Paddle sprite, charge icon, heavy impact effect. |
| `paladin.png` | White/gold knight paddle with shield crest and clean holy glow. | Shielding, block charges, sturdy paddle, safe upgrades. | Paddle sprite, holy shield icon, block pop effect. |
| `pegasus.png` | White winged paddle with blue/gold accents and cloud-like motion trim. | Speed, ball recovery, graceful redirects, air trails. | Paddle sprite, cloud trail, recovery icon. |
| `phoenix.png` | Firebird paddle with flame-feather tail and bright orange/gold glow. | Revive, ember trails, burn, comeback mechanics. | Paddle sprite, revive icon, ember trail. |
| `sasquatch.png` | Forest paddle with leafy fur shapes simplified into mossy carved panels. | Strength, stomp effects, nature shields, sturdy play. | Paddle sprite, stomp icon, forest brick skin. |
| `space-invader.png` | Neon arcade paddle with pixel face, antennae, and cosmic purple glow. | Laser shots, score multipliers, shields, arcade bonuses. | Paddle sprite, laser projectile, pixel upgrade icon. |
| `unicorn.png` | White rainbow paddle with horn, mane, heart gem, and sparkly trim. | Magic, rainbow elements, charm, rare upgrade luck. | Paddle sprite, rainbow ball, magic icon. |
| `werewolf.png` | Moonlit grey paddle with claw marks, crescent gem, and icy blue highlights. | Speed bursts, frenzy, crit, night-themed damage. | Paddle sprite, claw icon, moon trail. |
| `yeti.png` | Frosty white-blue paddle with snow puffs, ice gems, and chunky cold trim. | Frost, slow, freeze, defensive chill. | Paddle sprite, frost ball, freeze icon. |

## Implementation Details

### Renderer

- Keep hitboxes from entity dimensions, not image content.
- Add reusable canvas helpers for Paddle Pets fallbacks:
  - `drawPaddleCapsule`
  - `drawGemInset`
  - `drawPetFace`
  - `drawToyHighlight`
  - `drawMiniPaddleBrick`
- Update `drawAttractScene` so menu background demos the new style even when generated assets are missing.
- Add asset IDs by theme first, then switch existing draw calls once assets exist.
- For element balls, allow `ball_<element>` to fall back to pet-styled canvas balls before generated replacements arrive.

### CSS/UI

- Replace the current green utilitarian surface treatment with glossy purple/gold/cyan paddle plaques.
- Restyle `.overlay-panel`, `.button-stack button`, `.hud-pill`, `.upgrade-card`, `.store-item`, `.combo-card`, `.boss-hud`, and `.reward-summary span`.
- Keep cards and panels compact enough for the 16:10 arena overlay.
- Render labels live in HTML. Generated UI plaques should be blank decorative assets or pure CSS.
- Ensure long upgrade descriptions still fit on small screens.

### Data

- Add a pet theme data file only when the UI needs to select between pets.
- Keep old asset IDs available until all references are migrated.
- Consider aliases if gameplay code should keep asking for `paddle_basic` while the manifest points to the current selected pet asset.
- Add pet-specific upgrade metadata later, after the visual pass proves itself.

### Asset Manifest

Example entries:

```js
{
  id: "paddle_pet_unicorn",
  path: "./assets/images/paddle-pets/pets/paddle_pet_unicorn.png",
  width: 512,
  height: 128,
  anchor: { x: 0.5, y: 0.5 },
  fallback: { kind: "paddlePet", fill: "#f6f1ff", accent: "#ff5bd8", trim: "#ffc95a" },
}
```

```js
{
  id: "brick_paddle_basic_healthy",
  path: "./assets/images/paddle-pets/p0/brick_paddle_basic_healthy.png",
  width: 128,
  height: 48,
  fallback: { kind: "miniPaddleBrick", fill: "#7a3fe0", accent: "#ffc95a" },
}
```

## Validation Checklist

- Main menu immediately reads as "Paddle Pets" without needing explanatory text.
- The player paddle, bricks, bosses, enemies, hazards, pickups, and UI controls all share the paddle/capsule language.
- Gameplay readability is at least as good as the current placeholders.
- Collision behavior is unchanged.
- Missing generated assets still produce usable canvas fallbacks.
- No generated asset contains important embedded text.
- Canvas and overlays fit inside desktop and mobile viewports.
- `npm run playtest:headed` can run through multiple levels after the style pass.
- Screenshots are taken for at least desktop 16:10, laptop-ish, and narrow mobile layouts.

## Risks

- Generated pet art may be too detailed for small gameplay sprites. Mitigation: generate simplified sprite variants, not card-art crops.
- Text inside generated images may be misspelled. Mitigation: no required text in generated images.
- Transparent edges may be messy for furry or feathery pets. Mitigation: simplify those silhouettes or use the CLI native-transparency fallback only after explicit approval.
- The game can become visually busy. Mitigation: keep the playfield center darker and quieter than menu/collection screens.
- A full pet system can grow too large. Mitigation: ship visual skins first, mechanics later.

## Next Pickup

Start with `Micro-Phase 1A: CSS Tokens Only`, `Micro-Phase 3D: Generate First Arena Frame`, or `Micro-Phase 3E: Generate First Brick and Ball Set`.

Recommended answers if no one has a stronger preference:

- The app and repo are now named `Paddle Pets`.
- `unicorn` is the default pet.
- `dragon` is the first alternate.
- The next asset batch should be either the Paddle Pets arena background/frame or the first brick/ball set.
- Ship visual skins first. Save pet-specific powers for a later mechanics pass.

## Session Handoff Template

Paste or update this at the top of a future work note when stopping midstream:

```text
Current micro-phase:
Status:
Files touched:
What changed:
Validation run:
Open issues:
Next exact step:
```

## Tiny Batch Rule

When in doubt, do one of these and stop:

- one CSS surface group
- one canvas fallback family
- one generated sprite
- one manifest batch
- one screenshot review
- one headed playtest

That keeps the style update easy to pick up after context resets or short sessions.

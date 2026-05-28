# Upgrade Catalog

Status: v0.26 implementation catalog plus future design notes. The `Current Code Behavior` columns describe what the code actually does today.

Core direction:
- Permanent upgrades are long-term stat, utility, cannon, safety, and economy upgrades.
- Brick reward drops use the same upgrade list as the store, but only for the current run.
- Boss upgrade screens are element-only.
- All 12 base elements are in the v0.26 implementation target.
- Element upgrades reset at the end of a run.
- Temporary upgrades stay removed for the current test direction.

Current reward tile letters can be replaced per upgrade later.

## Permanent Upgrades

Permanent upgrades are bought or earned outside the run loop and apply at the start of every level. Store costs double each stack:

`stack cost = first cost * 2^(stack number - 1)`

The final cost below is the price of buying the last stack, not the total cost of maxing the upgrade.

| Upgrade | ID | Icon | Effect | Gameplay Behavior | Max Stacks | First Cost | Final Cost |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Ball Damage | `perm_ball_damage` | `D` | +1 ball damage forever | Raises base ball hit damage. Cannon damage also rises because cannon shots scale from current ball damage. | 25 | 25 coins | 419,430,400 coins |
| Ball Speed | `perm_ball_speed` | `S` | +8 ball speed forever | Raises ball speed at level start and when stats refresh. Ball speed still respects max-speed caps. | 15 | 25 coins | 409,600 coins |
| Extra Ball | `perm_extra_ball` | `B` | +1 launched ball forever | Raises starting/target ball count. Missing balls spawn from the paddle when the level or stat refresh needs them. | 10 | 80 coins | 40,960 coins |
| Shield Charge | `perm_shield_charge` | `H` | +1 shielded relaunch each level forever | Adds one shield charge each level. If all balls are lost, a shield is consumed, balls respawn, and no heart is lost. | 3 | 100 coins | 400 coins |
| Cannon Unlock | `perm_cannon_unlock` | `C` | Unlock paddle cannon forever | Enables Space-bar cannon fire once balls are launched. Cannon uses current elements but is permanent utility, not a run reward. | 1 | 250 coins | 250 coins |
| Cannon Power | `perm_cannon_power` | `CP` | +0.12 cannon damage multiplier | Cannon shots hit harder. Damage still scales from current ball damage. | 3 | 150 coins | 600 coins |
| Cannon Cooldown | `perm_cannon_cooldown` | `CC` | -0.18 cannon cooldown | Cannon can fire more often, respecting a minimum cooldown cap. | 3 | 150 coins | 600 coins |
| Cannon Splitter | `perm_cannon_splitter` | `CS` | +1 cannon projectile | Cannon fires additional spread shots. Projectile count has a cap. | 2 | 300 coins | 600 coins |
| Pierce Training | `perm_pierce_training` | `P` | +5% non-boss pierce chance | Gives balls a permanent chance to pass through non-boss targets instead of bouncing. Bosses cannot be pierced. | 5 | 120 coins | 1,920 coins |

## Run-Scoped Brick Drops

Brick reward drops use the same upgrade types and effects as the store, but the stacks only last for the current run.

Example:
- Store has `+1 Ball Damage`.
- A brick drop gives `+1 Ball Damage` for the current run.
- Effective damage for that run is store damage plus run-drop damage.
- When the run ends, the run-drop damage disappears.

Cap and fallback rules:
- Store stacks and run-scoped brick-drop stacks share the same max-stack cap.
- If the store already has an upgrade maxed, that upgrade does not spawn from brick rewards.
- If store stacks plus current run stacks reach an upgrade's max, that upgrade stops spawning for the rest of the run.
- If no run-scoped brick upgrades are available, the reward block spawns a coin bag.
- Coin bag value is 10% of the boss coin reward for that stage set.
- For v0.26, boss rewards are 1000 coins, so exhausted-pool coin bags are 100 coins.

| Drop | ID | Icon | Effect | Run Behavior |
| --- | --- | --- | --- | --- |
| Ball Damage | `run_ball_damage` | `D` | +1 ball damage this run | Stacks on top of store damage until the run ends. |
| Ball Speed | `run_ball_speed` | `S` | +8 ball speed this run | Stacks on top of store speed until the run ends. |
| Extra Ball | `run_extra_ball` | `B` | +1 launched ball this run | Adds one run-only ball on top of store ball count. |
| Shield Charge | `run_shield_charge` | `H` | +1 shielded relaunch each level this run | Adds one run-only shield charge per level. |
| Cannon Power | `run_cannon_power` | `CP` | +0.12 cannon damage multiplier this run | Improves cannon damage until the run ends. |
| Cannon Cooldown | `run_cannon_cooldown` | `CC` | -0.18 cannon cooldown this run | Improves cannon cadence until the run ends. |
| Cannon Splitter | `run_cannon_splitter` | `CS` | +1 cannon projectile this run | Adds a run-only cannon projectile until the run ends. |
| Pierce Training | `run_pierce_training` | `P` | +5% non-boss pierce chance this run | Adds run-only pierce chance until the run ends. |

## Removed Or Parked Upgrades

These are not part of the active catalog.

| Upgrade | Previous ID | Reason |
| --- | --- | --- |
| Larger Paddle | `paddle_width` / `perm_guard_core` | Parked because the smaller paddle made boss dodging and positioning more interesting. |
| Critical Chance | `crit_chance` / `perm_focus_core` | Parked because crit is harder to read than damage, balls, shields, cannon, and elements. |
| Temporary Rewards | `temp_*` / `bonus_*` | Parked because temporary rewards felt unclear and uneven. |

## Boss Element Choices

Boss clears show an upgrade screen with three element choices. Elements do not persist after the run ends.

Element ownership rules:
- Each base element can be earned once per run.
- Base elements do not stack.
- Base elements do not have stronger versions.
- Once the player owns an element, that element leaves the boss choice pool.

Family rarity:

| Family | Rarity | Weight |
| --- | --- | --- |
| Classic | Common | 70% |
| Arcade Physics | Uncommon | 25% |
| Mystic Material | Rare | 5% |

If a family has no unowned elements left, the boss choice generator rerolls or normalizes into families that still have unowned elements.

Implementation note:
- `addRunElement()` stores the `element_*` ID on `activeRun.ownedElements`.
- `applyOwnedElementStats()` maps owned base elements into ball element IDs on `stats.activeElements`.
- The first owned ball element becomes `stats.element`, which controls the primary ball/projectile visual, trail color, hit color, base damage multiplier, and target weakness/resistance lookup.
- `ElementSystem.applyElementEffect()` only has bespoke status logic for legacy Fire/Lightning/Frost/Acid effects, and Fire only burns when `game.stats.burnPower > 0`. Boss-picked Fire does not add `burnPower`, so Fire does not burn by itself in v0.26.
- Non-primary owned elements are still listed in `stats.activeElements` for HUD/combo detection, but most do not currently add hit behavior.

| Element | ID | Icon | Family | Identity | Brick Breaker Role | Run Behavior | Current Code Behavior |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Fire | `element_fire` | `F` | Classic | Heat, burn, eruption | Damage over time, explosive clears | Adds burn effects, flame spread hooks, and fire combo access. | Adds `fire` to `stats.activeElements` and combo detection. If first owned, becomes primary `stats.element` for Fire visuals and weakness/resistance lookup. Does not burn unless some other upgrade adds `burnPower > 0`; boss Fire does not. |
| Water | `element_water` | `W` | Classic | Flow, soak, spread | Chaining, cleansing, splash damage | Adds splash effects, wet marks, cleanse hooks, and water combo access. | Adds `water` to `stats.activeElements` and combo detection. If first owned, gives Water visuals and weakness/resistance lookup. No splash, cleanse, wet mark, or status code yet. |
| Wind | `element_wind` | `N` | Classic | Motion, lift, direction | Ball speed, curve, multiball nudges | Adds gust effects, directional nudges, curve hooks, and wind combo access. | Adds `wind` to `stats.activeElements` and combo detection. If first owned, gives Wind visuals and weakness/resistance lookup. No speed, curve, gust, or nudge code yet. |
| Earth | `element_earth` | `E` | Classic | Stone, weight, armor | Durability, shields, impact damage | Adds heavy impacts, tremor hooks, defensive hooks, and earth combo access. | Adds `earth` to `stats.activeElements` and combo detection. If first owned, gives Earth visuals, weakness/resistance lookup, and `baseDamageMultiplier: 1.02`. No tremor, shield, or armor code yet. |
| Spark | `element_spark` | `K` | Arcade Physics | Energy, charge, chain reactions | Arcs, speed, conductive hits | Adds chain arcs, charge marks, speed hooks, and spark combo access. | Adds `spark` to `stats.activeElements` and combo detection. If first owned, gives Spark visuals, weakness/resistance lookup, and `baseDamageMultiplier: 0.98`. No arc/chain/static code yet; legacy chain code is for `lightning`, not `spark`. |
| Resin | `element_resin` | `R` | Arcade Physics | Sticky growth, binding | Slows, traps, coats bricks | Adds sticky coatings, linked-brick hooks, slow zones, and resin combo access. | Adds `resin` to `stats.activeElements` and combo detection. If first owned, gives Resin visuals and weakness/resistance lookup. No sticky, slow, coating, or linked-brick code yet. |
| Echo | `element_echo` | `O` | Arcade Physics | Sound, vibration, repetition | Delayed hits, pulse waves | Adds delayed repeat-hit hooks, pulse waves, and echo combo access. | Adds `echo` to `stats.activeElements` and combo detection. If first owned, gives Echo visuals and weakness/resistance lookup. No repeat-hit or pulse code yet. |
| Gravity | `element_gravity` | `G` | Arcade Physics | Pull, mass, orbit | Curve shots, wells, compression | Adds gravity wells, pull effects, orbit hooks, and gravity combo access. | Adds `gravity` to `stats.activeElements` and combo detection. If first owned, gives Gravity visuals, weakness/resistance lookup, and `baseDamageMultiplier: 1.01`. No pull, curve, orbit, or compression code yet. |
| Ash | `element_ash` | `A` | Mystic Material | Decay, ember, erosion | Weakens bricks, spreads ruin | Adds decay marks, armor weakening hooks, and ash combo access. | Adds `ash` to `stats.activeElements` and combo detection. If first owned, gives Ash visuals and weakness/resistance lookup. No decay or armor-weakening code yet. |
| Glass | `element_glass` | `L` | Mystic Material | Reflection, fracture, prism | Splitting, ricochet, crit shards | Adds shard splitting, ricochet hooks, prism effects, and glass combo access. | Adds `glass` to `stats.activeElements` and combo detection. If first owned, gives Glass visuals, weakness/resistance lookup, and `baseDamageMultiplier: 0.99`. No split, ricochet, or prism code yet. |
| Mist | `element_mist` | `M` | Mystic Material | Haze, diffusion, concealment | Phasing, soft spread, blur effects | Adds haze fields, phase hooks, soft area damage, and mist combo access. | Adds `mist` to `stats.activeElements` and combo detection. If first owned, gives Mist visuals, weakness/resistance lookup, and `baseDamageMultiplier: 0.98`. No haze, phase, blur, or soft area damage code yet. |
| Iron | `element_iron` | `I` | Mystic Material | Metal, magnetism, force | Armor, attraction, heavy impact | Adds magnetic pull, heavy impact hooks, armor interactions, and iron combo access. | Adds `iron` to `stats.activeElements` and combo detection. If first owned, gives Iron visuals, weakness/resistance lookup, and `baseDamageMultiplier: 1.03`. No magnet, armor, or heavy-impact code yet. |

## Element Combo Rules

Design rule:
- 2-type combos are specific named reactions.
- 3-type combos are advanced reactions based on dominant family.
- 4-type combos are major super reactions.
- Collecting all 12 base elements activates `The First Break`.

The game does not need every combo to be equally common.

Activation rule:
- Combos trigger immediately when the player owns the required elements.
- Base element effects remain active while owned for the run.
- Combo effects collapse upward instead of stacking every matching pair at once.
- The active combo is the highest-order matching combo available from the player's current elements.
- Example: Fire + Water activates `Steam`; adding Earth changes the active combo to `Geyserstone` instead of keeping `Steam`, `Magma`, and `Mud` active.
- Example: Fire + Water + Wind activates `Monsoon Flame` instead of keeping `Steam`, `Wildfire`, and `Tempest` active.
- If the player collects all 12 base elements in a normal run, `The First Break` activates immediately.
- New combo discovery briefly pauses gameplay for a large explosion-style reveal with the combo name.
- After the reveal, active elements and the active combo appear in the same side UI panel.
- Base elements show compact icons/statuses; the active combo shows its name and catalog description.
- Combo reactions are not separate reward picks.
- Current code: combos are detection, reveal, save state, and HUD display only. There is no combo-specific damage, movement, status, board clear, or special reaction hook in `ElementSystem`, `CollisionSystem`, or `BossSystem` yet.

## Two-Type Combo Reactions

Column shorthand:
- `Detection/UI only` means the combo exists in `ELEMENT_COMBOS`, can be selected by `getActiveElementCombo()`, writes `activeRun.activeComboId`, queues the pause/reveal overlay, and appears in the HUD. It does not currently change damage, movement, statuses, or target behavior.

### Classic + Classic

| Combo | Result | Gameplay Effect | Current Code Behavior |
| --- | --- | --- | --- |
| Fire + Water | Steam | Creates fog clouds that hide brick states but deal area tick damage. | Detection/UI only. |
| Fire + Wind | Wildfire | Flames spread rapidly across adjacent bricks after each bounce. | Detection/UI only. |
| Fire + Earth | Magma | Bricks melt into lava zones that damage nearby bricks over time. | Detection/UI only. |
| Water + Wind | Tempest | Ball gains swirling movement and splash damage on impact. | Detection/UI only. |
| Water + Earth | Mud | Slows ball briefly but makes hits heavier and more damaging. | Detection/UI only. |
| Wind + Earth | Duststorm | Creates abrasive clouds that chip many bricks at once. | Detection/UI only. |

### Arcade + Arcade

| Combo | Result | Gameplay Effect | Current Code Behavior |
| --- | --- | --- | --- |
| Spark + Resin | Ambercharge | Sticky conductive arcs jump between coated bricks. | Detection/UI only. |
| Spark + Echo | Thunderloop | Hits repeat after a delay, creating rhythm-chain damage. | Detection/UI only. |
| Spark + Gravity | Magnetar | Ball curves toward nearby bricks with charged gravity. | Detection/UI only. |
| Resin + Echo | Harmonic Bloom | Resonant cracks spread outward from sticky impact points. | Detection/UI only. |
| Resin + Gravity | Tar Pit | Creates slow gravity sludge zones that increase impact damage. | Detection/UI only. |
| Echo + Gravity | Pulsewell | A vortex pulls effects inward, then releases a shockwave. | Detection/UI only. |

### Mystic + Mystic

| Combo | Result | Gameplay Effect | Current Code Behavior |
| --- | --- | --- | --- |
| Ash + Glass | Obsidian | Creates brittle black shards that burst into piercing fragments. | Detection/UI only. |
| Ash + Mist | Smog | A decaying cloud damages hidden or shielded bricks. | Detection/UI only. |
| Ash + Iron | Rust | Weakens armored bricks and spreads corrosion. | Detection/UI only. |
| Glass + Mist | Mirage | Ball creates false copies that deal light phantom hits. | Detection/UI only. |
| Glass + Iron | Shardsteel | Ball gains razor armor, piercing through one extra brick. | Detection/UI only. |
| Mist + Iron | Mercury | Metallic liquid trails follow the ball and strike delayed targets. | Detection/UI only. |

### Fire Cross-Set Combos

| Combo | Result | Gameplay Effect | Current Code Behavior |
| --- | --- | --- | --- |
| Fire + Spark | Plasma | High-speed burning arcs jump to nearby bricks. | Detection/UI only. |
| Fire + Resin | Napalm | Sticky fire clings to bricks and burns in clusters. | Detection/UI only. |
| Fire + Echo | Detonation | Each hit sends out a small explosive sound burst. | Detection/UI only. |
| Fire + Gravity | Solar Well | A burning gravity field pulls bricks and effects inward. | Detection/UI only. |
| Fire + Ash | Emberrot | Burned bricks become brittle and easier to destroy. | Detection/UI only. |
| Fire + Glass | Sunshard | Splits the ball into burning prism fragments. | Detection/UI only. |
| Fire + Mist | Scaldcloud | Steam-like haze deals soft area damage. | Detection/UI only. |
| Fire + Iron | Forge | Ball becomes molten metal, gaining heavy piercing hits. | Detection/UI only. |

### Water Cross-Set Combos

| Combo | Result | Gameplay Effect | Current Code Behavior |
| --- | --- | --- | --- |
| Water + Spark | Surge | Electrified splash chains through wet bricks. | Detection/UI only. |
| Water + Resin | Sapflow | Sticky streams link bricks into damage-sharing clusters. | Detection/UI only. |
| Water + Echo | Sonar | Reveals weak points and causes rippling damage waves. | Detection/UI only. |
| Water + Gravity | Tidewell | Ball movement bends like a tide around gravity pools. | Detection/UI only. |
| Water + Ash | Lye | Cleanses buffs from enemy bricks and corrodes them. | Detection/UI only. |
| Water + Glass | Lens | Refracts the ball into angled duplicates. | Detection/UI only. |
| Water + Mist | Fog | Softens the board, allowing partial phasing through bricks. | Detection/UI only. |
| Water + Iron | Quicksilver | Ball gains fluid metallic trails that auto-target cracked bricks. | Detection/UI only. |

### Wind Cross-Set Combos

| Combo | Result | Gameplay Effect | Current Code Behavior |
| --- | --- | --- | --- |
| Wind + Spark | Ionstorm | Charged gusts redirect the ball into chain hits. | Detection/UI only. |
| Wind + Resin | Pollenbind | Sticky spores drift across the board and attach to bricks. | Detection/UI only. |
| Wind + Echo | Resonance | Air pulses repeat impacts in widening rings. | Detection/UI only. |
| Wind + Gravity | Orbit | Ball curves around gravity pockets before snapping outward. | Detection/UI only. |
| Wind + Ash | Cinderstorm | Ash clouds sweep across rows, weakening bricks. | Detection/UI only. |
| Wind + Glass | Razorwind | Shard gusts slice through thin or cracked bricks. | Detection/UI only. |
| Wind + Mist | Vaportrail | Ball leaves a drifting trail that softly damages bricks. | Detection/UI only. |
| Wind + Iron | Maglev | Ball hovers and accelerates along magnetic wind lanes. | Detection/UI only. |

### Earth Cross-Set Combos

| Combo | Result | Gameplay Effect | Current Code Behavior |
| --- | --- | --- | --- |
| Earth + Spark | Fulgurite | Lightning crystallizes stone, creating explosive weak points. | Detection/UI only. |
| Earth + Resin | Rootstone | Bricks bind together and share damage through root veins. | Detection/UI only. |
| Earth + Echo | Quake | Impact sends tremors through nearby bricks. | Detection/UI only. |
| Earth + Gravity | Corecrush | Heavy gravity compresses bricks for massive impact damage. | Detection/UI only. |
| Earth + Ash | Graveclay | Damaged bricks crumble into spreading decay zones. | Detection/UI only. |
| Earth + Glass | Crystal | Creates reflective crystal bricks that split shots. | Detection/UI only. |
| Earth + Mist | Marsh | Slows the ball but makes every hit splash damage. | Detection/UI only. |
| Earth + Iron | Ore | Creates armored bricks that explode when finally broken. | Detection/UI only. |

### Arcade + Mystic Cross-Set Combos

| Combo | Result | Gameplay Effect | Current Code Behavior |
| --- | --- | --- | --- |
| Spark + Ash | Cindercharge | Electric decay jumps to weakened bricks. | Detection/UI only. |
| Spark + Glass | Prismbolt | Lightning splits into colored ricochet beams. | Detection/UI only. |
| Spark + Mist | Static Haze | A charged mist randomly zaps nearby bricks. | Detection/UI only. |
| Spark + Iron | Magnetron | Ball magnetizes and fires electric pulses on contact. | Detection/UI only. |
| Resin + Ash | Pitch | Sticky black tar weakens and slows bricks or effects. | Detection/UI only. |
| Resin + Glass | Amberglass | Sticky crystal coating stores damage, then shatters. | Detection/UI only. |
| Resin + Mist | Sporecloud | Sticky fog spreads status effects across the board. | Detection/UI only. |
| Resin + Iron | Ferrothorn | Metal vines bind bricks and deal thorn damage. | Detection/UI only. |
| Echo + Ash | Dirge | Sound waves decay bricks with each repeated pulse. | Detection/UI only. |
| Echo + Glass | Chime | Crystal tones create delayed shard impacts. | Detection/UI only. |
| Echo + Mist | Whisper | Invisible pulse hits appear after short delays. | Detection/UI only. |
| Echo + Iron | Resonant Steel | Metal bricks hum, storing damage before releasing it. | Detection/UI only. |
| Gravity + Ash | Blackfall | Decaying gravity wells crush weakened bricks. | Detection/UI only. |
| Gravity + Glass | Event Prism | Gravity bends shard paths into curved ricochets. | Detection/UI only. |
| Gravity + Mist | Nebula | A cosmic fog bends the ball and hides target zones. | Detection/UI only. |
| Gravity + Iron | Ironstar | Heavy magnetic gravity pulls the ball into brutal impacts. | Detection/UI only. |

## Three-Type Combo Reactions

Three-type reactions use family-based reactions instead of listing every possible combination.

### Classic Triads

| Combo | Result | Gameplay Effect | Current Code Behavior |
| --- | --- | --- | --- |
| Fire + Water + Wind | Monsoon Flame | A hot storm spreads burning splash damage. | Detection/UI only. |
| Fire + Water + Earth | Geyserstone | Impact erupts upward, launching damage columns. | Detection/UI only. |
| Fire + Wind + Earth | Volcanic Storm | Dust and flame sweep rows after hard impacts. | Detection/UI only. |
| Water + Wind + Earth | Tsunami Clay | Heavy waves roll across the lower board. | Detection/UI only. |

### Arcade Triads

| Combo | Result | Gameplay Effect | Current Code Behavior |
| --- | --- | --- | --- |
| Spark + Resin + Echo | Singing Amber | Sticky trails pulse and chain damage. | Detection/UI only. |
| Spark + Resin + Gravity | Star Sap | Gravity wells trap bricks, then discharge lightning. | Detection/UI only. |
| Spark + Echo + Gravity | Storm Chorus | Orbiting echo-bolts strike after each bounce. | Detection/UI only. |
| Resin + Echo + Gravity | Deep Root | Bound bricks share damage through heavy pulses. | Detection/UI only. |

### Mystic Triads

| Combo | Result | Gameplay Effect | Current Code Behavior |
| --- | --- | --- | --- |
| Ash + Glass + Mist | Black Mirage | Phantom shards drift through bricks, leaving decay. | Detection/UI only. |
| Ash + Glass + Iron | Obsidian Forge | Heavy black shards pierce and corrode. | Detection/UI only. |
| Ash + Mist + Iron | Rustveil | A metallic fog corrodes armored bricks. | Detection/UI only. |
| Glass + Mist + Iron | Mercury Prism | Liquid mirror trails split and rejoin around targets. | Detection/UI only. |

## Four-Type And Ultimate Combo Reactions

| Set | Combo | Result | Gameplay Effect | Current Code Behavior |
| --- | --- | --- | --- | --- |
| Classic | Fire + Water + Wind + Earth | Worldheart | A full-board elemental surge: burn, splash, gust, and quake all trigger. | Detection/UI only. |
| Arcade | Spark + Resin + Echo + Gravity | Singularity Bloom | All marks collapse into one point, then explode into arcs, waves, cracks, and pull effects. | Detection/UI only. |
| Mystic | Ash + Glass + Mist + Iron | Obsidian Dawn | Dark glass fog forms, then shatters into rusting fragments across the board. | Detection/UI only. |
| All 12 | Every base element | The First Break | The board is marked, the ball splits into elemental echoes, gravity bends the arena, and a final prism shockwave clears everything below a damage threshold. | Detection/UI only: `activeComboId` becomes `the_first_break`; there is no board clear, echo split, gravity bend, or threshold shockwave code yet. |

## Reward Source Shape

Normal brick reward blocks:
- Drop run-scoped versions of store upgrades.
- Do not drop elements.
- Drop 100-coin fallback bags only when no valid run-scoped upgrade remains.
- Apply instantly through the paddle absorption animation.

Boss upgrade screens:
- Offer three element choices when at least three unowned elements remain.
- Use Classic/Common 70%, Arcade/Uncommon 25%, and Mystic/Rare 5% family weighting.
- Award 1000 coins on boss clear for v0.26.
- Never offer an element already owned this run.
- Fill missing choice slots with coin rewards when fewer than three unowned elements remain.
- Offer coin fallback choices only after every remaining unowned element has already been included in that screen.
- Do not show after the level 100 boss because the run ends.

Campaign note:
- The campaign stays capped at 100 levels.
- Boss-only element picks may not make all 12 elements reachable yet.
- `The First Break` remains in the catalog for testing once another path to 12 elements exists.

## Current Code Note

The old `run_*_attunement` draft IDs are not active in v0.26. Boss choices use the `element_*` IDs in the Boss Element Choices table.

Current implemented element/combo scope:
- Boss choices award run-only base elements through `elementChoice` rewards.
- Owned elements are saved on `activeRun.ownedElements` and reset when the run ends.
- Owned elements feed `stats.activeElements`, HUD element chips, combo matching, and primary ball visuals/damage lookup.
- Combo data, detection, active-combo replacement, reveal queueing, save normalization, and HUD display are implemented.
- Bespoke gameplay reactions for Water/Wind/Earth/Spark/Resin/Echo/Gravity/Ash/Glass/Mist/Iron and all named combos are not implemented yet.
- Fire's burn data exists in `ballElements.js`, but the burn effect only runs when `burnPower > 0`; boss-picked Fire does not currently grant `burnPower`.

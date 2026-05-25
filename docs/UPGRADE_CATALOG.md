# Upgrade Catalog

Status: Design catalog. This shows the chosen upgrade split, run-scoped brick drops, and boss element choice system. No gameplay code has been changed to match this yet.

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

| Element | ID | Icon | Family | Identity | Brick Breaker Role | Run Behavior |
| --- | --- | --- | --- | --- | --- | --- |
| Fire | `element_fire` | `F` | Classic | Heat, burn, eruption | Damage over time, explosive clears | Adds burn effects, flame spread hooks, and fire combo access. |
| Water | `element_water` | `W` | Classic | Flow, soak, spread | Chaining, cleansing, splash damage | Adds splash effects, wet marks, cleanse hooks, and water combo access. |
| Wind | `element_wind` | `N` | Classic | Motion, lift, direction | Ball speed, curve, multiball nudges | Adds gust effects, directional nudges, curve hooks, and wind combo access. |
| Earth | `element_earth` | `E` | Classic | Stone, weight, armor | Durability, shields, impact damage | Adds heavy impacts, tremor hooks, defensive hooks, and earth combo access. |
| Spark | `element_spark` | `K` | Arcade Physics | Energy, charge, chain reactions | Arcs, speed, conductive hits | Adds chain arcs, charge marks, speed hooks, and spark combo access. |
| Resin | `element_resin` | `R` | Arcade Physics | Sticky growth, binding | Slows, traps, coats bricks | Adds sticky coatings, linked-brick hooks, slow zones, and resin combo access. |
| Echo | `element_echo` | `O` | Arcade Physics | Sound, vibration, repetition | Delayed hits, pulse waves | Adds delayed repeat-hit hooks, pulse waves, and echo combo access. |
| Gravity | `element_gravity` | `G` | Arcade Physics | Pull, mass, orbit | Curve shots, wells, compression | Adds gravity wells, pull effects, orbit hooks, and gravity combo access. |
| Ash | `element_ash` | `A` | Mystic Material | Decay, ember, erosion | Weakens bricks, spreads ruin | Adds decay marks, armor weakening hooks, and ash combo access. |
| Glass | `element_glass` | `L` | Mystic Material | Reflection, fracture, prism | Splitting, ricochet, crit shards | Adds shard splitting, ricochet hooks, prism effects, and glass combo access. |
| Mist | `element_mist` | `M` | Mystic Material | Haze, diffusion, concealment | Phasing, soft spread, blur effects | Adds haze fields, phase hooks, soft area damage, and mist combo access. |
| Iron | `element_iron` | `I` | Mystic Material | Metal, magnetism, force | Armor, attraction, heavy impact | Adds magnetic pull, heavy impact hooks, armor interactions, and iron combo access. |

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

## Two-Type Combo Reactions

### Classic + Classic

| Combo | Result | Gameplay Effect |
| --- | --- | --- |
| Fire + Water | Steam | Creates fog clouds that hide brick states but deal area tick damage. |
| Fire + Wind | Wildfire | Flames spread rapidly across adjacent bricks after each bounce. |
| Fire + Earth | Magma | Bricks melt into lava zones that damage nearby bricks over time. |
| Water + Wind | Tempest | Ball gains swirling movement and splash damage on impact. |
| Water + Earth | Mud | Slows ball briefly but makes hits heavier and more damaging. |
| Wind + Earth | Duststorm | Creates abrasive clouds that chip many bricks at once. |

### Arcade + Arcade

| Combo | Result | Gameplay Effect |
| --- | --- | --- |
| Spark + Resin | Ambercharge | Sticky conductive arcs jump between coated bricks. |
| Spark + Echo | Thunderloop | Hits repeat after a delay, creating rhythm-chain damage. |
| Spark + Gravity | Magnetar | Ball curves toward nearby bricks with charged gravity. |
| Resin + Echo | Harmonic Bloom | Resonant cracks spread outward from sticky impact points. |
| Resin + Gravity | Tar Pit | Creates slow gravity sludge zones that increase impact damage. |
| Echo + Gravity | Pulsewell | A vortex pulls effects inward, then releases a shockwave. |

### Mystic + Mystic

| Combo | Result | Gameplay Effect |
| --- | --- | --- |
| Ash + Glass | Obsidian | Creates brittle black shards that burst into piercing fragments. |
| Ash + Mist | Smog | A decaying cloud damages hidden or shielded bricks. |
| Ash + Iron | Rust | Weakens armored bricks and spreads corrosion. |
| Glass + Mist | Mirage | Ball creates false copies that deal light phantom hits. |
| Glass + Iron | Shardsteel | Ball gains razor armor, piercing through one extra brick. |
| Mist + Iron | Mercury | Metallic liquid trails follow the ball and strike delayed targets. |

### Fire Cross-Set Combos

| Combo | Result | Gameplay Effect |
| --- | --- | --- |
| Fire + Spark | Plasma | High-speed burning arcs jump to nearby bricks. |
| Fire + Resin | Napalm | Sticky fire clings to bricks and burns in clusters. |
| Fire + Echo | Detonation | Each hit sends out a small explosive sound burst. |
| Fire + Gravity | Solar Well | A burning gravity field pulls bricks and effects inward. |
| Fire + Ash | Emberrot | Burned bricks become brittle and easier to destroy. |
| Fire + Glass | Sunshard | Splits the ball into burning prism fragments. |
| Fire + Mist | Scaldcloud | Steam-like haze deals soft area damage. |
| Fire + Iron | Forge | Ball becomes molten metal, gaining heavy piercing hits. |

### Water Cross-Set Combos

| Combo | Result | Gameplay Effect |
| --- | --- | --- |
| Water + Spark | Surge | Electrified splash chains through wet bricks. |
| Water + Resin | Sapflow | Sticky streams link bricks into damage-sharing clusters. |
| Water + Echo | Sonar | Reveals weak points and causes rippling damage waves. |
| Water + Gravity | Tidewell | Ball movement bends like a tide around gravity pools. |
| Water + Ash | Lye | Cleanses buffs from enemy bricks and corrodes them. |
| Water + Glass | Lens | Refracts the ball into angled duplicates. |
| Water + Mist | Fog | Softens the board, allowing partial phasing through bricks. |
| Water + Iron | Quicksilver | Ball gains fluid metallic trails that auto-target cracked bricks. |

### Wind Cross-Set Combos

| Combo | Result | Gameplay Effect |
| --- | --- | --- |
| Wind + Spark | Ionstorm | Charged gusts redirect the ball into chain hits. |
| Wind + Resin | Pollenbind | Sticky spores drift across the board and attach to bricks. |
| Wind + Echo | Resonance | Air pulses repeat impacts in widening rings. |
| Wind + Gravity | Orbit | Ball curves around gravity pockets before snapping outward. |
| Wind + Ash | Cinderstorm | Ash clouds sweep across rows, weakening bricks. |
| Wind + Glass | Razorwind | Shard gusts slice through thin or cracked bricks. |
| Wind + Mist | Vaportrail | Ball leaves a drifting trail that softly damages bricks. |
| Wind + Iron | Maglev | Ball hovers and accelerates along magnetic wind lanes. |

### Earth Cross-Set Combos

| Combo | Result | Gameplay Effect |
| --- | --- | --- |
| Earth + Spark | Fulgurite | Lightning crystallizes stone, creating explosive weak points. |
| Earth + Resin | Rootstone | Bricks bind together and share damage through root veins. |
| Earth + Echo | Quake | Impact sends tremors through nearby bricks. |
| Earth + Gravity | Corecrush | Heavy gravity compresses bricks for massive impact damage. |
| Earth + Ash | Graveclay | Damaged bricks crumble into spreading decay zones. |
| Earth + Glass | Crystal | Creates reflective crystal bricks that split shots. |
| Earth + Mist | Marsh | Slows the ball but makes every hit splash damage. |
| Earth + Iron | Ore | Creates armored bricks that explode when finally broken. |

### Arcade + Mystic Cross-Set Combos

| Combo | Result | Gameplay Effect |
| --- | --- | --- |
| Spark + Ash | Cindercharge | Electric decay jumps to weakened bricks. |
| Spark + Glass | Prismbolt | Lightning splits into colored ricochet beams. |
| Spark + Mist | Static Haze | A charged mist randomly zaps nearby bricks. |
| Spark + Iron | Magnetron | Ball magnetizes and fires electric pulses on contact. |
| Resin + Ash | Pitch | Sticky black tar weakens and slows bricks or effects. |
| Resin + Glass | Amberglass | Sticky crystal coating stores damage, then shatters. |
| Resin + Mist | Sporecloud | Sticky fog spreads status effects across the board. |
| Resin + Iron | Ferrothorn | Metal vines bind bricks and deal thorn damage. |
| Echo + Ash | Dirge | Sound waves decay bricks with each repeated pulse. |
| Echo + Glass | Chime | Crystal tones create delayed shard impacts. |
| Echo + Mist | Whisper | Invisible pulse hits appear after short delays. |
| Echo + Iron | Resonant Steel | Metal bricks hum, storing damage before releasing it. |
| Gravity + Ash | Blackfall | Decaying gravity wells crush weakened bricks. |
| Gravity + Glass | Event Prism | Gravity bends shard paths into curved ricochets. |
| Gravity + Mist | Nebula | A cosmic fog bends the ball and hides target zones. |
| Gravity + Iron | Ironstar | Heavy magnetic gravity pulls the ball into brutal impacts. |

## Three-Type Combo Reactions

Three-type reactions use family-based reactions instead of listing every possible combination.

### Classic Triads

| Combo | Result | Gameplay Effect |
| --- | --- | --- |
| Fire + Water + Wind | Monsoon Flame | A hot storm spreads burning splash damage. |
| Fire + Water + Earth | Geyserstone | Impact erupts upward, launching damage columns. |
| Fire + Wind + Earth | Volcanic Storm | Dust and flame sweep rows after hard impacts. |
| Water + Wind + Earth | Tsunami Clay | Heavy waves roll across the lower board. |

### Arcade Triads

| Combo | Result | Gameplay Effect |
| --- | --- | --- |
| Spark + Resin + Echo | Singing Amber | Sticky trails pulse and chain damage. |
| Spark + Resin + Gravity | Star Sap | Gravity wells trap bricks, then discharge lightning. |
| Spark + Echo + Gravity | Storm Chorus | Orbiting echo-bolts strike after each bounce. |
| Resin + Echo + Gravity | Deep Root | Bound bricks share damage through heavy pulses. |

### Mystic Triads

| Combo | Result | Gameplay Effect |
| --- | --- | --- |
| Ash + Glass + Mist | Black Mirage | Phantom shards drift through bricks, leaving decay. |
| Ash + Glass + Iron | Obsidian Forge | Heavy black shards pierce and corrode. |
| Ash + Mist + Iron | Rustveil | A metallic fog corrodes armored bricks. |
| Glass + Mist + Iron | Mercury Prism | Liquid mirror trails split and rejoin around targets. |

## Four-Type And Ultimate Combo Reactions

| Set | Combo | Result | Gameplay Effect |
| --- | --- | --- | --- |
| Classic | Fire + Water + Wind + Earth | Worldheart | A full-board elemental surge: burn, splash, gust, and quake all trigger. |
| Arcade | Spark + Resin + Echo + Gravity | Singularity Bloom | All marks collapse into one point, then explode into arcs, waves, cracks, and pull effects. |
| Mystic | Ash + Glass + Mist + Iron | Obsidian Dawn | Dark glass fog forms, then shatters into rusting fragments across the board. |
| All 12 | Every base element | The First Break | The board is marked, the ball splits into elemental echoes, gravity bends the arena, and a final prism shockwave clears everything below a damage threshold. |

## Reward Source Shape

Normal brick reward blocks:
- Drop run-scoped versions of store upgrades.
- Do not drop elements.
- Do not drop coins.
- Apply instantly through the paddle absorption animation.

Boss upgrade screens:
- Offer three element choices when at least three unowned elements remain.
- Use Classic/Common 70%, Arcade/Uncommon 25%, and Mystic/Rare 5% family weighting.
- Award 1000 coins on boss clear for v0.26.
- Never offer an element already owned this run.
- Fill missing choice slots with coin rewards when fewer than three unowned elements remain.
- Offer coin rewards only when no unowned elements remain.
- Do not show after the level 100 boss because the run ends.

Campaign note:
- The campaign stays capped at 100 levels.
- Boss-only element picks may not make all 12 elements reachable yet.
- `The First Break` remains in the catalog for testing once another path to 12 elements exists.

| Upgrade | ID | Icon | Type | Effect | Run Behavior | Max Stacks |
| --- | --- | --- | --- | --- | --- | --- |
| Fire Attunement | `run_fire_attunement` | `F` | Element | Add Fire | Unlocks Fire for this run. Cannot appear again once owned. | 1 |
| Water Attunement | `run_water_attunement` | `W` | Element | Add Water | Unlocks Water for this run. Cannot appear again once owned. | 1 |
| Wind Attunement | `run_wind_attunement` | `N` | Element | Add Wind | Unlocks Wind for this run. Cannot appear again once owned. | 1 |
| Earth Attunement | `run_earth_attunement` | `E` | Element | Add Earth | Unlocks Earth for this run. Cannot appear again once owned. | 1 |
| Spark Attunement | `run_spark_attunement` | `K` | Element | Add Spark | Unlocks Spark for this run. Cannot appear again once owned. | 1 |
| Resin Attunement | `run_resin_attunement` | `R` | Element | Add Resin | Unlocks Resin for this run. Cannot appear again once owned. | 1 |
| Echo Attunement | `run_echo_attunement` | `O` | Element | Add Echo | Unlocks Echo for this run. Cannot appear again once owned. | 1 |
| Gravity Attunement | `run_gravity_attunement` | `G` | Element | Add Gravity | Unlocks Gravity for this run. Cannot appear again once owned. | 1 |
| Ash Attunement | `run_ash_attunement` | `A` | Element | Add Ash | Unlocks Ash for this run. Cannot appear again once owned. | 1 |
| Glass Attunement | `run_glass_attunement` | `L` | Element | Add Glass | Unlocks Glass for this run. Cannot appear again once owned. | 1 |
| Mist Attunement | `run_mist_attunement` | `M` | Element | Add Mist | Unlocks Mist for this run. Cannot appear again once owned. | 1 |
| Iron Attunement | `run_iron_attunement` | `I` | Element | Add Iron | Unlocks Iron for this run. Cannot appear again once owned. | 1 |

## Current Code Note

The current build does not implement this 12-element catalog yet.

Current code still has:
- Permanent upgrades: damage, paddle width, crit, speed, shield.
- Run upgrades: damage, speed, paddle width, crit, multiball, Fire, Lightning, Frost, Acid, pierce, elemental amplifier, cannon, shield.
- Current element terms: Burn, Chain, Static, Brittle, Chill, Corrosion, Pierce, and secondary-hit budget.

The catalog above is the target shape before implementation.

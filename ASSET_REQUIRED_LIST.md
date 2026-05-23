# Asset Required List

This is the image generation checklist for **Brick Breaker: Elemental Barrage**.
It is organized so the first playable demo can be generated first, then expanded into the full 100-level game.

## Generation Rules

- Use transparent PNGs for gameplay sprites, icons, projectiles, hazards, particles, enemies, and bosses.
- Use 16:10 backgrounds that can crop safely into the 960 x 600 logical arena. Generate at 1920 x 1200 where possible.
- Keep gameplay readability first: strong silhouettes, clear hitboxes, low background noise, no tiny decorative clutter.
- Do not put readable text inside generated images. UI labels should be rendered by HTML/CSS.
- Use a consistent arcade fantasy style across all assets: crisp painted shapes, high contrast, readable at small sizes.
- Prefer centered sprites with padding so Canvas rotation, glow, and scale effects do not clip.
- Generate damaged brick states only when they communicate HP clearly. Otherwise use code-driven tinting and cracks.

## Priority Legend

- P0: Required for the five-level MVP demo.
- P1: Needed for the first post-MVP expansion.
- P2: Needed for the full v1.0 content pass.

## P0 MVP Image Set

### Arena and Backgrounds

| Asset ID | Image | Suggested Size | Notes |
| --- | --- | --- | --- |
| bg_grasslands_training_ruins_arena | Grasslands / Training Ruins gameplay background | 1920 x 1200 | Green, gold, worn stone, cyan highlights. Low contrast center playfield. |
| bg_grasslands_training_ruins_menu | Main menu background variant | 1920 x 1200 | Same biome, slightly more dramatic, still usable behind UI. |
| arena_frame_grasslands | Arena border/frame overlay | 960 x 600 | Stone ruin border, transparent center, readable bounds. |

### Core Gameplay Sprites

| Asset ID | Image | Suggested Size | Notes |
| --- | --- | --- | --- |
| paddle_basic | Basic player paddle | 256 x 64 | Clean horizontal silhouette, cyan/gold accent. |
| paddle_shielded | Shielded paddle variant | 256 x 64 | Same shape with visible protective glow. |
| ball_normal | Normal ball | 64 x 64 | Bright readable core, neutral kinetic look. |
| ball_fire | Fire ball | 64 x 64 | Orange/red core with flame rim, readable on green and stone backgrounds. |
| trail_normal | Normal ball trail segment | 128 x 32 | Transparent fading streak. Can also be code-drawn if needed. |
| trail_fire | Fire ball trail segment | 128 x 32 | Ember streak, transparent tail. |

### MVP Bricks

| Asset ID | Image | Suggested Size | Notes |
| --- | --- | --- | --- |
| brick_basic_healthy | Basic brick | 128 x 48 | Stone/ruin brick, clear rectangle. |
| brick_basic_damaged | Basic brick damaged state | 128 x 48 | Cracks and chips, same hitbox. |
| brick_armored_healthy | Armored brick | 128 x 48 | Metal bands or reinforced stone. |
| brick_armored_damaged | Armored brick damaged state | 128 x 48 | Bent metal/cracked armor. |
| brick_bonus | Bonus or healing brick | 128 x 48 | Friendly cyan/gold glow, obvious as positive target. |

### MVP Mini-Boss

| Asset ID | Image | Suggested Size | Notes |
| --- | --- | --- | --- |
| boss_training_core_idle | Level 5 mini-boss or large target | 384 x 192 | Stationary ruin core or mossy training construct. Rectangular read. |
| boss_training_core_damaged | Mini-boss damaged state | 384 x 192 | Cracked shell, exposed cyan core. |
| boss_training_core_hit_flash | Mini-boss hit overlay | 384 x 192 | White/cyan transparent flash or crack glow. |

### MVP Effects and Particles

| Asset ID | Image | Suggested Size | Notes |
| --- | --- | --- | --- |
| fx_hit_spark | Generic hit spark | 96 x 96 | White/yellow starburst, transparent. |
| fx_brick_break_stone | Brick break burst | 128 x 128 | Stone chips and dust, transparent. |
| fx_fire_burn_small | Small burn tick | 96 x 96 | Flame lick for Fire status. |
| fx_fire_impact | Fire impact burst | 128 x 128 | Compact fiery pop, not a full explosion. |
| fx_shield_pop | Shield save burst | 128 x 128 | Cyan protective burst. |

### MVP UI Icons

| Asset ID | Image | Suggested Size | Notes |
| --- | --- | --- | --- |
| icon_life | Life icon | 64 x 64 | Heart, gem, or paddle-safe marker. |
| icon_shield | Shield icon | 64 x 64 | Defensive upgrade and HUD state. |
| icon_coin | Coin icon | 64 x 64 | Persistent/run currency. |
| icon_ball_count | Ball count icon | 64 x 64 | Small ball cluster. |
| icon_pause | Pause icon | 64 x 64 | Optional image if not using CSS/lucide. |
| icon_settings | Settings icon | 64 x 64 | Optional image if not using CSS/lucide. |
| icon_mute | Mute icon | 64 x 64 | Optional image if not using CSS/lucide. |
| icon_reset | Reset/delete save icon | 64 x 64 | Must look cautionary but not alarming. |

### MVP Upgrade Card Icons

| Asset ID | Image | Suggested Size | Notes |
| --- | --- | --- | --- |
| upgrade_damage | Damage upgrade icon | 128 x 128 | Impact or cracked brick. |
| upgrade_speed | Speed upgrade icon | 128 x 128 | Fast ball streak. |
| upgrade_crit | Critical chance icon | 128 x 128 | Focused strike/starburst. |
| upgrade_paddle_width | Paddle width icon | 128 x 128 | Widening paddle silhouette. |
| upgrade_multiball | Multiball upgrade icon | 128 x 128 | Three balls splitting upward. |
| upgrade_fire_burn | Fire burn upgrade icon | 128 x 128 | Burning brick or flame ball. |
| upgrade_shield_life | Shield/life safety icon | 128 x 128 | Shield around falling ball or paddle. |
| upgrade_coin_reward | Coin reward icon | 128 x 128 | Coin burst. |

## P1 Core Expansion Image Set

### Element Images

| Asset ID | Image | Suggested Size | Notes |
| --- | --- | --- | --- |
| ball_lightning | Lightning ball | 64 x 64 | Electric blue/yellow core. |
| ball_frost | Frost ball | 64 x 64 | Ice blue/white core. |
| ball_acid | Acid ball | 64 x 64 | Acid green/purple core. |
| icon_element_normal | Normal element icon | 128 x 128 | Kinetic/neutral. |
| icon_element_fire | Fire element icon | 128 x 128 | Flame. |
| icon_element_lightning | Lightning element icon | 128 x 128 | Bolt. |
| icon_element_frost | Frost element icon | 128 x 128 | Snowflake or ice shard. |
| icon_element_acid | Acid element icon | 128 x 128 | Corrosive droplet. |
| trail_lightning | Lightning trail segment | 128 x 32 | Jagged electric streak. |
| trail_frost | Frost trail segment | 128 x 32 | Snowy blue streak. |
| trail_acid | Acid trail segment | 128 x 32 | Green corrosive streak. |

### Expanded Brick Types

| Asset ID | Image | Suggested Size | Notes |
| --- | --- | --- | --- |
| brick_tough | Tough brick | 128 x 48 | Heavier stone than basic. |
| brick_shielded | Shielded brick | 128 x 48 | Visible shield aura. |
| brick_moving | Moving brick | 128 x 48 | Directional rails or motion accents. |
| brick_explosive | Explosive brick | 128 x 48 | Fire core, readable hazard. |
| brick_elemental_fire | Fire elemental brick | 128 x 48 | Red/orange molten details. |
| brick_elemental_frost | Frost elemental brick | 128 x 48 | Ice shell details. |
| brick_elemental_acid | Acid elemental brick | 128 x 48 | Corroded green/purple details. |
| brick_regenerating | Regenerating brick | 128 x 48 | Organic or glowing repair seams. |
| brick_brittle | Brittle brick | 128 x 48 | Fractured glass/ice look. |
| brick_portal | Portal or teleport brick | 128 x 48 | Void portal center. |
| brick_boss_summon | Boss-summoned brick | 128 x 48 | Neutral summoned look that can tint by boss. |

### Ability and Projectile Images

| Asset ID | Image | Suggested Size | Notes |
| --- | --- | --- | --- |
| projectile_player_cannon | Player cannon projectile | 64 x 128 | Upward shot, transparent. |
| projectile_player_multishot | Player multishot projectile | 64 x 128 | Smaller cannon bolt. |
| fx_firewall_barrier | Firewall barrier segment | 512 x 96 | Horizontal flame barrier above paddle. |
| fx_repulse_wave | Repulse wave | 256 x 256 | Circular transparent shockwave. |
| fx_magnet_field | Ball magnetism field | 256 x 256 | Subtle cyan arc field. |
| fx_elemental_amplifier | Elemental amplifier aura | 256 x 256 | Five-element ring, low opacity. |

### Element Effects

| Asset ID | Image | Suggested Size | Notes |
| --- | --- | --- | --- |
| fx_fire_explosion | Fire explosion | 256 x 256 | Post-MVP splash. |
| fx_lightning_chain_segment | Lightning chain segment | 256 x 64 | Tile/stretch-friendly bolt. |
| fx_lightning_stun | Static stun effect | 128 x 128 | Electric ring/sparks. |
| fx_frost_chill | Chill aura | 128 x 128 | Blue frosty ring. |
| fx_frost_freeze | Freeze block overlay | 128 x 128 | Transparent ice casing. |
| fx_frost_shatter | Frost shatter burst | 128 x 128 | Ice shards. |
| fx_acid_splash | Acid splash | 128 x 128 | Green splash, transparent. |
| fx_acid_corrosion | Corrosion overlay | 128 x 128 | Pitted green/purple damage. |

## P2 Full Biome Backgrounds

| Asset ID | Image | Suggested Size | Notes |
| --- | --- | --- | --- |
| bg_ember_caverns_arena | Ember Caverns arena background | 1920 x 1200 | Red, orange, black stone, molten yellow. |
| bg_frozen_spires_arena | Frozen Spires arena background | 1920 x 1200 | Ice blue, white, violet, dark teal. |
| bg_toxic_marsh_arena | Toxic Marsh arena background | 1920 x 1200 | Acid green, purple, murky black. |
| bg_storm_citadel_arena | Storm Citadel arena background | 1920 x 1200 | Electric blue, silver, dark navy. |
| bg_crystal_mines_arena | Crystal Mines arena background | 1920 x 1200 | Magenta, cyan, deep indigo, white. |
| bg_haunted_foundry_arena | Haunted Foundry arena background | 1920 x 1200 | Sickly green, rust, iron, violet. |
| bg_solar_desert_arena | Solar Desert arena background | 1920 x 1200 | Gold, white, red, turquoise shadows. |
| bg_void_laboratory_arena | Void Laboratory arena background | 1920 x 1200 | Black, violet, neon pink, sterile white. |
| bg_elemental_nexus_arena | Elemental Nexus arena background | 1920 x 1200 | Rotating elemental palette. |

## P2 Biome Hazard Images

| Asset ID | Image | Suggested Size | Notes |
| --- | --- | --- | --- |
| hazard_thorn_patch | Thorn patch | 192 x 96 | Grasslands hazard. |
| hazard_falling_rubble_shadow | Falling rubble warning shadow | 192 x 192 | Grasslands warning marker. |
| hazard_rubble_chunk | Falling rubble chunk | 128 x 128 | Grasslands impact object. |
| hazard_fire_vent | Fire vent | 192 x 96 | Ember Caverns hazard source. |
| hazard_lava_crack | Lava crack | 256 x 96 | Ember ground hazard. |
| hazard_ice_zone | Ice zone | 256 x 160 | Frozen Spires slow zone. |
| hazard_frost_gust | Frost gust | 256 x 96 | Directional wind/ice effect. |
| hazard_acid_pool | Acid pool | 256 x 160 | Toxic Marsh pool. |
| hazard_poison_cloud | Poison cloud | 256 x 160 | Toxic Marsh cloud. |
| hazard_lightning_arc | Lightning arc | 256 x 96 | Storm Citadel arc segment. |
| hazard_charged_pylon | Charged pylon | 128 x 192 | Storm Citadel hazard source. |
| hazard_crystal_spike | Crystal spike | 128 x 192 | Crystal Mines spike. |
| hazard_refractor | Refractor prism | 128 x 128 | Crystal Mines ball splitter/reflector. |
| hazard_flame_chain | Flame chain | 256 x 64 | Haunted Foundry chain lane. |
| hazard_ghost_anvil | Ghost anvil | 160 x 160 | Haunted Foundry falling hazard. |
| hazard_solar_beam_warning | Solar beam warning lane | 960 x 96 | Solar Desert pre-attack lane. |
| hazard_solar_beam | Solar beam | 960 x 96 | Solar Desert active beam. |
| hazard_heat_mirage | Heat mirage distortion overlay | 512 x 256 | Solar Desert visual modifier. |
| hazard_gravity_well | Gravity well | 256 x 256 | Void Laboratory pull zone. |
| hazard_void_portal | Void portal | 192 x 192 | Void Laboratory portal. |
| hazard_nexus_mixed_zone | Mixed elemental hazard zone | 256 x 256 | Elemental Nexus rotating hazard. |

## P2 Enemy Sprites

| Asset ID | Image | Suggested Size | Notes |
| --- | --- | --- | --- |
| enemy_slow_sentry | Grasslands slow sentry | 128 x 128 | Heavy training construct. |
| enemy_training_drone | Grasslands training drone | 128 x 128 | Small floating drone. |
| enemy_fire_wisp | Ember fire wisp | 128 x 128 | Floating flame enemy. |
| enemy_ember_crawler | Ember crawler | 160 x 96 | Ground or wall crawler. |
| enemy_snow_shade | Frozen snow shade | 128 x 128 | Ghostly frost enemy. |
| enemy_frost_turret | Frost turret | 128 x 128 | Stationary shooter. |
| enemy_slime | Toxic slime | 128 x 96 | Marsh slime. |
| enemy_spore_pod | Toxic spore pod | 128 x 128 | Hazard spawning pod. |
| enemy_storm_orb | Storm orb | 128 x 128 | Electric floating enemy. |
| enemy_shield_drone | Shield drone | 128 x 128 | Protects bricks. |
| enemy_crystal_beetle | Crystal beetle | 160 x 96 | Armored beetle. |
| enemy_prism_node | Prism node | 128 x 128 | Reflective crystal enemy. |
| enemy_wraith | Foundry wraith | 128 x 128 | Ghost phase enemy. |
| enemy_furnace_skull | Furnace skull | 128 x 128 | Fire/ghost shooter. |
| enemy_sun_scarab | Solar scarab | 160 x 96 | Fast solar enemy. |
| enemy_mirror_sentry | Mirror sentry | 128 x 128 | Reflective sentinel. |
| enemy_void_drone | Void drone | 128 x 128 | Gravity/portal enemy. |
| enemy_lab_construct | Lab construct | 160 x 128 | Mechanical laboratory enemy. |
| enemy_nexus_hybrid_fire_frost | Nexus fire/frost hybrid | 160 x 128 | Mixed final-biome enemy. |
| enemy_nexus_hybrid_acid_lightning | Nexus acid/lightning hybrid | 160 x 128 | Mixed final-biome enemy. |

## P2 Major Boss Sprites

Generate each major boss with at least idle, damaged, and phase accent overlays if the final implementation animates by code.

| Asset ID | Image | Suggested Size | Notes |
| --- | --- | --- | --- |
| boss_mossback_golem | Mossback Golem | 512 x 320 | Grasslands boss, mossy stone construct. |
| boss_mossback_armor_plates | Mossback armor plates overlay | 512 x 320 | Phase 2 armor. |
| boss_ember_wyrm | Ember Wyrm | 640 x 320 | Serpentine fire boss across top. |
| boss_ember_wyrm_breath | Ember Wyrm breath effect | 512 x 192 | Sweeping breath attack. |
| boss_frost_monarch | Frost Monarch | 512 x 384 | Regal frost boss. |
| boss_frost_monarch_shield | Frost Monarch ice shield overlay | 512 x 384 | Shield phase. |
| boss_acid_bog_titan | Acid Bog Titan | 560 x 360 | Armored marsh titan. |
| boss_acid_bog_titan_shell | Acid Bog Titan shell overlay | 560 x 360 | Armor shell that acid can shred. |
| boss_storm_herald | Storm Herald | 512 x 360 | Electric boss with pylon theme. |
| boss_storm_herald_vulnerable | Storm Herald vulnerable overlay | 512 x 360 | Post-attack weak window. |
| boss_crystal_hydra | Crystal Hydra | 640 x 384 | Multi-head crystal boss. |
| boss_crystal_hydra_head | Crystal Hydra separate head | 192 x 192 | Optional modular weak point. |
| boss_wraith_furnace | Wraith Furnace | 560 x 360 | Haunted foundry boss. |
| boss_wraith_furnace_ghost_phase | Wraith Furnace ghost overlay | 560 x 360 | Ghost phase. |
| boss_solar_colossus | Solar Colossus | 640 x 420 | Large central solar boss. |
| boss_solar_colossus_shield_brick | Solar shield brick | 128 x 64 | Orbiting shield brick. |
| boss_void_architect | Void Architect | 560 x 360 | Laboratory/void boss. |
| boss_void_architect_portal_frame | Void Architect portal frame | 256 x 256 | Portal attack/arena modifier. |
| boss_elemental_nexus_core | Elemental Nexus Core | 640 x 420 | Final core boss. |
| boss_elemental_nexus_fire_form | Nexus fire form overlay | 640 x 420 | Rotating element phase. |
| boss_elemental_nexus_lightning_form | Nexus lightning form overlay | 640 x 420 | Rotating element phase. |
| boss_elemental_nexus_frost_form | Nexus frost form overlay | 640 x 420 | Rotating element phase. |
| boss_elemental_nexus_acid_form | Nexus acid form overlay | 640 x 420 | Rotating element phase. |

## P2 Field Boss Sprites

| Asset ID | Image | Suggested Size | Notes |
| --- | --- | --- | --- |
| field_boss_moss_guardian | Moss Guardian | 320 x 220 | Smaller Grasslands field boss. |
| field_boss_ember_drakelet | Ember Drakelet | 320 x 220 | Small fire dragon/wyrm. |
| field_boss_frost_knight | Frost Knight | 320 x 240 | Armored frost fighter. |
| field_boss_bog_horror | Bog Horror | 340 x 240 | Acid marsh monster. |
| field_boss_storm_captain | Storm Captain | 320 x 240 | Electric commander. |
| field_boss_crystal_maw | Crystal Maw | 340 x 240 | Crystal mouth/monster. |
| field_boss_furnace_wraith | Furnace Wraith | 320 x 240 | Ghostly foundry boss. |
| field_boss_solar_djinn | Solar Djinn | 320 x 260 | Floating sun spirit. |
| field_boss_void_surgeon | Void Surgeon | 320 x 260 | Lab/void mini-boss. |
| field_boss_nexus_aberration | Nexus Aberration | 360 x 280 | Mixed elemental field boss. |

## P2 Boss and Enemy Projectile Images

| Asset ID | Image | Suggested Size | Notes |
| --- | --- | --- | --- |
| projectile_rock | Rock projectile | 96 x 96 | Mossback attack. |
| projectile_fireball | Fireball projectile | 96 x 96 | Ember attacks. |
| projectile_frost_shard | Frost shard projectile | 96 x 96 | Frost attacks. |
| projectile_acid_glob | Acid glob projectile | 96 x 96 | Toxic attacks. |
| projectile_lightning_orb | Lightning orb projectile | 96 x 96 | Storm attacks. |
| projectile_crystal_shard | Crystal shard projectile | 96 x 96 | Crystal attacks. |
| projectile_furnace_wave | Furnace wave projectile | 256 x 96 | Haunted Foundry attacks. |
| projectile_solar_spark | Solar spark projectile | 96 x 96 | Solar attacks. |
| projectile_void_pulse | Void pulse projectile | 128 x 128 | Void attacks. |
| projectile_nexus_bolt | Nexus elemental bolt | 128 x 128 | Final boss attacks. |

## P2 UI and Progression Images

| Asset ID | Image | Suggested Size | Notes |
| --- | --- | --- | --- |
| logo_game | Game logo art | 1024 x 384 | No mandatory text if title is rendered in HTML. Could be elemental ball over bricks. |
| badge_biome_grasslands | Grasslands biome badge | 128 x 128 | Level select/shop use. |
| badge_biome_ember | Ember biome badge | 128 x 128 | Level select/shop use. |
| badge_biome_frozen | Frozen biome badge | 128 x 128 | Level select/shop use. |
| badge_biome_toxic | Toxic biome badge | 128 x 128 | Level select/shop use. |
| badge_biome_storm | Storm biome badge | 128 x 128 | Level select/shop use. |
| badge_biome_crystal | Crystal biome badge | 128 x 128 | Level select/shop use. |
| badge_biome_haunted | Haunted biome badge | 128 x 128 | Level select/shop use. |
| badge_biome_solar | Solar biome badge | 128 x 128 | Level select/shop use. |
| badge_biome_void | Void biome badge | 128 x 128 | Level select/shop use. |
| badge_biome_nexus | Nexus biome badge | 128 x 128 | Level select/shop use. |
| icon_boss_level | Boss level marker | 64 x 64 | Level select. |
| icon_level_locked | Locked level marker | 64 x 64 | Level select. |
| icon_level_cleared | Cleared level marker | 64 x 64 | Level select. |
| icon_permanent_ball_core | Permanent shop ball category | 128 x 128 | Shop category. |
| icon_permanent_paddle_core | Permanent shop paddle category | 128 x 128 | Shop category. |
| icon_permanent_element_unlock | Permanent shop element category | 128 x 128 | Shop category. |
| icon_permanent_economy | Permanent shop economy category | 128 x 128 | Shop category. |
| icon_permanent_utility | Permanent shop utility category | 128 x 128 | Shop category. |
| frame_upgrade_common | Common upgrade card frame | 512 x 720 | Optional if CSS is not enough. |
| frame_upgrade_uncommon | Uncommon upgrade card frame | 512 x 720 | Optional if CSS is not enough. |
| frame_upgrade_rare | Rare upgrade card frame | 512 x 720 | Optional if CSS is not enough. |
| frame_upgrade_epic | Epic upgrade card frame | 512 x 720 | Optional if CSS is not enough. |
| frame_upgrade_legendary | Legendary upgrade card frame | 512 x 720 | Optional if CSS is not enough. |
| badge_victory | Victory completion badge | 256 x 256 | Victory screen. |
| badge_flawless_boss | Flawless boss badge | 256 x 256 | Reward summary. |

## Optional Texture Atlases

If individual images become awkward to load, combine these into atlases:

- `atlas_core_gameplay.png`: paddle, balls, basic bricks, armored bricks, core particles.
- `atlas_ui_icons.png`: HUD icons, element icons, upgrade icons, shop icons.
- `atlas_biome_hazards.png`: all hazard sprites.
- `atlas_enemies.png`: standard enemy sprites.
- `atlas_bosses.png`: boss bodies and phase overlays.

## Recommended First Generation Batch

Generate these first because they unblock the MVP:

1. `bg_grasslands_training_ruins_arena`
2. `arena_frame_grasslands`
3. `paddle_basic`
4. `paddle_shielded`
5. `ball_normal`
6. `ball_fire`
7. `brick_basic_healthy`
8. `brick_basic_damaged`
9. `brick_armored_healthy`
10. `brick_armored_damaged`
11. `boss_training_core_idle`
12. `boss_training_core_damaged`
13. `fx_hit_spark`
14. `fx_brick_break_stone`
15. `fx_fire_burn_small`
16. `fx_fire_impact`
17. `fx_shield_pop`
18. `icon_life`
19. `icon_shield`
20. `icon_coin`
21. `upgrade_damage`
22. `upgrade_speed`
23. `upgrade_crit`
24. `upgrade_paddle_width`
25. `upgrade_multiball`
26. `upgrade_fire_burn`
27. `upgrade_shield_life`
28. `upgrade_coin_reward`

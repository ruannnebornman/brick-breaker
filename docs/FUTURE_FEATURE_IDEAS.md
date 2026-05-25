# Future Feature Ideas

Status: Scratchpad. These are ideas to revisit later, not approved implementation work yet.

## Hearts Instead Of Lives

Status: Promoted into v0.25.

Idea:
- Replace the plain `Lives 3` HUD text with heart icons.
- Use full hearts for remaining lives and possibly cracked/empty hearts for lost lives.

Why:
- Hearts are easier to read during fast play.
- They make damage feel more physical and less spreadsheet-like.

Notes:
- Keep the number small and compact so the HUD does not get crowded.
- Shield charges should remain visually distinct from hearts.

## Animated Life Loss

Status: Promoted into v0.25.

Idea:
- When the player loses a life, play a brief animation before the relaunch.
- If a shield absorbs the hit, show a shield-shatter animation instead of the normal death/life-loss beat.

Possible treatments:
- Screen pulse or quick vignette.
- Paddle flash and ball respawn delay.
- Heart pop/crack animation in the HUD.
- Shield breaks into a few bright shards when it saves the player.

Why:
- Right now a life can disappear too quietly.
- A short animation makes it clear whether the player lost a heart or consumed a shield.

Important:
- Keep the pause short. The game is fast, so this should clarify the moment without dragging the pace down.

## Boss Attack Frequency Reduction

Status: Promoted into v0.25.

Problem:
- Bosses, especially Level 10, can attack too often and sometimes kill the run too early.
- Level 10 should feel like a first boss check, not a projectile wall.

Idea:
- Scale boss attack cadence down a lot, especially for early bosses.
- Make bosses threatening through clear, readable patterns rather than high projectile frequency.

Initial tuning targets:
- Level 10 Mossback Golem: much slower projectile cadence and fewer overlapping threats.
- Levels 20-40: modestly more active than Level 10, but still readable.
- Later bosses can ramp up only after the player has enough upgrades, shields, and multiball control.

Possible implementation:
- Add boss attack pace multipliers by level band.
- Increase early boss cooldowns.
- Increase initial cooldowns so the player gets a few seconds of ball control before attacks begin.
- Reduce early boss phase escalation counts.

Candidate first-pass scale:
- Level 10: 40-50% of current attack frequency.
- Levels 20-30: 55-65% of current attack frequency.
- Levels 40-50: 70-80% of current attack frequency.
- Levels 60+: tune after more long-run playtests.

Acceptance feel:
- Player understands what hit them.
- A Level 10 death should feel like a mistake or low-resource run, not random projectile overload.
- Bosses still matter, but they stop stealing attention from the core brick-breaker flow.

## Cannon Controls And Readability

Status: Promoted into v0.25.

Idea:
- Change the cannon fire input to `Space`.
- Add a stronger indicator for whether the player has the cannon and whether it can currently be used.
- Make the paddle one-third smaller as a balance pass.

Why:
- `Space` is the natural panic/action key and should feel better than a small UI button during fast play.
- The cannon is powerful, so its ready/locked state needs to be obvious without the player hunting the HUD.
- A smaller paddle should make positioning matter more now that multiball and reward scaling are getting stronger.

Possible indicator treatments:
- Add a cannon-ready icon near the paddle or lower HUD.
- Use a clear charged/empty state with a cooldown fill.
- Flash or pulse the cannon indicator briefly when it becomes ready.
- Show a locked/inactive state before the player launches balls, so it is clear why it cannot fire yet.

Balance notes:
- Reducing the paddle by one-third is a large feel change, so test it alongside early permanent rewards and boss attack pacing.
- If the game becomes too punishing, offset the smaller paddle with clearer shield feedback or earlier paddle-size upgrades.

## Trick Shot And Fast Clear Rewards

Status: Discuss later.

Idea:
- Reward stylish or high-skill play with bonus upgrades, coins, or another lightweight reward.
- Examples include trick shots, fast clears, clean clears, clutch saves, or long combo chains.

Possible reward triggers:
- Clear a level under a target time.
- Clear a level without losing a heart.
- Break multiple bricks with one ball path, pierce chain, cannon shot, or elemental chain.
- Save a ball at the last moment with the paddle edge.
- Keep all balls alive through a level.
- Defeat a boss quickly or without taking damage.

Possible rewards:
- Bonus coins.
- A temporary run-only flourish reward if temporary buffs return later.
- A bonus in-level reward block on the next stage.
- Store discount token or reroll token once those systems exist.
- A cosmetic score/combo popup only, if power rewards become too snowbally.

Why:
- It gives strong players extra goals beyond simply surviving.
- It makes the game celebrate exciting moments the player already notices.
- It can make fast, aggressive play feel different from careful, safe play.

Concerns to discuss:
- Avoid making the rich-get-richer problem too extreme.
- Rewards should be readable and not interrupt the flow.
- Trick shot detection needs to be simple enough that players understand why they earned it.

## Element-Weak Blocks

Status: Discuss later.

Idea:
- Add block types that are weak to specific elements.
- Example: ice-coated blocks take extra damage from Fire, armored metal blocks take extra damage from Acid, overloaded blocks take extra damage from Lightning, and brittle crystal blocks take extra damage from Frost.

Possible gameplay:
- Some levels intentionally encourage a certain element build.
- Element-weak blocks could break faster, trigger a bonus effect, or drop better rewards when hit by their weakness.
- Boss phases could spawn blocks that teach or reward the correct element.
- Reward blocks could sometimes hint at a useful element for the current level.

Why:
- Gives elemental upgrades a clearer purpose beyond raw power.
- Makes choosing Fire, Lightning, Frost, or Acid feel like a real build decision.
- Adds level variety without needing every stage to introduce a new enemy.

Concerns to discuss:
- Weakness icons/colors must be extremely readable.
- Avoid making runs feel doomed if the player does not get the right element.
- Weak blocks should reward good builds, not hard-gate progress.
- Need to decide whether weaknesses live on normal blocks, special blocks, bosses, or all of them.

## Paddle Characters With Starting Elements

Status: Discuss later.

Idea:
- Add selectable paddle characters.
- Each character starts the run with one or more base elements.
- More characters unlock later through progression, achievements, bosses, store purchases, or special challenges.

Examples:
- Bob starts with Fire.
- Sandi starts with Water and Earth.
- A later character could start with Spark and Iron.
- A high-end character could start with a rare family identity, but still follow the one-copy-per-element run rules.

Why:
- Gives runs a different starting identity before the first reward block.
- Lets players chase specific combo routes from the start.
- Makes the element system feel more personal and replayable.
- Creates a natural unlock path once all 12 elements and combos are in the game.

Concerns to discuss:
- Starting with two elements may be much stronger than starting with one.
- Character unlocks should not make the first few levels impossible to balance.
- The character select UI needs to clearly show starting elements and likely early combo routes.
- Starting elements should count as owned for the run, so they cannot appear again as duplicate rewards.

## Coin Economy Tuning

Status: Discuss later.

Idea:
- Revisit coin income, store prices, and coin fallback values after v0.26 is playable.
- v0.26 uses a temporary test value of 1000 coins per boss clear.
- Exhausted-pool coin bags use 10% of the boss reward, so they are 100 coins while bosses give 1000.

Why:
- Store prices, max stacks, and clear rewards are not balanced yet.
- The first implementation should make the store usable for testing instead of blocking on economy math.
- Real tuning needs playtest data: how fast runs clear, how often coin bags appear, how often bosses are beaten, and how expensive upgrades feel.

Questions to revisit:
- Should normal levels give coins, or only bosses and fallback bags?
- Should later bosses give more than earlier bosses?
- Should coin bags scale by biome, boss tier, or current level?
- Should store costs keep doubling forever, or use a softer curve for high-stack upgrades?

# Future Feature Ideas

Status: Scratchpad. These are ideas to revisit later, not approved implementation work yet.

## Hearts Instead Of Lives

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

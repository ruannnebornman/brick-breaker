import { BASE_ELEMENTS } from "./baseElements.js";

const E = {
  fire: "element_fire",
  water: "element_water",
  wind: "element_wind",
  earth: "element_earth",
  spark: "element_spark",
  resin: "element_resin",
  echo: "element_echo",
  gravity: "element_gravity",
  ash: "element_ash",
  glass: "element_glass",
  mist: "element_mist",
  iron: "element_iron",
};

const ELEMENT_COMBOS_PRIORITY = {
  value: 0,
  next() {
    this.value += 1;
    return this.value;
  },
};

export const ELEMENT_COMBOS = [
  combo("steam", "Steam", [E.fire, E.water], "Creates fog clouds that hide brick states but deal area tick damage."),
  combo("wildfire", "Wildfire", [E.fire, E.wind], "Flames spread rapidly across adjacent bricks after each bounce."),
  combo("magma", "Magma", [E.fire, E.earth], "Bricks melt into lava zones that damage nearby bricks over time."),
  combo("tempest", "Tempest", [E.water, E.wind], "Ball gains swirling movement and splash damage on impact."),
  combo("mud", "Mud", [E.water, E.earth], "Slows ball briefly but makes hits heavier and more damaging."),
  combo("duststorm", "Duststorm", [E.wind, E.earth], "Creates abrasive clouds that chip many bricks at once."),
  combo("ambercharge", "Ambercharge", [E.spark, E.resin], "Sticky conductive arcs jump between coated bricks."),
  combo("thunderloop", "Thunderloop", [E.spark, E.echo], "Hits repeat after a delay, creating rhythm-chain damage."),
  combo("magnetar", "Magnetar", [E.spark, E.gravity], "Ball curves toward nearby bricks with charged gravity."),
  combo("harmonic_bloom", "Harmonic Bloom", [E.resin, E.echo], "Resonant cracks spread outward from sticky impact points."),
  combo("tar_pit", "Tar Pit", [E.resin, E.gravity], "Creates slow gravity sludge zones that increase impact damage."),
  combo("pulsewell", "Pulsewell", [E.echo, E.gravity], "A vortex pulls effects inward, then releases a shockwave."),
  combo("obsidian", "Obsidian", [E.ash, E.glass], "Creates brittle black shards that burst into piercing fragments."),
  combo("smog", "Smog", [E.ash, E.mist], "A decaying cloud damages hidden or shielded bricks."),
  combo("rust", "Rust", [E.ash, E.iron], "Weakens armored bricks and spreads corrosion."),
  combo("mirage", "Mirage", [E.glass, E.mist], "Ball creates false copies that deal light phantom hits."),
  combo("shardsteel", "Shardsteel", [E.glass, E.iron], "Ball gains razor armor, piercing through one extra brick."),
  combo("mercury", "Mercury", [E.mist, E.iron], "Metallic liquid trails follow the ball and strike delayed targets."),
  combo("plasma", "Plasma", [E.fire, E.spark], "High-speed burning arcs jump to nearby bricks."),
  combo("napalm", "Napalm", [E.fire, E.resin], "Sticky fire clings to bricks and burns in clusters."),
  combo("detonation", "Detonation", [E.fire, E.echo], "Each hit sends out a small explosive sound burst."),
  combo("solar_well", "Solar Well", [E.fire, E.gravity], "A burning gravity field pulls bricks and effects inward."),
  combo("emberrot", "Emberrot", [E.fire, E.ash], "Burned bricks become brittle and easier to destroy."),
  combo("sunshard", "Sunshard", [E.fire, E.glass], "Splits the ball into burning prism fragments."),
  combo("scaldcloud", "Scaldcloud", [E.fire, E.mist], "Steam-like haze deals soft area damage."),
  combo("forge", "Forge", [E.fire, E.iron], "Ball becomes molten metal, gaining heavy piercing hits."),
  combo("surge", "Surge", [E.water, E.spark], "Electrified splash chains through wet bricks."),
  combo("sapflow", "Sapflow", [E.water, E.resin], "Sticky streams link bricks into damage-sharing clusters."),
  combo("sonar", "Sonar", [E.water, E.echo], "Reveals weak points and causes rippling damage waves."),
  combo("tidewell", "Tidewell", [E.water, E.gravity], "Ball movement bends like a tide around gravity pools."),
  combo("lye", "Lye", [E.water, E.ash], "Cleanses buffs from enemy bricks and corrodes them."),
  combo("lens", "Lens", [E.water, E.glass], "Refracts the ball into angled duplicates."),
  combo("fog", "Fog", [E.water, E.mist], "Softens the board, allowing partial phasing through bricks."),
  combo("quicksilver", "Quicksilver", [E.water, E.iron], "Ball gains fluid metallic trails that auto-target cracked bricks."),
  combo("ionstorm", "Ionstorm", [E.wind, E.spark], "Charged gusts redirect the ball into chain hits."),
  combo("pollenbind", "Pollenbind", [E.wind, E.resin], "Sticky spores drift across the board and attach to bricks."),
  combo("resonance", "Resonance", [E.wind, E.echo], "Air pulses repeat impacts in widening rings."),
  combo("orbit", "Orbit", [E.wind, E.gravity], "Ball curves around gravity pockets before snapping outward."),
  combo("cinderstorm", "Cinderstorm", [E.wind, E.ash], "Ash clouds sweep across rows, weakening bricks."),
  combo("razorwind", "Razorwind", [E.wind, E.glass], "Shard gusts slice through thin or cracked bricks."),
  combo("vaportrail", "Vaportrail", [E.wind, E.mist], "Ball leaves a drifting trail that softly damages bricks."),
  combo("maglev", "Maglev", [E.wind, E.iron], "Ball hovers and accelerates along magnetic wind lanes."),
  combo("fulgurite", "Fulgurite", [E.earth, E.spark], "Lightning crystallizes stone, creating explosive weak points."),
  combo("rootstone", "Rootstone", [E.earth, E.resin], "Bricks bind together and share damage through root veins."),
  combo("quake", "Quake", [E.earth, E.echo], "Impact sends tremors through nearby bricks."),
  combo("corecrush", "Corecrush", [E.earth, E.gravity], "Heavy gravity compresses bricks for massive impact damage."),
  combo("graveclay", "Graveclay", [E.earth, E.ash], "Damaged bricks crumble into spreading decay zones."),
  combo("crystal", "Crystal", [E.earth, E.glass], "Creates reflective crystal bricks that split shots."),
  combo("marsh", "Marsh", [E.earth, E.mist], "Slows the ball but makes every hit splash damage."),
  combo("ore", "Ore", [E.earth, E.iron], "Creates armored bricks that explode when finally broken."),
  combo("cindercharge", "Cindercharge", [E.spark, E.ash], "Electric decay jumps to weakened bricks."),
  combo("prismbolt", "Prismbolt", [E.spark, E.glass], "Lightning splits into colored ricochet beams."),
  combo("static_haze", "Static Haze", [E.spark, E.mist], "A charged mist randomly zaps nearby bricks."),
  combo("magnetron", "Magnetron", [E.spark, E.iron], "Ball magnetizes and fires electric pulses on contact."),
  combo("pitch", "Pitch", [E.resin, E.ash], "Sticky black tar weakens and slows bricks or effects."),
  combo("amberglass", "Amberglass", [E.resin, E.glass], "Sticky crystal coating stores damage, then shatters."),
  combo("sporecloud", "Sporecloud", [E.resin, E.mist], "Sticky fog spreads status effects across the board."),
  combo("ferrothorn", "Ferrothorn", [E.resin, E.iron], "Metal vines bind bricks and deal thorn damage."),
  combo("dirge", "Dirge", [E.echo, E.ash], "Sound waves decay bricks with each repeated pulse."),
  combo("chime", "Chime", [E.echo, E.glass], "Crystal tones create delayed shard impacts."),
  combo("whisper", "Whisper", [E.echo, E.mist], "Invisible pulse hits appear after short delays."),
  combo("resonant_steel", "Resonant Steel", [E.echo, E.iron], "Metal bricks hum, storing damage before releasing it."),
  combo("blackfall", "Blackfall", [E.gravity, E.ash], "Decaying gravity wells crush weakened bricks."),
  combo("event_prism", "Event Prism", [E.gravity, E.glass], "Gravity bends shard paths into curved ricochets."),
  combo("nebula", "Nebula", [E.gravity, E.mist], "A cosmic fog bends the ball and hides target zones."),
  combo("ironstar", "Ironstar", [E.gravity, E.iron], "Heavy magnetic gravity pulls the ball into brutal impacts."),
  combo("monsoon_flame", "Monsoon Flame", [E.fire, E.water, E.wind], "A hot storm spreads burning splash damage."),
  combo("geyserstone", "Geyserstone", [E.fire, E.water, E.earth], "Impact erupts upward, launching damage columns."),
  combo("volcanic_storm", "Volcanic Storm", [E.fire, E.wind, E.earth], "Dust and flame sweep rows after hard impacts."),
  combo("tsunami_clay", "Tsunami Clay", [E.water, E.wind, E.earth], "Heavy waves roll across the lower board."),
  combo("singing_amber", "Singing Amber", [E.spark, E.resin, E.echo], "Sticky trails pulse and chain damage."),
  combo("star_sap", "Star Sap", [E.spark, E.resin, E.gravity], "Gravity wells trap bricks, then discharge lightning."),
  combo("storm_chorus", "Storm Chorus", [E.spark, E.echo, E.gravity], "Orbiting echo-bolts strike after each bounce."),
  combo("deep_root", "Deep Root", [E.resin, E.echo, E.gravity], "Bound bricks share damage through heavy pulses."),
  combo("black_mirage", "Black Mirage", [E.ash, E.glass, E.mist], "Phantom shards drift through bricks, leaving decay."),
  combo("obsidian_forge", "Obsidian Forge", [E.ash, E.glass, E.iron], "Heavy black shards pierce and corrode."),
  combo("rustveil", "Rustveil", [E.ash, E.mist, E.iron], "A metallic fog corrodes armored bricks."),
  combo("mercury_prism", "Mercury Prism", [E.glass, E.mist, E.iron], "Liquid mirror trails split and rejoin around targets."),
  combo("worldheart", "Worldheart", [E.fire, E.water, E.wind, E.earth], "A full-board elemental surge: burn, splash, gust, and quake all trigger."),
  combo("singularity_bloom", "Singularity Bloom", [E.spark, E.resin, E.echo, E.gravity], "All marks collapse into one point, then explode into arcs, waves, cracks, and pull effects."),
  combo("obsidian_dawn", "Obsidian Dawn", [E.ash, E.glass, E.mist, E.iron], "Dark glass fog forms, then shatters into rusting fragments across the board."),
  combo("the_first_break", "The First Break", BASE_ELEMENTS.map((element) => element.id), "The board is marked, the ball splits into elemental echoes, gravity bends the arena, and a final prism shockwave clears everything below a damage threshold."),
];

const COMBO_BY_ID = new Map(ELEMENT_COMBOS.map((comboDefinition) => [comboDefinition.id, comboDefinition]));

export function getElementCombo(id) {
  return COMBO_BY_ID.get(id) || null;
}

export function listMatchingElementCombos(ownedElements = []) {
  const owned = new Set(ownedElements);
  return ELEMENT_COMBOS.filter((comboDefinition) =>
    comboDefinition.requiredElements.every((elementId) => owned.has(elementId))
  );
}

export function getActiveElementCombo(ownedElements = []) {
  return [...listMatchingElementCombos(ownedElements)]
    .sort((a, b) => b.order - a.order || a.priority - b.priority)[0] || null;
}

function combo(id, name, requiredElements, description) {
  return {
    id,
    name,
    requiredElements,
    description,
    order: requiredElements.length,
    priority: ELEMENT_COMBOS_PRIORITY.next(),
  };
}

export const MVP_LEVELS = [
  {
    levelNumber: 1,
    seedOffset: 101,
    biomeId: "grasslands_training_ruins",
    isBossLevel: false,
    name: "Training Rows",
    bricks: grid([
      "bbbbbbbb",
      " bbbbb ",
      "  bbb  ",
    ], 232, 96, 62, 28, 6, 8),
  },
  {
    levelNumber: 2,
    seedOffset: 202,
    biomeId: "grasslands_training_ruins",
    isBossLevel: false,
    name: "Broken Gate",
    bricks: grid([
      "bb bb bb",
      "bbbbbbbb",
      " bbaabb ",
      "  bbbb  ",
    ], 232, 82, 62, 28, 6, 8),
  },
  {
    levelNumber: 3,
    seedOffset: 303,
    biomeId: "grasslands_training_ruins",
    isBossLevel: false,
    name: "Training Wall",
    bricks: grid([
      "aaaaaaaa",
      "bbbbbbbb",
      " bbbbbb ",
      "  bbbb  ",
    ], 232, 74, 62, 28, 6, 8),
  },
  {
    levelNumber: 4,
    seedOffset: 404,
    biomeId: "grasslands_training_ruins",
    isBossLevel: false,
    name: "Ruin Steps",
    bricks: grid([
      "b      b",
      "bb    bb",
      "bbb  bbb",
      "aabbbbaa",
      " bbbbbb ",
    ], 232, 66, 62, 28, 6, 8),
  },
  {
    levelNumber: 5,
    seedOffset: 505,
    biomeId: "grasslands_training_ruins",
    isBossLevel: true,
    name: "Training Core",
    bricks: [],
    boss: {
      id: "training_core",
      name: "Training Core",
      x: 300,
      y: 88,
      width: 360,
      height: 128,
      hp: 135,
      armor: 1,
      assetIdle: "boss_training_core_idle",
      assetDamaged: "boss_training_core_damaged",
    },
  },
];

function grid(rows, startX, startY, width, height, gapX, gapY) {
  const bricks = [];
  rows.forEach((row, rowIndex) => {
    [...row].forEach((cell, columnIndex) => {
      if (cell === " ") return;
      bricks.push({
        type: cell === "a" ? "armored" : "basic",
        x: startX + columnIndex * (width + gapX),
        y: startY + rowIndex * (height + gapY),
        width,
        height,
        requiredForClear: true,
      });
    });
  });
  return bricks;
}

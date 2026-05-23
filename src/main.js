import { AssetLoader } from "./core/AssetLoader.js";
import { AudioSystem } from "./core/AudioSystem.js";
import { Debug } from "./core/Debug.js";
import { Game } from "./core/Game.js";
import { Input } from "./core/Input.js";
import { Renderer } from "./core/Renderer.js";
import { SaveSystem } from "./systems/SaveSystem.js";
import { HUD } from "./ui/HUD.js";
import { ScreenManager } from "./ui/ScreenManager.js";
import { ASSETS } from "./data/assets.js";

const canvas = document.querySelector("#gameCanvas");
const uiRoot = document.querySelector("#uiRoot");
const hudRoot = document.querySelector("#hudRoot");

const saveSystem = new SaveSystem();
const input = new Input(canvas);
const assets = new AssetLoader(ASSETS);
const renderer = new Renderer(canvas, assets);
const audio = new AudioSystem();
const debug = new Debug();
const hud = new HUD(hudRoot);
const screens = new ScreenManager(uiRoot);
const game = new Game({
  input,
  renderer,
  saveSystem,
  screens,
  hud,
  debug,
  audio,
});

assets.preload();
game.boot();

let lastTime = performance.now();
let accumulator = 0;
const fixedStep = 1 / 60;
const maxAccumulated = 0.25;

function frame(now) {
  const rawDelta = Math.min((now - lastTime) / 1000, maxAccumulated);
  lastTime = now;

  if (!document.hidden) {
    accumulator = Math.min(accumulator + rawDelta, maxAccumulated);
    while (accumulator >= fixedStep) {
      game.update(fixedStep);
      input.endFrame();
      accumulator -= fixedStep;
    }
    game.render();
  } else {
    accumulator = 0;
  }

  requestAnimationFrame(frame);
}

window.addEventListener("resize", () => renderer.resize());
document.addEventListener("visibilitychange", () => {
  accumulator = 0;
  if (document.hidden) {
    game.handleHidden();
  }
});

requestAnimationFrame(frame);

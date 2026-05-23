export class AudioSystem {
  constructor() {
    this.context = null;
    this.unlocked = false;
    this.muted = true;
    this.sfxVolume = 0.7;
    this.unlock = this.unlock.bind(this);
    window.addEventListener("pointerdown", this.unlock, { passive: true });
    window.addEventListener("keydown", this.unlock);
  }

  applySettings(settings) {
    this.muted = Boolean(settings.audioMuted);
    this.sfxVolume = Number(settings.sfxVolume ?? 0.7);
  }

  unlock() {
    if (this.unlocked) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.context = new AudioContext();
    this.context.resume?.();
    this.unlocked = true;
  }

  play(name) {
    if (this.muted || !this.unlocked || !this.context) return;
    const now = this.context.currentTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    const frequency = name === "select" ? 520 : name === "break" ? 190 : 330;
    osc.frequency.setValueAtTime(frequency, now);
    osc.type = "triangle";
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08 * this.sfxVolume, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    osc.connect(gain).connect(this.context.destination);
    osc.start(now);
    osc.stop(now + 0.14);
  }
}

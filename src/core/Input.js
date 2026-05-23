const CONTROL_SELECTOR = "button, input, select, textarea, [contenteditable='true']";

export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.pressed = new Set();
    this.pointer = {
      x: 480,
      y: 300,
      down: false,
      pressed: false,
      active: false,
    };

    window.addEventListener("keydown", (event) => this.handleKeyDown(event));
    window.addEventListener("keyup", (event) => this.keys.delete(event.code));
    canvas.addEventListener("pointermove", (event) => this.handlePointer(event));
    canvas.addEventListener("pointerdown", (event) => {
      this.handlePointer(event);
      this.pointer.down = true;
      this.pointer.pressed = true;
      this.pointer.active = true;
      canvas.setPointerCapture?.(event.pointerId);
    });
    canvas.addEventListener("pointerup", (event) => {
      this.handlePointer(event);
      this.pointer.down = false;
      canvas.releasePointerCapture?.(event.pointerId);
    });
    canvas.addEventListener("pointercancel", () => {
      this.pointer.down = false;
      this.pointer.active = false;
    });
  }

  handleKeyDown(event) {
    if (!this.keys.has(event.code)) {
      this.pressed.add(event.code);
    }
    this.keys.add(event.code);
  }

  handlePointer(event) {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 960;
    this.pointer.y = ((event.clientY - rect.top) / rect.height) * 600;
    this.pointer.active = true;
  }

  isDown(...codes) {
    return codes.some((code) => this.keys.has(code));
  }

  wasPressed(...codes) {
    return codes.some((code) => this.pressed.has(code));
  }

  consumePressed(...codes) {
    const found = codes.find((code) => this.pressed.has(code));
    if (found) {
      this.pressed.delete(found);
      return true;
    }
    return false;
  }

  consumePointerPress() {
    if (this.pointer.pressed) {
      this.pointer.pressed = false;
      return true;
    }
    return false;
  }

  endFrame() {
    this.pressed.clear();
    this.pointer.pressed = false;
  }

  isFormFocused() {
    return Boolean(document.activeElement?.closest?.(CONTROL_SELECTOR));
  }
}

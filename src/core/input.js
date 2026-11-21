// Unified input: keyboard + on-screen touch buttons write into the same state.
// Game code only reads `input.left/right/crouch` and consumes `pressed` actions.

export class Input {
  constructor() {
    this.keys = new Set();
    this.touch = { left: false, right: false, crouch: false };
    this.queue = []; // one-shot actions: 'interact', 'pause', 'slot1'..'slot6', 'toggle'
    this.enabled = true;

    window.addEventListener('keydown', (e) => {
      if (e.repeat) {
        if (this._isGameKey(e.code)) e.preventDefault();
        return;
      }
      this.keys.add(e.code);
      const map = {
        KeyE: 'interact',
        Space: 'interact',
        Enter: 'interact',
        Escape: 'pause',
        KeyP: 'pause',
        KeyF: 'toggle',
        Digit1: 'slot1',
        Digit2: 'slot2',
        Digit3: 'slot3',
        Digit4: 'slot4',
        Digit5: 'slot5',
        Digit6: 'slot6',
        KeyQ: 'use',
      };
      if (map[e.code]) this.queue.push(map[e.code]);
      if (this._isGameKey(e.code)) e.preventDefault();
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('blur', () => {
      this.keys.clear();
      this.touch.left = this.touch.right = this.touch.crouch = false;
    });
  }
  _isGameKey(c) {
    return /^(Arrow|Space|Key[ADWSECFQP]|Digit[1-6])/.test(c);
  }
  get left() {
    return this.enabled && (this.keys.has('KeyA') || this.keys.has('ArrowLeft') || this.touch.left);
  }
  get right() {
    return this.enabled && (this.keys.has('KeyD') || this.keys.has('ArrowRight') || this.touch.right);
  }
  get crouch() {
    return (
      this.enabled &&
      (this.keys.has('KeyC') || this.keys.has('ControlLeft') || this.keys.has('KeyS') || this.keys.has('ArrowDown') || this.touch.crouch)
    );
  }
  push(action) {
    this.queue.push(action);
  }
  drain() {
    const q = this.queue;
    this.queue = [];
    return this.enabled ? q : q.filter((a) => a === 'pause');
  }
}

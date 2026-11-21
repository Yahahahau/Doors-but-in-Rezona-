// Temporary player controller (placeholder art — final protagonist comes later).
// Horizontal movement with acceleration, crouch, simple gravity + ground check,
// collision against solid ranges, and an animation-state machine that future
// sprite sheets can plug into (see ANIMS).
import { W, PLAYER as P } from '../core/const.js';
import { approach, clamp } from '../core/util.js';
import { bus } from '../core/events.js';

export const ANIMS = {
  idle: { loop: true },
  walk: { loop: true },
  crouch: { loop: true },
  crouchWalk: { loop: true },
  interact: { loop: false, dur: 0.25 },
  hidden: { loop: true },
};

export class Player {
  constructor() {
    this.reset(0);
  }
  reset(x) {
    this.x = x;
    this.y = W.FEET; // feet
    this.vx = 0;
    this.vy = 0;
    this.facing = 1;
    this.grounded = true;
    this.crouching = false;
    this.hidden = null; // hiding spot object
    this.anim = { state: 'idle', t: 0 };
    this.stepAcc = 0;
    this.speedBoost = 0; // seconds of vitamin boost
    this.boostCooldown = 0;
    this.hp = 100;
    this.visible = true;
  }
  get h() {
    return this.crouching ? P.CROUCH_H : P.H;
  }
  get maxSpeed() {
    const base = this.crouching ? P.CROUCH : P.WALK;
    return base * (this.speedBoost > 0 ? 1.4 : 1);
  }
  setAnim(s) {
    if (this.anim.state !== s) this.anim = { state: s, t: 0 };
  }

  update(dt, input, solids) {
    this.anim.t += dt;
    if (this.speedBoost > 0) this.speedBoost = Math.max(0, this.speedBoost - dt);
    else if (this.boostCooldown > 0) this.boostCooldown = Math.max(0, this.boostCooldown - dt);

    if (this.hidden) {
      this.vx = 0;
      this.setAnim('hidden');
      return;
    }
    this.crouching = input.crouch;
    const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    if (dir) this.facing = dir;
    const target = dir * this.maxSpeed;
    const rate = dir && Math.sign(target) === Math.sign(this.vx || target) ? P.ACCEL : P.DECEL;
    this.vx = approach(this.vx, target, rate * dt);

    // horizontal collision against solid ranges
    let nx = this.x + this.vx * dt;
    const hw = P.W / 2;
    for (const [a, b] of solids) {
      if (nx + hw > a && nx - hw < b) {
        if (this.x <= (a + b) / 2) nx = Math.min(nx, a - hw);
        else nx = Math.max(nx, b + hw);
        this.vx = 0;
      }
    }
    const moved = Math.abs(nx - this.x);
    this.x = nx;

    // gravity + ground detection (single floor plane for now; future stairs
    // can supply a groundAt(x) function)
    this.vy += P.GRAVITY * dt;
    this.y += this.vy * dt;
    if (this.y >= W.FEET) {
      this.y = W.FEET;
      this.vy = 0;
      this.grounded = true;
    } else this.grounded = false;

    // footsteps → sound + noise events (Figure will listen to `noise`)
    this.stepAcc += moved;
    const stride = this.crouching ? 30 : 34;
    if (this.stepAcc > stride) {
      this.stepAcc = 0;
      bus.emit('sfx', { name: 'step', x: this.x, vol: this.crouching ? 0.35 : 1 });
      bus.emit('noise', { x: this.x, loudness: this.crouching ? 0.1 : this.speedBoost > 0 ? 0.7 : 0.4 });
    }

    const moving = Math.abs(this.vx) > 8;
    if (this.anim.state === 'interact' && this.anim.t < ANIMS.interact.dur) return;
    this.setAnim(this.crouching ? (moving ? 'crouchWalk' : 'crouch') : moving ? 'walk' : 'idle');
  }

  /** placeholder drawing: simple silhouette, readable at small sizes */
  draw(ctx, t, heldItemImg) {
    if (this.hidden || !this.visible) return;
    const x = this.x,
      y = this.y;
    const s = this.anim.state;
    const walking = s === 'walk' || s === 'crouchWalk';
    const ph = this.anim.t * (s === 'walk' ? 10 : 7);
    const h = this.h;
    const bob = walking ? Math.abs(Math.sin(ph)) * 1.5 : Math.sin(t * 2) * 0.4;
    const f = this.facing;

    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath();
    ctx.ellipse(x, y + 1, 13, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    const legH = this.crouching ? 10 : 22;
    const bodyH = this.crouching ? 20 : 26;
    const hipY = y - legH;
    // legs
    ctx.strokeStyle = '#2c3138';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    const sw = walking ? Math.sin(ph) * 7 : 0;
    ctx.beginPath();
    ctx.moveTo(x - 2, hipY);
    ctx.lineTo(x - 2 + sw, y - 2);
    ctx.moveTo(x + 2, hipY);
    ctx.lineTo(x + 2 - sw, y - 2);
    ctx.stroke();
    // torso
    const ty = hipY - bodyH - bob * 0.5;
    ctx.fillStyle = '#3f6b4a';
    roundRect(ctx, x - 8, ty, 16, bodyH + 2, 4);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(x - 8 + (f > 0 ? 10 : 0), ty + 2, 6, bodyH - 2);
    // back arm
    ctx.strokeStyle = '#335a3e';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x - f * 4, ty + 4);
    ctx.lineTo(x - f * 4 - sw * 0.6, ty + 18);
    ctx.stroke();
    // head
    const hy = ty - 10 - bob * 0.3;
    ctx.fillStyle = '#d8b48a';
    roundRect(ctx, x - 6.5, hy - 6, 13, 13, 4);
    ctx.fill();
    ctx.fillStyle = '#1a1210';
    ctx.fillRect(x + f * 2.5 - 0.8, hy - 1, 1.6, 2.2);
    // front arm (holding item)
    const handX = x + f * 9,
      handY = ty + 15;
    ctx.strokeStyle = '#4a7d57';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x + f * 4, ty + 4);
    ctx.lineTo(handX, handY);
    ctx.stroke();
    ctx.lineCap = 'butt';
    if (heldItemImg && heldItemImg.complete) {
      ctx.save();
      ctx.translate(handX, handY);
      if (f < 0) ctx.scale(-1, 1);
      ctx.drawImage(heldItemImg, -3, -9, 11, 11);
      ctx.restore();
    }
    this.handPos = { x: handX + f * 3, y: handY - 4 };
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export { clamp };

"use client";

import { useEffect, useRef } from "react";

/*
  ASCII jellyfish ocean, adapted from Kurage Dashboard 1.0.0 (HorizonX).
  Procedural jellyfish are rendered to a tiny offscreen canvas, then
  resampled into a grid of monospace glyphs on tinted tiles.
  Localized: single cyan/violet palette, Geist Mono from CSS var,
  typing/pulse driven by window events instead of the dashboard's composer.
*/

const PALETTE = { a: [92, 226, 240], b: [164, 140, 255], tempo: 1, size: 1 };
const ACCENTS = ["#f9a8d4", "#fcd34d", "#86efac", "#c4b5fd"];
const RAMP = [
  [".", ","],
  ["'", "`"],
  [":", "'"],
  [";", ":"],
  ["o", ";"],
  ["t", "o"],
  ["%", "t"],
  ["S", "%"],
  ["X", "S"],
  ["8", "X"],
  ["@", "8"],
  ["#", "@"],
];
const SNOW = [".", ".", ".", "-", "-", "'", ",", "·"];
const SLOTS = [
  [0.2, 0.4, 0.82],
  [0.8, 0.3, 1],
  [0.4, 0.9, 0.92],
  [0.66, 0.72, 0.58],
  [0.07, 0.97, 0.62],
  [0.92, 0.9, 0.5],
];
// Hue A to hue B per jelly, so the first frame always shows both colours.
const HUES = [0.12, 0.9, 0.3, 0.78, 0.55, 0.04];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);

function hash(x: number, y: number, t: number) {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(t, 1103515245);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

function contraction(p: number) {
  return p < 0.28 ? Math.sin((p / 0.28) * Math.PI / 2) : 0.5 + 0.5 * Math.cos(((p - 0.28) / 0.72) * Math.PI);
}

interface Tentacle {
  u: number;
  n: number;
  seg: number;
  w0: number;
  w1: number;
  sw: number;
  seed: number;
  arm: boolean;
  pts: { x: number; y: number; px: number; py: number }[];
}

interface Jelly {
  x: number;
  y: number;
  z: number;
  R0: number;
  R: number;
  vx: number;
  vy: number;
  theta: number;
  phase: number;
  c: number;
  rush: boolean;
  rate: number;
  mix: number;
  wander: number;
  tents: Tentacle[];
}

interface Snowflake {
  x: number;
  y: number;
  vy: number;
  vx: number;
  seed: number;
  g: string;
  run: number;
  style: string;
}

interface Ripple {
  x: number;
  y: number;
  t0: number;
  dur: number;
  max: number;
}

interface TileStyle {
  tile: string;
  glyph: string;
}

export default function OceanBackground() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const off = document.createElement("canvas");
    const octx = off.getContext("2d", { willReadFrequently: true })!;
    const SS = 2; // offscreen samples per cell, per axis

    const monoVar = getComputedStyle(document.documentElement)
      .getPropertyValue("--font-geist-mono")
      .trim();
    const FONT = `${monoVar ? `${monoVar}, ` : ""}ui-monospace, "SF Mono", Menlo, Consolas, monospace`;

    let W = 0, H = 0, dpr = 1, cw = 10, ch = 15, cols = 0, rows = 0, ow = 0, oh = 0, fs = 11;
    let jellies: Jelly[] = [];
    let snow: Snowflake[] = [];
    const ripples: Ripple[] = [];
    let time = 0, last = 0, acc = 0, raf = 0;
    let visible = !document.hidden;
    let gain = 1, typingUntil = 0, boostUntil = 0, flickerUntil = 0;
    const pointer = { x: -1e5, y: -1e5 };
    const target = { x: 0, y: 0 };
    const styles = new Map<number, TileStyle>();

    /* ---- creatures ---- */
    function baseRadius() {
      return clamp(Math.min(W, H * 1.25) * 0.074, 46, 98);
    }

    function anchor(j: Jelly, t: Tentacle, c: number) {
      const rx = j.R * (1 - 0.17 * c), ry = j.R * 0.8 * (1 + 0.1 * c);
      const lx = t.u * rx * (t.arm ? 1 : 0.95);
      const ly = t.arm ? ry * 0.05 : -ry * 0.03 * (1 - Math.abs(t.u));
      const cs = Math.cos(j.theta), sn = Math.sin(j.theta);
      return { x: j.x + lx * cs - ly * sn, y: j.y + lx * sn + ly * cs };
    }

    function resetTentacles(j: Jelly) {
      const hx = Math.sin(j.theta), hy = -Math.cos(j.theta);
      for (const t of j.tents) {
        const a = anchor(j, t, 0);
        t.pts = [];
        for (let k = 0; k < t.n; k++) {
          const x = a.x - hx * k * t.seg * j.R, y = a.y - hy * k * t.seg * j.R;
          t.pts.push({ x, y, px: x, py: y });
        }
      }
    }

    function makeJelly(x: number, y: number, z: number): Jelly {
      const R0 = baseRadius() * (0.62 + 0.55 * z) * (0.88 + Math.random() * 0.24);
      const j: Jelly = {
        x, y, z, R0, R: R0 * PALETTE.size, vx: 0, vy: 0,
        theta: (Math.random() - 0.5) * 0.6, phase: Math.random(), c: 0, rush: false,
        rate: 0.86 + Math.random() * 0.28, mix: Math.random(), wander: Math.random() * 100, tents: []
      };
      const nT = 9;
      for (let i = 0; i < nT; i++) {
        j.tents.push({ u: -0.92 + (1.84 * i) / (nT - 1), n: 15, seg: 0.25, w0: 0.075, w1: 0.022, sw: 0.6 + Math.random() * 0.8, seed: Math.random() * 6.28, arm: false, pts: [] });
      }
      for (const u of [-0.3, -0.1, 0.1, 0.3]) {
        j.tents.push({ u, n: 10, seg: 0.2, w0: 0.17, w1: 0.05, sw: 1.1 + Math.random() * 0.5, seed: Math.random() * 6.28, arm: true, pts: [] });
      }
      resetTentacles(j);
      return j;
    }

    function desiredCount() {
      return W < 600 ? 3 : W < 1100 ? 4 : 5;
    }

    function seedJellies() {
      jellies = [];
      const n = desiredCount();
      for (let i = 0; i < n; i++) {
        const s = SLOTS[i];
        const j = makeJelly(s[0] * W, s[1] * H, s[2]);
        j.mix = HUES[i];
        jellies.push(j);
      }
      jellies.sort((a, b) => a.z - b.z);
    }

    function respawn(j: Jelly) {
      j.y = H + j.R * (1.2 + Math.random());
      j.x = W * (0.08 + Math.random() * 0.84);
      j.vx = 0; j.vy = 0; j.theta = (Math.random() - 0.5) * 0.5;
      j.mix = Math.random() < 0.5 ? Math.random() * 0.35 : 0.65 + Math.random() * 0.35;
      resetTentacles(j);
    }

    function shiftJelly(j: Jelly, dx: number, dy: number) {
      j.x += dx; j.y += dy;
      for (const t of j.tents) for (const q of t.pts) { q.x += dx; q.px += dx; q.y += dy; q.py += dy; }
    }

    function seedSnow() {
      snow = [];
      const n = Math.round((cols * rows) / 80);
      for (let i = 0; i < n; i++) {
        const a = 0.14 + Math.random() * 0.3;
        snow.push({
          x: Math.random() * W, y: Math.random() * H,
          vy: 3 + Math.random() * 8, vx: (Math.random() - 0.5) * 3, seed: Math.random() * 6.28,
          g: SNOW[(Math.random() * SNOW.length) | 0], run: Math.random() < 0.16 ? 2 + ((Math.random() * 3) | 0) : 1,
          style: `rgba(150,172,205,${a.toFixed(3)})`
        });
      }
    }

    /* ---- simulation ---- */
    function step(dt: number) {
      time += dt;

      const typing = time < typingUntil;
      const boosting = time < boostUntil;
      const gTarget = (typing ? 1.1 : 1) * (boosting ? 1.25 : 1);
      gain += (gTarget - gain) * Math.min(1, dt * (gTarget < gain ? 9 : 2.4));

      const tempo = PALETTE.tempo * (typing ? 1.28 : 1);
      for (const j of jellies) {
        j.R += (j.R0 * PALETTE.size - j.R) * Math.min(1, dt * 1.4);
        j.phase += dt * (1 / 2.6) * j.rate * tempo + (j.rush ? dt * 2.2 : 0);
        if (j.phase >= 1) { j.phase -= 1; j.rush = false; }
        const c = contraction(j.phase), dc = c - j.c;
        j.c = c;
        const hx = Math.sin(j.theta), hy = -Math.cos(j.theta);
        if (dc > 0) {
          const thrust = 62 * (0.5 + 0.5 * j.z) * Math.sqrt(tempo);
          j.vx += hx * dc * thrust; j.vy += hy * dc * thrust;
        }
        const drag = Math.exp(-dt * 1.15);
        j.vx *= drag; j.vy *= drag;
        j.vx += Math.sin(time * 0.07 + j.wander) * 1.6 * dt;
        j.x += j.vx * dt; j.y += j.vy * dt;

        let want = Math.sin(time * 0.11 + j.wander) * 0.5;
        if (typing) want = clamp(Math.atan2(target.x - j.x, -(target.y - j.y)), -1.15, 1.15);
        const pdx = j.x - pointer.x, pdy = j.y - pointer.y, pd = Math.hypot(pdx, pdy) || 1;
        if (pd < j.R * 2.4) {
          const push = (1 - pd / (j.R * 2.4)) * 42 * dt;
          j.vx += (pdx / pd) * push; j.vy += (pdy / pd) * push;
        }
        j.theta += (want - j.theta) * Math.min(1, dt * (typing ? 0.9 : 0.32));

        if (j.y < -j.R * 4.4) respawn(j);
        else if (j.x < -j.R * 3.2) shiftJelly(j, W + j.R * 3, 0);
        else if (j.x > W + j.R * 3.2) shiftJelly(j, -W - j.R * 3, 0);
        else if (j.y > H + j.R * 6) shiftJelly(j, 0, -(H + j.R * 9));

        // tentacles: follow-the-leader chains with inertia
        const cs = Math.cos(j.theta), sn = Math.sin(j.theta);
        const trail = 0.42 + 0.25 * (1 - c);
        const sway = time * 1.5 * PALETTE.tempo;
        for (const t of j.tents) {
          const p = t.pts, a = anchor(j, t, c), seg = t.seg * j.R;
          p[0].x = a.x; p[0].y = a.y; p[0].px = a.x; p[0].py = a.y;
          const flare = t.arm ? 0 : t.u * c * 0.7;
          for (let k = 1; k < p.length; k++) {
            const q = p[k], pr = p[k - 1], f = k / p.length;
            const vx = (q.x - q.px) * 0.88, vy = (q.y - q.py) * 0.88;
            q.px = q.x; q.py = q.y;
            const s = Math.sin(sway - k * 0.42 + t.seed) * t.sw * (0.25 + f) * 0.55 + flare * (1 - f);
            q.x += vx - hx * trail + cs * s;
            q.y += vy - hy * trail + sn * s;
            const ex = q.x - pointer.x, ey = q.y - pointer.y, ed = ex * ex + ey * ey;
            if (ed < 12100) { const d = Math.sqrt(ed) || 1, push = (1 - d / 110) * 2.6; q.x += (ex / d) * push; q.y += (ey / d) * push; }
            const dx = q.x - pr.x, dy = q.y - pr.y, d = Math.hypot(dx, dy) || 1;
            q.x = pr.x + (dx / d) * seg; q.y = pr.y + (dy / d) * seg;
          }
        }
      }

      for (const s of snow) {
        s.y += s.vy * dt;
        s.x += (s.vx + Math.sin(time * 0.3 + s.seed) * 2) * dt;
        if (s.y > H + ch) { s.y = -ch; s.x = Math.random() * W; }
        if (s.x < -cw * 8) s.x += W + cw * 8; else if (s.x > W + cw) s.x -= W + cw * 8;
      }

      for (let i = ripples.length - 1; i >= 0; i--) if (time - ripples[i].t0 > ripples[i].dur) ripples.splice(i, 1);
    }

    /* ---- drawing (offscreen light field) ---- */
    // Channels: R = hue A weight, B = hue B weight, G = white core. Additive.
    function col(m: number, k: number, w: number) {
      return `rgb(${Math.min(255, (1 - m) * k * 255) | 0},${Math.min(255, w * 255) | 0},${Math.min(255, m * k * 255) | 0})`;
    }

    function drawField() {
      octx.setTransform(1, 0, 0, 1, 0, 0);
      octx.globalCompositeOperation = "source-over";
      octx.fillStyle = "#000";
      octx.fillRect(0, 0, ow, oh);
      octx.setTransform(SS / cw, 0, 0, SS / ch, 0, 0);
      octx.globalCompositeOperation = "lighter";
      octx.lineCap = "round";
      octx.lineJoin = "round";

      for (const r of ripples) {
        const t = (time - r.t0) / r.dur;
        if (t < 0) continue;
        const rad = (1 - Math.pow(1 - t, 3)) * r.max, fade = 1 - t;
        octx.lineWidth = 6 + 12 * fade;
        octx.strokeStyle = col(0.5, 0.5 * fade, 0.55 * fade);
        octx.beginPath();
        octx.ellipse(r.x, r.y, rad, rad * 0.56, 0, 0, Math.PI * 2);
        octx.stroke();
      }

      const boostT = time < boostUntil ? (boostUntil - time) / 1.8 : 0;
      for (const j of jellies) {
        const k = gain * (0.54 + 0.56 * j.z) * (1 + boostT * 0.9 * j.c);
        const m = j.mix;

        for (const t of j.tents) {
          const p = t.pts, n = p.length;
          for (let s = 0; s < n - 1; s += 3) {
            const f = s / (n - 1);
            octx.lineWidth = lerp(t.w0, t.w1, f) * j.R;
            octx.strokeStyle = col(m, k * (t.arm ? 0.5 : 0.46) * (1 - f * 0.82), t.arm ? 0.1 * k : 0);
            octx.beginPath();
            octx.moveTo(p[s].x, p[s].y);
            for (let q = s + 1; q <= Math.min(n - 1, s + 3); q++) octx.lineTo(p[q].x, p[q].y);
            octx.stroke();
          }
        }

        const c = j.c, rx = j.R * (1 - 0.17 * c), ry = j.R * 0.8 * (1 + 0.1 * c);
        octx.save();
        octx.translate(j.x, j.y);
        octx.rotate(j.theta);

        octx.beginPath();
        octx.moveTo(-rx, 0);
        octx.bezierCurveTo(-rx, -ry * 0.58, -rx * 0.56, -ry, 0, -ry);
        octx.bezierCurveTo(rx * 0.56, -ry, rx, -ry * 0.58, rx, 0);
        octx.quadraticCurveTo(0, -ry * 0.2, -rx, 0);
        octx.closePath();
        const g = octx.createRadialGradient(0, -ry * 0.38, rx * 0.1, 0, -ry * 0.3, rx * 1.05);
        g.addColorStop(0, col(m, k * 0.34, 0.1 * k));
        g.addColorStop(0.7, col(m, k * 0.42, 0.03 * k));
        g.addColorStop(1, col(m, k * 0.66, 0.08 * k));
        octx.fillStyle = g;
        octx.fill();
        octx.lineWidth = Math.max(5, j.R * 0.085);
        octx.strokeStyle = col(m, k * 0.55, 0.2 * k);
        octx.stroke();

        // four gonads: the moon-jelly clover
        octx.lineWidth = Math.max(3, j.R * 0.05);
        octx.strokeStyle = col(m, k * 0.14, 0.52 * k);
        for (let i = 0; i < 4; i++) {
          const ang = Math.PI / 4 + i * Math.PI / 2;
          octx.beginPath();
          octx.ellipse(Math.cos(ang) * rx * 0.26, -ry * 0.44 + Math.sin(ang) * ry * 0.2, rx * 0.14, ry * 0.12, ang, 0, Math.PI * 2);
          octx.stroke();
        }
        // marginal bulbs on the rim
        octx.fillStyle = col(m, k * 0.4, 0.36 * k);
        for (let i = 0; i <= 8; i++) {
          const u = -0.95 + (1.9 * i) / 8;
          octx.beginPath();
          octx.arc(u * rx, -ry * 0.03 * (1 - Math.abs(u)), Math.max(2.5, j.R * 0.034), 0, Math.PI * 2);
          octx.fill();
        }
        octx.restore();
      }
    }

    /* ---- drawing (glyph grid) ---- */
    function style(tb: number, lv: number, wb: number): TileStyle {
      const key = (tb * 12 + lv) * 3 + wb;
      let s = styles.get(key);
      if (s) return s;
      const t = tb / 5, L = (lv + 0.5) / 12, w = [0, 0.3, 0.62][wb];
      const base = [0, 1, 2].map((i) => lerp(PALETTE.a[i], PALETTE.b[i], t));
      // Mosaic: every lit cell is a tinted tile with a glyph on it.
      // The hottest cells invert (bright tile, ink glyph).
      const hot = lv >= 10 && wb > 0;
      const tileMix = hot ? 0.5 + w * 0.3 : 0;
      const tile = base.map((v) => lerp(v * 0.58, 236, tileMix) | 0);
      const mixW = clamp(0.12 + L * 0.5 + w * 0.34, 0, 0.94);
      const glyph = hot ? [6, 10, 16] : base.map((v) => lerp(v, 246, mixW) | 0);
      s = {
        tile: `rgba(${tile[0]},${tile[1]},${tile[2]},${(hot ? 0.9 : 0.1 + L * 0.5).toFixed(3)})`,
        glyph: hot ? `rgb(${glyph.join(",")})` : `rgba(${glyph[0]},${glyph[1]},${glyph[2]},${(0.4 + L * 0.6).toFixed(3)})`
      };
      styles.set(key, s);
      return s;
    }

    function render() {
      if (!W) return;
      drawField();
      const d = octx.getImageData(0, 0, ow, oh).data;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.font = `500 ${fs}px ${FONT}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const ty = ch / 2 + 0.5, tx = cw / 2;

      for (const s of snow) {
        const cx = Math.floor(s.x / cw), cy = Math.floor(s.y / ch);
        ctx.fillStyle = s.style;
        for (let r = 0; r < s.run; r++) ctx.fillText(s.run > 1 ? "-" : s.g, (cx + r * 2) * cw + tx, cy * ch + ty);
      }

      const tickRate = time < flickerUntil ? 10 : 1.4;
      const row = ow * 4;
      for (let cy = 0; cy < rows; cy++) {
        for (let cx = 0; cx < cols; cx++) {
          const i = (cy * SS * ow + cx * SS) * 4;
          const a = (d[i] + d[i + 4] + d[i + row] + d[i + row + 4]) / 1020;
          const w = (d[i + 1] + d[i + 5] + d[i + row + 1] + d[i + row + 5]) / 1020;
          const b = (d[i + 2] + d[i + 6] + d[i + row + 2] + d[i + row + 6]) / 1020;
          const L = Math.min(1, a + b + w * 0.55);
          if (L < 0.055) continue;
          const tb = Math.round((b / (a + b + 1e-4)) * 5);
          const lv = Math.min(11, (L * 12) | 0);
          const wb = w < 0.12 ? 0 : w < 0.32 ? 1 : 2;
          const st = style(tb, lv, wb);
          const x = cx * cw, y = cy * ch;
          if (lv >= 1) { ctx.fillStyle = st.tile; ctx.fillRect(x + 1, y + 1, cw - 2, ch - 2); }
          const tick = Math.floor(time * tickRate + (((cx * 7 + cy * 13) & 15) / 16));
          const h = hash(cx, cy, tick);
          ctx.fillStyle = lv >= 4 && lv < 10 && h > 0.986 ? ACCENTS[(h * 1e4 | 0) & 3] : st.glyph;
          ctx.fillText(RAMP[lv][h < 0.55 ? 0 : 1], x + tx, y + ty);
        }
      }
    }

    /* ---- loop ---- */
    function loop(now: number) {
      raf = requestAnimationFrame(loop);
      if (!last) { last = now; return; }
      const dt = (now - last) / 1000;
      last = now;
      acc += Math.min(dt, 0.1);
      if (acc < 1 / 30) return;
      const n = Math.max(1, Math.min(6, Math.round(acc * 60))), h = acc / n;
      for (let i = 0; i < n; i++) step(h);
      acc = 0;
      render();
    }

    function sync() {
      const should = visible && W > 0;
      if (should && !raf) { last = 0; raf = requestAnimationFrame(loop); }
      else if (!should && raf) { cancelAnimationFrame(raf); raf = 0; }
    }

    function updateTarget() {
      const el = document.getElementById("source-text");
      if (!el) return;
      const r = el.getBoundingClientRect();
      target.x = r.left + r.width / 2;
      target.y = r.top + r.height / 2;
    }

    // 箭头函数：TS 只对 const + 箭头组合保留 host 的非空收窄
    const resize = () => {
      const r = host.getBoundingClientRect();
      const nW = Math.max(1, Math.round(r.width)), nH = Math.max(1, Math.round(r.height));
      if (nW === W && nH === H) return;
      const sx = W ? nW / W : 1, sy = H ? nH / H : 1, first = !W;
      W = nW; H = nH;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      cw = W < 600 ? 8 : W < 1100 ? 9 : 10;
      ch = Math.round(cw * 1.5);
      fs = Math.round(ch * 0.74);
      cols = Math.ceil(W / cw); rows = Math.ceil(H / ch);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ow = cols * SS; oh = rows * SS;
      off.width = ow; off.height = oh;
      host.style.setProperty("--cw", `${cw}px`);
      host.style.setProperty("--ch", `${ch}px`);
      if (first) {
        seedJellies();
        for (let i = 0; i < 200; i++) step(1 / 60);
        updateTarget();
      } else {
        for (const j of jellies) { shiftJelly(j, j.x * (sx - 1), j.y * (sy - 1)); }
        const n = desiredCount();
        while (jellies.length > n) jellies.pop();
        while (jellies.length < n) { const j = makeJelly(W * Math.random(), H + 80, 0.5 + Math.random() * 0.4); respawn(j); jellies.unshift(j); }
      }
      seedSnow();
      render();
      sync();
    };

    /* ---- wiring ---- */
    const onVisibility = () => { visible = !document.hidden; sync(); };
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    };
    const onPointerLeave = () => { pointer.x = -1e5; pointer.y = -1e5; };
    const onScroll = () => updateTarget();
    const onTyping = () => {
      typingUntil = time + 1.8;
      updateTarget();
    };
    const onPulse = () => {
      boostUntil = time + 1.8;
      flickerUntil = time + 1.2;
      for (const j of jellies) j.rush = true;
      ripples.push({ x: target.x, y: target.y, t0: time, dur: 1.7, max: Math.max(W, H) * 0.62 });
      ripples.push({ x: target.x, y: target.y, t0: time + 0.26, dur: 1.7, max: Math.max(W, H) * 0.5 });
    };

    const resizeObserver = new ResizeObserver(() => requestAnimationFrame(resize));
    resizeObserver.observe(host);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("ocean:typing", onTyping);
    window.addEventListener("ocean:pulse", onPulse);

    host.appendChild(canvas);
    resize();

    // 字体加载完成后重绘一次，避免字形回退
    document.fonts?.ready.then(() => { styles.clear(); render(); }).catch(() => {});

    return () => {
      if (raf) cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("ocean:typing", onTyping);
      window.removeEventListener("ocean:pulse", onPulse);
      host.removeChild(canvas);
    };
  }, []);

  return <div ref={hostRef} aria-hidden className="ocean-bg" />;
}

// Bipe gerado via Web Audio (sem arquivos) + vibração quando disponível.
let ctx;
export function unlockAudio() {
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
  } catch {}
}

export function beep({ times = 3, freq = 880, dur = 0.16, gap = 0.12 } = {}) {
  try {
    unlockAudio();
    if (!ctx) return;
    const t0 = ctx.currentTime;
    for (let i = 0; i < times; i++) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'square'; o.frequency.value = i === times - 1 ? freq * 1.5 : freq;
      const s = t0 + i * (dur + gap);
      g.gain.setValueAtTime(0.0001, s);
      g.gain.exponentialRampToValueAtTime(0.25, s + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, s + dur);
      o.connect(g).connect(ctx.destination); o.start(s); o.stop(s + dur + 0.02);
    }
  } catch {}
}

export function vibrate(pattern = [200, 100, 200, 100, 400]) {
  try { navigator.vibrate?.(pattern); } catch {}
}

let lock;
export async function keepAwake(on) {
  try {
    if (on && 'wakeLock' in navigator) lock = await navigator.wakeLock.request('screen');
    else { await lock?.release(); lock = null; }
  } catch {}
}

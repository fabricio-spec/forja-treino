export const uid = (p = 'id') => `${p}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
export const DAY = 86400000;

export const daysBetween = (a, b = Date.now()) => Math.floor((new Date(b) - new Date(a)) / DAY);

export function fmtClock(totalSec) {
  const s = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(r)}` : `${pad(m)}:${pad(r)}`;
}

export function fmtDuration(sec) {
  const m = Math.round(sec / 60);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}`;
}

export const fmtDate = (d, opts = { day: '2-digit', month: 'short', year: 'numeric' }) =>
  new Date(d).toLocaleDateString('pt-BR', opts).replace('.', '');

export const fmtKg = (n) => `${Math.round(n).toLocaleString('pt-BR')} kg`;

export const clamp = (n, a, b) => Math.min(b, Math.max(a, n));

/** Volume = Σ repetições × carga das séries concluídas. */
export const sessionVolume = (entries) =>
  entries.reduce((t, e) => t + e.sets.reduce((s, x) => s + (x.done ? (Number(x.reps) || 0) * (Number(x.load) || 0) : 0), 0), 0);

/** Segunda-feira 00:00 da semana da data. */
export function weekStart(d) {
  const x = new Date(d); x.setHours(0, 0, 0, 0);
  const wd = (x.getDay() + 6) % 7; x.setDate(x.getDate() - wd); return x;
}

/** Extrai o ID de um link do YouTube (watch, shorts, youtu.be, embed). */
export function youtubeId(url = '') {
  if (!url) return null;
  const m = String(url).match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (m) return m[1];
  return /^[A-Za-z0-9_-]{11}$/.test(url) ? url : null;
}

export const ytSearchUrl = (q) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q + ' execução correta')}`;

/** Link aceito como mídia de exercício: YouTube ou arquivo direto (gif, imagem, mp4). */
export const isValidMediaUrl = (u = '') => !!youtubeId(u) || /^https?:\/\/\S+\.(gif|png|jpe?g|webp|mp4|webm)(\?\S*)?$/i.test(u.trim());

/** Nome do agrupamento conforme o número de exercícios do bloco. */
export const circuitName = (n) => (n <= 1 ? 'Exercício' : n === 2 ? 'Bi-set' : n === 3 ? 'Tri-set' : 'Série gigante');

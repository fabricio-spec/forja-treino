// Backup local: exporta TODOS os perfis (fichas, histórico, nutrição, perfil) num arquivo .json
// e restaura a partir dele. Nada sai do aparelho a não ser que o usuário compartilhe o arquivo.
const APP = 'forja-treino';
const isOurs = (k) => k.startsWith('forja:') || k.startsWith('forja~') || k.startsWith('forja@');

export function buildBackup() {
  const data = {};
  for (const k of Object.keys(localStorage)) if (isOurs(k)) data[k] = localStorage.getItem(k);
  return { app: APP, format: 1, exportedAt: new Date().toISOString(), data };
}

const parse = (s, f) => { try { return s == null ? f : JSON.parse(s); } catch { return f; } };

/** Resumo legível de um backup (para mostrar antes de restaurar). */
export function summarize(backup) {
  const d = backup.data;
  const reg = parse(d['forja@profiles'], null) || [{ id: 'main', name: parse(d['forja:profile'], {})?.name || 'Perfil principal' }];
  return reg.map((p) => {
    const pre = p.id === 'main' ? 'forja:' : `forja~${p.id}:`;
    return {
      name: p.name || 'Sem nome',
      workouts: (parse(d[pre + 'workouts'], []) || []).length,
      sessions: (parse(d[pre + 'sessions'], []) || []).length,
    };
  });
}

export async function readBackupFile(file) {
  const text = await file.text();
  let b;
  try { b = JSON.parse(text); } catch { throw new Error('Arquivo inválido: não é um backup do Forja Treino.'); }
  if (b?.app !== APP || typeof b.data !== 'object' || !b.data) throw new Error('Este arquivo não é um backup do Forja Treino.');
  const keys = Object.keys(b.data).filter(isOurs);
  if (!keys.length) throw new Error('O backup está vazio.');
  return b;
}

/** Substitui todos os dados do app pelos do backup e recarrega. */
export function restoreBackup(b) {
  for (const k of Object.keys(localStorage)) if (isOurs(k)) localStorage.removeItem(k);
  for (const [k, v] of Object.entries(b.data)) if (isOurs(k) && typeof v === 'string') localStorage.setItem(k, v);
  location.reload();
}

/** Compartilha (celular) ou baixa (computador) o arquivo de backup. Retorna 'shared' | 'downloaded' | 'cancelled'. */
export async function exportBackup() {
  const b = buildBackup();
  const name = `forja-treino-backup-${b.exportedAt.slice(0, 10)}.json`;
  const blob = new Blob([JSON.stringify(b, null, 1)], { type: 'application/json' });
  const file = typeof File === 'function' ? new File([blob], name, { type: 'application/json' }) : null;
  const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (mobile && file && navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: 'Backup Forja Treino' }); return 'shared'; }
    catch (e) { if (e?.name === 'AbortError') return 'cancelled'; /* senão cai no download */ }
  }
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return 'downloaded';
}

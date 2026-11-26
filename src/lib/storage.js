import { useEffect, useRef, useState } from 'react';

// Vários perfis no mesmo aparelho. O perfil principal usa o prefixo "forja:" (compatível com a 1ª versão);
// os demais usam "forja~<id>:". A lista de perfis fica em "forja@profiles" e o ativo em "forja@active".
const REG = 'forja@profiles', ACT = 'forja@active';
const rawGet = (k, f) => { try { const v = localStorage.getItem(k); return v == null ? f : JSON.parse(v); } catch { return f; } };
const rawSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

export const ACTIVE_PROFILE = rawGet(ACT, 'main');
export const PREFIX = ACTIVE_PROFILE === 'main' ? 'forja:' : `forja~${ACTIVE_PROFILE}:`;

export function listProfiles() {
  const list = rawGet(REG, null);
  if (list?.length) return list;
  return [{ id: 'main', name: rawGet('forja:profile', {})?.name || 'Perfil principal' }];
}
export function renameProfile(id, name) {
  rawSet(REG, listProfiles().map((p) => (p.id === id ? { ...p, name: name || (id === 'main' ? 'Perfil principal' : 'Sem nome') } : p)));
}
export function createProfile(name) {
  const id = Math.random().toString(36).slice(2, 8);
  rawSet(REG, [...listProfiles(), { id, name: name || 'Novo perfil' }]);
  return id;
}
export function switchProfile(id) { rawSet(ACT, id); location.reload(); }
export function deleteProfile(id) {
  const pre = id === 'main' ? 'forja:' : `forja~${id}:`;
  try { Object.keys(localStorage).filter((k) => k.startsWith(pre)).forEach((k) => localStorage.removeItem(k)); } catch {}
  const rest = listProfiles().filter((p) => p.id !== id);
  rawSet(REG, rest.length ? rest : [{ id: 'main', name: 'Perfil principal' }]);
  if (id === ACTIVE_PROFILE) switchProfile(rest[0]?.id ?? 'main');
}
export const SCHEMA_VERSION = 2;

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try {
    if (value === undefined) localStorage.removeItem(PREFIX + key);
    else localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* armazenamento cheio ou bloqueado: o app segue funcionando em memória */
  }
}

export function clearAll() {
  try {
    Object.keys(localStorage).filter((k) => k.startsWith(PREFIX)).forEach((k) => localStorage.removeItem(k));
  } catch {}
}

/** useState que persiste no localStorage. `init` pode ser função (lazy). */
export function usePersistentState(key, init) {
  const [state, setState] = useState(() => load(key, typeof init === 'function' ? init() : init));
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; save(key, state); return; }
    save(key, state);
  }, [key, state]);
  return [state, setState];
}

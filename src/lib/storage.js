import { useEffect, useRef, useState } from 'react';

// Todas as chaves ficam sob o prefixo "forja:" e são versionadas por SCHEMA_VERSION.
export const PREFIX = 'forja:';
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

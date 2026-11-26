// Navegação com histórico do navegador: o botão "Voltar" do app e o voltar do Android fazem a mesma coisa.
// - Trocar de aba empilha "#aba" no histórico.
// - Cada painel (sheet) aberto empilha uma entrada; voltar fecha o painel do topo.
import { useEffect, useRef } from 'react';

export const HOME = 'inicio';
const overlays = [];
let ignorePops = 0;
let afterPop = null;
let tabDepth = 0;
let onTab = null; // (tab) => void, registrado pelo App

const hashTab = () => location.hash.slice(1);

export function registerTabHandler(fn, valid) {
  onTab = fn;
  // Abriu direto numa aba que não é a inicial: coloca o Início "atrás" dela no histórico.
  const t = hashTab();
  if (valid.includes(t) && t !== HOME && tabDepth === 0) {
    try { history.replaceState(null, '', '#' + HOME); history.pushState(null, '', '#' + t); tabDepth = 1; } catch {}
  }
}

export function goTab(t) {
  if (hashTab() === t) { onTab?.(t); return; }
  try { history.pushState(null, '', '#' + t); tabDepth++; } catch {}
  onTab?.(t);
  window.scrollTo({ top: 0 });
}

export function goBack() {
  if (overlays.length) { history.back(); return; }
  if (tabDepth > 0) { history.back(); return; }
  if (hashTab() !== HOME) goTab(HOME);
}

export function goHome() {
  const n = overlays.length;
  const finish = () => {
    if (hashTab() !== HOME) {
      if (tabDepth > 0) { const d = tabDepth; tabDepth = 0; ignorePops++; afterPop = () => { try { history.replaceState(null, '', '#' + HOME); } catch {} onTab?.(HOME); window.scrollTo({ top: 0 }); }; history.go(-d); }
      else { try { history.replaceState(null, '', '#' + HOME); } catch {} onTab?.(HOME); window.scrollTo({ top: 0 }); }
    }
  };
  if (!n) { finish(); return; }
  const closing = overlays.splice(0, n);
  ignorePops++;
  afterPop = finish;
  history.go(-n);
  closing.reverse().forEach((e) => e.closeRef.current?.());
}

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    if (ignorePops > 0) { ignorePops--; const f = afterPop; afterPop = null; f?.(); return; }
    const top = overlays.pop();
    if (top) { top.closeRef.current?.(); return; }
    tabDepth = Math.max(0, tabDepth - 1);
    onTab?.(hashTab() || HOME);
  });
}

/** Liga um painel ao histórico enquanto `open` for true. */
export function useBackClose(open, onClose) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!open) return;
    const entry = { closeRef };
    overlays.push(entry);
    try { history.pushState({ overlay: true }, ''); } catch {}
    return () => {
      const i = overlays.indexOf(entry);
      if (i < 0) return; // já foi fechado pelo voltar do sistema
      overlays.splice(i, 1);
      ignorePops++;
      history.back();
    };
  }, [open]);
}

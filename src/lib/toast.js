// Avisos rápidos ("toast") exibidos no topo da tela.
const listeners = new Set();
export function toast(text, tone = 'ok') { listeners.forEach((f) => f({ text, tone, id: Date.now() + Math.random() })); }
export const onToast = (f) => { listeners.add(f); return () => listeners.delete(f); };

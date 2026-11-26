import { useEffect, useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { load, save } from '../lib/storage';

// Guarda o evento cedo, antes do React montar, para não perdê-lo.
let deferred = null;
const listeners = new Set();
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; listeners.forEach((f) => f()); });
}

const standalone = () => window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone;
const ua = navigator.userAgent || '';
const isIOS = /iphone|ipad|ipod/i.test(ua);
const isAndroid = /android/i.test(ua);
// Navegadores embutidos (WhatsApp, Instagram, Facebook, Telegram, apps em geral) não instalam PWA.
const inApp = /FBAN|FBAV|Instagram|WhatsApp|Line\/|Telegram|; wv\)/i.test(ua);

export default function InstallBanner() {
  const [, force] = useState(0);
  const [hidden, setHidden] = useState(() => load('installDismissed', false));
  useEffect(() => { const f = () => force((n) => n + 1); listeners.add(f); return () => listeners.delete(f); }, []);
  if (hidden || standalone() || !(isIOS || isAndroid || deferred)) return null;

  const close = () => { setHidden(true); save('installDismissed', true); };
  const install = async () => { if (!deferred) return; deferred.prompt(); const r = await deferred.userChoice.catch(() => null); deferred = null; if (r?.outcome === 'accepted') close(); else force((n) => n + 1); };

  let body;
  if (deferred) body = <button onClick={install} className="h-10 px-4 rounded-full bg-lime text-ink-950 font-semibold text-sm inline-flex items-center gap-2"><Download size={16} /> Instalar app</button>;
  else if (inApp) body = <p className="text-sm text-ink-300">Abra este link no {isIOS ? 'Safari' : 'Chrome'} para instalar. Navegadores dentro de outros apps não permitem instalação.</p>;
  else if (isIOS) body = <p className="text-sm text-ink-300">No Safari, toque em <Share size={14} className="inline -mt-1" /> <b>Compartilhar</b> e depois em <b>Adicionar à Tela de Início</b>.</p>;
  else body = <p className="text-sm text-ink-300">No Chrome, toque no menu <b>⋮</b> e depois em <b>Adicionar à tela inicial</b> → <b>Instalar</b>.</p>;

  return (
    <div className="rounded-3xl border border-lime/40 bg-lime-soft/30 p-4 flex gap-3 items-start">
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <span className="font-semibold text-ink-100">Instale o Forja no seu celular</span>
        {body}
      </div>
      <button onClick={close} aria-label="Dispensar" className="w-8 h-8 shrink-0 rounded-full bg-ink-800 grid place-items-center text-ink-400"><X size={16} /></button>
    </div>
  );
}

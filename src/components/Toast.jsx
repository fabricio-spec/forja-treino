import { useEffect, useState } from 'react';
import { CheckCircle2, Info } from 'lucide-react';
import { onToast } from '../lib/toast';

export default function Toast() {
  const [t, setT] = useState(null);
  useEffect(() => onToast((x) => { setT(x); try { navigator.vibrate?.(30); } catch {} }), []);
  useEffect(() => { if (!t) return; const h = setTimeout(() => setT(null), 2400); return () => clearTimeout(h); }, [t]);
  if (!t) return null;
  return (
    <div className="fixed inset-x-0 z-[70] flex justify-center px-4 pointer-events-none" style={{ top: 'calc(env(safe-area-inset-top, 0px) + 12px)' }} role="status" aria-live="polite">
      <div key={t.id} className="rise pointer-events-auto max-w-md w-full rounded-2xl bg-ink-850 border border-lime/50 shadow-glow px-4 py-3 flex items-center gap-3">
        {t.tone === 'ok' ? <CheckCircle2 className="text-lime shrink-0" size={22} /> : <Info className="text-volt shrink-0" size={22} />}
        <span className="text-sm font-medium text-ink-100">{t.text}</span>
      </div>
    </div>
  );
}

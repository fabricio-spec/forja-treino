import { ArrowLeft, Minus, Plus } from 'lucide-react';
import { goBack, useBackClose } from '../lib/nav';
import { useEffect } from 'react';

export function Button({ variant = 'primary', size = 'md', className = '', children, ...rest }) {
  const v = {
    primary: 'bg-lime text-ink-950 hover:bg-lime-deep active:scale-[.98] font-semibold',
    volt: 'bg-volt text-ink-950 font-semibold active:scale-[.98]',
    ghost: 'bg-ink-800/80 text-ink-100 hover:bg-ink-700 border border-ink-700',
    outline: 'border border-lime/60 text-lime hover:bg-lime-soft',
    danger: 'bg-danger/15 text-danger border border-danger/40',
    plain: 'text-ink-300 hover:text-ink-100',
  }[variant];
  const s = { sm: 'h-9 px-4 text-sm rounded-full', md: 'h-12 px-5 rounded-full', lg: 'h-14 px-6 text-lg rounded-full' }[size];
  return (
    <button className={`inline-flex items-center justify-center gap-2 transition disabled:opacity-40 ${v} ${s} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export const Card = ({ className = '', children, ...rest }) => (
  <div className={`rounded-3xl bg-ink-900/85 border border-ink-800 backdrop-blur-md ${className}`} {...rest}>{children}</div>
);

export const Label = ({ children, className = '' }) => (
  <span className={`text-[11px] uppercase tracking-[.14em] text-ink-400 font-medium ${className}`}>{children}</span>
);

export function Field({ label, id, className = '', ...rest }) {
  return (
    <label htmlFor={id} className={`flex flex-col gap-1.5 ${className}`}>
      <Label>{label}</Label>
      <input id={id} className="h-12 rounded-2xl bg-ink-850 border border-ink-700 px-4 text-ink-100 placeholder:text-ink-500 focus:border-lime outline-none" {...rest} />
    </label>
  );
}

export function Select({ label, id, children, ...rest }) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <select id={id} className="h-12 rounded-2xl bg-ink-850 border border-ink-700 px-3 text-ink-100 focus:border-lime outline-none" {...rest}>{children}</select>
    </label>
  );
}

/** Campo numérico com botões grandes de − / + (fácil com uma mão). */
export function Stepper({ label, value, onChange, step = 1, min = 0, suffix, id, compact = false }) {
  const bw = compact ? 'w-8' : 'w-11';
  const set = (n) => onChange(Math.max(min, Math.round(n * 100) / 100));
  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      {label && <Label>{label}</Label>}
      <div className="flex items-center h-12 rounded-2xl bg-ink-850 border border-ink-700 overflow-hidden">
        <button type="button" aria-label={`Diminuir ${label ?? ''}`} onClick={() => set((Number(value) || 0) - step)} className={`${bw} shrink-0 h-full grid place-items-center text-ink-300 active:bg-ink-700`}><Minus size={compact ? 15 : 18} /></button>
        <input id={id} inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value.replace(',', '.'))} onBlur={(e) => set(Number(e.target.value) || 0)}
          className={`num flex-1 min-w-0 w-full bg-transparent text-center font-display ${compact ? 'text-xl' : 'text-2xl'} font-bold text-ink-100 outline-none`} />
        {suffix && <span className="text-xs text-ink-400 -ml-1 mr-1">{suffix}</span>}
        <button type="button" aria-label={`Aumentar ${label ?? ''}`} onClick={() => set((Number(value) || 0) + step)} className={`${bw} shrink-0 h-full grid place-items-center text-lime active:bg-ink-700`}><Plus size={compact ? 15 : 18} /></button>
      </div>
    </div>
  );
}

export function Sheet({ open, onClose, title, children, full = false }) {
  useBackClose(open, onClose);
  useEffect(() => {
    if (!open) return;
    const k = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <button aria-label="Fechar" tabIndex={-1} className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`rise relative w-full max-w-lg bg-ink-900 border-t border-x border-ink-700 rounded-t-[28px] flex flex-col ${full ? 'h-[94dvh]' : 'max-h-[88dvh]'}`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="flex items-center gap-2 px-4 pt-4 pb-3">
          <button onClick={onClose} aria-label="Voltar" className="h-10 pl-2.5 pr-3.5 shrink-0 rounded-full bg-ink-800 inline-flex items-center gap-1 text-sm font-medium text-ink-200"><ArrowLeft size={18} /> Voltar</button>
          <h2 className="flex-1 min-w-0 font-display text-xl font-bold uppercase tracking-wide text-ink-100 truncate text-center">{title}</h2>
          <span className="w-[86px] shrink-0" aria-hidden="true" />
        </div>
        <div className="overflow-y-auto px-5 pb-6 flex-1">{children}</div>
      </div>
    </div>
  );
}

/** Botão Voltar no topo das telas (o Início fica na barra inferior). */
export function NavButtons({ className = '', onBack = goBack }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button onClick={onBack} className="h-10 pl-2.5 pr-3.5 rounded-full bg-ink-950/70 border border-ink-700 backdrop-blur inline-flex items-center gap-1 text-sm font-medium text-ink-100"><ArrowLeft size={18} /> Voltar</button>
    </div>
  );
}

/** Cabeçalho com foto escura de fundo. */
export function Hero({ image, eyebrow, title, children, right, home = false }) {
  return (
    <header className="relative overflow-hidden" style={{ marginTop: 'calc(-1 * env(safe-area-inset-top, 0px))' }}>
      <img src={image} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover object-center opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-b from-ink-950/30 via-ink-950/55 to-ink-950" />
      <div className="absolute inset-0 bg-[radial-gradient(120%_70%_at_100%_0%,#c6ff3d22,transparent_60%)]" />
      <div className="relative px-5 pb-6" style={{ paddingTop: `calc(env(safe-area-inset-top, 0px) + ${home ? '2.25rem' : '1rem'})` }}>
        {!home && <NavButtons className="mb-4" />}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {eyebrow && <Label className="text-lime/90">{eyebrow}</Label>}
            <h1 className="font-display text-[44px] leading-[.95] font-extrabold uppercase text-ink-100 mt-1 [text-wrap:balance]">{title}</h1>
          </div>
          {right}
        </div>
        {children}
      </div>
    </header>
  );
}

export const Pill = ({ tone = 'neutral', children, className = '' }) => {
  const t = { neutral: 'bg-ink-800 text-ink-300', lime: 'bg-lime-soft text-lime', volt: 'bg-volt-soft text-volt', warn: 'bg-warn/15 text-warn', danger: 'bg-danger/15 text-danger' }[tone];
  return <span className={`inline-flex items-center gap-1 h-6 px-2.5 rounded-full text-xs font-semibold ${t} ${className}`}>{children}</span>;
};

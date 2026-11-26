import { Dumbbell, LibraryBig, Salad, TrendingUp } from 'lucide-react';

export const TABS = [
  { id: 'treinos', label: 'Meus Treinos', icon: Dumbbell },
  { id: 'biblioteca', label: 'Biblioteca', icon: LibraryBig },
  { id: 'nutricao', label: 'Nutrição', icon: Salad },
  { id: 'evolucao', label: 'Evolução', icon: TrendingUp },
];

export default function BottomNav({ tab, onChange, badge }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-ink-950/92 backdrop-blur-xl border-t border-ink-800"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} aria-label="Navegação principal">
      <ul className="max-w-lg mx-auto grid grid-cols-4">
        {TABS.map(({ id, label, icon: Icon }) => {
          const on = tab === id;
          return (
            <li key={id}>
              <button onClick={() => onChange(id)} aria-current={on ? 'page' : undefined}
                className={`relative w-full h-16 flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition ${on ? 'text-lime' : 'text-ink-400'}`}>
                <span className={`relative grid place-items-center w-12 h-7 rounded-full transition ${on ? 'bg-lime-soft' : ''}`}>
                  <Icon size={21} strokeWidth={on ? 2.4 : 2} />
                  {badge?.[id] ? <span className="absolute -top-0.5 right-1.5 w-2.5 h-2.5 rounded-full bg-warn ring-2 ring-ink-950" /> : null}
                </span>
                {label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

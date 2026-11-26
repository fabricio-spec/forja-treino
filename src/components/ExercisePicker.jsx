import { useMemo, useState } from 'react';
import { Check, Search } from 'lucide-react';
import { GROUPS } from '../lib/seed';
import { Sheet } from './ui';

const norm = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Seletor de exercícios da biblioteca com busca e filtro por grupo. */
export default function ExercisePicker({ open, onClose, onPick, exercises, current, title = 'Escolher exercício', initialGroup }) {
  const [q, setQ] = useState('');
  const [group, setGroup] = useState(initialGroup ?? 'Todos');
  const list = useMemo(() => exercises.filter((e) => (group === 'Todos' || e.group === group) && (!q || norm(e.name).includes(norm(q)))), [exercises, q, group]);
  return (
    <Sheet open={open} onClose={onClose} title={title} full>
      <div className="flex flex-col gap-3">
        <label className="flex items-center gap-2 h-12 rounded-2xl bg-ink-850 border border-ink-700 px-4">
          <Search size={18} className="text-ink-400" />
          <input id="pick-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar na biblioteca" className="flex-1 min-w-0 bg-transparent outline-none text-ink-100 placeholder:text-ink-500" />
        </label>
        <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-5 px-5">
          {['Todos', ...GROUPS].map((g) => (
            <button key={g} onClick={() => setGroup(g)} className={`shrink-0 h-9 px-4 rounded-full text-sm font-medium border ${group === g ? 'bg-lime text-ink-950 border-lime' : 'border-ink-700 text-ink-300'}`}>{g}</button>
          ))}
        </div>
        <ul className="rounded-3xl border border-ink-800 divide-y divide-ink-800 overflow-hidden">
          {list.map((e) => (
            <li key={e.id}>
              <button onClick={() => { onPick(e.id); onClose(); }} className={`w-full flex items-center gap-3 px-4 py-3 text-left active:bg-ink-850 ${e.id === current ? 'bg-lime-soft' : ''}`}>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-ink-100 truncate">{e.name}</span>
                  <span className="block text-xs text-ink-400">{e.group}</span>
                </span>
                {e.id === current && <Check size={18} className="text-lime shrink-0" />}
              </button>
            </li>
          ))}
          {!list.length && <li className="p-6 text-center text-sm text-ink-400">Nada encontrado. Cadastre o exercício na aba Biblioteca.</li>}
        </ul>
      </div>
    </Sheet>
  );
}

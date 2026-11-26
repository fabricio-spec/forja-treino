import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { FOODS, FOOD_GROUPS, kcalOf } from '../lib/foods';
import { Button, Field, Label, Sheet, Stepper } from './ui';
import { uid } from '../lib/utils';

const norm = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export default function FoodPicker({ open, onClose, onPick, customFoods, onCreateFood }) {
  const [q, setQ] = useState('');
  const [group, setGroup] = useState('Todos');
  const [creating, setCreating] = useState(false);
  const [nf, setNf] = useState({ name: '', p: 0, c: 0, f: 0 });

  const all = useMemo(() => [
    ...customFoods.map((f) => ({ ...f, g: 'Meus alimentos' })),
    ...Object.entries(FOODS).map(([id, f]) => ({ id, ...f })),
  ], [customFoods]);
  const groups = ['Todos', ...(customFoods.length ? ['Meus alimentos'] : []), ...FOOD_GROUPS];
  const list = all.filter((f) => (group === 'Todos' || f.g === group) && (!q || norm(f.name).includes(norm(q))));

  const create = (e) => {
    e.preventDefault();
    if (nf.name.trim().length < 2) return;
    const food = { id: uid('food'), name: nf.name.trim(), p: Number(nf.p) || 0, c: Number(nf.c) || 0, f: Number(nf.f) || 0 };
    onCreateFood(food); onPick(food.id); onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title={creating ? 'Novo alimento' : 'Adicionar alimento'} full>
      {creating ? (
        <form onSubmit={create} className="flex flex-col gap-3">
          <Field id="nf-name" label="Nome" value={nf.name} onChange={(e) => setNf({ ...nf, name: e.target.value })} placeholder="Ex.: Crepioca" autoFocus />
          <Label>Valores por 100 g (veja no rótulo)</Label>
          <div className="grid grid-cols-3 gap-2">
            <Stepper id="nf-p" label="Proteína" value={nf.p} step={1} onChange={(v) => setNf({ ...nf, p: v })} compact />
            <Stepper id="nf-c" label="Carbo" value={nf.c} step={1} onChange={(v) => setNf({ ...nf, c: v })} compact />
            <Stepper id="nf-f" label="Gordura" value={nf.f} step={1} onChange={(v) => setNf({ ...nf, f: v })} compact />
          </div>
          <p className="text-sm text-ink-400 num">{Math.round(kcalOf(Number(nf.p) || 0, Number(nf.c) || 0, Number(nf.f) || 0))} kcal por 100 g</p>
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant="ghost" onClick={() => setCreating(false)}>Voltar</Button>
            <Button type="submit" disabled={nf.name.trim().length < 2}><Plus size={16} /> Criar e adicionar</Button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-2 h-12 rounded-2xl bg-ink-850 border border-ink-700 px-4">
            <Search size={18} className="text-ink-400" />
            <input id="food-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar alimento" className="flex-1 min-w-0 bg-transparent outline-none text-ink-100 placeholder:text-ink-500" />
          </label>
          <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-5 px-5">
            {groups.map((g) => (
              <button key={g} onClick={() => setGroup(g)} className={`shrink-0 h-9 px-4 rounded-full text-sm font-medium border ${group === g ? 'bg-lime text-ink-950 border-lime' : 'border-ink-700 text-ink-300'}`}>{g}</button>
            ))}
          </div>
          <Button variant="outline" onClick={() => { setNf({ name: q, p: 0, c: 0, f: 0 }); setCreating(true); }}><Plus size={16} /> Cadastrar alimento que não está na lista</Button>
          <ul className="rounded-3xl border border-ink-800 divide-y divide-ink-800 overflow-hidden">
            {list.map((f) => (
              <li key={f.id}>
                <button onClick={() => { onPick(f.id); onClose(); }} className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-ink-850">
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-ink-100 truncate">{f.name}</span>
                    <span className="block text-xs text-ink-400 num">100 g: {Math.round(kcalOf(f.p, f.c, f.f))} kcal · P {f.p} · C {f.c} · G {f.f}</span>
                  </span>
                  <Plus size={18} className="text-lime shrink-0" />
                </button>
              </li>
            ))}
            {!list.length && <li className="p-6 text-center text-sm text-ink-400">Nada encontrado. Use “Cadastrar alimento”.</li>}
          </ul>
        </div>
      )}
    </Sheet>
  );
}

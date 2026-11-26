import { useState } from 'react';
import { ArrowDown, ArrowUp, Copy, Pencil, Plus, RotateCcw, Trash2, X } from 'lucide-react';
import { useStore } from '../lib/store';
import { FOODS, macrosOf, kcalOf } from '../lib/foods';
import { mealPlan } from '../lib/nutrition';
import { Button, Card, Label, Stepper } from './ui';
import FoodPicker from './FoodPicker';
import { uid } from '../lib/utils';

const COLORS = { kcal: '#eef2f5', p: '#c6ff3d', c: '#2fb8ff', f: '#ffb02e' };
const blankMeals = () => [['Café da manhã', '07:00'], ['Almoço', '12:30'], ['Lanche', '16:00'], ['Jantar', '20:00']].map(([name, time]) => ({ id: uid('meal'), name, time, items: [] }));

/** Metas efetivas: manuais (se definidas) ou as calculadas pelo perfil. */
export function effectiveTargets(diet, plan) {
  const t = diet.targets;
  if (!t) return { protein: plan.protein, carbs: plan.carbs, fat: plan.fat, kcal: plan.kcal, manual: false };
  return { ...t, kcal: Math.round(kcalOf(t.protein, t.carbs, t.fat)), manual: true };
}

export default function CustomPlan({ plan }) {
  const { diet, setDiet } = useStore();
  const [picker, setPicker] = useState(null); // mealId
  const [editTargets, setEditTargets] = useState(false);
  const foodOf = (id) => FOODS[id] ?? diet.customFoods.find((f) => f.id === id);
  const targets = effectiveTargets(diet, plan);

  const setMeals = (fn) => setDiet((d) => ({ ...d, meals: fn(d.meals) }));
  const patchMeal = (id, patch) => setMeals((ms) => ms.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  const patchItem = (mid, iid, patch) => setMeals((ms) => ms.map((m) => (m.id === mid ? { ...m, items: m.items.map((i) => (i.id === iid ? { ...i, ...patch } : i)) } : m)));
  const moveMeal = (i, d) => setMeals((ms) => { const a = [...ms]; const j = i + d; if (j < 0 || j >= a.length) return ms; [a[i], a[j]] = [a[j], a[i]]; return a; });

  const copyAuto = () => setMeals(() => mealPlan(plan).map((m) => ({ id: uid('meal'), name: m.name, time: m.time, items: m.items.filter((i) => i.key).map((i) => ({ id: uid('it'), foodId: i.key, grams: i.g })) })));

  const mealTotals = (m) => m.items.reduce((t, i) => { const x = macrosOf(foodOf(i.foodId), i.grams); return { p: t.p + x.p, c: t.c + x.c, f: t.f + x.f, kcal: t.kcal + x.kcal }; }, { p: 0, c: 0, f: 0, kcal: 0 });
  const totals = diet.meals.map(mealTotals).reduce((t, x) => ({ p: t.p + x.p, c: t.c + x.c, f: t.f + x.f, kcal: t.kcal + x.kcal }), { p: 0, c: 0, f: 0, kcal: 0 });

  return (
    <div className="flex flex-col gap-4">
      {/* Metas */}
      <Card className="p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div><Label>Metas diárias</Label><div className="text-xs text-ink-500">{targets.manual ? 'Definidas por você' : 'Calculadas pelo seu perfil'}</div></div>
          <Button size="sm" variant="ghost" onClick={() => { if (!diet.targets) setDiet((d) => ({ ...d, targets: { protein: plan.protein, carbs: plan.carbs, fat: plan.fat } })); setEditTargets((x) => !x); }}>
            <Pencil size={14} /> {editTargets ? 'Fechar' : 'Ajustar'}
          </Button>
        </div>
        {editTargets && diet.targets && (
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-3 gap-2">
              <Stepper id="t-p" label="Proteína g" value={diet.targets.protein} step={5} compact onChange={(v) => setDiet((d) => ({ ...d, targets: { ...d.targets, protein: v } }))} />
              <Stepper id="t-c" label="Carbo g" value={diet.targets.carbs} step={5} compact onChange={(v) => setDiet((d) => ({ ...d, targets: { ...d.targets, carbs: v } }))} />
              <Stepper id="t-f" label="Gordura g" value={diet.targets.fat} step={5} compact onChange={(v) => setDiet((d) => ({ ...d, targets: { ...d.targets, fat: v } }))} />
            </div>
            <Button size="sm" variant="plain" onClick={() => { setDiet((d) => ({ ...d, targets: null })); setEditTargets(false); }}><RotateCcw size={14} /> Voltar às metas calculadas</Button>
          </div>
        )}
        <Bars totals={totals} targets={targets} />
      </Card>

      {!diet.meals.length ? (
        <Card className="p-5 flex flex-col gap-3 text-center">
          <p className="text-ink-200 font-semibold">Monte o seu plano alimentar</p>
          <p className="text-sm text-ink-400">Comece com uma cópia do plano sugerido e ajuste, ou crie as refeições do zero escolhendo cada alimento.</p>
          <Button onClick={copyAuto}><Copy size={16} /> Copiar plano sugerido</Button>
          <Button variant="ghost" onClick={() => setMeals(blankMeals)}><Plus size={16} /> Começar do zero</Button>
        </Card>
      ) : diet.meals.map((m, mi) => {
        const t = mealTotals(m);
        return (
          <Card key={m.id} className="p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <input aria-label="Nome da refeição" value={m.name} onChange={(e) => patchMeal(m.id, { name: e.target.value })}
                className="flex-1 min-w-0 h-10 bg-transparent font-display text-xl font-bold uppercase text-ink-100 outline-none border-b border-transparent focus:border-lime" />
              <span className="flex gap-1 shrink-0">
                <Mini label="Subir refeição" onClick={() => moveMeal(mi, -1)}><ArrowUp size={14} /></Mini>
                <Mini label="Descer refeição" onClick={() => moveMeal(mi, 1)}><ArrowDown size={14} /></Mini>
                <Mini label="Remover refeição" danger onClick={() => setMeals((ms) => ms.filter((x) => x.id !== m.id))}><Trash2 size={14} /></Mini>
              </span>
            </div>
            <label className="flex items-center gap-2 -mt-1 text-xs text-ink-400">Horário
              <input aria-label="Horário" type="time" value={m.time} onChange={(e) => patchMeal(m.id, { time: e.target.value })}
                className="num w-[120px] h-9 rounded-xl bg-ink-850 border border-ink-700 px-2 text-sm text-ink-100" />
            </label>
            <ul className="flex flex-col gap-2">
              {m.items.map((it) => {
                const food = foodOf(it.foodId);
                const x = macrosOf(food, it.grams);
                return (
                  <li key={it.id} className="rounded-2xl bg-ink-850 border border-ink-800 p-2.5 flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-ink-100 truncate">{food?.name ?? 'Alimento removido'}</span>
                        <span className="block text-[11px] text-ink-400 num">{Math.round(x.kcal)} kcal · P {Math.round(x.p)} · C {Math.round(x.c)} · G {Math.round(x.f)}{food?.unit ? ` · ≈ ${(it.grams / food.unitG).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} ${food.unit}` : ''}</span>
                      </span>
                      <Mini label="Remover alimento" danger onClick={() => patchMeal(m.id, { items: m.items.filter((i) => i.id !== it.id) })}><X size={14} /></Mini>
                    </div>
                    <Stepper id={`g-${it.id}`} value={it.grams} step={food?.unitG ?? 10} suffix="g" onChange={(v) => patchItem(m.id, it.id, { grams: v })} compact />
                  </li>
                );
              })}
            </ul>
            <div className="flex items-center justify-between gap-2">
              <Button size="sm" variant="outline" onClick={() => setPicker(m.id)}><Plus size={15} /> Alimento</Button>
              <span className="num text-xs text-ink-400">{Math.round(t.kcal)} kcal · P {Math.round(t.p)} · C {Math.round(t.c)} · G {Math.round(t.f)}</span>
            </div>
          </Card>
        );
      })}

      {diet.meals.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          <Button variant="ghost" onClick={() => setMeals((ms) => [...ms, { id: uid('meal'), name: 'Nova refeição', time: '12:00', items: [] }])}><Plus size={16} /> Refeição</Button>
          <Button variant="plain" onClick={copyAuto}><Copy size={15} /> Recopiar sugerido</Button>
        </div>
      )}

      <FoodPicker key={picker ?? 'closed'} open={!!picker} onClose={() => setPicker(null)} customFoods={diet.customFoods}
        onCreateFood={(f) => setDiet((d) => ({ ...d, customFoods: [...d.customFoods, f] }))}
        onPick={(foodId) => { const food = foodOf(foodId) ?? { unitG: null }; patchMeal(picker, { items: [...(diet.meals.find((m) => m.id === picker)?.items ?? []), { id: uid('it'), foodId, grams: food.unitG ?? 100 }] }); }} />
    </div>
  );
}

function Bars({ totals, targets }) {
  const rows = [['kcal', 'Calorias', totals.kcal, targets.kcal, 'kcal'], ['p', 'Proteínas', totals.p, targets.protein, 'g'], ['c', 'Carboidratos', totals.c, targets.carbs, 'g'], ['f', 'Gorduras', totals.f, targets.fat, 'g']];
  return (
    <div className="flex flex-col gap-2.5">
      {rows.map(([k, label, v, t, u]) => {
        const pct = t ? (v / t) * 100 : 0;
        const over = pct > 110;
        return (
          <div key={k}>
            <div className="flex justify-between text-sm"><span className="text-ink-200">{label}</span>
              <span className={`num ${over ? 'text-warn' : 'text-ink-300'}`}><b className="text-ink-100">{Math.round(v).toLocaleString('pt-BR')}</b> / {Math.round(t).toLocaleString('pt-BR')} {u}</span></div>
            <div className="h-2 mt-1 rounded-full bg-ink-800 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${Math.min(100, pct)}%`, background: over ? '#ffb02e' : COLORS[k] }} /></div>
          </div>
        );
      })}
    </div>
  );
}

const Mini = ({ label, danger, ...p }) => (
  <button aria-label={label} className={`w-8 h-8 shrink-0 rounded-xl grid place-items-center bg-ink-800 ${danger ? 'text-danger' : 'text-ink-300'}`} {...p} />
);

import { useState } from 'react';
import { Droplets, Pencil, RefreshCcw, Utensils } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useStore } from '../lib/store';
import { BG } from '../lib/images';
import { calcPlan, mealPlan, SUBSTITUTIONS } from '../lib/nutrition';
import { Button, Card, Hero, Label, Pill, Sheet } from '../components/ui';
import ProfileSheet from '../components/ProfileSheet';
import CustomPlan, { effectiveTargets } from '../components/CustomPlan';

const MACRO_COLORS = { p: '#c6ff3d', c: '#2fb8ff', f: '#ffb02e' };

export default function Nutrition() {
  const { profile, diet, setDiet } = useStore();
  const [editing, setEditing] = useState(false);
  const plan = calcPlan(profile);

  if (!plan) return null;
  const meals = mealPlan(plan);
  const custom = diet.mode === 'custom';
  const tgt = effectiveTargets(diet, plan);
  const macros = [
    { k: 'p', name: 'Proteínas', g: plan.protein, kcal: plan.protein * 4 },
    { k: 'c', name: 'Carboidratos', g: plan.carbs, kcal: plan.carbs * 4 },
    { k: 'f', name: 'Gorduras', g: plan.fat, kcal: plan.fat * 9 },
  ];

  return (
    <>
      <Hero image={BG.nutricao} eyebrow={plan.goal.label} title="Nutrição"
        right={<Button size="sm" variant="ghost" className="mt-6" onClick={() => setEditing(true)}><Pencil size={15} /> Perfil</Button>}>
        <div className="mt-5 flex items-end gap-2">
          <span className="num font-display text-[72px] leading-[.85] font-extrabold text-lime">{(custom ? tgt.kcal : plan.kcal).toLocaleString('pt-BR')}</span>
          <span className="text-ink-300 pb-1.5">kcal / dia</span>
        </div>
        <p className="text-sm text-ink-300 mt-2">{profile.weight} kg · {profile.height} cm · {profile.age} anos · atividade {plan.act.label.toLowerCase()}</p>
      </Hero>

      <div className="px-4 flex flex-col gap-4">
        <div className="grid grid-cols-2 rounded-full bg-ink-900 border border-ink-800 p-1" role="tablist" aria-label="Tipo de plano">
          {[['auto', 'Plano sugerido'], ['custom', 'Meu plano']].map(([m, l]) => (
            <button key={m} role="tab" aria-selected={diet.mode === m} onClick={() => setDiet((d) => ({ ...d, mode: m }))}
              className={`h-10 rounded-full text-sm font-semibold transition ${diet.mode === m ? 'bg-lime text-ink-950' : 'text-ink-400'}`}>{l}</button>
          ))}
        </div>

        {custom ? <CustomPlan plan={plan} /> : <>
        <Card className="p-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <Metric label="Basal (TMB)" value={plan.bmr} unit="kcal" />
            <Metric label="Gasto total" value={plan.tdee} unit="kcal" />
            <Metric label="Ajuste" value={`${plan.goal.adj > 0 ? '+' : ''}${Math.round(plan.goal.adj * 100)}%`} unit={plan.goal.adj > 0 ? 'superávit' : plan.goal.adj < 0 ? 'déficit' : 'neutro'} />
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="w-32 h-32 shrink-0 relative">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={macros} dataKey="kcal" innerRadius={42} outerRadius={60} paddingAngle={3} stroke="none" startAngle={90} endAngle={-270} isAnimationActive={false}>
                  {macros.map((m) => <Cell key={m.k} fill={MACRO_COLORS[m.k]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 grid place-items-center text-center"><div><div className="num font-display text-2xl font-bold">{plan.protein}g</div><div className="text-[10px] text-ink-400 uppercase tracking-wider">proteína</div></div></div>
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-3">
            {macros.map((m) => (
              <div key={m.k}>
                <div className="flex justify-between text-sm"><span className="flex items-center gap-2"><i className="w-2.5 h-2.5 rounded-full" style={{ background: MACRO_COLORS[m.k] }} />{m.name}</span><span className="num font-semibold">{m.g} g</span></div>
                <div className="text-xs text-ink-500 num">{Math.round((m.kcal / plan.kcal) * 100)}% · {(m.g / profile.weight).toFixed(1).replace('.', ',')} g/kg</div>
              </div>
            ))}
          </div>
        </Card>

        </>}
        {!custom && <AutoMeals meals={meals} />}

        <div className="flex items-center gap-3 rounded-3xl border border-volt/30 bg-volt-soft/40 px-4 py-3">
          <Droplets className="text-volt shrink-0" />
          <p className="text-sm text-ink-200">Água: cerca de <b className="num">{(plan.water / 1000).toFixed(1).replace('.', ',')} L</b> por dia (35 ml/kg), mais nos dias de treino.</p>
        </div>

        <div className="flex items-center gap-2 mt-2"><RefreshCcw size={14} className="text-lime" /><Label>Substituições equivalentes</Label></div>
        <div className="grid grid-cols-1 gap-3">
          {SUBSTITUTIONS.map((s) => (
            <Card key={s.group} className="p-4">
              <div className="font-semibold text-ink-100 mb-2">{s.group}</div>
              <div className="flex flex-wrap gap-1.5">{s.items.map((i) => <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-ink-800 text-ink-200">{i}</span>)}</div>
            </Card>
          ))}
        </div>
        <p className="text-xs text-ink-500 leading-relaxed">Estimativas pela fórmula de Mifflin-St Jeor. São um ponto de partida: ajuste conforme a evolução do peso a cada 2–3 semanas e, se possível, acompanhe com um nutricionista.</p>
      </div>

      {editing && <ProfileSheet open onClose={() => setEditing(false)} />}
    </>
  );
}

const Metric = ({ label, value, unit }) => (
  <div>
    <Label>{label}</Label>
    <div className="num font-display text-2xl font-bold mt-0.5">{typeof value === 'number' ? value.toLocaleString('pt-BR') : value}</div>
    <div className="text-[11px] text-ink-500">{unit}</div>
  </div>
);

function AutoMeals({ meals }) {
  return (
    <>
        <div className="flex items-center justify-between mt-2"><Label>Plano alimentar sugerido</Label><Pill><Utensils size={12} /> {meals.length} refeições</Pill></div>
        <ol className="relative flex flex-col gap-3 before:absolute before:left-[27px] before:top-3 before:bottom-3 before:w-px before:bg-ink-800">
          {meals.map((m) => (
            <li key={m.name} className="relative flex gap-3">
              <span className="num relative z-10 w-14 shrink-0 h-8 mt-3 rounded-full bg-ink-850 border border-ink-700 grid place-items-center text-xs font-semibold text-ink-200">{m.time}</span>
              <Card className="flex-1 min-w-0 p-4">
                <div className="flex justify-between items-baseline gap-2">
                  <span className="font-display text-xl font-bold uppercase">{m.name}</span>
                  <span className="num text-sm text-ink-400 shrink-0">{m.kcal} kcal</span>
                </div>
                <ul className="mt-2 flex flex-col gap-1">
                  {m.items.map((it, i) => (
                    <li key={i} className="flex justify-between gap-3 text-sm"><span className="text-ink-200 truncate">{it.food}</span><span className="num text-ink-100 font-medium shrink-0">{it.text}</span></li>
                  ))}
                  {m.extra && <li className="text-xs text-ink-400 mt-1">+ {m.extra}</li>}
                </ul>
                <div className="num flex gap-3 mt-3 text-[11px] text-ink-400">
                  <span><b style={{ color: MACRO_COLORS.p }}>P</b> {m.macros.p}g</span>
                  <span><b style={{ color: MACRO_COLORS.c }}>C</b> {m.macros.c}g</span>
                  <span><b style={{ color: MACRO_COLORS.f }}>G</b> {m.macros.f}g</span>
                </div>
              </Card>
            </li>
          ))}
        </ol>

    </>
  );
}

import { ACTIVITY, GOALS } from '../lib/nutrition';
import { Field, Label, Stepper } from './ui';

export default function ProfileForm({ value: p, onChange }) {
  const set = (k) => (v) => onChange({ ...p, [k]: v });
  return (
    <div className="flex flex-col gap-4">
      <Field id="pf-name" label="Seu nome (opcional)" value={p.name} onChange={(e) => set('name')(e.target.value)} placeholder="Como quer ser chamado" />
      <div className="flex flex-col gap-1.5">
        <Label>Sexo biológico (para o cálculo)</Label>
        <div className="grid grid-cols-2 gap-2">
          {[['M', 'Masculino'], ['F', 'Feminino']].map(([v, l]) => (
            <button type="button" key={v} onClick={() => set('sex')(v)} className={`h-12 rounded-2xl border font-medium ${p.sex === v ? 'bg-lime text-ink-950 border-lime' : 'border-ink-700 text-ink-300'}`}>{l}</button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stepper id="pf-w" compact label="Peso kg" value={p.weight} step={0.5} onChange={set('weight')} />
        <Stepper id="pf-h" compact label="Altura cm" value={p.height} onChange={set('height')} />
        <Stepper id="pf-a" compact label="Idade" value={p.age} onChange={set('age')} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Nível de atividade</Label>
        <div className="flex flex-col gap-1.5">
          {ACTIVITY.map((a) => (
            <button type="button" key={a.id} onClick={() => set('activity')(a.id)} className={`flex justify-between items-center gap-3 px-4 h-12 rounded-2xl border text-left ${p.activity === a.id ? 'border-lime bg-lime-soft' : 'border-ink-700'}`}>
              <span className="font-medium text-ink-100">{a.label}</span><span className="text-xs text-ink-400 truncate">{a.hint}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Objetivo</Label>
        <div className="grid grid-cols-2 gap-2">
          {GOALS.map((g) => (
            <button type="button" key={g.id} onClick={() => set('goal')(g.id)} className={`p-3 rounded-2xl border text-left ${p.goal === g.id ? 'border-lime bg-lime-soft' : 'border-ink-700'}`}>
              <span className="block font-semibold text-ink-100 text-sm leading-tight">{g.label}</span>
              <span className="block text-xs text-ink-400 mt-1">{g.hint}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

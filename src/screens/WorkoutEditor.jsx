import { useState } from 'react';
import { ArrowDown, ArrowUp, ChevronDown, Dumbbell, Info, Plus, Repeat, Save, Trash2, X } from 'lucide-react';
import { useStore } from '../lib/store';
import { Button, Field, Label, Sheet, Stepper } from '../components/ui';
import ExercisePicker from '../components/ExercisePicker';
import { uid, circuitName } from '../lib/utils';
import { toast } from '../lib/toast';

const MAX_IN_CIRCUIT = 6;
const newItem = (exerciseId, sets = 3) => ({ exerciseId, sets, reps: 12, load: 10 });

export default function WorkoutEditor({ id, onClose, seedExercise }) {
  const { workouts, exercises, exById, upsertWorkout, deleteWorkout } = useStore();
  const existing = workouts.find((w) => w.id === id);
  const [w, setW] = useState(() => existing ? structuredClone(existing) : {
    id: uid('w'), name: `Treino ${String.fromCharCode(65 + workouts.length)}`, focus: '', color: 'lime', createdAt: new Date().toISOString(),
    blocks: seedExercise ? [{ id: uid('blk'), type: 'single', rest: 60, items: [newItem(seedExercise, 3)] }] : [],
  });
  const [confirmDel, setConfirmDel] = useState(false);
  // picker: { mode: 'swap', bi, ii } | { mode: 'add', bi } | { mode: 'new', n }
  const [picker, setPicker] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [help, setHelp] = useState(false);

  const setBlock = (bi, patch) => setW((x) => ({ ...x, blocks: x.blocks.map((b, i) => (i === bi ? { ...b, ...patch } : b)) }));
  const setItem = (bi, ii, patch) => setW((x) => ({ ...x, blocks: x.blocks.map((b, i) => (i === bi ? { ...b, items: b.items.map((it, j) => (j === ii ? { ...it, ...patch } : it)) } : b)) }));
  const removeItem = (bi, ii) => setW((x) => ({ ...x, blocks: x.blocks.map((b, i) => {
    if (i !== bi) return b;
    const items = b.items.filter((_, j) => j !== ii);
    return items.length === 1 ? { ...b, type: 'single', items: [{ ...items[0], sets: b.sets ?? items[0].sets }] } : { ...b, items };
  }).filter((b) => b.items.length) }));
  const move = (bi, d) => setW((x) => { const a = [...x.blocks]; const j = bi + d; if (j < 0 || j >= a.length) return x; [a[bi], a[j]] = [a[j], a[bi]]; return { ...x, blocks: a }; });
  const moveItem = (bi, ii, d) => setW((x) => ({ ...x, blocks: x.blocks.map((b, i) => { if (i !== bi) return b; const a = [...b.items]; const j = ii + d; if (j < 0 || j >= a.length) return b; [a[ii], a[j]] = [a[j], a[ii]]; return { ...b, items: a }; }) }));
  const remove = (bi) => setW((x) => ({ ...x, blocks: x.blocks.filter((_, i) => i !== bi) }));

  const onPick = (exId) => {
    if (!picker) return;
    const name = exById(exId)?.name ?? 'Exercício';
    if (picker.mode === 'swap') {
      setItem(picker.bi, picker.ii, { exerciseId: exId });
      setPicker(null);
      toast(`Trocado por ${name}`);
      return;
    }
    let bi = picker.bi, count, isCircuit, target = picker.target;
    if (picker.mode === 'new') {
      const n = picker.n;
      const block = n === 1
        ? { id: uid('blk'), type: 'single', rest: 60, items: [newItem(exId, 3)] }
        : { id: uid('blk'), type: 'triset', label: '', rest: 90, sets: 4, items: [newItem(exId, 4)] };
      bi = w.blocks.length;
      setW((x) => ({ ...x, blocks: [...x.blocks, block] }));
      count = 1; isCircuit = n > 1; target = n;
      setPicker(n > 1 ? { mode: 'add', bi, target: n } : { mode: 'new', n: 1, lastBi: bi });
    } else {
      const b = w.blocks[bi];
      setW((x) => ({ ...x, blocks: x.blocks.map((blk, i) => i !== bi ? blk : { ...blk, type: 'triset', sets: blk.sets ?? blk.items[0].sets, label: blk.label ?? '', items: [...blk.items, newItem(exId, blk.sets ?? blk.items[0].sets)] }) }));
      count = (b?.items.length ?? 0) + 1; isCircuit = true;
    }
    const kind = isCircuit ? circuitName(count) : 'Exercício isolado';
    const left = target ? target - count : 0;
    const missing = left > 0 ? ` · ${left === 1 ? 'falta 1' : `faltam ${left}`} para completar ${circuitName(target) === 'Série gigante' ? 'a série gigante' : `o ${circuitName(target)}`}` : '';
    setConfirm({ name, detail: isCircuit ? `${kind} com ${count} exercício${count > 1 ? 's' : ''}${missing}` : 'Exercício isolado · 3 séries de 12', canAddMore: !isCircuit || count < MAX_IN_CIRCUIT });
  };
  const closePicker = () => { setPicker(null); setConfirm(null); };
  const doneSeries = () => {
    closePicker();
    if (w.name.trim()) { upsertWorkout(clean(w)); toast('Série salva na ficha!'); }
    else toast('Série adicionada. Dê um nome à ficha para salvar.', 'info');
  };
  const pickerSelected = picker && picker.mode === 'add' ? (w.blocks[picker.bi]?.items ?? []).map((i) => i.exerciseId) : [];

  const clean = (x) => ({ ...x, sample: false, focus: x.focus.trim() || 'Treino', blocks: x.blocks.map(({ want, ...b }) => b) });
  const valid = w.name.trim() && w.blocks.length > 0;
  const save = () => { if (!valid) return; upsertWorkout(clean(w)); toast(`${w.name.trim()} salvo!`); onClose(); };
  const pickerTarget = picker?.mode === 'swap' ? w.blocks[picker.bi]?.items[picker.ii]?.exerciseId : null;
  const pickerGroup = pickerTarget ? exById(pickerTarget)?.group : undefined;
  const pickerTitle = !picker ? '' : picker.mode === 'swap' ? 'Trocar exercício'
    : picker.mode === 'new' ? (picker.n === 1 ? 'Exercício isolado' : `Montar ${circuitName(picker.n)}`)
    : `${circuitName((w.blocks[picker.bi]?.items.length ?? 0) + 1)}: escolha o ${(w.blocks[picker.bi]?.items.length ?? 0) + 1}º`;

  return (
    <Sheet open onClose={onClose} title={existing ? 'Editar ficha' : 'Montar ficha'} full>
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-3">
          <Field id="wname" label="Nome" value={w.name} onChange={(e) => setW({ ...w, name: e.target.value })} placeholder="Treino A" />
          <Field id="wdate" label="Data de criação" type="date" value={w.createdAt.slice(0, 10)}
            onChange={(e) => e.target.value && setW({ ...w, createdAt: new Date(e.target.value + 'T12:00:00').toISOString() })} />
        </div>
        <Field id="wfocus" label="Grupo muscular alvo" value={w.focus} onChange={(e) => setW({ ...w, focus: e.target.value })} placeholder="Ex.: Pernas e Ombros" />
        <div className="flex gap-2">
          {[['lime', 'bg-lime'], ['volt', 'bg-volt']].map(([c, cls]) => (
            <button key={c} onClick={() => setW({ ...w, color: c })} aria-label={`Cor ${c}`}
              className={`w-9 h-9 rounded-full ${cls} ${w.color === c ? 'ring-2 ring-offset-2 ring-offset-ink-900 ring-ink-100' : 'opacity-60'}`} />
          ))}
        </div>

        <div className="flex items-center justify-between">
          <Label>Blocos ({w.blocks.length})</Label>
          <button onClick={() => setHelp((h) => !h)} className="inline-flex items-center gap-1 text-xs text-volt"><Info size={14} /> Como funciona o circuito <ChevronDown size={14} className={help ? 'rotate-180' : ''} /></button>
        </div>
        {help && (
          <div className="rounded-2xl border border-volt/30 bg-volt-soft/30 p-3 text-sm text-ink-200 leading-relaxed -mt-2">
            Num <b>Tri-set</b> (3 exercícios) ou <b>Série gigante</b> (4 ou mais), você faz todos os exercícios do bloco em sequência, sem pausa. Isso é uma <b>rodada</b>. Só então descansa (normalmente 60 a 120 s) e repete. Ex.: 4 rodadas de 4 exercícios = 16 séries com 3 descansos. Ótimo para treinos densos, com gasto calórico maior e foco em definição.
          </div>
        )}

        {w.blocks.map((b, bi) => {
          const circuit = b.type === 'triset';
          const n = b.items.length;
          return (
            <div key={b.id} className={`rounded-3xl border p-3 flex flex-col gap-3 ${circuit ? 'border-volt/40 bg-volt-soft/20' : 'border-ink-700 bg-ink-850'}`}>
              <div className="flex items-center justify-between gap-2">
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[.16em] ${circuit ? 'text-volt' : 'text-lime'}`}>
                  {circuit ? <Repeat size={14} /> : <Dumbbell size={14} />} {bi + 1}. {circuit ? `${circuitName(n)} · ${n} exercícios` : 'Exercício isolado'}
                </span>
                <span className="flex gap-1">
                  <IconBtn label="Subir bloco" onClick={() => move(bi, -1)}><ArrowUp size={16} /></IconBtn>
                  <IconBtn label="Descer bloco" onClick={() => move(bi, 1)}><ArrowDown size={16} /></IconBtn>
                  <IconBtn label="Remover bloco" onClick={() => remove(bi)} danger><Trash2 size={16} /></IconBtn>
                </span>
              </div>

              {circuit && (
                <>
                  <Field id={`lbl-${b.id}`} label="Nome do subgrupo (opcional)" value={b.label ?? ''} onChange={(e) => setBlock(bi, { label: e.target.value })} placeholder="Ex.: Quadríceps, Peito superior" />
                  <div className="grid grid-cols-2 gap-2">
                    <Stepper id={`ts-${b.id}`} label="Rodadas" value={b.sets} onChange={(v) => setBlock(bi, { sets: Math.max(1, v) })} min={1} />
                    <Stepper id={`rest-${b.id}`} label="Descanso pós-rodada" value={b.rest} step={15} suffix="s" onChange={(v) => setBlock(bi, { rest: v })} />
                  </div>
                </>
              )}

              <ol className="flex flex-col gap-2">
                {b.items.map((it, ii) => (
                  <li key={ii} className={`flex flex-col gap-2 ${circuit ? 'rounded-2xl bg-ink-900/80 border border-ink-800 p-2.5' : ''}`}>
                    <div className="flex items-center gap-2">
                      {circuit && <span className="font-display text-xl font-bold text-volt w-5 text-center shrink-0">{ii + 1}</span>}
                      <button onClick={() => setPicker({ mode: 'swap', bi, ii })} className="flex-1 min-w-0 h-11 rounded-xl bg-ink-850 border border-ink-700 px-3 flex items-center justify-between gap-2 text-left">
                        <span className="truncate text-ink-100">{exById(it.exerciseId)?.name ?? 'Escolher exercício'}</span>
                        <span className="text-[11px] text-ink-400 shrink-0">{exById(it.exerciseId)?.group}</span>
                      </button>
                      {circuit && (
                        <span className="flex gap-1 shrink-0">
                          <IconBtn label="Subir exercício" onClick={() => moveItem(bi, ii, -1)} small><ArrowUp size={14} /></IconBtn>
                          <IconBtn label="Remover exercício" onClick={() => removeItem(bi, ii)} danger small><X size={14} /></IconBtn>
                        </span>
                      )}
                    </div>
                    <div className={`grid gap-2 ${circuit ? 'grid-cols-2' : 'grid-cols-3'}`}>
                      {!circuit && <Stepper id={`s-${b.id}`} label="Séries" value={it.sets} onChange={(v) => setItem(bi, ii, { sets: v })} min={1} />}
                      <Stepper id={`r-${b.id}-${ii}`} label="Reps" value={it.reps} onChange={(v) => setItem(bi, ii, { reps: v })} min={1} />
                      <Stepper id={`l-${b.id}-${ii}`} label="Carga kg" value={it.load} step={2.5} onChange={(v) => setItem(bi, ii, { load: v })} />
                    </div>
                  </li>
                ))}
              </ol>

              {!circuit && <Stepper id={`rest-${b.id}`} label="Descanso entre séries" value={b.rest} step={15} suffix="s" onChange={(v) => setBlock(bi, { rest: v })} />}
              {n < MAX_IN_CIRCUIT && (
                <Button variant="ghost" size="sm" onClick={() => setPicker({ mode: 'add', bi })} className="!border-volt/40 !text-volt">
                  <Plus size={15} /> {circuit ? `Adicionar ${n + 1}º exercício` : 'Transformar em circuito (adicionar exercício)'}
                </Button>
              )}
              {circuit && <p className="text-xs text-ink-400 -mt-1 num">{b.sets} rodadas × {n} exercícios = {b.sets * n} séries · descanso de {b.rest}s só ao fim de cada rodada</p>}
            </div>
          );
        })}

        <div className="flex flex-col gap-2">
          <Label>Adicionar bloco</Label>
          <div className="grid grid-cols-3 gap-2">
            {[[3, 'Tri-set', '3 exercícios'], [4, 'Série gigante', '4 exercícios'], [1, 'Isolado', '1 exercício']].map(([n, t, sub]) => (
              <button key={n} onClick={() => setPicker({ mode: 'new', n })}
                className={`rounded-2xl border p-3 text-left flex flex-col gap-1 ${n > 1 ? 'border-volt/40 bg-volt-soft/20' : 'border-ink-700 bg-ink-850'}`}>
                {n > 1 ? <Repeat size={18} className="text-volt" /> : <Dumbbell size={18} className="text-lime" />}
                <span className="font-semibold text-sm text-ink-100 leading-tight">{t}</span>
                <span className="text-[11px] text-ink-400">{sub}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 sticky bottom-0 bg-ink-900 pt-2">
          <Button size="lg" onClick={save} disabled={!valid}><Save size={18} /> Salvar ficha</Button>
          {existing && (confirmDel
            ? <div className="grid grid-cols-2 gap-2"><Button variant="ghost" onClick={() => setConfirmDel(false)}>Cancelar</Button><Button variant="danger" onClick={() => { deleteWorkout(w.id); onClose(); }}>Confirmar exclusão</Button></div>
            : <Button variant="plain" onClick={() => setConfirmDel(true)}><Trash2 size={16} /> Excluir ficha</Button>)}
        </div>
      </div>

      <ExercisePicker key={picker ? 'open' : 'closed'} open={!!picker} onClose={closePicker} onPick={onPick} exercises={exercises}
        current={pickerTarget} initialGroup={pickerGroup} title={pickerTitle} selectedIds={pickerSelected}
        confirm={confirm} onMore={() => setConfirm(null)} onDone={doneSeries} />
    </Sheet>
  );
}

const IconBtn = ({ label, danger, small, ...p }) => (
  <button aria-label={label} className={`${small ? 'w-8 h-8' : 'w-9 h-9'} rounded-xl grid place-items-center bg-ink-800 ${danger ? 'text-danger' : 'text-ink-300'}`} {...p} />
);

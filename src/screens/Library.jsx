import { useMemo, useState } from 'react';
import { ChevronRight, Link2, ListPlus, Plus, Search, Trash2, Youtube } from 'lucide-react';
import { useStore } from '../lib/store';
import { GROUPS } from '../lib/seed';
import { BG } from '../lib/images';
import { Button, Field, Hero, Label, Pill, Select, Sheet } from '../components/ui';
import YouTubeEmbed from '../components/YouTubeEmbed';
import { demoFrames } from '../lib/demos';
import { uid, youtubeId, isValidMediaUrl } from '../lib/utils';
import { toast } from '../lib/toast';

export default function Library({ onNewWorkoutWith, onEdit }) {
  const { exercises, addExercise, updateExercise, deleteExercise, workouts, upsertWorkout } = useStore();
  const [q, setQ] = useState('');
  const [group, setGroup] = useState('Todos');
  const [open, setOpen] = useState(null);
  const [creating, setCreating] = useState(false);

  const list = useMemo(() => {
    const n = q.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    return exercises.filter((e) => (group === 'Todos' || e.group === group) && (!n || e.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(n)));
  }, [exercises, q, group]);

  const byGroup = GROUPS.map((g) => [g, list.filter((e) => e.group === g)]).filter(([, l]) => l.length);
  const current = open && exercises.find((e) => e.id === open);

  return (
    <>
      <Hero image={BG.biblioteca} eyebrow={`${exercises.length} exercícios`} title="Biblioteca"
        right={<Button size="sm" onClick={() => setCreating(true)} className="mt-6"><Plus size={16} /> Novo</Button>}>
        <label className="mt-5 flex items-center gap-2 h-12 rounded-2xl bg-ink-950/70 border border-ink-700 px-4 backdrop-blur">
          <Search size={18} className="text-ink-400" />
          <input id="lib-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar exercício" className="flex-1 min-w-0 bg-transparent outline-none text-ink-100 placeholder:text-ink-500" />
        </label>
      </Hero>

      <div className="sticky z-30 bg-ink-950/95 backdrop-blur border-b border-ink-850" style={{ top: 'env(safe-area-inset-top, 0px)' }}>
        <div className="flex gap-2 overflow-x-auto scrollbar-none px-4 py-3">
          {['Todos', ...GROUPS].map((g) => (
            <button key={g} onClick={() => setGroup(g)} className={`shrink-0 h-9 px-4 rounded-full text-sm font-medium border transition ${group === g ? 'bg-lime text-ink-950 border-lime' : 'border-ink-700 text-ink-300'}`}>{g}</button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-6">
        {byGroup.map(([g, l]) => (
          <section key={g} className="flex flex-col gap-2">
            <Label>{g} · {l.length}</Label>
            <ul className="rounded-3xl border border-ink-800 bg-ink-900 divide-y divide-ink-800 overflow-hidden">
              {l.map((e) => (
                <li key={e.id}>
                  <button onClick={() => setOpen(e.id)} className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-ink-850">
                    {demoFrames(e.id) ? <img src={demoFrames(e.id)[0]} alt="" loading="lazy" className="w-14 h-11 shrink-0 rounded-xl object-cover bg-white" />
                      : <span className={`w-14 h-11 shrink-0 rounded-xl grid place-items-center ${isValidMediaUrl(e.videoUrl) ? 'bg-lime-soft text-lime' : 'bg-ink-800 text-ink-500'}`}><Youtube size={20} /></span>}
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium text-ink-100 truncate">{e.name}</span>
                      <span className="block text-xs text-ink-400 truncate">{e.instructions}</span>
                    </span>
                    {e.custom && <Pill tone="lime">Seu</Pill>}
                    <ChevronRight size={18} className="text-ink-500 shrink-0" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {!list.length && <p className="text-center text-ink-400 py-10">Nenhum exercício encontrado.</p>}
      </div>

      <Sheet open={!!current} onClose={() => setOpen(null)} title={current?.name ?? ''}>
        {current && <>
          <AddToWorkout ex={current} workouts={workouts} onAdd={(w) => { upsertWorkout({ ...w, sample: false, blocks: [...w.blocks, { id: uid('blk'), type: 'single', rest: 60, items: [{ exerciseId: current.id, sets: 3, reps: 12, load: 10 }] }] }); setOpen(null); toast(`${current.name} adicionado ao ${w.name}!`); onEdit(w.id); }}
            onNew={() => { setOpen(null); onNewWorkoutWith(current.id); }} />
          <ExerciseDetail ex={current} onSave={updateExercise} onDelete={() => { deleteExercise(current.id); setOpen(null); }} />
        </>}
      </Sheet>

      <Sheet open={creating} onClose={() => setCreating(false)} title="Novo exercício">
        <NewExercise onCreate={(e) => { addExercise(e); setCreating(false); setOpen(e.id); }} defaultGroup={group === 'Todos' ? 'Peito' : group} />
      </Sheet>
    </>
  );
}

function ExerciseDetail({ ex, onSave, onDelete }) {
  const [url, setUrl] = useState(ex.videoUrl || '');
  const ok = !url || isValidMediaUrl(url);
  return (
    <div className="flex flex-col gap-4">
      <Pill className="self-start">{ex.group}</Pill>
      <YouTubeEmbed url={ex.videoUrl} title={ex.name} exerciseId={ex.id} />
      <div>
        <Label>Como executar</Label>
        <p className="text-ink-200 mt-1 leading-relaxed">{ex.instructions}</p>
      </div>
      <div className="flex flex-col gap-2">
        <Field id={`yt-${ex.id}`} label="Link do vídeo ou GIF (YouTube, Shorts ou .gif)" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://youtube.com/shorts/..." inputMode="url" />
        {!ok && <span className="text-xs text-danger">Link não reconhecido. Use um link do YouTube (youtube.com, youtu.be, /shorts/) ou o endereço direto de um GIF/vídeo (.gif, .mp4).</span>}
        <Button variant="outline" disabled={!ok || url === (ex.videoUrl || '')} onClick={() => onSave({ ...ex, videoUrl: url.trim() })}><Link2 size={16} /> {url ? 'Fixar vídeo' : 'Remover vídeo'}</Button>
      </div>
      {ex.custom && <Button variant="danger" onClick={onDelete}><Trash2 size={16} /> Excluir exercício</Button>}
    </div>
  );
}

function NewExercise({ onCreate, defaultGroup }) {
  const [f, setF] = useState({ name: '', group: defaultGroup, instructions: '', videoUrl: '' });
  const ok = f.name.trim().length > 1 && (!f.videoUrl || isValidMediaUrl(f.videoUrl));
  return (
    <form className="flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); if (ok) onCreate({ ...f, id: uid('ex'), name: f.name.trim(), custom: true }); }}>
      <Field id="nx-name" label="Nome" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Ex.: Hack squat" />
      <Select id="nx-group" label="Grupo muscular" value={f.group} onChange={(e) => setF({ ...f, group: e.target.value })}>
        {GROUPS.map((g) => <option key={g}>{g}</option>)}
      </Select>
      <label htmlFor="nx-instr" className="flex flex-col gap-1.5">
        <Label>Instruções</Label>
        <textarea id="nx-instr" rows={3} value={f.instructions} onChange={(e) => setF({ ...f, instructions: e.target.value })} placeholder="Dicas de postura e execução"
          className="rounded-2xl bg-ink-850 border border-ink-700 p-4 text-ink-100 placeholder:text-ink-500 focus:border-lime outline-none" />
      </label>
      <Field id="nx-url" label="Link do YouTube ou GIF (opcional)" value={f.videoUrl} onChange={(e) => setF({ ...f, videoUrl: e.target.value })} placeholder="https://youtu.be/..." inputMode="url" />
      <Button size="lg" type="submit" disabled={!ok}><Plus size={18} /> Adicionar à biblioteca</Button>
    </form>
  );
}

function AddToWorkout({ ex, workouts, onAdd, onNew }) {
  const [open, setOpen] = useState(false);
  if (!open) return <Button className="w-full mb-4" onClick={() => setOpen(true)}><ListPlus size={18} /> Adicionar a uma ficha</Button>;
  return (
    <div className="mb-4 rounded-3xl border border-lime/40 bg-lime-soft/20 p-3 flex flex-col gap-2">
      <Label>Adicionar “{ex.name}” em</Label>
      {workouts.map((w) => (
        <button key={w.id} onClick={() => onAdd(w)} className="h-12 px-4 rounded-2xl bg-ink-850 border border-ink-700 flex items-center justify-between gap-2 text-left">
          <span className="truncate"><b className="text-ink-100">{w.name}</b> <span className="text-ink-400 text-sm">· {w.focus}</span></span><Plus size={16} className="text-lime shrink-0" />
        </button>
      ))}
      <Button variant="outline" onClick={onNew}><Plus size={16} /> Nova ficha com este exercício</Button>
      <Button variant="plain" size="sm" onClick={() => setOpen(false)}>Cancelar</Button>
    </div>
  );
}

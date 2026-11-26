import { useEffect, useRef, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Flag, Plus, PlayCircle, Repeat, SkipForward, Timer, Trophy, Volume2, X } from 'lucide-react';
import { useStore } from '../lib/store';
import { BG } from '../lib/images';
import { Button, Label, Pill, Sheet, Stepper } from '../components/ui';
import YouTubeEmbed from '../components/YouTubeEmbed';
import DemoPlayer from '../components/DemoPlayer';
import { demoFrames } from '../lib/demos';
import { fmtClock, fmtDuration, fmtKg, sessionVolume, circuitName } from '../lib/utils';
import { beep, vibrate, keepAwake, unlockAudio } from '../lib/audio';

function useNow(ms = 250) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), ms); return () => clearInterval(t); }, [ms]);
  return now;
}

export default function WorkoutSession() {
  const { activeSession: s, setActiveSession, setSessions, exById } = useStore();
  const now = useNow();
  const [video, setVideo] = useState(null);
  const [finishing, setFinishing] = useState(false);
  const [summary, setSummary] = useState(null);
  const [restDone, setRestDone] = useState(false);
  const firedRef = useRef(null);

  const update = (fn) => setActiveSession((cur) => (cur ? fn(structuredClone(cur)) : cur));

  const step = s?.steps[s.idx];
  const entry = step ? s.entries[step.e] : null;
  const set = entry ? entry.sets[step.s] : null;
  const ex = entry ? exById(entry.exerciseId) : null;
  const elapsed = s ? (now - new Date(s.startedAt)) / 1000 : 0;
  const restLeft = s?.rest ? Math.max(0, (s.rest.endsAt - now) / 1000) : 0;
  const doneSets = s ? s.entries.reduce((t, e) => t + e.sets.filter((x) => x.done).length, 0) : 0;
  const totalSets = s ? s.steps.length : 0;
  const allDone = s && s.idx >= s.steps.length;

  // Fim do descanso → bipe + vibração (uma vez por descanso)
  useEffect(() => {
    if (!s?.rest) return;
    if (restLeft <= 0 && firedRef.current !== s.rest.endsAt) {
      firedRef.current = s.rest.endsAt;
      beep(); vibrate(); setRestDone(true);
      update((c) => ({ ...c, rest: null }));
      setTimeout(() => setRestDone(false), 2600);
    } else if (restLeft > 0 && restLeft <= 3.05 && Math.abs(restLeft - Math.round(restLeft)) < 0.13 && firedRef.current !== `${s.rest.endsAt}-${Math.round(restLeft)}`) {
      firedRef.current = `${s.rest.endsAt}-${Math.round(restLeft)}`;
      beep({ times: 1, freq: 660, dur: 0.08 });
    }
  }, [restLeft, s?.rest]);

  if (summary) return <Summary data={summary} onClose={() => { setSummary(null); setActiveSession(null); }} />;
  if (!s) return null;

  const completeSet = () => {
    unlockAudio();
    update((c) => {
      const st = c.steps[c.idx];
      c.entries[st.e].sets[st.s].done = true;
      // propaga carga/reps para as próximas séries do mesmo exercício
      const cur = c.entries[st.e].sets[st.s];
      c.entries[st.e].sets.forEach((x, i) => { if (i > st.s && !x.done) { x.load = cur.load; } });
      c.idx += 1;
      c.rest = st.rest > 0 && c.idx < c.steps.length ? { endsAt: Date.now() + st.rest * 1000, total: st.rest } : null;
      return c;
    });
  };
  const patchSet = (patch) => update((c) => { const st = c.steps[c.idx]; Object.assign(c.entries[st.e].sets[st.s], patch); return c; });
  const goto = (d) => update((c) => ({ ...c, idx: Math.max(0, Math.min(c.steps.length, c.idx + d)), rest: null }));
  const addRest = (sec) => update((c) => (c.rest ? { ...c, rest: { endsAt: c.rest.endsAt + sec * 1000, total: c.rest.total + sec } } : c));
  const skipRest = () => update((c) => ({ ...c, rest: null }));

  const finish = () => {
    const entries = s.entries.map(({ exerciseId, name, sets }) => ({ exerciseId, name, sets: sets.map(({ reps, load, done }) => ({ reps: Number(reps) || 0, load: Number(load) || 0, done })) })).filter((e) => e.sets.some((x) => x.done));
    const endedAt = new Date();
    const rec = { id: s.id, workoutId: s.workoutId, workoutName: s.workoutName, startedAt: s.startedAt, endedAt: endedAt.toISOString(), durationSec: Math.round(elapsed), volume: sessionVolume(entries), entries };
    if (entries.length) setSessions((all) => [rec, ...all]);
    keepAwake(false);
    setFinishing(false);
    setSummary({ ...rec, sets: doneSets, saved: entries.length > 0 });
  };
  const discard = () => { keepAwake(false); setActiveSession(null); };

  // Circuito atual (Bi-set / Tri-set / Série gigante): todos os exercícios do bloco
  const triEntries = step?.kind === 'triset' ? s.entries.filter((e) => e.blockId === entry.blockId) : null;
  const next = s.steps[s.idx + 1];
  const nextEntry = next ? s.entries[next.e] : null;

  return (
    <div className="relative min-h-full bg-ink-950 text-ink-100 flex flex-col">
      <img src={BG.sessao} alt="" aria-hidden="true" className="fixed inset-0 w-full h-full object-cover opacity-35 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-ink-950/80 via-ink-950/70 to-ink-950 pointer-events-none" />

      <div className="relative max-w-lg w-full mx-auto flex-1 flex flex-col px-4 pt-4 pb-6 gap-4">
        {/* Barra superior: cronômetro geral */}
        <div className="flex items-center justify-between gap-3">
          <button onClick={() => setFinishing(true)} className="h-11 px-3 rounded-2xl bg-ink-800/90 border border-ink-700 text-sm inline-flex items-center gap-1.5"><Flag size={16} /> Finalizar</button>
          <div className="text-right">
            <Label>Tempo de treino</Label>
            <div className="num font-display text-4xl font-bold leading-none text-lime">{fmtClock(elapsed)}</div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-ink-400 mb-1"><span className="truncate">{s.workoutName}</span><span className="num">{doneSets}/{totalSets} séries</span></div>
          <div className="h-1.5 rounded-full bg-ink-800 overflow-hidden"><div className="h-full bg-lime transition-all" style={{ width: `${(doneSets / totalSets) * 100}%` }} /></div>
        </div>

        {allDone ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-10">
            <Trophy size={56} className="text-lime" />
            <div className="font-display text-4xl font-bold uppercase">Treino concluído</div>
            <p className="text-ink-300">Todas as séries foram registradas. Finalize para salvar no histórico.</p>
            <Button size="lg" className="w-full" onClick={finish}><Check size={20} /> Salvar treino</Button>
            <Button variant="plain" onClick={() => goto(-1)}><ChevronLeft size={16} /> Voltar à última série</Button>
          </div>
        ) : (
          <>
            {/* Cartão do exercício atual */}
            <section className="rounded-[28px] border border-ink-700 bg-ink-900/85 backdrop-blur-md p-4 flex flex-col gap-4">
              {triEntries ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Pill tone="volt"><Repeat size={12} /> {step.label || circuitName(triEntries.length)} · rodada {step.round + 1}/{step.rounds}</Pill>
                    <span className="text-xs text-ink-400">sem pausa entre eles</span>
                  </div>
                  <div className={`grid gap-1.5 ${triEntries.length === 2 ? 'grid-cols-2' : triEntries.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                    {triEntries.map((te, k) => (
                      <div key={k} className={`rounded-xl px-2 py-1.5 text-[11px] leading-tight border ${k === step.pos ? 'border-volt bg-volt-soft text-ink-100' : te.sets[step.round]?.done ? 'border-ink-700 text-ink-500 line-through' : 'border-ink-700 text-ink-400'}`}>
                        <span className="font-display text-sm font-bold text-volt mr-1">{k + 1}</span>{te.name}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <Pill className="self-start">Série {step.s + 1} de {entry.sets.length}</Pill>
              )}

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Label>{ex?.group}</Label>
                  <h2 className="font-display text-[34px] leading-[1] font-bold uppercase [text-wrap:balance]">{entry.name}</h2>
                  <p className="text-sm text-ink-400 mt-1.5">Meta: {entry.target.reps} reps{entry.target.load ? ` · ${entry.target.load} kg` : ''}</p>
                </div>
                <button onClick={() => setVideo(ex)} aria-label="Ver demonstração do exercício" className="relative w-20 h-16 shrink-0 rounded-2xl overflow-hidden bg-ink-800 border border-ink-700 grid place-items-center text-lime">
                  {demoFrames(ex?.id) ? <><span className="absolute inset-0 bg-white"><DemoPlayer exerciseId={ex.id} title={entry.name} compact /></span><span className="absolute right-1 bottom-1 w-6 h-6 rounded-full bg-ink-950/85 grid place-items-center"><PlayCircle size={14} /></span></> : <PlayCircle size={24} />}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Stepper id="cur-reps" label="Repetições" value={set.reps} onChange={(v) => patchSet({ reps: v })} min={0} />
                <Stepper id="cur-load" label="Carga (kg)" value={set.load} step={2.5} onChange={(v) => patchSet({ load: v })} />
              </div>

              <Button size="lg" className="h-16 text-xl font-display uppercase tracking-wide shadow-glow" onClick={completeSet}>
                <Check size={24} strokeWidth={3} /> Concluir série
              </Button>
              <div className="text-xs text-center text-ink-400">
                {step.rest > 0 ? <>Depois: <b className="text-volt">descanso de {step.rest}s</b></> : step.kind === 'triset' ? <>Depois: <b className="text-volt">vá direto para o próximo exercício</b></> : 'Última série do treino'}
              </div>
            </section>

            <div className="flex items-center justify-between gap-2">
              <Button variant="ghost" size="sm" onClick={() => goto(-1)} disabled={s.idx === 0}><ChevronLeft size={16} /> Anterior</Button>
              {nextEntry && <span className="text-xs text-ink-400 truncate">A seguir: <span className="text-ink-200">{nextEntry.name}</span></span>}
              <Button variant="ghost" size="sm" onClick={() => goto(1)}>Pular <ChevronRight size={16} /></Button>
            </div>

            {/* Registro do exercício atual */}
            <div className="flex flex-col gap-1.5">
              <Label>Séries de {entry.name}</Label>
              <div className="flex flex-wrap gap-1.5">
                {entry.sets.map((x, i) => (
                  <span key={i} className={`num text-xs px-2.5 h-7 inline-flex items-center rounded-full border ${x.done ? 'border-lime/50 text-lime bg-lime-soft' : i === step.s ? 'border-ink-400 text-ink-100' : 'border-ink-700 text-ink-500'}`}>
                    {i + 1}: {x.reps}×{x.load}kg
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Overlay de descanso */}
      {(s.rest || restDone) && (
        <RestOverlay left={restLeft} total={s.rest?.total ?? 1} done={restDone && !s.rest} onAdd={() => addRest(15)} onSkip={() => { skipRest(); setRestDone(false); }}
          nextName={entry?.name} circuit={s.steps[s.idx - 1]?.kind === 'triset' ? circuitName(s.entries.filter((e) => e.blockId === s.entries[s.steps[s.idx - 1].e].blockId).length) : null} />
      )}

      <Sheet open={!!video} onClose={() => setVideo(null)} title={video?.name ?? ''}>
        {video && <div className="flex flex-col gap-3"><YouTubeEmbed url={video.videoUrl} title={video.name} exerciseId={video.id} /><p className="text-sm text-ink-300">{video.instructions}</p></div>}
      </Sheet>

      <Sheet open={finishing} onClose={() => setFinishing(false)} title="Finalizar treino?">
        <div className="flex flex-col gap-3">
          <p className="text-ink-300 text-sm">{doneSets} de {totalSets} séries registradas em {fmtDuration(elapsed)}. Volume até agora: {fmtKg(sessionVolume(s.entries))}.</p>
          <Button size="lg" onClick={finish}><Check size={18} /> Salvar no histórico</Button>
          <Button variant="ghost" onClick={() => setFinishing(false)}>Continuar treinando</Button>
          <Button variant="danger" onClick={discard}><X size={16} /> Descartar sessão</Button>
        </div>
      </Sheet>
    </div>
  );
}

function RestOverlay({ left, total, done, onAdd, onSkip, nextName, circuit }) {
  const R = 118, C = 2 * Math.PI * R;
  const frac = done ? 0 : Math.max(0, Math.min(1, left / total));
  return (
    <div className={`fixed inset-0 z-40 flex flex-col items-center justify-center gap-6 px-6 ${done ? 'bg-lime' : 'bg-ink-950/95 backdrop-blur-xl'}`} role="timer" aria-live="polite"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      {done ? (
        <button onClick={onSkip} className="flex flex-col items-center gap-4 text-ink-950">
          <span className="w-40 h-40 rounded-full bg-ink-950 text-lime grid place-items-center ring-pulse"><Volume2 size={56} /></span>
          <span className="font-display text-5xl font-extrabold uppercase">Bora!</span>
          <span className="text-lg font-semibold">Próxima: {nextName}</span>
          <span className="text-sm opacity-70">Toque para continuar</span>
        </button>
      ) : (
        <>
          <Label className="text-volt flex items-center gap-1.5"><Timer size={14} /> {circuit ? `Descanso pós ${circuit}` : 'Descanso'}</Label>
          <div className="relative w-[268px] h-[268px] max-w-full">
            <svg viewBox="0 0 268 268" className="w-full h-full -rotate-90">
              <circle cx="134" cy="134" r={R} fill="none" stroke="#1f262e" strokeWidth="14" />
              <circle cx="134" cy="134" r={R} fill="none" stroke="#2fb8ff" strokeWidth="14" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - frac)} style={{ transition: 'stroke-dashoffset .25s linear' }} />
            </svg>
            <div className="absolute inset-0 grid place-items-center">
              <div className="text-center">
                <div className={`num font-display text-[84px] leading-none font-bold ${left <= 5 ? 'text-lime' : 'text-ink-100'}`}>{fmtClock(Math.ceil(left))}</div>
                <div className="text-sm text-ink-400 mt-1">de {fmtClock(total)}</div>
              </div>
            </div>
          </div>
          <div className="text-center text-ink-300">A seguir: <b className="text-ink-100">{nextName}</b></div>
          <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
            <Button size="lg" variant="ghost" className="h-16 text-lg" onClick={onAdd}><Plus size={20} /> 15s</Button>
            <Button size="lg" variant="volt" className="h-16 text-lg" onClick={onSkip}><SkipForward size={20} /> Pular</Button>
          </div>
        </>
      )}
    </div>
  );
}

function Summary({ data, onClose }) {
  return (
    <div className="relative min-h-full bg-ink-950 flex flex-col items-center justify-center px-6 py-10 gap-6 text-center">
      <img src={BG.treinos} alt="" aria-hidden="true" className="fixed inset-0 w-full h-full object-cover opacity-30" />
      <div className="fixed inset-0 bg-gradient-to-b from-ink-950/60 to-ink-950" />
      <div className="relative flex flex-col items-center gap-6 w-full max-w-sm">
        <Trophy size={64} className="text-lime" />
        <div>
          <Label className="text-lime">{data.saved ? 'Salvo no histórico' : 'Nenhuma série registrada'}</Label>
          <h1 className="font-display text-5xl font-extrabold uppercase mt-1">Mandou bem</h1>
          <p className="text-ink-300 mt-1">{data.workoutName}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 w-full">
          {[['Duração', fmtDuration(data.durationSec)], ['Séries', data.sets], ['Volume', fmtKg(data.volume)]].map(([k, v]) => (
            <div key={k} className="rounded-2xl bg-ink-900/90 border border-ink-700 p-3">
              <Label>{k}</Label>
              <div className="num font-display text-2xl font-bold mt-1">{v}</div>
            </div>
          ))}
        </div>
        <Button size="lg" className="w-full" onClick={onClose}>Voltar aos treinos</Button>
      </div>
    </div>
  );
}

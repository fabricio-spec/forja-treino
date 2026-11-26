import { useState } from 'react';
import { AlarmClock, CalendarDays, ChevronRight, Flame, Layers, Pencil, Play, Plus, RefreshCw, Sparkles, TriangleAlert, Repeat } from 'lucide-react';
import { useStore } from '../lib/store';
import { BG } from '../lib/images';
import { Button, Card, Hero, Label, Pill, Sheet } from '../components/ui';
import { periodStatus, swapSuggestions, STIMULUS_TIPS, PERIOD_DAYS } from '../lib/periodization';
import { buildSession, lastLoadsFrom } from '../lib/session';
import { fmtDate, fmtKg, weekStart, DAY, circuitName } from '../lib/utils';
import { unlockAudio, keepAwake } from '../lib/audio';

export default function Workouts({ onEdit }) {
  const { workouts, sessions, snoozes, setSnoozes, exById, exercises, upsertWorkout, setActiveSession, profile } = useStore();
  const [renew, setRenew] = useState(null);

  const wk = weekStart(new Date());
  const thisWeek = sessions.filter((s) => new Date(s.startedAt) >= wk);
  const weekVolume = thisWeek.reduce((t, s) => t + s.volume, 0);
  const streak = (() => { let n = 0; for (let i = 0; i < 52; i++) { const a = new Date(+wk - i * 7 * DAY), b = new Date(+a + 7 * DAY); if (sessions.some((s) => new Date(s.startedAt) >= a && new Date(s.startedAt) < b)) n++; else if (i > 0) break; } return n; })();

  const alerts = workouts.map((w) => ({ w, st: periodStatus(w, snoozes) })).filter(({ st }) => st.level === 'due' && !st.snoozed);

  const start = (w) => {
    unlockAudio(); keepAwake(true);
    setActiveSession(buildSession(w, exById, lastLoadsFrom(sessions)));
  };

  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <>
      <Hero image={BG.treinos} eyebrow={`${greet}${profile.name ? ', ' + profile.name.split(' ')[0] : ''}`} title="Meus treinos">
        <div className="grid grid-cols-3 gap-2 mt-5">
          <Ring done={thisWeek.length} goal={4} />
          <Stat label="Volume" value={Math.round(weekVolume / 1000 * 10) / 10} unit="t" />
          <Stat label="Sequência" value={streak} unit={streak === 1 ? 'semana' : 'semanas'} icon={<Flame size={14} className="text-warn" />} />
        </div>
      </Hero>

      <div className="px-4 flex flex-col gap-4 -mt-1">
        {alerts.map(({ w, st }) => (
          <button key={w.id} onClick={() => setRenew(w)} className="text-left rounded-3xl border border-warn/50 bg-gradient-to-br from-warn/20 to-ink-900 p-4 flex gap-3 items-start">
            <span className="w-11 h-11 shrink-0 rounded-2xl bg-warn/20 text-warn grid place-items-center"><TriangleAlert size={22} /></span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-ink-100">Hora de renovar o {w.name}</span>
              <span className="block text-sm text-ink-300 mt-0.5">Essa ficha está em uso há {st.age} dias. Depois de 6 meses o corpo se adapta e o progresso tende a estagnar.</span>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-warn mt-2">Ver sugestões de troca <ChevronRight size={16} /></span>
            </span>
          </button>
        ))}

        <div className="flex items-center justify-between mt-1">
          <Label>Fichas ({workouts.length})</Label>
          <Button size="sm" variant="outline" onClick={() => onEdit('new')}><Plus size={16} /> Nova ficha</Button>
        </div>

        {workouts.map((w) => <WorkoutCard key={w.id} w={w} st={periodStatus(w, snoozes)} exById={exById} onStart={() => start(w)} onEdit={() => onEdit(w.id)} onRenew={() => setRenew(w)}
          last={sessions.find((s) => s.workoutId === w.id)} />)}

        {!workouts.length && (
          <Card className="p-6 text-center flex flex-col items-center gap-3">
            <Layers className="text-ink-500" />
            <p className="text-ink-300">Você ainda não tem fichas. Crie a primeira com exercícios isolados, Tri-sets ou séries gigantes.</p>
            <Button onClick={() => onEdit('new')}><Plus size={18} /> Criar ficha</Button>
          </Card>
        )}
      </div>

      <RenewSheet w={renew} onClose={() => setRenew(null)} library={exercises} exById={exById}
        onApply={(w, swaps) => {
          const map = Object.fromEntries(swaps.map((s) => [s.from.id, s.to.id]));
          upsertWorkout({ ...w, createdAt: new Date().toISOString(), renewedFrom: w.createdAt, blocks: w.blocks.map((b) => ({ ...b, items: b.items.map((i) => ({ ...i, exerciseId: map[i.exerciseId] ?? i.exerciseId })) })) });
          setSnoozes((s) => { const n = { ...s }; delete n[w.id]; return n; });
          setRenew(null);
        }}
        onSnooze={(w) => { setSnoozes((s) => ({ ...s, [w.id]: new Date(Date.now() + 7 * DAY).toISOString() })); setRenew(null); }}
        onEdit={(w) => { setRenew(null); onEdit(w.id); }} />
    </>
  );
}

function Ring({ done, goal }) {
  const R = 20, C = 2 * Math.PI * R, f = Math.min(1, done / goal);
  return (
    <div className="rounded-2xl bg-ink-950/60 border border-ink-700/60 backdrop-blur px-2.5 py-2.5 flex items-center gap-2">
      <svg viewBox="0 0 48 48" className="w-10 h-10 -rotate-90 shrink-0" aria-hidden="true">
        <circle cx="24" cy="24" r={R} fill="none" stroke="#1f262e" strokeWidth="5" />
        <circle cx="24" cy="24" r={R} fill="none" stroke="#c6ff3d" strokeWidth="5" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - f)} />
      </svg>
      <div className="min-w-0">
        <div className="num font-display text-2xl font-bold leading-none">{done}<span className="text-ink-400 text-base">/{goal}</span></div>
        <Label className="!text-[10px] !tracking-wider">semana</Label>
      </div>
    </div>
  );
}

function Stat({ label, value, unit, icon }) {
  return (
    <div className="rounded-2xl bg-ink-950/60 border border-ink-700/60 backdrop-blur px-3 py-2.5">
      <Label className="flex items-center gap-1">{icon}{label}</Label>
      <div className="flex items-baseline gap-1 mt-0.5">
        <span className="num font-display text-3xl font-bold text-ink-100">{String(value).replace('.', ',')}</span>
        <span className="text-xs text-ink-400">{unit}</span>
      </div>
    </div>
  );
}

function WorkoutCard({ w, st, exById, onStart, onEdit, onRenew, last }) {
  const exCount = w.blocks.reduce((t, b) => t + b.items.length, 0);
  const tri = w.blocks.filter((b) => b.type === 'triset').length;
  const pct = Math.min(100, (st.age / PERIOD_DAYS) * 100);
  const barColor = st.level === 'due' ? 'bg-warn' : st.level === 'soon' ? 'bg-warn/70' : w.color === 'volt' ? 'bg-volt' : 'bg-lime';
  const accent = w.color === 'volt' ? 'text-volt' : 'text-lime';
  return (
    <Card className="p-4 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className={`font-display text-sm font-bold uppercase tracking-[.2em] ${accent}`}>{w.name}</div>
          <div className="font-display text-[28px] leading-tight font-bold uppercase text-ink-100">{w.focus}</div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <Pill>{exCount} exercícios</Pill>
            {tri > 0 && <Pill tone="volt"><Repeat size={12} /> {tri} circuito{tri > 1 ? 's' : ''}</Pill>}
            {st.level === 'due' && <Pill tone="warn"><AlarmClock size={12} /> Renovar</Pill>}
            {st.level === 'soon' && <Pill tone="warn">Renovar em {st.left} d</Pill>}
          </div>
        </div>
        <button onClick={onEdit} aria-label={`Editar ${w.name}`} className="w-10 h-10 shrink-0 rounded-full bg-ink-800 grid place-items-center text-ink-300"><Pencil size={17} /></button>
      </div>

      <ol className="flex flex-col gap-1.5">
        {w.blocks.map((b) => (
          <li key={b.id} className={`text-sm ${b.type === 'triset' ? 'rounded-xl border border-volt/30 bg-volt-soft/40 px-3 py-2' : 'px-1'}`}>
            {b.type === 'triset' && <div className="text-[10px] uppercase tracking-[.16em] text-volt font-semibold mb-1">{b.label ? `${b.label} · ` : ''}{circuitName(b.items.length)} · {b.sets}× · descanso {b.rest}s</div>}
            {b.items.map((it, i) => (
              <div key={i} className="flex justify-between gap-3 text-ink-200">
                <span className="truncate">{exById(it.exerciseId)?.name ?? '—'}</span>
                <span className="num shrink-0 text-ink-400">{b.type === 'triset' ? '' : `${it.sets}×`}{it.reps}{it.load ? ` · ${it.load}kg` : ''}</span>
              </div>
            ))}
          </li>
        ))}
      </ol>

      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-xs text-ink-400">
          <span className="inline-flex items-center gap-1"><CalendarDays size={12} /> Criada em {fmtDate(w.createdAt)}</span>
          <span className="num">{st.age}/{PERIOD_DAYS} dias</span>
        </div>
        <div className="h-1.5 rounded-full bg-ink-800 overflow-hidden"><div className={`h-full ${barColor}`} style={{ width: `${pct}%` }} /></div>
        {last && <div className="text-xs text-ink-500">Último treino: {fmtDate(last.startedAt, { day: '2-digit', month: 'short' })} · {fmtKg(last.volume)}</div>}
      </div>

      <div className="flex gap-2">
        <Button size="lg" className="flex-1" onClick={onStart}><Play size={20} fill="currentColor" /> Iniciar treino</Button>
        {st.level !== 'ok' && <Button size="lg" variant="ghost" onClick={onRenew} aria-label="Renovar ficha"><RefreshCw size={20} /></Button>}
      </div>
    </Card>
  );
}

function RenewSheet({ w, onClose, library, exById, onApply, onSnooze, onEdit }) {
  const swaps = w ? swapSuggestions(w, library) : [];
  const [off, setOff] = useState({});
  if (!w) return null;
  const chosen = swaps.filter((s) => !off[s.from.id]);
  return (
    <Sheet open={!!w} onClose={onClose} title="Renovar ficha" full>
      <div className="flex flex-col gap-5">
        <p className="text-ink-300 text-sm">
          O <b className="text-ink-100">{w.name} ({w.focus})</b> foi criado em {fmtDate(w.createdAt)}. Após ~6 meses com os mesmos exercícios, a adaptação reduz o estímulo. Escolha as trocas abaixo ou edite a ficha manualmente.
        </p>

        <section className="flex flex-col gap-2">
          <Label>Trocas de exercício sugeridas</Label>
          {swaps.map((s) => (
            <label key={s.from.id} className="flex items-center gap-3 rounded-2xl bg-ink-850 border border-ink-700 p-3">
              <input type="checkbox" className="w-5 h-5 accent-[#c6ff3d]" checked={!off[s.from.id]} onChange={() => setOff((o) => ({ ...o, [s.from.id]: !o[s.from.id] }))} />
              <span className="min-w-0 text-sm">
                <span className="block text-ink-400 line-through truncate">{s.from.name}</span>
                <span className="block text-ink-100 font-medium truncate">→ {s.to.name}</span>
              </span>
              <Pill className="ml-auto shrink-0">{s.to.group}</Pill>
            </label>
          ))}
          {!swaps.length && <p className="text-sm text-ink-400">Sem alternativas na biblioteca para os grupos desta ficha. Adicione exercícios na Biblioteca.</p>}
        </section>

        <section className="flex flex-col gap-2">
          <Label className="flex items-center gap-1"><Sparkles size={12} /> Variações de estímulo</Label>
          {STIMULUS_TIPS.map((t) => (
            <div key={t.title} className="rounded-2xl border border-ink-800 p-3">
              <div className="font-semibold text-ink-100 text-sm">{t.title}</div>
              <div className="text-sm text-ink-400 mt-0.5">{t.text}</div>
            </div>
          ))}
        </section>

        <div className="flex flex-col gap-2 sticky bottom-0 bg-ink-900 pt-2">
          <Button size="lg" onClick={() => onApply(w, chosen)}><RefreshCw size={18} /> Aplicar {chosen.length} troca{chosen.length === 1 ? '' : 's'} e reiniciar ciclo</Button>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="ghost" onClick={() => onEdit(w)}><Pencil size={16} /> Editar manualmente</Button>
            <Button variant="ghost" onClick={() => onSnooze(w)}><AlarmClock size={16} /> Lembrar em 7 dias</Button>
          </div>
        </div>
      </div>
    </Sheet>
  );
}

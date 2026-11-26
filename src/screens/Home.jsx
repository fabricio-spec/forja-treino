import { useState } from 'react';
import { ChevronRight, Flame, Hammer, Play, Salad, TrendingUp, TriangleAlert, Repeat } from 'lucide-react';
import { useStore } from '../lib/store';
import { BG } from '../lib/images';
import { Button, Card, Hero, Label, Pill } from '../components/ui';
import InstallBanner from '../components/InstallBanner';
import ProfileSheet, { ProfileButton } from '../components/ProfileSheet';
import { Ring, Stat } from './Workouts';
import { periodStatus } from '../lib/periodization';
import { buildSession, lastLoadsFrom } from '../lib/session';
import { calcPlan } from '../lib/nutrition';
import { effectiveTargets } from '../components/CustomPlan';
import { fmtDate, fmtDuration, fmtKg, weekStart, DAY, circuitName } from '../lib/utils';
import { unlockAudio, keepAwake } from '../lib/audio';
import { goTab } from '../lib/nav';

export default function Home({ onEdit }) {
  const { workouts, sessions, snoozes, exById, setActiveSession, profile, diet } = useStore();
  const [profileOpen, setProfileOpen] = useState(false);

  const wk = weekStart(new Date());
  const thisWeek = sessions.filter((s) => new Date(s.startedAt) >= wk);
  const weekVolume = thisWeek.reduce((t, s) => t + s.volume, 0);
  const streak = (() => { let n = 0; for (let i = 0; i < 52; i++) { const a = new Date(+wk - i * 7 * DAY), b = new Date(+a + 7 * DAY); if (sessions.some((s) => new Date(s.startedAt) >= a && new Date(s.startedAt) < b)) n++; else if (i > 0) break; } return n; })();
  const alerts = workouts.filter((w) => { const st = periodStatus(w, snoozes); return st.level === 'due' && !st.snoozed; });

  // Próximo treino: a ficha feita há mais tempo (ou nunca feita).
  const lastDone = (w) => { const s = sessions.find((x) => x.workoutId === w.id); return s ? new Date(s.startedAt).getTime() : 0; };
  const next = [...workouts].sort((a, b) => lastDone(a) - lastDone(b))[0];
  const last = sessions[0];
  const plan = calcPlan(profile);
  const tgt = plan ? (diet.mode === 'custom' ? effectiveTargets(diet, plan) : { kcal: plan.kcal, protein: plan.protein, carbs: plan.carbs, fat: plan.fat }) : null;

  const start = (w) => { unlockAudio(); keepAwake(true); setActiveSession(buildSession(w, exById, lastLoadsFrom(sessions))); };
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <>
      <Hero image={BG.treinos} home eyebrow={`${greet}${profile.name ? ', ' + profile.name.split(' ')[0] : ''}`} title="Bora treinar" right={<ProfileButton onClick={() => setProfileOpen(true)} className="mt-1" />}>
        <div className="grid grid-cols-3 gap-2 mt-5">
          <Ring done={thisWeek.length} goal={4} />
          <Stat label="Volume" value={Math.round(weekVolume / 1000 * 10) / 10} unit="t" />
          <Stat label="Sequência" value={streak} unit={streak === 1 ? 'semana' : 'semanas'} icon={<Flame size={14} className="text-warn" />} />
        </div>
      </Hero>

      <div className="px-4 flex flex-col gap-4 -mt-1">
        <InstallBanner />

        {alerts.map((w) => (
          <button key={w.id} onClick={() => goTab('treinos')} className="text-left rounded-3xl border border-warn/50 bg-gradient-to-br from-warn/20 to-ink-900 p-4 flex gap-3 items-center">
            <TriangleAlert className="text-warn shrink-0" />
            <span className="min-w-0 flex-1 text-sm"><b className="text-ink-100">Hora de renovar o {w.name}.</b> <span className="text-ink-300">A ficha passou de 6 meses.</span></span>
            <ChevronRight size={18} className="text-warn shrink-0" />
          </button>
        ))}

        {next ? (
          <Card className="p-4 flex flex-col gap-3">
            <Label>Próximo treino</Label>
            <div>
              <div className={`font-display text-sm font-bold uppercase tracking-[.2em] ${next.color === 'volt' ? 'text-volt' : 'text-lime'}`}>{next.name}</div>
              <div className="font-display text-3xl font-bold uppercase leading-tight">{next.focus}</div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <Pill>{next.blocks.reduce((t, b) => t + b.items.length, 0)} exercícios</Pill>
                {next.blocks.filter((b) => b.type === 'triset').map((b) => <Pill key={b.id} tone="volt"><Repeat size={11} /> {circuitName(b.items.length)}</Pill>).slice(0, 3)}
              </div>
              <p className="text-xs text-ink-500 mt-2">{lastDone(next) ? `Feito pela última vez em ${fmtDate(lastDone(next), { day: '2-digit', month: 'short' })}` : 'Ainda não realizado'}</p>
            </div>
            <Button size="lg" onClick={() => start(next)}><Play size={20} fill="currentColor" /> Iniciar treino</Button>
            <button onClick={() => goTab('treinos')} className="text-sm text-ink-300 inline-flex items-center justify-center gap-1">Ver todas as fichas <ChevronRight size={16} /></button>
          </Card>
        ) : null}

        <button onClick={() => onEdit('new')} className="text-left rounded-3xl border-2 border-lime/70 bg-gradient-to-br from-lime-soft to-ink-900 p-4 flex items-center gap-4 active:scale-[.99] transition">
          <span className="w-12 h-12 shrink-0 rounded-2xl bg-lime text-ink-950 grid place-items-center"><Hammer size={24} /></span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-2xl font-bold uppercase leading-tight">Montar meu treino</span>
            <span className="block text-sm text-ink-300">Exercícios da biblioteca, séries, Tri-sets e séries gigantes.</span>
          </span>
        </button>

        <div className="grid grid-cols-2 gap-3">
          {tgt && (
            <button onClick={() => goTab('nutricao')} className="text-left rounded-3xl bg-ink-900 border border-ink-800 p-4 flex flex-col gap-1">
              <Salad className="text-lime" size={20} />
              <Label className="mt-1">Meta do dia</Label>
              <span className="num font-display text-3xl font-bold leading-none">{tgt.kcal.toLocaleString('pt-BR')}<span className="text-sm text-ink-400 font-sans font-normal"> kcal</span></span>
              <span className="num text-xs text-ink-400">P {tgt.protein} · C {tgt.carbs} · G {tgt.fat}</span>
            </button>
          )}
          <button onClick={() => goTab('evolucao')} className="text-left rounded-3xl bg-ink-900 border border-ink-800 p-4 flex flex-col gap-1">
            <TrendingUp className="text-volt" size={20} />
            <Label className="mt-1">Último treino</Label>
            {last ? <>
              <span className="font-semibold text-ink-100 truncate">{last.workoutName.split(' · ')[0]}</span>
              <span className="num text-xs text-ink-400">{fmtDate(last.startedAt, { day: '2-digit', month: 'short' })} · {fmtDuration(last.durationSec)} · {fmtKg(last.volume)}</span>
            </> : <span className="text-sm text-ink-400">Nenhum ainda</span>}
          </button>
        </div>
      </div>
      {profileOpen && <ProfileSheet open onClose={() => setProfileOpen(false)} />}
    </>
  );
}

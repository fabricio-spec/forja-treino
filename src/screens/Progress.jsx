import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { CalendarDays, ChevronDown, Clock, Dumbbell, Trash2, Weight } from 'lucide-react';
import { useStore } from '../lib/store';
import { BG } from '../lib/images';
import { Button, Card, Hero, Label, Pill, Sheet } from '../components/ui';
import { fmtDate, fmtDuration, fmtKg, weekStart, DAY } from '../lib/utils';

const axis = { stroke: '#46525e', fontSize: 11, tickLine: false, axisLine: false };
const tip = { contentStyle: { background: '#11151a', border: '1px solid #2b343e', borderRadius: 12, color: '#eef2f5' }, labelStyle: { color: '#9aa6b2' }, cursor: { fill: '#ffffff08' } };

export default function Progress() {
  const { sessions, setSessions, clearSamples } = useStore();
  const [mode, setMode] = useState('semana');
  const [exId, setExId] = useState(null);
  const [open, setOpen] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const volumeData = useMemo(() => {
    if (mode === 'semana') {
      const ws = weekStart(new Date());
      return Array.from({ length: 10 }, (_, i) => {
        const a = new Date(+ws - (9 - i) * 7 * DAY), b = new Date(+a + 7 * DAY);
        const v = sessions.filter((s) => new Date(s.startedAt) >= a && new Date(s.startedAt) < b).reduce((t, s) => t + s.volume, 0);
        return { label: fmtDate(a, { day: '2-digit', month: '2-digit' }), v: Math.round(v), current: i === 9 };
      });
    }
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const a = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1), b = new Date(a.getFullYear(), a.getMonth() + 1, 1);
      const v = sessions.filter((s) => new Date(s.startedAt) >= a && new Date(s.startedAt) < b).reduce((t, s) => t + s.volume, 0);
      return { label: a.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''), v: Math.round(v), current: i === 5 };
    });
  }, [sessions, mode]);

  const exOptions = useMemo(() => {
    const m = new Map();
    sessions.forEach((s) => s.entries.forEach((e) => { if (e.sets.some((x) => x.done && x.load > 0)) m.set(e.exerciseId, e.name); }));
    return [...m.entries()];
  }, [sessions]);
  const selEx = exId ?? exOptions[0]?.[0];

  const loadData = useMemo(() => sessions.filter((s) => s.entries.some((e) => e.exerciseId === selEx))
    .sort((a, b) => new Date(a.startedAt) - new Date(b.startedAt))
    .map((s) => { const e = s.entries.find((x) => x.exerciseId === selEx); const done = e.sets.filter((x) => x.done);
      return { label: fmtDate(s.startedAt, { day: '2-digit', month: '2-digit' }), max: Math.max(0, ...done.map((x) => x.load)), e1rm: Math.round(Math.max(0, ...done.map((x) => x.load * (1 + x.reps / 30)))) }; }), [sessions, selEx]);

  const first = loadData[0]?.max ?? 0, last = loadData.at(-1)?.max ?? 0;
  const gain = first ? Math.round(((last - first) / first) * 100) : 0;
  const totalVol = sessions.reduce((t, s) => t + s.volume, 0);
  const totalTime = sessions.reduce((t, s) => t + s.durationSec, 0);
  const hasSamples = sessions.some((s) => s.sample);

  return (
    <>
      <Hero image={BG.evolucao} eyebrow="Histórico e progresso" title="Evolução">
        <div className="grid grid-cols-3 gap-2 mt-5">
          <MiniStat icon={<Dumbbell size={13} />} label="Treinos" value={sessions.length} />
          <MiniStat icon={<Weight size={13} />} label="Volume total" value={`${(totalVol / 1000).toFixed(1).replace('.', ',')} t`} />
          <MiniStat icon={<Clock size={13} />} label="Tempo" value={`${Math.round(totalTime / 3600)} h`} />
        </div>
      </Hero>

      <div className="px-4 flex flex-col gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div><Label>Volume de carga</Label><div className="text-xs text-ink-500">reps × kg somados</div></div>
            <div className="flex rounded-full bg-ink-850 p-1 text-xs">
              {['semana', 'mês'].map((m) => <button key={m} onClick={() => setMode(m)} className={`h-7 px-3 rounded-full capitalize ${mode === m ? 'bg-lime text-ink-950 font-semibold' : 'text-ink-400'}`}>{m === 'semana' ? 'Semanal' : 'Mensal'}</button>)}
            </div>
          </div>
          <div className="h-48 -ml-2">
            <ResponsiveContainer>
              <BarChart data={volumeData} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#1f262e" />
                <XAxis dataKey="label" {...axis} interval={0} tick={{ fontSize: 10, fill: '#6b7886' }} />
                <YAxis {...axis} width={38} tick={{ fill: '#6b7886', fontSize: 10 }} tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}t` : v)} />
                <Tooltip {...tip} formatter={(v) => [fmtKg(v), 'Volume']} />
                <Bar dataKey="v" radius={[8, 8, 3, 3]} isAnimationActive={false} shape={(p) => <rect x={p.x} y={p.y} width={p.width} height={Math.max(0, p.height)} rx={6} fill={p.payload.current ? '#c6ff3d' : '#c6ff3d66'} />} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0 flex-1">
              <Label>Progressão de carga</Label>
              <div className="relative mt-1">
                <select id="prog-ex" value={selEx ?? ''} onChange={(e) => setExId(e.target.value)} className="appearance-none w-full bg-transparent font-display text-xl font-bold uppercase text-ink-100 pr-7 outline-none truncate">
                  {exOptions.map(([id, name]) => <option key={id} value={id} className="bg-ink-900 text-base normal-case">{name}</option>)}
                </select>
                <ChevronDown size={18} className="absolute right-0 top-1.5 text-ink-400 pointer-events-none" />
              </div>
            </div>
            {loadData.length > 1 && <Pill tone={gain >= 0 ? 'lime' : 'danger'}>{gain >= 0 ? '+' : ''}{gain}%</Pill>}
          </div>
          {loadData.length ? (
            <div className="h-48 -ml-2">
              <ResponsiveContainer>
                <LineChart data={loadData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#1f262e" />
                  <XAxis dataKey="label" {...axis} tick={{ fontSize: 10, fill: '#6b7886' }} minTickGap={16} />
                  <YAxis {...axis} width={38} tick={{ fill: '#6b7886', fontSize: 10 }} domain={['dataMin - 5', 'dataMax + 5']} />
                  <Tooltip {...tip} formatter={(v, n) => [`${v} kg`, n === 'max' ? 'Carga máx.' : '1RM estimado']} />
                  <Line type="monotone" dataKey="e1rm" stroke="#2fb8ff" strokeWidth={2} strokeDasharray="4 4" dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="max" stroke="#c6ff3d" strokeWidth={3} dot={{ r: 3, fill: '#c6ff3d', strokeWidth: 0 }} activeDot={{ r: 6 }} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : <p className="text-sm text-ink-400 py-8 text-center">Conclua um treino com carga para ver a progressão.</p>}
          <div className="flex gap-4 text-xs text-ink-400 mt-2">
            <span className="flex items-center gap-1.5"><i className="w-3 h-0.5 bg-lime" /> Carga máxima</span>
            <span className="flex items-center gap-1.5"><i className="w-3 h-0.5 bg-volt" /> 1RM estimado (Epley)</span>
          </div>
        </Card>

        <div className="flex items-center justify-between mt-2">
          <Label>Treinos concluídos</Label>
          {hasSamples && <button className="text-xs text-ink-400 underline underline-offset-2" onClick={() => setConfirmClear(true)}>Limpar exemplos</button>}
        </div>
        <ul className="flex flex-col gap-2">
          {sessions.map((s) => (
            <li key={s.id}>
              <button onClick={() => setOpen(s)} className="w-full text-left rounded-2xl bg-ink-900 border border-ink-800 p-3.5 flex items-center gap-3 active:bg-ink-850">
                <span className="w-12 shrink-0 text-center">
                  <span className="block font-display text-2xl font-bold leading-none">{new Date(s.startedAt).getDate()}</span>
                  <span className="block text-[10px] uppercase text-ink-400 tracking-wider">{new Date(s.startedAt).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium truncate">{s.workoutName}</span>
                  <span className="num block text-xs text-ink-400">{fmtDuration(s.durationSec)} · {fmtKg(s.volume)} · {s.entries.length} exercícios</span>
                </span>
                {s.sample && <Pill>exemplo</Pill>}
              </button>
            </li>
          ))}
          {!sessions.length && <p className="text-center text-ink-400 py-8">Nenhum treino concluído ainda.</p>}
        </ul>
      </div>

      <Sheet open={!!open} onClose={() => setOpen(null)} title={open ? fmtDate(open.startedAt) : ''}>
        {open && (
          <div className="flex flex-col gap-4">
            <div className="text-ink-300 text-sm flex flex-wrap gap-x-4 gap-y-1">
              <span className="flex items-center gap-1"><CalendarDays size={14} /> {new Date(open.startedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
              <span className="flex items-center gap-1"><Clock size={14} /> {fmtDuration(open.durationSec)}</span>
              <span className="flex items-center gap-1"><Weight size={14} /> {fmtKg(open.volume)}</span>
            </div>
            <div className="font-display text-xl font-bold uppercase">{open.workoutName}</div>
            {open.entries.map((e, i) => (
              <div key={i} className="rounded-2xl border border-ink-800 p-3">
                <div className="font-medium">{e.name}</div>
                <div className="flex flex-wrap gap-1.5 mt-2">{e.sets.filter((x) => x.done).map((x, j) => <span key={j} className="num text-xs px-2 py-1 rounded-full bg-ink-800 text-ink-200">{x.reps} × {x.load} kg</span>)}</div>
              </div>
            ))}
            <Button variant="danger" onClick={() => { setSessions((all) => all.filter((x) => x.id !== open.id)); setOpen(null); }}><Trash2 size={16} /> Excluir do histórico</Button>
          </div>
        )}
      </Sheet>

      <Sheet open={confirmClear} onClose={() => setConfirmClear(false)} title="Limpar exemplos?">
        <div className="flex flex-col gap-3">
          <p className="text-sm text-ink-300">Remove os treinos de exemplo do histórico. Seus treinos reais ficam.</p>
          <Button variant="danger" onClick={() => { clearSamples(); setConfirmClear(false); }}>Remover exemplos</Button>
          <Button variant="ghost" onClick={() => setConfirmClear(false)}>Cancelar</Button>
        </div>
      </Sheet>
    </>
  );
}

const MiniStat = ({ icon, label, value }) => (
  <div className="rounded-2xl bg-ink-950/60 border border-ink-700/60 backdrop-blur px-3 py-2.5">
    <Label className="flex items-center gap-1">{icon}{label}</Label>
    <div className="num font-display text-2xl font-bold mt-0.5">{value}</div>
  </div>
);

import { useEffect, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { demoFrames } from '../lib/demos';

/** Anima os 2 quadros do exercício (posição inicial ↔ final) dentro do app, sem internet. */
export default function DemoPlayer({ exerciseId, title, compact = false }) {
  const frames = demoFrames(exerciseId);
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  useEffect(() => {
    if (!frames || !playing) return;
    const t = setInterval(() => setI((x) => 1 - x), 1100);
    return () => clearInterval(t);
  }, [frames, playing]);
  if (!frames) return null;
  if (compact) return (
    <span className="relative block w-full h-full overflow-hidden">
      {frames.map((src, k) => <img key={k} src={src} alt="" className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${i === k ? 'opacity-100' : 'opacity-0'}`} />)}
    </span>
  );
  return (
    <div className="flex flex-col gap-2">
      <button type="button" onClick={() => setPlaying((p) => !p)} aria-label={playing ? 'Pausar demonstração' : 'Reproduzir demonstração'}
        className="relative w-full max-w-full aspect-[3/2] overflow-hidden rounded-2xl bg-white border border-ink-800">
        {frames.map((src, k) => (
          <img key={k} src={src} alt={k === 0 ? `${title}: posição inicial` : `${title}: posição final`}
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ${i === k ? 'opacity-100' : 'opacity-0'}`} />
        ))}
        <span className="absolute left-2 top-2 h-6 px-2.5 rounded-full bg-ink-950/80 text-[11px] font-semibold text-lime grid place-items-center">{i === 0 ? 'Início' : 'Fim'} do movimento</span>
        <span className="absolute right-2 bottom-2 w-9 h-9 rounded-full bg-ink-950/80 text-ink-100 grid place-items-center">{playing ? <Pause size={16} /> : <Play size={16} />}</span>
      </button>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { demoFrames } from '../lib/demos';
import { motionGif, MOTION_CREDIT } from '../lib/motion';

/**
 * Demonstração do exercício dentro do app.
 * 1º: GIF com o movimento completo da ExerciseDB (AscendAPI, plano gratuito) — carregado do CDN deles, nunca copiado para o app.
 * Reserva (sem internet ou GIF indisponível): 2 quadros do Free Exercise DB (domínio público) embutidos no app.
 */
export default function DemoPlayer({ exerciseId, title, compact = false }) {
  const gif = motionGif(exerciseId);
  const [gifFailed, setGifFailed] = useState(false);
  const useGif = gif && !gifFailed;
  const frames = demoFrames(exerciseId);
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  useEffect(() => { setGifFailed(false); }, [gif]);
  useEffect(() => {
    if (useGif || !frames || !playing) return;
    const t = setInterval(() => setI((x) => 1 - x), 1100);
    return () => clearInterval(t);
  }, [useGif, frames, playing]);
  if (!useGif && !frames) return null;

  if (compact) return (
    <span className="relative block w-full h-full overflow-hidden bg-white">
      {useGif ? <img src={gif} alt="" onError={() => setGifFailed(true)} className="absolute inset-0 w-full h-full object-cover" />
        : frames.map((src, k) => <img key={k} src={src} alt="" className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${i === k ? 'opacity-100' : 'opacity-0'}`} />)}
    </span>
  );

  if (useGif) return (
    <div className="flex flex-col gap-1.5">
      <div className="relative w-full max-w-full aspect-square max-h-[48dvh] mx-auto overflow-hidden rounded-2xl bg-white border border-ink-800">
        <img src={gif} alt={`${title}: movimento completo`} onError={() => setGifFailed(true)} className="absolute inset-0 w-full h-full object-contain" />
        <span className="absolute left-2 top-2 h-6 px-2.5 rounded-full bg-ink-950/80 text-[11px] font-semibold text-lime grid place-items-center">Movimento completo</span>
      </div>
      <a href={MOTION_CREDIT.url} target="_blank" rel="noreferrer" className="self-end text-[10px] text-ink-500 underline underline-offset-2">{MOTION_CREDIT.text}</a>
    </div>
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
      {gif && <p className="text-[11px] text-ink-500">Sem conexão: mostrando início e fim. Com internet, aparece o movimento completo.</p>}
    </div>
  );
}

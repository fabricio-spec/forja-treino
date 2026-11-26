import { useState } from 'react';
import { Youtube } from 'lucide-react';
import { GROUPS } from '../lib/seed';
import { EQUIP_FILTERS } from '../lib/exsearch';
import { demoFrames } from '../lib/demos';
import { motionGif } from '../lib/motion';
import { isValidMediaUrl } from '../lib/utils';

const chip = (on) => `shrink-0 h-9 px-4 rounded-full text-sm font-medium border transition ${on ? 'bg-lime text-ink-950 border-lime' : 'border-ink-700 text-ink-300'}`;
const chipSm = (on) => `shrink-0 h-8 px-3 rounded-full text-xs font-medium border transition ${on ? 'bg-volt text-ink-950 border-volt' : 'border-ink-800 text-ink-400'}`;

/** Duas linhas de filtros: grupo muscular (verde) e equipamento (azul). */
export function FilterChips({ group, setGroup, equip, setEquip, className = '' }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex gap-2 overflow-x-auto scrollbar-none" role="group" aria-label="Grupo muscular">
        {['Todos', ...GROUPS].map((g) => <button key={g} type="button" aria-pressed={group === g} onClick={() => setGroup(g)} className={chip(group === g)}>{g}</button>)}
      </div>
      <div className="flex gap-1.5 overflow-x-auto scrollbar-none" role="group" aria-label="Equipamento">
        {EQUIP_FILTERS.map((q) => <button key={q} type="button" aria-pressed={equip === q} onClick={() => setEquip(q)} className={chipSm(equip === q)}>{q === 'Todos' ? 'Qualquer equipamento' : q}</button>)}
      </div>
    </div>
  );
}

/** Miniatura: quadro próprio do app, senão o GIF da ExerciseDB (carrega só quando aparece na tela). */
export function ExerciseThumb({ ex }) {
  const f = demoFrames(ex.id);
  const [failed, setFailed] = useState(false);
  const gif = !f && !failed && motionGif(ex.id);
  if (f || gif) return <img src={f ? f[0] : gif} alt="" loading="lazy" decoding="async" onError={() => setFailed(true)} className="w-14 h-11 shrink-0 rounded-xl object-cover bg-white" />;
  return <span className={`w-14 h-11 shrink-0 rounded-xl grid place-items-center ${isValidMediaUrl(ex.videoUrl) ? 'bg-lime-soft text-lime' : 'bg-ink-800 text-ink-500'}`}><Youtube size={20} /></span>;
}

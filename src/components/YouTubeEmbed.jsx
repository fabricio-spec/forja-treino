import { ExternalLink, PlayCircle, Search } from 'lucide-react';
import { youtubeId, ytSearchUrl } from '../lib/utils';
import { refLink } from '../lib/seed';
import DemoPlayer from './DemoPlayer';
import { demoFrames } from '../lib/demos';

function RefLink({ id }) {
  const href = refLink(id);
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs text-ink-400 underline underline-offset-2">
      Mais ângulos em vídeo no Gymkee (site externo) <ExternalLink size={12} />
    </a>
  );
}

/** Player responsivo do YouTube. Shorts usam proporção 9:16; vídeos normais 16:9. */
const isMedia = (u = '') => /^https?:\/\/\S+\.(gif|png|jpe?g|webp|mp4|webm)(\?\S*)?$/i.test(u.trim());

export default function YouTubeEmbed({ url, title, exerciseId }) {
  if (isMedia(url)) {
    const vid = /\.(mp4|webm)/i.test(url);
    return (
      <div className="rounded-2xl overflow-hidden bg-white border border-ink-800 max-w-full">
        {vid ? <video src={url} autoPlay loop muted playsInline className="w-full max-h-[50dvh] object-contain" />
          : <img src={url} alt={`Demonstração: ${title}`} className="w-full max-h-[50dvh] object-contain" loading="lazy" />}
      </div>
    );
  }
  const id = youtubeId(url);
  if (!id && demoFrames(exerciseId)) {
    return (
      <div className="flex flex-col gap-2">
        <DemoPlayer exerciseId={exerciseId} title={title} />
        <p className="text-[11px] text-ink-500">Toque para pausar. Quer um vídeo? Na Biblioteca, cole um link do YouTube ou de um GIF neste exercício e ele passa a tocar aqui.</p>
      </div>
    );
  }
  const isShort = /shorts\//.test(url || '');
  if (!id) {
    return (
      <div className="rounded-2xl border border-dashed border-ink-600 bg-ink-850 p-5 flex flex-col items-center text-center gap-3">
        <PlayCircle className="text-ink-500" size={36} />
        <p className="text-sm text-ink-300">Nenhum vídeo fixado neste app ainda. Veja a demonstração:</p>
        <RefLink id={exerciseId} />
        <a href={ytSearchUrl(title)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-ink-800 border border-ink-700 text-sm text-ink-100">
          <Search size={16} /> Buscar demonstração no YouTube
        </a>
        <a href="https://www.gifdotreino.com/" target="_blank" rel="noreferrer" className="text-xs text-ink-400 underline underline-offset-2">
          Ver GIF no Gif do Treino (busque “{title}”)
        </a>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <div className={`relative w-full max-w-full overflow-hidden rounded-2xl bg-black border border-ink-800 ${isShort ? 'aspect-[9/16] max-h-[60dvh] mx-auto' : 'aspect-video'}`}>
        <iframe className="absolute inset-0 w-full h-full" src={`https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`}
          title={`Vídeo: ${title}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen loading="lazy" />
      </div>
      <RefLink id={exerciseId} />
      <a href={`https://www.youtube.com/watch?v=${id}`} target="_blank" rel="noreferrer" className="self-end inline-flex items-center gap-1 text-xs text-ink-400">
        Abrir no YouTube <ExternalLink size={12} />
      </a>
    </div>
  );
}

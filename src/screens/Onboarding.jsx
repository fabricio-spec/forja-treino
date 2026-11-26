import { useState } from 'react';
import { ArrowRight, Hammer, LayoutList } from 'lucide-react';
import { useStore } from '../lib/store';
import { BG } from '../lib/images';
import { Button, Label, NavButtons } from '../components/ui';
import ProfileForm from '../components/ProfileForm';

export default function Onboarding({ onDone }) {
  const { profile, setProfile } = useStore();
  const [p, setP] = useState(profile);
  const [step, setStep] = useState(0);
  const finish = (save, choice) => { setProfile({ ...(save ? p : profile), onboarded: true }); onDone(choice); };

  if (step === 0) return (
    <div className="relative min-h-full bg-ink-950 flex flex-col justify-end">
      <img src={BG.onboarding} alt="" aria-hidden="true" className="fixed inset-0 w-full h-full object-cover" />
      <div className="fixed inset-0 bg-gradient-to-b from-ink-950/10 via-ink-950/60 to-ink-950" />
      <div className="relative max-w-lg mx-auto w-full px-6 pb-10 flex flex-col gap-5">
        <Label className="text-lime">Treino · Descanso · Nutrição</Label>
        <h1 className="font-display text-[64px] leading-[.88] font-extrabold uppercase text-ink-100">Forja<br /><span className="text-lime">seu</span> físico</h1>
        <p className="text-ink-300 text-lg leading-snug">Fichas com Tri-set, cronômetro de descanso automático, vídeos de execução e um plano alimentar feito para o seu objetivo.</p>
        <Button size="lg" onClick={() => setStep(1)}>Montar meu perfil <ArrowRight size={20} /></Button>
        <Button variant="plain" onClick={() => finish(false)}>Pular por enquanto</Button>
      </div>
    </div>
  );

  if (step === 2) return (
    <div className="min-h-full bg-ink-950">
      <div className="max-w-lg mx-auto px-5 pt-5 pb-10 flex flex-col gap-5">
        <NavButtons onBack={() => setStep(1)} />
        <div>
          <Label className="text-lime">Seus treinos</Label>
          <h1 className="font-display text-4xl font-extrabold uppercase mt-1">Como quer começar?</h1>
          <p className="text-ink-400 mt-1 text-sm">Você pode mudar isso a qualquer momento na aba Meus Treinos.</p>
        </div>
        <button onClick={() => finish(true, 'build')} className="text-left rounded-3xl border-2 border-lime bg-lime-soft/40 p-5 flex gap-4 items-start">
          <span className="w-12 h-12 shrink-0 rounded-2xl bg-lime text-ink-950 grid place-items-center"><Hammer size={24} /></span>
          <span>
            <span className="block font-display text-2xl font-bold uppercase">Montar meu próprio treino</span>
            <span className="block text-sm text-ink-300 mt-1">Comece do zero: crie suas fichas, escolha os exercícios da biblioteca e monte Tri-sets ou séries gigantes com rodadas e descanso do seu jeito.</span>
          </span>
        </button>
        <button onClick={() => finish(true, 'examples')} className="text-left rounded-3xl border border-ink-700 bg-ink-900 p-5 flex gap-4 items-start">
          <span className="w-12 h-12 shrink-0 rounded-2xl bg-ink-800 text-volt grid place-items-center"><LayoutList size={24} /></span>
          <span>
            <span className="block font-display text-2xl font-bold uppercase">Partir das fichas prontas</span>
            <span className="block text-sm text-ink-300 mt-1">Use as fichas de exemplo (Treinos A, B e C) e edite, duplique ou apague o que quiser.</span>
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-full bg-ink-950">
      <div className="max-w-lg mx-auto px-5 pt-5 pb-10 flex flex-col gap-6">
        <NavButtons onBack={() => setStep(0)} />
        <div>
          <Label className="text-lime">Seu perfil</Label>
          <h1 className="font-display text-4xl font-extrabold uppercase mt-1">Vamos calcular sua dieta</h1>
          <p className="text-ink-400 mt-1 text-sm">Usamos esses dados para estimar seu gasto calórico e os macros. Dá para mudar depois na aba Nutrição.</p>
        </div>
        <ProfileForm value={p} onChange={setP} />
        <Button size="lg" onClick={() => setStep(2)}>Continuar <ArrowRight size={20} /></Button>
      </div>
    </div>
  );
}

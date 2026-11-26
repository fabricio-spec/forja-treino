import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useStore } from '../lib/store';
import { BG } from '../lib/images';
import { Button, Label } from '../components/ui';
import ProfileForm from '../components/ProfileForm';

export default function Onboarding({ onDone }) {
  const { profile, setProfile } = useStore();
  const [p, setP] = useState(profile);
  const [step, setStep] = useState(0);
  const finish = (save) => { setProfile({ ...(save ? p : profile), onboarded: true }); onDone(); };

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

  return (
    <div className="min-h-full bg-ink-950">
      <div className="max-w-lg mx-auto px-5 pt-8 pb-10 flex flex-col gap-6">
        <div>
          <Label className="text-lime">Seu perfil</Label>
          <h1 className="font-display text-4xl font-extrabold uppercase mt-1">Vamos calcular sua dieta</h1>
          <p className="text-ink-400 mt-1 text-sm">Usamos esses dados para estimar seu gasto calórico e os macros. Dá para mudar depois na aba Nutrição.</p>
        </div>
        <ProfileForm value={p} onChange={setP} />
        <Button size="lg" onClick={() => finish(true)}>Ver meu plano <ArrowRight size={20} /></Button>
      </div>
    </div>
  );
}

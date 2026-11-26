import { useState } from 'react';
import { Check, LogIn, Plus, RotateCcw, Save, Trash2, UserRound } from 'lucide-react';
import { useStore } from '../lib/store';
import { ACTIVE_PROFILE, listProfiles, createProfile, switchProfile, deleteProfile } from '../lib/storage';
import { Button, Field, Label, Sheet } from './ui';
import ProfileForm from './ProfileForm';
import BackupSection from './BackupSection';

export const initials = (name) => (name || '').trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

/** Botão redondo com as iniciais, usado nos cabeçalhos. */
export function ProfileButton({ onClick, className = '' }) {
  const { profile } = useStore();
  return (
    <button onClick={onClick} aria-label="Meu perfil" className={`w-11 h-11 shrink-0 rounded-full bg-ink-950/70 border border-lime/50 backdrop-blur grid place-items-center text-lime font-display text-lg font-bold ${className}`}>
      {initials(profile.name) || <UserRound size={20} />}
    </button>
  );
}

export default function ProfileSheet({ open, onClose }) {
  const { profile, setProfile, resetAll } = useStore();
  const [draft, setDraft] = useState(profile);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [confirm, setConfirm] = useState(null); // 'reset' | profileId
  const [saved, setSaved] = useState(false);
  const profiles = listProfiles();

  const saveDraft = () => { setProfile({ ...draft, onboarded: true }); setSaved(true); setTimeout(() => setSaved(false), 1800); };

  return (
    <Sheet open={open} onClose={onClose} title="Meu perfil" full>
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-4">
          <ProfileForm value={draft} onChange={setDraft} />
          <Button size="lg" onClick={saveDraft}>{saved ? <><Check size={18} /> Salvo, plano recalculado</> : <><Save size={18} /> Salvar alterações</>}</Button>
        </section>

        <section className="flex flex-col gap-2">
          <Label>Perfis neste aparelho</Label>
          <p className="text-xs text-ink-400 -mt-1">Cada perfil tem suas próprias fichas, histórico e plano alimentar.</p>
          <ul className="rounded-3xl border border-ink-800 divide-y divide-ink-800 overflow-hidden">
            {profiles.map((p) => {
              const active = p.id === ACTIVE_PROFILE;
              return (
                <li key={p.id} className="flex items-center gap-3 px-4 py-3">
                  <span className={`w-10 h-10 shrink-0 rounded-full grid place-items-center font-display font-bold ${active ? 'bg-lime text-ink-950' : 'bg-ink-800 text-ink-300'}`}>{initials(p.name) || <UserRound size={18} />}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-ink-100 truncate">{p.name}</span>
                    <span className="block text-xs text-ink-400">{active ? 'Em uso agora' : 'Toque em Entrar para trocar'}</span>
                  </span>
                  {active ? <Check size={18} className="text-lime" /> : (
                    confirm === p.id
                      ? <span className="flex gap-1"><Button size="sm" variant="ghost" onClick={() => setConfirm(null)}>Não</Button><Button size="sm" variant="danger" onClick={() => deleteProfile(p.id)}>Apagar</Button></span>
                      : <span className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => switchProfile(p.id)}><LogIn size={14} /> Entrar</Button>
                          <button aria-label={`Apagar perfil ${p.name}`} onClick={() => setConfirm(p.id)} className="w-9 h-9 rounded-full bg-ink-800 text-danger grid place-items-center"><Trash2 size={15} /></button>
                        </span>
                  )}
                </li>
              );
            })}
          </ul>
          {adding ? (
            <form className="flex flex-col gap-2" onSubmit={(e) => { e.preventDefault(); const id = createProfile(newName.trim()); switchProfile(id); }}>
              <Field id="new-profile" label="Nome do novo perfil" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ex.: Ana" autoFocus />
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant="ghost" onClick={() => setAdding(false)}>Cancelar</Button>
                <Button type="submit"><Plus size={16} /> Criar e entrar</Button>
              </div>
            </form>
          ) : <Button variant="ghost" onClick={() => setAdding(true)}><Plus size={16} /> Novo perfil (novo cadastro)</Button>}
        </section>

        <BackupSection />

        <section className="flex flex-col gap-2">
          <Label>Recomeçar</Label>
          <Button variant="ghost" onClick={() => { setProfile({ ...profile, onboarded: false }); location.reload(); }}><RotateCcw size={16} /> Refazer cadastro inicial</Button>
          {confirm === 'reset' ? (
            <div className="rounded-2xl border border-danger/40 bg-danger/10 p-3 flex flex-col gap-2">
              <p className="text-sm text-ink-200">Isso apaga fichas, histórico e dados deste perfil e volta ao estado inicial. Não dá para desfazer.</p>
              <div className="grid grid-cols-2 gap-2"><Button variant="ghost" onClick={() => setConfirm(null)}>Cancelar</Button><Button variant="danger" onClick={resetAll}>Apagar tudo</Button></div>
            </div>
          ) : <Button variant="plain" onClick={() => setConfirm('reset')}><Trash2 size={16} /> Apagar todos os dados deste perfil</Button>}
        </section>
      </div>
    </Sheet>
  );
}

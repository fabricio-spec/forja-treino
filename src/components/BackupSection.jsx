import { useRef, useState } from 'react';
import { Download, Upload } from 'lucide-react';
import { exportBackup, readBackupFile, restoreBackup, summarize } from '../lib/backup';
import { toast } from '../lib/toast';
import { Button, Label } from './ui';

/** Exportar / importar backup de todos os perfis deste aparelho. */
export default function BackupSection() {
  const input = useRef(null);
  const [pending, setPending] = useState(null); // { backup, summary }
  const [error, setError] = useState('');

  const doExport = async () => {
    const r = await exportBackup();
    if (r === 'downloaded') toast('Backup baixado. Guarde o arquivo em local seguro.');
    if (r === 'shared') toast('Backup compartilhado.');
  };
  const onFile = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    setError('');
    try { const b = await readBackupFile(f); setPending({ backup: b, summary: summarize(b) }); }
    catch (err) { setError(err.message); }
  };

  return (
    <section className="flex flex-col gap-2">
      <Label>Backup dos dados</Label>
      <p className="text-xs text-ink-400 -mt-1">Seus dados ficam só neste aparelho. Salve um arquivo de backup de vez em quando (todos os perfis, fichas, histórico e nutrição) para não perder nada ao trocar de celular ou limpar o navegador.</p>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={doExport}><Download size={16} /> Exportar</Button>
        <Button variant="ghost" onClick={() => input.current?.click()}><Upload size={16} /> Importar</Button>
      </div>
      <input ref={input} type="file" accept="application/json,.json" className="hidden" onChange={onFile} aria-label="Escolher arquivo de backup" />
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      {pending && (
        <div className="rounded-2xl border border-danger/40 bg-danger/10 p-3 flex flex-col gap-2">
          <p className="text-sm text-ink-100 font-medium">Restaurar backup de {new Date(pending.backup.exportedAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}?</p>
          <ul className="text-xs text-ink-300 list-disc pl-4">
            {pending.summary.map((p, i) => <li key={i}>{p.name}: {p.workouts} fichas, {p.sessions} treinos no histórico</li>)}
          </ul>
          <p className="text-xs text-ink-300">Isso substitui TODOS os dados atuais deste aparelho pelos do arquivo. Se quiser, exporte antes um backup do que está aqui agora.</p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="ghost" onClick={() => setPending(null)}>Cancelar</Button>
            <Button variant="danger" onClick={() => restoreBackup(pending.backup)}>Substituir dados</Button>
          </div>
        </div>
      )}
    </section>
  );
}

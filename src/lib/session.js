import { uid } from './utils';

/**
 * Transforma a ficha em uma sequência linear de passos.
 * - Exercício individual: 1 passo por série, descanso após cada série.
 * - Circuito (Bi-set, Tri-set, Série gigante): por rodada, todos os exercícios em sequência; descanso só após o último.
 */
export function buildSession(workout, exById, lastLoads = {}) {
  const entries = [];
  const steps = [];
  workout.blocks.forEach((b, bi) => {
    const base = entries.length;
    b.items.forEach((it) => {
      const n = b.type === 'triset' ? b.sets ?? it.sets : it.sets;
      const load = lastLoads[it.exerciseId] ?? it.load;
      entries.push({ exerciseId: it.exerciseId, name: exById(it.exerciseId)?.name ?? 'Exercício', blockId: b.id, blockType: b.type,
        target: { reps: it.reps, load: it.load }, sets: Array.from({ length: n }, () => ({ reps: it.reps, load, done: false })) });
    });
    if (b.type === 'triset') {
      const rounds = b.sets ?? b.items[0].sets;
      for (let s = 0; s < rounds; s++) b.items.forEach((_, k) => steps.push({ e: base + k, s, bi, kind: 'triset', label: b.label || '', pos: k, round: s, rounds, rest: k === b.items.length - 1 ? b.rest : 0 }));
    } else {
      const n = b.items[0].sets;
      for (let s = 0; s < n; s++) steps.push({ e: base, s, bi, kind: 'single', rest: b.rest });
    }
  });
  if (steps.length) steps[steps.length - 1].rest = 0;
  return { id: uid('ses'), workoutId: workout.id, workoutName: `${workout.name} · ${workout.focus}`, startedAt: new Date().toISOString(), entries, steps, idx: 0, rest: null };
}

/** Última carga usada em cada exercício (para pré-preencher). */
export function lastLoadsFrom(sessions) {
  const out = {};
  for (const s of [...sessions].sort((a, b) => new Date(a.startedAt) - new Date(b.startedAt)))
    for (const e of s.entries) { const d = e.sets.filter((x) => x.done && x.load > 0); if (d.length) out[e.exerciseId] = d[d.length - 1].load; }
  return out;
}

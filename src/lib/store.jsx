import { createContext, useContext, useMemo } from 'react';
import { usePersistentState, clearAll, load, save, SCHEMA_VERSION, ACTIVE_PROFILE, renameProfile } from './storage';
import { EXERCISES, seedWorkouts, seedSessions, isSampleWorkout } from './seed';
import { uid } from './utils';
import { CATALOG } from './catalog';

/*
  Arquitetura de dados (localStorage, prefixo "forja:")
  ─ profile        { name, sex, weight, height, age, activity, goal, onboarded }
  ─ exercises      [{ id, name, group, instructions, videoUrl, custom }]
  ─ workouts       [{ id, name, focus, color, createdAt, renewedFrom?, blocks: [Block] }]
       Block       { id, type: 'single'|'triset', label?, rest (s), sets? (rodadas do circuito), items: [{ exerciseId, sets, reps, load }] }
                  'triset' = circuito de 2 a 6 exercícios: Bi-set (2), Tri-set (3), Série gigante (4+)
  ─ sessions       [{ id, workoutId, workoutName, startedAt, endedAt, durationSec, volume, entries: [{ exerciseId, name, sets: [{ reps, load, done }] }] }]
  ─ activeSession  sessão em andamento (sobrevive a recarregar a página)
  ─ diet           { mode: 'auto'|'custom', targets: { protein, carbs, fat } | null, meals: [{ id, name, time, items: [{ id, foodId, grams }] }], customFoods: [{ id, name, p, c, f }] }
  ─ snoozes        { [workoutId]: ISO data até quando o alerta de 6 meses fica adiado }
*/

function firstRun() {
  const v = load('schema', 0);
  if (v >= SCHEMA_VERSION) return;
  if (v === 0) {
    const w = seedWorkouts();
    save('workouts', w);
    save('sessions', ACTIVE_PROFILE === 'main' ? seedSessions(w) : []); // perfis novos começam sem histórico de exemplo
    save('exercises', EXERCISES);
  } else {
    // v1 → v2: adiciona o Treino C (séries gigantes) sem mexer nos dados do usuário
    const cur = load('workouts', []);
    const c = seedWorkouts().find((x) => x.id === 'w_pernas_circuito');
    if (c && !cur.some((x) => x.id === c.id)) save('workouts', [...cur, c]);
  }
  save('schema', SCHEMA_VERSION);
}
firstRun();

const Ctx = createContext(null);

export function StoreProvider({ children }) {
  const [profile, setProfileRaw] = usePersistentState('profile', { name: '', sex: 'M', weight: 78, height: 178, age: 28, activity: 'moderado', goal: 'hipertrofia', onboarded: false });
  const [myExercises, setExercises] = usePersistentState('exercises', EXERCISES);
  // Biblioteca = exercícios salvos neste perfil (35 base + criados/editados) + catálogo ExerciseDB (só leitura, não ocupa o armazenamento).
  const exercises = useMemo(() => {
    const own = new Set(myExercises.map((e) => e.id));
    return [...myExercises, ...CATALOG.filter((c) => !own.has(c.id))];
  }, [myExercises]);
  const exMap = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises]);
  const [workouts, setWorkouts] = usePersistentState('workouts', seedWorkouts);
  const [sessions, setSessions] = usePersistentState('sessions', []);
  const [activeSession, setActiveSession] = usePersistentState('activeSession', null);
  const [snoozes, setSnoozes] = usePersistentState('snoozes', {});
  const [diet, setDiet] = usePersistentState('diet', { mode: 'auto', targets: null, meals: [], customFoods: [] });

  const setProfile = (v) => setProfileRaw((cur) => { const n = typeof v === 'function' ? v(cur) : v; renameProfile(ACTIVE_PROFILE, n.name); return n; });

  const api = useMemo(() => ({
    profile, setProfile, exercises, setExercises, workouts, setWorkouts, sessions, setSessions,
    activeSession, setActiveSession, snoozes, setSnoozes, diet, setDiet,
    exById: (id) => exMap.get(id),
    upsertWorkout: (w) => setWorkouts((all) => (all.some((x) => x.id === w.id) ? all.map((x) => (x.id === w.id ? w : x)) : [...all, w])),
    deleteWorkout: (id) => setWorkouts((all) => all.filter((x) => x.id !== id)),
    addExercise: (e) => setExercises((all) => [...all, e]),
    updateExercise: (e) => setExercises((all) => (all.some((x) => x.id === e.id) ? all.map((x) => (x.id === e.id ? e : x)) : [...all, e])),
    deleteExercise: (id) => setExercises((all) => all.filter((x) => x.id !== id)),
    clearSamples: () => setSessions((all) => all.filter((s) => !s.sample)),
    removeSampleWorkouts: () => { setWorkouts((all) => all.filter((w) => !isSampleWorkout(w))); setSessions((all) => all.filter((s) => !s.sample)); },
    duplicateWorkout: (w) => { const copy = { ...structuredClone(w), id: uid('w'), name: `${w.name} (cópia)`, sample: false, createdAt: new Date().toISOString(), blocks: w.blocks.map((b) => ({ ...structuredClone(b), id: uid('blk') })) }; setWorkouts((all) => [...all, copy]); return copy.id; },
    resetAll: () => { clearAll(); location.reload(); },
  }), [profile, exercises, exMap, workouts, sessions, activeSession, snoozes, diet]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export const useStore = () => useContext(Ctx);

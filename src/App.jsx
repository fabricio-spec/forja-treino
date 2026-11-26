import { useEffect, useState } from 'react';
import BottomNav from './components/BottomNav';
import Workouts from './screens/Workouts';
import Home from './screens/Home';
import Library from './screens/Library';
import Nutrition from './screens/Nutrition';
import Progress from './screens/Progress';
import WorkoutEditor from './screens/WorkoutEditor';
import WorkoutSession from './screens/WorkoutSession';
import Onboarding from './screens/Onboarding';
import { useStore } from './lib/store';
import { periodStatus } from './lib/periodization';
import { registerTabHandler, goTab } from './lib/nav';

const VALID = ['inicio', 'treinos', 'biblioteca', 'nutricao', 'evolucao'];
const fromHash = () => (VALID.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'inicio');

export default function App() {
  const { profile, activeSession, workouts, snoozes, removeSampleWorkouts } = useStore();
  const [tab, setTab] = useState(fromHash);
  const [editing, setEditing] = useState(null); // id da ficha | 'new' | null
  const [seedExercise, setSeedExercise] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(!profile.onboarded);

  useEffect(() => { registerTabHandler((t) => setTab(VALID.includes(t) ? t : 'inicio'), VALID); }, []);
  const go = goTab;

  const due = workouts.some((w) => { const s = periodStatus(w, snoozes); return s.level === 'due' && !s.snoozed; });

  if (showOnboarding) return <Onboarding onDone={(choice) => {
    setShowOnboarding(false);
    if (choice === 'build') { removeSampleWorkouts(); go('treinos'); setEditing('new'); }
  }} />;
  if (activeSession) return <WorkoutSession />;

  return (
    <div className="min-h-full bg-ink-950 text-ink-100">
      <main className="max-w-lg mx-auto pb-28">
        {tab === 'inicio' && <Home onEdit={setEditing} />}
        {tab === 'treinos' && <Workouts onEdit={setEditing} />}
        {tab === 'biblioteca' && <Library onNewWorkoutWith={(exId) => { setSeedExercise(exId); setEditing('new'); }} onEdit={setEditing} />}
        {tab === 'nutricao' && <Nutrition />}
        {tab === 'evolucao' && <Progress />}
      </main>
      <BottomNav tab={tab} onChange={go} badge={{ inicio: due, treinos: due }} />
      {editing && <WorkoutEditor id={editing} seedExercise={editing === 'new' ? seedExercise : null} onClose={() => { setEditing(null); setSeedExercise(null); }} />}
    </div>
  );
}

import { daysBetween } from './utils';

export const PERIOD_DAYS = 180;
export const WARN_DAYS = 150;

export function periodStatus(workout, snoozes = {}) {
  const age = daysBetween(workout.createdAt);
  const snoozedUntil = snoozes[workout.id];
  const snoozed = snoozedUntil && new Date(snoozedUntil) > new Date();
  if (age >= PERIOD_DAYS) return { level: 'due', age, snoozed, left: 0 };
  if (age >= WARN_DAYS) return { level: 'soon', age, snoozed, left: PERIOD_DAYS - age };
  return { level: 'ok', age, snoozed, left: PERIOD_DAYS - age };
}

export const STIMULUS_TIPS = [
  { title: 'Mude a faixa de repetições', text: 'Se você treinou 8–12 reps, faça um bloco de 4–6 semanas com 5–8 reps e cargas maiores (ou 15–20 reps para resistência).' },
  { title: 'Controle a cadência', text: 'Use 3 s na descida e 1 s de pausa no alongamento. O mesmo peso fica mais desafiador e o estímulo muda.' },
  { title: 'Técnicas de intensidade', text: 'Inclua drop-set ou rest-pause na última série dos exercícios principais, 1 a 2 vezes por treino.' },
  { title: 'Reorganize em Tri-sets', text: 'Agrupe exercícios acessórios em Tri-sets para aumentar a densidade do treino e reduzir o tempo de sessão.' },
  { title: 'Troque o ângulo', text: 'Inclinado no lugar do reto, unilateral no lugar do bilateral, polia no lugar do halter.' },
];

/** Sugere trocas: para cada exercício, outro do mesmo grupo que ainda não está na ficha. */
export function swapSuggestions(workout, library) {
  const used = new Set(workout.blocks.flatMap((b) => b.items.map((i) => i.exerciseId)));
  const taken = new Set();
  return workout.blocks.flatMap((b) => b.items.map((it) => {
    const cur = library.find((e) => e.id === it.exerciseId);
    if (!cur) return null;
    const alt = library.find((e) => e.group === cur.group && !used.has(e.id) && !taken.has(e.id));
    if (!alt) return null;
    taken.add(alt.id);
    return { from: cur, to: alt };
  })).filter(Boolean);
}

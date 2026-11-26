// Cálculos nutricionais: Mifflin-St Jeor + fator de atividade + ajuste por objetivo.

export const ACTIVITY = [
  { id: 'sedentario', label: 'Sedentário', hint: 'Pouco ou nenhum exercício', factor: 1.2 },
  { id: 'leve', label: 'Leve', hint: 'Treino 1–3x por semana', factor: 1.375 },
  { id: 'moderado', label: 'Moderado', hint: 'Treino 3–5x por semana', factor: 1.55 },
  { id: 'alto', label: 'Alto', hint: 'Treino 6–7x por semana', factor: 1.725 },
  { id: 'atleta', label: 'Muito alto', hint: 'Treino 2x/dia ou trabalho físico', factor: 1.9 },
];

// adj = ajuste sobre o gasto total; p/f = gramas por kg de peso corporal.
export const GOALS = [
  { id: 'hipertrofia', label: 'Hipertrofia', hint: 'Superávit para crescer', adj: 0.15, p: 2.0, f: 0.9 },
  { id: 'massa-magra', label: 'Ganho de massa magra', hint: 'Superávit leve, pouco ganho de gordura', adj: 0.08, p: 2.2, f: 0.9 },
  { id: 'cutting', label: 'Perda de peso (cutting)', hint: 'Déficit preservando músculo', adj: -0.2, p: 2.3, f: 0.8 },
  { id: 'manutencao', label: 'Manutenção', hint: 'Manter peso e composição', adj: 0, p: 1.8, f: 1.0 },
];

export function calcPlan(p) {
  const w = Number(p.weight), h = Number(p.height), a = Number(p.age);
  if (!w || !h || !a) return null;
  const bmr = 10 * w + 6.25 * h - 5 * a + (p.sex === 'F' ? -161 : 5);
  const act = ACTIVITY.find((x) => x.id === p.activity) ?? ACTIVITY[2];
  const goal = GOALS.find((x) => x.id === p.goal) ?? GOALS[0];
  const tdee = bmr * act.factor;
  const kcal = Math.round((tdee * (1 + goal.adj)) / 10) * 10;
  const protein = Math.round(w * goal.p);
  const fat = Math.round(w * goal.f);
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
  const imc = w / (h / 100) ** 2;
  return { bmr: Math.round(bmr), tdee: Math.round(tdee), kcal, protein, fat, carbs, imc, goal, act, water: Math.round(w * 35) };
}

// Macros por 100 g. `unit` = exibir em unidades (peso da unidade em UNIT_G).
const F = {
  frango: { name: 'Peito de frango grelhado', p: 31, c: 0, f: 3.6 },
  patinho: { name: 'Patinho moído', p: 26, c: 0, f: 7 },
  tilapia: { name: 'Tilápia grelhada', p: 26, c: 0, f: 2.7 },
  ovo: { name: 'Ovo inteiro', p: 12.6, c: 0.8, f: 10, unit: 'un' },
  whey: { name: 'Whey protein', p: 80, c: 10, f: 5, unit: 'scoop (30 g)' },
  iogurte: { name: 'Iogurte natural desnatado', p: 5.5, c: 7.5, f: 0.2 },
  arroz: { name: 'Arroz cozido', p: 2.5, c: 28, f: 0.2 },
  batata: { name: 'Batata-doce cozida', p: 1.4, c: 18.4, f: 0.1 },
  aveia: { name: 'Aveia em flocos', p: 14, c: 56, f: 7 },
  pao: { name: 'Pão integral', p: 9, c: 42, f: 3.5, unit: 'fatia(s) de 50 g' },
  feijao: { name: 'Feijão cozido', p: 4.8, c: 13.6, f: 0.5 },
  banana: { name: 'Banana', p: 1.3, c: 23, f: 0.3, unit: 'un média' },
  azeite: { name: 'Azeite de oliva', p: 0, c: 0, f: 100 },
  pasta: { name: 'Pasta de amendoim', p: 25, c: 20, f: 50 },
  castanha: { name: 'Castanhas mistas', p: 18, c: 20, f: 55 },
};

export const SUBSTITUTIONS = [
  { group: 'Proteínas', items: ['100 g de frango', '110 g de tilápia', '120 g de patinho', '4 ovos', '1 scoop de whey + 1 ovo'] },
  { group: 'Carboidratos', items: ['100 g de arroz', '150 g de batata-doce', '120 g de mandioca', '100 g de macarrão cozido', '2 fatias de pão integral'] },
  { group: 'Gorduras', items: ['1 col. sopa de azeite (10 g)', '15 g de castanhas', '1 col. sopa de pasta de amendoim', '¼ de abacate (50 g)'] },
  { group: 'Frutas', items: ['1 banana', '1 maçã', '2 kiwis', '150 g de mamão', '1 xícara de morangos'] },
];

// Cada refeição recebe uma fração dos macros. Fontes em ordem de preferência,
// cada uma com um teto (g) para as porções ficarem realistas; a última absorve o restante.
const MEALS = [
  { name: 'Café da manhã', time: '07:00', share: 0.22, P: [['ovo', 150], ['whey', 30]], C: [['pao', 100], ['aveia', 60], ['banana']], f: null, extra: 'Café ou chá sem açúcar' },
  { name: 'Lanche da manhã', time: '10:00', share: 0.12, P: [['iogurte', 200], ['whey']], C: [['aveia', 40], ['banana']], f: 'castanha', extra: '' },
  { name: 'Almoço', time: '13:00', share: 0.28, P: [['frango', 180], ['patinho']], C: [['arroz', 250], ['feijao', 160], ['batata']], f: 'azeite', extra: 'Salada verde à vontade' },
  { name: 'Pré-treino', time: '17:00', share: 0.14, P: [['whey', 30], ['iogurte']], C: [['banana', 240], ['aveia', 50], ['pao']], f: null, extra: '' },
  { name: 'Jantar', time: '20:30', share: 0.24, P: [['tilapia', 200], ['ovo']], C: [['batata', 300], ['arroz']], f: 'azeite', extra: 'Legumes no vapor à vontade' },
];

const round5 = (n) => Math.max(5, Math.round(n / 5) * 5);
const UNIT_G = { ovo: 50, whey: 30, pao: 50, banana: 120 };

function portion(key, grams) {
  const f = F[key];
  if (f.unit) {
    const per = UNIT_G[key];
    const n = Math.max(1, Math.round((grams / per) * 2) / 2);
    return { key, text: `${n.toLocaleString('pt-BR')} ${f.unit}`, g: n * per, food: f.name };
  }
  return { key, text: `${round5(grams)} g`, g: round5(grams), food: f.name };
}

/** Distribui `target` gramas de um macro (m = 'p' | 'c') entre as fontes, respeitando os tetos. */
function fill(sources, target, m, already = 0) {
  let left = target - already;
  const out = [];
  sources.forEach(([key, cap], i) => {
    if (left <= 4) return;
    const per100 = F[key][m];
    let g = (left / per100) * 100;
    if (cap && i < sources.length - 1) g = Math.min(g, cap);
    const P = portion(key, g);
    out.push(P);
    left -= (P.g * per100) / 100;
  });
  return out;
}

const sum = (items, m) => items.reduce((t, it) => t + (it.g * F[it.key][m]) / 100, 0);

export function mealPlan(plan) {
  return MEALS.map((m) => {
    const tp = plan.protein * m.share, tc = plan.carbs * m.share, tf = plan.fat * m.share;
    const prot = fill(m.P, tp, 'p');
    const carb = fill(m.C, tc, 'c', sum(prot, 'c'));
    const items = [...prot, ...carb];
    if (m.f) {
      const g = Math.max(0, tf - sum(items, 'f')) / (F[m.f].f / 100);
      if (g >= 4) items.push({ text: `${Math.round(g)} g`, food: F[m.f].name });
    }
    return { ...m, items, kcal: Math.round(plan.kcal * m.share), macros: { p: Math.round(tp), c: Math.round(tc), f: Math.round(tf) } };
  });
}

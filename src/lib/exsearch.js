import { EQUIPMENT } from './catalog';

export const norm = (t = '') => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

// Equipamento dos 35 exercícios base (os do catálogo já vêm com o seu)
const CORE_EQ = {
  'supino-reto': 'Barra', 'supino-incl-halter': 'Halteres', crucifixo: 'Halteres', crossover: 'Polia', flexao: 'Peso corporal', 'peck-deck': 'Máquina',
  'puxada-frente': 'Polia', 'remada-curvada': 'Barra', 'remada-baixa': 'Polia', 'remada-unilateral': 'Halteres', 'barra-fixa': 'Peso corporal', 'pulldown-braco-reto': 'Polia',
  agachamento: 'Barra', 'leg-press': 'Máquina', 'cadeira-extensora': 'Máquina', 'mesa-flexora': 'Máquina', stiff: 'Barra', afundo: 'Halteres', 'panturrilha-pe': 'Barra',
  desenvolvimento: 'Halteres', 'elevacao-lateral': 'Halteres', 'elevacao-frontal': 'Halteres', 'crucifixo-inverso': 'Halteres', 'face-pull': 'Polia',
  'rosca-direta': 'Barra', 'rosca-martelo': 'Halteres', 'rosca-scott': 'Halteres', 'triceps-corda': 'Polia', 'triceps-frances': 'Halteres', 'mergulho-banco': 'Peso corporal',
  prancha: 'Peso corporal', 'abdominal-supra': 'Peso corporal', 'elevacao-pernas': 'Peso corporal', 'abdominal-polia': 'Polia', pallof: 'Polia',
};
export const equipmentOf = (e) => e.equipment || CORE_EQ[e.id] || 'Outros';
export const EQUIP_FILTERS = ['Todos', ...EQUIPMENT];

/** Filtra por grupo, equipamento e busca (português e inglês, todas as palavras). Os exercícios do perfil vêm primeiro. */
export function filterExercises(list, { q = '', group = 'Todos', equip = 'Todos' } = {}) {
  const words = norm(q).split(/\s+/).filter(Boolean);
  return list.filter((e) => {
    if (group !== 'Todos' && e.group !== group) return false;
    if (equip !== 'Todos' && equipmentOf(e) !== equip) return false;
    if (!words.length) return true;
    const hay = norm(`${e.name} ${e.en || ''}`);
    return words.every((w) => hay.includes(w));
  });
}

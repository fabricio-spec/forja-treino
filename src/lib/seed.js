import { DAY, uid } from './utils';

export const GROUPS = ['Peito', 'Costas', 'Pernas', 'Ombros', 'Braços', 'Core'];

// videoUrl vazio = mostra botão "Buscar no YouTube" e campo para fixar um link próprio.
const ex = (id, name, group, instructions, videoUrl = '') => ({ id, name, group, instructions, videoUrl, custom: false });

export const EXERCISES = [
  ex('supino-reto', 'Supino reto com barra', 'Peito', 'Escápulas retraídas e pés firmes. Desça a barra até a linha do mamilo com cotovelos a ~45° e empurre até quase estender.'),
  ex('supino-incl-halter', 'Supino inclinado com halteres', 'Peito', 'Banco a 30°. Desça os halteres ao lado do peito superior, sem bater no fim, e suba convergindo levemente.'),
  ex('crucifixo', 'Crucifixo com halteres', 'Peito', 'Cotovelos levemente flexionados e fixos. Abra em arco até sentir alongamento no peito e feche contraindo.'),
  ex('crossover', 'Crossover na polia', 'Peito', 'Tronco um pouco à frente. Traga as manoplas em arco até se cruzarem na altura do umbigo, controlando a volta.'),
  ex('flexao', 'Flexão de braço', 'Peito', 'Corpo em prancha, mãos um pouco além dos ombros. Desça até o peito quase tocar o chão e empurre.'),
  ex('peck-deck', 'Peck deck (voador)', 'Peito', 'Ajuste o banco para as manoplas ficarem na altura do peito. Feche sem tirar as costas do encosto.'),

  ex('puxada-frente', 'Puxada frontal', 'Costas', 'Pegada um pouco mais larga que os ombros. Puxe a barra até o alto do peito levando os cotovelos para baixo e para trás.'),
  ex('remada-curvada', 'Remada curvada com barra', 'Costas', 'Quadril para trás, tronco a ~45° e coluna neutra. Puxe a barra até o abdômen e controle a descida.'),
  ex('remada-baixa', 'Remada baixa na polia', 'Costas', 'Peito aberto, puxe o triângulo até o abdômen juntando as escápulas. Não balance o tronco.'),
  ex('remada-unilateral', 'Remada unilateral (serrote)', 'Costas', 'Apoie joelho e mão no banco. Puxe o halter em direção ao quadril, cotovelo rente ao corpo.'),
  ex('barra-fixa', 'Barra fixa', 'Costas', 'Pegada pronada. Inicie deprimindo as escápulas e suba até o queixo passar a barra.'),
  ex('pulldown-braco-reto', 'Pulldown braços estendidos', 'Costas', 'Braços quase estendidos, leve a barra da polia até as coxas em arco, contraindo o dorsal.'),

  ex('agachamento', 'Agachamento livre', 'Pernas', 'Barra no trapézio, pés na largura dos ombros. Desça com o quadril para trás e joelhos na linha dos pés até pelo menos paralelo.'),
  ex('leg-press', 'Leg press 45°', 'Pernas', 'Pés no meio da plataforma. Desça até ~90° de joelho sem tirar o quadril do banco e empurre sem travar.'),
  ex('cadeira-extensora', 'Cadeira extensora', 'Pernas', 'Eixo da máquina alinhado ao joelho. Estenda até o fim, segure 1 s e desça devagar.'),
  ex('mesa-flexora', 'Mesa flexora', 'Pernas', 'Quadril colado no banco. Flexione os joelhos levando o rolo até o glúteo e controle a volta.'),
  ex('stiff', 'Stiff com barra', 'Pernas', 'Joelhos semiflexionados, leve o quadril para trás com a barra rente às pernas até alongar os posteriores.'),
  ex('afundo', 'Afundo com halteres', 'Pernas', 'Passo longo à frente, desça o joelho de trás em direção ao chão com o tronco ereto.'),
  ex('panturrilha-pe', 'Panturrilha em pé', 'Pernas', 'Amplitude total: desça o calcanhar até alongar e suba na ponta dos pés segurando 1 s.'),

  ex('desenvolvimento', 'Desenvolvimento com halteres', 'Ombros', 'Sentado, halteres na altura das orelhas. Empurre para cima sem bater um no outro e desça controlando.'),
  ex('elevacao-lateral', 'Elevação lateral', 'Ombros', 'Leve inclinação à frente, cotovelos levemente flexionados. Eleve até a altura dos ombros, sem impulso.'),
  ex('elevacao-frontal', 'Elevação frontal', 'Ombros', 'Eleve o halter à frente até a linha dos olhos com o braço quase estendido. Desça devagar.'),
  ex('crucifixo-inverso', 'Crucifixo inverso', 'Ombros', 'Tronco inclinado ou na máquina. Abra os braços para trás focando no deltoide posterior.'),
  ex('face-pull', 'Face pull na polia', 'Ombros', 'Corda na altura do rosto. Puxe abrindo as mãos ao lado das orelhas, cotovelos altos.'),

  ex('rosca-direta', 'Rosca direta com barra', 'Braços', 'Cotovelos fixos ao lado do corpo. Suba a barra sem balançar o tronco e desça em 2 s.'),
  ex('rosca-martelo', 'Rosca martelo', 'Braços', 'Pegada neutra (polegar para cima). Suba alternando ou junto, sem mover os cotovelos.'),
  ex('rosca-scott', 'Rosca Scott', 'Braços', 'Braço apoiado no banco Scott. Desça até quase estender e suba contraindo o bíceps.'),
  ex('triceps-corda', 'Tríceps na polia com corda', 'Braços', 'Cotovelos colados ao corpo. Estenda abrindo a corda no final e volte até 90°.'),
  ex('triceps-frances', 'Tríceps francês', 'Braços', 'Halter atrás da cabeça com cotovelos apontando para cima. Estenda sem abrir os cotovelos.'),
  ex('mergulho-banco', 'Mergulho no banco', 'Braços', 'Mãos no banco atrás do corpo. Desça até cotovelos a 90° e empurre.'),

  ex('prancha', 'Prancha isométrica', 'Core', 'Antebraços no chão, corpo alinhado da cabeça ao calcanhar. Contraia abdômen e glúteos. (reps = segundos)'),
  ex('abdominal-supra', 'Abdominal supra', 'Core', 'Deitado, joelhos flexionados. Eleve as escápulas do chão enrolando a coluna, sem puxar o pescoço.'),
  ex('elevacao-pernas', 'Elevação de pernas', 'Core', 'Deitado ou na barra. Eleve as pernas estendidas sem arquear a lombar e desça devagar.'),
  ex('abdominal-polia', 'Abdominal na polia', 'Core', 'Ajoelhado, corda atrás da cabeça. Flexione o tronco levando os cotovelos aos joelhos.'),
  ex('pallof', 'Pallof press', 'Core', 'De lado para a polia, empurre a manopla à frente resistindo à rotação do tronco.'),
];

const item = (exerciseId, sets, reps, load) => ({ exerciseId, sets, reps, load });
const single = (it, rest) => ({ id: uid('blk'), type: 'single', rest, items: [it] });
const triset = (items, rest, sets, label = '') => ({ id: uid('blk'), type: 'triset', label, rest, sets, items });

export function seedWorkouts() {
  const now = Date.now();
  return [
    {
      id: 'w_peito_triset',
      name: 'Treino A',
      focus: 'Peito e Tríceps',
      color: 'lime',
      createdAt: new Date(now - 24 * DAY).toISOString(),
      blocks: [
        single(item('supino-reto', 4, 10, 60), 90),
        single(item('supino-incl-halter', 3, 12, 22), 75),
        triset([item('crucifixo', 3, 12, 14), item('crossover', 3, 15, 20), item('flexao', 3, 15, 0)], 90, 3),
        triset([item('triceps-corda', 3, 12, 25), item('triceps-frances', 3, 12, 16), item('mergulho-banco', 3, 15, 0)], 75, 3),
      ],
    },
    {
      id: 'w_costas_antigo',
      name: 'Treino B',
      focus: 'Costas e Bíceps',
      color: 'volt',
      createdAt: new Date(now - 187 * DAY).toISOString(),
      blocks: [
        single(item('puxada-frente', 4, 10, 55), 90),
        single(item('remada-curvada', 4, 10, 50), 90),
        single(item('remada-baixa', 3, 12, 50), 75),
        single(item('rosca-direta', 3, 10, 30), 60),
        single(item('rosca-martelo', 3, 12, 14), 60),
        single(item('prancha', 3, 45, 0), 45),
      ],
    },
    {
      id: 'w_pernas_circuito',
      name: 'Treino C',
      focus: 'Pernas e Ombros (definição)',
      color: 'lime',
      createdAt: new Date(now - 10 * DAY).toISOString(),
      blocks: [
        triset([item('agachamento', 4, 12, 40), item('cadeira-extensora', 4, 15, 35), item('afundo', 4, 12, 10), item('panturrilha-pe', 4, 20, 30)], 90, 4, 'Quadríceps'),
        triset([item('stiff', 4, 12, 30), item('mesa-flexora', 4, 12, 30), item('leg-press', 4, 15, 120)], 90, 4, 'Posteriores'),
        triset([item('desenvolvimento', 3, 12, 12), item('elevacao-lateral', 3, 15, 7), item('crucifixo-inverso', 3, 15, 15)], 75, 3, 'Ombros'),
        triset([item('abdominal-supra', 3, 20, 0), item('elevacao-pernas', 3, 15, 0), item('prancha', 3, 40, 0)], 60, 3, 'Core'),
      ],
    },
  ];
}

/** Histórico de exemplo das últimas ~8 semanas com progressão de carga, para os gráficos terem o que mostrar. */
export function seedSessions(workouts) {
  const out = [];
  const now = Date.now();
  const plan = [];
  for (let w = 8; w >= 1; w--) {
    plan.push({ wk: workouts[0], daysAgo: w * 7 - 4, step: 8 - w });
    plan.push({ wk: workouts[1], daysAgo: w * 7 - 6, step: 8 - w });
  }
  for (const { wk, daysAgo, step } of plan) {
    const start = new Date(now - daysAgo * DAY); start.setHours(18, 30, 0, 0);
    const entries = [];
    for (const b of wk.blocks) for (const it of b.items) {
      const e = EXERCISES.find((x) => x.id === it.exerciseId);
      const sets = b.type === 'triset' ? b.sets : it.sets;
      const base = it.load ? Math.max(0, it.load - (7 - step) * (it.load >= 40 ? 1.25 : 0.5)) : 0;
      const load = Math.round(base * 2) / 2;
      entries.push({ exerciseId: it.exerciseId, name: e?.name ?? it.exerciseId, sets: Array.from({ length: sets }, (_, i) => ({ reps: Math.max(1, it.reps - (i === sets - 1 ? 1 : 0)), load, done: true })) });
    }
    const volume = entries.reduce((t, e) => t + e.sets.reduce((s, x) => s + x.reps * x.load, 0), 0);
    const durationSec = 52 * 60 + ((step * 137) % 900);
    out.push({ id: uid('ses'), workoutId: wk.id, workoutName: `${wk.name} · ${wk.focus}`, startedAt: start.toISOString(), endedAt: new Date(+start + durationSec * 1000).toISOString(), durationSec, volume, entries, sample: true });
  }
  return out.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
}

// Páginas de demonstração no Gymkee (apenas link externo; o conteúdo pertence ao Gymkee).
const GK = 'https://gymkee.com/pt/exercicios/';
export const REF_LINKS = {
  'supino-reto': 'peito/supino-reto-com-barra', 'supino-incl-halter': 'peito/supino-inclinado-com-halteres', crucifixo: 'peito/crucifixo-reto-com-halteres',
  crossover: 'peito/crucifixo-na-polia-media', flexao: 'peito/flexao-de-bracos', 'peck-deck': 'peito/crucifixo-vertical-na-maquina-gym80',
  'puxada-frente': 'dorsais/puxada-alta', 'remada-curvada': 'dorsais/remada-curvada-com-barra', 'remada-baixa': 'dorsais/remada-sentada-barra-em-v',
  'remada-unilateral': 'dorsais/remada-unilateral-halter', 'barra-fixa': 'dorsais/barra-fixa',
  agachamento: 'quadriceps/agachamento-com-barra', 'leg-press': 'quadriceps/leg-press', 'cadeira-extensora': 'quadriceps/extensao-de-pernas-sentado-maquina',
  'mesa-flexora': 'posteriores-coxa/flexao-de-pernas-deitado', stiff: 'posteriores-coxa/levantamento-terra-romeno', afundo: 'quadriceps/afundos-alternados-com-halteres',
  desenvolvimento: 'ombros/desenvolvimento-empurrado-com-halteres', 'elevacao-lateral': 'ombros/elevacao-lateral-com-halteres',
  'elevacao-frontal': 'ombros/elevacao-frontal-com-halteres-alternada', 'crucifixo-inverso': 'ombros/crucifixo-invertido-na-polia-media',
  'rosca-direta': 'biceps/rosca-direta-com-barra-barra-reta', 'rosca-martelo': 'biceps/rosca-martelo-halteres', 'rosca-scott': 'biceps/rosca-scott-barra-ez',
  'triceps-corda': 'triceps/triceps-na-polia-corda', 'triceps-frances': 'triceps/triceps-acima-da-cabeca-com-um-braco-haltere',
  'mergulho-banco': 'triceps/mergulho-de-triceps-no-banco', 'abdominal-supra': 'abdominais/crunch',
};
export const refLink = (id) => (REF_LINKS[id] ? `${GK}${REF_LINKS[id]}/` : null);

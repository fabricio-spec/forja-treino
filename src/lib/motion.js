// GIFs com o movimento completo: ExerciseDB V1, plano gratuito, por AscendAPI (https://oss.exercisedb.dev/docs).
// Termos do plano gratuito: uso pessoal/não comercial, crédito à AscendAPI obrigatório, só GIF 180p.
// Por isso o app guarda apenas o ID de cada exercício e carrega o GIF direto do CDN deles (não copiamos a mídia).
// Uso comercial (vender o app, assinatura etc.) exige o plano pago via RapidAPI.
const CDN = 'https://static.exercisedb.dev/media/';

// id do app → exerciseId da ExerciseDB (nome original em inglês ao lado, para conferência)
export const MOTION_IDS = {
  'supino-reto': 'EIeI8Vf',          // barbell bench press
  'supino-incl-halter': 'ns0SIbU',   // dumbbell incline bench press
  'crucifixo': 'yz9nUhF',            // dumbbell fly
  'crossover': 'Pr9Rhf4',            // cable standing fly
  'flexao': 'I4hDWkc',               // push-up
  'peck-deck': 'v3xmPAR',            // machine seated fly
  'puxada-frente': 'LEprlgG',        // cable lat pulldown full range of motion
  'remada-curvada': 'eZyBC3j',       // barbell bent over row
  'remada-baixa': 'fUBheHs',         // cable seated row
  'remada-unilateral': 'BJ0Hz5L',    // dumbbell bent over row
  'barra-fixa': 'lBDjFxJ',           // pull-up
  'pulldown-braco-reto': 'x69MAlq',  // cable straight arm pulldown
  'agachamento': 'qXTaZnJ',          // barbell full squat
  'leg-press': '10Z2DXU',            // sled 45° leg press
  'cadeira-extensora': 'my33uHU',    // machine leg extension
  'mesa-flexora': '17lJ1kr',         // machine lying leg curl
  'stiff': 'wQ2c4XD',                // barbell romanian deadlift
  'afundo': 'RRWFUcw',               // dumbbell lunge
  'panturrilha-pe': '8ozhUIZ',       // barbell standing calf raise
  'desenvolvimento': 'znQUdHY',      // dumbbell seated shoulder press
  'elevacao-lateral': 'DsgkuIt',     // dumbbell lateral raise
  'elevacao-frontal': '3eGE2JC',     // dumbbell front raise
  'crucifixo-inverso': 'EAs3xL9',    // dumbbell reverse fly
  'face-pull': 'ZfyAGhK',            // cable standing rear delt row (with rope)
  'rosca-direta': '25GPyDY',         // barbell curl
  'rosca-martelo': '2NpxjC1',        // dumbbell hammer curl
  'rosca-scott': 'jivWf8n',          // dumbbell preacher curl
  'triceps-corda': 'dU605di',        // cable pushdown (with rope attachment)
  'triceps-frances': 'PdmaD0N',      // dumbbell standing triceps extension
  'mergulho-banco': 'RrLske5',       // bench dip (knees bent)
  'prancha': 'VBAWRPG',              // weighted front plank
  'abdominal-supra': 'TFqbd8t',      // crunch floor
  'elevacao-pernas': 'WhuFnR7',      // lying leg raise flat bench
  'abdominal-polia': 'WW95auq',      // cable kneeling crunch
  'pallof': '9pa4H5m',               // band horizontal pallof press
};

export const edbId = (exerciseId) => MOTION_IDS[exerciseId] ?? (exerciseId?.startsWith?.('edb-') ? exerciseId.slice(4) : null);
export const motionGif = (exerciseId) => { const id = edbId(exerciseId); return id ? `${CDN}${id}.gif` : null; };

// Instruções (em inglês) buscadas na hora, só em memória: os termos não permitem guardar o conteúdo.
const memo = new Map();
export function fetchInstructions(exerciseId) {
  const id = edbId(exerciseId);
  if (!id) return Promise.resolve(null);
  if (!memo.has(id)) {
    memo.set(id, fetch(`https://oss.exercisedb.dev/api/v1/exercises/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((j) => ({ steps: (j.data?.instructions || []).map((s) => s.replace(/^Step:\s*\d+\s*/i, '')), target: j.data?.targetMuscles || [], secondary: j.data?.secondaryMuscles || [] }))
      .catch((e) => { memo.delete(id); throw e; }));
  }
  return memo.get(id);
}
export const MOTION_CREDIT = { text: 'Animação: ExerciseDB por AscendAPI', url: 'https://ascendapi.com' };

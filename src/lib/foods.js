// Tabela de alimentos: macros por 100 g (valores médios, base TACO/USDA arredondados).
// `unit` + `unitG`: alimentos que costumam ser medidos em unidades.
export const FOOD_GROUPS = ['Proteínas', 'Carboidratos', 'Gorduras', 'Frutas', 'Laticínios', 'Vegetais', 'Outros'];

export const FOODS = {
  frango: { name: 'Peito de frango grelhado', g: 'Proteínas', p: 31, c: 0, f: 3.6 },
  patinho: { name: 'Patinho moído', g: 'Proteínas', p: 26, c: 0, f: 7 },
  alcatra: { name: 'Alcatra grelhada', g: 'Proteínas', p: 29, c: 0, f: 9 },
  tilapia: { name: 'Tilápia grelhada', g: 'Proteínas', p: 26, c: 0, f: 2.7 },
  salmao: { name: 'Salmão grelhado', g: 'Proteínas', p: 25, c: 0, f: 12 },
  atum: { name: 'Atum em água (lata)', g: 'Proteínas', p: 26, c: 0, f: 1 },
  ovo: { name: 'Ovo inteiro', g: 'Proteínas', p: 12.6, c: 0.8, f: 10, unit: 'un', unitG: 50 },
  clara: { name: 'Clara de ovo', g: 'Proteínas', p: 11, c: 0.7, f: 0.2, unit: 'clara', unitG: 33 },
  whey: { name: 'Whey protein', g: 'Proteínas', p: 80, c: 10, f: 5, unit: 'scoop (30 g)', unitG: 30 },
  arroz: { name: 'Arroz branco cozido', g: 'Carboidratos', p: 2.5, c: 28, f: 0.2 },
  arrozint: { name: 'Arroz integral cozido', g: 'Carboidratos', p: 2.6, c: 25.8, f: 1 },
  batata: { name: 'Batata-doce cozida', g: 'Carboidratos', p: 1.4, c: 18.4, f: 0.1 },
  mandioca: { name: 'Mandioca cozida', g: 'Carboidratos', p: 0.6, c: 30, f: 0.3 },
  macarrao: { name: 'Macarrão cozido', g: 'Carboidratos', p: 5, c: 30, f: 1 },
  aveia: { name: 'Aveia em flocos', g: 'Carboidratos', p: 14, c: 56, f: 7 },
  pao: { name: 'Pão integral', g: 'Carboidratos', p: 9, c: 42, f: 3.5, unit: 'fatia(s) de 50 g', unitG: 50 },
  tapioca: { name: 'Goma de tapioca', g: 'Carboidratos', p: 0, c: 54, f: 0 },
  feijao: { name: 'Feijão cozido', g: 'Carboidratos', p: 4.8, c: 13.6, f: 0.5 },
  banana: { name: 'Banana', g: 'Frutas', p: 1.3, c: 23, f: 0.3, unit: 'un média', unitG: 120 },
  maca: { name: 'Maçã', g: 'Frutas', p: 0.3, c: 14, f: 0.2, unit: 'un média', unitG: 150 },
  mamao: { name: 'Mamão', g: 'Frutas', p: 0.5, c: 11, f: 0.1 },
  morango: { name: 'Morango', g: 'Frutas', p: 0.7, c: 7.7, f: 0.3 },
  iogurte: { name: 'Iogurte natural desnatado', g: 'Laticínios', p: 5.5, c: 7.5, f: 0.2 },
  leite: { name: 'Leite desnatado', g: 'Laticínios', p: 3.4, c: 5, f: 0.1 },
  cottage: { name: 'Queijo cottage', g: 'Laticínios', p: 11, c: 3.4, f: 4.3 },
  minas: { name: 'Queijo minas frescal', g: 'Laticínios', p: 17, c: 3, f: 20 },
  azeite: { name: 'Azeite de oliva', g: 'Gorduras', p: 0, c: 0, f: 100 },
  pasta: { name: 'Pasta de amendoim', g: 'Gorduras', p: 25, c: 20, f: 50 },
  castanha: { name: 'Castanhas mistas', g: 'Gorduras', p: 18, c: 20, f: 55 },
  abacate: { name: 'Abacate', g: 'Gorduras', p: 1.2, c: 6, f: 8.4 },
  brocolis: { name: 'Brócolis cozido', g: 'Vegetais', p: 2.4, c: 7, f: 0.4 },
  salada: { name: 'Salada verde (folhas)', g: 'Vegetais', p: 1.3, c: 3, f: 0.2 },
  legumes: { name: 'Legumes no vapor', g: 'Vegetais', p: 1.5, c: 7, f: 0.2 },
  chocolate70: { name: 'Chocolate 70%', g: 'Outros', p: 8, c: 46, f: 40 },
};

export const kcalOf = (p, c, f) => p * 4 + c * 4 + f * 9;

/** Macros de uma quantidade (g) de um alimento. */
export function macrosOf(food, grams) {
  if (!food) return { p: 0, c: 0, f: 0, kcal: 0 };
  const k = (Number(grams) || 0) / 100;
  const p = food.p * k, c = food.c * k, f = food.f * k;
  return { p, c, f, kcal: kcalOf(p, c, f) };
}

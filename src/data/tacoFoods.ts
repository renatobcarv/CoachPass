export type TacoFoodSeed = {
  name: string
  category: 'protein' | 'carb' | 'fat' | 'vegetable' | 'fruit' | 'dairy'
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
  sodium?: number
  unit: 'g' | 'ml'
  portionLabel: string
  source: 'taco' | 'tbca'
}

/** Valores de referência por 100 g/ml (TACO/TBCA típicos). Não é a tabela oficial completa. */
export const TACO_FOODS: TacoFoodSeed[] = [
  { name: 'Frango grelhado (peito)', category: 'protein', calories: 159, protein: 32.0, carbs: 0, fat: 2.5, fiber: 0, sodium: 63, unit: 'g', portionLabel: '100g', source: 'taco' },
  { name: 'Carne bovina magra grelhada', category: 'protein', calories: 219, protein: 32.4, carbs: 0, fat: 9.2, fiber: 0, sodium: 58, unit: 'g', portionLabel: '100g', source: 'taco' },
  { name: 'Salmão grelhado', category: 'protein', calories: 208, protein: 20.5, carbs: 0, fat: 13.4, fiber: 0, sodium: 59, unit: 'g', portionLabel: '100g', source: 'taco' },
  { name: 'Atum em água (escorrido)', category: 'protein', calories: 116, protein: 26.0, carbs: 0, fat: 1.0, fiber: 0, sodium: 320, unit: 'g', portionLabel: '100g', source: 'taco' },
  { name: 'Ovo de galinha cozido', category: 'protein', calories: 146, protein: 13.3, carbs: 0.6, fat: 9.5, fiber: 0, sodium: 146, unit: 'g', portionLabel: '100g', source: 'taco' },
  { name: 'Clara de ovo', category: 'protein', calories: 59, protein: 10.9, carbs: 1.8, fat: 0.1, fiber: 0, sodium: 166, unit: 'g', portionLabel: '100g', source: 'taco' },
  { name: 'Peito de peru', category: 'protein', calories: 135, protein: 29.0, carbs: 2.0, fat: 1.5, fiber: 0, sodium: 900, unit: 'g', portionLabel: '100g', source: 'tbca' },
  { name: 'Tilápia grelhada', category: 'protein', calories: 96, protein: 20.1, carbs: 0, fat: 1.7, fiber: 0, sodium: 52, unit: 'g', portionLabel: '100g', source: 'taco' },
  { name: 'Arroz branco cozido', category: 'carb', calories: 128, protein: 2.5, carbs: 28.1, fat: 0.2, fiber: 0.8, sodium: 1, unit: 'g', portionLabel: '100g', source: 'taco' },
  { name: 'Arroz integral cozido', category: 'carb', calories: 124, protein: 2.6, carbs: 25.8, fat: 1.0, fiber: 2.7, sodium: 2, unit: 'g', portionLabel: '100g', source: 'taco' },
  { name: 'Batata-doce cozida', category: 'carb', calories: 77, protein: 1.3, carbs: 18.4, fat: 0.1, fiber: 2.2, sodium: 8, unit: 'g', portionLabel: '100g', source: 'taco' },
  { name: 'Aveia em flocos', category: 'carb', calories: 394, protein: 13.9, carbs: 66.6, fat: 8.5, fiber: 9.1, sodium: 5, unit: 'g', portionLabel: '100g', source: 'taco' },
  { name: 'Feijão carioca cozido', category: 'carb', calories: 76, protein: 4.8, carbs: 13.6, fat: 0.5, fiber: 8.5, sodium: 2, unit: 'g', portionLabel: '100g', source: 'taco' },
  { name: 'Macarrão cozido', category: 'carb', calories: 102, protein: 3.4, carbs: 21.0, fat: 0.5, fiber: 1.0, sodium: 1, unit: 'g', portionLabel: '100g', source: 'taco' },
  { name: 'Tapioca (goma hidratada)', category: 'carb', calories: 130, protein: 0.2, carbs: 32.0, fat: 0, fiber: 0, sodium: 2, unit: 'g', portionLabel: '100g', source: 'tbca' },
  { name: 'Pão francês', category: 'carb', calories: 300, protein: 8.0, carbs: 58.6, fat: 3.1, fiber: 2.3, sodium: 648, unit: 'g', portionLabel: '100g', source: 'taco' },
  { name: 'Azeite de oliva', category: 'fat', calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, sodium: 0, unit: 'ml', portionLabel: '100ml', source: 'taco' },
  { name: 'Abacate', category: 'fat', calories: 96, protein: 1.2, carbs: 6.0, fat: 8.4, fiber: 6.3, sodium: 1, unit: 'g', portionLabel: '100g', source: 'taco' },
  { name: 'Castanha-do-pará', category: 'fat', calories: 643, protein: 14.5, carbs: 15.1, fat: 63.5, fiber: 7.9, sodium: 3, unit: 'g', portionLabel: '100g', source: 'taco' },
  { name: 'Amendoim torrado', category: 'fat', calories: 605, protein: 22.5, carbs: 18.7, fat: 49.4, fiber: 7.8, sodium: 5, unit: 'g', portionLabel: '100g', source: 'taco' },
  { name: 'Brócolis cozido', category: 'vegetable', calories: 25, protein: 2.1, carbs: 4.4, fat: 0.5, fiber: 3.4, sodium: 4, unit: 'g', portionLabel: '100g', source: 'taco' },
  { name: 'Alface crespa', category: 'vegetable', calories: 11, protein: 1.3, carbs: 1.7, fat: 0.2, fiber: 1.8, sodium: 7, unit: 'g', portionLabel: '100g', source: 'taco' },
  { name: 'Cenoura crua', category: 'vegetable', calories: 34, protein: 1.3, carbs: 7.7, fat: 0.2, fiber: 3.2, sodium: 7, unit: 'g', portionLabel: '100g', source: 'taco' },
  { name: 'Tomate', category: 'vegetable', calories: 15, protein: 1.1, carbs: 3.1, fat: 0.2, fiber: 1.2, sodium: 1, unit: 'g', portionLabel: '100g', source: 'taco' },
  { name: 'Banana-prata', category: 'fruit', calories: 98, protein: 1.3, carbs: 26.0, fat: 0.1, fiber: 2.0, sodium: 0, unit: 'g', portionLabel: '100g', source: 'taco' },
  { name: 'Maçã com casca', category: 'fruit', calories: 63, protein: 0.2, carbs: 16.6, fat: 0.2, fiber: 2.0, sodium: 1, unit: 'g', portionLabel: '100g', source: 'taco' },
  { name: 'Mamão papaia', category: 'fruit', calories: 40, protein: 0.5, carbs: 10.4, fat: 0.1, fiber: 1.0, sodium: 4, unit: 'g', portionLabel: '100g', source: 'taco' },
  { name: 'Morango', category: 'fruit', calories: 30, protein: 0.9, carbs: 6.8, fat: 0.3, fiber: 1.7, sodium: 1, unit: 'g', portionLabel: '100g', source: 'taco' },
  { name: 'Iogurte natural integral', category: 'dairy', calories: 51, protein: 4.1, carbs: 1.9, fat: 3.0, fiber: 0, sodium: 52, unit: 'g', portionLabel: '100g', source: 'taco' },
  { name: 'Queijo minas frescal', category: 'dairy', calories: 264, protein: 17.4, carbs: 3.2, fat: 20.2, fiber: 0, sodium: 31, unit: 'g', portionLabel: '100g', source: 'taco' },
  { name: 'Leite integral', category: 'dairy', calories: 57, protein: 2.9, carbs: 4.5, fat: 3.1, fiber: 0, sodium: 53, unit: 'ml', portionLabel: '100ml', source: 'taco' },
]

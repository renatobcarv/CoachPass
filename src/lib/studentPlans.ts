/**
 * Plano do aluno (Aluno Pro): criar os próprios treinos, dietas e periodização.
 * Preços mantidos da página de planos do aluno. Cada ciclo é um produto no AbacatePay.
 */

export type StudentCycle = 'monthly' | 'semester' | 'annual'

export type StudentPlan = {
  cycle: StudentCycle
  label: string
  /** Valor cobrado por ciclo (R$) */
  price: number
  months: number
}

export const STUDENT_PLANS: Record<StudentCycle, StudentPlan> = {
  monthly: { cycle: 'monthly', label: 'Mensal', price: 29.9, months: 1 },
  semester: { cycle: 'semester', label: 'Semestral', price: 149.9, months: 6 },
  annual: { cycle: 'annual', label: 'Anual', price: 249.9, months: 12 },
}

export const STUDENT_CYCLES: StudentCycle[] = ['monthly', 'semester', 'annual']

export const STUDENT_PRO_PERKS = [
  'Crie seus próprios treinos com a biblioteca de exercícios',
  'Monte sua própria dieta com a tabela TACO',
  'Periodização própria com metas semanais e acompanhamento',
  '20 gerações de IA por mês (grátis: 2)',
]

export const STUDENT_FREE_AI = 2
export const STUDENT_PRO_AI = 20

/** Preço mensal equivalente (para comparar ciclos). */
export const monthlyEquivalent = (cycle: StudentCycle) => STUDENT_PLANS[cycle].price / STUDENT_PLANS[cycle].months

export function isStudentCycle(v: unknown): v is StudentCycle {
  return v === 'monthly' || v === 'semester' || v === 'annual'
}

/**
 * Sugestão da próxima carga por exercício. Sempre SUGESTÃO: nada muda no plano sem confirmação.
 *
 * - Acessórios/hipertrofia: progressão dupla (sobe repetições dentro da faixa; com todas as séries
 *   no topo da faixa E esforço dentro do alvo, sobe a carga).
 * - Levantamentos principais: progressão por desempenho (RIR real × alvo e tendência do 1RM estimado).
 * - Nunca sobe carga só porque as repetições saíram: exige RIR/RPE registrado, esforço dentro do alvo
 *   e recuperação sem sinais de alerta.
 */
import { e1rm, round1 } from '../periodization/calc'
import { effectiveRir, isWorkingSet, parseRepRange, poorRecovery, type ExerciseSession, type RecoveryInput } from './analytics'

export type ProgressionAction = 'increase' | 'maintain' | 'decrease' | 'add_reps' | 'insufficient_data'

export type ProgressionSuggestion = {
  action: ProgressionAction
  suggestedLoadKg: number | null
  suggestedReps: string | null
  reasons: string[]
  stagnation: boolean
  method: 'double_progression' | 'performance'
}

export type ProgressionTarget = {
  repRange?: string | null
  sets?: number | null
  targetRir?: number | null
  loadKg?: number | null
  isMainLift?: boolean
}

/** Incremento conservador: até 20 kg sobe 1 kg; até 60 kg, 2,5 kg; acima, ~2,5% arredondado a 2,5 kg. */
export function loadIncrement(load: number): number {
  if (load < 20) return 1
  if (load < 60) return 2.5
  return Math.max(2.5, Math.round((load * 0.025) / 2.5) * 2.5)
}

const roundTo = (n: number, step = 0.5) => Math.round(n / step) * step

export function suggestProgression(
  history: ExerciseSession[],
  target: ProgressionTarget,
  latestCheckin?: RecoveryInput | null,
): ProgressionSuggestion {
  const method = target.isMainLift ? 'performance' : 'double_progression'
  const last = history[history.length - 1]
  const range = parseRepRange(target.repRange)
  const targetRir = target.targetRir ?? 2

  if (!last) {
    return {
      action: 'insufficient_data',
      suggestedLoadKg: target.loadKg ?? null,
      suggestedReps: target.repRange ?? null,
      reasons: ['Ainda não há registro deste exercício. Comece pela carga planejada e registre o RIR de cada série.'],
      stagnation: false,
      method,
    }
  }

  // Carga de trabalho = a mais usada nas séries válidas da última sessão
  const working = last.sets.filter(isWorkingSet)
  const loads = working.map((s) => s.loadKg ?? 0).filter((x) => x > 0)
  const workLoad = loads.length ? mode(loads) : (target.loadKg ?? null)
  const atLoad = working.filter((s) => (s.loadKg ?? 0) === workLoad)
  const rirs = working.map(effectiveRir).filter((x): x is number => x != null)
  const avgRir = rirs.length ? rirs.reduce((a, b) => a + b, 0) / rirs.length : null
  const recovery = poorRecovery(latestCheckin ?? null)
  const reasons: string[] = []

  // Estagnação: melhor 1RM estimado das 3 últimas sessões sem melhorar mais de 1% sobre as 3 anteriores
  const ests = history.map((s) => s.bestE1rm).filter((x): x is number => x != null)
  let stagnation = false
  if (ests.length >= 6) {
    const recent = Math.max(...ests.slice(-3))
    const before = Math.max(...ests.slice(-6, -3))
    stagnation = recent <= before * 1.01
  }

  const finish = (action: ProgressionAction, load: number | null, reps: string | null): ProgressionSuggestion => {
    if (stagnation) reasons.push('Sem melhora do 1RM estimado nas últimas 3 sessões: avalie trocar a faixa de repetições, a variação do exercício ou um deload.')
    return { action, suggestedLoadKg: load != null ? round1(load) : null, suggestedReps: reps, reasons, stagnation, method }
  }

  if (workLoad == null) {
    reasons.push('Registre a carga das séries para receber sugestões de progressão.')
    return finish('insufficient_data', null, target.repRange ?? null)
  }

  const wantsIncrease = (why: string) => {
    if (avgRir == null) {
      reasons.push(`${why}, mas sem RIR/RPE registrado não dá para saber se sobrou margem. Mantenha e registre o esforço.`)
      return finish('maintain', workLoad, target.repRange ?? null)
    }
    if (recovery.length) {
      reasons.push(`${why}, mas o último check-in indica ${recovery.join(', ')}. Mantenha a carga nesta sessão.`)
      return finish('maintain', workLoad, target.repRange ?? null)
    }
    const inc = loadIncrement(workLoad)
    reasons.push(`${why}. Suba ${inc} kg mantendo a técnica.`)
    return finish('increase', workLoad + inc, range.min != null ? `${range.min}-${range.max ?? range.min}` : (target.repRange ?? null))
  }

  // ----- Levantamentos principais: desempenho -----
  if (target.isMainLift) {
    const plannedMin = range.min ?? null
    const repsShort = plannedMin != null && atLoad.some((s) => (s.reps ?? 0) < plannedMin)
    if (avgRir != null && avgRir <= targetRir - 2) {
      reasons.push(`Esforço acima do planejado (RIR médio ${round1(avgRir)} para alvo ${targetRir}).`)
      if (repsShort) {
        const down = roundTo(workLoad * 0.95, 2.5)
        reasons.push('Repetições abaixo do alvo: reduza ~5% para voltar à faixa planejada.')
        return finish('decrease', down, target.repRange ?? null)
      }
      reasons.push('Repita a carga até o esforço voltar ao alvo.')
      return finish('maintain', workLoad, target.repRange ?? null)
    }
    if (repsShort) {
      reasons.push('Repetições abaixo do planejado na carga de trabalho. Mantenha a carga e busque completar as repetições.')
      return finish('maintain', workLoad, target.repRange ?? null)
    }
    if (avgRir != null && avgRir >= targetRir + 1) {
      return wantsIncrease(`Repetições completas com margem (RIR médio ${round1(avgRir)} para alvo ${targetRir})`)
    }
    if (avgRir == null) return wantsIncrease('Repetições completas')
    reasons.push(`Esforço dentro do alvo (RIR médio ${round1(avgRir)}). Mantenha e consolide antes de subir.`)
    return finish('maintain', workLoad, target.repRange ?? null)
  }

  // ----- Acessórios: progressão dupla -----
  if (range.min == null) {
    reasons.push('Sem faixa de repetições planejada: defina, por exemplo, 8-12 para usar a progressão dupla.')
    return finish('maintain', workLoad, null)
  }
  const top = range.max ?? range.min
  const plannedSets = target.sets ?? atLoad.length
  const allTop = atLoad.length >= plannedSets && atLoad.every((s) => (s.reps ?? 0) >= top)
  const belowMin = atLoad.filter((s) => (s.reps ?? 0) < range.min!).length

  if (allTop) {
    if (avgRir != null && avgRir < targetRir - 1) {
      reasons.push(`Chegou ao topo da faixa (${top} reps), mas muito perto da falha (RIR médio ${round1(avgRir)}). Repita a carga para consolidar.`)
      return finish('maintain', workLoad, `${range.min}-${top}`)
    }
    return wantsIncrease(`Todas as séries chegaram a ${top} repetições`)
  }
  if (belowMin >= Math.ceil(atLoad.length / 2) && atLoad.length > 0) {
    const prevSame = history.length >= 2 && history[history.length - 2].topLoad === workLoad
    if (prevSame) {
      const down = roundTo(workLoad * 0.92, workLoad < 20 ? 0.5 : 2.5)
      reasons.push(`Duas sessões seguidas abaixo de ${range.min} repetições com ${workLoad} kg: reduza para ~${down} kg.`)
      return finish('decrease', down, `${range.min}-${top}`)
    }
    reasons.push(`Abaixo de ${range.min} repetições na maioria das séries. Mantenha a carga mais uma sessão.`)
    return finish('maintain', workLoad, `${range.min}-${top}`)
  }
  reasons.push(`Dentro da faixa: mantenha ${workLoad} kg e tente +1 repetição por série até ${top}.`)
  return finish('add_reps', workLoad, `${range.min}-${top}`)
}

function mode(xs: number[]): number {
  const m = new Map<number, number>()
  for (const x of xs) m.set(x, (m.get(x) ?? 0) + 1)
  return [...m.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0])[0][0]
}

/** 1RM estimado de uma série (rótulo deixa claro que é estimativa). */
export const estimate = (loadKg: number, reps: number, rir = 0) => e1rm(loadKg, reps, rir)

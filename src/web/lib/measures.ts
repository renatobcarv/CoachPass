export type MeasureResult = { ok: true; value: number } | { ok: false; error: string }

function toNumber(raw: string): number | null {
  const text = raw.trim().replace(',', '.')
  if (!text) return null
  const value = Number(text)
  return Number.isFinite(value) ? value : null
}

/** Aceita centímetros (175) ou metros (1,75 / 1.75) e devolve centímetros. */
export function parseHeightCm(raw: string): MeasureResult {
  const value = toNumber(raw)
  if (value == null) return { ok: false, error: 'Informe a altura em centímetros ou metros (ex.: 175 ou 1,75).' }
  const cm = value >= 1 && value <= 2.5 ? Math.round(value * 100) : value
  if (cm < 50 || cm > 250) {
    return { ok: false, error: 'Altura deve ficar entre 50 cm e 250 cm (ex.: 175 ou 1,75).' }
  }
  return { ok: true, value: cm }
}

/** Aceita quilos com vírgula ou ponto (75,5 / 75.5). */
export function parseWeightKg(raw: string): MeasureResult {
  const value = toNumber(raw)
  if (value == null) return { ok: false, error: 'Informe o peso em quilos (ex.: 75,5).' }
  if (value < 20 || value > 400) {
    return { ok: false, error: 'Peso deve ficar entre 20 kg e 400 kg.' }
  }
  return { ok: true, value }
}

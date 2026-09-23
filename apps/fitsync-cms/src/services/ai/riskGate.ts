type ProfileRiskInput = {
  medicalConditions?: string | null
  injuries?: string | null
  medications?: string | null
  heightCm?: number | null
  weightKg?: number | null
  goal?: string | null
  birthDate?: string | null
}

const HIGH_RISK =
  /\b(cirurgia recente|fratura|hérnia de disco|hernia de disco|infarto|avc|câncer|cancer|quimioterapia|gestante|grávida|gravida|epilepsia|desmaio|dor no peito|falência|falencia|insuficiência cardíaca|insuficiencia cardiaca)\b/i

export function assessGenerationRisk(profile: ProfileRiskInput | null): {
  blocked: boolean
  reason?: string
} {
  if (!profile) {
    return {
      blocked: true,
      reason: 'Complete seu perfil antes de gerar treinos com IA.',
    }
  }
  if (!profile.goal || !profile.heightCm || !profile.weightKg || !profile.birthDate) {
    return {
      blocked: true,
      reason: 'Informações obrigatórias do perfil estão incompletas.',
    }
  }

  const blob = [profile.medicalConditions, profile.injuries, profile.medications]
    .filter(Boolean)
    .join(' ')

  if (blob && HIGH_RISK.test(blob)) {
    return {
      blocked: true,
      reason:
        'Identificamos condições que exigem avaliação profissional. Procure um personal ou médico antes de gerar treinos automaticamente.',
    }
  }

  return { blocked: false }
}

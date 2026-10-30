import { NextResponse } from 'next/server'

import { AbacatePayError, createPortalLink } from '@/lib/abacatePay'
import { authError, authProfessional } from '@/lib/proBilling'

export const dynamic = 'force-dynamic'

/** Link do portal do AbacatePay: cancelar, trocar cartão e ver pagamentos. */
export async function POST() {
  const { user, status } = await authProfessional()
  if (!user) return authError(status as 401 | 403)
  if (!user.abacateCustomerId || !user.abacateCheckoutId) {
    return NextResponse.json({ error: 'Você ainda não tem assinatura paga.', code: 'NO_SUBSCRIPTION' }, { status: 404 })
  }
  try {
    const url = await createPortalLink(user.abacateCustomerId, user.abacateCheckoutId)
    return NextResponse.json({ url })
  } catch (err) {
    const message = err instanceof AbacatePayError ? err.message : 'Não foi possível abrir o portal agora.'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}

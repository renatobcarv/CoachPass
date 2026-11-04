import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { toast } from 'sonner'

import { syncBilling } from './proPlanApi'

/**
 * Volta do checkout do AbacatePay (?assinatura=retorno): confere o pagamento algumas vezes
 * até a assinatura aparecer e limpa o parâmetro da URL.
 * Devolve 'checking' enquanto confere, 'active' quando confirmou e 'pending' quando ainda não chegou.
 */
export function useCheckoutReturn(token: string | undefined, onActive?: () => void) {
  const [params, setParams] = useSearchParams()
  const returning = params.get('assinatura') === 'retorno'
  const [state, setState] = useState<'idle' | 'checking' | 'active' | 'pending'>(returning ? 'checking' : 'idle')

  useEffect(() => {
    if (!returning || !token) return
    let alive = true
    setState('checking')
    void (async () => {
      let active = false
      for (let i = 0; i < 8 && alive && !active; i++) {
        try {
          const s = await syncBilling(token)
          active = s.subscriptionStatus === 'active'
        } catch {
          /* tenta de novo */
        }
        if (!active) await new Promise((r) => setTimeout(r, 2500))
      }
      if (!alive) return
      setState(active ? 'active' : 'pending')
      if (active) {
        toast.success('Pagamento confirmado. Assinatura ativa.')
        onActive?.()
      } else {
        toast.info('O pagamento ainda está sendo processado. Ele aparece em Configurações › Plano e cobrança assim que confirmar.')
      }
      const clean = new URLSearchParams(params)
      clean.delete('assinatura')
      setParams(clean, { replace: true })
    })()
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [returning, token])

  return state
}

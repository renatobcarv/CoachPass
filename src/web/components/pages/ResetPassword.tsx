import React, { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

import { USERS_API, PayloadApiError, extractPayloadMessage, postJson } from '@/lib/cms'
import { AuthShell, FieldLabel } from '../brand/AuthShell'
import { CTAButton } from '../brand/Brand'
import { PasswordInput, PasswordStrength } from '../forms/PasswordInput'
import { isStrongEnough } from '../../lib/validation'

/** Página do link "Definir nova senha" enviado por e-mail. */
export function ResetPassword() {
  const { token = '' } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!isStrongEnough(password)) return setError('A senha precisa de 8+ caracteres, com pelo menos uma letra e um número.')
    if (password !== confirm) return setError('As senhas não coincidem.')
    setLoading(true)
    try {
      const res = await postJson<{ user?: { email?: string } }>(`${USERS_API}/reset-password`, { token, password })
      toast.success('Senha alterada. Entre com a nova senha.')
      navigate('/login', { replace: true, state: { email: res.user?.email } })
    } catch (err) {
      const raw = err instanceof PayloadApiError ? extractPayloadMessage(err.data) : ''
      setError(
        /token|invalid|expired|inválid|expirad/i.test(raw) || !raw
          ? 'Este link expirou ou já foi usado. Peça um novo em "Esqueci a senha".'
          : raw,
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Crie uma" accent="senha nova." lead="Use pelo menos 8 caracteres, com letras e números. Depois é só entrar com ela.">
      <form onSubmit={submit} className="w-full max-w-[480px]">
        <p className="cp-kicker">Recuperar acesso</p>
        <h2 className="cp-display mt-3 text-[40px] font-bold leading-none">Nova senha</h2>

        {error && (
          <div role="alert" className="mt-6 flex gap-3 rounded-2xl border border-[rgba(255,93,108,0.3)] bg-[rgba(255,93,108,0.08)] p-4 text-[14px] text-[#ff8a95]">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-8 space-y-5">
          <div>
            <FieldLabel htmlFor="reset-password">Nova senha</FieldLabel>
            <PasswordInput id="reset-password" value={password} onChange={setPassword} placeholder="8+ caracteres, com letra e número" autoComplete="new-password" invalid={Boolean(error)} />
            <PasswordStrength value={password} />
          </div>
          <div>
            <FieldLabel htmlFor="reset-confirm">Repita a senha</FieldLabel>
            <PasswordInput id="reset-confirm" value={confirm} onChange={setConfirm} placeholder="Digite de novo" autoComplete="new-password" invalid={Boolean(confirm) && confirm !== password} />
          </div>
        </div>

        <div className="mt-8">
          <CTAButton type="submit" block disabled={loading || !token}>
            {loading ? 'Salvando…' : 'Salvar nova senha'}
          </CTAButton>
        </div>
        <p className="mt-6 text-center text-[14px] text-[var(--muted)]">
          Lembrou?{' '}
          <Link to="/login" className="font-semibold text-white hover:underline">
            Entrar
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}

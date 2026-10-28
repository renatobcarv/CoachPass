import React, { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ArrowLeft, ChevronRight, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth, type UserRole } from '../../context/AuthContext'
import { getPasswordErrors } from '@/lib/passwordPolicy'
import { PasswordInput, PasswordRequirements } from '../PasswordField'
import { PayloadApiError, extractPayloadMessage } from '@/lib/cms'

function pathForRole(role: UserRole) {
  if (role === 'student') return '/app'
  if (role === 'personal') return '/personal'
  if (role === 'nutritionist') return '/nutritionist'
  return '/selecionar-painel'
}

const inputCls =
  'w-full pl-10 pr-4 py-3 rounded-lg bg-[#f3f4f9] border border-[#000326]/10 text-[#000326] placeholder:text-[#8e8e9a] focus:outline-none focus:ring-1 focus:ring-[#000346] dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-[#C5C5CE]'

export function ResetPassword() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { resetPassword } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [attempted, setAttempted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAttempted(true)
    setError(null)

    if (!token) {
      setError('Link inválido. Solicite uma nova recuperação de senha.')
      return
    }

    const policyErrors = getPasswordErrors(password)
    if (policyErrors.length > 0) {
      setError(policyErrors[0])
      return
    }
    if (password !== confirm) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)
    try {
      const role = await resetPassword(token, password)
      toast.success('Senha redefinida. Você já está autenticado.')
      navigate(pathForRole(role), { replace: true })
    } catch (err) {
      const msg =
        err instanceof PayloadApiError
          ? extractPayloadMessage(err.data) || err.message
          : err instanceof Error
            ? err.message
            : 'Não foi possível redefinir a senha.'
      setError(msg || 'Link expirado ou inválido. Solicite uma nova recuperação.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f3f4f9] dark:bg-[#000326]">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#6a6a7a] hover:text-[#000326] dark:text-[#C5C5CE] dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao login
          </Link>
        </div>
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#000326] to-[#000346] dark:from-white dark:to-[#C5C5CE]">
              <Zap className="w-5 h-5 text-white dark:text-[#000326]" fill="currentColor" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#000326] dark:text-white">
              CoachPass
            </span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-[#000326] dark:text-white">Nova senha</h1>
          <p className="mt-2 text-sm text-[#6a6a7a] dark:text-[#C5C5CE]">
            Defina uma senha forte para voltar à sua conta.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-6 border border-[#000326]/10 space-y-4 dark:bg-[#000137] dark:border-white/10"
        >
          {error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-300">
              {error}
            </p>
          )}
          <div>
            <label htmlFor="reset-password" className="block text-sm text-[#000326] mb-2 dark:text-[#C5C5CE]">
              Nova senha
            </label>
            <PasswordInput
              id="reset-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nova senha"
              autoComplete="new-password"
              iconClassName="text-[#8e8e9a]"
              className={inputCls}
              required
            />
            <PasswordRequirements password={password} showErrors={attempted} />
          </div>
          <div>
            <label htmlFor="reset-confirm" className="block text-sm text-[#000326] mb-2 dark:text-[#C5C5CE]">
              Confirmar senha
            </label>
            <PasswordInput
              id="reset-confirm"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repita a senha"
              autoComplete="new-password"
              iconClassName="text-[#8e8e9a]"
              className={inputCls}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || !password || !confirm}
            className="w-full py-3 rounded-xl text-white bg-[#000326] hover:bg-[#000137] disabled:opacity-50 flex items-center justify-center gap-2 dark:bg-white dark:text-[#000326]"
          >
            {loading ? 'Salvando…' : 'Redefinir senha'}
            {!loading && <ChevronRight className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  )
}

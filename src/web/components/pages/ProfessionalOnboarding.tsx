import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { motion } from 'motion/react'
import { Briefcase, CreditCard, Phone, CheckCircle, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth, UserRole } from '../../context/AuthContext'
import { USERS_API, patchJson, postJson, PayloadApiError, extractPayloadMessage } from '@/lib/cms'

type ProfessionalType = 'personal' | 'nutritionist'

export function ProfessionalOnboarding() {
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState({
    professionalType: '' as ProfessionalType | '',
    credential: '',
    phone: '',
  })

  const handleComplete = async () => {
    if (!user?.accessToken || !user.id) {
      toast.error('Sessão expirada. Faça login novamente.')
      navigate('/login', { replace: true })
      return
    }
    if (!data.professionalType || !data.credential.trim()) return

    setLoading(true)
    try {
      const role: UserRole = data.professionalType
      const updated = await patchJson<{
        id: string | number
        role?: string
        professionalId?: string
        whatsapp?: string
        name?: string
        email?: string
      }>(
        `${USERS_API}/${user.id}`,
        {
          role,
          professionalId: data.credential.trim(),
          whatsapp: data.phone.trim() || undefined,
        },
        user.accessToken,
      )

      // Tenta renovar o JWT para o papel novo entrar no token.
      let token = user.accessToken
      try {
        const refreshed = await postJson<{ token?: string; user?: { role?: string } }>(
          `${USERS_API}/refresh-token`,
          {},
          user.accessToken,
        )
        if (refreshed.token) token = refreshed.token
      } catch {
        /* refresh opcional — o estado local já cobre a navegação */
      }

      updateUser({
        role: (updated.role as UserRole) || role,
        professionalId: updated.professionalId || data.credential.trim(),
        whatsapp: updated.whatsapp || data.phone.trim() || user.whatsapp,
        accessToken: token,
      })

      toast.success('Validação profissional concluída.')
      navigate(role === 'nutritionist' ? '/nutritionist' : '/personal', { replace: true })
    } catch (err) {
      const msg =
        err instanceof PayloadApiError
          ? extractPayloadMessage(err.data) || err.message
          : err instanceof Error
            ? err.message
            : 'Não foi possível salvar suas credenciais.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 dark:bg-zinc-950 bg-slate-50">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <h1
            className="dark:text-white text-slate-900 mb-3 tracking-tight"
            style={{ fontSize: '2rem', fontWeight: 600 }}
          >
            Licença de atuação
          </h1>
          <p className="text-sm dark:text-zinc-400 text-slate-500 font-light max-w-md mx-auto">
            Escolha sua área e informe o registro do conselho. Isso define para qual painel você será
            levado.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="dark:bg-[#000137] bg-white rounded-2xl p-8 border dark:border-zinc-800 border-slate-200 shadow-xl"
        >
          <div className="space-y-8">
            <div>
              <label className="block text-xs dark:text-zinc-400 text-slate-600 mb-3 uppercase tracking-wider font-semibold">
                Área de Atuação
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setData({ ...data, professionalType: 'personal' })}
                  className={`p-6 rounded-xl border text-left transition-all relative ${
                    data.professionalType === 'personal'
                      ? 'dark:bg-blue-500/10 bg-blue-50 border-blue-500/50'
                      : 'dark:bg-zinc-900/50 bg-slate-50/50 dark:border-zinc-800 border-slate-200'
                  }`}
                >
                  <Briefcase
                    className={`w-6 h-6 mb-3 ${
                      data.professionalType === 'personal'
                        ? 'text-blue-500'
                        : 'dark:text-zinc-500 text-slate-400'
                    }`}
                  />
                  <h3
                    className={`font-medium ${
                      data.professionalType === 'personal'
                        ? 'dark:text-white text-slate-900'
                        : 'dark:text-zinc-300 text-slate-700'
                    }`}
                  >
                    Personal Trainer
                  </h3>
                  {data.professionalType === 'personal' && (
                    <div className="absolute top-4 right-4 text-blue-500">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setData({ ...data, professionalType: 'nutritionist' })}
                  className={`p-6 rounded-xl border text-left transition-all relative ${
                    data.professionalType === 'nutritionist'
                      ? 'dark:bg-amber-500/10 bg-amber-50 border-amber-500/50'
                      : 'dark:bg-zinc-900/50 bg-slate-50/50 dark:border-zinc-800 border-slate-200'
                  }`}
                >
                  <Briefcase
                    className={`w-6 h-6 mb-3 ${
                      data.professionalType === 'nutritionist'
                        ? 'text-amber-500'
                        : 'dark:text-zinc-500 text-slate-400'
                    }`}
                  />
                  <h3
                    className={`font-medium ${
                      data.professionalType === 'nutritionist'
                        ? 'dark:text-white text-slate-900'
                        : 'dark:text-zinc-300 text-slate-700'
                    }`}
                  >
                    Nutricionista Clínica/Esportiva
                  </h3>
                  {data.professionalType === 'nutritionist' && (
                    <div className="absolute top-4 right-4 text-amber-500">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                  )}
                </button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs dark:text-zinc-400 text-slate-600 mb-2 uppercase tracking-wider font-semibold">
                  {data.professionalType === 'nutritionist' ? 'Registro CRN' : 'Registro CREF'}
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-600 text-slate-400" />
                  <input
                    type="text"
                    value={data.credential}
                    onChange={(e) => setData({ ...data, credential: e.target.value })}
                    placeholder="Número de registro"
                    className="w-full pl-10 pr-4 py-3 rounded-lg dark:bg-zinc-900/50 bg-slate-50/50 border dark:border-zinc-800 border-slate-200 dark:text-white text-slate-900 focus:border-blue-500 font-light"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs dark:text-zinc-400 text-slate-600 mb-2 uppercase tracking-wider font-semibold">
                  Contato de Suporte (WhatsApp)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-600 text-slate-400" />
                  <input
                    type="text"
                    value={data.phone}
                    onChange={(e) => setData({ ...data, phone: e.target.value })}
                    placeholder="(00) 00000-0000"
                    className="w-full pl-10 pr-4 py-3 rounded-lg dark:bg-zinc-900/50 bg-slate-50/50 border dark:border-zinc-800 border-slate-200 dark:text-white text-slate-900 focus:border-blue-500 font-light"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t dark:border-zinc-800/80 border-slate-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs dark:text-zinc-500 text-slate-400">
                <Shield className="w-4 h-4" />
                <span>Seus dados de registro ficam vinculados à conta.</span>
              </div>
              <button
                type="button"
                onClick={handleComplete}
                disabled={!data.professionalType || !data.credential.trim() || loading}
                className="py-3 px-8 bg-blue-600 rounded-lg text-white font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Continuar para o painel</>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

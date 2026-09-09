import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Briefcase, CreditCard, Phone, CheckCircle, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';

export function ProfessionalOnboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [data, setData] = useState({
    professionalType: '',
    credential: '',
    phone: '',
  });

  const handleComplete = async () => {
    setLoading(true);
    // Simular o tempo de salvamento no banco de dados e atualização do AuthContext (papel)
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    toast.success('Validação profissional concluída com sucesso.');
    navigate(user?.role === 'nutritionist' ? '/nutritionist' : '/personal');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 dark:bg-zinc-950 bg-slate-50">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <h1 className="dark:text-white text-slate-900 mb-3 tracking-tight" style={{ fontSize: '2rem', fontWeight: 600 }}>
            LICENÇA DE ATUAÇÃO
          </h1>
          <p className="text-sm dark:text-zinc-400 text-slate-500 font-light max-w-md mx-auto">
            Por favor, valide sua área de especialização e insira seu registro do conselho.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="dark:bg-[#0a0a0a] bg-white rounded-2xl p-8 border dark:border-zinc-800 border-slate-200 shadow-xl"
        >
          <div className="space-y-8">
            {/* Escolha do tipo */}
            <div>
              <label className="block text-xs dark:text-zinc-400 text-slate-600 mb-3 uppercase tracking-wider font-semibold">
                Área de Atuação
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setData({ ...data, professionalType: 'personal' })}
                  className={`p-6 rounded-xl border text-left transition-all relative ${
                    data.professionalType === 'personal'
                      ? 'dark:bg-blue-500/10 bg-blue-50 border-blue-500/50'
                      : 'dark:bg-zinc-900/50 bg-slate-50/50 dark:border-zinc-800 border-slate-200'
                  }`}
                >
                  <Briefcase className={`w-6 h-6 mb-3 ${data.professionalType === 'personal' ? 'text-blue-500' : 'dark:text-zinc-500 text-slate-400'}`} />
                  <h3 className={`font-medium ${data.professionalType === 'personal' ? 'dark:text-white text-slate-900' : 'dark:text-zinc-300 text-slate-700'}`}>
                    Personal Trainer
                  </h3>
                  {data.professionalType === 'personal' && (
                    <div className="absolute top-4 right-4 text-blue-500">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                  )}
                </button>
                <button
                  onClick={() => setData({ ...data, professionalType: 'nutritionist' })}
                  className={`p-6 rounded-xl border text-left transition-all relative ${
                    data.professionalType === 'nutritionist'
                      ? 'dark:bg-amber-500/10 bg-amber-50 border-amber-500/50'
                      : 'dark:bg-zinc-900/50 bg-slate-50/50 dark:border-zinc-800 border-slate-200'
                  }`}
                >
                  <Briefcase className={`w-6 h-6 mb-3 ${data.professionalType === 'nutritionist' ? 'text-amber-500' : 'dark:text-zinc-500 text-slate-400'}`} />
                  <h3 className={`font-medium ${data.professionalType === 'nutritionist' ? 'dark:text-white text-slate-900' : 'dark:text-zinc-300 text-slate-700'}`}>
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

            {/* Credencias Textuais */}
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
                    onChange={e => setData({ ...data, credential: e.target.value })}
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
                    onChange={e => setData({ ...data, phone: e.target.value })}
                    placeholder="(00) 00000-0000"
                    className="w-full pl-10 pr-4 py-3 rounded-lg dark:bg-zinc-900/50 bg-slate-50/50 border dark:border-zinc-800 border-slate-200 dark:text-white text-slate-900 focus:border-blue-500 font-light"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t dark:border-zinc-800/80 border-slate-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs dark:text-zinc-500 text-slate-400">
                <Shield className="w-4 h-4" />
                <span>Dados de registro preservados judicialmente.</span>
              </div>
              <button
                onClick={handleComplete}
                disabled={!data.professionalType || !data.credential || loading}
                className="py-3 px-8 bg-blue-600 rounded-lg text-white font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Autenticar Credenciais</>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

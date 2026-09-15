import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowRight, Weight, Ruler, Target, Heart, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export function StudentOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [data, setData] = useState({
    weight: '',
    height: '',
    age: '',
    goal: '',
  });

  const handleComplete = async () => {
    setLoading(true);
    // Simular o tempo de salvamento no banco de dados
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    toast.success('Perfil biométrico configurado com sucesso.');
    navigate('/app');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 dark:bg-zinc-950 bg-slate-50">
      <div className="w-full max-w-xl">
        <div className="text-center mb-10">
          <h1 className="dark:text-white text-slate-900 mb-3 tracking-tight" style={{ fontSize: '2rem', fontWeight: 600 }}>
            PERFIL BIOMÉTRICO
          </h1>
          <p className="text-sm dark:text-zinc-400 text-slate-500 font-light max-w-md mx-auto">
            Para prover orientações precisas, precisamos estabelecer seus dados basais.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="dark:bg-[#000137] bg-white rounded-2xl p-8 border dark:border-zinc-800 border-slate-200 shadow-xl"
        >
          {step === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs dark:text-zinc-400 text-slate-600 mb-2 uppercase tracking-wider font-semibold">Peso (kg)</label>
                  <div className="relative">
                    <Weight className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-600 text-slate-400" />
                    <input
                      type="number"
                      value={data.weight}
                      onChange={e => setData({ ...data, weight: e.target.value })}
                      placeholder="Ex: 75.5"
                      className="w-full pl-10 pr-4 py-3 rounded-lg dark:bg-zinc-900/50 bg-slate-50/50 border dark:border-zinc-800 border-slate-200 dark:text-white text-slate-900 focus:border-[#000346] dark:focus:border-[#C5C5CE] font-light"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs dark:text-zinc-400 text-slate-600 mb-2 uppercase tracking-wider font-semibold">Altura (cm)</label>
                  <div className="relative">
                    <Ruler className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-600 text-slate-400" />
                    <input
                      type="number"
                      value={data.height}
                      onChange={e => setData({ ...data, height: e.target.value })}
                      placeholder="Ex: 175"
                      className="w-full pl-10 pr-4 py-3 rounded-lg dark:bg-zinc-900/50 bg-slate-50/50 border dark:border-zinc-800 border-slate-200 dark:text-white text-slate-900 focus:border-[#000346] dark:focus:border-[#C5C5CE] font-light"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs dark:text-zinc-400 text-slate-600 mb-2 uppercase tracking-wider font-semibold">Idade Biológica</label>
                <div className="relative">
                  <Heart className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-600 text-slate-400" />
                  <input
                    type="number"
                    value={data.age}
                    onChange={e => setData({ ...data, age: e.target.value })}
                    placeholder="Sua idade atual"
                    className="w-full pl-10 pr-4 py-3 rounded-lg dark:bg-zinc-900/50 bg-slate-50/50 border dark:border-zinc-800 border-slate-200 dark:text-white text-slate-900 focus:border-[#000346] dark:focus:border-[#C5C5CE] font-light"
                  />
                </div>
              </div>

              <div className="pt-4 border-t dark:border-zinc-800/80 border-slate-100">
                <button
                  onClick={() => setStep(2)}
                  disabled={!data.weight || !data.height || !data.age}
                  className="w-full py-3.5 bg-[#000326] dark:bg-white rounded-lg text-white font-medium hover:bg-[#000137] dark:hover:bg-[#C5C5CE] disabled:opacity-50 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  Continuar Setup
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs dark:text-zinc-400 text-slate-600 mb-3 uppercase tracking-wider font-semibold">
                  Objetivo Principal
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {['Hipertrofia Muscular', 'Déficit Calórico', 'Condicionamento', 'Performance'].map(goal => (
                    <button
                      key={goal}
                      onClick={() => setData({ ...data, goal })}
                      className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                        data.goal === goal 
                          ? 'dark:bg-[#000326] dark:bg-white/10 bg-[#000326]/5 border-[#000326]/40 dark:border-white/40' 
                          : 'dark:bg-zinc-900/50 bg-slate-50/50 dark:border-zinc-800 border-slate-200'
                      }`}
                    >
                      <span className={`text-sm font-medium ${data.goal === goal ? 'text-[#000326] dark:text-[#C5C5CE] dark:text-[#5a64b4] dark:text-[#C5C5CE]' : 'dark:text-zinc-400 text-slate-600'}`}>
                        {goal}
                      </span>
                      {data.goal === goal && <CheckCircle className="w-4 h-4 text-[#000326] dark:text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t dark:border-zinc-800/80 border-slate-100 flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3.5 rounded-lg border dark:border-zinc-800 border-slate-200 text-sm font-medium dark:text-zinc-400 text-slate-600 hover:dark:bg-zinc-900 hover:bg-slate-100 transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={handleComplete}
                  disabled={!data.goal || loading}
                  className="flex-1 py-3.5 bg-[#000326] dark:bg-white rounded-lg text-white font-medium hover:bg-[#000137] dark:hover:bg-[#C5C5CE] disabled:opacity-50 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Finalizar e Acessar
                      <Target className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

import React from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Dumbbell, Award, ArrowRight, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function PanelSelector() {
  const navigate = useNavigate();
  // Obtém informações da sessão atual
  const { user, logout } = useAuth();

  // Definição dos painéis disponíveis
  const panels = [
    {
      id: 'personal',
      label: 'Personal Trainer',
      description: 'Estruturação de treinamentos, avaliações físicas contínuas e gestão de agenda.',
      icon: Dumbbell,
      path: '/personal',
      gradient: 'linear-gradient(135deg, #1e293b, #0f172a)',
      glowColor: 'rgba(59,130,246,0.15)',
      accentColor: '#3b82f6',
      features: ['Planejamento de rotinas com IA', 'Administração de carteira de alunos', 'Avaliação biométrica detalhada'],
    },
    {
      id: 'nutritionist',
      label: 'Nutricionista',
      description: 'Prescrição dietética, registros de anamnese e monitoramento de pacientes.',
      icon: Award,
      path: '/nutritionist',
      gradient: 'linear-gradient(135deg, #1e293b, #0f172a)',
      glowColor: 'rgba(245,158,11,0.15)',
      accentColor: '#f59e0b',
      features: ['Esquemas alimentares com IA', 'Anamnese clínica profunda', 'Monitoramento evolutivo'],
    },
  ];

  return (
    <div className="min-h-screen dark:bg-[#050505] bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background premium sutil */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none flex justify-center items-center">
        <div className="w-[800px] h-[800px] rounded-full blur-[150px] opacity-10 mix-blend-screen" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 60%)' }} />
      </div>

      {/* Top bar (Header leve) */}
      <div className="absolute top-6 right-6 flex items-center gap-4">
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg border dark:border-zinc-800 border-slate-200 dark:bg-zinc-900/50 bg-white/50 backdrop-blur-md">
          {user?.avatar && <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded object-cover grayscale opacity-80" />}
          <span className="text-sm dark:text-zinc-300 text-slate-700 font-medium tracking-wide">{user?.name}</span>
        </div>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="w-10 h-10 rounded-lg border dark:border-zinc-800 border-slate-200 dark:bg-zinc-900/50 bg-white/50 backdrop-blur-md flex items-center justify-center dark:text-zinc-500 text-slate-400 hover:text-white transition-all"
          title="Encerrar Sessão"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl relative z-10"
      >
        {/* Cabeçalho */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl dark:bg-zinc-900/40 bg-white/40 backdrop-blur border dark:border-zinc-800 border-slate-200 mb-6">
            <div className="w-6 h-6 rounded flex items-center justify-center dark:bg-zinc-800 bg-slate-100">
              <Shield className="w-3.5 h-3.5 dark:text-zinc-400 text-slate-500" />
            </div>
            <span className="text-xs dark:text-zinc-300 text-slate-700 font-medium tracking-widest uppercase">
              Direcionamento de Ambiente
            </span>
          </div>
          <h1 className="dark:text-white text-slate-900 mb-3 tracking-tight" style={{ fontSize: '2.25rem', fontWeight: 600 }}>
            ESCOLHA SEU PAINEL
          </h1>
          <p className="text-sm dark:text-zinc-400 text-slate-500 font-light max-w-lg mx-auto leading-relaxed">
            Selecione qual módulo de atuação gerencial você utilizará nesta sessão de trabalho.
          </p>
        </div>

        {/* Cards dos Painéis */}
        <div className="grid md:grid-cols-2 gap-8">
          {panels.map((panel, index) => {
            const Icon = panel.icon;
            return (
              <motion.button
                key={panel.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => navigate(panel.path)}
                className="group relative p-8 rounded-2xl dark:bg-[#0a0a0a] bg-white border dark:border-zinc-800 border-slate-200 text-left overflow-hidden transition-all duration-300 hover:shadow-2xl flex flex-col h-full"
                style={{
                  boxShadow: `0 0 0 transparent`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 60px ${panel.glowColor}`;
                  (e.currentTarget as HTMLElement).style.borderColor = panel.accentColor + '40';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 transparent';
                  (e.currentTarget as HTMLElement).style.borderColor = '';
                }}
              >
                {/* Ícone */}
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-6 border dark:border-zinc-800 border-slate-100"
                  style={{ background: panel.gradient }}
                >
                  <Icon className="w-5 h-5 dark:text-zinc-300 text-slate-600 group-hover:dark:text-white transition-colors" />
                </div>

                {/* Conteúdo Principal */}
                <h2 className="dark:text-white text-slate-900 mb-2 font-medium tracking-tight text-lg">
                  {panel.label}
                </h2>
                <p className="text-sm dark:text-zinc-400 text-slate-500 mb-8 font-light leading-relaxed flex-grow">
                  {panel.description}
                </p>

                {/* Lista de Features */}
                <ul className="space-y-3 mb-8">
                  {panel.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-3 text-xs dark:text-zinc-400 text-slate-500 font-light tracking-wide">
                      <div className="w-1 h-1 rounded flex-shrink-0" style={{ backgroundColor: panel.accentColor }} />
                      {feat}
                    </li>
                  ))}
                </ul>

                {/* Chamada para Ação */}
                <div
                  className="flex items-center gap-2 text-xs uppercase tracking-widest font-semibold mt-auto group-hover:gap-4 transition-all"
                  style={{ color: panel.accentColor }}
                >
                  Acessar Ambiente
                  <ArrowRight className="w-4 h-4" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

import React, { useState } from 'react';
import {
  ClipboardList,
  FileText,
  Pill,
  Droplet,
  TrendingUp,
  Calendar,
  Users,
  BarChart3,
  Activity,
  Apple,
  Beaker,
  Camera,
  Plus,
  Edit3,
  Download,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  Search,
  Filter,
  ArrowLeft,
  Mail,
  Phone,
  Target,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';

export function NutritionistProfile() {
  const { user } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  // Mock data - em produção viria do backend
  const patients = [
    { id: '1', name: 'Maria Silva', status: 'active', nextConsult: '15/03/2026', adherence: 92, email: 'maria@email.com', phone: '(11) 98765-4321', goal: 'Emagrecimento' },
    { id: '2', name: 'João Santos', status: 'active', nextConsult: '18/03/2026', adherence: 78, email: 'joao@email.com', phone: '(11) 98765-1234', goal: 'Ganho de Massa' },
    { id: '3', name: 'Ana Costa', status: 'pending', nextConsult: '20/03/2026', adherence: 85, email: 'ana@email.com', phone: '(11) 98765-5678', goal: 'Performance' },
    { id: '4', name: 'Carlos Oliveira', status: 'active', nextConsult: '22/03/2026', adherence: 95, email: 'carlos@email.com', phone: '(11) 98765-9999', goal: 'Saúde Metabólica' },
    { id: '5', name: 'Juliana Mendes', status: 'inactive', nextConsult: '25/03/2026', adherence: 62, email: 'juliana@email.com', phone: '(11) 98765-1111', goal: 'Emagrecimento' },
  ];

  const currentPatient = patients.find(p => p.id === selectedPatient);

  const biomarkers = [
    { name: 'Glicemia', value: 95, unit: 'mg/dL', range: '70-100', status: 'normal' },
    { name: 'Colesterol Total', value: 185, unit: 'mg/dL', range: '<200', status: 'normal' },
    { name: 'HDL', value: 55, unit: 'mg/dL', range: '>40', status: 'normal' },
    { name: 'LDL', value: 110, unit: 'mg/dL', range: '<130', status: 'normal' },
    { name: 'Triglicerídeos', value: 145, unit: 'mg/dL', range: '<150', status: 'borderline' },
    { name: 'TSH', value: 2.8, unit: 'μUI/mL', range: '0.4-4.0', status: 'normal' },
    { name: 'Creatinina', value: 0.9, unit: 'mg/dL', range: '0.6-1.2', status: 'normal' },
    { name: 'TGO/AST', value: 28, unit: 'U/L', range: '<40', status: 'normal' },
  ];

  const anthropometricData = {
    weight: 78.5,
    height: 1.75,
    bmi: 25.6,
    bodyFat: 22.3,
    visceralFat: 8,
    muscleMass: 58.2,
    boneMass: 3.2,
    metabolicAge: 32,
  };

  const supplements = [
    { name: 'Whey Protein', dose: '30g', frequency: '2x/dia', timing: 'Pós-treino e café da manhã' },
    { name: 'Creatina', dose: '5g', frequency: '1x/dia', timing: 'Qualquer horário' },
    { name: 'Ômega 3', dose: '1000mg', frequency: '2x/dia', timing: 'Almoço e jantar' },
    { name: 'Vitamina D3', dose: '2000 UI', frequency: '1x/dia', timing: 'Com refeição gordurosa' },
  ];

  const foodPlan = {
    calories: 2200,
    protein: 165,
    carbs: 220,
    fat: 73,
    meals: [
      { name: 'Café da Manhã', time: '07:00', calories: 450 },
      { name: 'Lanche da Manhã', time: '10:00', calories: 200 },
      { name: 'Almoço', time: '12:30', calories: 650 },
      { name: 'Lanche da Tarde', time: '16:00', calories: 250 },
      { name: 'Jantar', time: '19:30', calories: 550 },
      { name: 'Ceia', time: '22:00', calories: 100 },
    ],
  };

  // Se nenhum paciente está selecionado, mostra a lista
  if (!selectedPatient) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="dark:text-white text-slate-900 text-2xl" style={{ fontWeight: 800 }}>
              Perfil Nutricionista
            </h2>
            <p className="text-sm dark:text-zinc-400 text-slate-500 mt-1">
              CRN {user?.professionalId || '12345/SP'} · Nutrição Clínica e Esportiva
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm dark:bg-zinc-800 bg-white dark:border-zinc-700 border border-slate-200 dark:text-zinc-300 text-slate-700 hover:text-emerald-500 transition-colors">
              <Search className="w-4 h-4" />
              Buscar Paciente
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white"
              style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}
            >
              <Plus className="w-4 h-4" />
              Novo Paciente
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Pacientes Ativos', value: patients.filter(p => p.status === 'active').length.toString(), icon: Users, color: 'emerald' },
            { label: 'Consultas Hoje', value: '8', icon: Calendar, color: 'blue' },
            { label: 'Taxa de Adesão', value: '87%', icon: TrendingUp, color: 'purple' },
            { label: 'Prescrições Ativas', value: patients.length.toString(), icon: FileText, color: 'orange' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="dark:bg-zinc-900 bg-white rounded-2xl p-4 dark:border-zinc-800 border border-slate-200"
            >
              <div className="flex items-center justify-between mb-3">
                <stat.icon className={`w-5 h-5 text-${stat.color}-500`} />
                <span className={`text-xs px-2 py-0.5 rounded-full bg-${stat.color}-500/10 text-${stat.color}-500`}>
                  Ativo
                </span>
              </div>
              <p className="dark:text-white text-slate-900 text-2xl mb-1" style={{ fontWeight: 800 }}>
                {stat.value}
              </p>
              <p className="text-xs dark:text-zinc-400 text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Lista de Pacientes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30">
                <Users className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="dark:text-white text-slate-900 text-lg" style={{ fontWeight: 700 }}>
                  Meus Pacientes
                </h3>
                <p className="text-xs dark:text-zinc-500 text-slate-400">
                  Selecione um paciente para visualizar detalhes
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-lg text-sm bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Ativos ({patients.filter(p => p.status === 'active').length})
              </button>
              <button className="px-4 py-2 rounded-lg text-sm dark:bg-zinc-800 bg-slate-100 dark:text-zinc-400 text-slate-600">
                Inativos ({patients.filter(p => p.status === 'inactive').length})
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {patients.map((patient) => (
              <motion.div
                key={patient.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedPatient(patient.id)}
                className={`dark:bg-zinc-800/50 bg-slate-50 rounded-2xl p-5 border dark:border-zinc-700 border-slate-200 cursor-pointer hover:border-emerald-500/50 transition-all ${
                  patient.status === 'inactive' ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-white text-lg" style={{ fontWeight: 700 }}>
                      {patient.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="dark:text-white text-slate-900 mb-1" style={{ fontWeight: 700 }}>
                        {patient.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          patient.status === 'active' 
                            ? 'bg-emerald-500/10 text-emerald-500' 
                            : patient.status === 'pending'
                            ? 'bg-yellow-500/10 text-yellow-500'
                            : 'bg-red-500/10 text-red-500'
                        }`}>
                          {patient.status === 'active' ? 'Ativo' : patient.status === 'pending' ? 'Pendente' : 'Inativo'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs dark:text-zinc-400 text-slate-500 mb-1">Adesão</p>
                    <p className={`text-xl ${patient.adherence >= 80 ? 'text-emerald-500' : 'text-yellow-500'}`} style={{ fontWeight: 700 }}>
                      {patient.adherence}%
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="dark:bg-zinc-900/50 bg-white rounded-xl p-3 border dark:border-zinc-700 border-slate-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-4 h-4 dark:text-zinc-400 text-slate-500" />
                      <p className="text-xs dark:text-zinc-500 text-slate-400">Objetivo</p>
                    </div>
                    <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>
                      {patient.goal}
                    </p>
                  </div>
                  <div className="dark:bg-zinc-900/50 bg-white rounded-xl p-3 border dark:border-zinc-700 border-slate-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 dark:text-zinc-400 text-slate-500" />
                      <p className="text-xs dark:text-zinc-500 text-slate-400">Próxima Consulta</p>
                    </div>
                    <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>
                      {patient.nextConsult}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t dark:border-zinc-700 border-slate-200 flex items-center justify-between text-xs dark:text-zinc-400 text-slate-500">
                  <div className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {patient.email}
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {patient.phone}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // Paciente selecionado - mostra detalhes completos
  return (
    <div className="space-y-6">
      {/* Header com Paciente Selecionado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedPatient(null)}
            className="w-10 h-10 rounded-xl dark:bg-zinc-900 bg-white dark:border-zinc-800 border border-slate-200 flex items-center justify-center dark:text-zinc-400 text-slate-600 hover:text-emerald-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="dark:text-white text-slate-900 text-2xl" style={{ fontWeight: 800 }}>
              {currentPatient?.name}
            </h2>
            <p className="text-sm dark:text-zinc-400 text-slate-500 mt-1">
              {currentPatient?.goal} · Adesão: <span className={currentPatient && currentPatient.adherence >= 80 ? 'text-emerald-500' : 'text-yellow-500'}>{currentPatient?.adherence}%</span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm dark:bg-zinc-800 bg-white dark:border-zinc-700 border border-slate-200 dark:text-zinc-300 text-slate-700 hover:text-emerald-500 transition-colors">
            <Download className="w-4 h-4" />
            Exportar Dados
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white"
            style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}
          >
            <Calendar className="w-4 h-4" />
            Agendar Consulta
          </button>
        </div>
      </div>

      {/* MÓDULO 1: AVALIAÇÃO */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30">
              <ClipboardList className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="dark:text-white text-slate-900 text-lg" style={{ fontWeight: 700 }}>
                Módulo de Avaliação
              </h3>
              <p className="text-xs dark:text-zinc-500 text-slate-400">
                Anamnese, questionários e histórico de consultas
              </p>
            </div>
          </div>
          <button className="p-2 rounded-lg dark:bg-zinc-800 bg-slate-100 dark:text-zinc-400 text-slate-500 hover:text-emerald-500 transition-colors">
            <Edit3 className="w-4 h-4" />
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Anamnese Geral */}
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm dark:text-zinc-300 text-slate-700 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                Anamnese Geral
              </p>
              <button className="text-xs text-emerald-500 hover:text-emerald-400">Editar</button>
            </div>
            <div className="space-y-2">
              {[
                { label: 'Objetivo Principal', value: currentPatient?.goal || 'Emagrecimento' },
                { label: 'Restrições Alimentares', value: 'Lactose, Glúten' },
                { label: 'Alergias', value: 'Nenhuma' },
                { label: 'Medicamentos em uso', value: 'Levotiroxina 50mcg' },
                { label: 'Patologias', value: 'Hipotireoidismo' },
                { label: 'Atividade Física', value: '5x/semana (musculação)' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="dark:bg-zinc-800/50 bg-slate-50 rounded-xl p-3 border dark:border-zinc-700 border-slate-200"
                >
                  <p className="text-xs dark:text-zinc-500 text-slate-400 mb-1">{item.label}</p>
                  <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Questionários de Saúde */}
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm dark:text-zinc-300 text-slate-700 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                Questionários Aplicados
              </p>
              <button className="text-xs text-emerald-500 hover:text-emerald-400">+ Novo</button>
            </div>
            <div className="space-y-2">
              {[
                { name: 'Rastreamento Metabólico', date: '01/03/2026', score: '8/10', status: 'completed' },
                { name: 'Frequência Alimentar', date: '01/03/2026', score: '9/10', status: 'completed' },
                { name: 'Qualidade do Sono', date: '01/03/2026', score: '6/10', status: 'completed' },
                { name: 'Nível de Estresse', date: '28/02/2026', score: '7/10', status: 'pending' },
              ].map((quest) => (
                <div
                  key={quest.name}
                  className="dark:bg-zinc-800/50 bg-slate-50 rounded-xl p-3 border dark:border-zinc-700 border-slate-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>
                      {quest.name}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        quest.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-yellow-500/10 text-yellow-500'
                      }`}
                    >
                      {quest.status === 'completed' ? 'Completo' : 'Pendente'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs dark:text-zinc-400 text-slate-500">
                    <span>{quest.date}</span>
                    <span className="dark:text-zinc-300 text-slate-700" style={{ fontWeight: 600 }}>
                      Score: {quest.score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Histórico de Consultas */}
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm dark:text-zinc-300 text-slate-700 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                Histórico de Consultas
              </p>
              <button className="text-xs text-emerald-500 hover:text-emerald-400">Ver Tudo</button>
            </div>
            <div className="space-y-2">
              {[
                { id: 'c1', date: '01/03/2026', type: 'Consulta de Retorno', weight: '78.5kg', notes: 'Evolução positiva' },
                { id: 'c2', date: '15/02/2026', type: 'Ajuste de Plano', weight: '80.2kg', notes: 'Redução de carboidratos' },
                { id: 'c3', date: '01/02/2026', type: 'Primeira Consulta', weight: '82.0kg', notes: 'Anamnese completa' },
              ].map((consult, idx) => (
                <div
                  key={consult.id}
                  className="dark:bg-zinc-800/50 bg-slate-50 rounded-xl p-3 border dark:border-zinc-700 border-slate-200 relative"
                >
                  {idx === 0 && (
                    <div className="absolute -top-2 -right-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500 text-white" style={{ fontWeight: 700 }}>
                        Última
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs dark:text-zinc-400 text-slate-500">{consult.date}</p>
                    <span className="text-xs dark:text-emerald-400 text-emerald-600" style={{ fontWeight: 600 }}>
                      {consult.weight}
                    </span>
                  </div>
                  <p className="text-sm dark:text-white text-slate-900 mb-1" style={{ fontWeight: 600 }}>
                    {consult.type}
                  </p>
                  <p className="text-xs dark:text-zinc-400 text-slate-500">{consult.notes}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dica de Especialista */}
        <div className="mt-6 pt-6 border-t dark:border-zinc-800 border-slate-200">
          <div className="dark:bg-gradient-to-r dark:from-blue-500/10 dark:to-purple-500/10 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border dark:border-blue-500/20 border-blue-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500/20 flex-shrink-0">
                <Lightbulb className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-1" style={{ fontWeight: 700 }}>
                  💡 Dica de Especialista
                </p>
                <p className="text-sm dark:text-zinc-300 text-slate-700">
                  Aplicar questionários de rastreamento a cada 30 dias aumenta a taxa de adesão em até 35%. 
                  Utilize ferramentas de auto-preenchimento para reduzir fricção e garantir dados consistentes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* MÓDULO 2: PAINEL BIOQUÍMICO */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
              <Beaker className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="dark:text-white text-slate-900 text-lg" style={{ fontWeight: 700 }}>
                Painel Bioquímico e Antropométrico
              </h3>
              <p className="text-xs dark:text-zinc-500 text-slate-400">
                Exames laboratoriais e avaliação corporal
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2 rounded-lg dark:bg-zinc-800 bg-slate-100 dark:text-zinc-400 text-slate-500 hover:text-emerald-500 transition-colors">
              <Download className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg dark:bg-zinc-800 bg-slate-100 dark:text-zinc-400 text-slate-500 hover:text-emerald-500 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Biomarcadores */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm dark:text-zinc-300 text-slate-700 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                Biomarcadores Sanguíneos
              </p>
              <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500">
                Atualizado em 28/02/2026
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="dark:bg-zinc-800 bg-slate-100 border-b dark:border-zinc-700 border-slate-200">
                    <th className="text-left px-3 py-2 text-xs dark:text-zinc-400 text-slate-600 font-semibold">
                      Exame
                    </th>
                    <th className="text-center px-3 py-2 text-xs dark:text-zinc-400 text-slate-600 font-semibold">
                      Valor
                    </th>
                    <th className="text-center px-3 py-2 text-xs dark:text-zinc-400 text-slate-600 font-semibold">
                      Referência
                    </th>
                    <th className="text-center px-3 py-2 text-xs dark:text-zinc-400 text-slate-600 font-semibold">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {biomarkers.map((marker, idx) => (
                    <tr
                      key={marker.name}
                      className={`border-b dark:border-zinc-800 border-slate-100 ${
                        idx % 2 === 0 ? 'dark:bg-zinc-900/50 bg-white' : 'dark:bg-zinc-800/30 bg-slate-50/50'
                      }`}
                    >
                      <td className="px-3 py-3">
                        <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>
                          {marker.name}
                        </p>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <p className="text-sm dark:text-zinc-300 text-slate-700">
                          {marker.value} <span className="text-xs dark:text-zinc-500 text-slate-400">{marker.unit}</span>
                        </p>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <p className="text-xs dark:text-zinc-400 text-slate-500">{marker.range}</p>
                      </td>
                      <td className="px-3 py-3 text-center">
                        {marker.status === 'normal' ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-yellow-500 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Avaliação Antropométrica */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm dark:text-zinc-300 text-slate-700 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                Avaliação Antropométrica
              </p>
              <button className="text-xs text-emerald-500 hover:text-emerald-400 flex items-center gap-1">
                <Camera className="w-3 h-3" />
                Adicionar Foto
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Peso', value: anthropometricData.weight, unit: 'kg', color: 'blue' },
                { label: 'Altura', value: anthropometricData.height, unit: 'm', color: 'purple' },
                { label: 'IMC', value: anthropometricData.bmi, unit: 'kg/m²', color: 'emerald' },
                { label: '% Gordura', value: anthropometricData.bodyFat, unit: '%', color: 'orange' },
                { label: 'Gordura Visceral', value: anthropometricData.visceralFat, unit: 'nível', color: 'red' },
                { label: 'Massa Muscular', value: anthropometricData.muscleMass, unit: 'kg', color: 'green' },
                { label: 'Massa Óssea', value: anthropometricData.boneMass, unit: 'kg', color: 'slate' },
                { label: 'Idade Metabólica', value: anthropometricData.metabolicAge, unit: 'anos', color: 'violet' },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className="dark:bg-zinc-800/50 bg-slate-50 rounded-2xl p-4 border dark:border-zinc-700 border-slate-200"
                >
                  <Activity className={`w-5 h-5 text-${metric.color}-500 mb-2`} />
                  <p className="dark:text-white text-slate-900 text-xl mb-1" style={{ fontWeight: 800 }}>
                    {metric.value}
                  </p>
                  <p className="text-xs dark:text-zinc-500 text-slate-400">{metric.unit}</p>
                  <p className="text-xs dark:text-zinc-400 text-slate-500 mt-1" style={{ fontWeight: 500 }}>
                    {metric.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 dark:bg-zinc-800/50 bg-slate-50 rounded-2xl p-4 border dark:border-zinc-700 border-slate-200">
              <p className="text-xs dark:text-zinc-400 text-slate-500 mb-3">Evolução Fotográfica</p>
              <div className="grid grid-cols-3 gap-2">
                {['Início', '30 dias', '60 dias'].map((label) => (
                  <div key={label} className="relative aspect-square rounded-xl dark:bg-zinc-700 bg-slate-200 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Camera className="w-8 h-8 dark:text-zinc-600 text-slate-400" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                      <p className="text-white text-xs" style={{ fontWeight: 600 }}>
                        {label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Dica de Especialista */}
        <div className="mt-6 pt-6 border-t dark:border-zinc-800 border-slate-200">
          <div className="dark:bg-gradient-to-r dark:from-blue-500/10 dark:to-purple-500/10 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border dark:border-blue-500/20 border-blue-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500/20 flex-shrink-0">
                <Lightbulb className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-1" style={{ fontWeight: 700 }}>
                  💡 Dica de Especialista
                </p>
                <p className="text-sm dark:text-zinc-300 text-slate-700">
                  Solicite exames de tireoide (TSH, T4 livre) e perfil lipídico a cada 90 dias para pacientes com sobrepeso. 
                  A bioimpedância mensal ajuda a identificar perda de massa muscular precocemente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* MÓDULO 3: PRESCRIÇÃO */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30">
              <Apple className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h3 className="dark:text-white text-slate-900 text-lg" style={{ fontWeight: 700 }}>
                Módulo de Prescrição
              </h3>
              <p className="text-xs dark:text-zinc-500 text-slate-400">
                Planejamento alimentar e suplementação
              </p>
            </div>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white"
            style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}
          >
            <FileText className="w-4 h-4" />
            Gerar PDF
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Plano Alimentar */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm dark:text-zinc-300 text-slate-700 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                Plano Alimentar Atual
              </p>
              <div className="flex gap-2">
                <button className="text-xs px-3 py-1.5 rounded-lg dark:bg-zinc-800 bg-slate-100 dark:text-zinc-400 text-slate-600">
                  Por Alimentos
                </button>
                <button className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                  Equivalentes
                </button>
                <button className="text-xs px-3 py-1.5 rounded-lg dark:bg-zinc-800 bg-slate-100 dark:text-zinc-400 text-slate-600">
                  Qualitativa
                </button>
              </div>
            </div>

            {/* Macros Overview */}
            <div className="dark:bg-gradient-to-br dark:from-emerald-500/10 dark:to-blue-500/10 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl p-5 border dark:border-emerald-500/20 border-emerald-200 mb-4">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-xs dark:text-zinc-400 text-slate-500 mb-1">Calorias Totais</p>
                  <p className="dark:text-white text-slate-900 text-2xl" style={{ fontWeight: 800 }}>
                    {foodPlan.calories}
                  </p>
                  <p className="text-xs dark:text-zinc-500 text-slate-400">kcal/dia</p>
                </div>
                <div>
                  <p className="text-xs dark:text-zinc-400 text-slate-500 mb-1">Proteínas</p>
                  <p className="text-emerald-500 text-2xl" style={{ fontWeight: 800 }}>
                    {foodPlan.protein}g
                  </p>
                  <p className="text-xs dark:text-zinc-500 text-slate-400">30%</p>
                </div>
                <div>
                  <p className="text-xs dark:text-zinc-400 text-slate-500 mb-1">Carboidratos</p>
                  <p className="text-blue-500 text-2xl" style={{ fontWeight: 800 }}>
                    {foodPlan.carbs}g
                  </p>
                  <p className="text-xs dark:text-zinc-500 text-slate-400">40%</p>
                </div>
                <div>
                  <p className="text-xs dark:text-zinc-400 text-slate-500 mb-1">Gorduras</p>
                  <p className="text-purple-500 text-2xl" style={{ fontWeight: 800 }}>
                    {foodPlan.fat}g
                  </p>
                  <p className="text-xs dark:text-zinc-500 text-slate-400">30%</p>
                </div>
              </div>
            </div>

            {/* Refeições */}
            <div className="space-y-2">
              {foodPlan.meals.map((meal, idx) => (
                <div
                  key={meal.name}
                  className="dark:bg-zinc-800/50 bg-slate-50 rounded-xl p-3 border dark:border-zinc-700 border-slate-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/10">
                      <span className="text-sm text-emerald-500" style={{ fontWeight: 700 }}>
                        {idx + 1}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>
                        {meal.name}
                      </p>
                      <p className="text-xs dark:text-zinc-400 text-slate-500">{meal.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 700 }}>
                      {meal.calories}
                    </p>
                    <p className="text-xs dark:text-zinc-400 text-slate-500">kcal</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Suplementação */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm dark:text-zinc-300 text-slate-700 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                Suplementação
              </p>
              <button className="text-xs text-emerald-500 hover:text-emerald-400">+ Adicionar</button>
            </div>
            <div className="space-y-3">
              {supplements.map((supp) => (
                <div
                  key={supp.name}
                  className="dark:bg-zinc-800/50 bg-slate-50 rounded-xl p-4 border dark:border-zinc-700 border-slate-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <Pill className="w-5 h-5 text-blue-500" />
                    <button className="text-xs dark:text-zinc-500 text-slate-400 hover:text-red-400">
                      Remover
                    </button>
                  </div>
                  <p className="text-sm dark:text-white text-slate-900 mb-1" style={{ fontWeight: 600 }}>
                    {supp.name}
                  </p>
                  <div className="space-y-1 text-xs dark:text-zinc-400 text-slate-500">
                    <p>Dose: <span className="dark:text-zinc-300 text-slate-700">{supp.dose}</span></p>
                    <p>Frequência: <span className="dark:text-zinc-300 text-slate-700">{supp.frequency}</span></p>
                    <p>Timing: <span className="dark:text-zinc-300 text-slate-700">{supp.timing}</span></p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 dark:bg-blue-500/10 bg-blue-50 rounded-xl p-3 border dark:border-blue-500/20 border-blue-200">
              <p className="text-xs text-blue-600 dark:text-blue-400 mb-2" style={{ fontWeight: 600 }}>
                ℹ️ Manipulados Personalizados
              </p>
              <p className="text-xs dark:text-zinc-400 text-slate-600">
                Prescreva fórmulas magistrais para necessidades específicas (ex: Coenzima Q10, Picolinato de Cromo).
              </p>
            </div>
          </div>
        </div>

        {/* Dica de Especialista */}
        <div className="mt-6 pt-6 border-t dark:border-zinc-800 border-slate-200">
          <div className="dark:bg-gradient-to-r dark:from-blue-500/10 dark:to-purple-500/10 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border dark:border-blue-500/20 border-blue-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500/20 flex-shrink-0">
                <Lightbulb className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-1" style={{ fontWeight: 700 }}>
                  💡 Dica de Especialista
                </p>
                <p className="text-sm dark:text-zinc-300 text-slate-700">
                  Utilize a metodologia de "Equivalentes" para pacientes que viajam frequentemente. 
                  Isso permite flexibilidade sem comprometer a aderência. Inclua sempre 2-3 opções por refeição.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* MÓDULO 4: ENGAJAMENTO */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="dark:text-white text-slate-900 text-lg" style={{ fontWeight: 700 }}>
                Dashboard de Engajamento
              </h3>
              <p className="text-xs dark:text-zinc-500 text-slate-400">
                Monitoramento de adesão e hábitos
              </p>
            </div>
          </div>
          <select className="px-4 py-2 rounded-xl text-sm dark:bg-zinc-800 bg-slate-100 dark:text-zinc-300 text-slate-700 dark:border-zinc-700 border border-slate-200">
            <option>Últimos 7 dias</option>
            <option>Últimos 30 dias</option>
            <option>Últimos 90 dias</option>
          </select>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Ingestão de Água */}
          <div className="dark:bg-zinc-800/50 bg-slate-50 rounded-2xl p-5 border dark:border-zinc-700 border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Droplet className="w-5 h-5 text-blue-500" />
                <p className="text-sm dark:text-zinc-300 text-slate-700" style={{ fontWeight: 600 }}>
                  Ingestão de Água
                </p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-500">
                Hoje
              </span>
            </div>
            <div className="mb-4">
              <p className="dark:text-white text-slate-900 text-3xl mb-1" style={{ fontWeight: 800 }}>
                2.8L
              </p>
              <p className="text-xs dark:text-zinc-400 text-slate-500">Meta: 3.0L/dia</p>
            </div>
            <div className="h-3 rounded-full dark:bg-zinc-700 bg-slate-200 overflow-hidden mb-3">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '93%' }}></div>
            </div>
            <p className="text-xs dark:text-zinc-400 text-slate-500">
              93% da meta alcançada · Média semanal: 2.6L
            </p>
          </div>

          {/* Macronutrientes */}
          <div className="dark:bg-zinc-800/50 bg-slate-50 rounded-2xl p-5 border dark:border-zinc-700 border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-500" />
                <p className="text-sm dark:text-zinc-300 text-slate-700" style={{ fontWeight: 600 }}>
                  Macronutrientes
                </p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500">
                Hoje
              </span>
            </div>
            <div className="space-y-3">
              {[
                { name: 'Proteínas', current: 152, target: 165, unit: 'g', color: 'emerald' },
                { name: 'Carboidratos', current: 198, target: 220, unit: 'g', color: 'blue' },
                { name: 'Gorduras', current: 68, target: 73, unit: 'g', color: 'purple' },
              ].map((macro) => {
                const percentage = Math.round((macro.current / macro.target) * 100);
                return (
                  <div key={macro.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="dark:text-zinc-300 text-slate-700">{macro.name}</span>
                      <span className="dark:text-zinc-400 text-slate-500">
                        {macro.current}/{macro.target}{macro.unit}
                      </span>
                    </div>
                    <div className="h-2 rounded-full dark:bg-zinc-700 bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full bg-${macro.color}-500 rounded-full`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Atividade Física */}
          <div className="dark:bg-zinc-800/50 bg-slate-50 rounded-2xl p-5 border dark:border-zinc-700 border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-orange-500" />
                <p className="text-sm dark:text-zinc-300 text-slate-700" style={{ fontWeight: 600 }}>
                  Atividade Física
                </p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-orange-500/10 text-orange-500">
                Esta semana
              </span>
            </div>
            <div className="mb-4">
              <p className="dark:text-white text-slate-900 text-3xl mb-1" style={{ fontWeight: 800 }}>
                5/5
              </p>
              <p className="text-xs dark:text-zinc-400 text-slate-500">Treinos completados</p>
            </div>
            <div className="space-y-2">
              {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day, idx) => (
                <div key={day} className="flex items-center justify-between">
                  <span className="text-xs dark:text-zinc-400 text-slate-500">{day}</span>
                  <div className="flex gap-1">
                    {idx < 5 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <div className="w-4 h-4 rounded-full dark:bg-zinc-700 bg-slate-200"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dica de Especialista */}
        <div className="mt-6 pt-6 border-t dark:border-zinc-800 border-slate-200">
          <div className="dark:bg-gradient-to-r dark:from-blue-500/10 dark:to-purple-500/10 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border dark:border-blue-500/20 border-blue-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500/20 flex-shrink-0">
                <Lightbulb className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-1" style={{ fontWeight: 700 }}>
                  💡 Dica de Especialista
                </p>
                <p className="text-sm dark:text-zinc-300 text-slate-700">
                  Pacientes que registram água diariamente têm 42% mais chances de atingir metas de peso. 
                  Configure lembretes automáticos a cada 2 horas para maximizar aderência.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

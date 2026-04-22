import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  TrendingUp,
  Dumbbell,
  Calendar,
  MessageSquare,
  DollarSign,
  BarChart3,
  Activity,
  Target,
  Plus,
  Edit3,
  Send,
  Download,
  Link as LinkIcon,
  CheckCircle2,
  Clock,
  Lightbulb,
  Filter,
  Search,
  Star,
  Award,
  Zap,
  ArrowLeft,
  Mail,
  Phone,
  Pill,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';

export function PersonalTrainerProfile() {
  const { user } = useAuth();
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  // Mock data - em produção viria do backend
  const students = [
    {
      id: '1',
      name: 'Carlos Mendes',
      status: 'active',
      frequency: '5x/semana',
      lastWorkout: 'Hoje',
      plan: 'Hipertrofia',
      adherence: 94,
      email: 'carlos@email.com',
      phone: '(11) 98765-4321',
    },
    {
      id: '2',
      name: 'Juliana Costa',
      status: 'active',
      frequency: '4x/semana',
      lastWorkout: 'Ontem',
      plan: 'Emagrecimento',
      adherence: 88,
      email: 'juliana@email.com',
      phone: '(11) 98765-1234',
    },
    {
      id: '3',
      name: 'Pedro Silva',
      status: 'inactive',
      frequency: '3x/semana',
      lastWorkout: 'Há 7 dias',
      plan: 'Força',
      adherence: 65,
      email: 'pedro@email.com',
      phone: '(11) 98765-5678',
    },
    {
      id: '4',
      name: 'Ana Oliveira',
      status: 'active',
      frequency: '6x/semana',
      lastWorkout: 'Hoje',
      plan: 'Performance',
      adherence: 97,
      email: 'ana@email.com',
      phone: '(11) 98765-9999',
    },
    {
      id: '5',
      name: 'Lucas Santos',
      status: 'active',
      frequency: '5x/semana',
      lastWorkout: 'Ontem',
      plan: 'Hipertrofia',
      adherence: 91,
      email: 'lucas@email.com',
      phone: '(11) 98765-1111',
    },
  ];

  const currentStudent = students.find(s => s.id === selectedStudent);

  const exerciseLibrary = [
    { name: 'Supino Reto', category: 'Peito', equipment: 'Barra', difficulty: 'Intermediário' },
    { name: 'Agachamento Livre', category: 'Pernas', equipment: 'Barra', difficulty: 'Avançado' },
    { name: 'Remada Curvada', category: 'Costas', equipment: 'Barra', difficulty: 'Intermediário' },
    { name: 'Desenvolvimento', category: 'Ombros', equipment: 'Halteres', difficulty: 'Intermediário' },
    { name: 'Rosca Direta', category: 'Bíceps', equipment: 'Barra', difficulty: 'Iniciante' },
    { name: 'Tríceps Testa', category: 'Tríceps', equipment: 'Barra W', difficulty: 'Iniciante' },
  ];

  const workoutRoutines = [
    {
      name: 'Treino A - Peito/Tríceps',
      exercises: 8,
      duration: '60 min',
      level: 'Avançado',
      focus: 'Hipertrofia',
    },
    {
      name: 'Treino B - Costas/Bíceps',
      exercises: 9,
      duration: '70 min',
      level: 'Avançado',
      focus: 'Hipertrofia',
    },
    {
      name: 'Treino C - Pernas',
      exercises: 10,
      duration: '75 min',
      level: 'Avançado',
      focus: 'Força',
    },
    {
      name: 'Treino D - Ombros/Abdômen',
      exercises: 7,
      duration: '55 min',
      level: 'Intermediário',
      focus: 'Hipertrofia',
    },
  ];

  const progressData = [
    { exercise: 'Supino Reto', week1: 80, week2: 82.5, week3: 85, week4: 87.5, unit: 'kg' },
    { exercise: 'Agachamento', week1: 120, week2: 125, week3: 130, week4: 132.5, unit: 'kg' },
    { exercise: 'Levantamento Terra', week1: 140, week2: 145, week3: 150, week4: 155, unit: 'kg' },
  ];

  const financialData = {
    monthlyRevenue: 12600,
    activeSubscriptions: 42,
    pendingPayments: 3,
    averageTicket: 300,
  };

  // Se nenhum aluno está selecionado, mostra a lista
  if (!selectedStudent) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="dark:text-white text-slate-900 text-2xl" style={{ fontWeight: 800 }}>
              Perfil Personal Trainer
            </h2>
            <p className="text-sm dark:text-zinc-400 text-slate-500 mt-1">
              CREF {user?.professionalId || '123456-G/SP'} · Treinamento de Força e Hipertrofia
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm dark:bg-zinc-800 bg-white dark:border-zinc-700 border border-slate-200 dark:text-zinc-300 text-slate-700 hover:text-emerald-500 transition-colors">
              <LinkIcon className="w-4 h-4" />
              Link da Bio
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white"
              style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}
            >
              <UserPlus className="w-4 h-4" />
              Novo Aluno
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Alunos Ativos', value: students.filter(s => s.status === 'active').length.toString(), icon: Users, color: 'emerald' },
            { label: 'Treinos Hoje', value: '12', icon: Dumbbell, color: 'blue' },
            { label: 'Taxa de Frequência', value: '89%', icon: TrendingUp, color: 'purple' },
            { label: 'Receita Mensal', value: 'R$ 12.6k', icon: DollarSign, color: 'orange' },
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

        {/* Lista de Alunos */}
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
                  Meus Alunos
                </h3>
                <p className="text-xs dark:text-zinc-500 text-slate-400">
                  Selecione um aluno para visualizar detalhes e treinos
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-lg text-sm bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Ativos ({students.filter(s => s.status === 'active').length})
              </button>
              <button className="px-4 py-2 rounded-lg text-sm dark:bg-zinc-800 bg-slate-100 dark:text-zinc-400 text-slate-600">
                Inativos ({students.filter(s => s.status === 'inactive').length})
              </button>
            </div>
          </div>

          {/* Link de Captação */}
          <div className="dark:bg-gradient-to-br dark:from-blue-500/10 dark:to-purple-500/10 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-5 border dark:border-blue-500/20 border-blue-200 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <LinkIcon className="w-5 h-5 text-blue-500" />
              <p className="text-sm text-blue-600 dark:text-blue-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                Link de Bio - Captação
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1 dark:bg-zinc-800/50 bg-white rounded-xl p-3 border dark:border-zinc-700 border-slate-200">
                <p className="text-xs dark:text-zinc-400 text-slate-500 mb-1">Seu link personalizado</p>
                <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>
                  fitsync.app/{user?.email?.split('@')[0] || 'personal'}
                </p>
              </div>
              <button className="px-4 py-2 rounded-lg text-sm bg-blue-500 text-white hover:bg-blue-600 transition-colors">
                Copiar Link
              </button>
              <div className="grid grid-cols-2 gap-2">
                <div className="dark:bg-zinc-800/50 bg-white rounded-xl p-3 border dark:border-zinc-700 border-slate-200 text-center">
                  <p className="dark:text-white text-slate-900 text-xl" style={{ fontWeight: 700 }}>328</p>
                  <p className="text-xs dark:text-zinc-400 text-slate-500">Cliques</p>
                </div>
                <div className="dark:bg-zinc-800/50 bg-white rounded-xl p-3 border dark:border-zinc-700 border-slate-200 text-center">
                  <p className="text-emerald-500 text-xl" style={{ fontWeight: 700 }}>12.8%</p>
                  <p className="text-xs dark:text-zinc-400 text-slate-500">Conversão</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {students.map((student) => (
              <motion.div
                key={student.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedStudent(student.id)}
                className={`dark:bg-zinc-800/50 bg-slate-50 rounded-2xl p-5 border dark:border-zinc-700 border-slate-200 cursor-pointer hover:border-emerald-500/50 transition-all ${
                  student.status === 'inactive' ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-white text-lg" style={{ fontWeight: 700 }}>
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="dark:text-white text-slate-900 mb-1" style={{ fontWeight: 700 }}>
                        {student.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          student.status === 'active' 
                            ? 'bg-emerald-500/10 text-emerald-500' 
                            : 'bg-red-500/10 text-red-500'
                        }`}>
                          {student.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                        <span className="text-xs dark:text-zinc-400 text-slate-500">{student.frequency}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs dark:text-zinc-400 text-slate-500 mb-1">Adesão</p>
                    <p className={`text-xl ${student.adherence >= 80 ? 'text-emerald-500' : 'text-yellow-500'}`} style={{ fontWeight: 700 }}>
                      {student.adherence}%
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="dark:bg-zinc-900/50 bg-white rounded-xl p-3 border dark:border-zinc-700 border-slate-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Dumbbell className="w-4 h-4 dark:text-zinc-400 text-slate-500" />
                      <p className="text-xs dark:text-zinc-500 text-slate-400">Plano</p>
                    </div>
                    <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>
                      {student.plan}
                    </p>
                  </div>
                  <div className="dark:bg-zinc-900/50 bg-white rounded-xl p-3 border dark:border-zinc-700 border-slate-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="w-4 h-4 dark:text-zinc-400 text-slate-500" />
                      <p className="text-xs dark:text-zinc-500 text-slate-400">Último Treino</p>
                    </div>
                    <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>
                      {student.lastWorkout}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t dark:border-zinc-700 border-slate-200 flex items-center justify-between text-xs dark:text-zinc-400 text-slate-500">
                  <div className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {student.email}
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {student.phone}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // Aluno selecionado - mostra detalhes completos
  return (
    <div className="space-y-6">
      {/* Header com Aluno Selecionado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedStudent(null)}
            className="w-10 h-10 rounded-xl dark:bg-zinc-900 bg-white dark:border-zinc-800 border border-slate-200 flex items-center justify-center dark:text-zinc-400 text-slate-600 hover:text-emerald-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="dark:text-white text-slate-900 text-2xl" style={{ fontWeight: 800 }}>
              {currentStudent?.name}
            </h2>
            <p className="text-sm dark:text-zinc-400 text-slate-500 mt-1">
              {currentStudent?.plan} · Adesão: <span className={currentStudent && currentStudent.adherence >= 80 ? 'text-emerald-500' : 'text-yellow-500'}>{currentStudent?.adherence}%</span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm dark:bg-zinc-800 bg-white dark:border-zinc-700 border border-slate-200 dark:text-zinc-300 text-slate-700 hover:text-emerald-500 transition-colors">
            <Download className="w-4 h-4" />
            Exportar Treinos
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white"
            style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}
          >
            <Send className="w-4 h-4" />
            Enviar Mensagem
          </button>
        </div>
      </div>

      {/* MÓDULO 1: PRESCRIÇÃO DE TREINO */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
              <Dumbbell className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="dark:text-white text-slate-900 text-lg" style={{ fontWeight: 700 }}>
                Prescrição de Treino
              </h3>
              <p className="text-xs dark:text-zinc-500 text-slate-400">
                Biblioteca de exercícios e rotinas periodizadas
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-xl text-sm dark:bg-zinc-800 bg-slate-100 dark:text-zinc-400 text-slate-600 hover:text-emerald-500">
              Importar Treino
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white"
              style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}
            >
              <Plus className="w-4 h-4" />
              Novo Exercício
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Biblioteca de Exercícios */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm dark:text-zinc-300 text-slate-700 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                Biblioteca de Exercícios
              </p>
              <div className="flex gap-2">
                <select className="px-3 py-1.5 rounded-lg text-xs dark:bg-zinc-800 bg-slate-100 dark:text-zinc-400 text-slate-600 dark:border-zinc-700 border border-slate-200">
                  <option>Todos os grupos</option>
                  <option>Peito</option>
                  <option>Costas</option>
                  <option>Pernas</option>
                  <option>Ombros</option>
                  <option>Bíceps</option>
                  <option>Tríceps</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="dark:bg-zinc-800 bg-slate-100 border-b dark:border-zinc-700 border-slate-200">
                    <th className="text-left px-4 py-3 text-xs dark:text-zinc-400 text-slate-600 font-semibold">
                      Exercício
                    </th>
                    <th className="text-left px-4 py-3 text-xs dark:text-zinc-400 text-slate-600 font-semibold">
                      Grupo Muscular
                    </th>
                    <th className="text-left px-4 py-3 text-xs dark:text-zinc-400 text-slate-600 font-semibold">
                      Equipamento
                    </th>
                    <th className="text-center px-4 py-3 text-xs dark:text-zinc-400 text-slate-600 font-semibold">
                      Nível
                    </th>
                    <th className="text-center px-4 py-3 text-xs dark:text-zinc-400 text-slate-600 font-semibold">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {exerciseLibrary.map((exercise, idx) => (
                    <tr
                      key={exercise.name}
                      className={`border-b dark:border-zinc-800 border-slate-100 ${
                        idx % 2 === 0 ? 'dark:bg-zinc-900/50 bg-white' : 'dark:bg-zinc-800/30 bg-slate-50/50'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>
                          {exercise.name}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-1 rounded-full dark:bg-zinc-700 bg-slate-200 dark:text-zinc-300 text-slate-700">
                          {exercise.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm dark:text-zinc-400 text-slate-600">{exercise.equipment}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            exercise.difficulty === 'Iniciante'
                              ? 'bg-green-500/10 text-green-500'
                              : exercise.difficulty === 'Intermediário'
                              ? 'bg-blue-500/10 text-blue-500'
                              : 'bg-purple-500/10 text-purple-500'
                          }`}
                        >
                          {exercise.difficulty}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button className="p-1.5 rounded-lg dark:bg-zinc-700 bg-slate-200 dark:text-zinc-400 text-slate-600 hover:text-blue-500">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 rounded-lg dark:bg-zinc-700 bg-slate-200 dark:text-zinc-400 text-slate-600 hover:text-emerald-500">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Rotinas Periodizadas */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm dark:text-zinc-300 text-slate-700 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                Rotinas Periodizadas
              </p>
              <button className="text-xs text-emerald-500 hover:text-emerald-400">+ Nova</button>
            </div>
            <div className="space-y-3">
              {workoutRoutines.map((routine) => (
                <div
                  key={routine.name}
                  className="dark:bg-zinc-800/50 bg-slate-50 rounded-xl p-4 border dark:border-zinc-700 border-slate-200 hover:border-emerald-500/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <Dumbbell className="w-5 h-5 text-emerald-500" />
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                      {routine.focus}
                    </span>
                  </div>
                  <p className="text-sm dark:text-white text-slate-900 mb-2" style={{ fontWeight: 600 }}>
                    {routine.name}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs dark:text-zinc-400 text-slate-500">
                    <div>
                      <p className="dark:text-zinc-500 text-slate-400">Exercícios</p>
                      <p className="dark:text-zinc-300 text-slate-700" style={{ fontWeight: 600 }}>
                        {routine.exercises}
                      </p>
                    </div>
                    <div>
                      <p className="dark:text-zinc-500 text-slate-400">Duração</p>
                      <p className="dark:text-zinc-300 text-slate-700" style={{ fontWeight: 600 }}>
                        {routine.duration}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t dark:border-zinc-700 border-slate-200">
                    <span className="text-xs dark:text-zinc-400 text-slate-500">
                      Nível: <span className="dark:text-white text-slate-900">{routine.level}</span>
                    </span>
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
                  Organize exercícios por "tags" (ex: unilateral, composto, isolamento) para criar variações 
                  rapidamente. Utilize periodização ondulatória para maximizar ganhos de força e hipertrofia.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* MÓDULO 2: PAINEL DE EVOLUÇÃO */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30">
              <BarChart3 className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h3 className="dark:text-white text-slate-900 text-lg" style={{ fontWeight: 700 }}>
                Painel de Evolução
              </h3>
              <p className="text-xs dark:text-zinc-500 text-slate-400">
                Monitoramento de carga e feedback
              </p>
            </div>
          </div>
          <select className="px-4 py-2 rounded-xl text-sm dark:bg-zinc-800 bg-slate-100 dark:text-zinc-300 text-slate-700 dark:border-zinc-700 border border-slate-200">
            <option>Últimos 30 dias</option>
            <option>Últimos 90 dias</option>
            <option>Último ano</option>
          </select>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Progresso de Carga */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm dark:text-zinc-300 text-slate-700 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                Progressão de Carga - Últimas 4 Semanas
              </p>
              <button className="text-xs text-emerald-500 hover:text-emerald-400 flex items-center gap-1">
                <Download className="w-3 h-3" />
                Exportar
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="dark:bg-zinc-800 bg-slate-100 border-b dark:border-zinc-700 border-slate-200">
                    <th className="text-left px-4 py-3 text-xs dark:text-zinc-400 text-slate-600 font-semibold">
                      Exercício
                    </th>
                    <th className="text-center px-4 py-3 text-xs dark:text-zinc-400 text-slate-600 font-semibold">
                      S1
                    </th>
                    <th className="text-center px-4 py-3 text-xs dark:text-zinc-400 text-slate-600 font-semibold">
                      S2
                    </th>
                    <th className="text-center px-4 py-3 text-xs dark:text-zinc-400 text-slate-600 font-semibold">
                      S3
                    </th>
                    <th className="text-center px-4 py-3 text-xs dark:text-zinc-400 text-slate-600 font-semibold">
                      S4
                    </th>
                    <th className="text-center px-4 py-3 text-xs dark:text-zinc-400 text-slate-600 font-semibold">
                      Evolução
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {progressData.map((data, idx) => {
                    const evolution = ((data.week4 - data.week1) / data.week1) * 100;
                    return (
                      <tr
                        key={data.exercise}
                        className={`border-b dark:border-zinc-800 border-slate-100 ${
                          idx % 2 === 0 ? 'dark:bg-zinc-900/50 bg-white' : 'dark:bg-zinc-800/30 bg-slate-50/50'
                        }`}
                      >
                        <td className="px-4 py-4">
                          <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>
                            {data.exercise}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <p className="text-sm dark:text-zinc-300 text-slate-700">
                            {data.week1}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <p className="text-sm dark:text-zinc-300 text-slate-700">
                            {data.week2}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <p className="text-sm dark:text-zinc-300 text-slate-700">
                            {data.week3}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 700 }}>
                            {data.week4}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500">
                            <TrendingUp className="w-3 h-3" />
                            <span className="text-xs" style={{ fontWeight: 700 }}>
                              +{evolution.toFixed(1)}%
                            </span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Feedbacks Recentes */}
          <div>
            <p className="text-sm dark:text-zinc-300 text-slate-700 uppercase tracking-wider mb-4" style={{ fontWeight: 600 }}>
              Feedbacks por Treino
            </p>
            <div className="space-y-2">
              {[
                { id: 'f1', workout: 'Treino A - Peito', rating: 5, comment: 'Ótimo treino! Senti muito o peito.', date: 'Hoje' },
                { id: 'f2', workout: 'Treino C - Pernas', rating: 4, comment: 'Pernas destruídas, mas consegui completar.', date: 'Ontem' },
                { id: 'f3', workout: 'Treino B - Costas', rating: 3, comment: 'Senti dor lombar no final.', date: 'Há 2 dias' },
              ].map((feedback) => (
                <div
                  key={feedback.id}
                  className="dark:bg-zinc-800/50 bg-slate-50 rounded-xl p-3 border dark:border-zinc-700 border-slate-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>
                        {feedback.workout}
                      </p>
                      <span className="text-xs dark:text-zinc-500 text-slate-400">·</span>
                      <span className="text-xs dark:text-zinc-400 text-slate-500">{feedback.date}</span>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < feedback.rating ? 'text-yellow-500 fill-yellow-500' : 'dark:text-zinc-600 text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm dark:text-zinc-400 text-slate-600">{feedback.comment}</p>
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
                  Monitore progressão de carga semanalmente. Aumentos de 2-5% são ideais para hipertrofia. 
                  Utilize feedbacks pós-treino para identificar ajustes necessários em volume e intensidade.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

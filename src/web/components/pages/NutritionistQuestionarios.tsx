import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft,
  ClipboardCheck,
  Send,
  Plus,
  Search,
  CheckCircle,
  Clock,
  Eye,
  ChevronRight,
  X,
  Zap,
  Moon,
  Activity,
  Utensils,
  Heart,
  Brain,
  User,
  Filter,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface Questionnaire {
  id: string;
  title: string;
  type: 'pre_consulta' | 'saude' | 'alimentar' | 'sono' | 'metabolico' | 'qualidade_vida';
  description: string;
  questions: number;
  estimatedTime: string;
  icon: React.ElementType;
  color: string;
  tags: string[];
}

interface SentQuestionnaire {
  id: string;
  questionnaireId: string;
  patient: string;
  sentAt: string;
  status: 'pending' | 'answered' | 'viewed';
}

const questionnaires: Questionnaire[] = [
  {
    id: 'q1',
    title: 'Rastreamento Metabólico',
    type: 'metabolico',
    description: 'Identifica disfunções metabólicas e sintomas associados ao metabolismo basal',
    questions: 28,
    estimatedTime: '10 min',
    icon: Zap,
    color: '#f59e0b',
    tags: ['Metabolismo', 'Sintomas'],
  },
  {
    id: 'q2',
    title: 'Padrão Alimentar Habitual',
    type: 'alimentar',
    description: 'Avalia os hábitos alimentares, preferências, horários e frequência das refeições',
    questions: 35,
    estimatedTime: '15 min',
    icon: Utensils,
    color: '#10b981',
    tags: ['Alimentação', 'Hábitos'],
  },
  {
    id: 'q3',
    title: 'Qualidade do Sono',
    type: 'sono',
    description: 'Índice de Qualidade do Sono de Pittsburgh (PSQI) adaptado para nutrição',
    questions: 19,
    estimatedTime: '8 min',
    icon: Moon,
    color: '#8b5cf6',
    tags: ['Sono', 'PSQI'],
  },
  {
    id: 'q4',
    title: 'Pré-Consulta Completo',
    type: 'pre_consulta',
    description: 'Coleta de dados antes da consulta para otimizar o tempo com o paciente',
    questions: 42,
    estimatedTime: '20 min',
    icon: ClipboardCheck,
    color: '#3b82f6',
    tags: ['Pré-consulta', 'Anamnese'],
  },
  {
    id: 'q5',
    title: 'Saúde Mental e Comportamento Alimentar',
    type: 'saude',
    description: 'Avalia aspectos emocionais relacionados à alimentação, compulsão e restrições',
    questions: 24,
    estimatedTime: '12 min',
    icon: Brain,
    color: '#ec4899',
    tags: ['Mental', 'Comportamento'],
  },
  {
    id: 'q6',
    title: 'Qualidade de Vida (SF-36)',
    type: 'qualidade_vida',
    description: 'Questionário SF-36 adaptado para acompanhamento nutricional longitudinal',
    questions: 36,
    estimatedTime: '15 min',
    icon: Heart,
    color: '#ef4444',
    tags: ['Qualidade de Vida', 'SF-36'],
  },
  {
    id: 'q7',
    title: 'Atividade Física e Estilo de Vida',
    type: 'saude',
    description: 'IPAQ curto + perguntas sobre rotina, sedentarismo e nível de estresse',
    questions: 22,
    estimatedTime: '10 min',
    icon: Activity,
    color: '#06b6d4',
    tags: ['Atividade Física', 'IPAQ'],
  },
  {
    id: 'q8',
    title: 'Sintomas Gastrointestinais',
    type: 'saude',
    description: 'Mapeia distúrbios do TGI, intolerâncias e hábito intestinal',
    questions: 18,
    estimatedTime: '7 min',
    icon: User,
    color: '#14b8a6',
    tags: ['TGI', 'Intestino'],
  },
];

const sentQuestionnaires: SentQuestionnaire[] = [
  { id: 's1', questionnaireId: 'q4', patient: 'Ana Costa', sentAt: '08/03/2025', status: 'answered' },
  { id: 's2', questionnaireId: 'q1', patient: 'Roberto Lima', sentAt: '07/03/2025', status: 'pending' },
  { id: 's3', questionnaireId: 'q3', patient: 'Ana Costa', sentAt: '05/03/2025', status: 'viewed' },
  { id: 's4', questionnaireId: 'q2', patient: 'Carlos Souza', sentAt: '04/03/2025', status: 'answered' },
];

const typeLabels = {
  pre_consulta: 'Pré-consulta',
  saude: 'Saúde',
  alimentar: 'Alimentar',
  sono: 'Sono',
  metabolico: 'Metabólico',
  qualidade_vida: 'Qualidade de Vida',
};

export function NutritionistQuestionarios() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'library' | 'sent'>('library');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showSendModal, setShowSendModal] = useState<Questionnaire | null>(null);
  const [sendTo, setSendTo] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState<Questionnaire | null>(null);

  const filtered = questionnaires.filter((q) => {
    const matchSearch = q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = selectedType === 'all' || q.type === selectedType;
    return matchSearch && matchType;
  });

  const statusConfig = {
    answered: { label: 'Respondido', color: '#10b981' },
    pending: { label: 'Aguardando', color: '#f59e0b' },
    viewed: { label: 'Visualizado', color: '#3b82f6' },
  };

  const patients = ['Ana Costa', 'Roberto Lima', 'Carlos Souza', 'Fernanda Lima'];

  return (
    <div className="p-4 lg:p-8 max-w-[1200px] mx-auto">
      <button
        onClick={() => navigate('/nutritionist')}
        className="flex items-center gap-2 text-sm dark:text-zinc-400 text-slate-500 hover:dark:text-white hover:text-slate-900 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar ao Dashboard
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)' }}>
              <ClipboardCheck className="w-5 h-5 text-white" />
            </div>
            <h1 className="dark:text-white text-slate-900">Questionários</h1>
          </div>
          <p className="text-sm dark:text-zinc-400 text-slate-500">
            Questionários de saúde, pré-consulta e rastreamento para seus pacientes
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', boxShadow: '0 8px 20px rgba(59,130,246,0.3)', fontWeight: 600 }}
        >
          <Plus className="w-4 h-4" />
          Criar Questionário
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Questionários Disponíveis', value: questionnaires.length, icon: ClipboardCheck, color: '#3b82f6' },
          { label: 'Enviados este Mês', value: sentQuestionnaires.length, icon: Send, color: '#10b981' },
          { label: 'Respondidos', value: sentQuestionnaires.filter(s => s.status === 'answered').length, icon: CheckCircle, color: '#10b981' },
          { label: 'Aguardando Resposta', value: sentQuestionnaires.filter(s => s.status === 'pending').length, icon: Clock, color: '#f59e0b' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="dark:bg-zinc-900 bg-white rounded-3xl p-5 dark:border-zinc-800 border border-slate-200">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${color}20` }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <p className="dark:text-white text-slate-900 text-2xl mb-1" style={{ fontWeight: 800 }}>{value}</p>
            <p className="text-xs dark:text-zinc-500 text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="dark:bg-zinc-900 bg-white rounded-2xl p-1 mb-6 inline-flex dark:border-zinc-800 border border-slate-200">
        {[
          { id: 'library', label: 'Biblioteca de Questionários', icon: ClipboardCheck },
          { id: 'sent', label: 'Enviados', icon: Send },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all ${activeTab === id ? 'text-white shadow-lg' : 'dark:text-zinc-400 text-slate-600'}`}
            style={activeTab === id ? { background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', fontWeight: 600 } : {}}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'library' && (
        <>
          {/* Search & filter */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-500 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar questionários..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm dark:bg-zinc-900 bg-white dark:border-zinc-800 border border-slate-200 dark:text-zinc-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedType('all')}
                className={`px-3 py-2 rounded-xl text-xs transition-all ${selectedType === 'all' ? 'text-white' : 'dark:bg-zinc-900 bg-white dark:border-zinc-800 border border-slate-200 dark:text-zinc-400 text-slate-600'}`}
                style={selectedType === 'all' ? { background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', fontWeight: 600 } : {}}
              >
                Todos
              </button>
              {Object.entries(typeLabels).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSelectedType(key)}
                  className={`px-3 py-2 rounded-xl text-xs transition-all ${selectedType === key ? 'text-white' : 'dark:bg-zinc-900 bg-white dark:border-zinc-800 border border-slate-200 dark:text-zinc-400 text-slate-600'}`}
                  style={selectedType === key ? { background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', fontWeight: 600 } : {}}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map((q) => {
              const Icon = q.icon;
              return (
                <div
                  key={q.id}
                  className="dark:bg-zinc-900 bg-white rounded-3xl p-5 dark:border-zinc-800 border border-slate-200 hover:dark:border-zinc-600 hover:border-slate-300 transition-all"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${q.color}20` }}>
                      <Icon className="w-6 h-6" style={{ color: q.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>{q.title}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${q.color}20`, color: q.color, fontWeight: 600 }}>
                          {typeLabels[q.type]}
                        </span>
                      </div>
                      <p className="text-xs dark:text-zinc-500 text-slate-400 leading-relaxed">{q.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs dark:text-zinc-500 text-slate-400 mb-4">
                    <span className="flex items-center gap-1"><ClipboardCheck className="w-3 h-3" /> {q.questions} perguntas</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {q.estimatedTime}</span>
                    <div className="flex gap-1 flex-1 flex-wrap">
                      {q.tags.map(tag => (
                        <span key={tag} className="px-1.5 py-0.5 rounded-md dark:bg-zinc-800 bg-slate-100">{tag}</span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowPreviewModal(q)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs border dark:border-zinc-700 border-slate-200 dark:text-zinc-400 text-slate-600 hover:dark:border-blue-500 hover:dark:text-blue-400 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" /> Pré-visualizar
                    </button>
                    <button
                      onClick={() => setShowSendModal(q)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs text-white transition-all hover:opacity-90"
                      style={{ background: `linear-gradient(135deg,${q.color},${q.color}cc)`, fontWeight: 600 }}
                    >
                      <Send className="w-3.5 h-3.5" /> Enviar ao Paciente
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {activeTab === 'sent' && (
        <div className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200">
          <h3 className="dark:text-white text-slate-900 mb-5">Questionários Enviados</h3>
          <div className="space-y-3">
            {sentQuestionnaires.map((sent) => {
              const q = questionnaires.find(x => x.id === sent.questionnaireId);
              if (!q) return null;
              const Icon = q.icon;
              const sc = statusConfig[sent.status];
              return (
                <div key={sent.id} className="flex items-center gap-4 p-4 rounded-2xl dark:bg-zinc-800/50 bg-slate-50 border dark:border-zinc-700 border-slate-200">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${q.color}20` }}>
                    <Icon className="w-5 h-5" style={{ color: q.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>{q.title}</p>
                    <p className="text-xs dark:text-zinc-500 text-slate-400">{sent.patient} · Enviado em {sent.sentAt}</p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full flex-shrink-0" style={{ backgroundColor: `${sc.color}20`, color: sc.color, fontWeight: 600 }}>
                    {sc.label}
                  </span>
                  {sent.status === 'answered' && (
                    <button className="p-2 rounded-xl dark:bg-zinc-700 bg-slate-100 flex-shrink-0">
                      <Eye className="w-4 h-4 dark:text-zinc-400 text-slate-500" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Send Modal */}
      <AnimatePresence>
        {showSendModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="dark:text-white text-slate-900">Enviar Questionário</h3>
                <button onClick={() => setShowSendModal(null)} className="p-2 rounded-xl dark:hover:bg-zinc-800 hover:bg-slate-100 transition-colors">
                  <X className="w-4 h-4 dark:text-zinc-400 text-slate-500" />
                </button>
              </div>

              <div className="dark:bg-zinc-800/50 bg-slate-50 rounded-2xl p-4 border dark:border-zinc-700 border-slate-200 mb-5">
                <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>{showSendModal.title}</p>
                <p className="text-xs dark:text-zinc-500 text-slate-400">{showSendModal.questions} perguntas · {showSendModal.estimatedTime}</p>
              </div>

              <div className="mb-4">
                <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-2" style={{ fontWeight: 500 }}>Selecionar Paciente</label>
                <select
                  value={sendTo}
                  onChange={(e) => setSendTo(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 dark:border-zinc-700 border border-slate-200 dark:text-zinc-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                  <option value="">Selecione um paciente...</option>
                  {patients.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div className="mb-5">
                <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-2" style={{ fontWeight: 500 }}>Mensagem (opcional)</label>
                <textarea
                  rows={3}
                  placeholder="Ex: Olá! Por favor, responda este questionário antes da nossa próxima consulta."
                  className="w-full px-4 py-3 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 dark:border-zinc-700 border border-slate-200 dark:text-zinc-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowSendModal(null)} className="flex-1 py-3 rounded-xl text-sm border dark:border-zinc-700 border-slate-300 dark:text-zinc-300 text-slate-700">
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (!sendTo) { toast.error('Selecione um paciente'); return; }
                    toast.success(`Questionário enviado para ${sendTo}!`);
                    setShowSendModal(null);
                    setSendTo('');
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm text-white hover:opacity-90 transition-all"
                  style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', fontWeight: 600 }}
                >
                  <Send className="w-4 h-4" />
                  Enviar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
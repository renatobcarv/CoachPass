import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, ClipboardCheck, Plus, Send, CheckCircle, Clock, Users, Eye, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

const students = [
  { id: '1', name: 'Lucas Silva', avatar: 'https://ui-avatars.com/api/?name=Lucas+Silva&background=10b981&color=fff' },
  { id: '2', name: 'Maria Santos', avatar: 'https://ui-avatars.com/api/?name=Maria+Santos&background=3b82f6&color=fff' },
  { id: '3', name: 'Carlos Ramos', avatar: 'https://ui-avatars.com/api/?name=Carlos+Ramos&background=f59e0b&color=fff' },
  { id: '4', name: 'Ana Oliveira', avatar: 'https://ui-avatars.com/api/?name=Ana+Oliveira&background=8b5cf6&color=fff' },
];

const templates = [
  { id: 'parq', title: 'PAR-Q', description: 'Prontidão para Atividade Física', icon: '🩺', color: '#3b82f6', questions: 7 },
  { id: 'anamnese', title: 'Anamnese Completa', description: 'Histórico de saúde e hábitos', icon: '📋', color: '#10b981', questions: 24 },
  { id: 'pretreino', title: 'Pré-Treino', description: 'Check de disposição e recuperação', icon: '⚡', color: '#f59e0b', questions: 8 },
  { id: 'satisfacao', title: 'Satisfação', description: 'Avaliação do serviço', icon: '⭐', color: '#8b5cf6', questions: 10 },
  { id: 'objetivos', title: 'Objetivos e Metas', description: 'Levantamento de expectativas', icon: '🎯', color: '#ef4444', questions: 12 },
  { id: 'lesoes', title: 'Histórico de Lesões', description: 'Registro de lesões e limitações', icon: '🩹', color: '#f97316', questions: 15 },
];

interface Sent {
  id: string;
  templateId: string;
  templateTitle: string;
  studentName: string;
  studentAvatar: string;
  sentAt: string;
  status: 'pending' | 'answered';
  answers?: Record<string, string>;
}

const mockSent: Sent[] = [
  { id: '1', templateId: 'parq', templateTitle: 'PAR-Q', studentName: 'Lucas Silva', studentAvatar: 'https://ui-avatars.com/api/?name=Lucas+Silva&background=10b981&color=fff', sentAt: '2025-03-01', status: 'answered', answers: { q1: 'Não', q2: 'Não', q3: 'Não', q4: 'Não', q5: 'Não', q6: 'Não', q7: 'Não' } },
  { id: '2', templateId: 'anamnese', templateTitle: 'Anamnese Completa', studentName: 'Maria Santos', studentAvatar: 'https://ui-avatars.com/api/?name=Maria+Santos&background=3b82f6&color=fff', sentAt: '2025-03-05', status: 'pending' },
  { id: '3', templateId: 'pretreino', templateTitle: 'Pré-Treino', studentName: 'Carlos Ramos', studentAvatar: 'https://ui-avatars.com/api/?name=Carlos+Ramos&background=f59e0b&color=fff', sentAt: '2025-03-10', status: 'answered' },
];

export function PersonalQuestionarios() {
  const navigate = useNavigate();
  const [sent, setSent] = useState<Sent[]>(mockSent);
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [viewResponse, setViewResponse] = useState<Sent | null>(null);
  const [activeTab, setActiveTab] = useState<'templates' | 'sent'>('templates');

  const toggleStudent = (id: string) =>
    setSelectedStudents(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);

  const handleSend = () => {
    if (!selectedTemplate || selectedStudents.length === 0) {
      toast.error('Selecione o questionário e ao menos um aluno');
      return;
    }
    const tmpl = templates.find(t => t.id === selectedTemplate)!;
    const newItems: Sent[] = selectedStudents.map(sid => {
      const student = students.find(s => s.id === sid)!;
      return {
        id: Date.now().toString() + sid,
        templateId: selectedTemplate,
        templateTitle: tmpl.title,
        studentName: student.name,
        studentAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=10b981&color=fff`,
        sentAt: new Date().toISOString().split('T')[0],
        status: 'pending',
      };
    });
    setSent(prev => [...newItems, ...prev]);
    setShowSendModal(false);
    setSelectedTemplate('');
    setSelectedStudents([]);
    toast.success(`Questionário enviado para ${newItems.length} aluno(s)!`);
    setActiveTab('sent');
  };

  const answeredCount = sent.filter(s => s.status === 'answered').length;
  const pendingCount = sent.filter(s => s.status === 'pending').length;

  return (
    <div className="p-4 lg:p-8 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <button onClick={() => navigate('/personal')} className="flex items-center gap-2 text-sm dark:text-zinc-400 text-slate-500 hover:dark:text-white hover:text-slate-900 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="dark:text-white text-slate-900 mb-1">Questionários</h1>
            <p className="text-sm dark:text-zinc-400 text-slate-500">PAR-Q, anamnese, pré-treino e avaliações de satisfação</p>
          </div>
          <button onClick={() => setShowSendModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white"
            style={{ background: 'linear-gradient(135deg,#ec4899,#be185d)', fontWeight: 600 }}>
            <Send className="w-4 h-4" /> Enviar Questionário
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Modelos', value: templates.length, color: '#ec4899' },
          { label: 'Respondidos', value: answeredCount, color: '#10b981' },
          { label: 'Pendentes', value: pendingCount, color: '#f59e0b' },
        ].map(({ label, value, color }) => (
          <div key={label} className="dark:bg-zinc-900 bg-white rounded-3xl p-5 border dark:border-zinc-800 border-slate-200">
            <p className="text-2xl mb-0.5" style={{ fontWeight: 800, color }}>{value}</p>
            <p className="text-xs dark:text-zinc-500 text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="dark:bg-zinc-900 bg-white rounded-2xl p-1 mb-6 inline-flex border dark:border-zinc-800 border-slate-200">
        {[{ id: 'templates', label: 'Modelos' }, { id: 'sent', label: 'Enviados' }].map(({ id, label }) => (
          <button key={id} onClick={() => setActiveTab(id as any)}
            className={`px-4 py-2.5 rounded-xl text-sm transition-all ${activeTab === id ? 'text-white shadow-lg' : 'dark:text-zinc-400 text-slate-600 hover:dark:text-white'}`}
            style={activeTab === id ? { background: 'linear-gradient(135deg,#ec4899,#be185d)', fontWeight: 600 } : {}}>
            {label}
          </button>
        ))}
      </div>

      {/* Templates grid */}
      {activeTab === 'templates' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates.map(tmpl => (
            <motion.div key={tmpl.id} whileHover={{ y: -2 }}
              className="dark:bg-zinc-900 bg-white rounded-3xl border dark:border-zinc-800 border-slate-200 p-5 cursor-pointer transition-all hover:dark:border-zinc-600">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ backgroundColor: `${tmpl.color}15` }}>
                  {tmpl.icon}
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full dark:bg-zinc-800 bg-slate-100 dark:text-zinc-400 text-slate-600" style={{ fontWeight: 600 }}>
                  {tmpl.questions} perguntas
                </span>
              </div>
              <h4 className="text-sm dark:text-white text-slate-900 mb-1" style={{ fontWeight: 700 }}>{tmpl.title}</h4>
              <p className="text-xs dark:text-zinc-500 text-slate-400 mb-4 leading-relaxed">{tmpl.description}</p>
              <div className="flex gap-2">
                <button onClick={() => { setSelectedTemplate(tmpl.id); setShowSendModal(true); }}
                  className="flex-1 py-2 rounded-xl text-xs text-white flex items-center justify-center gap-1.5"
                  style={{ backgroundColor: tmpl.color, fontWeight: 600 }}>
                  <Send className="w-3.5 h-3.5" /> Enviar
                </button>
                <button onClick={() => toast.success('Visualizando modelo...')}
                  className="px-3 py-2 rounded-xl text-xs border dark:border-zinc-700 border-slate-300 dark:text-zinc-400 text-slate-600 hover:dark:border-zinc-500 transition-all">
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Sent list */}
      {activeTab === 'sent' && (
        <div className="space-y-3">
          {sent.map(item => (
            <div key={item.id} className="dark:bg-zinc-900 bg-white rounded-2xl border dark:border-zinc-800 border-slate-200 p-4 flex items-center gap-4">
              <img src={item.studentAvatar} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" alt={item.studentName} />
              <div className="flex-1 min-w-0">
                <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>{item.templateTitle}</p>
                <p className="text-xs dark:text-zinc-500 text-slate-400">{item.studentName} · Enviado em {new Date(item.sentAt + 'T12:00').toLocaleDateString('pt-BR')}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${item.status === 'answered' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`} style={{ fontWeight: 600 }}>
                {item.status === 'answered' ? '✓ Respondido' : '⏳ Pendente'}
              </span>
              {item.status === 'answered' && (
                <button onClick={() => setViewResponse(item)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border dark:border-zinc-700 border-slate-300 dark:text-zinc-400 text-slate-600 hover:dark:border-pink-500 hover:dark:text-pink-400 transition-all flex-shrink-0" style={{ fontWeight: 600 }}>
                  <Eye className="w-3 h-3" /> Ver
                </button>
              )}
            </div>
          ))}
          {sent.length === 0 && (
            <div className="text-center py-16 dark:text-zinc-600 text-slate-400">
              <ClipboardCheck className="w-14 h-14 mx-auto mb-4 opacity-30" />
              <p className="text-sm">Nenhum questionário enviado ainda</p>
            </div>
          )}
        </div>
      )}

      {/* Send Modal */}
      <AnimatePresence>
        {showSendModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSendModal(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative dark:bg-zinc-900 bg-white rounded-3xl border dark:border-zinc-800 border-slate-200 p-6 w-full max-w-md z-10 shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="dark:text-white text-slate-900" style={{ fontWeight: 700 }}>Enviar Questionário</h3>
                <button onClick={() => setShowSendModal(false)} className="w-8 h-8 rounded-xl dark:bg-zinc-800 bg-slate-100 flex items-center justify-center dark:text-zinc-400 text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-2">Questionário</label>
                  <div className="grid grid-cols-2 gap-2">
                    {templates.map(t => (
                      <button key={t.id} onClick={() => setSelectedTemplate(t.id)}
                        className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all text-xs ${selectedTemplate === t.id ? 'border-transparent text-white' : 'dark:border-zinc-700 border-slate-200 dark:text-zinc-400 text-slate-600'}`}
                        style={selectedTemplate === t.id ? { backgroundColor: t.color, fontWeight: 600 } : {}}>
                        <span>{t.icon}</span>{t.title}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-2">Alunos ({selectedStudents.length} selecionados)</label>
                  <div className="space-y-2">
                    {students.map(s => (
                      <button key={s.id} onClick={() => toggleStudent(s.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${selectedStudents.includes(s.id) ? 'border-pink-500/50' : 'dark:border-zinc-700 border-slate-200'}`}
                        style={selectedStudents.includes(s.id) ? { background: 'rgba(236,72,153,0.08)' } : {}}>
                        <img src={s.avatar} className="w-8 h-8 rounded-lg" alt={s.name} />
                        <span className="text-sm dark:text-white text-slate-900 flex-1 text-left" style={{ fontWeight: 500 }}>{s.name}</span>
                        {selectedStudents.includes(s.id) && <CheckCircle className="w-4 h-4 text-pink-400" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowSendModal(false)} className="flex-1 py-3 rounded-xl border dark:border-zinc-700 border-slate-300 dark:text-zinc-300 text-slate-700 text-sm">Cancelar</button>
                <button onClick={handleSend}
                  className="flex-1 py-3 rounded-xl text-white text-sm flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg,#ec4899,#be185d)', fontWeight: 600 }}>
                  <Send className="w-4 h-4" /> Enviar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Responses Modal */}
      <AnimatePresence>
        {viewResponse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setViewResponse(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative dark:bg-zinc-900 bg-white rounded-3xl border dark:border-zinc-800 border-slate-200 p-6 w-full max-w-sm z-10 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="dark:text-white text-slate-900 text-sm" style={{ fontWeight: 700 }}>{viewResponse.templateTitle}</h3>
                  <p className="text-xs dark:text-zinc-500 text-slate-400">{viewResponse.studentName}</p>
                </div>
                <button onClick={() => setViewResponse(null)} className="w-8 h-8 rounded-xl dark:bg-zinc-800 bg-slate-100 flex items-center justify-center dark:text-zinc-400 text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {viewResponse.answers ? (
                <div className="space-y-2">
                  {Object.entries(viewResponse.answers).map(([q, a]) => (
                    <div key={q} className="flex items-center justify-between py-2 border-b dark:border-zinc-800 border-slate-100 last:border-0">
                      <span className="text-xs dark:text-zinc-500 text-slate-400">Pergunta {q.replace('q', '')}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${a === 'Sim' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`} style={{ fontWeight: 600 }}>{a}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm dark:text-zinc-500 text-slate-400 text-center py-4">Sem respostas disponíveis</p>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

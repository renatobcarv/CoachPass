import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft, Calendar, Plus, X, Clock, Users, Check,
  ChevronLeft, ChevronRight, Video, MapPin, Repeat,
  MoreVertical, CheckCircle, XCircle, AlertCircle, Search,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface Session {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  date: string;
  time: string;
  duration: number;
  type: 'presencial' | 'online' | 'avaliacao';
  location: string;
  plan: string;
  status: 'scheduled' | 'done' | 'cancelled' | 'missed';
  notes: string;
  recurring: boolean;
}

const students = [
  { id: '1', name: 'Lucas Silva', avatar: 'https://ui-avatars.com/api/?name=Lucas+Silva&background=10b981&color=fff' },
  { id: '2', name: 'Maria Santos', avatar: 'https://ui-avatars.com/api/?name=Maria+Santos&background=3b82f6&color=fff' },
  { id: '3', name: 'Carlos Ramos', avatar: 'https://ui-avatars.com/api/?name=Carlos+Ramos&background=f59e0b&color=fff' },
  { id: '4', name: 'Ana Oliveira', avatar: 'https://ui-avatars.com/api/?name=Ana+Oliveira&background=8b5cf6&color=fff' },
];

const today = new Date();
const fmt = (d: Date) => d.toISOString().split('T')[0];

const mockSessions: Session[] = [
  { id: '1', studentId: '2', studentName: 'Maria Santos', studentAvatar: 'https://ui-avatars.com/api/?name=Maria+Santos&background=3b82f6&color=fff', date: fmt(today), time: '19:00', duration: 60, type: 'presencial', location: 'Academia CoachPass', plan: 'Funcional', status: 'scheduled', notes: '', recurring: true },
  { id: '2', studentId: '1', studentName: 'Lucas Silva', studentAvatar: 'https://ui-avatars.com/api/?name=Lucas+Silva&background=10b981&color=fff', date: fmt(today), time: '14:30', duration: 60, type: 'presencial', location: 'Academia CoachPass', plan: 'Push/Pull/Legs', status: 'done', notes: 'Treino concluído com bom desempenho.', recurring: false },
  { id: '3', studentId: '3', studentName: 'Carlos Ramos', studentAvatar: 'https://ui-avatars.com/api/?name=Carlos+Ramos&background=f59e0b&color=fff', date: fmt(today), time: '08:00', duration: 45, type: 'presencial', location: 'Academia CoachPass', plan: 'HIIT', status: 'done', notes: '', recurring: true },
  { id: '4', studentId: '4', studentName: 'Ana Oliveira', studentAvatar: 'https://ui-avatars.com/api/?name=Ana+Oliveira&background=8b5cf6&color=fff', date: fmt(new Date(today.getTime() + 86400000)), time: '10:00', duration: 60, type: 'presencial', location: 'Academia CoachPass', plan: 'Mobilidade', status: 'scheduled', notes: '', recurring: false },
  { id: '5', studentId: '1', studentName: 'Lucas Silva', studentAvatar: 'https://ui-avatars.com/api/?name=Lucas+Silva&background=10b981&color=fff', date: fmt(new Date(today.getTime() + 86400000)), time: '07:00', duration: 60, type: 'presencial', location: 'Academia CoachPass', plan: 'Pull B', status: 'scheduled', notes: '', recurring: true },
  { id: '6', studentId: '2', studentName: 'Maria Santos', studentAvatar: 'https://ui-avatars.com/api/?name=Maria+Santos&background=3b82f6&color=fff', date: fmt(new Date(today.getTime() + 172800000)), time: '19:00', duration: 60, type: 'online', location: 'Google Meet', plan: 'Cardio', status: 'scheduled', notes: '', recurring: true },
];

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = Array(firstDay).fill(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);
  return days;
}

const statusConfig = {
  scheduled: { label: 'Agendado', color: '#3b82f6', bg: 'bg-blue-500/10', text: 'text-blue-400', icon: Clock },
  done: { label: 'Concluído', color: '#10b981', bg: 'bg-emerald-500/10', text: 'text-emerald-400', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: '#ef4444', bg: 'bg-red-500/10', text: 'text-red-400', icon: XCircle },
  missed: { label: 'Faltou', color: '#f59e0b', bg: 'bg-amber-500/10', text: 'text-amber-400', icon: AlertCircle },
};

const typeConfig = {
  presencial: { label: 'Presencial', icon: MapPin, color: '#10b981' },
  online: { label: 'Online', icon: Video, color: '#3b82f6' },
  avaliacao: { label: 'Avaliação', icon: Users, color: '#8b5cf6' },
};

export function PersonalAgenda() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>(mockSessions);
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'list'>('week');
  const [selectedDate, setSelectedDate] = useState(fmt(today));
  const [calMonth, setCalMonth] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [form, setForm] = useState({
    studentId: '', date: fmt(today), time: '08:00', duration: '60',
    type: 'presencial', location: 'Academia CoachPass', plan: '', notes: '', recurring: false,
  });

  // Build week around selectedDate
  const selDt = new Date(selectedDate + 'T12:00:00');
  const weekStart = new Date(selDt);
  weekStart.setDate(selDt.getDate() - selDt.getDay());
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return fmt(d);
  });

  const sessionsByDate = (date: string) => sessions.filter(s => s.date === date);

  const handleAdd = () => {
    if (!form.studentId) { toast.error('Selecione o aluno'); return; }
    const student = students.find(s => s.id === form.studentId)!;
    const newS: Session = {
      id: Date.now().toString(), studentId: form.studentId, studentName: student.name,
      studentAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=10b981&color=fff`,
      date: form.date, time: form.time, duration: Number(form.duration),
      type: form.type as any, location: form.location, plan: form.plan,
      status: 'scheduled', notes: form.notes, recurring: form.recurring,
    };
    setSessions(prev => [...prev, newS]);
    setShowModal(false);
    toast.success('Sessão agendada!');
  };

  const updateStatus = (id: string, status: Session['status']) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    toast.success(`Sessão marcada como ${statusConfig[status].label}`);
  };

  const filtered = sessions.filter(s => {
    const matchSearch = s.studentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || s.status === filterStatus;
    return matchSearch && matchStatus;
  }).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

  const monthDays = getMonthDays(calMonth.year, calMonth.month);

  return (
    <div className="p-4 lg:p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button onClick={() => navigate('/personal')} className="flex items-center gap-2 text-sm dark:text-zinc-400 text-slate-500 hover:dark:text-white hover:text-slate-900 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="dark:text-white text-slate-900 mb-1">Agenda & Sessões</h1>
            <p className="text-sm dark:text-zinc-400 text-slate-500">Gerencie seus horários e acompanhe o progresso</p>
          </div>
          <div className="flex gap-3">
            {/* View mode */}
            <div className="flex dark:bg-zinc-900 bg-white rounded-xl p-1 border dark:border-zinc-800 border-slate-200">
              {(['week', 'month', 'list'] as const).map(mode => (
                <button key={mode} onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all capitalize ${viewMode === mode ? 'text-white' : 'dark:text-zinc-400 text-slate-600 hover:dark:text-white'}`}
                  style={viewMode === mode ? { background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', fontWeight: 600 } : {}}>
                  {mode === 'week' ? 'Semana' : mode === 'month' ? 'Mês' : 'Lista'}
                </button>
              ))}
            </div>
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', fontWeight: 600 }}>
              <Plus className="w-4 h-4" /> Agendar Sessão
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Sessões Hoje', value: sessionsByDate(fmt(today)).length, color: '#3b82f6' },
          { label: 'Agendadas', value: sessions.filter(s => s.status === 'scheduled').length, color: '#8b5cf6' },
          { label: 'Concluídas Mês', value: sessions.filter(s => s.status === 'done').length, color: '#10b981' },
          { label: 'Taxa Presença', value: `${Math.round((sessions.filter(s => s.status === 'done').length / Math.max(1, sessions.filter(s => s.status !== 'scheduled').length)) * 100)}%`, color: '#f59e0b' },
        ].map(({ label, value, color }) => (
          <div key={label} className="dark:bg-zinc-900 bg-white rounded-2xl p-4 border dark:border-zinc-800 border-slate-200">
            <p className="text-2xl mb-0.5" style={{ fontWeight: 800, color }}>{value}</p>
            <p className="text-xs dark:text-zinc-500 text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Week View */}
      {viewMode === 'week' && (
        <div className="dark:bg-zinc-900 bg-white rounded-3xl border dark:border-zinc-800 border-slate-200 overflow-hidden">
          {/* Week nav */}
          <div className="flex items-center justify-between p-5 border-b dark:border-zinc-800 border-slate-200">
            <button onClick={() => { const d = new Date(selDt); d.setDate(d.getDate() - 7); setSelectedDate(fmt(d)); }}
              className="w-8 h-8 rounded-lg dark:bg-zinc-800 bg-slate-100 flex items-center justify-center dark:text-zinc-400 text-slate-600 hover:dark:bg-zinc-700 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 700 }}>
              {new Date(weekDays[0] + 'T12:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })} –{' '}
              {new Date(weekDays[6] + 'T12:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <button onClick={() => { const d = new Date(selDt); d.setDate(d.getDate() + 7); setSelectedDate(fmt(d)); }}
              className="w-8 h-8 rounded-lg dark:bg-zinc-800 bg-slate-100 flex items-center justify-center dark:text-zinc-400 text-slate-600 hover:dark:bg-zinc-700 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7">
            {weekDays.map((date, i) => {
              const daySessions = sessionsByDate(date);
              const isToday = date === fmt(today);
              const dt = new Date(date + 'T12:00');
              return (
                <div key={date} className={`border-r last:border-r-0 dark:border-zinc-800 border-slate-200 min-h-[200px] ${isToday ? 'dark:bg-blue-500/5 bg-blue-50' : ''}`}>
                  {/* Day header */}
                  <div className={`p-3 border-b dark:border-zinc-800 border-slate-200 text-center ${isToday ? 'dark:border-blue-500/20' : ''}`}>
                    <p className="text-xs dark:text-zinc-500 text-slate-400 uppercase">{DAYS_OF_WEEK[i]}</p>
                    <div className={`w-7 h-7 rounded-full mx-auto mt-1 flex items-center justify-center text-sm ${isToday ? 'bg-blue-500 text-white' : 'dark:text-zinc-300 text-slate-700'}`} style={{ fontWeight: isToday ? 700 : 400 }}>
                      {dt.getDate()}
                    </div>
                  </div>
                  {/* Sessions */}
                  <div className="p-2 space-y-1.5">
                    {daySessions.map(s => {
                      const TypeIcon = typeConfig[s.type].icon;
                      return (
                        <div key={s.id} className={`p-2 rounded-xl text-xs ${statusConfig[s.status].bg} border ${s.status === 'done' ? 'border-emerald-500/20' : s.status === 'scheduled' ? 'border-blue-500/20' : 'border-zinc-700'}`}>
                          <div className="flex items-center gap-1 mb-0.5">
                            <TypeIcon className="w-2.5 h-2.5" style={{ color: typeConfig[s.type].color }} />
                            <span style={{ fontWeight: 700, color: statusConfig[s.status].color }}>{s.time}</span>
                          </div>
                          <p className="dark:text-zinc-300 text-slate-700 truncate" style={{ fontWeight: 500 }}>{s.studentName.split(' ')[0]}</p>
                          <p className="dark:text-zinc-500 text-slate-400 truncate">{s.plan}</p>
                        </div>
                      );
                    })}
                    <button onClick={() => { setForm(f => ({ ...f, date })); setShowModal(true); }}
                      className="w-full flex items-center justify-center gap-1 py-1 rounded-lg text-xs dark:text-zinc-700 text-slate-300 hover:dark:text-zinc-500 hover:text-slate-400 transition-colors border dark:border-dashed dark:border-zinc-800 border-dashed border-slate-200 hover:dark:border-zinc-600">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Month View */}
      {viewMode === 'month' && (
        <div className="dark:bg-zinc-900 bg-white rounded-3xl border dark:border-zinc-800 border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b dark:border-zinc-800 border-slate-200">
            <button onClick={() => setCalMonth(m => { const d = new Date(m.year, m.month - 1); return { year: d.getFullYear(), month: d.getMonth() }; })}
              className="w-8 h-8 rounded-lg dark:bg-zinc-800 bg-slate-100 flex items-center justify-center dark:text-zinc-400 text-slate-600 hover:dark:bg-zinc-700 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 700 }}>
              {new Date(calMonth.year, calMonth.month).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </p>
            <button onClick={() => setCalMonth(m => { const d = new Date(m.year, m.month + 1); return { year: d.getFullYear(), month: d.getMonth() }; })}
              className="w-8 h-8 rounded-lg dark:bg-zinc-800 bg-slate-100 flex items-center justify-center dark:text-zinc-400 text-slate-600 hover:dark:bg-zinc-700 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-7 border-b dark:border-zinc-800 border-slate-200">
            {DAYS_OF_WEEK.map(d => <div key={d} className="p-3 text-center text-xs dark:text-zinc-500 text-slate-400 uppercase" style={{ fontWeight: 600 }}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {monthDays.map((day, idx) => {
              const dateStr = day ? fmt(new Date(calMonth.year, calMonth.month, day)) : '';
              const daySessions = day ? sessionsByDate(dateStr) : [];
              const isToday = dateStr === fmt(today);
              return (
                <div key={idx} className={`border-b border-r dark:border-zinc-800 border-slate-200 last:border-r-0 p-2 min-h-[90px] cursor-pointer hover:dark:bg-zinc-800/30 transition-colors ${isToday ? 'dark:bg-blue-500/5 bg-blue-50' : ''} ${!day ? 'opacity-30' : ''}`}
                  onClick={() => day && setSelectedDate(dateStr)}>
                  {day && (
                    <>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs mb-1 ${isToday ? 'bg-blue-500 text-white' : 'dark:text-zinc-400 text-slate-600'}`} style={{ fontWeight: isToday ? 700 : 400 }}>
                        {day}
                      </div>
                      <div className="space-y-0.5">
                        {daySessions.slice(0, 2).map(s => (
                          <div key={s.id} className="w-full px-1.5 py-0.5 rounded text-xs truncate" style={{ backgroundColor: `${statusConfig[s.status].color}20`, color: statusConfig[s.status].color, fontWeight: 600 }}>
                            {s.time} {s.studentName.split(' ')[0]}
                          </div>
                        ))}
                        {daySessions.length > 2 && <p className="text-xs dark:text-zinc-600 text-slate-400">+{daySessions.length - 2}</p>}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div>
          <div className="flex flex-wrap gap-3 mb-5">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-500 text-slate-400" />
              <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar aluno..."
                className="pl-9 pr-4 py-2.5 rounded-xl text-sm dark:bg-zinc-900 bg-white border dark:border-zinc-700 border-slate-200 dark:text-zinc-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 w-56" />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2.5 rounded-xl text-sm dark:bg-zinc-900 bg-white border dark:border-zinc-700 border-slate-200 dark:text-zinc-200 text-slate-700 focus:outline-none">
              <option value="all">Todos os status</option>
              <option value="scheduled">Agendado</option>
              <option value="done">Concluído</option>
              <option value="cancelled">Cancelado</option>
              <option value="missed">Faltou</option>
            </select>
          </div>

          <div className="space-y-3">
            {filtered.map(s => {
              const StatusIcon = statusConfig[s.status].icon;
              const TypeIcon = typeConfig[s.type].icon;
              return (
                <div key={s.id} className="dark:bg-zinc-900 bg-white rounded-2xl border dark:border-zinc-800 border-slate-200 p-4 flex items-center gap-4">
                  <img src={s.studentAvatar} className="w-11 h-11 rounded-xl object-cover flex-shrink-0" alt={s.studentName} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>{s.studentName}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusConfig[s.status].bg} ${statusConfig[s.status].text}`} style={{ fontWeight: 600 }}>{statusConfig[s.status].label}</span>
                      {s.recurring && <Repeat className="w-3 h-3 dark:text-zinc-500 text-slate-400" />}
                    </div>
                    <div className="flex items-center gap-3 text-xs dark:text-zinc-500 text-slate-400">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(s.date + 'T12:00').toLocaleDateString('pt-BR')}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{s.time} · {s.duration}min</span>
                      <span className="flex items-center gap-1"><TypeIcon className="w-3 h-3" style={{ color: typeConfig[s.type].color }} />{s.location}</span>
                    </div>
                  </div>
                  {s.status === 'scheduled' && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => updateStatus(s.id, 'done')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border dark:border-emerald-500/30 border-emerald-300 dark:text-emerald-400 text-emerald-600 hover:dark:bg-emerald-500/10 transition-all" style={{ fontWeight: 600 }}>
                        <Check className="w-3 h-3" /> Concluir
                      </button>
                      <button onClick={() => updateStatus(s.id, 'missed')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border dark:border-amber-500/30 border-amber-300 dark:text-amber-400 text-amber-600 hover:dark:bg-amber-500/10 transition-all" style={{ fontWeight: 600 }}>
                        Faltou
                      </button>
                      <button onClick={() => updateStatus(s.id, 'cancelled')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border dark:border-red-500/20 border-red-200 dark:text-red-400 text-red-500 hover:dark:bg-red-500/10 transition-all">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center py-16 dark:text-zinc-600 text-slate-400">
                <Calendar className="w-14 h-14 mx-auto mb-4 opacity-30" />
                <p className="text-sm">Nenhuma sessão encontrada</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Session Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative dark:bg-zinc-900 bg-white rounded-3xl border dark:border-zinc-800 border-slate-200 p-6 w-full max-w-lg z-10 shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="dark:text-white text-slate-900" style={{ fontWeight: 700 }}>Agendar Sessão</h3>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-xl dark:bg-zinc-800 bg-slate-100 flex items-center justify-center dark:text-zinc-400 text-slate-600 hover:dark:bg-zinc-700 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-1.5">Aluno *</label>
                  <select value={form.studentId} onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                    <option value="">Selecione o aluno...</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-1.5">Data *</label>
                    <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                  </div>
                  <div>
                    <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-1.5">Horário *</label>
                    <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-1.5">Duração (min)</label>
                    <select value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 focus:outline-none">
                      {['30', '45', '60', '75', '90', '120'].map(d => <option key={d} value={d}>{d} min</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-1.5">Tipo</label>
                    <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 focus:outline-none">
                      <option value="presencial">Presencial</option>
                      <option value="online">Online</option>
                      <option value="avaliacao">Avaliação</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-1.5">Local / Link</label>
                  <input type="text" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                    placeholder="Academia CoachPass ou link do Meet"
                    className="w-full px-3 py-2.5 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                </div>

                <div>
                  <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-1.5">Treino / Plano</label>
                  <input type="text" value={form.plan} onChange={e => setForm(f => ({ ...f, plan: e.target.value }))}
                    placeholder="Ex: Push A, Funcional, HIIT..."
                    className="w-full px-3 py-2.5 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <div className={`relative w-11 h-6 rounded-full transition-all ${form.recurring ? 'bg-blue-500' : 'dark:bg-zinc-700 bg-slate-300'}`}
                    onClick={() => setForm(f => ({ ...f, recurring: !f.recurring }))}>
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${form.recurring ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                  <span className="text-sm dark:text-zinc-300 text-slate-700">Repetir semanalmente</span>
                </label>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl border dark:border-zinc-700 border-slate-300 dark:text-zinc-300 text-slate-700 hover:dark:bg-zinc-800 hover:bg-slate-50 transition-all text-sm">
                  Cancelar
                </button>
                <button onClick={handleAdd}
                  className="flex-1 py-3 rounded-xl text-white text-sm flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', fontWeight: 600 }}>
                  <Plus className="w-4 h-4" /> Agendar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

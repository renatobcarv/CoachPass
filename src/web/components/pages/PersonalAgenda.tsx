import React, { useState } from 'react';
import {
  Calendar, Plus, X, Clock, Users, Check,
  ChevronLeft, ChevronRight, Video, MapPin, Repeat,
  CheckCircle, XCircle, AlertCircle, Search, CalendarCheck, TrendingUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { CTAButton } from '../brand/Brand';
import { RollingNumber } from '../brand/fx';
import { Badge, Card, Page, PageHeader } from '../student/ui';
import { FieldLabel, PersonChip, Segmented, Switch } from '../pro/ui';

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
  scheduled: { label: 'Agendado', color: '#8c82ff', tone: 'blue' as const, icon: Clock },
  done: { label: 'Concluído', color: '#2ee6c8', tone: 'teal' as const, icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: '#ff5d6c', tone: 'neutral' as const, icon: XCircle },
  missed: { label: 'Faltou', color: '#ffb547', tone: 'amber' as const, icon: AlertCircle },
};

const typeConfig = {
  presencial: { label: 'Presencial', icon: MapPin },
  online: { label: 'Online', icon: Video },
  avaliacao: { label: 'Avaliação', icon: Users },
};

export function PersonalAgenda() {
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

  // Semana em torno da data selecionada
  const selDt = new Date(selectedDate + 'T12:00:00');
  const weekStart = new Date(selDt);
  weekStart.setDate(selDt.getDate() - selDt.getDay());
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return fmt(d);
  });

  const sessionsByDate = (date: string) =>
    sessions.filter((s) => s.date === date).sort((a, b) => a.time.localeCompare(b.time));

  const handleAdd = () => {
    if (!form.studentId) { toast.error('Selecione o aluno'); return; }
    const student = students.find((s) => s.id === form.studentId)!;
    const newS: Session = {
      id: Date.now().toString(), studentId: form.studentId, studentName: student.name,
      studentAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=10b981&color=fff`,
      date: form.date, time: form.time, duration: Number(form.duration),
      type: form.type as Session['type'], location: form.location, plan: form.plan,
      status: 'scheduled', notes: form.notes, recurring: form.recurring,
    };
    setSessions((prev) => [...prev, newS]);
    setShowModal(false);
    setSelectedDate(form.date);
    toast.success('Sessão agendada!', { description: `${student.name} · ${new Date(form.date + 'T12:00').toLocaleDateString('pt-BR')} às ${form.time}` });
  };

  const updateStatus = (id: string, status: Session['status']) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    toast.success(`Sessão marcada como ${statusConfig[status].label}`);
  };

  const openNew = (date?: string) => {
    setForm((f) => ({ ...f, date: date || selectedDate }));
    setShowModal(true);
  };

  const filtered = sessions
    .filter((s) => {
      const matchSearch = s.studentName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = filterStatus === 'all' || s.status === filterStatus;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

  const monthDays = getMonthDays(calMonth.year, calMonth.month);
  const todayStr = fmt(today);
  const shiftWeek = (dir: -1 | 1) => {
    const d = new Date(selDt);
    d.setDate(d.getDate() + 7 * dir);
    setSelectedDate(fmt(d));
  };
  const shiftMonth = (dir: -1 | 1) =>
    setCalMonth((m) => {
      const d = new Date(m.year, m.month + dir);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  const goToday = () => {
    setSelectedDate(todayStr);
    setCalMonth({ year: today.getFullYear(), month: today.getMonth() });
  };

  const presence = Math.round(
    (sessions.filter((s) => s.status === 'done').length /
      Math.max(1, sessions.filter((s) => s.status !== 'scheduled').length)) * 100,
  );
  const stats = [
    { label: 'Sessões hoje', value: String(sessionsByDate(todayStr).length), icon: Calendar },
    { label: 'Agendadas', value: String(sessions.filter((s) => s.status === 'scheduled').length), icon: Clock },
    { label: 'Concluídas no mês', value: String(sessions.filter((s) => s.status === 'done').length), icon: CalendarCheck },
    { label: 'Taxa de presença', value: `${presence}%`, icon: TrendingUp },
  ];

  const periodLabel =
    viewMode === 'month'
      ? new Date(calMonth.year, calMonth.month).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      : `${new Date(weekDays[0] + 'T12:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} – ${new Date(
          weekDays[6] + 'T12:00',
        ).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}`;

  const daySessions = sessionsByDate(selectedDate);

  return (
    <Page wide>
      <PageHeader
        kicker="Agenda & sessões"
        title="Sua semana"
        accent="de sessões."
        lead="Organize horários, marque presença e acompanhe quem está treinando."
        action={
          <CTAButton type="button" onClick={() => openNew()}>
            Agendar sessão
          </CTAButton>
        }
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon }, i) => (
          <Card key={label} className="p-5" delay={0.04 * i}>
            <span className="w-9 h-9 rounded-xl grid place-items-center bg-[rgba(85,70,255,0.14)]">
              <Icon className="w-4 h-4 text-[var(--brand-300)]" />
            </span>
            <p className="cp-display mt-4 text-[32px] font-bold leading-none">
              <RollingNumber value={value} />
            </p>
            <p className="mt-2 text-[13px] text-[var(--muted)]">{label}</p>
          </Card>
        ))}
      </div>

      {/* Barra de controle */}
      <div className="mt-8 mb-5 flex flex-wrap items-center justify-between gap-3">
        <Segmented
          layoutId="agenda-view"
          value={viewMode}
          onChange={setViewMode}
          options={[
            { value: 'week', label: 'Semana' },
            { value: 'month', label: 'Mês' },
            { value: 'list', label: 'Lista', count: sessions.length },
          ]}
        />
        {viewMode !== 'list' && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => (viewMode === 'month' ? shiftMonth(-1) : shiftWeek(-1))}
              aria-label="Período anterior"
              className="w-10 h-10 rounded-full grid place-items-center border border-[var(--line-2)] text-[var(--muted)] hover:text-white hover:bg-white/[0.05]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <p className="cp-display min-w-[180px] text-center text-[15px] font-semibold first-letter:uppercase">{periodLabel}</p>
            <button
              type="button"
              onClick={() => (viewMode === 'month' ? shiftMonth(1) : shiftWeek(1))}
              aria-label="Próximo período"
              className="w-10 h-10 rounded-full grid place-items-center border border-[var(--line-2)] text-[var(--muted)] hover:text-white hover:bg-white/[0.05]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button type="button" onClick={goToday} className="cp-btn-ghost h-10 px-4 text-[13px]">
              Hoje
            </button>
          </div>
        )}
      </div>

      {viewMode !== 'list' ? (
        <div className="grid xl:grid-cols-[1fr_360px] gap-6 items-start">
          {/* Calendário */}
          <div className="rounded-[22px] border border-[var(--line)] bg-white/[0.025] overflow-hidden min-w-0">
            {viewMode === 'week' ? (
              <div className="overflow-x-auto">
                <div className="grid grid-cols-7 min-w-[720px] xl:min-w-0">
                  {weekDays.map((date, i) => {
                    const list = sessionsByDate(date);
                    const isToday = date === todayStr;
                    const isSelected = date === selectedDate;
                    const dt = new Date(date + 'T12:00');
                    return (
                      <div
                        key={date}
                        className={`border-r last:border-r-0 border-[var(--line)] min-h-[300px] ${isSelected ? 'bg-[rgba(85,70,255,0.06)]' : ''}`}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedDate(date)}
                          className="w-full p-3 border-b border-[var(--line)] text-center hover:bg-white/[0.03] transition-colors"
                        >
                          <p className="cp-mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--dim)]">{DAYS_OF_WEEK[i]}</p>
                          <span
                            className={`mt-1.5 mx-auto w-9 h-9 rounded-full grid place-items-center cp-display text-[16px] font-bold ${
                              isToday ? 'cp-selected' : isSelected ? 'bg-white/[0.08] text-white' : 'text-[var(--cream)]'
                            }`}
                          >
                            {dt.getDate()}
                          </span>
                        </button>
                        <div className="p-2 space-y-1.5">
                          {list.map((s) => {
                            const TypeIcon = typeConfig[s.type].icon;
                            const st = statusConfig[s.status];
                            return (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => setSelectedDate(date)}
                                className="w-full text-left p-2 rounded-xl border bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
                                style={{ borderColor: `${st.color}40`, boxShadow: `inset 3px 0 0 ${st.color}` }}
                              >
                                <span className="flex items-center gap-1.5">
                                  <TypeIcon className="w-3 h-3 text-[var(--dim)]" />
                                  <span className="cp-mono text-[11px] font-semibold" style={{ color: st.color }}>
                                    {s.time}
                                  </span>
                                </span>
                                <span className="block mt-0.5 text-[12.5px] font-semibold truncate">{s.studentName.split(' ')[0]}</span>
                                <span className="block text-[11px] text-[var(--dim)] truncate">{s.plan}</span>
                              </button>
                            );
                          })}
                          <button
                            type="button"
                            onClick={() => openNew(date)}
                            aria-label="Agendar neste dia"
                            className="w-full h-8 grid place-items-center rounded-xl border border-dashed border-[var(--line-2)] text-[var(--dim)] hover:text-white hover:border-[rgba(140,130,255,0.5)] transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-7 border-b border-[var(--line)]">
                  {DAYS_OF_WEEK.map((d) => (
                    <div key={d} className="p-3 text-center cp-mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--dim)]">
                      {d}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7">
                  {monthDays.map((day, idx) => {
                    const dateStr = day ? fmt(new Date(calMonth.year, calMonth.month, day)) : '';
                    const list = day ? sessionsByDate(dateStr) : [];
                    const isToday = dateStr === todayStr;
                    const isSelected = dateStr === selectedDate;
                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={!day}
                        onClick={() => day && setSelectedDate(dateStr)}
                        className={`text-left border-b border-r border-[var(--line)] p-2 min-h-[92px] transition-colors ${
                          isSelected ? 'bg-[rgba(85,70,255,0.08)]' : 'hover:bg-white/[0.03]'
                        } ${!day ? 'opacity-0 pointer-events-none' : ''}`}
                      >
                        {day && (
                          <>
                            <span
                              className={`w-7 h-7 rounded-full grid place-items-center text-[13px] font-semibold ${
                                isToday ? 'cp-selected' : 'text-[var(--cream)]'
                              }`}
                            >
                              {day}
                            </span>
                            <span className="mt-1.5 flex flex-wrap gap-1">
                              {list.slice(0, 4).map((s) => (
                                <span
                                  key={s.id}
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{ background: statusConfig[s.status].color }}
                                />
                              ))}
                            </span>
                            {list.length > 0 && (
                              <span className="hidden sm:block mt-1 text-[11px] text-[var(--muted)] truncate">
                                {list[0].time} {list[0].studentName.split(' ')[0]}
                                {list.length > 1 ? ` +${list.length - 1}` : ''}
                              </span>
                            )}
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Dia selecionado */}
          <aside className="xl:sticky xl:top-6 rounded-[22px] border border-[var(--line-2)] bg-[#0d0f18] overflow-hidden">
            <span aria-hidden className="cp-modal-bar" />
            <div className="p-5 border-b border-[var(--line)] flex items-start justify-between gap-3">
              <div>
                <p className="cp-kicker">{selectedDate === todayStr ? 'Hoje' : 'Dia selecionado'}</p>
                <p className="cp-display mt-1 text-[20px] font-bold first-letter:uppercase">
                  {new Date(selectedDate + 'T12:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => openNew(selectedDate)}
                aria-label="Agendar neste dia"
                className="w-9 h-9 shrink-0 rounded-full grid place-items-center cp-selected"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {daySessions.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Calendar className="w-8 h-8 mx-auto text-[var(--dim)]" />
                <p className="mt-3 text-[14px] text-[var(--muted)]">Nenhuma sessão neste dia</p>
                <button type="button" onClick={() => openNew(selectedDate)} className="cp-btn-sm mx-auto mt-5">
                  <Plus className="w-4 h-4" /> Agendar
                </button>
              </div>
            ) : (
              <ol>
                {daySessions.map((s) => (
                  <SessionRow key={s.id} s={s} onStatus={updateStatus} compact />
                ))}
              </ol>
            )}
          </aside>
        </div>
      ) : (
        /* Lista */
        <div>
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative sm:w-72">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--dim)] pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar aluno…"
                className="cp-field h-11"
              />
            </div>
            <Segmented
              size="sm"
              layoutId="agenda-status"
              value={filterStatus}
              onChange={setFilterStatus}
              options={[
                { value: 'all', label: 'Todos' },
                { value: 'scheduled', label: 'Agendado' },
                { value: 'done', label: 'Concluído' },
                { value: 'missed', label: 'Faltou' },
                { value: 'cancelled', label: 'Cancelado' },
              ]}
            />
          </div>
          <div className="rounded-[22px] border border-[var(--line)] bg-white/[0.025] overflow-hidden">
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="w-10 h-10 mx-auto text-[var(--dim)]" />
                <p className="mt-3 text-[14px] text-[var(--muted)]">Nenhuma sessão encontrada</p>
              </div>
            ) : (
              <ol>
                {filtered.map((s) => (
                  <SessionRow key={s.id} s={s} onStatus={updateStatus} />
                ))}
              </ol>
            )}
          </div>
        </div>
      )}

      {/* Modal de agendamento */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="schedule-title"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="cp-modal relative z-10 w-full sm:max-w-lg max-h-[92vh] flex flex-col"
            >
              <span aria-hidden className="cp-modal-bar" />
              <div className="flex items-start justify-between gap-4 p-6 pb-4">
                <div className="flex items-center gap-4">
                  <span className="w-12 h-12 rounded-2xl grid place-items-center bg-[rgba(85,70,255,0.16)] border border-[rgba(140,130,255,0.3)]">
                    <Calendar className="w-5 h-5 text-[var(--brand-300)]" />
                  </span>
                  <div>
                    <h3 id="schedule-title" className="cp-display text-[22px] font-bold">Agendar sessão</h3>
                    <p className="text-[13.5px] text-[var(--muted)] mt-0.5">Presencial, online ou avaliação.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  aria-label="Fechar"
                  className="w-9 h-9 shrink-0 rounded-full grid place-items-center border border-[var(--line-2)] text-[var(--muted)] hover:text-white hover:bg-white/[0.06]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 pb-2 space-y-5">
                <div>
                  <FieldLabel>Aluno</FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    {students.map((s) => (
                      <PersonChip
                        key={s.id}
                        name={s.name}
                        avatar={s.avatar}
                        selected={form.studentId === s.id}
                        onClick={() => setForm((f) => ({ ...f, studentId: s.id }))}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <FieldLabel>Tipo</FieldLabel>
                  <Segmented
                    layoutId="schedule-type"
                    value={form.type as Session['type']}
                    onChange={(v) =>
                      setForm((f) => ({
                        ...f,
                        type: v,
                        location: v === 'online' ? 'Google Meet' : f.location === 'Google Meet' ? 'Academia CoachPass' : f.location,
                      }))
                    }
                    options={[
                      { value: 'presencial', label: 'Presencial', icon: MapPin },
                      { value: 'online', label: 'Online', icon: Video },
                      { value: 'avaliacao', label: 'Avaliação', icon: Users },
                    ]}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel htmlFor="s-date">Data</FieldLabel>
                    <input id="s-date" type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="cp-field pl-4" />
                  </div>
                  <div>
                    <FieldLabel htmlFor="s-time">Horário</FieldLabel>
                    <input id="s-time" type="time" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} className="cp-field pl-4" />
                  </div>
                </div>

                <div>
                  <FieldLabel>Duração</FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    {['30', '45', '60', '75', '90', '120'].map((d) => {
                      const active = form.duration === d;
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, duration: d }))}
                          aria-pressed={active}
                          className={`h-10 px-4 rounded-full border text-[13.5px] font-medium transition-colors ${
                            active ? 'cp-selected border-transparent' : 'border-[var(--line-2)] text-[var(--muted)] hover:text-white'
                          }`}
                        >
                          {d} min
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel htmlFor="s-loc">Local / link</FieldLabel>
                    <input
                      id="s-loc"
                      type="text"
                      value={form.location}
                      onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                      placeholder="Academia ou link do Meet"
                      className="cp-field pl-4"
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor="s-plan">Treino / plano</FieldLabel>
                    <input
                      id="s-plan"
                      type="text"
                      value={form.plan}
                      onChange={(e) => setForm((f) => ({ ...f, plan: e.target.value }))}
                      placeholder="Push A, Funcional, HIIT…"
                      className="cp-field pl-4"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--line)] px-4 py-3">
                  <span className="flex items-center gap-2.5 text-[14px]">
                    <Repeat className="w-4 h-4 text-[var(--brand-300)]" />
                    Repetir semanalmente
                  </span>
                  <Switch
                    label="Repetir semanalmente"
                    checked={form.recurring}
                    onChange={(v) => setForm((f) => ({ ...f, recurring: v }))}
                  />
                </div>
              </div>

              <div className="flex gap-3 p-6 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="cp-btn-ghost flex-1 justify-center h-12">
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleAdd}
                  className="cp-selected flex-[1.3] h-12 rounded-full font-semibold flex items-center justify-center gap-2 hover:brightness-110"
                >
                  <Plus className="w-4 h-4" /> Agendar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Page>
  );
}

function SessionRow({
  s,
  onStatus,
  compact,
}: {
  s: Session;
  onStatus: (id: string, status: Session['status']) => void;
  compact?: boolean;
}) {
  const st = statusConfig[s.status];
  const TypeIcon = typeConfig[s.type].icon;
  return (
    <li className="px-5 py-4 border-b border-[var(--line)] last:border-b-0">
      <div className="flex items-start gap-3">
        <div className="text-center w-12 shrink-0">
          <p className="cp-display text-[17px] font-bold leading-none">{s.time}</p>
          <p className="cp-mono mt-1 text-[10.5px] text-[var(--dim)]">{s.duration}min</p>
        </div>
        <span className="w-[3px] self-stretch rounded-full" style={{ background: st.color }} />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <img src={s.studentAvatar} alt="" className="w-6 h-6 rounded-full" />
            <p className="text-[14.5px] font-semibold truncate">{s.studentName}</p>
            {s.recurring && <Repeat className="w-3.5 h-3.5 text-[var(--dim)]" aria-label="Semanal" />}
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-[var(--dim)]">
            {!compact && <span>{new Date(s.date + 'T12:00').toLocaleDateString('pt-BR')}</span>}
            <span className="inline-flex items-center gap-1">
              <TypeIcon className="w-3 h-3" />
              {s.location}
            </span>
            {s.plan && <span>{s.plan}</span>}
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <Badge tone={st.tone}>{st.label}</Badge>
            {s.status === 'scheduled' && (
              <>
                <button
                  type="button"
                  onClick={() => onStatus(s.id, 'done')}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[12.5px] font-semibold border border-[rgba(46,230,200,0.35)] text-[var(--teal)] hover:bg-[rgba(46,230,200,0.08)]"
                >
                  <Check className="w-3.5 h-3.5" /> Concluir
                </button>
                <button
                  type="button"
                  onClick={() => onStatus(s.id, 'missed')}
                  className="h-8 px-3 rounded-full text-[12.5px] font-semibold border border-[rgba(255,181,71,0.35)] text-[var(--amber)] hover:bg-[rgba(255,181,71,0.08)]"
                >
                  Faltou
                </button>
                <button
                  type="button"
                  onClick={() => onStatus(s.id, 'cancelled')}
                  aria-label="Cancelar sessão"
                  className="w-8 h-8 grid place-items-center rounded-full border border-[rgba(255,93,108,0.3)] text-[#ff8a95] hover:bg-[rgba(255,93,108,0.08)]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

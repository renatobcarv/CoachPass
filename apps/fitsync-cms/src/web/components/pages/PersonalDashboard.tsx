import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ClipboardList, Dumbbell, Search, UserPlus } from 'lucide-react';
import { AddPatientModal } from '../AddPatientModal';

interface Student {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'pending';
  goal: string;
  avatar: string;
  nextSession: string;
}

const mockStudents: Student[] = [
  { id: '1', name: 'Lucas Silva', email: 'lucas@email.com', status: 'active', goal: 'Hipertrofia', avatar: 'https://ui-avatars.com/api/?name=Lucas+Silva&background=10b981&color=fff', nextSession: 'Amanhã 7h' },
  { id: '2', name: 'Maria Santos', email: 'maria@email.com', status: 'active', goal: 'Emagrecimento', avatar: 'https://ui-avatars.com/api/?name=Maria+Santos&background=3b82f6&color=fff', nextSession: 'Hoje 19h' },
  { id: '3', name: 'Carlos Ramos', email: 'carlos@email.com', status: 'active', goal: 'Condicionamento', avatar: 'https://ui-avatars.com/api/?name=Carlos+Ramos&background=f59e0b&color=fff', nextSession: 'Sex. 8h' },
  { id: '4', name: 'Ana Oliveira', email: 'ana@email.com', status: 'active', goal: 'Flexibilidade', avatar: 'https://ui-avatars.com/api/?name=Ana+Oliveira&background=8b5cf6&color=fff', nextSession: 'Seg. 10h' },
  { id: '5', name: 'João Pedro', email: 'joao@email.com', status: 'pending', goal: 'Aguardando aceite', avatar: 'https://ui-avatars.com/api/?name=Joao+Pedro&background=6b7280&color=fff', nextSession: '—' },
];

const todaySessions = [
  { id: '1', student: 'Maria Santos', time: '19:00', type: 'Funcional' },
  { id: '2', student: 'Lucas Silva', time: '07:00', type: 'Pull B' },
];

export function PersonalDashboard() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold dark:text-white text-slate-900">Alunos</h1>
          <p className="text-sm dark:text-zinc-400 text-slate-500 mt-1">Convide, abra a ficha e veja as sessões de hoje.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/personal/criar-treino')}
            className="px-3 py-2 rounded-xl text-sm font-medium dark:bg-zinc-900 bg-white border dark:border-zinc-800 border-slate-200 dark:text-white text-slate-900"
          >
            <Dumbbell className="w-4 h-4 inline mr-1.5" />
            Criar treino
          </button>
          <button
            onClick={() => navigate('/personal/avaliacao')}
            className="px-3 py-2 rounded-xl text-sm font-medium text-white bg-slate-900 dark:bg-emerald-600"
          >
            <ClipboardList className="w-4 h-4 inline mr-1.5" />
            Avaliação
          </button>
        </div>
      </div>

      <section className="rounded-2xl border dark:border-zinc-800 border-slate-200 dark:bg-zinc-900 bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold dark:text-white text-slate-900">Sessões de hoje</h2>
          <button onClick={() => navigate('/personal/agenda')} className="text-sm text-emerald-500">
            Agenda
          </button>
        </div>
        <div className="space-y-2">
          {todaySessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between text-sm">
              <span className="dark:text-white text-slate-900">{session.student}</span>
              <span className="dark:text-zinc-400 text-slate-500">{session.time} · {session.type}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-500 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar aluno"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl dark:bg-zinc-900 bg-white border dark:border-zinc-800 border-slate-200 dark:text-white text-slate-900"
          />
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-emerald-600"
        >
          <UserPlus className="w-4 h-4 inline mr-1.5" />
          Convidar
        </button>
      </div>

      <div className="rounded-2xl border dark:border-zinc-800 border-slate-200 overflow-hidden">
        {filtered.map((student) => (
          <button
            key={student.id}
            onClick={() => student.status === 'active' && navigate(`/personal/aluno/${student.id}`)}
            className="w-full flex items-center gap-3 px-4 py-3 text-left dark:bg-zinc-900 bg-white border-b last:border-b-0 dark:border-zinc-800 border-slate-200"
          >
            <img src={student.avatar} alt="" className="w-10 h-10 rounded-full" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium dark:text-white text-slate-900">{student.name}</p>
              <p className="text-xs dark:text-zinc-500 text-slate-400 truncate">{student.goal}</p>
            </div>
            <span className="text-xs dark:text-zinc-400 text-slate-500">
              {student.status === 'pending' ? 'Pendente' : student.nextSession}
            </span>
          </button>
        ))}
      </div>

      <AddPatientModal
        isOpen={showAddModal}
        professionalType="personal"
        onClose={() => setShowAddModal(false)}
        onSuccess={(student) => {
          setStudents((prev) => [
            ...prev,
            {
              id: String(student.id ?? Date.now()),
              name: student.name,
              email: student.email,
              status: 'pending',
              goal: 'Aguardando aceite',
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=10b981&color=fff`,
              nextSession: '—',
            },
          ]);
        }}
      />
    </div>
  );
}

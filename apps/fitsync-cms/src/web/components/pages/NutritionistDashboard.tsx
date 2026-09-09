import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, Stethoscope, UserPlus, Utensils } from 'lucide-react';
import { AddPatientModal } from '../AddPatientModal';

interface Patient {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'pending';
  lastConsultation: string;
  currentWeight: number;
  avatar: string;
}

const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'Ana Costa',
    email: 'ana@email.com',
    status: 'active',
    lastConsultation: 'Há 3 dias',
    currentWeight: 68.5,
    avatar: 'https://ui-avatars.com/api/?name=Ana+Costa&background=f59e0b&color=fff',
  },
  {
    id: '2',
    name: 'Roberto Lima',
    email: 'roberto@email.com',
    status: 'active',
    lastConsultation: 'Há 1 semana',
    currentWeight: 92.3,
    avatar: 'https://ui-avatars.com/api/?name=Roberto+Lima&background=3b82f6&color=fff',
  },
  {
    id: '3',
    name: 'Juliana Mendes',
    email: 'juliana@email.com',
    status: 'pending',
    lastConsultation: 'Aguardando aceite',
    currentWeight: 0,
    avatar: 'https://ui-avatars.com/api/?name=Juliana+Mendes&background=8b5cf6&color=fff',
  },
];

export function NutritionistDashboard() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold dark:text-white text-slate-900">Pacientes</h1>
          <p className="text-sm dark:text-zinc-400 text-slate-500 mt-1">Convide, abra a ficha e crie o plano.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/nutritionist/criar-plano')}
            className="px-3 py-2 rounded-xl text-sm font-medium dark:bg-zinc-900 bg-white border dark:border-zinc-800 border-slate-200 dark:text-white text-slate-900"
          >
            <Utensils className="w-4 h-4 inline mr-1.5" />
            Criar plano
          </button>
          <button
            onClick={() => navigate('/nutritionist/consulta/1')}
            className="px-3 py-2 rounded-xl text-sm font-medium text-white bg-slate-900 dark:bg-emerald-600"
          >
            <Stethoscope className="w-4 h-4 inline mr-1.5" />
            Consulta
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-500 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar paciente"
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
        {filtered.map((patient) => (
          <button
            key={patient.id}
            onClick={() => patient.status === 'active' && navigate(`/nutritionist/paciente/${patient.id}`)}
            className="w-full flex items-center gap-3 px-4 py-3 text-left dark:bg-zinc-900 bg-white border-b last:border-b-0 dark:border-zinc-800 border-slate-200"
          >
            <img src={patient.avatar} alt="" className="w-10 h-10 rounded-full" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium dark:text-white text-slate-900">{patient.name}</p>
              <p className="text-xs dark:text-zinc-500 text-slate-400 truncate">{patient.email}</p>
            </div>
            <span className="text-xs dark:text-zinc-400 text-slate-500">
              {patient.status === 'pending' ? 'Pendente' : patient.lastConsultation}
            </span>
          </button>
        ))}
      </div>

      <AddPatientModal
        isOpen={showAddModal}
        professionalType="nutritionist"
        onClose={() => setShowAddModal(false)}
        onSuccess={(patient) => {
          setPatients((prev) => [
            ...prev,
            {
              id: String(patient.id ?? Date.now()),
              name: patient.name,
              email: patient.email,
              status: 'pending',
              lastConsultation: 'Aguardando aceite',
              currentWeight: 0,
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(patient.name)}&background=10b981&color=fff`,
            },
          ]);
        }}
      />
    </div>
  );
}

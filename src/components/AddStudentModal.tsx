'use client';

import React, { useState } from 'react';
import { Student } from '@/types/coachpass';
import { X, UserPlus, CheckCircle2 } from 'lucide-react';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStudent: (student: Omit<Student, 'id' | 'recentWorkouts' | 'workoutsCompletedThisMonth'>) => void;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  onAddStudent,
}) => {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('Hipertrofia & Definição');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [currentWeightKg, setCurrentWeightKg] = useState(75);
  const [targetWeightKg, setTargetWeightKg] = useState(78);
  const [expectedFrequencyPerWeek, setExpectedFrequencyPerWeek] = useState(4);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddStudent({
      name,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200`,
      email,
      phone,
      goal,
      joinedDate: new Date().toLocaleDateString('pt-BR'),
      status: 'active',
      adherencePercentage: 100,
      frequencyPerWeek: expectedFrequencyPerWeek,
      expectedFrequencyPerWeek,
      currentWeightKg,
      targetWeightKg,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="glass-panel max-w-lg w-full rounded-3xl border border-slate-700 shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Cadastrar Novo Aluno</h2>
              <p className="text-xs text-slate-400">Adicione alunos à sua carteira de personal trainer</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Nome Completo do Aluno
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 text-sm text-white p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
              placeholder="Ex: Mateus Henrique"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 text-sm text-white p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
                placeholder="aluno@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Telefone (WhatsApp)
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-900 text-sm text-white p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
                placeholder="(11) 99999-8888"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Objetivo Principal
            </label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full bg-slate-900 text-sm text-white p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
              placeholder="Ex: Ganho de Massa Magra / Emagrecimento"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Peso Atual (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={currentWeightKg}
                onChange={(e) => setCurrentWeightKg(Number(e.target.value))}
                className="w-full bg-slate-900 text-sm text-white p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500 text-center"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Meta (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={targetWeightKg}
                onChange={(e) => setTargetWeightKg(Number(e.target.value))}
                className="w-full bg-slate-900 text-sm text-white p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500 text-center"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Meta Freq./sem
              </label>
              <input
                type="number"
                min="1"
                max="7"
                value={expectedFrequencyPerWeek}
                onChange={(e) => setExpectedFrequencyPerWeek(Number(e.target.value))}
                className="w-full bg-slate-900 text-sm text-white p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500 text-center"
                required
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 hover:opacity-95 transition-opacity flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Salvar Cadastro
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

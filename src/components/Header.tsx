'use client';

import React from 'react';
import Link from 'next/link';
import { Dumbbell, Sparkles, Plus, Search, Bell, UserCheck } from 'lucide-react';

interface HeaderProps {
  onOpenAddStudent: () => void;
  onOpenAddWorkout: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddStudent,
  onOpenAddWorkout,
  searchTerm,
  onSearchChange,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Logo & Brand */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 text-slate-950 shadow-lg shadow-emerald-500/20">
              <Dumbbell className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white">
                  Coach<span className="gradient-text-emerald">Pass</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  IA Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Gestão Inteligente para Personals</p>
            </div>
          </div>

          {/* Quick Action Button for Mobile */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenAddWorkout}
              className="p-2 rounded-lg bg-emerald-500 text-slate-950 font-bold"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800 text-sm font-medium overflow-x-auto w-full md:w-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-400 border border-emerald-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'students'
                ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-400 border border-emerald-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Carteira de Alunos
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'insights'
                ? 'bg-gradient-to-r from-purple-500/20 to-emerald-500/20 text-purple-300 border border-purple-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            Insights de IA
          </button>
        </nav>

        {/* Search & Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {/* Search Bar */}
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar aluno, treino..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-slate-900/80 text-sm text-slate-200 placeholder-slate-500 pl-9 pr-4 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>

          {/* Action Buttons */}
          <div className="hidden sm:flex items-center gap-2">
            <Link
              href="/cadastro"
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-500/30 transition-colors flex items-center gap-1.5"
            >
              Criar Conta
            </Link>
            <button
              onClick={onOpenAddStudent}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-slate-400" />
              Novo Aluno
            </button>
            <button
              onClick={onOpenAddWorkout}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-md shadow-emerald-500/20 hover:opacity-95 transition-opacity flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Registrar Treino
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};

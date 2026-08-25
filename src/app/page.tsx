'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { MetricsOverview } from '@/components/MetricsOverview';
import { AIInsightsSection } from '@/components/AIInsightsSection';
import { StudentList } from '@/components/StudentList';
import { StudentDetailModal } from '@/components/StudentDetailModal';
import { AddWorkoutModal } from '@/components/AddWorkoutModal';
import { AddStudentModal } from '@/components/AddStudentModal';
import { mockDashboardMetrics, mockStudents, mockAIInsights } from '@/lib/mockData';
import { Student, AIInsight, DashboardMetrics } from '@/types/coachpass';
import { Dumbbell, Sparkles, ShieldCheck, Heart, Layers, ArrowUpRight } from 'lucide-react';

export default function Home() {
  const [metrics, setMetrics] = useState<DashboardMetrics>(mockDashboardMetrics);
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [insights, setInsights] = useState<AIInsight[]>(mockAIInsights);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'insights'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isAddWorkoutOpen, setIsAddWorkoutOpen] = useState(false);
  const [preselectedStudentIdForWorkout, setPreselectedStudentIdForWorkout] = useState<string | undefined>();

  // Search filtering
  const filteredStudents = students.filter((std) =>
    std.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    std.goal.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handlers
  const handleSelectStudentById = (studentId: string) => {
    const found = students.find((s) => s.id === studentId);
    if (found) {
      setSelectedStudent(found);
    }
  };

  const handleOpenAddWorkoutForStudent = (student: Student) => {
    setPreselectedStudentIdForWorkout(student.id);
    setIsAddWorkoutOpen(true);
  };

  const handleAddStudent = (newStudentData: Omit<Student, 'id' | 'recentWorkouts' | 'workoutsCompletedThisMonth'>) => {
    const newStudent: Student = {
      ...newStudentData,
      id: `std-${Date.now()}`,
      workoutsCompletedThisMonth: 0,
      recentWorkouts: [],
    };
    setStudents([newStudent, ...students]);
    setMetrics((prev) => ({
      ...prev,
      totalStudents: prev.totalStudents + 1,
      activeStudents: prev.activeStudents + 1,
    }));
  };

  const handleSaveWorkout = (studentId: string, workoutData: any) => {
    setStudents((prevStudents) =>
      prevStudents.map((std) => {
        if (std.id === studentId) {
          const newWorkout = {
            id: `w-${Date.now()}`,
            ...workoutData,
          };
          return {
            ...std,
            workoutsCompletedThisMonth: std.workoutsCompletedThisMonth + 1,
            recentWorkouts: [newWorkout, ...std.recentWorkouts],
          };
        }
        return std;
      })
    );

    setMetrics((prev) => ({
      ...prev,
      totalWorkoutsThisMonth: prev.totalWorkoutsThisMonth + 1,
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 relative selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Background Decorative Gradients */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed top-1/3 right-10 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-10 left-10 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Header */}
      <Header
        onOpenAddStudent={() => setIsAddStudentOpen(true)}
        onOpenAddWorkout={() => {
          setPreselectedStudentIdForWorkout(undefined);
          setIsAddWorkoutOpen(true);
        }}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        activeTab={activeTab}
        setActiveTab={(tab: any) => setActiveTab(tab)}
      />

      {/* Hero / Welcome Banner */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-8">
        
        <div className="relative glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/80 overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-400 text-xs font-semibold border border-emerald-500/30 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              CoachPass Personal Hub
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Gestão Inteligente & <span className="gradient-text-emerald">Evolução de Cargas</span>
            </h1>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Substitua planilhas dispersas por diagnósticos preditivos de Inteligência Artificial. 
              Acompanhe a frequência, carga, volume e adesão de toda a sua carteira de alunos em tempo real.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <button
              onClick={() => setIsAddStudentOpen(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all shadow-md"
            >
              + Novo Aluno
            </button>
            <button
              onClick={() => {
                setPreselectedStudentIdForWorkout(undefined);
                setIsAddWorkoutOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-xl shadow-emerald-500/20 hover:opacity-95 transition-all flex items-center gap-2"
            >
              <Dumbbell className="w-4 h-4" />
              Registrar Novo Treino
            </button>
          </div>
        </div>

        {/* Global Key Metrics Overview */}
        <MetricsOverview metrics={metrics} />

        {/* View Switcher Content */}
        {activeTab === 'dashboard' && (
          <>
            {/* AI Insights Engine Section */}
            <AIInsightsSection
              insights={insights}
              onSelectStudent={handleSelectStudentById}
            />

            {/* Students Portfolio List */}
            <StudentList
              students={filteredStudents}
              onSelectStudent={(std) => setSelectedStudent(std)}
              onOpenAddWorkoutForStudent={handleOpenAddWorkoutForStudent}
              onOpenAddStudent={() => setIsAddStudentOpen(true)}
            />
          </>
        )}

        {activeTab === 'students' && (
          <StudentList
            students={filteredStudents}
            onSelectStudent={(std) => setSelectedStudent(std)}
            onOpenAddWorkoutForStudent={handleOpenAddWorkoutForStudent}
            onOpenAddStudent={() => setIsAddStudentOpen(true)}
          />
        )}

        {activeTab === 'insights' && (
          <AIInsightsSection
            insights={insights}
            onSelectStudent={handleSelectStudentById}
          />
        )}

      </main>

      {/* Interactive Modals */}
      <StudentDetailModal
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
        onOpenAddWorkout={handleOpenAddWorkoutForStudent}
      />

      <AddWorkoutModal
        isOpen={isAddWorkoutOpen}
        onClose={() => setIsAddWorkoutOpen(false)}
        students={students}
        preselectedStudentId={preselectedStudentIdForWorkout}
        onSaveWorkout={handleSaveWorkout}
      />

      <AddStudentModal
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        onAddStudent={handleAddStudent}
      />

      {/* Footer */}
      <footer className="w-full glass-panel border-t border-slate-800/80 mt-16 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">CoachPass</span>
            <span>— Plataforma de Gestão de Treinos & IA para Personal Trainers</span>
          </div>
          <p>© 2026 CoachPass. Desenvolvido com Next.js, TypeScript e Tailwind CSS.</p>
        </div>
      </footer>

    </div>
  );
}

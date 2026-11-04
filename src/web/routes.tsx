'use client'

import { createBrowserRouter, Navigate } from 'react-router';
import { Layout } from './components/Layout';
import { Dashboard } from './components/pages/Dashboard';
import { Workouts } from './components/pages/Workouts';
import { Diet } from './components/pages/Diet';
import { Profile } from './components/pages/Profile';
import { Home } from './components/pages/Home';
import { Login } from './components/pages/Login';
import { Register } from './components/pages/Register';
import { PersonalDashboard } from './components/pages/PersonalDashboard';
import { NutritionistDashboard } from './components/pages/NutritionistDashboard';
import { StudentMeasurement } from './components/pages/StudentMeasurement';
import { StudentRestriction } from './components/pages/StudentRestriction';
import { StudentReport } from './components/pages/StudentReport';
import { NutritionistPatientDetails } from './components/pages/NutritionistPatientDetails';
import { CreateDietPlan } from './components/pages/CreateDietPlan';
import { NutritionConsultation } from './components/pages/NutritionConsultation';
import { NutritionistAnamnese } from './components/pages/NutritionistAnamnese';
import { NutritionistAlimentos } from './components/pages/NutritionistAlimentos';
import { PersonalAvaliacao } from './components/pages/PersonalAvaliacao';
import { PersonalAgenda } from './components/pages/PersonalAgenda';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RequireStudentOnboarding } from './components/RequireStudentOnboarding';
import { Settings } from './components/pages/Settings';
import { PanelSelector } from './components/pages/PanelSelector';
import { StudentOnboarding } from './components/pages/StudentOnboarding';
import { ProfessionalOnboarding } from './components/pages/ProfessionalOnboarding';
import { Plans } from './components/pages/Plans';
import { PrivacyPolicy, TermsOfUse } from './components/pages/PrivacyPolicy';
import { PerformanceDashboard, ExerciseHistoryPage } from './components/performance/Dashboard';
import { CyclesHome, CycleEditor, CycleView } from './components/performance/Periodization';
import { SessionLogger } from './components/performance/SessionLogger';
import { WorkoutBuilder } from './components/performance/WorkoutBuilder';

// Variações por painel (aluno vê o próprio; personal vê o do aluno)
const StudentCycles = () => <CyclesHome mode="student" />;
const StudentCycleEditor = () => <CycleEditor mode="student" />;
const StudentCycleView = () => <CycleView mode="student" />;
const StudentWorkoutBuilder = () => <WorkoutBuilder mode="student" />;
const CoachCycles = () => <CyclesHome mode="coach" />;
const CoachCycleEditor = () => <CycleEditor mode="coach" />;
const CoachCycleView = () => <CycleView mode="coach" />;
const CoachWorkoutBuilder = () => <WorkoutBuilder mode="coach" />;
const CoachDashboard = () => <PerformanceDashboard coach />;
const CoachExerciseHistory = () => <ExerciseHistoryPage coach />;

export const router = createBrowserRouter([
  { path: '/', Component: Home },
  { path: '/login', Component: Login },
  { path: '/cadastro', Component: Register },
  { path: '/planos', Component: Plans },
  { path: '/privacidade', Component: PrivacyPolicy },
  { path: '/termos', Component: TermsOfUse },
  {
    path: '/selecionar-painel',
    element: <ProtectedRoute allowedRoles={['master']} />,
    children: [{ index: true, Component: PanelSelector }],
  },
  {
    path: '/onboarding/student',
    element: <ProtectedRoute allowedRoles={['student']} />,
    children: [{ index: true, Component: StudentOnboarding }],
  },
  {
    path: '/onboarding/professional',
    element: <ProtectedRoute allowedRoles={['personal', 'nutritionist']} />,
    children: [{ index: true, Component: ProfessionalOnboarding }],
  },
  { path: '/nutricionista', element: <Navigate to="/nutritionist" replace /> },
  { path: '/nutricionista/*', element: <Navigate to="/nutritionist" replace /> },
  { path: '/treinos', element: <Navigate to="/app/treinos" replace /> },
  { path: '/dieta', element: <Navigate to="/app/dieta" replace /> },
  { path: '/evolucao', element: <Navigate to="/app/evolucao" replace /> },
  { path: '/perfil', element: <Navigate to="/app/perfil" replace /> },
  { path: '/configuracoes', element: <Navigate to="/app/configuracoes" replace /> },
  {
    path: '/app',
    element: <ProtectedRoute allowedRoles={['student']} />,
    children: [
      {
        element: <RequireStudentOnboarding />,
        children: [
          {
            Component: Layout,
            children: [
              { index: true, Component: Dashboard },
              { path: 'treinos', Component: Workouts },
              { path: 'treinos/novo', Component: StudentWorkoutBuilder },
              { path: 'treino/:workoutId', Component: SessionLogger },
              { path: 'periodizacao', Component: StudentCycles },
              { path: 'periodizacao/novo', Component: StudentCycleEditor },
              { path: 'periodizacao/:id', Component: StudentCycleView },
              { path: 'periodizacao/:id/editar', Component: StudentCycleEditor },
              { path: 'dieta', Component: Diet },
              { path: 'evolucao', Component: PerformanceDashboard },
              { path: 'exercicio/:key', Component: ExerciseHistoryPage },
              { path: 'perfil', Component: Profile },
              { path: 'configuracoes', Component: Settings },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '/personal',
    element: <ProtectedRoute allowedRoles={['personal']} />,
    children: [
      {
        Component: Layout,
        children: [
          { index: true, Component: PersonalDashboard },
          { path: 'criar-treino', Component: CoachWorkoutBuilder },
          { path: 'periodizacao', Component: CoachCycles },
          { path: 'periodizacao/novo', Component: CoachCycleEditor },
          { path: 'periodizacao/:id', Component: CoachCycleView },
          { path: 'periodizacao/:id/editar', Component: CoachCycleEditor },
          { path: 'aluno/:id', element: <Navigate to="evolucao" replace /> },
          { path: 'aluno/:id/evolucao', Component: CoachDashboard },
          { path: 'aluno/:id/exercicio/:key', Component: CoachExerciseHistory },
          { path: 'aluno/:id/medicao', Component: StudentMeasurement },
          { path: 'aluno/:id/restricao', Component: StudentRestriction },
          { path: 'aluno/:id/relatorio', Component: StudentReport },
          { path: 'avaliacao', Component: PersonalAvaliacao },
          { path: 'avaliacao/:studentId', Component: PersonalAvaliacao },
          { path: 'agenda', Component: PersonalAgenda },
          { path: 'financeiro', element: <Navigate to="/personal" replace /> },
          // Perfil do personal agora faz parte do painel principal
          { path: 'perfil', element: <Navigate to="/personal" replace /> },
          { path: 'configuracoes', Component: Settings },
        ],
      },
    ],
  },
  {
    path: '/nutritionist',
    element: <ProtectedRoute allowedRoles={['nutritionist']} />,
    children: [
      {
        Component: Layout,
        children: [
          { index: true, Component: NutritionistDashboard },
          { path: 'paciente/:id', Component: NutritionistPatientDetails },
          { path: 'paciente/:id/evolucao', Component: CoachDashboard },
          { path: 'criar-plano', Component: CreateDietPlan },
          { path: 'criar-plano/:patientId', Component: CreateDietPlan },
          { path: 'consulta/:patientId', Component: NutritionConsultation },
          { path: 'anamnese', Component: NutritionistAnamnese },
          { path: 'anamnese/:patientId', Component: NutritionistAnamnese },
          { path: 'alimentos', Component: NutritionistAlimentos },
          { path: 'financeiro', element: <Navigate to="/nutritionist" replace /> },
          { path: 'perfil', Component: Profile },
          { path: 'configuracoes', Component: Settings },
        ],
      },
    ],
  },
]);

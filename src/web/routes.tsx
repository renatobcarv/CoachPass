'use client'

import { createBrowserRouter, Navigate } from 'react-router';
import { Layout } from './components/Layout';
import { Dashboard } from './components/pages/Dashboard';
import { Workouts } from './components/pages/Workouts';
import { Diet } from './components/pages/Diet';
import { Evolution } from './components/pages/Evolution';
import { Profile } from './components/pages/Profile';
import { Home } from './components/pages/Home';
import { Login } from './components/pages/Login';
import { Register } from './components/pages/Register';
import { PersonalDashboard } from './components/pages/PersonalDashboard';
import { NutritionistDashboard } from './components/pages/NutritionistDashboard';
import { CreateWorkout } from './components/pages/CreateWorkout';
import { StudentDetails } from './components/pages/StudentDetails';
import { StudentMeasurement } from './components/pages/StudentMeasurement';
import { StudentRestriction } from './components/pages/StudentRestriction';
import { StudentReport } from './components/pages/StudentReport';
import { NutritionistPatientDetails } from './components/pages/NutritionistPatientDetails';
import { CreateDietPlan } from './components/pages/CreateDietPlan';
import { NutritionConsultation } from './components/pages/NutritionConsultation';
import { NutritionistAnamnese } from './components/pages/NutritionistAnamnese';
import { NutritionistFinanceiro } from './components/pages/NutritionistFinanceiro';
import { NutritionistAlimentos } from './components/pages/NutritionistAlimentos';
import { PersonalAvaliacao } from './components/pages/PersonalAvaliacao';
import { PersonalAgenda } from './components/pages/PersonalAgenda';
import { PersonalFinanceiro } from './components/pages/PersonalFinanceiro';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Settings } from './components/pages/Settings';
import { PanelSelector } from './components/pages/PanelSelector';
import { StudentOnboarding } from './components/pages/StudentOnboarding';
import { ProfessionalOnboarding } from './components/pages/ProfessionalOnboarding';

export const router = createBrowserRouter([
  { path: '/', Component: Home },
  { path: '/login', Component: Login },
  { path: '/cadastro', Component: Register },
  {
    path: '/selecionar-painel',
    element: <ProtectedRoute allowedRoles={['master']} />,
    children: [{ index: true, Component: PanelSelector }],
  },
  {
    path: '/onboarding/student',
    element: <ProtectedRoute allowedRoles={['student']} />,
    Component: StudentOnboarding,
  },
  {
    path: '/onboarding/professional',
    element: <ProtectedRoute allowedRoles={['personal', 'nutritionist']} />,
    Component: ProfessionalOnboarding,
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
        Component: Layout,
        children: [
          { index: true, Component: Dashboard },
          { path: 'treinos', Component: Workouts },
          { path: 'dieta', Component: Diet },
          { path: 'evolucao', Component: Evolution },
          { path: 'perfil', Component: Profile },
          { path: 'configuracoes', Component: Settings },
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
          { path: 'criar-treino', Component: CreateWorkout },
          { path: 'aluno/:id', Component: StudentDetails },
          { path: 'aluno/:id/medicao', Component: StudentMeasurement },
          { path: 'aluno/:id/restricao', Component: StudentRestriction },
          { path: 'aluno/:id/relatorio', Component: StudentReport },
          { path: 'avaliacao', Component: PersonalAvaliacao },
          { path: 'avaliacao/:studentId', Component: PersonalAvaliacao },
          { path: 'agenda', Component: PersonalAgenda },
          { path: 'financeiro', Component: PersonalFinanceiro },
          { path: 'perfil', Component: Profile },
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
          { path: 'criar-plano', Component: CreateDietPlan },
          { path: 'criar-plano/:patientId', Component: CreateDietPlan },
          { path: 'consulta/:patientId', Component: NutritionConsultation },
          { path: 'anamnese', Component: NutritionistAnamnese },
          { path: 'anamnese/:patientId', Component: NutritionistAnamnese },
          { path: 'alimentos', Component: NutritionistAlimentos },
          { path: 'financeiro', Component: NutritionistFinanceiro },
          { path: 'perfil', Component: Profile },
          { path: 'configuracoes', Component: Settings },
        ],
      },
    ],
  },
]);

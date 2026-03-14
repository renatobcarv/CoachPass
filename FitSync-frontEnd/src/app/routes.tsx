import { createBrowserRouter, Navigate } from 'react-router';
import { Layout } from './components/Layout';
import { Dashboard } from './components/pages/Dashboard';
import { Workouts } from './components/pages/Workouts';
import { Diet } from './components/pages/Diet';
import { Evolution } from './components/pages/Evolution';
import { Profile } from './components/pages/Profile';
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
import { NutritionistCanvas } from './components/pages/NutritionistCanvas';
import { NutritionistCursos } from './components/pages/NutritionistCursos';
import { NutritionistQuestionarios } from './components/pages/NutritionistQuestionarios';
import { NutritionistAlimentos } from './components/pages/NutritionistAlimentos';
import { NutritionistMetas } from './components/pages/NutritionistMetas';
import { NutritionistMaternoInfantil } from './components/pages/NutritionistMaternoInfantil';
import { PersonalAvaliacao } from './components/pages/PersonalAvaliacao';
import { PersonalAgenda } from './components/pages/PersonalAgenda';
import { PersonalPeriodizacao } from './components/pages/PersonalPeriodizacao';
import { PersonalFinanceiro } from './components/pages/PersonalFinanceiro';
import { PersonalMetas } from './components/pages/PersonalMetas';
import { PersonalQuestionarios } from './components/pages/PersonalQuestionarios';
import { PersonalCursos } from './components/pages/PersonalCursos';
import { PersonalCanvas } from './components/pages/PersonalCanvas';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Settings } from './components/pages/Settings';

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/cadastro',
    Component: Register,
  },
  // Redirect Portuguese alias to canonical English route
  {
    path: '/nutricionista',
    element: <Navigate to="/nutritionist" replace />,
  },
  {
    path: '/nutricionista/*',
    element: <Navigate to="/nutritionist" replace />,
  },
  {
    path: '/',
    element: <ProtectedRoute allowedRoles={['student']} />,
    children: [
      {
        path: '/',
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
        path: '/personal',
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
          { path: 'periodizacao', Component: PersonalPeriodizacao },
          { path: 'financeiro', Component: PersonalFinanceiro },
          { path: 'metas', Component: PersonalMetas },
          { path: 'questionarios', Component: PersonalQuestionarios },
          { path: 'cursos', Component: PersonalCursos },
          { path: 'canvas', Component: PersonalCanvas },
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
        path: '/nutritionist',
        Component: Layout,
        children: [
          { index: true, Component: NutritionistDashboard },
          { path: 'paciente/:id', Component: NutritionistPatientDetails },
          { path: 'criar-plano', Component: CreateDietPlan },
          { path: 'criar-plano/:patientId', Component: CreateDietPlan },
          { path: 'consulta/:patientId', Component: NutritionConsultation },
          { path: 'anamnese', Component: NutritionistAnamnese },
          { path: 'anamnese/:patientId', Component: NutritionistAnamnese },
          { path: 'financeiro', Component: NutritionistFinanceiro },
          { path: 'canvas', Component: NutritionistCanvas },
          { path: 'cursos', Component: NutritionistCursos },
          { path: 'questionarios', Component: NutritionistQuestionarios },
          { path: 'alimentos', Component: NutritionistAlimentos },
          { path: 'metas', Component: NutritionistMetas },
          { path: 'materno-infantil', Component: NutritionistMaternoInfantil },
          { path: 'perfil', Component: Profile },
          { path: 'configuracoes', Component: Settings },
        ],
      },
    ],
  },
]);
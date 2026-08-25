export type StudentStatus = 'active' | 'warning' | 'inactive';

export interface ExerciseLog {
  id: string;
  name: string;
  muscleGroup: string;
  sets: number;
  reps: number;
  weightKg: number;
  previousWeightKg?: number;
}

export interface WorkoutSession {
  id: string;
  date: string;
  title: string;
  durationMinutes: number;
  rpe: number; // Rate of Perceived Exertion (1-10)
  exercises: ExerciseLog[];
}

export interface Student {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  goal: string;
  joinedDate: string;
  status: StudentStatus;
  adherencePercentage: number; // 0-100%
  frequencyPerWeek: number;
  expectedFrequencyPerWeek: number;
  currentWeightKg: number;
  targetWeightKg: number;
  workoutsCompletedThisMonth: number;
  recentWorkouts: WorkoutSession[];
}

export interface AIInsight {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  type: 'risk' | 'achievement' | 'suggestion' | 'retention';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  date: string;
  actionRequired?: string;
}

export interface DashboardMetrics {
  totalStudents: number;
  activeStudents: number;
  warningStudents: number;
  avgAdherenceRate: number;
  totalWorkoutsThisMonth: number;
  aiInsightsCount: number;
}

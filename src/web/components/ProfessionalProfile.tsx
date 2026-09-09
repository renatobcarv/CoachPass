import React from 'react';
import { useAuth } from '../context/AuthContext';
import { NutritionistProfile } from './NutritionistProfile';
import { PersonalTrainerProfile } from './PersonalTrainerProfile';

export function ProfessionalProfile() {
  const { user } = useAuth();

  // Verifica se o usuário é profissional
  if (!user || (user.role !== 'personal' && user.role !== 'nutritionist')) {
    return null;
  }

  // Renderiza o perfil específico baseado no tipo de profissional
  if (user.role === 'nutritionist') {
    return <NutritionistProfile />;
  }

  if (user.role === 'personal') {
    return <PersonalTrainerProfile />;
  }

  return null;
}

import React from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { NutritionistProfile } from './NutritionistProfile';

/** Perfil profissional: a nutricionista tem a tela de perfil e pacientes; o personal usa o painel principal. */
export function ProfessionalProfile() {
  const { user } = useAuth();
  if (user?.role === 'nutritionist') return <NutritionistProfile />;
  if (user?.role === 'personal') return <Navigate to="/personal" replace />;
  return null;
}

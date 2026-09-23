import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { ProfessionalProfile } from '../ProfessionalProfile'
import { StudentProfileEditor } from './StudentProfileEditor'

export function Profile() {
  const { user } = useAuth()

  if (user?.role === 'personal' || user?.role === 'nutritionist') {
    return <ProfessionalProfile />
  }

  return <StudentProfileEditor />
}

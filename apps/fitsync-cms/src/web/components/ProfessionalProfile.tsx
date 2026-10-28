import React, { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../context/AuthContext'
import { fetchLinkedPeople, fetchMeUser, type LinkedPerson, type ProfessionalUser } from '../lib/professionalApi'

const card = 'rounded-2xl border dark:border-zinc-800 border-slate-200 dark:bg-zinc-900 bg-white p-5'

export function ProfessionalProfile() {
  const { user } = useAuth()
  const [doc, setDoc] = useState<ProfessionalUser | null>(null)
  const [people, setPeople] = useState<LinkedPerson[]>([])

  useEffect(() => {
    if (!user?.accessToken || !user.id || (user.role !== 'personal' && user.role !== 'nutritionist')) return
    fetchMeUser(user.accessToken).then(setDoc).catch(() => setDoc(null))
    fetchLinkedPeople(user.id, user.role, user.accessToken, 'active').then(setPeople).catch(() => setPeople([]))
  }, [user?.accessToken, user?.id, user?.role])

  if (!user || (user.role !== 'personal' && user.role !== 'nutritionist')) return null

  const name = doc?.name || user.name
  const specialties = (doc?.specialties || []).map((item) => item.value).filter(Boolean)

  return (
    <div className="p-4 sm:p-8 max-w-3xl mx-auto space-y-6">
      <div className={card}>
        <img
          src={doc?.avatarUrl || user.avatar}
          alt={name}
          className="w-16 h-16 rounded-2xl object-cover"
        />
        <h1 className="mt-4 text-2xl font-bold dark:text-white">{name}</h1>
        <p className="text-sm dark:text-zinc-400">
          {user.role === 'personal' ? 'Personal trainer' : 'Nutricionista'}
          {doc?.city ? ` · ${doc.city}` : ''}
        </p>
        {doc?.bio && <p className="mt-3 text-sm dark:text-zinc-300">{doc.bio}</p>}
        {specialties.length > 0 && (
          <p className="mt-2 text-xs dark:text-zinc-500">Especialidades: {specialties.join(', ')}</p>
        )}
        {doc?.instagram && <p className="mt-2 text-xs dark:text-zinc-500">{doc.instagram}</p>}
        <Link to={user.role === 'personal' ? '/personal/configuracoes' : '/nutritionist/configuracoes'} className="inline-block mt-4 text-sm underline">
          Editar perfil
        </Link>
      </div>
      <section className={card}>
        <h2 className="font-semibold dark:text-white mb-3">
          {user.role === 'personal' ? 'Alunos ativos' : 'Pacientes ativos'}
        </h2>
        {people.length === 0 ? (
          <p className="text-sm dark:text-zinc-400">Nenhum vínculo ativo ainda.</p>
        ) : (
          <ul className="space-y-2 text-sm dark:text-zinc-200">
            {people.map((person) => (
              <li key={person.linkId}>{person.name}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

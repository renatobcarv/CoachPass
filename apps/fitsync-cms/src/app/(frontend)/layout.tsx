import React from 'react'
import '@/styles/index.css'

export const metadata = {
  description: 'Treinos, dieta e evolução em um só lugar.',
  title: 'CoachPass',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}

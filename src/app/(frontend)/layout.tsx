import React from 'react'
import '@/styles/index.css'

export const metadata = {
  description: 'Treinos, dieta e evolução em um só lugar.',
  title: 'CoachPass',
  icons: {
    icon: [
      { url: '/brand/favicon.ico', sizes: 'any' },
      { url: '/brand/coachpass-icon.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: '/brand/apple-touch-icon.png',
  },
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}

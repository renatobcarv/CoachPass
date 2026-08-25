import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CoachPass — Gestão Inteligente para Personal Trainers & IA',
  description: 'Plataforma de gestão para personal trainers autônomos. Centralize carteira de alunos, treinos, cargas, repetições, frequência e insights de inteligência artificial.',
  keywords: ['personal trainer', 'gestao de alunos', 'treinos', 'cargas', 'inteligencia artificial', 'coachpass', 'fitness app'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#090d16] text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}

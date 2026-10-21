import React from 'react';
import { Link } from 'react-router';
import { MotionConfig } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { Backdrop, Grain, Logo, Reveal, SplitWords } from './Brand';

/** Moldura das telas de autenticação: painel de marca à esquerda, conteúdo à direita. */
export function AuthShell({
  title,
  accent,
  lead,
  aside,
  children,
}: {
  title: string;
  accent: string;
  lead: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <MotionConfig reducedMotion="user">
      <div className="cp-brand relative min-h-screen grid lg:grid-cols-[1fr_1.05fr]">
        <Grain />

        <aside className="relative hidden lg:flex flex-col justify-between p-12 xl:p-16 overflow-hidden border-r border-[var(--line)]">
          <Backdrop variant="auth" />
          <div className="relative">
            <Logo tagline="Treino · dieta · evolução" />
          </div>
          <div className="relative max-w-[520px]">
            <h1 className="cp-display text-[clamp(44px,4.6vw,72px)] font-[760] leading-[0.98]">
              <SplitWords text={title} immediate delay={0.1} />{' '}
              <SplitWords text={accent} immediate delay={0.35} className="cp-accent" />
            </h1>
            <Reveal delay={0.6}>
              <p className="mt-6 text-[17px] leading-relaxed text-[var(--muted)]">{lead}</p>
            </Reveal>
            {aside && <Reveal delay={0.75}>{aside}</Reveal>}
          </div>
          <p className="relative cp-mono text-[12px] text-[var(--dim)]">
            Dados de alunos tratados conforme a LGPD, com acesso restrito por perfil.
          </p>
        </aside>

        <main className="relative flex flex-col px-4 sm:px-10 py-8 lg:py-12">
          <div className="lg:hidden absolute inset-0 overflow-hidden pointer-events-none">
            <Backdrop variant="auth" />
          </div>
          <div className="relative flex items-center justify-between">
            <div className="lg:hidden">
              <Logo />
            </div>
            <Link
              to="/"
              className="ml-auto inline-flex items-center gap-2 text-[14px] text-[var(--muted)] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para a home
            </Link>
          </div>
          <div className="relative flex-1 flex items-center justify-center py-10">{children}</div>
        </main>
      </div>
    </MotionConfig>
  );
}

export function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="cp-mono block mb-2 text-[11.5px] uppercase tracking-[0.12em] text-[var(--muted)]">
      {children}
    </label>
  );
}

import React, { useEffect, useMemo, useState } from 'react';
import { Link, NavLink } from 'react-router';
import { MotionConfig } from 'motion/react';
import { ArrowLeft, ArrowUp, Mail } from 'lucide-react';
import { Backdrop, Grain, Logo, Reveal, SplitWords } from '../../brand/Brand';
import { CONTACT_EMAIL, type LegalBlock, type LegalDoc } from './content';

const tabs = [
  { to: '/privacidade', label: 'Privacidade' },
  { to: '/termos', label: 'Termos de Uso' },
];

function Block({ block }: { block: LegalBlock }) {
  if (typeof block === 'string') {
    return <p className="text-[16px] leading-[1.75] text-[var(--paper-muted)]">{block}</p>;
  }
  if ('note' in block) {
    return <h3 className="cp-display pt-2 text-[18px] font-bold text-[var(--paper-ink)]">{block.note}</h3>;
  }
  return (
    <ul className="space-y-2">
      {block.list.map((item) => (
        <li key={item} className="flex gap-3 text-[15.5px] leading-[1.65] text-[var(--paper-muted)]">
          <span className="mt-[0.6em] w-1.5 h-1.5 shrink-0 rounded-full bg-[var(--blue)]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-20% 0px -70% 0px' },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

export function LegalPage({ doc }: { doc: LegalDoc }) {
  const ids = useMemo(() => doc.sections.map((s) => s.id), [doc]);
  const active = useActiveSection(ids);

  useEffect(() => {
    window.scrollTo(0, 0);
    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = 'smooth';
    return () => {
      root.style.scrollBehavior = previous;
    };
  }, [doc]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="cp-brand min-h-screen">
        <Grain />

        <header className="relative overflow-hidden border-b border-[var(--line)]">
          <Backdrop variant="auth" />
          <div className="relative max-w-[1200px] mx-auto px-4 sm:px-8">
            <div className="h-[68px] flex items-center justify-between gap-4">
              <Logo />
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-[14px] text-[var(--muted)] hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Voltar para a home</span>
                <span className="sm:hidden">Home</span>
              </Link>
            </div>

            <div className="pt-14 pb-12 sm:pt-20 sm:pb-16 max-w-3xl">
              <nav className="inline-flex p-1 rounded-full border border-[var(--line-2)] bg-white/[0.03]" aria-label="Documentos legais">
                {tabs.map((t) => (
                  <NavLink
                    key={t.to}
                    to={t.to}
                    className={({ isActive }) =>
                      `px-4 h-9 inline-flex items-center rounded-full text-[13.5px] font-medium transition-colors ${
                        isActive ? 'bg-[var(--cream)] text-[var(--ink)]' : 'text-[var(--muted)] hover:text-white'
                      }`
                    }
                  >
                    {t.label}
                  </NavLink>
                ))}
              </nav>
              <h1 key={doc.kicker} className="cp-display mt-8 text-[clamp(40px,5.6vw,76px)] font-[760] leading-[0.98]">
                <SplitWords text={doc.title} immediate />{' '}
                <SplitWords text={doc.accent} immediate delay={0.2} className="cp-accent" />
              </h1>
              <Reveal delay={0.35}>
                <p className="cp-mono mt-6 text-[12.5px] text-[var(--dim)]">
                  {doc.kicker} · Versão {doc.version} · Atualizada em {doc.updatedAt}
                </p>
              </Reveal>
            </div>
          </div>
        </header>

        <div className="cp-paper relative">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-16 sm:py-20 grid lg:grid-cols-[260px_1fr] gap-12 lg:gap-16">
            <aside className="hidden lg:block">
              <div className="sticky top-8">
                <p className="cp-kicker">Nesta página</p>
                <ol className="mt-4 space-y-0.5 border-l border-[var(--paper-line)]">
                  {doc.sections.map((s, i) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className={`-ml-px flex gap-3 border-l-2 pl-4 py-1.5 text-[13.5px] leading-snug transition-colors ${
                          active === s.id
                            ? 'border-[var(--blue)] text-[var(--paper-ink)] font-medium'
                            : 'border-transparent text-[var(--paper-muted)] hover:text-[var(--paper-ink)]'
                        }`}
                      >
                        <span className="cp-mono text-[11px] pt-[2px] opacity-60">{String(i + 1).padStart(2, '0')}</span>
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            </aside>

            <article className="max-w-[760px]">
              <div className="space-y-4 pb-10 border-b border-[var(--paper-line)]">
                {doc.intro.map((p) => (
                  <p key={p} className="text-[18px] leading-[1.7] text-[var(--paper-ink)]">
                    {p}
                  </p>
                ))}
              </div>

              {doc.sections.map((s, i) => (
                <section key={s.id} id={s.id} className="scroll-mt-8 py-10 border-b border-[var(--paper-line)]">
                  <p className="cp-mono text-[12px] text-[var(--paper-muted)]">{String(i + 1).padStart(2, '0')}</p>
                  <h2 className="cp-display mt-1 text-[clamp(24px,2.6vw,32px)] font-bold leading-tight">{s.title}</h2>
                  <div className="mt-5 space-y-4">
                    {s.blocks.map((b, j) => (
                      <Block key={j} block={b} />
                    ))}
                  </div>
                </section>
              ))}

              <div className="mt-12 cp-card p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div>
                  <h3 className="cp-display text-[22px] font-bold">Ficou alguma dúvida?</h3>
                  <p className="mt-1 text-[15px] text-[var(--paper-muted)]">
                    Fale com a gente sobre privacidade, dados ou estes termos.
                  </p>
                </div>
                <a href={`mailto:${CONTACT_EMAIL}`} className="cp-btn-ghost shrink-0">
                  <Mail className="w-4 h-4" />
                  {CONTACT_EMAIL}
                </a>
              </div>
            </article>
          </div>
        </div>

        <footer className="border-t border-[var(--line)] bg-[var(--ink-2)]">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[12px] text-[var(--dim)]">
              © {new Date().getFullYear()} CoachPass · {doc.kicker} v{doc.version} · {doc.updatedAt}
            </p>
            <div className="flex items-center gap-5 text-[13px]">
              <Link to="/login" className="text-[var(--muted)] hover:text-white transition-colors">
                Entrar
              </Link>
              <Link to="/cadastro" className="text-[var(--muted)] hover:text-white transition-colors">
                Criar conta
              </Link>
              <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo(0, 0); }} className="inline-flex items-center gap-1 text-[var(--muted)] hover:text-white transition-colors">
                Topo <ArrowUp className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}

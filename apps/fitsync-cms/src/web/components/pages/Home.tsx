import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import {
  Apple,
  ArrowRight,
  ArrowUp,
  CalendarCheck,
  ClipboardList,
  Compass,
  Dumbbell,
  Github,
  HeartHandshake,
  LineChart,
  Lock,
  Menu,
  Moon,
  Sun,
  Target,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const REPO_URL = 'https://github.com/renatobcarv/CoachPass';

const nav = [
  { href: '#inicio', label: 'Início' },
  { href: '#recursos', label: 'Recursos' },
  { href: '#alunos', label: 'Para alunos' },
  { href: '#profissionais', label: 'Para profissionais' },
  { href: '#sobre', label: 'Sobre' },
];

const valores = [
  {
    icon: Lock,
    title: 'Dado de aluno é dado sensível',
    text: 'Peso, restrição alimentar e histórico de treino não circulam entre contas. Cada perfil abre só o que é dele, e o acesso segue os requisitos da LGPD.',
  },
  {
    icon: HeartHandshake,
    title: 'Quem decide é o profissional',
    text: 'A plataforma organiza o que foi registrado e mostra onde olhar. A prescrição, o ajuste de carga e a conduta continuam sendo do personal e do nutricionista.',
  },
  {
    icon: ClipboardList,
    title: 'Menos tela, mais dia',
    text: 'Se um campo não muda a conduta de ninguém, ele não entra. O aluno abre o app para ver o treino de hoje, não para preencher formulário.',
  },
  {
    icon: LineChart,
    title: 'Evolução vem de registro, não de memória',
    text: 'Carga, frequência e medida ficam guardadas com data. A evolução que aparece no painel é a soma do que foi realmente anotado.',
  },
];

const etapas = [
  {
    icon: Users,
    title: 'A conta já sabe quem você é',
    text: 'No cadastro você escolhe entre aluno e profissional. No login não existe seletor de painel: o sistema abre o lugar certo pelo perfil da conta.',
  },
  {
    icon: Dumbbell,
    title: 'O profissional monta o plano',
    text: 'O personal cria o treino com série, repetição e carga. O nutricionista monta as refeições do dia com a restrição do aluno já em mãos.',
  },
  {
    icon: CalendarCheck,
    title: 'O aluno executa e registra',
    text: 'Exercício feito, refeição seguida, água do dia e peso da semana. Tudo em poucos toques, sem planilha paralela.',
  },
  {
    icon: LineChart,
    title: 'O acompanhamento fica visível',
    text: 'Adesão caindo, semana sem registro, carga travada há três treinos. O painel mostra quem precisa de atenção antes do próximo atendimento.',
  },
];

function Logo({ className = '' }: { className?: string }) {
  return (
    <Link to="/" className={`group flex items-center gap-2.5 ${className}`}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#000326] to-[#000346] shadow-[0_2px_10px_rgba(90,100,180,0.25)] transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
        <Zap className="w-5 h-5 text-white" fill="white" />
      </div>
      <span className="text-lg font-bold tracking-tight text-[#000326] dark:text-white">CoachPass</span>
    </Link>
  );
}

function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
      title={isDark ? 'Tema claro' : 'Tema escuro'}
      className={`group relative w-9 h-9 rounded-xl flex items-center justify-center border border-slate-200/80 bg-white/70 text-slate-500 transition duration-200 hover:-translate-y-0.5 hover:text-[#000326] dark:text-[#C5C5CE] hover:border-[#000326]/20 dark:hover:border-white/20 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:text-[#C5C5CE] dark:hover:border-white/20 ${className}`}
    >
      <Sun
        className={`absolute w-4 h-4 transition-all duration-300 ${
          isDark ? 'opacity-0 -rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
        }`}
      />
      <Moon
        className={`absolute w-4 h-4 transition-all duration-300 ${
          isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'
        }`}
      />
    </button>
  );
}

function ScreenFrame({
  title,
  accent,
  children,
}: {
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-24px_rgba(15,23,42,0.25)] hover:border-[#000326]/20 dark:hover:border-white/20 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none dark:hover:border-white/20 dark:hover:shadow-[0_18px_40px_-24px_rgba(0,0,0,0.8)]">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50/70 dark:border-white/5 dark:bg-white/[0.03]">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: accent }} />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</p>
      </div>
      <div className="p-4 space-y-3">{children}</div>
    </div>
  );
}

function Bar({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50/80 px-3 py-2.5 transition-colors duration-200 hover:bg-[#000326]/5 dark:bg-white/[0.04] dark:hover:bg-white/10">
      <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{value}</span>
    </div>
  );
}

function SectionLabel({ children, tone = 'brand' }: { children: React.ReactNode; tone?: 'brand' | 'sky' }) {
  const color =
    tone === 'brand'
      ? 'text-[#000326] dark:text-[#C5C5CE] bg-[#000326]/5 dark:bg-white/10 dark:text-[#C5C5CE] dark:bg-white/10'
      : 'text-sky-700 bg-sky-50 dark:text-sky-400 dark:bg-sky-500/10';
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase ${color}`}>
      {children}
    </span>
  );
}

function FooterLink({ href, children, external }: { href: string; children: React.ReactNode; external?: boolean }) {
  const cls =
    'group inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors duration-200 hover:text-[#000326] dark:text-slate-400 dark:hover:text-[#C5C5CE]';
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        <span className="transition-transform duration-200 group-hover:translate-x-0.5">{children}</span>
      </a>
    );
  }
  if (href.startsWith('#')) {
    return (
      <a href={href} className={cls}>
        <span className="transition-transform duration-200 group-hover:translate-x-0.5">{children}</span>
      </a>
    );
  }
  return (
    <Link to={href} className={cls}>
      <span className="transition-transform duration-200 group-hover:translate-x-0.5">{children}</span>
    </Link>
  );
}

export function Home() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('inicio');
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = 'smooth';
    return () => {
      root.style.scrollBehavior = previous;
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sections = nav
      .map((item) => document.getElementById(item.href.slice(1)))
      .filter((el): el is HTMLElement => Boolean(el));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: [0.05, 0.2, 0.5] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const handleHeroMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const el = heroRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--spot-x', `${event.clientX - rect.left}px`);
    el.style.setProperty('--spot-y', `${event.clientY - rect.top}px`);
  };

  return (
    <div className="min-h-screen bg-[#f3f4f9] text-slate-700 dark:bg-[#000326] dark:text-slate-300">
      <header
        className={`sticky top-0 z-30 border-b transition-all duration-300 ${
          scrolled
            ? 'border-slate-200/80 bg-[#f3f4f9]/90 backdrop-blur-md shadow-[0_6px_24px_-20px_rgba(15,23,42,0.5)] dark:border-white/10 dark:bg-[#000326]/90 dark:shadow-[0_6px_24px_-18px_rgba(0,0,0,0.9)]'
            : 'border-transparent bg-[#f3f4f9]/70 backdrop-blur dark:bg-[#000326]/70'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-7">
            {nav.map((item) => {
              const id = item.href.slice(1);
              const isActive = active === id;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`relative text-sm transition-colors duration-200 ${
                    isActive
                      ? 'text-[#000326] dark:text-white'
                      : 'text-slate-500 hover:text-[#000326] dark:text-slate-400 dark:hover:text-slate-100'
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute -bottom-1.5 left-0 h-0.5 w-full origin-left rounded-full bg-[#000326] dark:bg-white transition-transform duration-300 ${
                      isActive ? 'scale-x-100' : 'scale-x-0'
                    }`}
                  />
                </a>
              );
            })}
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/cadastro"
              className="text-sm text-slate-500 transition-colors duration-200 hover:text-[#000326] dark:text-slate-400 dark:hover:text-slate-100"
            >
              Criar conta
            </Link>
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-br from-[#000326] to-[#000137] shadow-[0_2px_10px_rgba(0,3,70,0.25)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-8px_rgba(0,3,70,0.5)] active:translate-y-0"
            >
              Entrar
            </Link>
          </div>
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              className="w-9 h-9 rounded-xl bg-white/70 border border-slate-200/70 flex items-center justify-center text-slate-600 transition-colors hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
              onClick={() => setOpen((v) => !v)}
              aria-label="Abrir menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {open && (
          <div className="md:hidden border-t border-slate-200/70 px-4 py-3 space-y-1 bg-[#f3f4f9] dark:border-white/10 dark:bg-[#000326]">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block py-2 text-sm text-slate-600 transition-colors hover:text-[#000326] dark:text-[#C5C5CE] dark:hover:text-[#C5C5CE]"
              >
                {item.label}
              </a>
            ))}
            <div className="pt-2 flex items-center gap-3">
              <Link
                to="/cadastro"
                onClick={() => setOpen(false)}
                className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-200 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
              >
                Criar conta
              </Link>
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-br from-[#000326] to-[#000137]"
              >
                Entrar
              </Link>
            </div>
          </div>
        )}
      </header>

      <main>
        <section
          id="inicio"
          ref={heroRef}
          onMouseMove={handleHeroMove}
          className="group relative overflow-hidden scroll-mt-20"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background:
                'radial-gradient(420px circle at var(--spot-x, 50%) var(--spot-y, 30%), rgba(90,100,180,0.12), transparent 70%)',
            }}
          />
          <div className="pointer-events-none absolute -top-32 -right-24 w-[420px] h-[420px] rounded-full bg-[#000346]/30 blur-3xl dark:bg-[#000346]/60" />
          <div className="relative max-w-6xl mx-auto px-4 py-20 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <SectionLabel>Uma plataforma, três papéis</SectionLabel>
              <h1 className="mt-4 text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1] text-[#000326] dark:text-white">
                Personal, nutricionista e aluno no mesmo lugar.
              </h1>
              <p className="mt-5 text-lg text-slate-600 max-w-xl leading-relaxed dark:text-slate-400">
                Quem prescreve o treino, quem cuida da alimentação e quem executa o plano usam a mesma conta. O
                histórico do aluno para de morar em planilha, print e conversa de WhatsApp.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/login"
                  className="group/btn inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-br from-[#000326] to-[#000137] shadow-[0_2px_12px_rgba(0,3,70,0.28)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_26px_-10px_rgba(0,3,70,0.55)] active:translate-y-0"
                >
                  Entrar
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
                </Link>
                <a
                  href="#recursos"
                  className="px-5 py-3 rounded-xl text-sm font-semibold text-slate-700 border border-slate-200/80 bg-white/70 transition duration-200 hover:-translate-y-0.5 hover:bg-white hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:border-white/20"
                >
                  Como funciona
                </a>
              </div>
              <dl className="mt-10 grid grid-cols-3 gap-4 max-w-md">
                {[
                  { k: '3', v: 'perfis de acesso' },
                  { k: '1', v: 'login para todos' },
                  { k: '0', v: 'planilha paralela' },
                ].map((item) => (
                  <div
                    key={item.v}
                    className="rounded-xl bg-white/60 border border-slate-200/60 px-3 py-3 dark:border-white/10 dark:bg-white/[0.04]"
                  >
                    <dt className="text-2xl font-bold text-[#000326] dark:text-white">{item.k}</dt>
                    <dd className="mt-0.5 text-xs text-slate-500 leading-snug dark:text-slate-400">{item.v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <ScreenFrame title="Painel do aluno" accent="#000346">
              <Bar label="Treino de hoje" value="Push A" />
              <Bar label="Calorias" value="1.420 / 2.200" />
              <Bar label="Água" value="1,5 L" />
              <Bar label="Peso da semana" value="78,4 kg" />
            </ScreenFrame>
          </div>
        </section>

        <section
          id="recursos"
          className="bg-white/55 border-y border-slate-200/70 scroll-mt-20 dark:bg-white/[0.02] dark:border-white/10"
        >
          <div className="max-w-6xl mx-auto px-4 py-16">
            <SectionLabel>Recursos</SectionLabel>
            <h2 className="mt-4 text-3xl font-bold text-[#000326] dark:text-white">Para que serve</h2>
            <p className="mt-3 text-slate-600 max-w-2xl leading-relaxed dark:text-slate-400">
              Cada pessoa vê o que precisa fazer hoje. O profissional prescreve e acompanha, o aluno executa e
              registra.
            </p>
            <div className="mt-10 grid md:grid-cols-3 gap-4">
              {[
                {
                  icon: Dumbbell,
                  title: 'Treino claro',
                  text: 'Série, repetição e carga escritas pelo personal. O aluno marca o que já fez e o que ficou para trás.',
                },
                {
                  icon: Apple,
                  title: 'Alimentação no mesmo app',
                  text: 'O plano do nutricionista aparece junto do treino, com a restrição alimentar sempre à vista.',
                },
                {
                  icon: Users,
                  title: 'Um vínculo só',
                  text: 'Aluno, personal e nutricionista ficam ligados na mesma conta. Ninguém precisa reenviar ficha.',
                },
              ].map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="group rounded-2xl border border-slate-200/70 bg-white/80 p-5 transition duration-300 hover:-translate-y-1 hover:border-[#000326]/20 dark:hover:border-white/20 hover:shadow-[0_18px_40px_-28px_rgba(15,23,42,0.3)] dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/20 dark:hover:bg-white/[0.06]"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-4 transition-colors duration-300 group-hover:bg-[#000326]/5 dark:bg-white/5 dark:bg-white/5 dark:group-hover:bg-white/15">
                    <Icon className="w-5 h-5 text-slate-500 transition-colors duration-300 group-hover:text-[#000326] dark:text-[#C5C5CE] dark:group-hover:text-[#C5C5CE]" />
                  </div>
                  <h3 className="font-semibold text-[#000326] dark:text-white">{title}</h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed dark:text-slate-400">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-16">
          <SectionLabel>Do cadastro ao acompanhamento</SectionLabel>
          <h2 className="mt-4 text-3xl font-bold text-[#000326] dark:text-white">Como o dia funciona na prática</h2>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {etapas.map(({ icon: Icon, title, text }, i) => (
              <div
                key={title}
                className="group relative rounded-2xl border border-slate-200/70 bg-white/70 p-5 transition duration-300 hover:-translate-y-1 hover:bg-white hover:border-[#000326]/20 dark:hover:border-white/20 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06] dark:hover:border-white/20"
              >
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">0{i + 1}</span>
                <Icon className="mt-3 w-5 h-5 text-[#000326] dark:text-[#C5C5CE] transition-transform duration-300 group-hover:scale-110 dark:text-[#C5C5CE]" />
                <h3 className="mt-3 font-semibold text-[#000326] dark:text-white leading-snug dark:text-white">{title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed dark:text-slate-400">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="alunos"
          className="bg-white/55 border-y border-slate-200/70 scroll-mt-20 dark:bg-white/[0.02] dark:border-white/10"
        >
          <div className="max-w-6xl mx-auto px-4 py-16 grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <SectionLabel>Para alunos</SectionLabel>
              <h2 className="mt-4 text-3xl font-bold text-[#000326] dark:text-white">O dia, sem ruído</h2>
              <p className="mt-3 text-slate-600 leading-relaxed dark:text-slate-400">
                O aluno abre o app e vê o que tem para fazer hoje. Nada de ficha de profissional, campo técnico ou
                relatório que ele não vai usar.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Treino do dia com os exercícios na ordem, para marcar conforme executa',
                  'Refeições, calorias e água acompanhadas no mesmo lugar',
                  'Peso e medidas registrados por semana, virando gráfico de evolução',
                  'Histórico que fica guardado mesmo depois de trocar de profissional',
                ].map((item) => (
                  <li
                    key={item}
                    className="group flex gap-3 rounded-xl px-3 py-2.5 transition-colors duration-200 hover:bg-[#000326]/5 dark:hover:bg-white/10"
                  >
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#000326] dark:bg-white shrink-0 transition-transform duration-200 group-hover:scale-150" />
                    <span className="text-sm text-slate-600 leading-relaxed dark:text-slate-400">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <ScreenFrame title="Início do aluno" accent="#000346">
              <div className="rounded-xl bg-[#000326]/5 dark:bg-white/10 px-3 py-3 text-sm text-[#000326] transition-colors duration-200 hover:bg-[#000326]/10 dark:bg-white/15 dark:text-[#C5C5CE] dark:hover:bg-white/25">
                Supino reto · 4×8–10 · feito
              </div>
              <div className="rounded-xl bg-slate-50/80 px-3 py-3 text-sm text-slate-500 transition-colors duration-200 hover:bg-slate-100 dark:bg-white/[0.04] dark:text-slate-400 dark:hover:bg-white/[0.08]">
                Remada curvada · 4×10 · pendente
              </div>
              <Bar label="Próxima refeição" value="Almoço" />
              <Bar label="Adesão do mês" value="86%" />
            </ScreenFrame>
          </div>
        </section>

        <section id="profissionais" className="max-w-6xl mx-auto px-4 py-16 scroll-mt-20">
          <SectionLabel tone="sky">Para profissionais</SectionLabel>
          <h2 className="mt-4 text-3xl font-bold text-[#000326] dark:text-white">Dois painéis, a mesma plataforma</h2>
          <p className="mt-3 text-slate-600 max-w-2xl leading-relaxed dark:text-slate-400">
            A carteira de alunos abre como lista de trabalho. Dá para prescrever, avaliar e registrar consulta sem
            sair da tela do paciente.
          </p>
          <div className="mt-10 grid lg:grid-cols-2 gap-6">
            <ScreenFrame title="Personal" accent="#3b82f6">
              <Bar label="Alunos ativos" value="4" />
              <Bar label="Sessão de hoje" value="Maria · 19:00" />
              <Bar label="Precisam de atenção" value="1" />
              <p className="text-sm text-slate-500 leading-relaxed dark:text-slate-400">
                Criar treino, lançar avaliação física e ver quem parou de registrar, direto na lista.
              </p>
            </ScreenFrame>
            <ScreenFrame title="Nutricionista" accent="#f59e0b">
              <Bar label="Pacientes ativos" value="2" />
              <Bar label="Última consulta" value="Há 3 dias" />
              <Bar label="Anamnese pendente" value="1" />
              <p className="text-sm text-slate-500 leading-relaxed dark:text-slate-400">
                Montar plano alimentar, abrir a consulta e consultar a anamnese sem pedir os dados de novo.
              </p>
            </ScreenFrame>
          </div>
        </section>

        <section
          id="sobre"
          className="bg-white/55 border-y border-slate-200/70 scroll-mt-20 dark:bg-white/[0.02] dark:border-white/10"
        >
          <div className="max-w-6xl mx-auto px-4 py-16">
            <SectionLabel>Sobre</SectionLabel>
            <h2 className="mt-4 text-3xl font-bold text-[#000326] dark:text-white">O que é o CoachPass</h2>
            <p className="mt-4 text-slate-600 max-w-3xl leading-relaxed dark:text-slate-400">
              O CoachPass nasceu de um problema comum entre profissionais autônomos: a informação do aluno existe,
              mas está espalhada. Frequência num caderno, carga num print, peso numa planilha, combinado no
              WhatsApp. A plataforma junta esse acompanhamento num painel só e usa análise de dados para apontar
              onde olhar primeiro.
            </p>

            <div className="mt-10 grid md:grid-cols-2 gap-4">
              <div className="group rounded-2xl border border-slate-200/70 bg-white/80 p-6 transition duration-300 hover:-translate-y-1 hover:border-[#000326]/20 dark:hover:border-white/20 hover:shadow-[0_18px_40px_-28px_rgba(15,23,42,0.3)] dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/20 dark:hover:bg-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#000326]/5 dark:bg-white/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-105 dark:bg-white/15">
                    <Target className="w-5 h-5 text-[#000326] dark:text-[#C5C5CE]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#000326] dark:text-white">Missão</h3>
                </div>
                <p className="mt-4 text-sm text-slate-600 leading-relaxed dark:text-slate-400">
                  Reunir num lugar só o que hoje fica dividido entre planilha, ficha de treino e conversa de
                  aplicativo, para que o profissional acompanhe cada aluno sem perder tempo juntando informação
                  antes do atendimento.
                </p>
              </div>
              <div className="group rounded-2xl border border-slate-200/70 bg-white/80 p-6 transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-[0_18px_40px_-28px_rgba(15,23,42,0.3)] dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-sky-500/30 dark:hover:bg-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center transition-transform duration-300 group-hover:scale-105 dark:bg-sky-500/15">
                    <Compass className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#000326] dark:text-white">Visão</h3>
                </div>
                <p className="mt-4 text-sm text-slate-600 leading-relaxed dark:text-slate-400">
                  Ser a ferramenta que o personal e o nutricionista abrem antes de atender, e não aquela que fica
                  esquecida depois do cadastro. O objetivo é que a decisão do dia a dia passe a ser tomada com
                  dados, não com lembrança.
                </p>
              </div>
            </div>

            <div className="mt-12">
              <h3 className="text-xl font-semibold text-[#000326] dark:text-white">Valores</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                O que a gente usa para decidir o que entra no produto.
              </p>
              <div className="mt-6 grid sm:grid-cols-2 gap-4">
                {valores.map(({ icon: Icon, title, text }) => (
                  <div
                    key={title}
                    className="group flex gap-4 rounded-2xl border border-slate-200/70 bg-white/70 p-5 transition duration-300 hover:-translate-y-1 hover:bg-white hover:border-[#000326]/20 dark:hover:border-white/20 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06] dark:hover:border-white/20"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 transition-colors duration-300 group-hover:bg-[#000326]/5 dark:bg-white/5 dark:bg-white/5 dark:group-hover:bg-white/15">
                      <Icon className="w-5 h-5 text-slate-500 transition-colors duration-300 group-hover:text-[#000326] dark:text-[#C5C5CE] dark:group-hover:text-[#C5C5CE]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#000326] dark:text-white leading-snug dark:text-white">{title}</h4>
                      <p className="mt-2 text-sm text-slate-600 leading-relaxed dark:text-slate-400">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-gradient-to-br from-white to-[#e8e9f2] px-6 py-12 text-center dark:border-white/10 dark:from-white/[0.04] dark:to-[#000346]">
            <div className="pointer-events-none absolute -bottom-24 left-1/2 -translate-x-1/2 w-[520px] h-[240px] rounded-full bg-[#000346]/30 blur-3xl dark:bg-[#000346]/60" />
            <h2 className="relative text-2xl sm:text-3xl font-bold text-[#000326] dark:text-white">
              Seu acompanhamento começa com um login
            </h2>
            <p className="relative mt-3 text-slate-600 max-w-xl mx-auto leading-relaxed dark:text-slate-400">
              A conta já vem com o perfil definido. Depois de entrar, o painel certo abre sozinho.
            </p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/cadastro"
                className="group/cta inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-br from-[#000326] to-[#000137] shadow-[0_2px_12px_rgba(0,3,70,0.28)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_26px_-10px_rgba(0,3,70,0.55)]"
              >
                Criar conta
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/cta:translate-x-1" />
              </Link>
              <Link
                to="/login"
                className="px-5 py-3 rounded-xl text-sm font-semibold text-slate-700 border border-slate-200/80 bg-white/80 transition duration-200 hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
              >
                Já tenho conta
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200/70 bg-white/70 dark:border-white/10 dark:bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-4 py-14">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <Logo />
              <p className="mt-4 text-sm text-slate-500 max-w-sm leading-relaxed dark:text-slate-400">
                Gestão, acompanhamento e análise de dados para personal trainers e nutricionistas que cuidam da
                própria carteira de alunos.
              </p>
              <div className="mt-5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-xs text-slate-500 dark:text-slate-400">Projeto em desenvolvimento · MVP</span>
              </div>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-600 border border-slate-200/80 bg-white/70 transition duration-200 hover:-translate-y-0.5 hover:bg-white hover:text-[#000326] dark:text-white dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <Github className="w-4 h-4" />
                Repositório no GitHub
              </a>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-[#000326] dark:text-white">Plataforma</h4>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <FooterLink href="#recursos">Recursos</FooterLink>
                </li>
                <li>
                  <FooterLink href="#alunos">Para alunos</FooterLink>
                </li>
                <li>
                  <FooterLink href="#profissionais">Para profissionais</FooterLink>
                </li>
                <li>
                  <FooterLink href="#sobre">Sobre o projeto</FooterLink>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-[#000326] dark:text-white">Perfis</h4>
              <ul className="mt-4 space-y-2.5">
                <li className="text-sm text-slate-500 dark:text-slate-400">Aluno: executa e registra o plano</li>
                <li className="text-sm text-slate-500 dark:text-slate-400">Personal: treino, avaliação e agenda</li>
                <li className="text-sm text-slate-500 dark:text-slate-400">
                  Nutricionista: plano alimentar e consulta
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-[#000326] dark:text-white">Acesso</h4>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <FooterLink href="/login">Entrar</FooterLink>
                </li>
                <li>
                  <FooterLink href="/cadastro">Criar conta</FooterLink>
                </li>
                <li>
                  <FooterLink href="/login">Recuperar senha</FooterLink>
                </li>
              </ul>
              <div className="mt-5 flex items-start gap-2 rounded-xl bg-slate-50/80 px-3 py-3 dark:bg-white/[0.04]">
                <Lock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0 dark:text-slate-500" />
                <p className="text-xs text-slate-500 leading-relaxed dark:text-slate-400">
                  Dados de alunos tratados conforme a LGPD, com acesso restrito por perfil.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-slate-200/70 flex flex-col sm:flex-row items-center justify-between gap-4 dark:border-white/10">
            <p className="text-xs text-slate-400 text-center sm:text-left dark:text-slate-500">
              © {new Date().getFullYear()} CoachPass · Centralizar informações, identificar padrões, apoiar
              decisões.
            </p>
            <a
              href="#inicio"
              className="group inline-flex items-center gap-1.5 text-xs text-slate-500 transition-colors duration-200 hover:text-[#000326] dark:text-slate-400 dark:hover:text-[#C5C5CE]"
            >
              Voltar ao topo
              <ArrowUp className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

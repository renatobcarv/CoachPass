import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import {
  motion,
  MotionConfig,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import {
  Apple,
  ArrowUp,
  CalendarCheck,
  Check,
  ClipboardList,
  Compass,
  Droplets,
  Dumbbell,
  Flame,
  Github,
  HeartHandshake,
  LineChart,
  Lock,
  Menu,
  Salad,
  Stethoscope,
  Target,
  TrendingUp,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import { Backdrop, CTAButton, Counter, Grain, Logo, Reveal, ScrollProgress, SplitWords } from '../brand/Brand';

const REPO_URL = 'https://github.com/renatobcarv/CoachPass';
const EASE = [0.2, 0.8, 0.2, 1] as const;

const nav = [
  { href: '#recursos', label: 'Recursos' },
  { href: '#como-funciona', label: 'Como funciona' },
  { href: '#perfis', label: 'Para quem é' },
  { href: '#sobre', label: 'Sobre' },
];

const marquee = [
  'Treino do dia',
  'Plano alimentar',
  'Avaliação física',
  'Anamnese',
  'Agenda',
  'Evolução semanal',
  'Restrição alimentar',
  'Periodização',
  'Questionários',
  'Treino com IA',
];

const dores = [
  { k: 'Frequência', v: 'num caderno' },
  { k: 'Carga', v: 'num print da galeria' },
  { k: 'Peso', v: 'numa planilha que só um abre' },
  { k: 'O combinado', v: 'perdido no WhatsApp' },
  { k: 'A restrição alimentar', v: 'só na memória' },
];

const etapas = [
  {
    icon: Users,
    file: 'perfil.conta',
    title: 'A conta já sabe quem você é',
    text: 'No cadastro você escolhe entre aluno e profissional. No login não existe seletor de painel: o sistema abre o lugar certo pelo perfil da conta.',
  },
  {
    icon: Dumbbell,
    file: 'plano.treino',
    title: 'O profissional monta o plano',
    text: 'O personal cria o treino com série, repetição e carga. O nutricionista monta as refeições do dia com a restrição do aluno já em mãos.',
  },
  {
    icon: CalendarCheck,
    file: 'registro.hoje',
    title: 'O aluno executa e registra',
    text: 'Exercício feito, refeição seguida, água do dia e peso da semana. Tudo em poucos toques, sem planilha paralela.',
  },
  {
    icon: LineChart,
    file: 'painel.semana',
    title: 'O acompanhamento fica visível',
    text: 'Adesão caindo, semana sem registro, carga travada há três treinos. O painel mostra quem precisa de atenção antes do próximo atendimento.',
  },
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

const perfis = [
  {
    icon: UserRound,
    tag: 'Aluno',
    color: 'var(--blue)',
    title: 'O dia, sem ruído',
    text: 'Abre o app e vê o que tem para fazer hoje. Nada de ficha técnica ou relatório que ele não vai usar.',
    items: [
      'Treino do dia na ordem, para marcar conforme executa',
      'Refeições, calorias e água no mesmo lugar',
      'Peso e medidas da semana virando gráfico',
      'Histórico guardado mesmo trocando de profissional',
    ],
    stat: { k: 'Adesão do mês', v: '86%' },
  },
  {
    icon: Dumbbell,
    tag: 'Personal',
    color: 'var(--violet)',
    title: 'A carteira como lista de trabalho',
    text: 'Prescreve, avalia e acompanha sem sair da tela do aluno.',
    items: [
      'Criar treino com série, repetição e carga',
      'Avaliação física e medições com histórico',
      'Agenda de sessões presenciais e online',
      'Quem parou de registrar aparece primeiro',
    ],
    stat: { k: 'Precisam de atenção', v: '1 aluno' },
  },
  {
    icon: Stethoscope,
    tag: 'Nutricionista',
    color: 'var(--amber)',
    title: 'Consulta com os dados na mão',
    text: 'Monta o plano e abre a consulta sem pedir as informações de novo.',
    items: [
      'Plano alimentar com refeições do dia',
      'Anamnese salva e consultável',
      'Restrição alimentar sempre à vista',
      'Banco de alimentos para montar o cardápio',
    ],
    stat: { k: 'Anamnese pendente', v: '1 paciente' },
  },
];

/* ---------- Pequenos blocos visuais ---------- */

function useTicker(length: number, ms: number) {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(reduce ? length : 0);
  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => setStep((s) => (s >= length + 1 ? 0 : s + 1)), ms);
    return () => window.clearInterval(id);
  }, [length, ms, reduce]);
  return Math.min(step, length);
}

function CheckRow({ label, meta, done }: { label: string; meta: string; done: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 bg-white/[0.04] border border-white/[0.06]">
      <motion.span
        className="w-5 h-5 rounded-md grid place-items-center border"
        animate={{
          backgroundColor: done ? 'rgba(46,230,200,0.9)' : 'rgba(255,255,255,0)',
          borderColor: done ? 'rgba(46,230,200,0.9)' : 'rgba(232,236,255,0.25)',
        }}
        transition={{ duration: 0.35 }}
      >
        <motion.span animate={{ scale: done ? 1 : 0 }} transition={{ type: 'spring', stiffness: 500, damping: 22 }}>
          <Check className="w-3.5 h-3.5 text-[#05060b]" strokeWidth={3} />
        </motion.span>
      </motion.span>
      <span className={`flex-1 text-[12.5px] transition-colors ${done ? 'text-white/50 line-through' : 'text-white'}`}>
        {label}
      </span>
      <span className="cp-mono text-[10.5px] text-[var(--muted)]">{meta}</span>
    </div>
  );
}

function PhoneMock() {
  const done = useTicker(3, 1300);
  const circumference = 2 * Math.PI * 34;
  return (
    <div className="relative w-[288px] sm:w-[300px] p-[9px] rounded-[46px] bg-[#16181f] shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.14),inset_0_0_0_7px_#020308,0_50px_100px_-30px_rgba(0,0,0,0.9)]">
      <div className="absolute top-[19px] left-1/2 -translate-x-1/2 w-[30%] h-[21px] bg-black rounded-full z-10" />
      <div className="relative aspect-[9/19] rounded-[37px] overflow-hidden bg-[#070914] px-4 pt-12 pb-4 flex flex-col gap-3">
        <div className="relative flex items-center justify-between">
          <div>
            <p className="cp-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">Terça · hoje</p>
            <p className="cp-display text-[19px] font-bold text-white">Bom dia, Lucas</p>
          </div>
          <span className="w-9 h-9 rounded-full bg-[var(--ink-4)] border border-[var(--line-2)] grid place-items-center text-[12px] font-bold text-white">
            LS
          </span>
        </div>

        <div className="relative flex items-center gap-3 rounded-2xl p-3 bg-white/[0.05] border border-white/[0.07]">
          <svg viewBox="0 0 80 80" className="w-[72px] h-[72px] -rotate-90">
            <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
            <motion.circle
              cx="40"
              cy="40"
              r="34"
              fill="none"
              stroke="#ffb547"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference * (1 - 0.645) }}
              transition={{ duration: 1.8, ease: EASE, delay: 0.8 }}
            />
            <defs>
              <linearGradient id="cp-ring" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffb547" />
                <stop offset="100%" stopColor="#ff8a5c" />
              </linearGradient>
            </defs>
          </svg>
          <div>
            <p className="cp-mono text-[10px] uppercase tracking-[0.12em] text-[var(--muted)] flex items-center gap-1">
              <Flame className="w-3 h-3 text-[var(--amber)]" /> Calorias
            </p>
            <p className="cp-display text-[20px] font-bold text-white leading-tight">
              <Counter to={1420} duration={1.8} />
              <span className="text-[12px] font-medium text-[var(--muted)]"> / 2.200</span>
            </p>
            <p className="text-[11px] text-[var(--muted)]">Próxima: almoço · 12:30</p>
          </div>
        </div>

        <div className="relative space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-semibold text-white flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5 text-[var(--blue-2)]" /> Push A
            </p>
            <span className="cp-mono text-[10px] text-[var(--muted)]">{done}/3 feitos</span>
          </div>
          <CheckRow label="Supino reto" meta="4×8–10" done={done >= 1} />
          <CheckRow label="Desenvolvimento" meta="3×10" done={done >= 2} />
          <CheckRow label="Tríceps corda" meta="3×12" done={done >= 3} />
        </div>

        <div className="relative rounded-2xl p-3 bg-white/[0.05] border border-white/[0.07]">
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 text-white">
              <Droplets className="w-3.5 h-3.5 text-[var(--cyan)]" /> Água
            </span>
            <span className="cp-mono text-[var(--muted)]">1,5 / 2,5 L</span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full cp-brand-bar"
              initial={{ width: 0 }}
              animate={{ width: '60%' }}
              transition={{ duration: 1.4, ease: EASE, delay: 1.1 }}
            />
          </div>
        </div>

        <div className="relative mt-auto flex justify-around rounded-2xl py-2.5 bg-white/[0.05] border border-white/[0.07] text-[var(--muted)]">
          <Target className="w-4 h-4 text-white" />
          <Dumbbell className="w-4 h-4" />
          <Salad className="w-4 h-4" />
          <TrendingUp className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

function FloatCard({
  className,
  icon: Icon,
  color,
  label,
  value,
  delay,
}: {
  className: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  label: string;
  value: string;
  delay: number;
}) {
  return (
    <motion.div
      className={`absolute z-20 ${className}`}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      <div
        className="cp-float flex items-center gap-3 rounded-2xl px-3.5 py-3 bg-[rgba(16,19,31,0.78)] backdrop-blur-md border border-white/10 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.8)]"
        style={{ animationDelay: `${delay}s` }}
      >
        <span className="w-9 h-9 rounded-xl grid place-items-center" style={{ background: `color-mix(in srgb, ${color} 18%, transparent)` }}>
          <Icon className="w-[18px] h-[18px]" style={{ color }} />
        </span>
        <span className="leading-tight">
          <span className="cp-mono block text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">{label}</span>
          <span className="cp-display block text-[15px] font-bold text-white">{value}</span>
        </span>
      </div>
    </motion.div>
  );
}

function HeroStage() {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 120, damping: 18 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), { stiffness: 120, damping: 18 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <div
      className="relative h-[620px] sm:h-[660px] grid place-items-center [perspective:1400px]"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <motion.div
        style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
        initial={{ opacity: 0, y: 60, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.2, ease: EASE, delay: 0.35 }}
      >
        <div className="cp-float">
          <PhoneMock />
        </div>
      </motion.div>
      <FloatCard
        className="left-0 sm:left-2 top-[18%]"
        icon={TrendingUp}
        color="var(--teal)"
        label="Supino · carga"
        value="+5 kg"
        delay={1.1}
      />
      <FloatCard
        className="right-0 sm:-right-2 top-[46%]"
        icon={Target}
        color="var(--amber)"
        label="Adesão do mês"
        value="86%"
        delay={1.35}
      />
      <FloatCard
        className="left-2 sm:left-6 bottom-[12%] hidden sm:block"
        icon={Apple}
        color="var(--violet)"
        label="Nutricionista"
        value="Plano atualizado"
        delay={1.6}
      />
    </div>
  );
}

/* ---------- Demos dos recursos ---------- */

function DemoTreino() {
  const done = useTicker(3, 1100);
  const rows = ['Agachamento · 4×8', 'Leg press · 3×12', 'Stiff · 3×10'];
  return (
    <div className="space-y-2">
      {rows.map((r, i) => (
        <div key={r} className="flex items-center gap-2.5 rounded-xl px-3 py-2 bg-[var(--paper)] border border-[var(--paper-line)]">
          <motion.span
            className="w-4 h-4 rounded grid place-items-center"
            animate={{ backgroundColor: done > i ? '#3d6bff' : 'rgba(0,3,38,0.08)' }}
          >
            {done > i && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
          </motion.span>
          <span className={`text-[13px] ${done > i ? 'text-[var(--paper-muted)] line-through' : 'text-[var(--paper-ink)]'}`}>
            {r}
          </span>
        </div>
      ))}
    </div>
  );
}

function DemoMacros() {
  const macros = [
    { k: 'Proteína', v: 82, c: '#3d6bff' },
    { k: 'Carboidrato', v: 64, c: '#ffb547' },
    { k: 'Gordura', v: 45, c: '#8b5cf6' },
  ];
  return (
    <div className="space-y-3">
      {macros.map((m, i) => (
        <div key={m.k}>
          <div className="flex justify-between text-[12px] text-[var(--paper-muted)]">
            <span>{m.k}</span>
            <span className="cp-mono">{m.v}%</span>
          </div>
          <div className="mt-1.5 h-2 rounded-full bg-[rgba(0,3,38,0.07)] overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: m.c }}
              initial={{ width: 0 }}
              whileInView={{ width: `${m.v}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.3, ease: EASE, delay: 0.2 + i * 0.15 }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function DemoVinculo() {
  const nodes = [
    { x: 60, y: 22, c: '#3d6bff', t: 'Aluno' },
    { x: 18, y: 88, c: '#8b5cf6', t: 'Personal' },
    { x: 102, y: 88, c: '#ffb547', t: 'Nutri' },
  ];
  return (
    <svg viewBox="0 0 120 112" className="w-full h-[128px]">
      {[
        [0, 1],
        [0, 2],
        [1, 2],
      ].map(([a, b], i) => (
        <motion.line
          key={i}
          x1={nodes[a].x}
          y1={nodes[a].y}
          x2={nodes[b].x}
          y2={nodes[b].y}
          stroke="rgba(0,3,38,0.25)"
          strokeWidth="1.2"
          strokeDasharray="3 3"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 + i * 0.25 }}
        />
      ))}
      {nodes.map((n, i) => (
        <motion.g
          key={n.t}
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 + i * 0.2 }}
          style={{ originX: `${n.x}px`, originY: `${n.y}px` }}
        >
          <circle cx={n.x} cy={n.y} r="13" fill={n.c} />
          <text x={n.x} y={n.y + 25} textAnchor="middle" fontSize="8.5" fill="#5b6178" fontFamily="Geist Mono, monospace">
            {n.t}
          </text>
        </motion.g>
      ))}
    </svg>
  );
}

function DemoEvolucao() {
  return (
    <div>
      <div className="flex items-end justify-between">
        <p className="cp-display text-[30px] font-bold text-[var(--paper-ink)] leading-none">
          <Counter to={-3.2} duration={1.6} format={(n) => `${n.toFixed(1).replace('.', ',')} kg`} />
        </p>
        <span className="cp-mono text-[11px] text-[var(--paper-muted)]">12 semanas</span>
      </div>
      <svg viewBox="0 0 140 50" className="mt-3 w-full h-[70px]">
        <defs>
          <linearGradient id="cp-spark" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3d6bff" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <motion.path
          d="M2 10 C 18 12, 26 8, 40 16 S 62 22, 76 26 S 100 34, 112 36 S 130 42, 138 44"
          fill="none"
          stroke="#000326"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.8, ease: EASE, delay: 0.2 }}
        />
      </svg>
    </div>
  );
}

const recursos = [
  {
    n: '01',
    title: 'Treino claro',
    quote: '“Série, repetição e carga escritas pelo personal. O aluno marca o que já fez.”',
    demo: DemoTreino,
  },
  {
    n: '02',
    title: 'Alimentação no mesmo app',
    quote: '“O plano do nutricionista aparece junto do treino, com a restrição sempre à vista.”',
    demo: DemoMacros,
  },
  {
    n: '03',
    title: 'Um vínculo só',
    quote: '“Aluno, personal e nutricionista na mesma conta. Ninguém reenvia ficha.”',
    demo: DemoVinculo,
  },
  {
    n: '04',
    title: 'Evolução registrada',
    quote: '“Carga, frequência e medida guardadas com data, virando gráfico.”',
    demo: DemoEvolucao,
  },
];

/* ---------- Página ---------- */

function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 border-b transition-[background,border-color,backdrop-filter] duration-500 ${
        scrolled || open
          ? 'bg-[rgba(5,6,11,0.72)] backdrop-blur-xl backdrop-saturate-150 border-[var(--line)]'
          : 'bg-transparent border-transparent'
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 h-[68px] flex items-center justify-between gap-4">
        <Logo tagline="Treino · dieta · evolução" />
        <nav className="hidden md:flex items-center gap-8">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-[14px] text-[var(--muted)] hover:text-white transition-colors duration-300"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-4">
          <Link to="/login" className="text-[14px] text-[var(--muted)] hover:text-white transition-colors">
            Entrar
          </Link>
          <Link to="/cadastro" className="cp-btn-sm">
            Criar conta
          </Link>
        </div>
        <button
          className="md:hidden w-10 h-10 rounded-full grid place-items-center border border-[var(--line-2)] text-white"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={open}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden px-4 pb-5 pt-2 space-y-1 border-t border-[var(--line)]">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block py-2.5 text-[15px] text-[var(--muted)] hover:text-white"
            >
              {item.label}
            </a>
          ))}
          <div className="pt-3 flex gap-3">
            <Link to="/login" onClick={() => setOpen(false)} className="cp-btn-ghost flex-1 justify-center">
              Entrar
            </Link>
            <Link to="/cadastro" onClick={() => setOpen(false)} className="cp-btn-sm flex-1 justify-center h-11">
              Criar conta
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

function SectionHead({
  kicker,
  title,
  accent,
  accentTone = 'warm',
  lead,
  center,
}: {
  kicker: string;
  title: string;
  accent?: string;
  accentTone?: 'warm' | 'cool';
  lead?: string;
  center?: boolean;
}) {
  return (
    <div className={center ? 'text-center mx-auto max-w-3xl' : 'max-w-3xl'}>
      <Reveal>
        <p className="cp-kicker">{kicker}</p>
      </Reveal>
      <h2 className="cp-display mt-4 text-[clamp(34px,4.6vw,64px)] font-bold leading-[1.0]">
        <SplitWords text={title} />
        {accent && (
          <>
            {' '}
            <SplitWords
              text={accent}
              delay={0.12}
              className="cp-accent"
            />
          </>
        )}
      </h2>
      {lead && (
        <Reveal delay={0.15}>
          <p className={`mt-5 text-[17px] leading-relaxed opacity-70 ${center ? 'mx-auto' : ''} max-w-2xl`}>{lead}</p>
        </Reveal>
      )}
    </div>
  );
}

function ProcessTimeline() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 55%'] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });

  return (
    <div ref={ref} className="relative mt-16">
      <div className="absolute left-[23px] top-2 bottom-2 w-px bg-[var(--line-2)]" />
      <motion.div
        className="absolute left-[23px] top-2 bottom-2 w-px origin-top cp-brand-bar-v"
        style={{ scaleY }}
      />
      <ol className="space-y-12">
        {etapas.map(({ icon: Icon, file, title, text }, i) => (
          <li key={title} className="relative grid grid-cols-[48px_1fr] gap-6">
            <Reveal className="relative z-10">
              <span className="w-12 h-12 rounded-2xl grid place-items-center bg-[var(--ink-3)] border border-[var(--line-2)] ">
                <Icon className="w-5 h-5 text-[var(--blue-2)]" />
              </span>
            </Reveal>
            <Reveal delay={0.08} className="grid md:grid-cols-[1fr_1.2fr] gap-4 md:gap-10 pb-2">
              <div>
                <p className="cp-mono text-[12px] text-[var(--dim)]">Passo 0{i + 1}</p>
                <h3 className="cp-display mt-1 text-[26px] sm:text-[30px] font-bold leading-tight">{title}</h3>
                <span className="cp-chip mt-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--amber)]" />
                  {file}
                </span>
              </div>
              <p className="text-[16px] leading-relaxed text-[var(--muted)] md:pt-6">{text}</p>
            </Reveal>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function Home() {
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = 'smooth';
    return () => {
      root.style.scrollBehavior = previous;
    };
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="cp-brand min-h-screen">
        <Grain />
        <ScrollProgress />
        <Nav />

        <main>
          {/* HERO */}
          <section id="inicio" className="relative min-h-[100svh] pt-[110px] pb-12 flex items-center overflow-clip">
            <Backdrop variant="hero" />
            <div className="relative w-full max-w-[1200px] mx-auto px-4 sm:px-8 grid lg:grid-cols-[1.08fr_0.92fr] gap-6 lg:gap-10 items-center">
              <div>
                <motion.span
                  className="cp-eyebrow"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: EASE }}
                >
                  <span className="cp-dot" />
                  Uma plataforma · três papéis · um login
                </motion.span>
                <h1 className="cp-display mt-6 text-[clamp(44px,6.2vw,92px)] font-[760] leading-[0.96]">
                  <SplitWords text="Personal, nutricionista e aluno" immediate delay={0.1} />{' '}
                  <SplitWords text="no mesmo lugar." immediate delay={0.4} className="cp-accent" />
                </h1>
                <Reveal delay={0.7}>
                  <p className="cp-display mt-6 text-[clamp(20px,2.1vw,27px)] font-medium leading-snug tracking-[-0.02em]">
                    O histórico do aluno para de morar em{' '}
                    <span className="cp-mark">planilha, print e WhatsApp.</span>
                  </p>
                </Reveal>
                <Reveal delay={0.8}>
                  <p className="mt-4 max-w-[540px] text-[17px] leading-relaxed text-[var(--muted)]">
                    Quem prescreve o treino, quem cuida da alimentação e quem executa o plano usam a mesma conta. Cada
                    um vê só o que precisa fazer hoje.
                  </p>
                </Reveal>
                <Reveal delay={0.9} className="mt-9 flex flex-wrap items-center gap-4">
                  <CTAButton to="/cadastro">Criar conta</CTAButton>
                  <Link to="/login" className="cp-btn-ghost">
                    Já tenho conta
                  </Link>
                </Reveal>
                <Reveal delay={1}>
                  <ul className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] text-[var(--dim)]">
                    {[
                      { icon: UserRound, t: 'Aluno' },
                      { icon: Dumbbell, t: 'Personal' },
                      { icon: Stethoscope, t: 'Nutricionista' },
                      { icon: Lock, t: 'Dados conforme a LGPD' },
                    ].map(({ icon: Icon, t }) => (
                      <li key={t} className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              </div>
              <HeroStage />
            </div>
          </section>

          {/* MARQUEE */}
          <div className="relative border-y border-[var(--line)] bg-[var(--ink-2)] py-5 overflow-hidden cp-marquee-mask">
            <div className="cp-marquee">
              {[...marquee, ...marquee].map((m, i) => (
                <span key={i} className="cp-display flex items-center gap-8 pr-8 text-[22px] font-semibold text-white/80 whitespace-nowrap">
                  {m}
                  <span className="text-[var(--amber)] text-[14px]">✦</span>
                </span>
              ))}
            </div>
          </div>

          {/* PROBLEMA */}
          <section className="relative py-28 sm:py-36">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-8 grid lg:grid-cols-[1fr_1fr] gap-14 lg:gap-20">
              <div>
                <SectionHead
                  kicker="O problema"
                  title="A informação do aluno existe."
                  accent="Só que está espalhada."
                  lead="Profissional autônomo conhece bem esse cenário. Antes de cada atendimento, metade do tempo vai para juntar o que já foi dito em algum lugar."
                />
              </div>
              <ol className="border-t border-[var(--line)]">
                {dores.map((d, i) => (
                  <Reveal key={d.k} delay={i * 0.06}>
                    <li className="group flex items-baseline gap-6 py-5 border-b border-[var(--line)]">
                      <span className="cp-mono text-[13px] text-[var(--dim)] w-7">0{i + 1}</span>
                      <p className="text-[19px] sm:text-[21px] leading-snug">
                        <span className="font-semibold text-white">{d.k}</span>{' '}
                        <span className="text-[var(--muted)] transition-colors duration-300 group-hover:text-[var(--amber)]">
                          {d.v}
                        </span>
                      </p>
                    </li>
                  </Reveal>
                ))}
              </ol>
            </div>

            <div className="max-w-[1200px] mx-auto px-4 sm:px-8 mt-28 text-center">
              <h3 className="cp-display text-[clamp(32px,4.4vw,60px)] font-bold leading-[1.02]">
                <SplitWords text="Você cuida do aluno." />
                <br />
                <SplitWords text="O CoachPass cuida do" delay={0.2} />{' '}
                <SplitWords text="<registro/>" delay={0.45} className="cp-mono cp-grad-warm font-medium text-[0.86em]" />
              </h3>
              <Reveal delay={0.3} className="mt-10 flex justify-center">
                <CTAButton to="/cadastro">Começar agora</CTAButton>
              </Reveal>
            </div>
          </section>

          {/* RECURSOS (claro) */}
          <section id="recursos" className="cp-paper relative py-28 sm:py-32 scroll-mt-16 overflow-hidden">
            <div className="cp-gridlines opacity-60" />
            <div className="relative max-w-[1200px] mx-auto px-4 sm:px-8">
              <SectionHead
                kicker="Recursos"
                title="Seu acompanhamento nunca mais precisa ficar"
                accent="espalhado."
                accentTone="cool"
                lead="Cada pessoa vê o que precisa fazer hoje. O profissional prescreve e acompanha, o aluno executa e registra."
              />
              <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {recursos.map(({ n, title, quote, demo: Demo }, i) => (
                  <Reveal key={n} delay={i * 0.08} className="h-full">
                    <article className="cp-card h-full p-6 flex flex-col">
                      <div className="flex items-center justify-between">
                        <span className="cp-mono text-[13px] text-[var(--paper-muted)]">{n}</span>
                        <span className="cp-live">AO VIVO</span>
                      </div>
                      <h3 className="cp-display mt-5 text-[22px] font-bold leading-tight">{title}</h3>
                      <p className="mt-2 text-[15px] leading-snug text-[var(--paper-muted)]">{quote}</p>
                      <div className="mt-auto pt-6">
                        <Demo />
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* PROCESSO */}
          <section id="como-funciona" className="relative py-28 sm:py-36 scroll-mt-16 overflow-hidden">
            <div className="relative max-w-[1000px] mx-auto px-4 sm:px-8">
              <SectionHead kicker="Do cadastro ao acompanhamento" title="Um cadastro entra." accent="Um acompanhamento sai." />
              <ProcessTimeline />
            </div>
          </section>

          {/* PERFIS (claro) */}
          <section id="perfis" className="cp-paper relative py-28 sm:py-32 scroll-mt-16">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
              <SectionHead
                kicker="Para quem é"
                title="Três painéis."
                accent="A mesma plataforma."
                accentTone="cool"
                center
              />
              <div className="mt-16 grid lg:grid-cols-3 gap-5">
                {perfis.map(({ icon: Icon, tag, color, title, text, items, stat }, i) => (
                  <Reveal key={tag} delay={i * 0.1} className="h-full">
                    <article className="cp-card h-full p-7 flex flex-col overflow-hidden">
                      <div
                        aria-hidden
                        className="absolute -top-24 -right-24 w-56 h-56 rounded-full blur-2xl opacity-30"
                        style={{ background: color }}
                      />
                      <div className="relative flex items-center gap-3">
                        <span
                          className="w-11 h-11 rounded-2xl grid place-items-center"
                          style={{ background: `color-mix(in srgb, ${color} 14%, white)` }}
                        >
                          <Icon className="w-5 h-5" style={{ color }} />
                        </span>
                        <span className="cp-kicker">{tag}</span>
                      </div>
                      <h3 className="relative cp-display mt-6 text-[26px] font-bold leading-tight">{title}</h3>
                      <p className="relative mt-2 text-[15px] leading-relaxed text-[var(--paper-muted)]">{text}</p>
                      <ul className="relative mt-6 space-y-3">
                        {items.map((it) => (
                          <li key={it} className="flex gap-3 text-[14.5px] leading-snug">
                            <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color }} strokeWidth={2.5} />
                            {it}
                          </li>
                        ))}
                      </ul>
                      <div className="relative mt-auto pt-7">
                        <div className="flex items-center justify-between rounded-xl px-4 py-3 bg-[var(--paper)] border border-[var(--paper-line)]">
                          <span className="text-[13px] text-[var(--paper-muted)]">{stat.k}</span>
                          <span className="cp-display text-[15px] font-bold">{stat.v}</span>
                        </div>
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* NÚMEROS + MANIFESTO */}
          <section id="sobre" className="relative py-28 sm:py-36 scroll-mt-16 overflow-hidden">
            <Backdrop variant="soft" />
            <div className="relative max-w-[1200px] mx-auto px-4 sm:px-8">
              <div className="grid md:grid-cols-[1.3fr_1fr_1fr] gap-10 items-end border-b border-[var(--line)] pb-16">
                <Reveal>
                  <p className="cp-display text-[clamp(120px,18vw,240px)] font-bold leading-[0.8] cp-grad-warm">
                    <Counter from={12} to={0} duration={2.2} />
                  </p>
                  <p className="mt-4 text-[18px] text-[var(--muted)]">planilhas paralelas para manter</p>
                </Reveal>
                <Reveal delay={0.1}>
                  <p className="cp-display text-[72px] font-bold leading-none">
                    <Counter to={3} />
                  </p>
                  <p className="mt-2 text-[15px] text-[var(--muted)]">perfis de acesso</p>
                </Reveal>
                <Reveal delay={0.2}>
                  <p className="cp-display text-[72px] font-bold leading-none">
                    <Counter to={1} />
                  </p>
                  <p className="mt-2 text-[15px] text-[var(--muted)]">login para todos</p>
                </Reveal>
              </div>

              <div className="mt-20 grid lg:grid-cols-[1.1fr_1fr] gap-14">
                <SectionHead
                  kicker="O que é o CoachPass"
                  title="Decisão do dia a dia tomada com"
                  accent="dados, não com lembrança."
                />
                <div className="space-y-6">
                  <Reveal>
                    <p className="text-[17px] leading-relaxed text-[var(--muted)]">
                      O CoachPass nasceu de um problema comum entre profissionais autônomos: a informação do aluno
                      existe, mas está espalhada.{' '}
                      <strong className="text-white font-semibold">
                        A plataforma junta esse acompanhamento num painel só e usa análise de dados para apontar onde
                        olhar primeiro.
                      </strong>
                    </p>
                  </Reveal>
                  {[
                    {
                      icon: Target,
                      t: 'Missão',
                      d: 'Reunir num lugar só o que hoje fica dividido entre planilha, ficha de treino e conversa de aplicativo.',
                    },
                    {
                      icon: Compass,
                      t: 'Visão',
                      d: 'Ser a ferramenta que o profissional abre antes de atender, e não aquela esquecida depois do cadastro.',
                    },
                  ].map(({ icon: Icon, t, d }, i) => (
                    <Reveal key={t} delay={0.1 + i * 0.1}>
                      <div className="cp-card p-5 flex gap-4">
                        <span className="w-10 h-10 shrink-0 rounded-xl grid place-items-center bg-white/[0.06] border border-[var(--line)]">
                          <Icon className="w-5 h-5 text-[var(--blue-2)]" />
                        </span>
                        <div>
                          <h4 className="cp-display text-[18px] font-bold">{t}</h4>
                          <p className="mt-1 text-[15px] leading-relaxed text-[var(--muted)]">{d}</p>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* VALORES (claro) */}
          <section className="cp-paper relative py-28 sm:py-32">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
              <SectionHead
                kicker="Valores"
                title="O que a gente usa para decidir"
                accent="o que entra no produto."
                accentTone="cool"
              />
              <div className="mt-14 grid sm:grid-cols-2 gap-4">
                {valores.map(({ icon: Icon, title, text }, i) => (
                  <Reveal key={title} delay={i * 0.07} className="h-full">
                    <article className="cp-card h-full p-7 flex gap-5">
                      <span className="cp-mono text-[13px] text-[var(--paper-muted)] pt-1">0{i + 1}</span>
                      <div>
                        <Icon className="w-5 h-5 text-[var(--blue)]" />
                        <h3 className="cp-display mt-3 text-[21px] font-bold leading-snug">{title}</h3>
                        <p className="mt-2 text-[15px] leading-relaxed text-[var(--paper-muted)]">{text}</p>
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* CTA FINAL */}
          <section className="relative py-28 sm:py-36 overflow-hidden">
            <Backdrop variant="soft" />
            <div className="relative max-w-[1000px] mx-auto px-4 sm:px-8 text-center">
              <Reveal>
                <span className="cp-eyebrow">
                  <span className="cp-dot" />
                  Conta gratuita para começar
                </span>
              </Reveal>
              <h2 className="cp-display mt-7 text-[clamp(40px,6vw,84px)] font-bold leading-[0.98]">
                <SplitWords text="Seu acompanhamento" />{' '}
                <SplitWords text="começa com um login." delay={0.2} className="cp-accent" />
              </h2>
              <Reveal delay={0.2}>
                <p className="mt-6 text-[18px] text-[var(--muted)] max-w-xl mx-auto">
                  A conta já vem com o perfil definido. Depois de entrar, o painel certo abre sozinho.
                </p>
              </Reveal>
              <Reveal delay={0.3} className="mt-10 flex flex-wrap justify-center items-center gap-4">
                <CTAButton to="/cadastro" size="lg">
                  Criar conta
                </CTAButton>
                <Link to="/login" className="cp-btn-ghost">
                  Já tenho conta
                </Link>
              </Reveal>
            </div>
          </section>
        </main>

        <footer className="relative border-t border-[var(--line)] bg-[var(--ink-2)]">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-16">
            <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
              <div>
                <Logo tagline="Treino · dieta · evolução" />
                <p className="mt-5 text-[14px] text-[var(--muted)] max-w-sm leading-relaxed">
                  Gestão, acompanhamento e análise de dados para personal trainers e nutricionistas que cuidam da própria
                  carteira de alunos.
                </p>
                <p className="mt-5 inline-flex items-center gap-2 cp-mono text-[12px] text-[var(--dim)]">
                  <span className="w-2 h-2 rounded-full bg-[var(--amber)]" />
                  Projeto em desenvolvimento · MVP
                </p>
                <div>
                  <a href={REPO_URL} target="_blank" rel="noreferrer" className="cp-btn-ghost mt-5 h-10 text-[13px]">
                    <Github className="w-4 h-4" />
                    Repositório no GitHub
                  </a>
                </div>
              </div>
              <div>
                <h4 className="cp-kicker">Plataforma</h4>
                <ul className="mt-4 space-y-2.5 text-[14px]">
                  {nav.map((n) => (
                    <li key={n.href}>
                      <a href={n.href} className="text-[var(--muted)] hover:text-white transition-colors">
                        {n.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="cp-kicker">Perfis</h4>
                <ul className="mt-4 space-y-2.5 text-[14px] text-[var(--muted)]">
                  <li>Aluno: executa e registra</li>
                  <li>Personal: treino, avaliação e agenda</li>
                  <li>Nutricionista: plano e consulta</li>
                </ul>
              </div>
              <div>
                <h4 className="cp-kicker">Acesso</h4>
                <ul className="mt-4 space-y-2.5 text-[14px]">
                  <li>
                    <Link to="/login" className="text-[var(--muted)] hover:text-white transition-colors">
                      Entrar
                    </Link>
                  </li>
                  <li>
                    <Link to="/cadastro" className="text-[var(--muted)] hover:text-white transition-colors">
                      Criar conta
                    </Link>
                  </li>
                  <li>
                    <Link to="/login" className="text-[var(--muted)] hover:text-white transition-colors">
                      Recuperar senha
                    </Link>
                  </li>
                  <li>
                    <Link to="/termos" className="text-[var(--muted)] hover:text-white transition-colors">
                      Termos de Uso
                    </Link>
                  </li>
                  <li>
                    <Link to="/privacidade" className="text-[var(--muted)] hover:text-white transition-colors">
                      Política de Privacidade
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-14 pt-6 border-t border-[var(--line)] flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[12px] text-[var(--dim)] text-center sm:text-left">
                © {new Date().getFullYear()} CoachPass · Centralizar informações, identificar padrões, apoiar decisões.
              </p>
              <a
                href="#inicio"
                className="group inline-flex items-center gap-1.5 text-[12px] text-[var(--muted)] hover:text-white transition-colors"
              >
                Voltar ao topo
                <ArrowUp className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5" />
              </a>
            </div>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}

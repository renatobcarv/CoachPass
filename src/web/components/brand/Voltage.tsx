import React, { useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { Check, X } from 'lucide-react';
import { CTAButton, Reveal, SplitWords } from './Brand';

const EASE = [0.2, 0.8, 0.2, 1] as const;

/**
 * Seções da página de vendas inspiradas na biblioteca de referência (Klasso):
 * mascote com função no produto (KLS-MARCA-01) e Mito × Fato (KLS-CMP-04).
 * Estilos em src/styles/sales.css (prefixo .cpv-).
 */

/**
 * Mascote: a pantera, em linguagem fina (contenção, preto natural, luz de recorte discreta).
 * Entra devagar com a rolagem; sem elementos soltos sobre a imagem.
 */
export function PantherSection() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center 55%'] });
  const k = useSpring(scrollYProgress, { stiffness: 50, damping: 22 });
  const y = useTransform(k, [0, 1], [reduce ? 0 : 80, 0]);
  const scale = useTransform(k, [0, 1], [reduce ? 1 : 1.05, 1]);
  const opacity = useTransform(k, [0, 0.6], [reduce ? 1 : 0, 1]);
  const glow = useTransform(k, [0.3, 1], [0, 1]);

  return (
    <section id="visao" className="relative scroll-mt-16 overflow-clip" aria-labelledby="visao-h">
      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-8 grid lg:grid-cols-[1fr_1fr] items-end gap-6 lg:gap-0 pt-28 sm:pt-36">
        <div className="lg:pb-40">
          <Reveal>
            <p className="cpv-overline">Visão de pantera</p>
          </Reveal>
          <h2 id="visao-h" className="cpv-fine-title mt-6">
            <SplitWords text="Você vê a ficha." /> <SplitWords text="Ela vê o padrão." delay={0.15} className="cp-accent" />
          </h2>
          <Reveal delay={0.2}>
            <p className="mt-7 max-w-md text-[16.5px] leading-[1.75] text-[var(--muted)]">
              O CoachPass cruza treino, refeição e medida de cada aluno e aponta o padrão antes que ele vire problema:
              a semana sem registro, a carga que parou de subir, o plano que deixou de ser seguido.
            </p>
          </Reveal>
          <Reveal delay={0.3} className="mt-10">
            <CTAButton to="/cadastro">Quero essa visão na minha carteira</CTAButton>
          </Reveal>
        </div>

        <div ref={ref} className="cpv-panther">
          <motion.span className="cpv-panther-light" style={{ opacity: glow }} aria-hidden="true" />
          <motion.img
            src="/mascote/pantera.webp"
            width={806}
            height={1300}
            alt="Pantera negra, mascote do CoachPass, deitada e olhando de frente"
            loading="lazy"
            style={{ y, scale, opacity }}
          />
        </div>
      </div>
      <div className="cpv-hairline" aria-hidden="true" />
    </section>
  );
}

const pares = [
  {
    mito: '“Mais treino é sempre mais resultado.”',
    fato: (
      <>
        Resultado vem de <b>constância e carga que progride</b>, registradas treino a treino.
      </>
    ),
  },
  {
    mito: '“Dieta boa é a mais restritiva.”',
    fato: (
      <>
        Dieta boa é a que <b>o aluno consegue seguir</b>. A adesão aparece semana a semana.
      </>
    ),
  },
];

function MythCard({ kind, children, k, side }: { kind: 'mito' | 'fato'; children: React.ReactNode; k: ReturnType<typeof useSpring>; side: -1 | 1 }) {
  const reduce = useReducedMotion();
  const x = useTransform(k, [0, 1], [reduce ? 0 : side * 140, 0]);
  const rotate = useTransform(k, [0, 1], [reduce ? side * 2 : side * 16, side * 2.5]);
  const mito = kind === 'mito';
  return (
    <motion.article className="cpv-mvf-card" style={{ x, rotate }}>
      <span
        className="cpv-mvf-tag"
        style={mito ? { background: '#c5c8dc', color: 'var(--midnight)' } : { background: 'var(--lime)', color: 'var(--obsidian)' }}
      >
        {mito ? 'Mito' : 'Fato'}
      </span>
      <p className="text-[clamp(17px,1.7vw,21px)] leading-[1.45] font-medium text-white [&_b]:text-[var(--electric-text)] [&_b]:font-semibold">
        {children}
      </p>
      {mito ? (
        <X className="absolute right-6 bottom-6 w-6 h-6 text-[#c5c8dc]" aria-hidden="true" />
      ) : (
        <Check className="absolute right-6 bottom-6 w-6 h-6 text-[var(--lime)]" aria-hidden="true" />
      )}
    </motion.article>
  );
}

export function MythFact() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center 55%'] });
  const k = useSpring(scrollYProgress, { stiffness: 80, damping: 20 });
  const ringScale = useTransform(k, [0, 1], [0.7, 1]);
  const ringRotate = useTransform(k, [0, 1], [-40, 0]);
  const orbUp = useTransform(k, [0, 1], [140, 0]);
  const orbDown = useTransform(k, [0, 1], [-160, 0]);

  return (
    <section className="relative py-28 sm:py-36 overflow-hidden" aria-labelledby="mvf-h">
      <div className="cpv-flutes" aria-hidden="true" />
      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-8">
        <div className="text-center mx-auto max-w-3xl">
          <Reveal>
            <p className="cp-kicker">Sem achismo</p>
          </Reveal>
          <h2 id="mvf-h" className="cp-display mt-4 text-[clamp(40px,5.4vw,76px)] font-bold leading-[1.0]">
            <SplitWords text="Mito" /> <SplitWords text="×" delay={0.1} className="cp-accent" /> <SplitWords text="fato" delay={0.18} />
          </h2>
          <Reveal delay={0.15}>
            <p className="mt-5 text-[17px] leading-relaxed text-[var(--muted)]">
              O que o registro mostra quando a conversa sai do achismo.
            </p>
          </Reveal>
        </div>

        <div ref={ref} className="relative mx-auto mt-16 max-w-[980px] py-10 grid md:grid-cols-2 gap-x-10 gap-y-12">
          <motion.span className="cpv-mvf-ring" style={{ scale: ringScale, rotate: ringRotate }} aria-hidden="true" />
          <motion.i className="cpv-orb left-[3%] top-[4%] w-14 h-14 bg-[var(--ice)]" style={{ y: orbUp }} aria-hidden="true" />
          <motion.i className="cpv-orb right-[5%] bottom-[2%] w-[72px] h-[72px] bg-[var(--lime)]" style={{ y: orbDown }} aria-hidden="true" />
          <motion.i
            className="cpv-orb right-[-1%] top-[38%] w-8 h-28 bg-[var(--electric)] blur-[6px] rotate-[32deg]"
            style={{ y: orbUp }}
            aria-hidden="true"
          />
          {pares.map(({ mito, fato }, i) => (
            <React.Fragment key={i}>
              <div className={i === 1 ? 'md:-mt-4' : ''}>
                <MythCard kind="mito" k={k} side={-1}>
                  {mito}
                </MythCard>
              </div>
              <div className={i === 0 ? 'md:mt-16' : 'md:mt-10'}>
                <MythCard kind="fato" k={k} side={1}>
                  {fato}
                </MythCard>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

const telas = [
  { id: 'aluno', tab: 'Aluno · início', src: '/produto/aluno-inicio.webp', alt: 'Início do aluno: próximo treino, peso, IMC, plano alimentar e profissionais vinculados', cap: 'coachpass · aluno' },
  { id: 'dieta', tab: 'Aluno · dieta', src: '/produto/aluno-dieta.webp', alt: 'Dieta do aluno: plano publicado pela nutricionista com refeições, horários e calorias', cap: 'coachpass · minha dieta' },
  { id: 'personal', tab: 'Personal', src: '/produto/personal-painel.webp', alt: 'Painel do personal: alunos ativos, convites, lista de alunos e ações rápidas', cap: 'coachpass · painel do personal' },
  { id: 'nutri', tab: 'Nutricionista', src: '/produto/nutri-plano.webp', alt: 'Plano alimentar da nutricionista: paciente, duração, metas diárias de calorias e macros', cap: 'coachpass · plano alimentar' },
];

/**
 * Telas reais do produto (contas demo) em moldura de vidro que endireita com a rolagem (GEN-LAY-03),
 * com abas como a galeria "Por dentro" do Klasso.
 */
export function ProductGallery() {
  const [ativa, setAtiva] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 25%'] });
  const k = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });
  const rotateX = useTransform(k, [0, 1], [reduce ? 0 : 18, 0]);
  const scale = useTransform(k, [0, 1], [reduce ? 1 : 0.92, 1]);
  const tela = telas[ativa];

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const n = (ativa + (e.key === 'ArrowRight' ? 1 : telas.length - 1)) % telas.length;
    setAtiva(n);
    document.getElementById(`tela-${telas[n].id}`)?.focus();
  };

  return (
    <section id="telas" className="relative pt-24 sm:pt-32 pb-8 scroll-mt-16 overflow-clip" aria-labelledby="telas-h">
      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-8">
        <div className="text-center mx-auto max-w-3xl">
          <Reveal>
            <p className="cp-kicker">Por dentro</p>
          </Reveal>
          <h2 id="telas-h" className="cp-display mt-4 text-[clamp(34px,4.6vw,64px)] font-bold leading-[1.0]">
            <SplitWords text="As telas que você" /> <SplitWords text="vai usar amanhã." delay={0.12} className="cp-accent" />
          </h2>
          <Reveal delay={0.15}>
            <p className="mt-5 text-[17px] leading-relaxed text-[var(--muted)]">
              Capturas do CoachPass rodando com as contas de demonstração. Nada desenhado para a página.
            </p>
          </Reveal>
        </div>

        <div className="cpv-tabs mt-10" role="tablist" aria-label="Telas do produto">
          {telas.map((t, i) => (
            <button
              key={t.id}
              id={`tela-${t.id}`}
              type="button"
              role="tab"
              aria-selected={ativa === i}
              aria-controls="tela-painel"
              tabIndex={ativa === i ? 0 : -1}
              onClick={() => setAtiva(i)}
              onKeyDown={onKey}
            >
              {t.tab}
            </button>
          ))}
        </div>

        <div ref={ref} className="mt-8 [perspective:1400px]">
          <motion.figure
            id="tela-painel"
            role="tabpanel"
            aria-labelledby={`tela-${tela.id}`}
            className="cpv-shot"
            style={{ rotateX, scale, transformOrigin: '50% 0%' }}
          >
            <div className="cpv-shot-bar" aria-hidden="true">
              <i />
              <i />
              <i />
              <span>{tela.cap}</span>
            </div>
            <motion.img
              key={tela.id}
              src={tela.src}
              width={1600}
              height={1000}
              alt={tela.alt}
              loading="lazy"
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: EASE }}
            />
          </motion.figure>
        </div>
      </div>
    </section>
  );
}

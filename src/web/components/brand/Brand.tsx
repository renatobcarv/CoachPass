import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { animate, motion, useInView, useReducedMotion, useScroll, useSpring } from 'motion/react';
import { ArrowRight } from 'lucide-react';

const EASE = [0.2, 0.8, 0.2, 1] as const;

/** Logo oficial (símbolo + nome). As cores se ajustam ao fundo via CSS (ver .cp-logo-* em brand.css). */
export function BrandLogo({
  size = 30,
  wordmark = true,
  className = '',
}: {
  size?: number;
  wordmark?: boolean;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`} role="img" aria-label="CoachPass">
      <span className="cp-logo-mark" style={{ height: size }} />
      {wordmark && <span className="cp-logo-word" style={{ height: Math.round(size * 0.56) }} />}
    </span>
  );
}

export function Logo({ to = '/', tagline }: { to?: string; tagline?: string }) {
  return (
    <Link to={to} className="group flex items-center" aria-label="CoachPass — início">
      <span className="flex flex-col items-start gap-1.5">
        <span className="transition-transform duration-500 group-hover:-translate-y-px">
          <BrandLogo size={28} />
        </span>
        {tagline && (
          <span className="cp-mono block text-[9.5px] uppercase tracking-[0.16em] text-[var(--muted)] pl-[2px]">
            {tagline}
          </span>
        )}
      </span>
    </Link>
  );
}

/** Botão principal (pill com brilho). Renderiza Link, <a> ou <button> conforme as props. */
export function CTAButton({
  to,
  href,
  children,
  size = 'md',
  block,
  className = '',
  ...rest
}: {
  to?: string;
  href?: string;
  children: React.ReactNode;
  size?: 'md' | 'lg';
  block?: boolean;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const cls = `cp-btn ${size === 'lg' ? 'cp-btn-lg' : ''} ${block ? 'cp-btn-block' : ''} ${className}`;
  const inner = (
    <>
      <span>{children}</span>
      <span className="cp-arr" aria-hidden>
        <ArrowRight className="w-[18px] h-[18px]" />
      </span>
    </>
  );
  if (to) {
    return (
      <Link to={to} className={cls}>
        {inner}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={cls}>
        {inner}
      </a>
    );
  }
  return (
    <button className={cls} {...rest}>
      {inner}
    </button>
  );
}

/** Revela o texto palavra por palavra, subindo de dentro de uma máscara. */
export function SplitWords({
  text,
  className = '',
  delay = 0,
  stagger = 0.06,
  immediate = false,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  immediate?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -12% 0px' });
  const reduce = useReducedMotion();
  const show = immediate || inView;
  const words = text.split(' ');

  return (
    <span ref={ref} className={className}>
      {words.map((word, i) => (
        <React.Fragment key={`${word}-${i}`}>
          <span className="cp-w">
            <motion.span
              className="cp-wi"
              initial={reduce ? false : { y: '110%' }}
              animate={show ? { y: '0%' } : undefined}
              transition={{ duration: 0.9, ease: EASE, delay: delay + i * stagger }}
            >
              {word}
            </motion.span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </React.Fragment>
      ))}
    </span>
  );
}

/** Fade + subida ao entrar na viewport. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.85, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Número que conta até o valor quando aparece na tela. */
export function Counter({
  to,
  from = 0,
  duration = 1.6,
  format = (n: number) => Math.round(n).toLocaleString('pt-BR'),
  className = '',
}: {
  to: number;
  from?: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(reduce ? to : from);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(from, to, { duration, ease: EASE, onUpdate: setValue });
    return () => controls.stop();
  }, [inView, reduce, from, to, duration]);

  return (
    <span ref={ref} className={className}>
      {format(value)}
    </span>
  );
}

/** Barra fina de progresso de rolagem no topo da página. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });
  return (
    <motion.div
      aria-hidden
      className="fixed top-0 left-0 right-0 h-[2px] z-[60] origin-left cp-brand-bar"
      style={{ scaleX }}
    />
  );
}

/** Grade fina com máscara, atrás de heros e CTAs (sem glows coloridos). */
export function Backdrop({ variant = 'hero' }: { variant?: 'hero' | 'soft' | 'auth' }) {
  return (
    <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden" data-variant={variant}>
      <div className="cp-gridlines" />
    </div>
  );
}

export function Grain() {
  return <div aria-hidden className="cp-grain" />;
}

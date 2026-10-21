/**
 * Efeitos inspirados em componentes da 21st.dev, reescritos para a marca CoachPass
 * (mesmas dependências: motion + Tailwind):
 * - RotatingWords   ← "Animated Hero" (tommyjepsen)
 * - BackgroundPaths ← "Background Paths" (kokonutd)
 * - useSpotlight    ← "Spotlight Card" (jahed)
 * - RollingNumber   ← "KPI Tile" (konsstepnov) — número que rola dígito a dígito
 * - HairlineStats   ← "Monochrome Stats Hero" (shadcn) — faixa de números com linhas finas
 */
import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';

/** Troca a palavra/expressão de destaque do título em loop, com mola vertical. */
export function RotatingWords({
  words,
  className = '',
  interval = 2600,
}: {
  words: string[];
  className?: string;
  interval?: number;
}) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduce || words.length < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % words.length), interval);
    return () => window.clearInterval(id);
  }, [reduce, words.length, interval]);

  const longest = words.reduce((a, b) => (b.length > a.length ? b : a), '');

  return (
    <span className="relative inline-block align-top overflow-hidden pb-[0.12em] -mb-[0.12em]">
      {/* reserva a largura/altura da expressão mais longa */}
      <span className={`invisible whitespace-nowrap ${className}`}>{longest}</span>
      {words.map((word, i) => (
        <motion.span
          key={word}
          aria-hidden={i !== index}
          className={`absolute left-0 top-0 whitespace-nowrap ${className}`}
          initial={false}
          animate={
            i === index
              ? { y: '0%', opacity: 1 }
              : { y: i < index ? '-110%' : '110%', opacity: 0 }
          }
          transition={{ type: 'spring', stiffness: 70, damping: 16 }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${380 - i * 5 * position} -${189 + i * 6} -${312 - i * 5 * position} ${
      216 - i * 6
    } ${152 - i * 5 * position} ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${684 - i * 5 * position} ${
      875 - i * 6
    } ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
  }));

  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 696 316" fill="none" preserveAspectRatio="xMidYMid slice">
      {paths.map((path) => (
        <motion.path
          key={path.id}
          d={path.d}
          stroke="currentColor"
          strokeWidth={path.width}
          strokeOpacity={0.08 + path.id * 0.02}
          initial={{ pathLength: 0.3, opacity: 0.6 }}
          animate={{ pathLength: 1, opacity: [0.3, 0.6, 0.3], pathOffset: [0, 1, 0] }}
          transition={{ duration: 22 + (path.id % 7) * 1.6, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </svg>
  );
}

/** Linhas fluindo no fundo, na cor da marca. */
export function BackgroundPaths({ className = 'text-[var(--brand-400)]' }: { className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <div aria-hidden className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <FloatingPaths position={1} />
      <FloatingPaths position={-1} />
    </div>
  );
}

/**
 * Liga o efeito "spotlight" (luz que segue o cursor) em todo elemento .cp-card / .cp-spot
 * dentro do container. Um único listener; o visual fica no CSS (brand.css).
 */
export function useSpotlight<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const onMove = (e: PointerEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>('.cp-card, .cp-spot');
      if (!el || !root.contains(el)) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    };
    root.addEventListener('pointermove', onMove, { passive: true });
    return () => root.removeEventListener('pointermove', onMove);
  }, []);
  return ref;
}

function Digit({ d, delay }: { d: number; delay: number }) {
  return (
    <span className="relative inline-block h-[1em] overflow-hidden align-baseline" style={{ width: '0.62em' }}>
      <motion.span
        className="absolute left-0 top-0 flex flex-col"
        initial={{ y: '0em' }}
        animate={{ y: `${-d}em` }}
        transition={{ type: 'spring', stiffness: 90, damping: 18, delay }}
      >
        {Array.from({ length: 10 }, (_, n) => (
          <span key={n} className="h-[1em] leading-[1em] text-center">
            {n}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

/** Número que rola dígito a dígito quando entra na tela (aceita "64,5", "2.320", "86%"...). */
export function RollingNumber({ value, className = '' }: { value: string | number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const text = String(value);

  if (reduce) return <span className={className}>{text}</span>;

  let digitIndex = 0;
  return (
    <span ref={ref} className={`inline-flex items-baseline tabular-nums leading-none ${className}`} aria-label={text}>
      {text.split('').map((ch, i) => {
        if (/\d/.test(ch)) {
          const delay = 0.05 * digitIndex++;
          return <Digit key={i} d={inView ? Number(ch) : 0} delay={delay} />;
        }
        return (
          <span key={i} aria-hidden>
            {ch === ' ' ? ' ' : ch}
          </span>
        );
      })}
    </span>
  );
}

/** Faixa de números separados por linhas finas. */
export function HairlineStats({
  items,
  className = '',
}: {
  items: { value: string; label: string; note?: string }[];
  className?: string;
}) {
  return (
    <dl
      className={`grid grid-cols-2 ${items.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} border-y border-[var(--line)] ${className}`}
    >
      {items.map((it, i) => (
        <div
          key={it.label}
          className={`px-5 sm:px-8 py-8 sm:py-10 ${i > 0 ? 'lg:border-l' : ''} ${i % 2 === 1 ? 'border-l' : ''} ${
            i >= 2 ? 'border-t lg:border-t-0' : ''
          } border-[var(--line)]`}
        >
          <dt className="cp-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">{it.label}</dt>
          <dd className="cp-display mt-4 text-[clamp(44px,6vw,76px)] font-bold leading-none text-white">
            <RollingNumber value={it.value} />
          </dd>
          {it.note && <p className="mt-3 text-[13.5px] text-[var(--dim)]">{it.note}</p>}
        </div>
      ))}
    </dl>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Play,
  ExternalLink,
  ChevronRight,
  Lightbulb,
  Dumbbell,
  Target,
  BarChart2,
  Wrench,
  CheckCircle2,
} from 'lucide-react';
import { ExerciseDetail } from '../data/exerciseData';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ExerciseModalProps {
  exercise: ExerciseDetail | null;
  onClose: () => void;
}

const difficultyColors = {
  Iniciante: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  Intermediário: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  Avançado: 'text-red-400 bg-red-500/10 border-red-500/30',
};

const muscleColors: Record<string, string> = {
  Peito: '#3b82f6',
  Costas: '#10b981',
  Ombro: '#8b5cf6',
  Bíceps: '#f59e0b',
  Tríceps: '#f97316',
  Pernas: '#ec4899',
  Quadríceps: '#ec4899',
};

export function ExerciseModal({ exercise, onClose }: ExerciseModalProps) {
  const [videoPlaying, setVideoPlaying] = useState(false);

  useEffect(() => {
    if (exercise) {
      setVideoPlaying(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [exercise]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const accentColor = exercise ? (muscleColors[exercise.muscle] || '#10b981') : '#10b981';

  return (
    <AnimatePresence>
      {exercise && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="w-full max-w-4xl max-h-[92vh] rounded-3xl overflow-hidden flex flex-col pointer-events-auto dark:bg-zinc-900 bg-white shadow-2xl"
              style={{ border: '1px solid', borderColor: 'var(--border)' }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-6 py-4 flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}08)`,
                  borderBottom: `1px solid ${accentColor}25`,
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${accentColor}20` }}
                  >
                    <Dumbbell className="w-5 h-5" style={{ color: accentColor }} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="dark:text-white text-slate-900 truncate" style={{ fontWeight: 700 }}>
                      {exercise.name}
                    </h2>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full border"
                        style={{ color: accentColor, backgroundColor: `${accentColor}15`, borderColor: `${accentColor}30`, fontWeight: 600 }}
                      >
                        {exercise.muscle}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border ${difficultyColors[exercise.difficulty]}`}
                        style={{ fontWeight: 600 }}
                      >
                        {exercise.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-2xl flex items-center justify-center dark:bg-zinc-800 bg-slate-100 dark:text-zinc-400 text-slate-500 dark:hover:bg-zinc-700 hover:bg-slate-200 transition-colors flex-shrink-0 ml-3"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body — scrollable */}
              <div className="overflow-y-auto flex-1">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-0">

                  {/* Left Column — Video + Muscle Image */}
                  <div className="md:col-span-3 p-5 space-y-4">

                    {/* Video Player Area */}
                    <div className="relative rounded-2xl overflow-hidden bg-black" style={{ aspectRatio: '16/9' }}>
                      {videoPlaying ? (
                        <iframe
                          src={`https://www.youtube-nocookie.com/embed/${exercise.videoId}?autoplay=1&rel=0&modestbranding=1&color=white`}
                          title={`Tutorial: ${exercise.name}`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full border-0"
                        />
                      ) : (
                        <>
                          {/* Thumbnail */}
                          <ImageWithFallback
                            src={exercise.demoImage}
                            alt={exercise.name}
                            className="w-full h-full object-cover opacity-80"
                          />
                          {/* Overlay gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                          {/* Play Button */}
                          <button
                            onClick={() => setVideoPlaying(true)}
                            className="absolute inset-0 flex items-center justify-center group"
                          >
                            <div
                              className="w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200 group-hover:scale-110 shadow-2xl"
                              style={{ background: `${accentColor}cc` }}
                            >
                              <Play className="w-7 h-7 text-white ml-1" fill="white" />
                            </div>
                          </button>

                          {/* Bottom info overlay */}
                          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                              <span className="text-white/90 text-xs" style={{ fontWeight: 500 }}>
                                Tutorial no YouTube
                              </span>
                            </div>
                            <a
                              href={`https://www.youtube.com/watch?v=${exercise.videoId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs hover:bg-white/30 transition-colors"
                              style={{ fontWeight: 500 }}
                            >
                              <ExternalLink className="w-3 h-3" />
                              Abrir YouTube
                            </a>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Muscle Target Image */}
                    <div
                      className="flex items-center gap-4 p-4 rounded-2xl"
                      style={{ background: `${accentColor}0d`, border: `1px solid ${accentColor}25` }}
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 ring-2" style={{ ringColor: accentColor }}>
                        <ImageWithFallback
                          src={exercise.muscleImage}
                          alt={`Músculo: ${exercise.muscle}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Target className="w-4 h-4" style={{ color: accentColor }} />
                          <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>
                            Músculo alvo
                          </p>
                        </div>
                        <p className="text-sm" style={{ color: accentColor, fontWeight: 700 }}>
                          {exercise.muscle}
                        </p>
                        {exercise.secondaryMuscles.length > 0 && (
                          <p className="text-xs dark:text-zinc-500 text-slate-400 mt-0.5">
                            Secundários: {exercise.secondaryMuscles.join(' · ')}
                          </p>
                        )}
                      </div>
                      {/* Mini visual indicator */}
                      <div className="flex-shrink-0 flex flex-col gap-1">
                        <div className="text-right">
                          <p className="text-xs dark:text-zinc-500 text-slate-400">Primário</p>
                          <div className="h-1.5 w-16 rounded-full mt-1 overflow-hidden dark:bg-zinc-800 bg-slate-200">
                            <div className="h-full rounded-full w-full" style={{ backgroundColor: accentColor }} />
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs dark:text-zinc-500 text-slate-400">Secundário</p>
                          <div className="h-1.5 w-16 rounded-full mt-1 overflow-hidden dark:bg-zinc-800 bg-slate-200">
                            <div className="h-full rounded-full w-7" style={{ backgroundColor: `${accentColor}80` }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Equipment */}
                    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl dark:bg-zinc-800/50 bg-slate-50">
                      <Wrench className="w-4 h-4 dark:text-zinc-400 text-slate-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs dark:text-zinc-500 text-slate-400">Equipamento necessário</p>
                        <p className="text-sm dark:text-zinc-200 text-slate-700" style={{ fontWeight: 500 }}>
                          {exercise.equipment}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column — Description + Steps + Tips */}
                  <div className="md:col-span-2 p-5 md:border-l dark:border-zinc-800 border-slate-200 space-y-5">

                    {/* Overview */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart2 className="w-4 h-4 dark:text-zinc-400 text-slate-500" />
                        <h3 className="text-sm dark:text-zinc-200 text-slate-700" style={{ fontWeight: 600 }}>
                          Sobre o exercício
                        </h3>
                      </div>
                      <p className="text-sm dark:text-zinc-400 text-slate-600 leading-relaxed">
                        {exercise.overview}
                      </p>
                    </div>

                    {/* Steps */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 className="w-4 h-4" style={{ color: accentColor }} />
                        <h3 className="text-sm dark:text-zinc-200 text-slate-700" style={{ fontWeight: 600 }}>
                          Execução passo a passo
                        </h3>
                      </div>
                      <div className="space-y-2.5">
                        {exercise.steps.map((step, i) => (
                          <div key={i} className="flex gap-3">
                            <div
                              className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-white mt-0.5"
                              style={{ backgroundColor: accentColor, fontSize: '10px', fontWeight: 700, minWidth: 20 }}
                            >
                              {i + 1}
                            </div>
                            <p className="text-sm dark:text-zinc-400 text-slate-600 leading-relaxed">
                              {step}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tips */}
                    <div
                      className="rounded-2xl p-4 space-y-2"
                      style={{ background: `${accentColor}08`, border: `1px solid ${accentColor}20` }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-4 h-4" style={{ color: accentColor }} />
                        <h3 className="text-sm" style={{ fontWeight: 600, color: accentColor }}>
                          Dicas importantes
                        </h3>
                      </div>
                      {exercise.tips.map((tip, i) => (
                        <p key={i} className="text-xs dark:text-zinc-400 text-slate-600 leading-relaxed">
                          {tip}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t dark:border-zinc-800 border-slate-200 flex items-center justify-between flex-shrink-0">
                <p className="text-xs dark:text-zinc-500 text-slate-400">
                  Pressione <kbd className="px-1.5 py-0.5 rounded dark:bg-zinc-800 bg-slate-100 dark:text-zinc-400 text-slate-600 text-xs">Esc</kbd> para fechar
                </p>
                <div className="flex gap-2">
                  <a
                    href={`https://www.youtube.com/watch?v=${exercise.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm dark:bg-zinc-800 bg-slate-100 dark:text-zinc-300 text-slate-700 dark:hover:bg-zinc-700 hover:bg-slate-200 transition-colors"
                    style={{ fontWeight: 500 }}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Ver no YouTube
                  </a>
                  <button
                    onClick={onClose}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white transition-all hover:opacity-90"
                    style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`, fontWeight: 500 }}
                  >
                    Entendido
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

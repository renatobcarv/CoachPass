import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, ChevronDown, Dumbbell, Flame, Salad, Sparkles, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from './brand/Brand';

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  time: string;
}

const quickReplies = [
  { text: 'Substituir supino por outro exercício', icon: Dumbbell },
  { text: 'Reduzir calorias hoje', icon: Flame },
  { text: 'Adicionar mais proteína', icon: Salad },
  { text: 'Treino para hoje sem equipamento', icon: Sparkles },
];

const aiResponses = [
  'Ótima escolha! Posso substituir o supino por flexões declinadas ou crucifixo com halteres. Qual você prefere? Ambos trabalham o peitoral de forma eficaz.',
  'Entendido! Vou reduzir suas calorias de 2.800 para 2.400 kcal hoje. Removi a colação da tarde. Isso mantém sua proteína em 180g e cut de 400kcal.',
  'Perfeito! Adicionei um shake de proteína pós-treino (30g proteína) e um ovo cozido à sua colação. Total de proteína ajustado para 220g/dia.',
  'Treino sem equipamento criado! Circuito: Flexão 4×15, Agachamento 4×20, Prancha 3×60s, Burpee 3×10. Duração: ~40 minutos. Devo adicionar ao seu plano?',
];

const now = () => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

function AssistantAvatar({ size = 28 }: { size?: number }) {
  return (
    <span
      className="cp-logo-white shrink-0 rounded-[10px] grid place-items-center cp-selected"
      style={{ width: size, height: size }}
    >
      <BrandLogo size={Math.round(size * 0.42)} wordmark={false} />
    </span>
  );
}

export function AIChat() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0];
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: '1',
      role: 'ai',
      text: `Olá${firstName ? `, ${firstName}` : ''}! 👋 Sou sua IA de treino e dieta. Como posso te ajudar hoje? Posso sugerir exercícios alternativos, ajustar suas metas calóricas ou criar um plano personalizado.`,
      time: now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const responseIndex = useRef(0);
  const hasConversation = messages.some((m) => m.role === 'user');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim() || isTyping) return;
    // Sugestão rápida → resposta correspondente; texto livre → rodízio das respostas de demonstração
    const quickIndex = quickReplies.findIndex((q) => q.text === text);

    setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'user', text, time: now() }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const idx = quickIndex >= 0 ? quickIndex : responseIndex.current % aiResponses.length;
      if (quickIndex < 0) responseIndex.current += 1;
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'ai', text: aiResponses[idx], time: now() },
      ]);
    }, 1800);
  };

  return (
    // display: contents → só herda as variáveis da marca, sem criar caixa
    <div className="cp-brand" style={{ display: 'contents' }}>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="fab"
            type="button"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setIsOpen(true)}
            aria-label="Abrir assistente CoachPass"
            className="cp-ai-fab cp-selected cp-logo-white fixed bottom-6 right-6 z-50 h-14 pl-4 pr-5 rounded-full flex items-center gap-2.5 cursor-pointer"
          >
            <BrandLogo size={18} wordmark={false} />
            <span className="hidden sm:inline text-[14px] font-semibold">Assistente</span>
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[var(--teal)] border-2 border-[#05060b]" />
          </motion.button>
        )}

        {isOpen && (
          <motion.div
            key="panel"
            role="dialog"
            aria-label="Assistente CoachPass"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            style={{ transformOrigin: 'bottom right' }}
            className="cp-ai-fab cp-modal fixed z-50 bottom-3 right-3 left-3 sm:left-auto sm:bottom-6 sm:right-6 sm:w-[390px] h-[min(600px,calc(100svh-24px))] flex flex-col !rounded-[26px]"
          >
            <span aria-hidden className="cp-modal-bar shrink-0" />

            {/* Cabeçalho */}
            <div className="flex items-center justify-between gap-3 px-4 py-3.5 border-b border-[var(--line)] shrink-0">
              <div className="flex items-center gap-3">
                <AssistantAvatar size={38} />
                <div>
                  <p className="cp-display text-[16px] font-bold leading-tight">Assistente CoachPass</p>
                  <p className="flex items-center gap-1.5 text-[12px] text-[var(--muted)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--teal)] animate-pulse" />
                    Online agora
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Minimizar"
                  className="w-8 h-8 rounded-full grid place-items-center text-[var(--muted)] hover:text-white hover:bg-white/[0.06] transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Fechar"
                  className="w-8 h-8 rounded-full grid place-items-center text-[var(--muted)] hover:text-white hover:bg-white/[0.06] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {msg.role === 'ai' && <AssistantAvatar />}
                  <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div
                      className={`px-3.5 py-2.5 text-[14px] leading-relaxed ${
                        msg.role === 'user'
                          ? 'cp-selected rounded-[18px] rounded-br-md'
                          : 'bg-white/[0.05] border border-[var(--line)] rounded-[18px] rounded-tl-md text-[var(--cream)]'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="cp-mono mt-1 px-1 text-[10.5px] text-[var(--dim)]">{msg.time}</span>
                  </div>
                </motion.div>
              ))}

              {/* Sugestões iniciais */}
              {!hasConversation && !isTyping && (
                <div className="pt-1">
                  <p className="cp-kicker mb-2.5 text-[10.5px]">Sugestões</p>
                  <div className="grid grid-cols-2 gap-2">
                    {quickReplies.map(({ text, icon: Icon }) => (
                      <button
                        key={text}
                        type="button"
                        onClick={() => sendMessage(text)}
                        className="cp-spot relative text-left rounded-2xl p-3 border border-[var(--line)] bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
                      >
                        <Icon className="w-4 h-4 text-[var(--brand-300)]" />
                        <span className="mt-2 block text-[12.5px] leading-snug text-[var(--cream)]">{text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isTyping && (
                <div className="flex gap-2.5">
                  <AssistantAvatar />
                  <div className="bg-white/[0.05] border border-[var(--line)] rounded-[18px] rounded-tl-md px-4 py-3.5">
                    <div className="flex gap-1.5 items-center">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-[var(--brand-300)]"
                          animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Sugestões rápidas durante a conversa */}
            {hasConversation && (
              <div className="px-4 pb-2 flex gap-2 overflow-x-auto shrink-0">
                {quickReplies.map(({ text }) => (
                  <button
                    key={text}
                    type="button"
                    onClick={() => sendMessage(text)}
                    className="shrink-0 h-8 px-3 rounded-full border border-[var(--line-2)] text-[12px] text-[var(--muted)] hover:text-white hover:border-[rgba(140,130,255,0.5)] transition-colors whitespace-nowrap"
                  >
                    {text}
                  </button>
                ))}
              </div>
            )}

            {/* Campo */}
            <div className="px-3 pt-2 pb-3 border-t border-[var(--line)] shrink-0">
              <div className="flex items-center gap-2 rounded-full border border-[var(--line-2)] bg-white/[0.03] pl-4 pr-1.5 h-12 focus-within:border-[rgba(140,130,255,0.6)] transition-colors">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                  placeholder="Pergunte à IA…"
                  aria-label="Mensagem para o assistente"
                  className="flex-1 min-w-0 bg-transparent text-[14px] text-[var(--cream)] placeholder:text-[var(--dim)] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isTyping}
                  aria-label="Enviar"
                  className="cp-selected w-9 h-9 shrink-0 rounded-full grid place-items-center transition disabled:opacity-35 disabled:cursor-not-allowed"
                >
                  <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </div>
              <p className="mt-2 text-center text-[10.5px] text-[var(--dim)]">
                Respostas de demonstração · a IA não substitui seu profissional.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

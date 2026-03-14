import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, ChevronDown, Zap } from 'lucide-react';
import { motion } from 'motion/react';

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  time: string;
}

const initialMessages: Message[] = [
  {
    id: '1',
    role: 'ai',
    text: 'Olá, Lucas! 👋 Sou sua IA de treino e dieta. Como posso te ajudar hoje? Posso sugerir exercícios alternativos, ajustar suas metas calóricas ou criar um plano personalizado.',
    time: '10:30',
  },
];

const quickReplies = [
  'Substituir supino por outro exercício',
  'Reduzir calorias hoje',
  'Adicionar mais proteína',
  'Treino para hoje sem equipamento',
];

const aiResponses = [
  'Ótima escolha! Posso substituir o supino por flexões declinadas ou crucifixo com halteres. Qual você prefere? Ambos trabalham o peitoral de forma eficaz.',
  'Entendido! Vou reduzir suas calorias de 2.800 para 2.400 kcal hoje. Removi a colação da tarde. Isso mantém sua proteína em 180g e cut de 400kcal.',
  'Perfeito! Adicionei um shake de proteína pós-treino (30g proteína) e um ovo cozido à sua colação. Total de proteína ajustado para 220g/dia.',
  'Treino sem equipamento criado! Circuito: Flexão 4×15, Agachamento 4×20, Prancha 3×60s, Burpee 3×10. Duração: ~40 minutos. Devo adicionar ao seu plano?',
];

export function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const responseIndex = useRef(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const idx = responseIndex.current % aiResponses.length;
      responseIndex.current += 1;
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: aiResponses[idx],
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };
      setIsTyping(false);
      setMessages((prev) => [...prev, aiMsg]);
    }, 1800);
  };

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/40 cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #10b981, #3b82f6)',
          }}
        >
          <Bot className="w-6 h-6 text-white" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs" style={{ fontWeight: 700 }}>
            1
          </span>
        </motion.button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 rounded-3xl overflow-hidden shadow-2xl dark:shadow-black/50 flex flex-col"
          style={{
            height: '520px',
            background: 'var(--background)',
            border: '1px solid',
            borderColor: 'var(--border)',
          }}
        >
          {/* Header */}
          <div
            className="p-4 flex items-center justify-between flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #10b981, #3b82f6)',
            }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Zap className="w-5 h-5 text-white" fill="white" />
              </div>
              <div>
                <p className="text-white text-sm" style={{ fontWeight: 700 }}>
                  FitSync Assistant
                </p>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-white/80 rounded-full animate-pulse" />
                  <p className="text-white/80 text-xs">Online agora</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 dark:bg-zinc-950 bg-slate-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {msg.role === 'ai' && (
                  <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-blue-500 mt-auto">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-3 py-2.5 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-emerald-500 to-blue-500 text-white rounded-tr-sm'
                      : 'dark:bg-zinc-900 bg-white dark:text-zinc-100 text-slate-800 rounded-tl-sm dark:border-zinc-800 border border-slate-200'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.role === 'user' ? 'text-white/70' : 'dark:text-zinc-500 text-slate-400'
                    }`}
                  >
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-blue-500">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="dark:bg-zinc-900 bg-white rounded-2xl rounded-tl-sm px-4 py-3 dark:border-zinc-800 border border-slate-200">
                  <div className="flex gap-1.5 items-center">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick replies */}
          <div className="px-3 py-2 dark:bg-zinc-950 bg-slate-50 flex gap-2 overflow-x-auto">
            {quickReplies.slice(0, 2).map((reply) => (
              <button
                key={reply}
                onClick={() => sendMessage(reply)}
                className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full dark:bg-zinc-800 bg-white dark:text-zinc-300 text-slate-600 dark:border-zinc-700 border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors whitespace-nowrap"
              >
                {reply}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 dark:bg-zinc-950 bg-white dark:border-zinc-800 border-t border-slate-200 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
              placeholder="Pergunte à IA..."
              className="flex-1 text-sm px-3 py-2.5 rounded-xl dark:bg-zinc-900 bg-slate-100 dark:text-zinc-100 text-slate-800 dark:placeholder:text-zinc-600 placeholder:text-slate-400 focus:outline-none dark:focus:ring-1 focus:ring-1 dark:focus:ring-emerald-500/50 focus:ring-emerald-500/50 border-0"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim()}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: input.trim() ? 'linear-gradient(135deg, #10b981, #3b82f6)' : undefined,
                backgroundColor: !input.trim() ? '#374151' : undefined,
              }}
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
}
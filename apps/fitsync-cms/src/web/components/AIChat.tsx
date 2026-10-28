import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, ChevronDown, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { sendAiChat, type AiChatMessage } from '../lib/studentApi';
import { PayloadApiError } from '@/lib/cms';

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  time: string;
  error?: boolean;
}

const HISTORY_LIMIT = 12;

const quickReplies = [
  {
    label: 'Substituir supino por outro exercício',
    prompt: 'Que exercício posso fazer no lugar do supino, considerando os equipamentos que tenho?',
  },
  {
    label: 'Reduzir calorias hoje',
    prompt: 'Quais cuidados devo ter se quiser comer menos calorias hoje sem prejudicar o treino?',
  },
  {
    label: 'Adicionar mais proteína',
    prompt: 'Como posso incluir mais proteína nas minhas refeições do dia a dia?',
  },
  {
    label: 'Treino para hoje sem equipamento',
    prompt: 'Que treino posso fazer hoje usando só o peso do corpo?',
  },
];

function nowTime() {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function chatErrorMessage(err: unknown): string {
  if (err instanceof PayloadApiError) {
    if (err.status === 401 || err.status === 403) {
      return 'Sua sessão expirou. Entre novamente para usar o assistente.';
    }
    return err.message || 'Não consegui responder agora. Tente de novo em instantes.';
  }
  if (err instanceof TypeError) {
    return 'Sem conexão com o servidor. Verifique sua internet e tente de novo.';
  }
  return err instanceof Error && err.message
    ? err.message
    : 'Não consegui responder agora. Tente de novo em instantes.';
}

export function AIChat() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const firstName = user?.name?.trim().split(/\s+/)[0];
  const greeting: Message = {
    id: 'greeting',
    role: 'ai',
    text: `Olá${firstName ? `, ${firstName}` : ''}! 👋 Sou o assistente de treino e alimentação do CoachPass. Posso sugerir exercícios alternativos, tirar dúvidas sobre execução e dar orientações gerais de alimentação.`,
    time: '',
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: trimmed,
      time: nowTime(),
    };

    const history: AiChatMessage[] = [...messages, userMsg]
      .filter((msg) => !msg.error)
      .slice(-HISTORY_LIMIT)
      .map(({ role, text: body }) => ({ role, text: body }));

    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    const pushAi = (body: string, error = false) => {
      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-ai`, role: 'ai', text: body, time: nowTime(), error },
      ]);
    };

    if (!user?.accessToken) {
      pushAi('Entre na sua conta para conversar com o assistente.', true);
      return;
    }

    setIsTyping(true);
    try {
      const { reply } = await sendAiChat(user.accessToken, history);
      pushAi(reply);
    } catch (err) {
      pushAi(chatErrorMessage(err), true);
    } finally {
      setIsTyping(false);
    }
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
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl shadow-[#000326]/40 cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #5a64b4, #3b82f6)',
          }}
        >
          <Bot className="w-6 h-6 text-white" />
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
              background: 'linear-gradient(135deg, #5a64b4, #3b82f6)',
            }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Zap className="w-5 h-5 text-white" fill="white" />
              </div>
              <div>
                <p className="text-white text-sm" style={{ fontWeight: 700 }}>
                  CoachPass Assistant
                </p>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-white/80 rounded-full animate-pulse" />
                  <p className="text-white/80 text-xs">Assistente com IA</p>
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
            {[greeting, ...messages].map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {msg.role === 'ai' && (
                  <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-[#000326] to-[#5a64b4] mt-auto">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-3 py-2.5 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-[#000326] to-[#5a64b4] text-white rounded-tr-sm'
                      : msg.error
                        ? 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 rounded-tl-sm border border-red-200 dark:border-red-500/30'
                        : 'dark:bg-zinc-900 bg-white dark:text-zinc-100 text-slate-800 rounded-tl-sm dark:border-zinc-800 border border-slate-200'
                  }`}
                  role={msg.error ? 'alert' : undefined}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                  {msg.time && (
                    <p
                      className={`text-xs mt-1 ${
                        msg.role === 'user' ? 'text-white/70' : 'dark:text-zinc-500 text-slate-400'
                      }`}
                    >
                      {msg.time}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-[#000326] to-[#5a64b4]">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="dark:bg-zinc-900 bg-white rounded-2xl rounded-tl-sm px-4 py-3 dark:border-zinc-800 border border-slate-200">
                  <div className="flex gap-1.5 items-center">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-[#000326] dark:bg-white animate-bounce"
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
            {quickReplies.map((reply) => (
              <button
                key={reply.label}
                type="button"
                onClick={() => void sendMessage(reply.prompt)}
                disabled={isTyping}
                className="disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 text-xs px-3 py-1.5 rounded-full dark:bg-zinc-800 bg-white dark:text-zinc-300 text-slate-600 dark:border-zinc-700 border border-slate-200 hover:border-[#000326] dark:hover:border-white hover:text-[#000326] dark:text-[#C5C5CE] dark:hover:text-[#5a64b4] dark:text-[#C5C5CE] transition-colors whitespace-nowrap"
              >
                {reply.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 dark:bg-zinc-950 bg-white dark:border-zinc-800 border-t border-slate-200 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void sendMessage(input);
              }}
              placeholder="Pergunte à IA..."
              maxLength={2000}
              className="flex-1 text-sm px-3 py-2.5 rounded-xl dark:bg-zinc-900 bg-slate-100 dark:text-zinc-100 text-slate-800 dark:placeholder:text-zinc-600 placeholder:text-slate-400 focus:outline-none dark:focus:ring-1 focus:ring-1 dark:focus:ring-[#000326] dark:ring-white/50 focus:ring-[#000326] dark:ring-white/50 border-0"
            />
            <button
              type="button"
              onClick={() => void sendMessage(input)}
              disabled={!input.trim() || isTyping}
              aria-label="Enviar mensagem"
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: input.trim() ? 'linear-gradient(135deg, #5a64b4, #3b82f6)' : undefined,
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
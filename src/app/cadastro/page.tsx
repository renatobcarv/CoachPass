'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function CadastroPage() {
  // Estados para armazenar os dados digitados no formulário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [tipoConta, setTipoConta] = useState('personal'); // 'personal' ou 'aluno'

  // Estados de controle da tela
  const [mensagemErro, setMensagemErro] = useState('');
  const [cadastradoComSucesso, setCadastradoComSucesso] = useState(false);

  // Função chamada ao enviar o formulário
  const handleCadastrar = (e: React.FormEvent) => {
    e.preventDefault();
    setMensagemErro('');

    // Validação simples dos campos
    if (!nome || !email || !senha || !confirmarSenha) {
      setMensagemErro('Por favor, preencha todos os campos!');
      return;
    }

    if (senha !== confirmarSenha) {
      setMensagemErro('As senhas digitadas não coincidem.');
      return;
    }

    if (senha.length < 6) {
      setMensagemErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    // Simulação de cadastro bem-sucedido
    setCadastradoComSucesso(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 p-6 sm:p-8 rounded-2xl border border-slate-700 shadow-xl">
        
        {/* Cabeçalho simples da página */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-emerald-400">CoachPass</h1>
          <p className="text-sm text-slate-400 mt-1">Criar Nova Conta no Sistema</p>
        </div>

        {/* Mensagem de sucesso quando o formulário é enviado */}
        {cadastradoComSucesso ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              ✓
            </div>
            <h2 className="text-xl font-bold text-white">Cadastro Realizado com Sucesso!</h2>
            <p className="text-sm text-slate-300">
              Bem-vindo(a), <span className="font-semibold text-emerald-400">{nome}</span>! Sua conta como{' '}
              <span className="font-semibold">{tipoConta === 'personal' ? 'Personal Trainer' : 'Aluno'}</span> foi criada.
            </p>

            <div className="pt-4 flex flex-col gap-2">
              <Link
                href="/"
                className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-colors text-center"
              >
                Ir para o Dashboard
              </Link>
              <button
                onClick={() => {
                  setCadastradoComSucesso(false);
                  setNome('');
                  setEmail('');
                  setSenha('');
                  setConfirmarSenha('');
                }}
                className="w-full py-2 px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
              >
                Cadastrar Outra Conta
              </button>
            </div>
          </div>
        ) : (
          /* Formulário de cadastro simples */
          <form onSubmit={handleCadastrar} className="space-y-4">
            
            {/* Exibe mensagem de erro se houver */}
            {mensagemErro && (
              <div className="p-3 bg-red-900/50 border border-red-500 text-red-200 text-xs rounded-xl text-center">
                {mensagemErro}
              </div>
            )}

            {/* Campo: Nome Completo */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nome Completo
              </label>
              <input
                type="text"
                placeholder="Ex: João da Silva"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full bg-slate-900 text-slate-100 text-sm p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Campo: E-mail */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Endereço de E-mail
              </label>
              <input
                type="email"
                placeholder="seueducador@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 text-slate-100 text-sm p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Campo: Tipo de Conta */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Eu sou:
              </label>
              <select
                value={tipoConta}
                onChange={(e) => setTipoConta(e.target.value)}
                className="w-full bg-slate-900 text-slate-100 text-sm p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
              >
                <option value="personal">Personal Trainer</option>
                <option value="aluno">Aluno / Atleta</option>
              </select>
            </div>

            {/* Campo: Senha */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Senha
              </label>
              <input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full bg-slate-900 text-slate-100 text-sm p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Campo: Confirmar Senha */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Confirmar Senha
              </label>
              <input
                type="password"
                placeholder="Repita sua senha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className="w-full bg-slate-900 text-slate-100 text-sm p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Botão de Enviar */}
            <button
              type="submit"
              className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-colors mt-2"
            >
              Criar Conta
            </button>

            {/* Link para voltar */}
            <div className="text-center pt-2">
              <Link href="/" className="text-xs text-slate-400 hover:text-slate-200">
                ← Voltar para o Dashboard
              </Link>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}

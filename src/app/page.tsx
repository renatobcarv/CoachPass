'use client';

import React, { useState } from 'react';

export default function Home() {
  // Estados para os campos do formulário de cadastro
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [tipoConta, setTipoConta] = useState('personal'); // 'personal' ou 'aluno'

  // Estados de controle e validação
  const [mensagemErro, setMensagemErro] = useState('');
  const [cadastradoComSucesso, setCadastradoComSucesso] = useState(false);

  // Função para tratar o envio do cadastro
  const handleCadastrar = (e: React.FormEvent) => {
    e.preventDefault();
    setMensagemErro('');

    // Validações básicas do formulário
    if (!nome || !email || !senha || !confirmarSenha) {
      setMensagemErro('Por favor, preencha todos os campos obrigatórios!');
      return;
    }

    if (senha !== confirmarSenha) {
      setMensagemErro('As senhas informadas não correspondem.');
      return;
    }

    if (senha.length < 6) {
      setMensagemErro('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    // Sucesso no cadastro
    setCadastradoComSucesso(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl">
        
        {/* Cabeçalho do CoachPass */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-emerald-400 tracking-tight">CoachPass</h1>
          <p className="text-xs text-slate-400 mt-1">Plataforma de Gestão — Cadastro de Usuário</p>
        </div>

        {/* Exibição após o cadastro realizado */}
        {cadastradoComSucesso ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-2xl font-bold border border-emerald-500/30">
              ✓
            </div>
            <h2 className="text-xl font-bold text-white">Cadastro Realizado!</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Parabéns, <span className="font-semibold text-emerald-400">{nome}</span>! Sua conta como{' '}
              <span className="font-semibold text-slate-100">{tipoConta === 'personal' ? 'Personal Trainer' : 'Aluno'}</span> foi criada com sucesso.
            </p>

            <div className="pt-4">
              <button
                onClick={() => {
                  setCadastradoComSucesso(false);
                  setNome('');
                  setEmail('');
                  setSenha('');
                  setConfirmarSenha('');
                }}
                className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-colors"
              >
                Cadastrar Outro Usuário
              </button>
            </div>
          </div>
        ) : (
          /* Formulário de Cadastro Simples */
          <form onSubmit={handleCadastrar} className="space-y-4">
            
            {/* Mensagem de alerta em caso de erro */}
            {mensagemErro && (
              <div className="p-3 bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs rounded-xl text-center font-medium">
                {mensagemErro}
              </div>
            )}

            {/* Campo Nome Completo */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nome Completo
              </label>
              <input
                type="text"
                placeholder="Ex: Gabriel Silva"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full bg-slate-950 text-slate-100 text-sm p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Campo E-mail */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                E-mail
              </label>
              <input
                type="email"
                placeholder="usuario@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 text-slate-100 text-sm p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Campo Tipo de Conta */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tipo de Perfil
              </label>
              <select
                value={tipoConta}
                onChange={(e) => setTipoConta(e.target.value)}
                className="w-full bg-slate-950 text-slate-100 text-sm p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="personal">Personal Trainer</option>
                <option value="aluno">Aluno / Atleta</option>
              </select>
            </div>

            {/* Campo Senha */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Senha
              </label>
              <input
                type="password"
                placeholder="Mínimo de 6 caracteres"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full bg-slate-950 text-slate-100 text-sm p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Campo Confirmar Senha */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Confirmar Senha
              </label>
              <input
                type="password"
                placeholder="Digite a senha novamente"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className="w-full bg-slate-950 text-slate-100 text-sm p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Botão de Cadastro */}
            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold rounded-xl text-sm hover:opacity-95 transition-opacity mt-2 shadow-lg shadow-emerald-500/10"
            >
              Cadastrar
            </button>

          </form>
        )}

      </div>
    </div>
  );
}

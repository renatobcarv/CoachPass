import React, { useState } from 'react';
import { Link } from 'react-router';
import { Apple, Dumbbell, Menu, Users, X, Zap } from 'lucide-react';

const nav = [
  { href: '/', label: 'Início' },
  { href: '#recursos', label: 'Recursos' },
  { href: '#alunos', label: 'Para alunos' },
  { href: '#profissionais', label: 'Para profissionais' },
  { href: '#sobre', label: 'Sobre' },
];

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-500 to-cyan-500">
        <Zap className="w-5 h-5 text-white" fill="white" />
      </div>
      <span className="text-lg font-bold tracking-tight text-slate-900">CoachPass</span>
    </Link>
  );
}

function ScreenFrame({
  title,
  accent,
  children,
}: {
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: accent }} />
        <p className="text-sm font-semibold text-slate-800">{title}</p>
      </div>
      <div className="p-4 space-y-3">{children}</div>
    </div>
  );
}

function Bar({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
}

export function Home() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-6">
            {nav.map((item) => (
              item.href.startsWith('#') ? (
                <a key={item.href} href={item.href} className="text-sm text-slate-600 hover:text-slate-900">
                  {item.label}
                </a>
              ) : (
                <Link key={item.href} to={item.href} className="text-sm text-slate-600 hover:text-slate-900">
                  {item.label}
                </Link>
              )
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <Link to="/cadastro" className="text-sm text-slate-600 hover:text-slate-900">
              Criar conta
            </Link>
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800"
            >
              Entrar
            </Link>
          </div>
          <button
            className="md:hidden w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center"
            onClick={() => setOpen((v) => !v)}
            aria-label="Abrir menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {open && (
          <div className="md:hidden border-t border-slate-200 px-4 py-3 space-y-2 bg-white">
            {nav.map((item) => (
              item.href.startsWith('#') ? (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block py-2 text-sm text-slate-700"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setOpen(false)}
                  className="block py-2 text-sm text-slate-700"
                >
                  {item.label}
                </Link>
              )
            ))}
            <Link to="/login" className="block py-2 text-sm font-semibold text-slate-900">
              Entrar
            </Link>
          </div>
        )}
      </header>

      <main>
        <section id="inicio" className="max-w-6xl mx-auto px-4 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm font-semibold text-emerald-600 mb-3">Uma plataforma, três papéis</p>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
              Personal, nutricionista e aluno no mesmo lugar.
            </h1>
            <p className="mt-5 text-lg text-slate-600 max-w-xl">
              O CoachPass conecta quem prescreve o treino, quem cuida da alimentação e quem executa o plano — sem planilha solta e sem conversa espalhada.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/login" className="px-5 py-3 rounded-xl text-sm font-semibold text-white bg-slate-900">
                Entrar
              </Link>
              <a href="#sobre" className="px-5 py-3 rounded-xl text-sm font-semibold border border-slate-200 bg-white">
                Como funciona
              </a>
            </div>
          </div>
          <ScreenFrame title="Painel do aluno" accent="#10b981">
            <Bar label="Treino de hoje" value="Push A" />
            <Bar label="Calorias" value="1.420 / 2.200" />
            <Bar label="Água" value="1,5 L" />
          </ScreenFrame>
        </section>

        <section id="recursos" className="bg-white border-y border-slate-200">
          <div className="max-w-6xl mx-auto px-4 py-16">
            <h2 className="text-3xl font-bold">Para que serve</h2>
            <p className="mt-3 text-slate-600 max-w-2xl">
              Cada pessoa vê só o que precisa fazer hoje. O profissional prescreve. O aluno acompanha.
            </p>
            <div className="mt-10 grid md:grid-cols-3 gap-4">
              {[
                { icon: Dumbbell, title: 'Treino claro', text: 'O personal monta o treino. O aluno marca o que já fez.' },
                { icon: Apple, title: 'Alimentação no mesmo app', text: 'O nutricionista monta o plano. O aluno vê as refeições do dia.' },
                { icon: Users, title: 'Um vínculo só', text: 'Aluno, personal e nutricionista ficam ligados na mesma conta.' },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-2xl border border-slate-200 p-5">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-slate-700" />
                  </div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="alunos" className="max-w-6xl mx-auto px-4 py-16 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-sm font-semibold text-emerald-600 mb-2">Para alunos</p>
            <h2 className="text-3xl font-bold">O dia, sem ruído</h2>
            <ul className="mt-6 space-y-3 text-slate-600">
              <li>Ver o treino de hoje e marcar exercícios feitos</li>
              <li>Acompanhar refeições, calorias e água</li>
              <li>Consultar a evolução sem preencher ficha de profissional</li>
            </ul>
          </div>
          <ScreenFrame title="Início do aluno" accent="#10b981">
            <div className="rounded-xl bg-emerald-50 px-3 py-3 text-sm text-emerald-800">Supino reto · 4×8–10 · feito</div>
            <Bar label="Próxima refeição" value="Almoço" />
          </ScreenFrame>
        </section>

        <section id="profissionais" className="bg-white border-y border-slate-200">
          <div className="max-w-6xl mx-auto px-4 py-16">
            <p className="text-sm font-semibold text-blue-600 mb-2">Para profissionais</p>
            <h2 className="text-3xl font-bold">Dois painéis, a mesma plataforma</h2>
            <div className="mt-10 grid lg:grid-cols-2 gap-6">
              <ScreenFrame title="Personal" accent="#3b82f6">
                <Bar label="Alunos ativos" value="4" />
                <Bar label="Sessão de hoje" value="Maria · 19:00" />
                <p className="text-sm text-slate-500">Criar treino e registrar avaliação a partir da lista.</p>
              </ScreenFrame>
              <ScreenFrame title="Nutricionista" accent="#f59e0b">
                <Bar label="Pacientes ativos" value="2" />
                <Bar label="Última consulta" value="Há 3 dias" />
                <p className="text-sm text-slate-500">Criar plano alimentar e abrir a consulta do paciente.</p>
              </ScreenFrame>
            </div>
          </div>
        </section>

        <section id="sobre" className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold">O que é o CoachPass</h2>
          <p className="mt-3 text-slate-600 max-w-3xl">
            É a plataforma que junta o acompanhamento de treino e de alimentação. O aluno não escolhe um painel no login: a conta já diz se a pessoa é aluno, personal ou nutricionista, e o sistema abre o lugar certo.
          </p>
          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            {[
              { title: 'Aluno', text: 'Executa o plano e vê o próprio progresso.' },
              { title: 'Personal trainer', text: 'Cuida de alunos, treinos, avaliação e agenda.' },
              { title: 'Nutricionista', text: 'Cuida de pacientes, plano alimentar e consultas.' },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl bg-white border border-slate-200 p-5">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <h3 className="text-xl font-semibold">Benefícios</h3>
            <ul className="mt-4 grid sm:grid-cols-2 gap-3 text-sm text-slate-600">
              <li className="rounded-xl bg-white border border-slate-200 px-4 py-3">Um login para os três tipos de conta</li>
              <li className="rounded-xl bg-white border border-slate-200 px-4 py-3">Menos telas: só o que cada um usa no dia</li>
              <li className="rounded-xl bg-white border border-slate-200 px-4 py-3">Treino e alimentação no mesmo vínculo</li>
              <li className="rounded-xl bg-white border border-slate-200 px-4 py-3">Profissional vê a lista e age direto nela</li>
            </ul>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-slate-500">CoachPass</p>
          <Link to="/login" className="text-sm font-semibold text-slate-900">
            Entrar
          </Link>
        </div>
      </footer>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft, DollarSign, TrendingUp, TrendingDown, Plus, X, Save,
  Search, Download, Printer, CheckCircle, Clock, AlertCircle,
  Users, Calendar, CreditCard, FileText, Filter, ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  student: string;
  studentAvatar: string;
  type: 'income' | 'expense';
  category: 'mensalidade' | 'avulso' | 'comissao' | 'equipamento' | 'outro';
  amount: number;
  dueDate: string;
  paidDate: string | null;
  status: 'paid' | 'pending' | 'overdue';
  description: string;
  method: 'pix' | 'cartao' | 'boleto' | 'dinheiro';
}

const mockTransactions: Transaction[] = [
  { id: '1', student: 'Lucas Silva', studentAvatar: 'https://ui-avatars.com/api/?name=Lucas+Silva&background=10b981&color=fff', type: 'income', category: 'mensalidade', amount: 350, dueDate: '2025-03-10', paidDate: '2025-03-08', status: 'paid', description: 'Mensalidade Março', method: 'pix' },
  { id: '2', student: 'Maria Santos', studentAvatar: 'https://ui-avatars.com/api/?name=Maria+Santos&background=3b82f6&color=fff', type: 'income', category: 'mensalidade', amount: 450, dueDate: '2025-03-10', paidDate: '2025-03-10', status: 'paid', description: 'Mensalidade Março', method: 'cartao' },
  { id: '3', student: 'Carlos Ramos', studentAvatar: 'https://ui-avatars.com/api/?name=Carlos+Ramos&background=f59e0b&color=fff', type: 'income', category: 'mensalidade', amount: 350, dueDate: '2025-03-15', paidDate: null, status: 'pending', description: 'Mensalidade Março', method: 'pix' },
  { id: '4', student: 'Ana Oliveira', studentAvatar: 'https://ui-avatars.com/api/?name=Ana+Oliveira&background=8b5cf6&color=fff', type: 'income', category: 'mensalidade', amount: 400, dueDate: '2025-03-05', paidDate: null, status: 'overdue', description: 'Mensalidade Março', method: 'boleto' },
  { id: '5', student: 'Lucas Silva', studentAvatar: 'https://ui-avatars.com/api/?name=Lucas+Silva&background=10b981&color=fff', type: 'income', category: 'avulso', amount: 80, dueDate: '2025-03-12', paidDate: '2025-03-12', status: 'paid', description: 'Sessão Extra – Avaliação', method: 'pix' },
  { id: '6', student: '—', studentAvatar: '', type: 'expense', category: 'equipamento', amount: 220, dueDate: '2025-03-01', paidDate: '2025-03-01', status: 'paid', description: 'Compra de elásticos e acessórios', method: 'cartao' },
];

const monthlyData = [
  { month: 'Out', receita: 1400, despesa: 300 },
  { month: 'Nov', receita: 1550, despesa: 250 },
  { month: 'Dez', receita: 1200, despesa: 400 },
  { month: 'Jan', receita: 1600, despesa: 200 },
  { month: 'Fev', receita: 1580, despesa: 320 },
  { month: 'Mar', receita: 1630, despesa: 220 },
];

const planOptions = [
  { label: 'Básico – 2x/sem', value: 200 },
  { label: 'Standard – 3x/sem', value: 300 },
  { label: 'Premium – 4x/sem', value: 400 },
  { label: 'Ilimitado', value: 500 },
];

const statusConfig = {
  paid: { label: 'Pago', icon: CheckCircle, color: '#10b981', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  pending: { label: 'Pendente', icon: Clock, color: '#f59e0b', bg: 'bg-amber-500/10', text: 'text-amber-400' },
  overdue: { label: 'Atrasado', icon: AlertCircle, color: '#ef4444', bg: 'bg-red-500/10', text: 'text-red-400' },
};

const categoryLabels: Record<string, string> = {
  mensalidade: 'Mensalidade', avulso: 'Sessão Avulsa', comissao: 'Comissão',
  equipamento: 'Equipamento', outro: 'Outro',
};

const methodLabels: Record<string, string> = {
  pix: 'PIX', cartao: 'Cartão', boleto: 'Boleto', dinheiro: 'Dinheiro',
};

export function PersonalFinanceiro() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'new'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showReceipt, setShowReceipt] = useState<Transaction | null>(null);

  const [form, setForm] = useState({
    student: '', type: 'income', category: 'mensalidade', amount: '',
    dueDate: '', description: '', method: 'pix',
  });

  const income = transactions.filter(t => t.type === 'income' && t.status === 'paid').reduce((s, t) => s + t.amount, 0);
  const pending = transactions.filter(t => t.status === 'pending' || t.status === 'overdue').reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter(t => t.type === 'expense' && t.status === 'paid').reduce((s, t) => s + t.amount, 0);
  const overdue = transactions.filter(t => t.status === 'overdue');

  const filtered = transactions.filter(t => {
    const matchSearch = t.student.toLowerCase().includes(searchTerm.toLowerCase()) || t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleSave = () => {
    if (!form.amount || !form.dueDate) { toast.error('Preencha valor e vencimento'); return; }
    const newT: Transaction = {
      id: Date.now().toString(), student: form.student || '—',
      studentAvatar: form.student ? `https://ui-avatars.com/api/?name=${encodeURIComponent(form.student)}&background=10b981&color=fff` : '',
      type: form.type as any, category: form.category as any,
      amount: Number(form.amount), dueDate: form.dueDate, paidDate: null,
      status: 'pending', description: form.description, method: form.method as any,
    };
    setTransactions(prev => [newT, ...prev]);
    toast.success('Lançamento registrado!');
    setActiveTab('transactions');
  };

  const markAsPaid = (id: string) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: 'paid', paidDate: new Date().toISOString().split('T')[0] } : t));
    toast.success('Pagamento registrado!');
  };

  return (
    <div className="p-4 lg:p-8 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <button onClick={() => navigate('/personal')} className="flex items-center gap-2 text-sm dark:text-zinc-400 text-slate-500 hover:dark:text-white hover:text-slate-900 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="dark:text-white text-slate-900 mb-1">Financeiro</h1>
            <p className="text-sm dark:text-zinc-400 text-slate-500">Controle de mensalidades, recebimentos e despesas</p>
          </div>
          <button onClick={() => setActiveTab('new')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white"
            style={{ background: 'linear-gradient(135deg,#10b981,#059669)', fontWeight: 600 }}>
            <Plus className="w-4 h-4" /> Novo Lançamento
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="dark:bg-zinc-900 bg-white rounded-2xl p-1 mb-6 inline-flex border dark:border-zinc-800 border-slate-200">
        {[{ id: 'overview', label: 'Visão Geral' }, { id: 'transactions', label: 'Lançamentos' }, { id: 'new', label: 'Novo Lançamento' }].map(({ id, label }) => (
          <button key={id} onClick={() => setActiveTab(id as any)}
            className={`px-4 py-2.5 rounded-xl text-sm transition-all ${activeTab === id ? 'text-white shadow-lg' : 'dark:text-zinc-400 text-slate-600 hover:dark:text-white'}`}
            style={activeTab === id ? { background: 'linear-gradient(135deg,#10b981,#059669)', fontWeight: 600 } : {}}>
            {label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Receita do Mês', value: `R$ ${income.toLocaleString('pt-BR')}`, icon: TrendingUp, color: '#10b981' },
              { label: 'A Receber', value: `R$ ${pending.toLocaleString('pt-BR')}`, icon: Clock, color: '#f59e0b' },
              { label: 'Despesas', value: `R$ ${expenses.toLocaleString('pt-BR')}`, icon: TrendingDown, color: '#ef4444' },
              { label: 'Lucro Líquido', value: `R$ ${(income - expenses).toLocaleString('pt-BR')}`, icon: DollarSign, color: '#3b82f6' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="dark:bg-zinc-900 bg-white rounded-3xl p-5 border dark:border-zinc-800 border-slate-200">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${color}20` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <p className="text-xl dark:text-white text-slate-900 mb-0.5" style={{ fontWeight: 800 }}>{value}</p>
                <p className="text-xs dark:text-zinc-500 text-slate-400">{label}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="dark:bg-zinc-900 bg-white rounded-3xl p-5 border dark:border-zinc-800 border-slate-200">
              <h3 className="text-sm dark:text-white text-slate-900 mb-4" style={{ fontWeight: 700 }}>Receita × Despesa (6 meses)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyData} barCategoryGap="30%">
                  <XAxis key="pf-bar-xaxis" dataKey="month" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis key="pf-bar-yaxis" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip key="pf-bar-tooltip" contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: 12, fontSize: 11 }} formatter={(v: any) => [`R$ ${v}`, '']} />
                  <Bar key="pf-bar-receita" dataKey="receita" fill="#10b981" radius={[6, 6, 0, 0]} name="Receita" maxBarSize={32} />
                  <Bar key="pf-bar-despesa" dataKey="despesa" fill="#ef4444" radius={[6, 6, 0, 0]} name="Despesa" maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="dark:bg-zinc-900 bg-white rounded-3xl p-5 border dark:border-zinc-800 border-slate-200">
              <h3 className="text-sm dark:text-white text-slate-900 mb-1" style={{ fontWeight: 700 }}>Status dos Alunos</h3>
              <p className="text-xs dark:text-zinc-500 text-slate-400 mb-4">Situação de mensalidades</p>
              <div className="space-y-3">
                {mockTransactions.filter(t => t.type === 'income' && t.category === 'mensalidade').slice(0, 4).map(t => {
                  const st = statusConfig[t.status];
                  const StatusIcon = st.icon;
                  return (
                    <div key={t.id} className="flex items-center gap-3">
                      <img src={t.studentAvatar} className="w-9 h-9 rounded-xl object-cover flex-shrink-0" alt={t.student} />
                      <div className="flex-1">
                        <p className="text-xs dark:text-white text-slate-900" style={{ fontWeight: 600 }}>{t.student}</p>
                        <p className="text-xs dark:text-zinc-500 text-slate-400">{t.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm" style={{ fontWeight: 700, color: t.type === 'income' ? '#10b981' : '#ef4444' }}>
                          R$ {t.amount}
                        </p>
                        <span className={`text-xs px-1.5 py-0.5 rounded-md ${st.bg} ${st.text}`} style={{ fontWeight: 600 }}>{st.label}</span>
                      </div>
                      {t.status === 'pending' || t.status === 'overdue' ? (
                        <button onClick={() => markAsPaid(t.id)}
                          className="px-2 py-1 rounded-lg text-xs bg-emerald-500/10 text-emerald-400 border dark:border-emerald-500/20 hover:bg-emerald-500/20 transition-all" style={{ fontWeight: 600 }}>
                          Pagar
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Overdue alert */}
          {overdue.length > 0 && (
            <div className="p-5 dark:bg-red-500/5 bg-red-50 rounded-2xl border dark:border-red-500/20 border-red-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-red-500" style={{ fontWeight: 700 }}>{overdue.length} pagamento{overdue.length !== 1 ? 's' : ''} em atraso</p>
                  <p className="text-xs dark:text-red-400/70 text-red-600/70 mt-0.5">
                    Total em atraso: R$ {overdue.reduce((s, t) => s + t.amount, 0).toLocaleString('pt-BR')} · Alunos: {overdue.map(t => t.student).join(', ')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Plans */}
          <div className="dark:bg-zinc-900 bg-white rounded-3xl p-6 border dark:border-zinc-800 border-slate-200">
            <h3 className="text-sm dark:text-white text-slate-900 mb-4" style={{ fontWeight: 700 }}>Planos de Treinamento</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {planOptions.map(({ label, value }) => (
                <div key={label} className="dark:bg-zinc-800/50 bg-slate-50 rounded-2xl p-4 border dark:border-zinc-700 border-slate-200">
                  <p className="text-xl text-emerald-500 mb-1" style={{ fontWeight: 800 }}>R$ {value}</p>
                  <p className="text-xs dark:text-zinc-400 text-slate-600" style={{ fontWeight: 500 }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Transactions */}
      {activeTab === 'transactions' && (
        <div>
          <div className="flex flex-wrap gap-3 mb-5">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-500 text-slate-400" />
              <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar..."
                className="pl-9 pr-4 py-2.5 rounded-xl text-sm dark:bg-zinc-900 bg-white border dark:border-zinc-700 border-slate-200 dark:text-zinc-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 w-56" />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2.5 rounded-xl text-sm dark:bg-zinc-900 bg-white border dark:border-zinc-700 border-slate-200 dark:text-zinc-200 text-slate-700 focus:outline-none">
              <option value="all">Todos</option>
              <option value="paid">Pagos</option>
              <option value="pending">Pendentes</option>
              <option value="overdue">Atrasados</option>
            </select>
          </div>

          <div className="dark:bg-zinc-900 bg-white rounded-3xl border dark:border-zinc-800 border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b dark:border-zinc-800 border-slate-200">
                  {['Aluno', 'Descrição', 'Categoria', 'Vencimento', 'Valor', 'Método', 'Status', ''].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs dark:text-zinc-500 text-slate-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => {
                  const st = statusConfig[t.status];
                  return (
                    <tr key={t.id} className="border-b dark:border-zinc-800 border-slate-100 hover:dark:bg-zinc-800/30 hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          {t.studentAvatar && <img src={t.studentAvatar} className="w-7 h-7 rounded-lg" alt={t.student} />}
                          <span className="text-xs dark:text-white text-slate-900" style={{ fontWeight: 500 }}>{t.student}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs dark:text-zinc-400 text-slate-500">{t.description}</td>
                      <td className="px-5 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full dark:bg-zinc-800 bg-slate-100 dark:text-zinc-300 text-slate-700" style={{ fontWeight: 600 }}>{categoryLabels[t.category]}</span>
                      </td>
                      <td className="px-5 py-3 text-xs dark:text-zinc-400 text-slate-500 tabular-nums">
                        {new Date(t.dueDate + 'T12:00').toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-sm tabular-nums" style={{ fontWeight: 700, color: t.type === 'income' ? '#10b981' : '#ef4444' }}>
                          {t.type === 'expense' ? '- ' : '+ '}R$ {t.amount}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs dark:text-zinc-500 text-slate-400">{methodLabels[t.method]}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${st.bg} ${st.text}`} style={{ fontWeight: 600 }}>{st.label}</span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-1">
                          {(t.status === 'pending' || t.status === 'overdue') && (
                            <button onClick={() => markAsPaid(t.id)}
                              className="px-2 py-1 rounded-lg text-xs bg-emerald-500/10 text-emerald-400 border dark:border-emerald-500/20 hover:bg-emerald-500/20 transition-all" style={{ fontWeight: 600 }}>
                              Receber
                            </button>
                          )}
                          {t.status === 'paid' && (
                            <button onClick={() => setShowReceipt(t)}
                              className="px-2 py-1 rounded-lg text-xs border dark:border-zinc-700 border-slate-200 dark:text-zinc-400 text-slate-600 hover:dark:border-blue-500 hover:dark:text-blue-400 transition-all">
                              Recibo
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New transaction */}
      {activeTab === 'new' && (
        <div className="max-w-xl">
          <div className="dark:bg-zinc-900 bg-white rounded-3xl p-6 border dark:border-zinc-800 border-slate-200 space-y-5">
            <h3 className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 700 }}>Novo Lançamento</h3>

            <div className="flex gap-3">
              {(['income', 'expense'] as const).map(tp => (
                <button key={tp} onClick={() => setForm(f => ({ ...f, type: tp }))}
                  className={`flex-1 py-3 rounded-xl text-sm border transition-all ${form.type === tp ? 'text-white border-transparent' : 'dark:border-zinc-700 border-slate-300 dark:text-zinc-400 text-slate-600'}`}
                  style={form.type === tp ? { background: tp === 'income' ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#ef4444,#dc2626)', fontWeight: 600 } : {}}>
                  {tp === 'income' ? '+ Receita' : '- Despesa'}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-1.5">Aluno</label>
                <input type="text" value={form.student} onChange={e => setForm(f => ({ ...f, student: e.target.value }))} placeholder="Nome do aluno"
                  className="w-full px-3 py-2.5 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
              </div>
              <div>
                <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-1.5">Categoria</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 focus:outline-none">
                  <option value="mensalidade">Mensalidade</option>
                  <option value="avulso">Sessão Avulsa</option>
                  <option value="comissao">Comissão</option>
                  <option value="equipamento">Equipamento</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
              <div>
                <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-1.5">Valor (R$) *</label>
                <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="350,00" step={0.01}
                  className="w-full px-3 py-2.5 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
              </div>
              <div>
                <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-1.5">Vencimento *</label>
                <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-1.5">Forma de pagamento</label>
                <select value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 focus:outline-none">
                  <option value="pix">PIX</option><option value="cartao">Cartão</option>
                  <option value="boleto">Boleto</option><option value="dinheiro">Dinheiro</option>
                </select>
              </div>
              <div>
                <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-1.5">Descrição</label>
                <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Ex: Mensalidade Março"
                  className="w-full px-3 py-2.5 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 focus:outline-none" />
              </div>
            </div>

            <button onClick={handleSave}
              className="w-full py-3 rounded-xl text-white text-sm flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#10b981,#059669)', fontWeight: 600 }}>
              <Save className="w-4 h-4" /> Salvar Lançamento
            </button>
          </div>
        </div>
      )}

      {/* Receipt modal */}
      <AnimatePresence>
        {showReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowReceipt(null)} />
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="relative dark:bg-zinc-900 bg-white rounded-3xl border dark:border-zinc-800 border-slate-200 p-6 w-full max-w-sm z-10 shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="dark:text-white text-slate-900" style={{ fontWeight: 700 }}>Comprovante de Pagamento</h3>
                <button onClick={() => setShowReceipt(null)} className="w-7 h-7 rounded-xl dark:bg-zinc-800 bg-slate-100 flex items-center justify-center dark:text-zinc-400 text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3 mb-5">
                {[
                  { label: 'Aluno', value: showReceipt.student },
                  { label: 'Serviço', value: showReceipt.description },
                  { label: 'Valor', value: `R$ ${showReceipt.amount}` },
                  { label: 'Data', value: showReceipt.paidDate ? new Date(showReceipt.paidDate + 'T12:00').toLocaleDateString('pt-BR') : '—' },
                  { label: 'Método', value: methodLabels[showReceipt.method] },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b dark:border-zinc-800 border-slate-100 last:border-0">
                    <span className="text-xs dark:text-zinc-500 text-slate-400">{label}</span>
                    <span className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>{value}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => { toast.success('Recibo exportado!'); setShowReceipt(null); }}
                  className="flex-1 py-2.5 rounded-xl text-sm border dark:border-zinc-700 border-slate-300 dark:text-zinc-300 text-slate-700 flex items-center justify-center gap-2" style={{ fontWeight: 600 }}>
                  <Download className="w-4 h-4" /> PDF
                </button>
                <button onClick={() => { toast.success('Enviando por email...'); setShowReceipt(null); }}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg,#10b981,#059669)', fontWeight: 600 }}>
                  Enviar Email
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
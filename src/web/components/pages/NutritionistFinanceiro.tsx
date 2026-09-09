import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  FileText,
  Plus,
  Search,
  Filter,
  Receipt,
  CreditCard,
  Banknote,
  CheckCircle,
  Clock,
  X,
  Download,
  Printer,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const revenueData = [
  { month: 'Set', revenue: 3200, expenses: 800 },
  { month: 'Out', revenue: 4100, expenses: 950 },
  { month: 'Nov', revenue: 3800, expenses: 870 },
  { month: 'Dez', revenue: 4600, expenses: 1100 },
  { month: 'Jan', revenue: 5200, expenses: 1200 },
  { month: 'Fev', revenue: 4900, expenses: 1050 },
  { month: 'Mar', revenue: 5800, expenses: 1300 },
];

const transactions = [
  { id: 'tx1', patient: 'Ana Costa', type: 'consulta', amount: 280, status: 'paid', date: '05/03/2025', method: 'PIX' },
  { id: 'tx2', patient: 'Roberto Lima', type: 'plano_mensal', amount: 450, status: 'paid', date: '04/03/2025', method: 'Cartão' },
  { id: 'tx3', patient: 'Juliana Mendes', type: 'consulta', amount: 280, status: 'pending', date: '03/03/2025', method: 'Boleto' },
  { id: 'tx4', patient: 'Carlos Souza', type: 'retorno', amount: 180, status: 'paid', date: '02/03/2025', method: 'Dinheiro' },
  { id: 'tx5', patient: 'Fernanda Lima', type: 'plano_mensal', amount: 450, status: 'overdue', date: '01/03/2025', method: 'Boleto' },
  { id: 'tx6', patient: 'Ana Costa', type: 'retorno', amount: 180, status: 'paid', date: '28/02/2025', method: 'PIX' },
];

const services = [
  { name: 'Consulta Inicial', price: 280, duration: '60 min' },
  { name: 'Retorno', price: 180, duration: '30 min' },
  { name: 'Plano Mensal', price: 450, duration: 'Acompanhamento' },
  { name: 'Consulta Online', price: 220, duration: '45 min' },
  { name: 'Avaliação Corporal', price: 120, duration: '20 min' },
];

interface NewTransaction {
  patient: string;
  type: string;
  amount: string;
  method: string;
}

export function NutritionistFinanceiro() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'receipts' | 'services'>('overview');
  const [showNewModal, setShowNewModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newTx, setNewTx] = useState<NewTransaction>({ patient: '', type: 'consulta', amount: '', method: 'PIX' });
  const [showReceiptModal, setShowReceiptModal] = useState<string | null>(null);

  const totalRevenue = transactions.filter(t => t.status === 'paid').reduce((s, t) => s + t.amount, 0);
  const pending = transactions.filter(t => t.status === 'pending').reduce((s, t) => s + t.amount, 0);
  const overdue = transactions.filter(t => t.status === 'overdue').reduce((s, t) => s + t.amount, 0);

  const statusConfig = {
    paid: { label: 'Pago', color: '#10b981', bg: 'bg-emerald-500/10' },
    pending: { label: 'Pendente', color: '#f59e0b', bg: 'bg-amber-500/10' },
    overdue: { label: 'Vencido', color: '#ef4444', bg: 'bg-red-500/10' },
  };

  const typeLabels: Record<string, string> = {
    consulta: 'Consulta',
    retorno: 'Retorno',
    plano_mensal: 'Plano Mensal',
    online: 'Consulta Online',
  };

  const filtered = transactions.filter(
    (t) =>
      t.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      typeLabels[t.type]?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 lg:p-8 max-w-[1400px] mx-auto">
      <button
        onClick={() => navigate('/nutritionist')}
        className="flex items-center gap-2 text-sm dark:text-zinc-400 text-slate-500 hover:dark:text-white hover:text-slate-900 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar ao Dashboard
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <h1 className="dark:text-white text-slate-900">Sistema Financeiro</h1>
          </div>
          <p className="text-sm dark:text-zinc-400 text-slate-500">
            Gerencie suas finanças, emita recibos e controle pagamentos
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 8px 20px rgba(16,185,129,0.3)', fontWeight: 600 }}
        >
          <Plus className="w-4 h-4" />
          Novo Lançamento
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Receita do Mês', value: `R$ ${totalRevenue.toLocaleString('pt-BR')}`, icon: TrendingUp, color: '#10b981', trend: '+18%' },
          { label: 'A Receber', value: `R$ ${pending.toLocaleString('pt-BR')}`, icon: Clock, color: '#f59e0b', trend: null },
          { label: 'Vencido', value: `R$ ${overdue.toLocaleString('pt-BR')}`, icon: TrendingDown, color: '#ef4444', trend: null },
          { label: 'Consultas Mês', value: '24', icon: Calendar, color: '#3b82f6', trend: '+4' },
        ].map(({ label, value, icon: Icon, color, trend }) => (
          <div key={label} className="dark:bg-zinc-900 bg-white rounded-3xl p-5 dark:border-zinc-800 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              {trend && (
                <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: color, fontWeight: 600 }}>
                  {trend}
                </span>
              )}
            </div>
            <p className="dark:text-white text-slate-900 text-xl mb-1" style={{ fontWeight: 700 }}>{value}</p>
            <p className="text-xs dark:text-zinc-500 text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="dark:bg-zinc-900 bg-white rounded-2xl p-1 mb-6 inline-flex flex-wrap dark:border-zinc-800 border border-slate-200">
        {[
          { id: 'overview', label: 'Visão Geral', icon: TrendingUp },
          { id: 'transactions', label: 'Lançamentos', icon: Banknote },
          { id: 'receipts', label: 'Recibos', icon: Receipt },
          { id: 'services', label: 'Tabela de Serviços', icon: CreditCard },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all ${
              activeTab === id ? 'text-white shadow-lg' : 'dark:text-zinc-400 text-slate-600'
            }`}
            style={activeTab === id ? { background: 'linear-gradient(135deg,#10b981,#059669)', fontWeight: 600 } : {}}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200">
            <h3 className="dark:text-white text-slate-900 mb-5">Receita × Despesas (últimos 7 meses)</h3>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="fin-revenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="fin-expenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 11 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 12, color: '#fff', fontSize: 12 }}
                  formatter={(val: number) => [`R$ ${val.toLocaleString('pt-BR')}`, '']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#fin-revenue)" name="Receita" />
                <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} fill="url(#fin-expenses)" name="Despesas" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            <div className="dark:bg-zinc-900 bg-white rounded-3xl p-5 dark:border-zinc-800 border border-slate-200">
              <h4 className="text-sm dark:text-white text-slate-900 mb-4" style={{ fontWeight: 600 }}>Formas de Recebimento</h4>
              {[
                { method: 'PIX', pct: 45, color: '#10b981' },
                { method: 'Cartão', pct: 32, color: '#3b82f6' },
                { method: 'Dinheiro', pct: 13, color: '#f59e0b' },
                { method: 'Boleto', pct: 10, color: '#8b5cf6' },
              ].map(({ method, pct, color }) => (
                <div key={method} className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="dark:text-zinc-400 text-slate-500">{method}</span>
                    <span style={{ color, fontWeight: 600 }}>{pct}%</span>
                  </div>
                  <div className="h-1.5 dark:bg-zinc-800 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="dark:bg-emerald-500/5 bg-emerald-50 rounded-3xl p-5 border dark:border-emerald-500/20 border-emerald-200">
              <p className="text-xs text-emerald-500 uppercase tracking-wider mb-3" style={{ fontWeight: 700 }}>Meta do Mês</p>
              <p className="text-2xl dark:text-white text-slate-900 mb-1" style={{ fontWeight: 800 }}>R$ 6.500</p>
              <p className="text-xs dark:text-emerald-400 text-emerald-700">89% da meta atingida</p>
              <div className="mt-3 h-2 dark:bg-zinc-800 bg-white rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: '89%' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <h3 className="dark:text-white text-slate-900">Lançamentos</h3>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-500 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar..."
                className="pl-9 pr-4 py-2 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 dark:border-zinc-700 border border-slate-200 dark:text-zinc-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 w-56"
              />
            </div>
          </div>
          <div className="space-y-3">
            {filtered.map((tx) => {
              const cfg = statusConfig[tx.status as keyof typeof statusConfig];
              return (
                <div key={tx.id} className="flex items-center gap-4 p-4 rounded-2xl dark:bg-zinc-800/50 bg-slate-50 border dark:border-zinc-700 border-slate-200">
                  <div className={`w-10 h-10 ${cfg.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Banknote className="w-5 h-5" style={{ color: cfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>{tx.patient}</p>
                    <p className="text-xs dark:text-zinc-500 text-slate-400">{typeLabels[tx.type]} • {tx.date} • {tx.method}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm" style={{ color: cfg.color, fontWeight: 700 }}>R$ {tx.amount}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${cfg.color}20`, color: cfg.color, fontWeight: 600 }}>
                      {cfg.label}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowReceiptModal(tx.id)}
                    className="p-2 rounded-xl dark:bg-zinc-700 bg-slate-100 hover:dark:bg-zinc-600 transition-colors flex-shrink-0"
                    title="Emitir Recibo"
                  >
                    <Receipt className="w-4 h-4 dark:text-zinc-400 text-slate-500" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'receipts' && (
        <div className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200">
          <h3 className="dark:text-white text-slate-900 mb-6">Recibos Emitidos</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {transactions.filter(t => t.status === 'paid').map((tx) => (
              <div key={tx.id} className="border dark:border-zinc-700 border-slate-200 rounded-2xl p-4 hover:dark:border-zinc-500 hover:border-slate-300 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-emerald-500" />
                  </div>
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-sm dark:text-white text-slate-900 mb-1" style={{ fontWeight: 600 }}>{tx.patient}</p>
                <p className="text-xs dark:text-zinc-500 text-slate-400 mb-3">{typeLabels[tx.type]} · {tx.date}</p>
                <p className="text-lg text-emerald-500 mb-3" style={{ fontWeight: 700 }}>R$ {tx.amount}</p>
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs border dark:border-zinc-700 border-slate-200 dark:text-zinc-400 text-slate-600 hover:dark:border-emerald-500 hover:border-emerald-400 transition-all">
                    <Download className="w-3 h-3" /> Baixar
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs border dark:border-zinc-700 border-slate-200 dark:text-zinc-400 text-slate-600 hover:dark:border-blue-500 hover:border-blue-400 transition-all">
                    <Printer className="w-3 h-3" /> Imprimir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'services' && (
        <div className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200">
          <div className="flex items-center justify-between mb-5">
            <h3 className="dark:text-white text-slate-900">Tabela de Serviços</h3>
            <button
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs border dark:border-zinc-700 border-slate-300 dark:text-zinc-400 text-slate-600 hover:dark:border-emerald-500 hover:border-emerald-400 transition-all"
            >
              <Plus className="w-3 h-3" /> Novo Serviço
            </button>
          </div>
          <div className="space-y-3">
            {services.map((s) => (
              <div key={s.name} className="flex items-center justify-between p-4 rounded-2xl dark:bg-zinc-800/50 bg-slate-50 border dark:border-zinc-700 border-slate-200">
                <div>
                  <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>{s.name}</p>
                  <p className="text-xs dark:text-zinc-500 text-slate-400">{s.duration}</p>
                </div>
                <p className="text-lg text-emerald-500" style={{ fontWeight: 700 }}>R$ {s.price}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Transaction Modal */}
      <AnimatePresence>
        {showNewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="dark:text-white text-slate-900">Novo Lançamento</h3>
                <button onClick={() => setShowNewModal(false)} className="p-2 rounded-xl dark:hover:bg-zinc-800 hover:bg-slate-100 transition-colors">
                  <X className="w-4 h-4 dark:text-zinc-400 text-slate-500" />
                </button>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Paciente', key: 'patient', type: 'text', placeholder: 'Nome do paciente' },
                  { label: 'Valor (R$)', key: 'amount', type: 'number', placeholder: 'Ex: 280' },
                ].map(({ label, key, type, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-2" style={{ fontWeight: 500 }}>{label}</label>
                    <input
                      type={type}
                      placeholder={placeholder}
                      value={newTx[key as keyof NewTransaction]}
                      onChange={(e) => setNewTx(p => ({ ...p, [key]: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 dark:border-zinc-700 border border-slate-200 dark:text-zinc-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                  </div>
                ))}
                {[
                  { label: 'Tipo', key: 'type', options: ['consulta', 'retorno', 'plano_mensal', 'online'] },
                  { label: 'Forma de Pagamento', key: 'method', options: ['PIX', 'Cartão', 'Dinheiro', 'Boleto'] },
                ].map(({ label, key, options }) => (
                  <div key={key}>
                    <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-2" style={{ fontWeight: 500 }}>{label}</label>
                    <select
                      value={newTx[key as keyof NewTransaction]}
                      onChange={(e) => setNewTx(p => ({ ...p, [key]: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 dark:border-zinc-700 border border-slate-200 dark:text-zinc-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    >
                      {options.map(o => <option key={o} value={o}>{typeLabels[o] || o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowNewModal(false)} className="flex-1 py-3 rounded-xl text-sm border dark:border-zinc-700 border-slate-300 dark:text-zinc-300 text-slate-700 transition-all">
                  Cancelar
                </button>
                <button
                  onClick={() => setShowNewModal(false)}
                  className="flex-1 py-3 rounded-xl text-sm text-white transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg,#10b981,#059669)', fontWeight: 600 }}
                >
                  Lançar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

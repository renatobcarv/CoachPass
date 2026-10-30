import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  ChevronDown,
  ClipboardList,
  Copy,
  Eye,
  EyeOff,
  FileText,
  Mail,
  Minus,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
  Utensils,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { CTAButton } from './brand/Brand';
import { Badge, ErrorBanner, Page, PageHeader, Skeleton } from './student/ui';
import { FieldLabel, Segmented } from './pro/ui';
import { AddPatientModal } from './AddPatientModal';
import { loadProProfile, specialtiesLine } from '../lib/proProfile';
import { PayloadApiError, extractPayloadMessage } from '@/lib/cms';
import {
  MealPlan,
  MealPlanInput,
  NutriPatient,
  createMealPlan,
  deleteMealPlan,
  fetchMealPlansSafe,
  fetchNutriPatients,
  formatQuantity,
  gramsOf,
  parseQuantity,
  relId,
  updateMealPlan,
} from '../lib/nutriApi';
import { defaultMeals, foodDatabase } from './pages/CreateDietPlan';

// ─────────── tipos do editor ───────────
type DraftItem = { key: string; name: string; quantity: string; calories: string };
type DraftMeal = { key: string; name: string; time: string; notes: string; items: DraftItem[] };
type Draft = { id?: string | number; title: string; observations: string; meals: DraftMeal[] };
type Filter = 'all' | 'withPlan' | 'noPlan' | 'pending';

const uid = () => Math.random().toString(36).slice(2, 10);
const foodByName = new Map(foodDatabase.map((f) => [f.name.toLowerCase(), f]));
const mealKcal = (m: { items?: { calories?: number | string | null }[] | null }) =>
  (m.items || []).reduce((s, i) => s + (Number(i.calories) || 0), 0);
const planKcal = (p: { meals?: { items?: { calories?: number | string | null }[] | null }[] | null }) =>
  (p.meals || []).reduce((s, m) => s + mealKcal(m), 0);
const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const errMsg = (err: unknown, fallback: string) =>
  err instanceof PayloadApiError ? extractPayloadMessage(err.data) || err.message : err instanceof Error ? err.message : fallback;

function toDraft(plan?: MealPlan | null, titleFallback = 'Plano alimentar'): Draft {
  if (!plan) {
    return {
      title: titleFallback,
      observations: '',
      meals: defaultMeals.map((m) => ({ key: uid(), name: m.name, time: m.time, notes: '', items: [] })),
    };
  }
  return {
    id: plan.id,
    title: plan.title,
    observations: plan.observations || '',
    meals: (plan.meals || []).map((m) => ({
      key: uid(),
      name: m.name,
      time: m.time || '',
      notes: m.notes || '',
      items: (m.items || []).map((i) => ({
        key: uid(),
        name: i.name,
        quantity: i.quantity || '',
        calories: i.calories != null ? String(i.calories) : '',
      })),
    })),
  };
}

function fromDraft(d: Draft, status: 'draft' | 'published'): MealPlanInput {
  return {
    title: d.title.trim(),
    status,
    observations: d.observations.trim(),
    meals: d.meals
      .filter((m) => m.name.trim())
      .map((m) => {
        const items = m.items
          .filter((i) => i.name.trim())
          .map((i) => ({
            name: i.name.trim(),
            quantity: i.quantity.trim() || null,
            calories: i.calories === '' ? null : Math.max(0, Math.round(Number(i.calories.replace(',', '.')) || 0)),
          }));
        return {
          name: m.name.trim(),
          time: m.time || null,
          notes: m.notes.trim() || null,
          calories: items.reduce((s, i) => s + (i.calories || 0), 0),
          items,
        };
      }),
  };
}

/** Multiplica quantidades e calorias (ex.: 0,9 = −10%). */
function scaleDraft(d: Draft, factor: number): Draft {
  return {
    ...d,
    meals: d.meals.map((m) => ({
      ...m,
      items: m.items.map((i) => {
        const q = parseQuantity(i.quantity);
        const kcal = Number(i.calories.replace(',', '.'));
        return {
          ...i,
          quantity: q ? formatQuantity(q.n * factor, q.unit) : i.quantity,
          calories: i.calories !== '' && Number.isFinite(kcal) ? String(Math.round(kcal * factor)) : i.calories,
        };
      }),
    })),
  };
}

// ─────────── página ───────────
export function NutritionistProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const token = user?.accessToken;

  const [patients, setPatients] = useState<NutriPatient[]>([]);
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileDetail, setMobileDetail] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  const [viewPlanId, setViewPlanId] = useState<string | number | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState<null | 'save' | 'publish' | 'delete' | 'toggle'>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const proProfile = loadProProfile(user?.id);

  const load = useCallback(async () => {
    if (!token || !user?.id) return;
    setError(null);
    const [pts, pls] = await Promise.all([
      fetchNutriPatients(user.id, token),
      fetchMealPlansSafe(user.id, token).then(
        (r) => {
          setPlansError(r.error);
          return r.plans;
        },
      ),
    ]);
    setPatients(pts);
    setPlans(pls);
    return pts;
  }, [token, user?.id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pts = await load();
        if (!cancelled && pts && pts.length && typeof window !== 'undefined' && window.innerWidth >= 1024) {
          setSelectedId((cur) => cur ?? (pts.find((p) => p.status === 'active') || pts[0]).id);
        }
      } catch (err) {
        if (!cancelled) setError(errMsg(err, 'Falha ao carregar seus pacientes.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const plansByPatient = useMemo(() => {
    const map = new Map<string, MealPlan[]>();
    for (const p of plans) {
      const k = relId(p.student);
      map.set(k, [...(map.get(k) || []), p]);
    }
    return map;
  }, [plans]);

  const activeCount = patients.filter((p) => p.status === 'active').length;
  const publishedCount = plans.filter((p) => p.status === 'published').length;
  const draftCount = plans.filter((p) => p.status === 'draft').length;
  const noPlanCount = patients.filter((p) => p.status === 'active' && !(plansByPatient.get(p.id) || []).length).length;

  const visible = patients.filter((p) => {
    const q = search.trim().toLowerCase();
    if (q && !p.name.toLowerCase().includes(q) && !p.email.toLowerCase().includes(q)) return false;
    const has = (plansByPatient.get(p.id) || []).length > 0;
    if (filter === 'withPlan') return has;
    if (filter === 'noPlan') return !has && p.status === 'active';
    if (filter === 'pending') return p.status === 'pending';
    return true;
  });

  const patient = patients.find((p) => p.id === selectedId) || null;
  const patientPlans = patient ? plansByPatient.get(patient.id) || [] : [];
  const viewPlan =
    patientPlans.find((p) => p.id === viewPlanId) ||
    patientPlans.find((p) => p.status === 'published') ||
    patientPlans[0] ||
    null;

  const guardLeave = () => !dirty || window.confirm('Há alterações não salvas neste plano. Descartar?');

  const selectPatient = (id: string) => {
    if (id === selectedId) {
      setMobileDetail(true);
      return;
    }
    if (!guardLeave()) return;
    setSelectedId(id);
    setViewPlanId(null);
    setDraft(null);
    setDirty(false);
    setConfirmDelete(false);
    setMobileDetail(true);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) window.scrollTo({ top: 0 });
  };

  const startEdit = (plan: MealPlan | null, copy = false) => {
    if (!guardLeave()) return;
    const d = toDraft(plan, patient ? `Plano de ${patient.name.split(' ')[0]}` : 'Plano alimentar');
    if (copy) {
      delete d.id;
      d.title = `${d.title} (cópia)`;
    }
    setDraft(d);
    setDirty(copy || !plan);
    setConfirmDelete(false);
  };

  const cancelEdit = () => {
    if (!guardLeave()) return;
    setDraft(null);
    setDirty(false);
  };

  const editDraft = (fn: (d: Draft) => Draft) => {
    setDraft((d) => (d ? fn(d) : d));
    setDirty(true);
  };

  const replacePlan = (doc: MealPlan) =>
    setPlans((prev) => {
      const rest = prev.filter((p) => p.id !== doc.id);
      return [doc, ...rest];
    });

  /** Salva o rascunho; se publicar, os outros planos publicados do paciente voltam a rascunho. */
  const save = async (publish: boolean) => {
    if (!draft || !token || !patient) return;
    if (!draft.title.trim()) {
      toast.error('Dê um nome ao plano.');
      return;
    }
    const input = fromDraft(draft, publish ? 'published' : (patientPlans.find((p) => p.id === draft.id)?.status ?? 'draft'));
    if (publish && input.meals.every((m) => !m.items?.length)) {
      toast.error('Adicione ao menos um alimento antes de publicar.');
      return;
    }
    setBusy(publish ? 'publish' : 'save');
    try {
      const doc = draft.id
        ? await updateMealPlan(draft.id, input, token)
        : await createMealPlan({ ...input, student: patient.id }, token);
      replacePlan(doc);
      if (publish) await retireOthers(doc.id);
      setViewPlanId(doc.id);
      setDraft(null);
      setDirty(false);
      toast.success(publish ? 'Plano publicado' : 'Plano salvo', {
        description: publish ? `${patient.name} já vê este plano na aba Dieta.` : 'Salvo como rascunho — o paciente ainda não vê.',
      });
    } catch (err) {
      toast.error('Não foi possível salvar o plano', { description: errMsg(err, 'Tente novamente.') });
    } finally {
      setBusy(null);
    }
  };

  const retireOthers = async (keepId: string | number) => {
    if (!token) return;
    const others = patientPlans.filter((p) => p.id !== keepId && p.status === 'published');
    for (const o of others) {
      try {
        replacePlan(await updateMealPlan(o.id, { status: 'draft' }, token));
      } catch {
        /* segue: o plano novo já está publicado */
      }
    }
  };

  const togglePublish = async (plan: MealPlan) => {
    if (!token || !patient) return;
    const next = plan.status === 'published' ? 'draft' : 'published';
    setBusy('toggle');
    try {
      const doc = await updateMealPlan(plan.id, { status: next }, token);
      replacePlan(doc);
      if (next === 'published') await retireOthers(doc.id);
      toast.success(next === 'published' ? 'Plano publicado' : 'Plano recolhido', {
        description: next === 'published' ? `${patient.name} já vê este plano.` : 'Voltou a ser rascunho; o paciente não vê mais.',
      });
    } catch (err) {
      toast.error('Não foi possível alterar o plano', { description: errMsg(err, 'Tente novamente.') });
    } finally {
      setBusy(null);
    }
  };

  const remove = async (plan: MealPlan) => {
    if (!token) return;
    setBusy('delete');
    try {
      await deleteMealPlan(plan.id, token);
      setPlans((prev) => prev.filter((p) => p.id !== plan.id));
      setViewPlanId(null);
      setConfirmDelete(false);
      toast.success('Plano excluído');
    } catch (err) {
      toast.error('Não foi possível excluir', { description: errMsg(err, 'Tente novamente.') });
    } finally {
      setBusy(null);
    }
  };

  const firstName = user?.name?.split(' ')[0] || 'Nutricionista';

  return (
    <Page wide>
      <PageHeader
        kicker="Perfil e pacientes"
        title="Seus pacientes"
        accent="e o plano de cada um."
        lead={
          <span className="inline-flex flex-wrap items-center gap-2">
            <Badge tone="amber">CRN {user?.professionalId || '—'}</Badge>
            <span>{specialtiesLine(proProfile, 'Nutrição clínica e esportiva')}</span>
          </span>
        }
        action={
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => navigate('/nutritionist/configuracoes')} className="cp-btn-ghost">
              <Pencil className="w-4 h-4" /> Editar meu perfil
            </button>
            <CTAButton type="button" onClick={() => setShowInvite(true)}>
              Convidar paciente
            </CTAButton>
          </div>
        }
      />

      {/* Perfil + números reais */}
      <div className="grid lg:grid-cols-[1.1fr_2fr] gap-3 mb-8">
        <div className="cp-spot relative rounded-[20px] border border-[var(--line)] bg-white/[0.025] p-5 flex items-center gap-4">
          <span className="cp-selected w-14 h-14 shrink-0 rounded-2xl grid place-items-center cp-display text-[20px] font-bold">
            {initials(user?.name || firstName)}
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-[16px] truncate">{user?.name || firstName}</p>
            <p className="text-[13px] text-[var(--muted)] truncate">{user?.email}</p>
            <p className="mt-1 cp-mono text-[11px] text-[var(--dim)]">
              {user?.whatsapp ? `WhatsApp ${user.whatsapp}` : 'WhatsApp não informado'}
              {proProfile?.experience ? ` · ${proProfile.experience}` : ''}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            ['Pacientes ativos', activeCount, 'var(--teal)'],
            ['Planos publicados', publishedCount, 'var(--brand-200)'],
            ['Rascunhos', draftCount, 'var(--muted)'],
            ['Sem plano', noPlanCount, noPlanCount ? 'var(--amber)' : 'var(--muted)'],
          ].map(([label, value, color]) => (
            <div key={label as string} className="rounded-[20px] border border-[var(--line)] bg-white/[0.025] p-4">
              <p className="cp-display text-[30px] font-bold leading-none" style={{ color: color as string }}>
                {loading ? '–' : (value as number)}
              </p>
              <p className="mt-2 text-[12.5px] text-[var(--muted)]">{label as string}</p>
            </div>
          ))}
        </div>
      </div>

      {error && <ErrorBanner>{error}</ErrorBanner>}
      {plansError && !error && <ErrorBanner>Planos: {plansError}</ErrorBanner>}

      <div className="grid lg:grid-cols-[340px_1fr] gap-6 items-start">
        {/* ── Lista de pacientes ── */}
        <aside className={`${mobileDetail && patient ? 'hidden lg:block' : ''} lg:sticky lg:top-6 rounded-[22px] border border-[var(--line)] bg-white/[0.025] overflow-hidden`}>
          <div className="p-4 border-b border-[var(--line)] space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--dim)] pointer-events-none" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar paciente…"
                aria-label="Buscar paciente"
                className="cp-field h-11"
              />
            </div>
            <div className="flex gap-1.5 overflow-x-auto">
              {(
                [
                  ['all', 'Todos'],
                  ['withPlan', 'Com plano'],
                  ['noPlan', 'Sem plano'],
                  ['pending', 'Pendentes'],
                ] as const
              ).map(([v, l]) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setFilter(v)}
                  aria-pressed={filter === v}
                  className={`shrink-0 h-8 px-3 rounded-full border text-[12.5px] font-medium transition-colors ${
                    filter === v ? 'border-[var(--brand-400)] bg-[rgba(85,70,255,0.16)] text-white' : 'border-[var(--line-2)] text-[var(--muted)] hover:text-white'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="p-4 space-y-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : patients.length === 0 ? (
            <div className="p-6 text-center">
              <Users className="w-8 h-8 mx-auto text-[var(--dim)]" />
              <p className="mt-3 font-semibold">Nenhum paciente ainda</p>
              <p className="mt-1 text-[13px] text-[var(--muted)]">Convide pacientes que já têm conta CoachPass.</p>
              <button type="button" onClick={() => setShowInvite(true)} className="cp-btn-sm mt-4">
                <Plus className="w-4 h-4" /> Convidar paciente
              </button>
            </div>
          ) : visible.length === 0 ? (
            <p className="p-6 text-center text-[13.5px] text-[var(--muted)]">Nenhum paciente neste filtro.</p>
          ) : (
            <ul className="p-2 max-h-[640px] overflow-y-auto">
              {visible.map((p) => {
                const list = plansByPatient.get(p.id) || [];
                const pub = list.find((x) => x.status === 'published');
                const on = p.id === selectedId;
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => selectPatient(p.id)}
                      aria-current={on ? 'true' : undefined}
                      className={`w-full flex items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors ${
                        on ? 'bg-[rgba(85,70,255,0.14)]' : 'hover:bg-white/[0.04]'
                      }`}
                    >
                      <span
                        className={`w-11 h-11 shrink-0 rounded-xl grid place-items-center font-semibold text-[14px] ${
                          on ? 'cp-selected' : 'bg-white/[0.06] text-[var(--cream)]'
                        }`}
                      >
                        {initials(p.name)}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-[14.5px] font-semibold truncate">{p.name}</span>
                        <span className="block text-[12px] truncate">
                          {p.status === 'pending' ? (
                            <span className="text-[var(--amber)]">Convite pendente</span>
                          ) : pub ? (
                            <span className="text-[var(--teal)]">● Plano publicado · {Math.round(planKcal(pub))} kcal</span>
                          ) : list.length ? (
                            <span className="text-[var(--muted)]">{list.length} rascunho{list.length > 1 ? 's' : ''}</span>
                          ) : (
                            <span className="text-[var(--dim)]">Sem plano</span>
                          )}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        {/* ── Detalhe do paciente ── */}
        <section className={`${!mobileDetail || !patient ? 'hidden lg:block' : ''} min-w-0`}>
          {!patient ? (
            <div className="rounded-[22px] border border-dashed border-[var(--line-2)] p-10 text-center text-[var(--muted)]">
              {loading ? 'Carregando…' : 'Selecione um paciente para ver e ajustar os planos.'}
            </div>
          ) : (
            <div className="space-y-5">
              <button
                type="button"
                onClick={() => (guardLeave() ? (setMobileDetail(false), setDraft(null), setDirty(false)) : null)}
                className="lg:hidden inline-flex items-center gap-2 text-[13.5px] text-[var(--muted)]"
              >
                <ArrowLeft className="w-4 h-4" /> Pacientes
              </button>

              {/* cabeçalho do paciente */}
              <div className="rounded-[22px] border border-[var(--line-2)] bg-[#0d0f18] overflow-hidden">
                <span aria-hidden className="cp-modal-bar" />
                <div className="p-5 sm:p-6 flex flex-wrap items-center gap-4">
                  <span className="cp-selected w-14 h-14 rounded-2xl grid place-items-center cp-display text-[20px] font-bold">
                    {initials(patient.name)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h2 className="cp-display text-[24px] font-bold leading-tight truncate">{patient.name}</h2>
                    <p className="flex items-center gap-2 text-[13px] text-[var(--muted)] truncate">
                      <Mail className="w-3.5 h-3.5 shrink-0" /> {patient.email || '—'}
                    </p>
                  </div>
                  <Badge tone={patient.status === 'active' ? 'teal' : 'amber'}>{patient.status === 'active' ? 'Ativo' : 'Convite pendente'}</Badge>
                  <div className="w-full sm:w-auto flex flex-wrap gap-2">
                    <button type="button" onClick={() => navigate(`/nutritionist/anamnese/${patient.id}`)} className="cp-btn-sm">
                      <ClipboardList className="w-4 h-4" /> Anamnese
                    </button>
                    {patient.status === 'active' && !draft && (
                      <button type="button" onClick={() => startEdit(null)} className="cp-btn-sm">
                        <Plus className="w-4 h-4" /> Novo plano
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {patient.status === 'pending' ? (
                <div className="rounded-[22px] border border-[rgba(255,181,71,0.3)] bg-[rgba(255,181,71,0.06)] p-6">
                  <p className="font-semibold text-[var(--amber)]">Aguardando {patient.name.split(' ')[0]} aceitar o convite</p>
                  <p className="mt-1 text-[13.5px] text-[var(--muted)]">
                    Assim que o convite for aceito, você poderá criar e publicar planos alimentares para este paciente.
                  </p>
                </div>
              ) : draft ? (
                <PlanEditor
                  draft={draft}
                  dirty={dirty}
                  busy={busy}
                  isPublished={patientPlans.find((p) => p.id === draft.id)?.status === 'published'}
                  onChange={editDraft}
                  onCancel={cancelEdit}
                  onSave={() => save(false)}
                  onPublish={() => save(true)}
                />
              ) : patientPlans.length === 0 ? (
                <div className="rounded-[22px] border border-dashed border-[var(--line-2)] p-8 sm:p-10 text-center">
                  <span className="mx-auto w-14 h-14 rounded-2xl grid place-items-center bg-[rgba(85,70,255,0.14)]">
                    <Utensils className="w-6 h-6 text-[var(--brand-300)]" />
                  </span>
                  <p className="mt-4 cp-display text-[20px] font-bold">{patient.name.split(' ')[0]} ainda não tem plano</p>
                  <p className="mt-1 text-[13.5px] text-[var(--muted)] max-w-md mx-auto">
                    Comece com as 6 refeições padrão e adicione os alimentos — as calorias são calculadas pela base de alimentos.
                  </p>
                  <div className="mt-5 flex justify-center">
                    <CTAButton type="button" onClick={() => startEdit(null)}>
                      Criar primeiro plano
                    </CTAButton>
                  </div>
                </div>
              ) : (
                <>
                  {/* planos do paciente */}
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {patientPlans.map((p) => {
                      const on = viewPlan?.id === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setViewPlanId(p.id);
                            setConfirmDelete(false);
                          }}
                          aria-pressed={on}
                          className={`shrink-0 text-left rounded-2xl border px-4 py-3 min-w-[200px] transition-colors ${
                            on ? 'border-[var(--brand-400)] bg-[rgba(85,70,255,0.12)]' : 'border-[var(--line)] hover:bg-white/[0.04]'
                          }`}
                        >
                          <span className="flex items-center justify-between gap-2">
                            <span className="text-[14px] font-semibold truncate max-w-[180px]">{p.title}</span>
                          </span>
                          <span className="mt-1.5 flex items-center gap-2">
                            <Badge tone={p.status === 'published' ? 'teal' : 'neutral'}>{p.status === 'published' ? 'Publicado' : 'Rascunho'}</Badge>
                            <span className="cp-mono text-[11px] text-[var(--dim)]">{Math.round(planKcal(p))} kcal</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {viewPlan && (
                    <PlanView
                      plan={viewPlan}
                      patientName={patient.name}
                      busy={busy}
                      confirmDelete={confirmDelete}
                      onEdit={() => startEdit(viewPlan)}
                      onDuplicate={() => startEdit(viewPlan, true)}
                      onToggle={() => togglePublish(viewPlan)}
                      onAskDelete={() => setConfirmDelete(true)}
                      onCancelDelete={() => setConfirmDelete(false)}
                      onDelete={() => remove(viewPlan)}
                    />
                  )}
                </>
              )}
            </div>
          )}
        </section>
      </div>

      <AddPatientModal
        isOpen={showInvite}
        professionalType="nutritionist"
        onClose={() => setShowInvite(false)}
        onSuccess={() => {
          void load();
        }}
      />
    </Page>
  );
}

// ─────────── visualização do plano ───────────
const SHADES = ['#8c82ff', '#ffb547', '#2ee6c8', '#5546ff', '#ff8a95', '#c4bfff', '#6fb3ff', '#e9c46a'];

function PlanView({
  plan,
  patientName,
  busy,
  confirmDelete,
  onEdit,
  onDuplicate,
  onToggle,
  onAskDelete,
  onCancelDelete,
  onDelete,
}: {
  plan: MealPlan;
  patientName: string;
  busy: string | null;
  confirmDelete: boolean;
  onEdit: () => void;
  onDuplicate: () => void;
  onToggle: () => void;
  onAskDelete: () => void;
  onCancelDelete: () => void;
  onDelete: () => void;
}) {
  const meals = plan.meals || [];
  const total = planKcal(plan);
  const published = plan.status === 'published';

  return (
    <motion.article
      key={String(plan.id)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[22px] border border-[var(--line)] bg-white/[0.025] overflow-hidden"
    >
      <header className="p-5 sm:p-6 border-b border-[var(--line)] flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="cp-kicker">{published ? 'Plano ativo · visível para o paciente' : 'Rascunho · só você vê'}</p>
          <h3 className="cp-display mt-1 text-[22px] font-bold leading-tight break-words">{plan.title}</h3>
          <p className="mt-1 text-[12.5px] text-[var(--muted)]">
            Atualizado em {fmtDate(plan.updatedAt)}
            {published && plan.publishedAt ? ` · publicado em ${fmtDate(plan.publishedAt)}` : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onEdit} className="cp-btn-sm">
            <Pencil className="w-4 h-4" /> Ajustar
          </button>
          <button type="button" onClick={onDuplicate} className="cp-btn-sm" title="Criar uma cópia para editar">
            <Copy className="w-4 h-4" /> Duplicar
          </button>
          <button
            type="button"
            onClick={onToggle}
            disabled={busy === 'toggle'}
            className={`h-9 px-4 rounded-full inline-flex items-center gap-2 text-[13px] font-semibold disabled:opacity-50 ${
              published ? 'border border-[var(--line-2)] text-[var(--muted)] hover:text-white' : 'cp-selected'
            }`}
          >
            {published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {busy === 'toggle' ? 'Aguarde…' : published ? 'Recolher' : 'Publicar'}
          </button>
        </div>
      </header>

      {/* distribuição calórica */}
      <div className="p-5 sm:p-6 border-b border-[var(--line)]">
        <div className="flex items-end justify-between gap-4">
          <p className="cp-display text-[40px] font-bold leading-none">
            {Math.round(total).toLocaleString('pt-BR')}
            <span className="ml-1 text-[14px] font-medium text-[var(--muted)]">kcal/dia</span>
          </p>
          <p className="cp-mono text-[11.5px] text-[var(--dim)] text-right">
            {meals.length} refeições · {meals.reduce((s, m) => s + (m.items?.length || 0), 0)} alimentos
          </p>
        </div>
        {total > 0 && (
          <>
            <div className="mt-4 flex h-3 rounded-full overflow-hidden bg-white/[0.06]" role="img" aria-label="Distribuição de calorias por refeição">
              {meals.map((m, i) => (
                <motion.span
                  key={m.id || i}
                  initial={{ width: 0 }}
                  animate={{ width: `${(mealKcal(m) / total) * 100}%` }}
                  transition={{ duration: 0.6, delay: i * 0.04 }}
                  style={{ background: SHADES[i % SHADES.length] }}
                  title={`${m.name}: ${Math.round(mealKcal(m))} kcal`}
                />
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
              {meals.map((m, i) => mealKcal(m) > 0 && (
                <span key={m.id || i} className="flex items-center gap-1.5 text-[12px] text-[var(--muted)]">
                  <span className="w-2 h-2 rounded-full" style={{ background: SHADES[i % SHADES.length] }} />
                  {m.name} <span className="cp-mono text-[var(--dim)]">{Math.round((mealKcal(m) / total) * 100)}%</span>
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* refeições */}
      {meals.length === 0 ? (
        <p className="p-6 text-[14px] text-[var(--muted)]">Este plano ainda não tem refeições. Toque em Ajustar para montar.</p>
      ) : (
        <ol className="divide-y divide-[var(--line)]">
          {meals.map((m, i) => (
            <li key={m.id || i} className="p-5 sm:px-6 grid sm:grid-cols-[96px_1fr] gap-3">
              <div className="flex sm:block items-center gap-3">
                <p className="cp-mono text-[13px]" style={{ color: SHADES[i % SHADES.length] }}>
                  {m.time || '--:--'}
                </p>
                <p className="cp-mono text-[11px] text-[var(--dim)] sm:mt-1">{Math.round(mealKcal(m))} kcal</p>
              </div>
              <div className="min-w-0">
                <p className="font-semibold">{m.name}</p>
                {m.items && m.items.length > 0 ? (
                  <ul className="mt-2 space-y-1.5">
                    {m.items.map((it, j) => (
                      <li key={it.id || j} className="flex items-baseline gap-3 text-[14px]">
                        <span className="flex-1 min-w-0 truncate">{it.name}</span>
                        <span className="text-[var(--muted)] whitespace-nowrap">{it.quantity || ''}</span>
                        <span className="cp-mono w-16 text-right text-[11.5px] text-[var(--dim)]">{it.calories != null ? `${it.calories} kcal` : ''}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-[13px] text-[var(--dim)]">Sem alimentos</p>
                )}
                {m.notes && <p className="mt-2 text-[12.5px] text-[var(--muted)] italic">{m.notes}</p>}
              </div>
            </li>
          ))}
        </ol>
      )}

      {plan.observations && (
        <div className="mx-5 sm:mx-6 mb-5 rounded-2xl bg-[rgba(85,70,255,0.08)] border border-[rgba(140,130,255,0.22)] px-4 py-3">
          <p className="cp-mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--brand-200)] mb-1">Orientações a {patientName.split(' ')[0]}</p>
          <p className="text-[14px] leading-relaxed whitespace-pre-line">{plan.observations}</p>
        </div>
      )}

      <footer className="px-5 sm:px-6 py-4 border-t border-[var(--line)] flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-[12.5px] text-[var(--dim)]">
          <FileText className="w-3.5 h-3.5" />
          {published ? `${patientName.split(' ')[0]} vê este plano na aba Dieta do app.` : 'Publique para o paciente ver no app.'}
        </p>
        {confirmDelete ? (
          <span className="flex items-center gap-2">
            <span className="text-[13px] text-[#ff8a95]">Excluir este plano?</span>
            <button type="button" onClick={onDelete} disabled={busy === 'delete'} className="h-8 px-3 rounded-full bg-[#ff5d6c] text-[#05060b] text-[12.5px] font-semibold disabled:opacity-50">
              {busy === 'delete' ? 'Excluindo…' : 'Sim, excluir'}
            </button>
            <button type="button" onClick={onCancelDelete} className="h-8 px-3 rounded-full text-[12.5px] text-[var(--muted)] hover:text-white">
              Cancelar
            </button>
          </span>
        ) : (
          <button type="button" onClick={onAskDelete} className="inline-flex items-center gap-1.5 text-[12.5px] text-[var(--dim)] hover:text-[#ff8a95]">
            <Trash2 className="w-3.5 h-3.5" /> Excluir
          </button>
        )}
      </footer>
    </motion.article>
  );
}

// ─────────── editor rápido ───────────
function PlanEditor({
  draft,
  dirty,
  busy,
  isPublished,
  onChange,
  onCancel,
  onSave,
  onPublish,
}: {
  draft: Draft;
  dirty: boolean;
  busy: string | null;
  isPublished: boolean;
  onChange: (fn: (d: Draft) => Draft) => void;
  onCancel: () => void;
  onSave: () => void;
  onPublish: () => void;
}) {
  const [openKey, setOpenKey] = useState<string | null>(draft.meals[0]?.key ?? null);
  const total = draft.meals.reduce((s, m) => s + mealKcal(m), 0);

  const setMeal = (key: string, fn: (m: DraftMeal) => DraftMeal) =>
    onChange((d) => ({ ...d, meals: d.meals.map((m) => (m.key === key ? fn(m) : m)) }));

  const setItem = (mealKey: string, itemKey: string, patch: Partial<DraftItem>) =>
    setMeal(mealKey, (m) => ({
      ...m,
      items: m.items.map((i) => {
        if (i.key !== itemKey) return i;
        const next = { ...i, ...patch };
        // alimento da base: calcula as calorias pela quantidade em g/ml
        const food = foodByName.get(next.name.trim().toLowerCase());
        if (food && ('name' in patch || 'quantity' in patch)) {
          if ('name' in patch && !next.quantity) next.quantity = `100${food.unit}`;
          const g = gramsOf(next.quantity);
          if (g != null) next.calories = String(Math.round((food.calories * g) / 100));
        }
        return next;
      }),
    }));

  const moveMeal = (key: string, dir: -1 | 1) =>
    onChange((d) => {
      const i = d.meals.findIndex((m) => m.key === key);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= d.meals.length) return d;
      const meals = [...d.meals];
      [meals[i], meals[j]] = [meals[j], meals[i]];
      return { ...d, meals };
    });

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-[22px] border border-[var(--brand-400)]/40 bg-white/[0.025] overflow-hidden">
      <datalist id="cp-food-list">
        {foodDatabase.map((f) => (
          <option key={f.id} value={f.name}>
            {f.calories} kcal/100{f.unit}
          </option>
        ))}
      </datalist>

      <div className="p-5 sm:p-6 border-b border-[var(--line)] space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="cp-kicker">{draft.id ? 'Ajustando plano' : 'Novo plano'}</p>
          {dirty && <Badge tone="amber">Alterações não salvas</Badge>}
        </div>
        <div>
          <FieldLabel htmlFor="pe-title">Nome do plano</FieldLabel>
          <input
            id="pe-title"
            value={draft.title}
            maxLength={80}
            onChange={(e) => onChange((d) => ({ ...d, title: e.target.value }))}
            className="cp-field cp-field-lg !text-[20px] !h-14"
          />
        </div>

        {/* ajuste rápido */}
        <div className="rounded-2xl border border-[var(--line)] p-4 flex flex-wrap items-center gap-3">
          <div className="mr-auto">
            <p className="cp-display text-[28px] font-bold leading-none">
              {Math.round(total).toLocaleString('pt-BR')}
              <span className="ml-1 text-[13px] font-medium text-[var(--muted)]">kcal/dia</span>
            </p>
            <p className="mt-1 text-[12px] text-[var(--dim)]">Ajuste rápido: muda todas as quantidades e calorias juntas</p>
          </div>
          {[0.9, 0.95, 1.05, 1.1].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => onChange((d) => scaleDraft(d, f))}
              disabled={total === 0}
              className="h-9 px-3 rounded-full border border-[var(--line-2)] cp-mono text-[12.5px] text-[var(--cream)] hover:bg-white/[0.06] disabled:opacity-30"
            >
              {f < 1 ? '−' : '+'}
              {Math.round(Math.abs(1 - f) * 100)}%
            </button>
          ))}
        </div>
      </div>

      {/* refeições */}
      <ol className="divide-y divide-[var(--line)]">
        {draft.meals.map((m, idx) => {
          const open = openKey === m.key;
          return (
            <li key={m.key}>
              <div className="flex items-center gap-2 px-4 sm:px-6 py-3">
                <button
                  type="button"
                  onClick={() => setOpenKey(open ? null : m.key)}
                  aria-expanded={open}
                  className="flex-1 min-w-0 flex items-center gap-3 text-left"
                >
                  <span className="cp-mono w-12 text-[12px] text-[var(--dim)]">{m.time || '--:--'}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-semibold truncate">{m.name || 'Refeição sem nome'}</span>
                    <span className="block cp-mono text-[11px] text-[var(--muted)]">
                      {m.items.length} itens · {Math.round(mealKcal(m))} kcal
                    </span>
                  </span>
                  <ChevronDown className={`w-4 h-4 text-[var(--muted)] transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
                <button type="button" aria-label="Subir refeição" title="Subir" disabled={idx === 0} onClick={() => moveMeal(m.key, -1)} className="w-8 h-8 rounded-full grid place-items-center text-[var(--dim)] hover:text-white hover:bg-white/[0.06] disabled:opacity-20">
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="Descer refeição"
                  disabled={idx === draft.meals.length - 1}
                  onClick={() => moveMeal(m.key, 1)}
                  title="Descer"
                  className="w-8 h-8 rounded-full grid place-items-center text-[var(--dim)] hover:text-white hover:bg-white/[0.06] disabled:opacity-20"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>

              <AnimatePresence initial={false}>
                {open && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="px-4 sm:px-6 pb-5 space-y-3">
                      <div className="grid grid-cols-[1fr_110px] gap-3">
                        <input
                          value={m.name}
                          onChange={(e) => setMeal(m.key, (x) => ({ ...x, name: e.target.value }))}
                          maxLength={60}
                          aria-label="Nome da refeição"
                          placeholder="Nome da refeição"
                          className="cp-field cp-field-plain h-11"
                        />
                        <input
                          type="time"
                          value={m.time}
                          onChange={(e) => setMeal(m.key, (x) => ({ ...x, time: e.target.value }))}
                          aria-label="Horário"
                          className="cp-field cp-field-plain h-11"
                        />
                      </div>

                      {m.items.length > 0 && (
                        <ul className="space-y-2">
                          <li className="hidden sm:grid grid-cols-[1fr_110px_90px_32px] gap-2 cp-mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--dim)] px-1">
                            <span>Alimento</span>
                            <span>Quantidade</span>
                            <span>kcal</span>
                            <span />
                          </li>
                          {m.items.map((it) => (
                            <li key={it.key} className="grid grid-cols-[1fr_84px_32px] sm:grid-cols-[1fr_120px_80px_32px] gap-2 items-center">
                              <input
                                value={it.name}
                                list="cp-food-list"
                                onChange={(e) => setItem(m.key, it.key, { name: e.target.value })}
                                maxLength={80}
                                placeholder="Alimento (digite para buscar)"
                                aria-label="Alimento"
                                className="col-span-3 sm:col-span-1 cp-field cp-field-plain h-10 !text-[14px]"
                              />
                              <QuantityStepper value={it.quantity} onChange={(v) => setItem(m.key, it.key, { quantity: v })} />
                              <input
                                value={it.calories}
                                inputMode="numeric"
                                onChange={(e) => setItem(m.key, it.key, { calories: e.target.value.replace(/[^\d]/g, '').slice(0, 4) })}
                                placeholder="kcal"
                                aria-label="Calorias"
                                className="cp-field cp-field-plain h-10 !text-[14px]"
                              />
                              <button
                                type="button"
                                aria-label={`Remover ${it.name || 'item'}`}
                                onClick={() => setMeal(m.key, (x) => ({ ...x, items: x.items.filter((i) => i.key !== it.key) }))}
                                className="w-8 h-8 rounded-full grid place-items-center text-[var(--dim)] hover:text-[#ff8a95]"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setMeal(m.key, (x) => ({ ...x, items: [...x.items, { key: uid(), name: '', quantity: '', calories: '' }] }))}
                          className="cp-btn-sm"
                        >
                          <Plus className="w-4 h-4" /> Alimento
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onChange((d) => ({ ...d, meals: d.meals.filter((x) => x.key !== m.key) }));
                          }}
                          className="ml-auto inline-flex items-center gap-1.5 text-[12.5px] text-[var(--dim)] hover:text-[#ff8a95]"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remover refeição
                        </button>
                      </div>

                      <input
                        value={m.notes}
                        onChange={(e) => setMeal(m.key, (x) => ({ ...x, notes: e.target.value }))}
                        maxLength={300}
                        placeholder="Observação da refeição (ex.: pode trocar o arroz por batata)"
                        aria-label="Observação da refeição"
                        className="cp-field cp-field-plain h-10 !text-[13.5px]"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ol>

      <div className="px-4 sm:px-6 py-4 border-t border-[var(--line)]">
        <button
          type="button"
          onClick={() => {
            const key = uid();
            onChange((d) => ({ ...d, meals: [...d.meals, { key, name: 'Nova refeição', time: '', notes: '', items: [] }] }));
            setOpenKey(key);
          }}
          className="cp-btn-sm"
        >
          <Plus className="w-4 h-4" /> Refeição
        </button>
      </div>

      <div className="p-5 sm:p-6 border-t border-[var(--line)]">
        <FieldLabel htmlFor="pe-obs">Orientações ao paciente</FieldLabel>
        <textarea
          id="pe-obs"
          rows={3}
          maxLength={2000}
          value={draft.observations}
          onChange={(e) => onChange((d) => ({ ...d, observations: e.target.value }))}
          placeholder="Hidratação, substituições permitidas, restrições…"
          className="cp-field"
        />
      </div>

      <footer className="sticky bottom-[76px] lg:bottom-0 z-10 p-4 sm:px-6 border-t border-[var(--line-2)] bg-[rgba(13,15,24,0.96)] backdrop-blur-xl flex flex-wrap items-center gap-3">
        <button type="button" onClick={onCancel} className="h-10 px-4 rounded-full text-[13.5px] text-[var(--muted)] hover:text-white">
          Cancelar
        </button>
        <span className="ml-auto" />
        <button type="button" onClick={onSave} disabled={busy !== null} className="cp-btn-sm h-10 disabled:opacity-50">
          <Check className="w-4 h-4" /> {busy === 'save' ? 'Salvando…' : isPublished ? 'Salvar alterações' : 'Salvar rascunho'}
        </button>
        <button type="button" onClick={onPublish} disabled={busy !== null} className="cp-selected h-10 px-5 rounded-full inline-flex items-center gap-2 text-[14px] font-semibold disabled:opacity-50">
          <Eye className="w-4 h-4" /> {busy === 'publish' ? 'Publicando…' : isPublished ? 'Salvar e manter publicado' : 'Publicar para o paciente'}
        </button>
      </footer>
    </motion.div>
  );
}

function QuantityStepper({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const q = parseQuantity(value);
  const step = (dir: 1 | -1) => {
    if (!q) return onChange(dir > 0 ? '100g' : value);
    const isWeight = /^(g|ml)$/i.test(q.unit.trim());
    const inc = isWeight ? (q.n >= 100 ? 25 : 10) : 0.5;
    onChange(formatQuantity(Math.max(isWeight ? 5 : 0.5, q.n + dir * inc), q.unit));
  };
  return (
    <div className="flex items-center gap-1 h-10 rounded-[14px] border border-[var(--line-2)] bg-white/[0.03] px-1">
      <button type="button" aria-label="Diminuir quantidade" onClick={() => step(-1)} className="w-7 h-7 rounded-full grid place-items-center text-[var(--muted)] hover:text-white">
        <Minus className="w-3.5 h-3.5" />
      </button>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, 20))}
        placeholder="100g"
        aria-label="Quantidade"
        className="w-full min-w-0 bg-transparent text-center text-[13.5px] text-white focus:outline-none"
      />
      <button type="button" aria-label="Aumentar quantidade" onClick={() => step(1)} className="w-7 h-7 rounded-full grid place-items-center text-[var(--muted)] hover:text-white">
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

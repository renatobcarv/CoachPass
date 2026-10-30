# CoachPass — Auditoria Completa: Módulo Nutricionista ↔ Aluno

> **Status:** Fase de auditoria concluída — aguardando aprovação para execução.
> **Data:** 28/10/2026
> **Escopo:** Módulo Nutricionista ↔ Aluno — leitura/análise estática apenas.
> **Nota:** Nenhum código foi modificado, nenhum dado foi alterado.

---

## 1. Resumo Executivo

O módulo Nutricionista ↔ Aluno apresenta uma **interface visualmente completa** mas com **gaps críticos de integração real com o backend**. As collections do Payload CMS estão bem modeladas, porém o frontend utiliza amplamente **dados mockados (hardcoded)** em vez de consumir a API real. Os fluxos de convite e vínculo profissional são os únicos operacionais de ponta a ponta. O erro recorrente `"This relationship field has the following invalid relationships: 51 0"` foi identificado e tem causa raiz confirmada relacionada ao uso de **IDs numéricos `0` (falsy)** ou IDs **obsoletos/inexistentes** sendo enviados nos campos `relationship` do Payload.

**Destaques críticos:**
- `CreateDietPlan` usa `mockPatients` hardcoded — **nunca salva no banco**
- `NutritionistPatientDetails` usa `patientData` completamente mockada — **não carrega dados reais**
- `NutritionistAnamnese` não tem integração com nenhuma collection — **dados perdidos ao sair da página**
- `NutritionConsultation` não foi auditada (não existe collection de consultas mapeada)
- O chatbot (`AIChat`) usa respostas fixas em array — **sem chamada a nenhuma API**
- Notificações: toggles salvam apenas em `localStorage` — **sem backend real**

---

## 2. Escopo da Responsabilidade

Esta auditoria cobre exclusivamente:

- Perfil e cadastro do nutricionista
- Vinculação nutricionista ↔ aluno (ProfessionalLinks)
- Convites de pacientes
- Gestão e CRUD de pacientes
- Criação, edição, visualização e exclusão de planos alimentares (MealPlans)
- Criação e gerenciamento de refeições
- Metas calóricas e macronutrientes
- Anamnese nutricional
- Dashboard e indicadores nutricionais
- Notificações relacionadas
- Configurações e preferências

**Fora do escopo (módulos de outros integrantes):** Personal Trainer, Master, infraestrutura de banco, autenticação global.

---

## 3. Mapeamento de Telas e Funcionalidades

### Rotas do Nutricionista (`/nutritionist/*`)

| Rota | Componente | Observação |
|---|---|---|
| `/nutritionist` | `NutritionistDashboard` | Dados reais de vínculos; KPIs parcialmente mockados |
| `/nutritionist/paciente/:id` | `NutritionistPatientDetails` | **100% mockado** |
| `/nutritionist/criar-plano` | `CreateDietPlan` | **mockPatients hardcoded; save não persiste** |
| `/nutritionist/criar-plano/:patientId` | `CreateDietPlan` | Igual, ignora `patientId` real |
| `/nutritionist/consulta/:patientId` | `NutritionConsultation` | Não auditado (falta collection) |
| `/nutritionist/anamnese` | `NutritionistAnamnese` | **Sem integração API** |
| `/nutritionist/anamnese/:patientId` | `NutritionistAnamnese` | **`patientId` não é usado** |
| `/nutritionist/alimentos` | `NutritionistAlimentos` | Não auditado |
| `/nutritionist/perfil` | `Profile` | Redireciona para `/app/perfil` (aluno) |
| `/nutritionist/configuracoes` | `Settings` | Parcialmente funcional |
| `/nutritionist/financeiro` | Redirect | Redireciona para `/nutritionist` |

---

## 4. Inventário de Collections e Relacionamentos

### Collections existentes no Payload CMS

| Collection | Slug | Campos relevantes |
|---|---|---|
| Users | `users` | `name`, `role`, `whatsapp`, `professionalId`, `plan` |
| StudentProfiles | `student-profiles` | `user` (rel→users), dados físicos, objetivos |
| ProfessionalLinks | `professional-links` | `student` (rel→users), `professional` (rel→users), `professionalRole`, `status` |
| MealPlans | `meal-plans` | `student` (rel→users), `author` (rel→users), `meals[]`, `status`, `source` |
| Workouts | `workouts` | Para Personal (fora do escopo desta auditoria) |
| AiGenerations | `ai-generations` | `user` (rel→users), `type` (`workout`/`meal_plan`), `status` |
| Media | `media` | Uploads |

### Relacionamentos críticos

```
Users ←─── ProfessionalLinks ───→ Users
  ↑                                  ↑
  |         (student) (professional) |
  └─────────── MealPlans ────────────┘
                 ↑    ↑
              (student) (author)
```

### ⚠️ Collection ausente: Anamnese

Não existe uma collection `anamneses` ou equivalente no Payload CMS. Os dados da tela `NutritionistAnamnese` são **completamente voláteis** (perdidos ao recarregar).

### ⚠️ Collection ausente: Consultas

Não existe uma collection `consultations` ou equivalente. Os dados de `NutritionConsultation` e `NutritionistPatientDetails` (aba Consultas) são mockados.

---

## 5. Análise do Erro `"This relationship field has the following invalid relationships: 51 0"`

### Diagnóstico

O Payload CMS retorna este erro quando um campo `type: 'relationship'` recebe um valor de ID que **não corresponde a nenhum documento na collection referenciada**.

#### Hipóteses investigadas

**Hipótese A — ID `0` (número zero):** O valor `0` é **falsy** em JavaScript. Em alguns fluxos, o ID do aluno pode ser inicializado como `0` ou cair para `0` quando uma variável não está definida.

- **Evidência:** Em `CreateDietPlan.tsx` (linha 126-129), `mockPatients` tem IDs `'1'` e `'2'` (strings). A função `asId` em `nutriApi.ts` (linha 51) converte strings numéricas para `Number(v)`. Se o frontend enviar `student: 0`, o Payload rejeita porque não existe usuário com ID 0.

**Hipótese B — ID `51` (usuário demo/seed):** O usuário "petter pablo" (Personal Trainer) pode ter sido criado com um ID `51` em um banco de dados de teste anterior, e esse ID pode ter sido persistido em algum dado de link ou formulário que está sendo reenviado.

- **Evidência:** O erro menciona especificamente `51 0` — dois IDs inválidos. O `51` pode ser o ID do Personal Trainer sendo enviado onde deveria ser o ID do aluno. O `0` é claramente um valor inválido gerado por falta de seleção.

**Hipótese C — Confusão entre `linkId` e `studentId`:** Em `NutritionistDashboard`, a `PatientRow` tem dois IDs: `id` (ID do usuário/aluno) e `linkId` (ID do documento `professional-links`). Se o frontend confundir os dois e enviar o `linkId` no campo `student`, o Payload buscaria um usuário com aquele ID numérico e não encontraria.

**Hipótese D — ID do Personal sendo enviado como aluno:** O error report menciona que o usuário logado é "petter pablo (Personal Trainer)" e o aluno selecionado também é "petter pablo". Isso sugere que o mesmo ID está sendo enviado para os dois campos `student` e `professional` (auto-relacionamento proibido pelo endpoint de convite).

#### Causa raiz mais provável

Para o **módulo Personal Trainer** (seções 3.1 a 3.4 do documento original): O Personal está **enviando seu próprio ID como aluno** ou **o campo de aluno está sendo preenchido com `0`** (nenhum aluno selecionado). Isso é bloqueado pelo `mealPlanGuard` e pelas validações do Payload.

Para o **módulo Nutricionista**: O `CreateDietPlan` **nunca chama a API real** — usa `mockPatients` com IDs `'1'` e `'2'` que não existem no banco real. Quando/se a integração for feita sem corrigir isso, o erro `51 0` também aparecerá.

#### O que investigar no banco antes de corrigir

- [ ] Verificar se existem documentos em `professional-links` com `student: 51` ou `student: 0`
- [ ] Verificar se o usuário ID `51` existe na collection `users`
- [ ] Verificar se existem `meal-plans` ou `workouts` com `student: 0`
- [ ] Checar o payload exato enviado pelo frontend nas requisições que falham (DevTools → Network)

---

## 6. Diagnóstico dos CRUDs

### 6.1 MealPlans (Planos Alimentares)

#### CREATE
| Aspecto | Status | Observação |
|---|---|---|
| Endpoint | ✅ Existe | `POST /api/meal-plans` via Payload |
| Função frontend | ❌ Não chamada | `createMealPlan` em `nutriApi.ts` existe mas `CreateDietPlan` usa `mockPatients` e `setTimeout` |
| Validação backend | ✅ Funcional | `mealPlanGuard` verifica vínculo ativo |
| Persistência | ❌ Não persiste | `handleSave` só faz `setTimeout` e `toast.success` |
| `student` correto | ❌ ID mockado | IDs `'1'` e `'2'` não existem no banco |

#### READ
| Aspecto | Status | Observação |
|---|---|---|
| Endpoint | ✅ Existe | `GET /api/meal-plans` |
| Função frontend | ✅ Existe | `fetchMyMealPlans` em `nutriApi.ts` |
| Uso no dashboard | ✅ Parcial | `NutritionistDashboard` não exibe lista de planos (só pacientes) |
| Uso em `PatientDetails` | ❌ Mockado | Usa `mockMealPlan` hardcoded |

#### UPDATE
| Aspecto | Status | Observação |
|---|---|---|
| Endpoint | ✅ Existe | `PATCH /api/meal-plans/:id` |
| Função frontend | ✅ Existe | `updateMealPlan` em `nutriApi.ts` |
| UI | ❌ Não integrada | Botão "Editar plano" abre `CreateDietPlan` com `mockPatients` |

#### DELETE
| Aspecto | Status | Observação |
|---|---|---|
| Endpoint | ✅ Existe | `DELETE /api/meal-plans/:id` |
| Função frontend | ✅ Existe | `deleteMealPlan` em `nutriApi.ts` |
| UI | ❌ Não integrada | Nenhum botão de exclusão na interface do nutricionista |

### 6.2 ProfessionalLinks (Vínculo Nutricionista ↔ Aluno)

#### CREATE (Convite)
| Aspecto | Status | Observação |
|---|---|---|
| Endpoint | ✅ Funcional | `POST /api/professional-links/invite` |
| UI | ✅ Funcional | `AddPatientModal` chama o endpoint correto |
| Validação | ✅ Funcional | Verifica aluno existente, evita duplicatas |
| Persistência | ✅ Funcional | Cria `professional-links` com `status: 'pending'` |

#### READ (Listagem de pacientes)
| Aspecto | Status | Observação |
|---|---|---|
| Endpoint | ✅ Funcional | `GET /api/professional-links` com filtros |
| UI | ✅ Funcional | `NutritionistDashboard` carrega pacientes reais |
| `studentInfo` | ✅ Funcional | Hook `afterRead` retorna nome/email via `overrideAccess` |

#### UPDATE (Aceitar/Revogar)
| Aspecto | Status | Observação |
|---|---|---|
| Endpoint | ❌ Limitado | `update` e `delete` permitidos apenas para `isSuperUser` |
| UI aluno | ❌ Não implementada | Aluno não tem tela para aceitar/rejeitar convite |
| Aceitação automática | ❌ Ausente | Convites ficam como `pending` para sempre |

#### DELETE
| Aspecto | Status | Observação |
|---|---|---|
| Endpoint | ❌ Super only | Apenas super admin pode deletar |
| UI | ❌ Não implementada | Sem botão de encerramento de vínculo |

### 6.3 Anamnese

| Aspecto | Status | Observação |
|---|---|---|
| Collection backend | ❌ Não existe | Nenhuma collection `anamneses` no Payload |
| Formulário frontend | ⚠️ Parcial | Interface rica mas sem integração |
| `patientId` usado | ❌ Ignorado | `useParams().patientId` não é utilizado |
| Persistência | ❌ Inexistente | Dados perdidos ao sair da página |
| Listagem | ❌ Inexistente | Nenhum lugar exibe anamneses salvas |
| Rascunho | ❌ Inexistente | "Salvar seção" apenas muda estado local |

---

## 7. Problemas Encontrados por Funcionalidade

### P0 — Bloqueios Críticos (impedem funcionamento básico)

#### [P0-01] `CreateDietPlan` usa dados mockados — planos nunca são salvos

- **Arquivo:** [`src/web/components/pages/CreateDietPlan.tsx`](file:///c:/Codding/CoachPass/src/web/components/pages/CreateDietPlan.tsx#L126-L129)
- **Problema:** `mockPatients = [{ id: '1', name: 'Ana Costa' }, { id: '2', name: 'Roberto Lima' }]` — esses IDs não existem no banco real. A função `handleSave` usa `setTimeout` simulando save.
- **Impacto:** 100% das tentativas de salvar planos alimentares falham silenciosamente.
- **Solução:** Substituir `mockPatients` por dados reais via `fetchNutriPatients`, e `handleSave` por `createMealPlan` de `nutriApi.ts`.

#### [P0-02] `NutritionistPatientDetails` exibe apenas dados mockados

- **Arquivo:** [`src/web/components/pages/NutritionistPatientDetails.tsx`](file:///c:/Codding/CoachPass/src/web/components/pages/NutritionistPatientDetails.tsx#L38-L184)
- **Problema:** `patientData`, `mockMealPlan`, `mockConsultations` e `progressData` são todos hardcoded. O `id` do params é capturado mas nunca usado para buscar dados reais.
- **Impacto:** Todos os pacientes mostram os dados da "Ana Costa" fictícia.

#### [P0-03] `NutritionistAnamnese` não persiste dados

- **Arquivo:** [`src/web/components/pages/NutritionistAnamnese.tsx`](file:///c:/Codding/CoachPass/src/web/components/pages/NutritionistAnamnese.tsx#L159-L174)
- **Problema:** `finish()` apenas chama `navigate('/nutritionist')` sem nenhuma chamada de API. Não existe collection de anamnese no backend.
- **Impacto:** Qualquer anamnese preenchida é perdida ao sair da página.

#### [P0-04] Aluno não pode aceitar/rejeitar convites

- **Arquivo:** [`src/collections/ProfessionalLinks.ts`](file:///c:/Codding/CoachPass/src/collections/ProfessionalLinks.ts#L29-L30)
- **Problema:** `update: ({ req }) => isSuperUser(req)` — apenas super admin pode atualizar vínculos. Não existe tela ou endpoint para o aluno aceitar um convite.
- **Impacto:** Todos os vínculos ficam como `pending` para sempre. O `mealPlanGuard` exige `status: 'active'` para criar planos — portanto nenhum plano pode ser criado mesmo que o formulário seja corrigido.

### P1 — Funcionalidades Essenciais com falha

#### [P1-01] KPIs do dashboard parcialmente mockados

- **Arquivo:** [`src/web/components/pages/NutritionistDashboard.tsx`](file:///c:/Codding/CoachPass/src/web/components/pages/NutritionistDashboard.tsx#L146-L149)
- **Problema:** "Consultas hoje: 8" e "Taxa de adesão: 87%" são valores fixos. Apenas "Pacientes ativos" e "Convites pendentes" são reais.

#### [P1-02] `CreateDietPlan` — limite arbitrário na meta calórica

- **Arquivo:** [`src/web/components/pages/CreateDietPlan.tsx`](file:///c:/Codding/CoachPass/src/web/components/pages/CreateDietPlan.tsx#L368-L383)
- **Problema:** Slider e botões limitam entre 1.200 e 4.000 kcal. Nutricionistas podem prescrever faixas fora desse intervalo (ex.: pacientes com necessidades especiais).
- **Solução:** Permitir digitação direta + validação com mínimos/máximos justificados.

#### [P1-03] `CreateDietPlan` — refeições fixas não personalizáveis

- **Arquivo:** [`src/web/components/pages/CreateDietPlan.tsx`](file:///c:/Codding/CoachPass/src/web/components/pages/CreateDietPlan.tsx#L92-L99)
- **Problema:** `defaultMeals` com 6 refeições fixas (Café, Lanche, Almoço, Lanche, Jantar, Ceia). Não é possível adicionar, remover ou renomear refeições.

#### [P1-04] Macronutrientes têm slider com range limitado (10%-60%)

- **Arquivo:** [`src/web/components/pages/CreateDietPlan.tsx`](file:///c:/Codding/CoachPass/src/web/components/pages/CreateDietPlan.tsx#L418-L422)
- **Problema:** `min={10} max={60}` nos sliders impede prescrições específicas (ex.: dieta cetogênica com gordura >70%).

#### [P1-05] Rota `/nutritionist/perfil` redireciona para perfil de aluno

- **Arquivo:** [`src/web/routes.tsx`](file:///c:/Codding/CoachPass/src/web/routes.tsx#L127)
- **Problema:** `{ path: 'perfil', Component: Profile }` — `Profile` é o componente de perfil do aluno (com bioimpedância etc.), não o perfil profissional do nutricionista.

### P2 — Melhorias e funcionalidades pendentes

#### [P2-01] Chatbot não tem integração real com API

- **Arquivo:** [`src/web/components/AIChat.tsx`](file:///c:/Codding/CoachPass/src/web/components/AIChat.tsx#L22-L26)
- **Problema:** `aiResponses` é um array fixo de 4 respostas. O botão "Assistente" nunca chama `/api/ai/chat` ou qualquer endpoint real. A API `/api/ai/generate-workout` existe mas é diferente.
- **Status:** Chatbot é uma **demonstração visual apenas**.

#### [P2-02] Notificações salvas apenas em `localStorage`

- **Arquivo:** [`src/web/components/pages/Settings.tsx`](file:///c:/Codding/CoachPass/src/web/components/pages/Settings.tsx#L143-L147)
- **Problema:** `saveSettings` salva em `localStorage` via `savePrefs`. Toggles de email, push e SMS não ativam nenhum serviço real.
- **Impacto:** Preferências se perdem ao trocar de dispositivo; nenhuma notificação é enviada de fato.

#### [P2-03] Privacidade — "Perfil Público" e "Compartilhar Progresso" presentes

- **Arquivo:** [`src/web/components/pages/Settings.tsx`](file:///c:/Codding/CoachPass/src/web/components/pages/Settings.tsx#L522-L526)
- **Pedido:** Remover essas duas opções da interface (seção 10 do briefing).

#### [P2-04] Nome do usuário pode aparecer como "Usuário"

- **Arquivo:** [`src/web/context/AuthContext.tsx`](file:///c:/Codding/CoachPass/src/web/context/AuthContext.tsx#L55)
- **Problema:** `const name = doc.name || doc.email?.split('@')[0] || 'Usuário'` — se `name` for string vazia, exibe a parte do email. Se não tiver nome cadastrado E o email for inválido, mostra "Usuário".

#### [P2-05] Validação de CRN no campo `professionalId` é genérica

- **Arquivo:** [`src/web/components/pages/Settings.tsx`](file:///c:/Codding/CoachPass/src/web/components/pages/Settings.tsx#L366)
- **Problema:** O campo exibe placeholder `'CRN-3 12345'` mas não aplica máscara ou validação específica do formato CRN (ex.: `CRN-X NNNNN`). O `credentialError` de `validation.ts` precisa ser auditado.

#### [P2-06] `NutritionConsultation` não auditada — sem collection

- **Arquivo:** `src/web/components/pages/NutritionConsultation.tsx` (não lido)
- **Status:** Não verificado. Provavelmente mockado como `NutritionistPatientDetails`.

#### [P2-07] `NutritionistAlimentos` não auditada

- **Arquivo:** `src/web/components/pages/NutritionistAlimentos.tsx` (não lido)
- **Status:** Não verificado.

---

## 8. Matriz Funcional

| Funcionalidade | Estado | Problema | Evidência | Solução Sugerida |
|---|---|---|---|---|
| Cadastro profissional (perfil) | Parcial | CRN sem máscara real; salva no banco | `Settings.tsx:366` | Implementar máscara e validação CRN |
| Convite de paciente | Funcional | — | `invite/route.ts` ✅ | — |
| Aceitação de convite | Não implementada | Aluno não tem UI; `update` só super | `ProfessionalLinks.ts:29` | Criar endpoint e tela para aluno |
| Listagem de pacientes | Funcional | KPIs extras mockados | `NutritionistDashboard` | Conectar KPIs reais |
| Abrir perfil do paciente | Com erro | 100% mockado | `NutritionistPatientDetails` | Buscar dados reais por ID |
| CREATE plano alimentar | Com erro | Mock; não salva | `CreateDietPlan:handleSave` | Integrar `createMealPlan` |
| READ plano alimentar | Parcial | API existe; UI não usa | `nutriApi.ts` ✅ | Conectar UI aos planos reais |
| UPDATE plano alimentar | Com erro | Abre form com mock | `CreateDietPlan` | Carregar plano existente para edição |
| DELETE plano alimentar | Não implementada | Sem botão na UI | — | Adicionar botão + confirmação |
| Refeições personalizáveis | Não implementada | Apenas 6 fixas | `defaultMeals` | CRUD dinâmico de refeições |
| Meta calórica livre | Com erro | Slider 1200–4000 limitado | `CreateDietPlan:368` | Permitir input direto |
| Macronutrientes editáveis | Parcial | Sliders limitados 10-60% | `CreateDietPlan:418` | Alargar range; permitir input |
| Anamnese | Com erro | Sem persistência; sem collection | `NutritionistAnamnese` | Criar collection + integração |
| Dashboard nutricional (paciente) | Com erro | 100% mockado | `NutritionistPatientDetails` | Integrar dados reais |
| Consultas nutricionais | Não verificada | Provavelmente mockada | `NutritionConsultation` | Auditar + criar collection |
| Notificações (sino) | Não implementada | Sem collection; sem eventos | `Settings.tsx:saveSettings` | Criar mecanismo real |
| Preferências de notificação | Parcial | Salva só local; sem serviços | `Settings.tsx:localStorage` | Persistir no banco; conectar provedores |
| Privacidade | Parcial | `profilePublic` e `shareProgress` devem ser removidos | `Settings.tsx:522-526` | Remover da UI |
| Chatbot | Não implementada | Respostas fixas em array | `AIChat.tsx:22` | Conectar a endpoint real de IA |
| Encerramento de vínculo | Não implementada | Sem UI; `delete` super only | `ProfessionalLinks.ts:30` | Criar endpoint para nutricionista |

---

## 9. Soluções Recomendadas

### S1 — Corrigir aceitação de convite (bloqueante)

Criar endpoint `PATCH /api/professional-links/:id/accept` acessível pelo aluno, que mude `status: 'pending'` para `status: 'active'`. Atualizar `ProfessionalLinks` para permitir:

```typescript
update: ({ req }) => {
  if (isSuperUser(req)) return true
  const role = userRole(req)
  // Aluno pode aceitar/revogar seu próprio vínculo
  if (role === 'student') return { student: { equals: userId(req) } }
  // Profissional pode revogar vínculos seus
  if (role === 'personal' || role === 'nutritionist') return { professional: { equals: userId(req) } }
  return false
}
```

### S2 — Integrar `CreateDietPlan` com dados reais

1. Importar `fetchNutriPatients` de `nutriApi.ts`
2. Substituir `mockPatients` por `useEffect` que carrega pacientes reais
3. Substituir `handleSave` por chamada a `createMealPlan` passando `selectedPatient` como ID real
4. Tratar loading state e erros

### S3 — Criar collection de Anamnese

```typescript
export const Anamneses: CollectionConfig = {
  slug: 'anamneses',
  access: {
    create: ({ req }) => userRole(req) === 'nutritionist',
    read: ({ req }) => {
      if (isSuperUser(req)) return true
      const id = userId(req)
      if (userRole(req) === 'nutritionist') return { author: { equals: id } }
      if (userRole(req) === 'student') return { patient: { equals: id } }
      return false
    },
    update: ({ req }) => {
      if (isSuperUser(req)) return true
      return { author: { equals: userId(req) } }
    },
    delete: ({ req }) => isSuperUser(req),
  },
  fields: [
    { name: 'author', type: 'relationship', relationTo: 'users', required: true },
    { name: 'patient', type: 'relationship', relationTo: 'users', required: true },
    { name: 'status', type: 'select', options: ['draft', 'completed'], defaultValue: 'draft' },
    { name: 'data', type: 'json' }, // ou campos explícitos por seção
    { name: 'completedAt', type: 'date' },
  ],
}
```

### S4 — Integrar `NutritionistPatientDetails` com dados reais

1. Usar `id` de `useParams()` para buscar o `professional-links` correspondente
2. Buscar `meal-plans` do paciente via `fetchMyMealPlans` filtrado por `student`
3. Buscar `anamneses` quando a collection existir
4. Substituir gráficos e KPIs por dados reais (ou manter com aviso visual de "em implementação")

### S5 — Corrigir o erro `51 0`

**Para o módulo Personal Trainer** (causa raiz provável):
- Verificar se o `studentId` está sendo inicializado com `0` ou com o ID do próprio Personal
- Adicionar guard no frontend antes de enviar: `if (!studentId || studentId === '0') throw new Error('Selecione um aluno')`

**Para o módulo Nutricionista** (prevenção):
- Garantir que `CreateDietPlan` nunca envia `student: undefined` ou `student: 0`
- O `mealPlanGuard` já protege no backend, mas erros de validação devem ser capturados e exibidos no frontend

---

## 10. Riscos e Impactos no Trabalho da Equipe

| Mudança | Risco | Quem afeta |
|---|---|---|
| Criar collection `anamneses` | Baixo — nova collection isolada | Apenas nutricionista |
| Modificar `ProfessionalLinks.update` | Médio — afeta Personal e Nutricionista | Verificar com time do Personal |
| Integrar `CreateDietPlan` com API | Baixo — frontend isolado | Apenas nutricionista |
| Remover `profilePublic`/`shareProgress` | Baixo — campos só em localStorage | — |
| Criar collection `consultations` | Baixo — nova collection | Apenas nutricionista |
| Modificar `MealPlans` | Médio — Personal pode usar | Verificar dependências |

---

## 11. Planejamento por Fases

### Fase 1 — Relacionamentos e banco (P0 crítico)

**Objetivo:** Fazer o fluxo mínimo funcionar de ponta a ponta.

- [ ] Investigar e documentar a causa raiz do erro `51 0` no banco de dados
- [ ] Corrigir `ProfessionalLinks.update` para permitir aluno aceitar convite
- [ ] Criar tela de convites pendentes para o aluno
- [ ] Criar collection `anamneses` e rodar migração
- [ ] Criar collection `consultations` (avaliação necessária)

### Fase 2 — Fluxo Nutricionista ↔ Aluno

**Objetivo:** Convite → Vínculo → Dados reais de paciente.

- [ ] Integrar `NutritionistPatientDetails` com dados reais
- [ ] Implementar encerramento de vínculo (revogar)
- [ ] Corrigir comportamento de dados após encerramento
- [ ] Atualizar dashboard após operações

### Fase 3 — CRUD Nutricional

**Objetivo:** Planos alimentares e refeições realmente persistidos.

- [ ] Integrar `CreateDietPlan` com `fetchNutriPatients` (lista real)
- [ ] Integrar `handleSave` com `createMealPlan` de `nutriApi.ts`
- [ ] Implementar carregamento de plano existente para edição
- [ ] Implementar exclusão de plano
- [ ] Implementar CRUD dinâmico de refeições
- [ ] Corrigir limites da meta calórica (input livre)
- [ ] Corrigir range dos sliders de macronutrientes

### Fase 4 — Anamnese

**Objetivo:** Anamnese salva e recuperável.

- [ ] Integrar `NutritionistAnamnese` com a nova collection
- [ ] Usar `patientId` do params para associar ao paciente correto
- [ ] Implementar rascunho (salvar sem concluir)
- [ ] Implementar conclusão com validação
- [ ] Exibir listagem de anamneses no `NutritionistPatientDetails`

### Fase 5 — Cadastro e Configurações

**Objetivo:** Perfil profissional completo.

- [ ] Implementar máscara e validação real de CRN
- [ ] Implementar máscara de WhatsApp `(XX) XXXXX-XXXX`
- [ ] Remover "Perfil Público" e "Compartilhar Progresso" da tela de privacidade
- [ ] Corrigir rota `/nutritionist/perfil` (redireciona para componente de aluno)
- [ ] Auditar `NutritionistAlimentos`

### Fase 6 — Notificações e integrações

**Objetivo:** Notificações reais e chatbot operacional.

- [ ] Decidir arquitetura de notificações (WebSocket, polling, push)
- [ ] Criar collection de notificações ou usar solução externa
- [ ] Conectar eventos reais (aceitação de convite, novo plano) a notificações
- [ ] Persistir preferências de notificação no banco (campo na collection `users`)
- [ ] Auditar e corrigir chatbot (`AIChat`) — conectar a endpoint real ou sinalizar como demo

### Fase 7 — Testes e validação final

**Objetivo:** Todos os cenários do documento validados.

- [ ] Cenário 1: Cadastro e autenticação com dados preservados
- [ ] Cenário 2: Convite → aceitação → vínculo persistido
- [ ] Cenário 3: Criação de plano alimentar com paciente real
- [ ] Cenário 4: Edição de plano existente sem perda de dados
- [ ] Cenário 5: Aluno visualiza plano atribuído
- [ ] Cenário 6: Anamnese salva e recuperável
- [ ] Cenário 7: Notificação gerada por evento real
- [ ] Cenário 8: Isolamento de dados entre nutricionistas
- [ ] Cenário 9: Persistência após logout/login
- [ ] Cenário 10: Zero referências inválidas no banco

---

## 12. To-Do List Completa e Priorizada

### P0 — Bloqueios Críticos

| ID | Descrição | Arquivos | Resp. | Dependência | Critério de Aceite |
|---|---|---|---|---|---|
| T01 | Investigar erro `51 0` no banco — checar IDs inválidos em `professional-links`, `meal-plans`, `workouts` | DB + DevTools | Compartilhado | — | Causa raiz documentada com evidência |
| T02 | Corrigir `ProfessionalLinks` para aluno aceitar convite | `ProfessionalLinks.ts` | Meu módulo | T01 | Aluno consegue aceitar; status muda para `active` |
| T03 | Criar tela de convites pendentes para o aluno | novo componente | Meu módulo | T02 | Aluno vê e aceita convites na UI |
| T04 | Criar collection `anamneses` + migração | `src/collections/Anamneses.ts` | Meu módulo | — | Dados salvos e recuperados |
| T05 | Integrar `CreateDietPlan` com pacientes reais | `CreateDietPlan.tsx` | Meu módulo | T02 | Selector mostra pacientes reais vinculados |
| T06 | Integrar `handleSave` de `CreateDietPlan` com `createMealPlan` | `CreateDietPlan.tsx`, `nutriApi.ts` | Meu módulo | T05 | Plano aparece no banco após salvar |

### P1 — Funcionalidades Essenciais

| ID | Descrição | Arquivos | Resp. | Dependência | Critério de Aceite |
|---|---|---|---|---|---|
| T07 | Integrar `NutritionistPatientDetails` com dados reais | `NutritionistPatientDetails.tsx` | Meu módulo | T06 | Paciente real exibido com dados do banco |
| T08 | Implementar READ de planos no `PatientDetails` | `NutritionistPatientDetails.tsx` | Meu módulo | T07 | Planos reais listados |
| T09 | Implementar UPDATE de plano alimentar | `CreateDietPlan.tsx` | Meu módulo | T08 | Edição salva no banco sem perder dados |
| T10 | Implementar DELETE de plano alimentar | `NutritionistPatientDetails.tsx` | Meu módulo | T08 | Plano removido do banco após confirmação |
| T11 | Implementar CRUD dinâmico de refeições | `CreateDietPlan.tsx` | Meu módulo | T06 | Nutricionista cria, edita e remove refeições |
| T12 | Corrigir limite da meta calórica (input livre) | `CreateDietPlan.tsx` | Meu módulo | — | Valores acima de 4000 ou abaixo de 1200 permitidos |
| T13 | Integrar `NutritionistAnamnese` com collection | `NutritionistAnamnese.tsx` | Meu módulo | T04 | Dados salvos e recuperados |
| T14 | Usar `patientId` no `NutritionistAnamnese` | `NutritionistAnamnese.tsx` | Meu módulo | T13 | Anamnese vinculada ao paciente correto |
| T15 | Implementar rascunho na anamnese | `NutritionistAnamnese.tsx` | Meu módulo | T13 | "Salvar rascunho" persiste sem validar campos obrigatórios |
| T16 | Implementar encerramento de vínculo | `NutritionistPatientDetails.tsx` | Meu módulo | T02 | Status muda para `revoked`; dados históricos preservados |

### P2 — Melhorias Funcionais

| ID | Descrição | Arquivos | Resp. | Dependência | Critério de Aceite |
|---|---|---|---|---|---|
| T17 | Remover "Perfil Público" e "Compartilhar Progresso" da UI | `Settings.tsx` | Meu módulo | — | Opções removidas; demais funcionam |
| T18 | Implementar máscara e validação de CRN | `Settings.tsx`, `validation.ts` | Meu módulo | — | CRN formatado e validado corretamente |
| T19 | Implementar máscara de WhatsApp | `Settings.tsx`, `validation.ts` | Meu módulo | — | Máscara `(XX) XXXXX-XXXX` aplicada |
| T20 | Corrigir rota `/nutritionist/perfil` | `routes.tsx` | Meu módulo | — | Nutricionista vê seu próprio perfil profissional |
| T21 | Persistir preferências de notificação no banco | `Settings.tsx`, `Users.ts` | Meu módulo | — | Preferências preservadas em outros dispositivos |
| T22 | Conectar notificações a eventos reais | novo serviço | Meu módulo | T21 | Aceitação de convite gera notificação |
| T23 | Auditar `NutritionConsultation` | `NutritionConsultation.tsx` | Meu módulo | — | Estado documentado; integração planejada |
| T24 | Auditar `NutritionistAlimentos` | `NutritionistAlimentos.tsx` | Meu módulo | — | Estado documentado |
| T25 | Avaliar chatbot — sinalizar como demo ou conectar API | `AIChat.tsx` | Compartilhado | — | Comportamento claramente comunicado ao usuário |
| T26 | Consistência nutricional — total refeições vs meta diária | `CreateDietPlan.tsx` | Meu módulo | T11 | Sistema avisa quando total ≠ meta |

---

## 13. Dependências entre Tarefas

```
T01 ──► T02 ──► T03
              └──► T05 ──► T06 ──► T07 ──► T08 ──► T09
                                                 └──► T10
                                   └──► T16
T04 ──► T13 ──► T14 ──► T15

T17, T18, T19, T20 — independentes
T21 ──► T22
T23, T24, T25, T26 — independentes (T26 depende de T11)
```

---

## 14. Critérios de Aceite por Fase

### Fase 1 concluída quando:
- Causa do erro `51 0` documentada com evidência real (log de request ou dado do banco)
- Aluno consegue aceitar um convite enviado por nutricionista
- Status do vínculo muda para `active` no banco
- Collection `anamneses` criada e migração executada com sucesso

### Fase 2 concluída quando:
- Ao abrir `/nutritionist/paciente/:id`, os dados exibidos correspondem ao paciente real
- Nutricionista consegue encerrar vínculo; dados históricos não são apagados

### Fase 3 concluída quando:
- Plano alimentar criado aparece na collection `meal-plans` do banco
- Plano pode ser editado e exclusão remove do banco com confirmação
- Refeições são dinâmicas (criar, renomear, remover)
- Meta calórica aceita valores além do range 1200-4000

### Fase 4 concluída quando:
- Anamnese salva com `status: 'draft'` persiste ao recarregar
- Anamnese concluída muda para `status: 'completed'`
- Anamnese aparece na lista do `NutritionistPatientDetails`

### Fase 5 concluída quando:
- Campo CRN exibe máscara e valida formato real
- "Perfil Público" e "Compartilhar Progresso" removidos da tela de privacidade
- `/nutritionist/perfil` exibe perfil profissional correto

### Módulo considerado funcional quando:
- Todos os 10 cenários de teste do documento aprovados
- Zero referências inválidas geradas por operações do módulo nutricionista
- Nenhum dado mockado hardcoded em componentes de produção

---

## 15. Testes Necessários

### Testes manuais prioritários

1. **Fluxo de convite completo:**
   - Nutricionista convida aluno por email
   - Aluno recebe/visualiza convite
   - Aluno aceita
   - Vínculo aparece como `active` no Payload admin
   - Nutricionista consegue criar plano para o aluno

2. **Plano alimentar completo:**
   - Criar plano com paciente real selecionado
   - Adicionar refeições e alimentos
   - Salvar → verificar no Payload admin que o documento existe
   - Abrir para edição → verificar que dados são carregados
   - Aluno faz login e visualiza plano

3. **Anamnese:**
   - Preencher parcialmente → "Salvar rascunho"
   - Sair da página → reentrar → verificar que dados persistem
   - Concluir → verificar status no banco

4. **Isolamento:**
   - Nutricionista A não deve ver pacientes de Nutricionista B
   - Planos do paciente X não devem aparecer para paciente Y

### Testes automatizados sugeridos

- `tests/int/nutricionista.spec.ts` — criar vínculo, criar plano, criar anamnese via API
- `tests/e2e/nutritionist.e2e.spec.ts` — fluxo completo no browser

---

## 16. Checklist Final de Validação

### Antes de cada correção
- [ ] Branch atual verificada
- [ ] Modificações não commitadas identificadas
- [ ] Arquivos compartilhados analisados antes de modificar

### Após cada tarefa
- [ ] `tsc --noEmit` sem erros
- [ ] Teste manual do fluxo afetado
- [ ] Comportamento de erro verificado (o que acontece quando a API falha?)
- [ ] Nenhum `console.log` de debug deixado no código
- [ ] Tarefa marcada com `[x]` com registro da alteração

---

*Documento gerado por auditoria estática em 28/10/2026. Nenhum dado foi modificado. Aguardando aprovação para execução das correções.*

# CoachPass — Petter — Personal Trainer ↔ Aluno

**Responsável:** Petter  
**Não fazer nesta lista:** planos alimentares, anamnese, CRN, macros, refeições personalizadas.  
**Bloqueio externo:** [SHARED-001](./COACHPASS_AUDITORIA_GERAL.md) precisa entrar **antes** dos CRUDs abaixo.

Auditoria em 28/10/2026 por leitura de código. Saves de treino/avaliação/agenda **não** foram reexecutados ao vivo nesta etapa.

---

## 1. Diagnóstico do Personal Trainer

O painel em `/personal` está ligado ao Payload. Convite, lista, detalhe do aluno e formulários existem. O save profissional quebra no mesmo validador de relationship descrito no documento geral: o front manda `student` como string (`"51"`), o Postgres espera number, e o toast mostra `51 0`.

Depois que SHARED-001 existir, o restante do trabalho do Petter é: CREF/WhatsApp, conferir nomes vs IDs, completar CRUD (edição/exclusão visível), financeiro, e testes ponta a ponta com o aluno.

### Mapa das telas

| Rota | Arquivo | Classificação | Evidência |
|---|---|---|---|
| `/personal` | `PersonalDashboard.tsx` | Parcial | Lista vínculos; convite via modal; não prova persistência de prescrição |
| `/personal/criar-treino` | `CreateWorkout.tsx` | Com erro | POST `student: selectedStudent` (string) → relationship |
| `/personal/aluno/:id` | `StudentDetails.tsx` | Parcial | Lê perfil, treinos, logs; depende dos saves |
| `/personal/aluno/:id/medicao` | `StudentMeasurement.tsx` | Não verificada ao vivo | Conferir se reusa assessments |
| `/personal/aluno/:id/restricao` | `StudentRestriction.tsx` | Com erro (hipótese SHARED-001) | POST `student: id` string |
| `/personal/aluno/:id/relatorio` | `StudentReport.tsx` | Não verificada | Relatório de leitura |
| `/personal/avaliacao` | `PersonalAvaliacao.tsx` | Com erro | Mesmo POST string; histórico vazio se save falha |
| `/personal/agenda` | `PersonalAgenda.tsx` | Com erro | `createSession({ student, ... })` string |
| `/personal/financeiro` | `ProfessionalFinance.tsx` | Com erro (hipótese) | Mesmo padrão; não assumir outra causa |
| `/personal/perfil` | `ProfessionalProfile.tsx` | Parcial | Leitura de `users` + lista ativos |
| `/personal/configuracoes` | `Settings.tsx` | Parcial | Perfil persiste; sino/notificação mock |
| Onboarding profissional | `ProfessionalOnboarding.tsx` | Parcial | CREF texto livre; WhatsApp sem máscara |

---

## 2. Relacionamento Personal ↔ Aluno

### O que já existe

- `AddPatientModal` → `POST /api/professional-links/invite` (resposta genérica, sem enumerar conta).
- Dashboard lista `pending` e `active`; aceitar é no dashboard do **aluno**.
- Encerrar: `PATCH` `{ status: 'revoked' }`.
- Prescrição exige vínculo `active` + papel `personal` (`hasActiveLink`).

### PET-REL-001 — Nomes iguais (“petter pablo”)

**Prioridade:** P1  
**Comportamento atual:** no ngrok, profissional e aluno selecionado aparecem com o mesmo nome.  
**Esperado:** cada linha mostra o `users.name` / `student-profiles.displayName` daquele `userId`.  
**Causa possível (não confirmada no banco nesta auditoria):**

1. Duas contas com o mesmo `name` (IDs diferentes) — o sistema está certo; a UI não mostra o ID.
2. `users.read` só libera alunos **ativos** (`linkedStudentIds` em `Users.ts`). Convite `pending` + `depth: 1` pode não popular `student`; o card pode cair no fallback ou no nome da sessão.
3. Confundir `user.name` logado com `person.name` da lista — no dashboard atual o map usa `relName(doc.student)`.

**Solução:** na lista, exibir `nome · e-mail · userId`. Nunca usar o nome como chave. Investigar SHARED-003 se o pendente não popular.  
**Não fazer:** casar vínculo por string de nome.  
**Aceite:** dois usuários “petter pablo” continuam distinguíveis por e-mail/id; o aluno selecionado no treino é o `userId` do `<option>`.

### PET-REL-002 — Convite e aceite

Fluxo de aceite já foi corrigido no hook (restaurar `student`/`professional`/`professionalRole`). Validar de novo **depois** de SHARED-001, com um e-mail de aluno de teste, sem apagar contas.

---

## 3. Treinos — `/personal/criar-treino`

### PET-TRN-001 — Save falha (P0, depende de SHARED-001)

**Atual:** quatro exercícios + aluno + salvar → toast de relationship; treino não existe para o aluno.  
**Esperado:** linha em `workouts` com `student` = user id numérico, `author` = personal, `status: published`; aluno vê em `/app/treinos`.  
**Arquivos:** `CreateWorkout.tsx`, `professionalApi.createWorkout`, `Workouts.ts`.  
**Endpoint:** `POST /api/workouts`.  
**Reprodução:** login personal → criar treino → selecionar aluno ativo → 4 exercícios → Salvar.  
**Solução do Petter depois do helper:** manter `userId` no select; não enviar `linkId`; garantir `Number` no payload. Testar edição (`?id=`) e exclusão se a UI não tiver botão — hoje o update existe na API (`updateWorkout`), a exclusão na collection existe, a tela de criar não lista “meus treinos” para apagar.

### PET-TRN-002 — Biblioteca de exercícios (P2)

Exercícios vêm de `exerciseLibrary` (front), não de collection. Aceitável no MVP se o treino persistir o array `exercises`. Não criar collection de exercícios neste ciclo, salvo a equipe pedir.

### PET-TRN-003 — Visualização pelo aluno (P1, depois do save)

`Workouts.tsx` do aluno lê `fetchPublishedWorkouts`. Classificação: **Parcial** — código ok, bloqueado pelo save.

---

## 4. Avaliações físicas — `/personal/avaliacao`

### PET-AVL-001 — Save e histórico (P0, SHARED-001)

**Atual:** formulário preenche; save mostra relationship; “Nenhuma avaliação ainda”.  
**Esperado:** `POST /api/assessments` com `kind: 'physical'`; lista após F5.  
**Arquivos:** `PersonalAvaliacao.tsx`, `Assessments.ts`.  
**Hook:** define `professional = actorId` (hoje string).  
**Campos na tela:** aluno, data, peso, % gordura, notas. Circunferências e PAR-Q existem na collection e **não** estão no formulário (P2).

### PET-AVL-002 — Indicadores de evolução (P2)

Dashboard do personal não agrega avaliações em gráfico. `Evolution.tsx` é do aluno. Depois do histórico persistir, decidir se o personal vê curva em `StudentDetails` (hoje só conta `assessments.length`).

---

## 5. Agenda — `/personal/agenda`

### PET-AGD-001 — Agendar (P0, SHARED-001)

**Atual:** aluno + 28/10/2026 + 08:00 + Treino → relationship; lista vazia.  
**Esperado:** `sessions` com `date`, `time`, `type: training`, `status: scheduled`.  
**Arquivos:** `PersonalAgenda.tsx`, `Sessions.ts`.  
**Fuso:** `new Date(date).toISOString()` em data `YYYY-MM-DD` vira UTC à meia-noite local — risco P2 de dia errado. Corrigir depois do save, gravando data local explícita.

### PET-AGD-002 — Edição / cancelamento (P1)

UI já chama `updateSession(id, { status })` para concluir/cancelar. Reagendar horário **não** está na tela (P1 produto). Conflito de horário **não** é validado no backend (P2).

---

## 6. Financeiro — `/personal/financeiro`

### PET-FIN-001 — Lançar (P0 hipótese SHARED-001)

Mesmo `createTransaction({ student: string, ... })`. Não há evidência de outro erro específico nesta auditoria. **Não inventar** mensagem diferente.  
**Esperado:** linha em `transactions`; persiste após F5; aluno vê em `/app/financeiro` se a API devolver (collection `read` do aluno = `student equals id`).  
**Arquivos:** `ProfessionalFinance.tsx`, `Transactions.ts`, `StudentFinance.tsx`.

### PET-FIN-002 — Indicadores (P2)

Sem gráficos; lista + marcar pago. Suficiente após o CRUD. Gateway de pagamento está fora de escopo (já desligado de propósito).

---

## 7. Perfil e CREF

### PET-PRF-001 — CREF (P1)

Campo único `users.professionalId` (texto). Onboarding: placeholder “Número de registro”, sem máscara. Settings: placeholder `CREF 123456-G/SP`, sem regex.  
**Esperado:** máscara/validação CREF (número + categoria + UF, ex. `123456-G/DF`), placeholder oficial, persistência, edição. Não autocompletar CREF fictício.  
**Backend:** validar no hook de `users` só para `role === 'personal'` se o campo estiver preenchido (não quebrar contas antigas vazias).

### PET-PRF-002 — WhatsApp (P1)

Aluno já usa `formatPhone`. Onboarding do personal não. Reusar `src/web/lib/phone.ts`. Guardar dígitos ou o valor mascarado de forma consistente (hoje o aluno guarda mascarado).

---

## 8. Dashboard e resto

| Item | Classificação | Nota |
|---|---|---|
| Cards de atalho (criar treino, avaliação) | Parcial | Navegam |
| Busca na lista | Funcional (front) | Filtro local |
| Sino | Com erro / mock | SHARED-005; toast “2 novas notificações” em `Layout.tsx` |
| Chat flutuante | Com erro conhecido | SHARED-004 |
| Temas | Funcional | `ThemeContext` |
| Relatório / medição / restrição | Não verificada ao vivo | Restrição provavelmente SHARED-001 |

---

## 9. Dependências compartilhadas

Petter **espera** SHARED-001/002.  
Petter **implementa** o helper se a equipe confirmar a RACI do documento geral.  
Petter **não** edita `CreateDietPlan.tsx` nem `Anamneses.ts`.  
Petter **pode** tocar `professionalApi.ts` nos métodos de treino/sessão/avaliação/transação; avisar Mendes se alterar tipos `LinkedPerson` ou `fetchLinkedPeople`.

---

## 10. Soluções recomendadas (resumo)

1. Helper `toUserRelationId` + hooks (SHARED-001) — primeiro.  
2. Exibir e-mail/id na lista de alunos (PET-REL-001).  
3. CREF + WhatsApp.  
4. Data da sessão sem fuso quebrado.  
5. Formulário de avaliação: circunferências opcionais depois do save básico.  
6. Testes da seção 12 com contas `personal@` / aluno de teste — **não** usar paciente real.

---

## 11. To-do do Petter

- [ ] **PET-001** — P0 — Investigar/confirmar SHARED-001 no save de treino (Network: body `student` string vs number). Arquivos: DevTools + `CreateWorkout.tsx`. Depende: — . Aceite: captura do JSON e do 400. Status: planejado (código já aponta a causa).

- [ ] **PET-002** — P0 — Aplicar helper de ID nos hooks `Workouts`, `Assessments`, `Sessions`, `Transactions`, `Restrictions` **no PR compartilhado**. Depende: alinhamento com Mendes. Aceite: os cinco POSTs deixam de retornar `invalid relationships`.

- [ ] **PET-003** — P0 — Corrigir payload de `createWorkout` / `updateWorkout` para id numérico. Arquivos: `professionalApi.ts`, `CreateWorkout.tsx`. Depende: PET-002. Aceite: treino no banco + aluno vê em Meus Treinos após F5.

- [ ] **PET-004** — P1 — Lista “meus treinos” no personal: editar e arquivar/excluir. Arquivos: `CreateWorkout.tsx` ou nova lista no dashboard. Depende: PET-003. Aceite: editar título/exercícios; aluno deixa de ver se `draft` ou delete.

- [ ] **PET-005** — P0 — Avaliação física persistir. Arquivos: `PersonalAvaliacao.tsx`, `Assessments.ts`. Depende: PET-002. Aceite: histórico ≠ vazio após F5.

- [ ] **PET-006** — P2 — Medidas extras (circunferência) no form. Depende: PET-005.

- [ ] **PET-007** — P0 — Agenda persistir. Arquivos: `PersonalAgenda.tsx`, `Sessions.ts`. Depende: PET-002. Aceite: sessão na lista após F5.

- [ ] **PET-008** — P1 — Cancelar/reagendar com data/hora; revisar ISO da data. Depende: PET-007.

- [ ] **PET-009** — P0 — Financeiro lançar e marcar pago. Arquivos: `ProfessionalFinance.tsx`. Depende: PET-002. Aceite: registro após F5; aluno autorizado vê a cobrança.

- [ ] **PET-010** — P1 — CREF máscara + validação. Arquivos: onboarding, Settings, hook `Users` (combinar se mexer em `Users.ts` — arquivo compartilhado). Depende: alinhamento SHARED.

- [ ] **PET-011** — P1 — WhatsApp com `formatPhone` no onboarding personal. Depende: — .

- [ ] **PET-012** — P1 — Lista de alunos: nome + e-mail + id; investigar “petter pablo”. Depende: pode precisar de SHARED-003.

- [ ] **PET-013** — P1 — Restrições e medição do aluno: mesmo padrão de ID. Depende: PET-002.

- [ ] **PET-014** — P2 — Sino do personal: depois de SHARED-005, só eventos de treino/agenda/financeiro. Não implementar provedor sozinho.

- [ ] **PET-015** — P1 — Bateria de testes da seção 12. Depende: PET-003 a PET-009.

---

## 12. Testes do Petter

Contas de teste do projeto (`personal@coachpass.app` / aluno demo). Sem dados reais.

| # | Teste | Resultado nesta auditoria |
|---|---|---|
| 1 | Login personal | Não executado agora |
| 2 | Convite de aluno | Código ok; aceite já validado em sessão anterior |
| 3 | Vínculo ativo | Código ok |
| 4 | Listagem | Código ok; nomes a conferir (PET-012) |
| 5 | Treino com 4 exercícios | **Reprovado por diagnóstico** (SHARED-001) |
| 6 | Aluno vê o treino | Não executado (bloqueado por 5) |
| 7 | Edição do treino | API existe; UI incompleta |
| 8 | Avaliação física | **Reprovado por diagnóstico** |
| 9 | Histórico após F5 | **Reprovado por diagnóstico** |
| 10 | Agendar sessão | **Reprovado por diagnóstico** |
| 11 | Cancelar sessão | Código de status existe; bloqueado por 10 |
| 12 | Lançamento financeiro | **Reprovado por diagnóstico** (mesma hipótese) |
| 13 | Persistência após logout | Não executado |
| 14 | Permissões (personal não vê aluno de outro) | Não executado; access `author`/`professional` no código |

Quando PET-015 rodar, marcar cada linha Aprovado/Reprovado com print ou HTTP status — sem declarar sucesso sem evidência.

---

## 13. Critérios de aceite do módulo Petter

- Treino publicado visível para o aluno correto após F5 e novo login.  
- Avaliação e sessão no histórico.  
- Financeiro com pelo menos criar + marcar pago.  
- CREF e WhatsApp editáveis e persistidos.  
- Nenhum toast `invalid relationships` nos fluxos 5, 8, 10 e 12.  
- Sem alteração em collections de nutri além do PR compartilhado de IDs.

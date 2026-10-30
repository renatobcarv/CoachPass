# CoachPass — Mendes — Nutricionista ↔ Aluno

**Responsável:** Mendes  
**Não fazer nesta lista:** treinos, avaliações físicas do personal, agenda de treino, CREF.  
**Bloqueio externo:** [SHARED-001](./COACHPASS_AUDITORIA_GERAL.md) antes de qualquer CRUD de plano/anamnese/consulta.

Auditoria em 28/10/2026 por leitura de código. Saves de plano/anamnese **não** foram reexecutados ao vivo nesta etapa.

---

## 1. Diagnóstico do Nutricionista

O painel em `/nutritionist` espelha o do personal: convite, lista, plano, consulta, anamnese, financeiro compartilhado, alimentos. O save que usa `student` como string sofre o **mesmo** `51 0` (SHARED-001). Não é um bug exclusivo de `meal-plans`.

Além disso, a tela de plano tem produto incompleto **mesmo depois** do save:

- Meta 1800 kcal e macros só existem em `useState`.
- Collection `meal-plans` **não tem** `caloriesTarget`, `proteinPercent`, `carbsPercent`, `fatPercent`, `durationWeeks`.
- Refeições são seis slots fixos; não há “criar refeição”.
- Sliders de macro são independentes (não fecham 100%).
- Alimentos: catálogo `foods` na API + fallback hardcoded `foodDatabase`.

### Mapa das telas

| Rota | Arquivo | Classificação | Evidência |
|---|---|---|---|
| `/nutritionist` | `NutritionistDashboard.tsx` | Parcial | Lista + convite |
| `/nutritionist/paciente/:id` | `NutritionistPatientDetails.tsx` | Parcial | Lê planos do paciente |
| `/nutritionist/criar-plano` | `CreateDietPlan.tsx` | Com erro + produto incompleto | POST string; meta/macros não vão no payload |
| `/nutritionist/consulta/:patientId` | `NutritionConsultation.tsx` | Com erro | `createAssessment` kind consultation |
| `/nutritionist/anamnese` | `NutritionistAnamnese.tsx` | Com erro | POST/PATCH `student` string; lista vazia se falha |
| `/nutritionist/financeiro` | `ProfessionalFinance.tsx` | Com erro (SHARED-001) | Mesmo componente do personal |
| `/nutritionist/alimentos` | `NutritionistFoods.tsx` | Não verificada ao vivo | Collection `foods` existe |
| `/nutritionist/perfil` | `ProfessionalProfile.tsx` | Parcial | Mesmo componente do personal |
| `/nutritionist/configuracoes` | `Settings.tsx` | Parcial | Toggles de privacidade a remover |
| Onboarding | `ProfessionalOnboarding.tsx` | Parcial | CRN texto livre |

---

## 2. Relacionamento Nutricionista ↔ Aluno

Mesma collection `professional-links` com `professionalRole: 'nutritionist'`. Convite e aceite são o fluxo compartilhado (não duplicar correção do hook).

### MEN-REL-001 — Operações no paciente ativo (P0)

Convite e lista funcionam no código. Create de plano/anamnese/consulta quebra no ID. Depois de SHARED-001, validar que `hasActiveLink(..., 'nutritionist')` não bloqueia paciente ativo e que personal **não** prescreve dieta (access de `meal-plans.create` já é nutri/aluno).

### MEN-REL-002 — Duplicidade de convite

Invite route recusa segundo vínculo pending/active do mesmo par. Encerrar (`revoked`) deve permitir novo convite — validar no teste 4.

### MEN-REL-003 — Nome do paciente

Mesma investigação de nomes iguais que o Petter (SHARED-003). Mendes valida o lado nutri; **não** abre PR paralelo em `Users.ts`.

---

## 3. Cadastro profissional — CRN e WhatsApp

### MEN-CAD-001 — CRN (P1)

`users.professionalId` serve CREF e CRN. Settings placeholder `CRN-3 12345`. Sem máscara, sem validação de região (CRN-1…CRN-10), sem persistência específica além do texto.

**Esperado:** máscara adequada (ex. `CRN-3 12345`), caracteres permitidos, placeholder, validação front + hook `users` quando `role === 'nutritionist'` e o campo não está vazio, edição, compatibilidade com valores já gravados (não invalidar contas antigas no primeiro load).

**Não** preencher CRN fictício.

### MEN-CAD-002 — WhatsApp (P1)

Reusar `formatPhone` no onboarding nutri (hoje input solto). DDD + 8 ou 9 dígitos. Mensagem clara se faltar dígito.

Arquivo compartilhado: `ProfessionalOnboarding.tsx` também é do personal. **Combinar com Petter** um único ajuste de máscara no mesmo arquivo (WhatsApp + placeholders CREF/CRN no mesmo PR pequeno, ou Petter faz CREF e Mendes CRN no mesmo diff combinado).

---

## 4. Planos alimentares — `/nutritionist/criar-plano`

### MEN-PLN-001 — Save (P0, SHARED-001)

**Atual:** preenche plano e paciente; save relationship.  
**Esperado:** `POST /api/meal-plans` com `student` number, `author` number, `status: published`, `meals[]`. Aluno vê em `/app/dieta`.  
**Arquivos:** `CreateDietPlan.tsx`, `professionalApi.createMealPlan`, `MealPlans.ts`.  
**Payload atual de save:** `student`, `title`, `observations`, `status`, `meals` — **sem** calorias-alvo, **sem** macros, **sem** duração.

### MEN-PLN-002 — Duração em semanas (P2)

Botões 2/4/6/8 só no estado `duration`. Não há campo na collection. Ou grava em `observations` (ruim) ou adiciona campo opcional `durationWeeks` via migration — **migration é compartilhada**: Mendes propõe o schema, os dois alinham antes de `payload migrate`.

---

## 5. Meta calórica e macronutrientes

### MEN-MAC-001 — Meta kcal (P1)

Slider 1200–4000 passo 50; botões ±50; **não há input numérico**. Limites 1200/4000 estão hardcoded. Collection não persiste.

**Esperado:** digitar kcal + botões + slider sincronizados; valor por paciente/plano; recuperar na edição. Validar mínimo/máximo justificáveis (ex. 800–6000 com aviso se <1200 ou >4000, sem bloquear se a equipe aceitar o aviso). Não impor 1800 como único valor.

**Solução:** campos em `meal-plans`: `caloriesTarget` (number). Incluir no POST/PATCH. Na edição, `setTargetCalories(doc.caloriesTarget ?? 1800)`.

### MEN-MAC-002 — Macros editáveis e 100% (P1)

Sliders 10–60 **independentes** (soma pode ser 90 ou 150). Barra colorida usa `%` como largura — se a soma ≠ 100 a barra distorce. Gramas: 4 / 4 / 9 kcal já estão no cálculo local.

**Esperado:** alterar percentuais; recalcular gramas; soma = 100%; arredondamento (último macro absorve resto); barra ao vivo; persistir `proteinPercent`, `carbsPercent`, `fatPercent`; carregar na edição.

**Não** criar collection nova só para macros.

### MEN-MAC-003 — Consistência refeição × meta (P2)

O centro já compara `totals.calories` com `targetCalories` na UI. Depois de persistir a meta, o aluno deveria ver a mesma meta (hoje `Diet.tsx` só lista refeições do plano, sem meta).

---

## 6. Refeições personalizadas

### MEN-REF-001 — CRUD de refeições no plano (P1)

Hoje: Café, Lanche manhã, Almoço, Lanche tarde, Jantar, Ceia — array fixo `defaultMeals`. Load de plano extra só se o nome não bater com esses seis. **Não há** botão criar/excluir/renomear/reordenar.

**Esperado:** criar com título, kcal (derivada dos itens ou manual), macros dos itens, observações (`meals[].notes` já existe no schema), alimentos e quantidades (já existe `items`), editar, excluir, reordenar, N refeições, títulos repetidos permitidos.

**Collection:** **não criar** `meals` separada. O array `meals` em `meal-plans` já cobre plano ↔ paciente ↔ nutri (`student`/`author`). Evita duplicar.

**Ordem no array** = ordem de exibição; para reordenar, persistir a nova ordem no PATCH.

---

## 7. Anamnese — `/nutritionist/anamnese`

### MEN-ANM-001 — Rascunho e concluir (P0, SHARED-001)

**Atual:** formulário; salvar/concluir → relationship; “Nenhuma anamnese ainda”.  
**Esperado:** `draft` sem exigir todos os campos; `completed` valida texto mínimo combinado pela equipe; aparece na lista após F5.  
**Arquivos:** `NutritionistAnamnese.tsx`, `Anamneses.ts`.  
**Campos:** `answers` JSON `{ history, habits, goals }` — suficiente; não precisa collection extra.  
**Update:** se `items[0]` existe, PATCH de novo envia `student` string — SHARED-002.

### MEN-ANM-002 — Histórico (P1)

Lista só status + data. Aceitável no MVP após persistir. Abrir para editar rascunho (já reusa `items[0]` — só o último). P2: listar todas e escolher qual editar.

---

## 8. Consulta nutricional

### MEN-CON-001 (P0, SHARED-001)

`NutritionConsultation.tsx` grava `assessments` com `kind: 'consultation'`. Mesmo erro de ID. Não misturar com avaliação física do Petter além do helper compartilhado.

---

## 9. Configurações e privacidade

### MEN-CFG-001 — Remover Perfil Público e Compartilhar Progresso (P2 / pedido explícito)

Em `Settings.tsx` (compartilhado entre papéis). Remover os dois itens da lista de privacidade **para o nutri** (e, se a equipe quiser consistência, para todos). Não apagar chaves já salvas em `preferences.privacy`. SHARED-007.

Toggles de notificação: gravados em JSON, **não** disparam e-mail/push/SMS (SHARED-005). Mendes não implementa gateway; só deixa de tratar toggle como integração real.

---

## 10. Dashboard nutricional

Indicadores de evolução nutricional **não** há gráficos reais. Cards de atalho navegam. Planos no paciente dependem do save. Dados hardcoded: `foodDatabase` em `CreateDietPlan.tsx` como fallback se `foods` vier vazio — aceitável como backup, não como fonte única depois que `NutritionistFoods` estiver ok.

---

## 11. Dependências compartilhadas

- Esperar SHARED-001/002.  
- Não abrir PR próprio em `roles.ts` se Petter já o fizer; revisar e aplicar `meal-plans` + `anamneses` no **mesmo** PR.  
- Migration de `caloriesTarget` / percents: alinhar com Petter (SHARED migrations).  
- `ProfessionalOnboarding.tsx` e `Settings.tsx`: coordenar diffs.  
- Financeiro: mesmo `ProfessionalFinance.tsx` que o Petter. **Um dos dois** corrige o POST de transaction no PR de IDs; o outro só testa o papel dele.

---

## 12. Soluções recomendadas (resumo)

1. IDs numéricos (SHARED-001) — desbloqueia plano, anamnese, consulta, financeiro.  
2. Campos novos opcionais em `meal-plans` para meta e macros (migration).  
3. Input de kcal + sliders de macro com soma 100%.  
4. UI para adicionar/remover/reordenar `meals[]` sem collection nova.  
5. CRN + WhatsApp.  
6. Tirar os dois toggles de privacidade.  
7. Testes com nutri demo + aluno — sem paciente real.

---

## 13. To-do do Mendes

- [ ] **MEN-001** — P0 — Confirmar SHARED-001 no POST de plano (body `student` string). Arquivos: Network + `CreateDietPlan.tsx`. Aceite: evidência do 400. Status: planejado.

- [ ] **MEN-002** — P0 — No PR compartilhado, aplicar helper em `MealPlans.ts` e `Anamneses.ts`. Depende: alinhamento Petter. Aceite: plano e anamnese salvam.

- [ ] **MEN-003** — P1 — CRN máscara/validação + WhatsApp `formatPhone`. Arquivos: `ProfessionalOnboarding.tsx`, `Settings.tsx`, hook `Users` (combinar). Não inventar CRN.

- [ ] **MEN-004** — P1 — Lista de pacientes: nome + e-mail + id; validar convite duplicado e revoked. Depende: SHARED-003 se o nome vier errado.

- [ ] **MEN-005** — P0 — CRUD plano persistir e aluno ver em Minha Dieta. Depende: MEN-002. Aceite: F5 nos dois lados.

- [ ] **MEN-006** — P1 — Refeições personalizadas no array `meals` (criar, título, kcal, notas, itens, editar, excluir, reordenar, títulos repetidos). Sem collection nova. Depende: MEN-005.

- [ ] **MEN-007** — P1 — Meta kcal digitável + slider + botões; macros 4/4/9; soma 100%; persistir campos novos. Depende: migration alinhada + MEN-005.

- [ ] **MEN-008** — P0 — Anamnese rascunho e concluir + lista após F5. Depende: MEN-002.

- [ ] **MEN-009** — P2 — Remover Perfil Público e Compartilhar Progresso; não apagar JSON. Depende: SHARED-007 / alinhamento Settings.

- [ ] **MEN-010** — P0 — Consulta nutricional persistir (`assessments` kind consultation). Depende: MEN-002.

- [ ] **MEN-011** — P2 — Alimentos (`NutritionistFoods`): garantir que o plano usa o catálogo da API. Depende: MEN-006.

- [ ] **MEN-012** — P2 — Sino nutri depois de SHARED-005 (só eventos de plano/anamnese). Não criar provedor de push.

- [ ] **MEN-013** — P1 — Bateria da seção 14. Depende: MEN-005 a MEN-010.

---

## 14. Testes do Mendes

| # | Teste | Resultado nesta auditoria |
|---|---|---|
| 1 | Login nutri | Não executado agora |
| 2 | Cadastro profissional CRN | Parcial (texto livre) |
| 3 | Convite | Código ok |
| 4 | Vínculo | Código ok |
| 5 | Listagem | Código ok; nomes a conferir |
| 6 | Criar plano | **Reprovado por diagnóstico** (SHARED-001) |
| 7 | Meta calórica persistida | **Não implementada** no schema |
| 8 | Macros 100% persistidos | **Não implementada** no schema |
| 9 | Refeição personalizada | **Não implementada** na UI |
| 10 | Editar/excluir refeição | **Não implementada** |
| 11 | Aluno vê o plano | Bloqueado por 6 |
| 12 | Salvar anamnese rascunho | **Reprovado por diagnóstico** |
| 13 | Concluir anamnese | **Reprovado por diagnóstico** |
| 14 | Histórico após F5 | **Reprovado por diagnóstico** |
| 15 | Persistência após logout | Não executado |
| 16 | Permissões | Não executado; access `author` nutri no código |

---

## 15. Critérios de aceite do módulo Mendes

- Plano publicado visível para o paciente correto após F5.  
- Meta e macros gravados e recarregados.  
- Pelo menos uma refeição criada pelo nutri (não só os seis slots).  
- Anamnese rascunho e concluída listáveis.  
- CRN e WhatsApp persistidos com máscara.  
- Sem `invalid relationships` em plano, anamnese, consulta e financeiro do nutri.  
- Sem collection duplicada de refeições.  
- Sem apagar dados de `preferences` ao esconder toggles.

# CoachPass — Auditoria geral, diagnóstico e coordenação

**Data da auditoria:** 28/10/2026  
**Branch analisada:** `main`  
**Escopo:** Personal Trainer ↔ Aluno e Nutricionista ↔ Aluno  
**Tipo:** diagnóstico e planejamento. **Nenhuma correção foi implementada nesta etapa.**

---

## 1. Resumo executivo

Os dois dashboards profissionais já têm telas, rotas e collections. O bloqueio principal **não são dois bugs diferentes de treino e dieta**: é uma falha compartilhada de tipo de ID.

O PostgreSQL do Payload usa `id: number` em `users` (`payload-types.ts`). O frontend e os hooks enviam esses IDs como **string** (`"51"`). A validação de relationship do Payload 3 (`isValidID`) só aceita `typeof value === 'number'`. O texto `This relationship field has the following invalid relationships: 51 0` **não significa dois relacionamentos inválidos (51 e 0)**. Significa: valor `51` + índice `0` da lista interna do Payload.

Enquanto isso não for corrigido em um único ponto, Petter e Mendes vão continuar vendo o mesmo erro ao salvar treino, avaliação, sessão, plano, anamnese, consulta e lançamento financeiro.

| Tema | Situação |
|---|---|
| Convite / vínculo `pending` → `active` \| `revoked` | Código alinhado; aceite já foi testado em sessão anterior |
| CRUD profissional (treino, avaliação, agenda, plano, anamnese, financeiro) | **Com erro** na persistência — mesma causa de ID |
| Visualização pelo aluno | Pronta no código (`status: published`), mas depende do save |
| CREF / CRN / WhatsApp profissional | Parcial: campo existe, máscara/validação oficial não |
| Meta calórica e macros | Só estado React; **não existem campos** em `meal-plans` |
| Refeições personalizadas | Seis slots fixos; sem criar/excluir/reordenar no UI |
| Notificações | Toggle local + sino com toast falso |
| Chat | Infra existe; Gemini já falhou com `502 PROVIDER` |
| Git | Trabalho grande **não commitado em `main`** |

**Conclusão:** Petter não deve “consertar treino” e Mendes “consertar plano” em paralelo no mesmo gancho de ID. Primeiro a correção compartilhada `SHARED-001`. Depois os CRUDs e, em seguida, as melhorias de produto de cada um.

---

## 2. Arquitetura encontrada

Stack: Next.js 15 (App Router) + SPA React em `src/web` + Payload 3 + PostgreSQL (Neon).

### Collections relevantes

| Collection | Slug | Relacionamentos com `users` |
|---|---|---|
| Users | `users` | — (`id: number`) |
| ProfessionalLinks | `professional-links` | `student`, `professional` |
| StudentProfiles | `student-profiles` | `user` |
| Workouts | `workouts` | `student`, `author` |
| MealPlans | `meal-plans` | `student`, `author` |
| Assessments | `assessments` | `student`, `professional` |
| Sessions | `sessions` | `student`, `professional` |
| Anamneses | `anamneses` | `student`, `professional` |
| Transactions | `transactions` | `student`, `professional` |
| Restrictions | `restrictions` | `student`, `professional` |
| WorkoutLogs | `workout-logs` | `student`, `workout` |
| Foods | `foods` | — |
| AiGenerations | `ai-generations` | `user` |
| Media | `media` | `owner` |

Não há collection de refeições, notificações, mensagens de chat persistidas nem de metas calóricas.

### Rotas dos dashboards

**Personal (`/personal`):** dashboard, `criar-treino`, `aluno/:id`, medição/restrição/relatório, `avaliacao`, `agenda`, `financeiro`, perfil, configurações.

**Nutricionista (`/nutritionist`):** dashboard, `paciente/:id`, `criar-plano`, `consulta/:patientId`, `anamnese`, `financeiro`, `alimentos`, perfil, configurações.

**Aluno (`/app`):** início, treinos, dieta, evolução, financeiro, perfil, configurações.

### Fluxo de vínculo (já desenhado)

1. Profissional convida e-mail em `POST /api/professional-links/invite`.
2. Registro nasce `pending` com `professional` = usuário logado.
3. Aluno aceita ou recusa: `PATCH` só `{ status: 'active' | 'revoked' }`.
4. Hook restaura `student`, `professional`, `professionalRole` a partir de `originalDoc` (correção já no código).
5. Prescrições exigem `hasActiveLink`.

O frontend já separa `userId` (usuário) e `linkId` (vínculo) em `LinkedPerson`. O seletor de aluno envia `userId`. A hipótese “o front manda o ID do vínculo no lugar do aluno” **não se confirma** nas telas atuais de treino, avaliação, agenda, plano, anamnese e financeiro.

---

## 3. Diagnóstico do erro `51 0`

### ID: SHARED-001

**Módulo:** Compartilhado (Personal + Nutricionista)  
**Prioridade:** P0  
**Status:** correção implementada na branch `fix/shared-relation-ids` (helper + hooks + POST numérico). Ainda **não** foi validada ao vivo com save de treino/plano. Sem commit.

### O que a mensagem realmente é

Trecho de `node_modules/payload/dist/fields/validations.js` (relationship):

```js
return `This relationship field has the following invalid relationships: ${invalidRelationships.map((err, invalid)=>{
    return `${err} ${JSON.stringify(invalid)}`;
}).join(', ')}`;
```

Parâmetros invertidos no `.map`:

| Parâmetro no código | Valor real |
|---|---|
| `err` | o ID rejeitado (`"51"`) |
| `invalid` | o índice do array (`0`) |

Resultado para **um** ID inválido `"51"`: `51 0`.

**Não são** os IDs 51 e 0 ao mesmo tempo. O `0` não indica usuário inexistente de id 0.

### Por que `"51"` é rejeitado

`apps/fitsync-cms/src/payload-types.ts`: `export interface User { id: number; }`

`node_modules/payload/dist/utilities/isValidID.js`:

```js
if (type === 'number' && typeof value === 'number' && !Number.isNaN(value)) {
    return true;
}
return false; // string "51" cai aqui
```

Cadeia:

1. Select do dashboard: `value={row.userId}` e `userId` é `String(...)`.
2. `POST /api/workouts` (e equivalentes) com `{ student: "51" }`.
3. Hooks ainda fazem `data.author = actorId` / `data.professional = actorId` com `userId()` que devolve **string**.
4. Validação de relationship roda com `defaultIDType: 'number'`.
5. Payload recusa o campo. Nada é gravado. Histórico continua vazio.

### Rastreamento

`Frontend (string) → REST Payload → beforeValidate (ainda string) → validate relationship / isValidID → 400 → toast`

Collections atingidas pelo mesmo padrão:

- `workouts.student` e `workouts.author`
- `meal-plans.student` e `meal-plans.author`
- `assessments.student` e `assessments.professional`
- `sessions.student` e `sessions.professional`
- `anamneses.student` e `anamneses.professional`
- `transactions.student` e `transactions.professional`
- `restrictions.student` (mesmo padrão)

### O que NÃO é a causa (com evidência)

| Hipótese | Veredito |
|---|---|
| Front envia `linkId` no lugar de `userId` | Não nas telas atuais (`option value={row.userId}`) |
| ID `0` enviado de propósito | Não; `0` é o índice da mensagem do Payload |
| Validação de vínculo `hasActiveLink` | Só rodaria se o ID passasse em `isValidID` |
| Usuário 51 inexistente | A checagem que gera **esta** frase não consulta o banco; só o tipo |
| Dois bugs independentes nos módulos | Mesmo validador, mesmos campos `relationTo: 'users'` |

Pode existir, **depois** desta correção, vínculo inativo ou usuário órfão. Isso seria outra mensagem (`Só é possível prescrever...`), não `51 0`.

### Solução recomendada (ainda não executar)

1. Criar helper único, por exemplo `toUserRelationId(value): number | null`, em `src/access/roles.ts` (ao lado de `relationId`).
2. Usar em **todos** os `beforeValidate` que atribuem `student`, `author` ou `professional`.
3. No `professionalApi.ts` / `studentApi.ts`, enviar número (`Number(id)`) nos POSTs de relationship, sem quebrar queries que já aceitam string.
4. No update, ao restaurar `originalDoc.student`, gravar só o id numérico (`relationId` → `Number`), nunca o objeto populado.
5. Teste de aceite: criar treino, avaliação, sessão, plano, anamnese e lançamento; o 400 `invalid relationships` desaparece; o aluno vê o documento publicado.

**Não fazer:** desligar `required`, ignorar o erro no toast, ou trocar o PK de `users` para texto.

**Alternativa descartada:** `customIDType: 'text'` em Users — exigiria migration destrutiva.

**Responsável principal:** Petter (implementa o helper e aplica nos hooks de `workouts`, `assessments`, `sessions`, `transactions`, `restrictions`).  
**Revisor:** Mendes (aplica/confere os mesmos ganchos em `meal-plans` e `anamneses` e valida o fluxo de nutri).  
Se a equipe preferir um único PR compartilhado com os dois no mesmo diff de hooks, façam **um PR só** em `fix/shared-relation-ids` — não dois PRs tocando os mesmos arquivos.

---

## 4. Matriz de responsabilidades (RACI simplificada)

| Módulo | Responsável | Revisor |
|---|---|---|
| Helper de ID / hooks de relationship | Petter (executa) | Mendes |
| Cadastro CREF + perfil Personal | Petter | Mendes (só regressão de nutri) |
| Relacionamento Personal ↔ Aluno | Petter | — |
| CRUD treinos | Petter | — |
| Avaliações físicas | Petter | — |
| Agenda e sessões | Petter | — |
| Financeiro Personal | Petter | — |
| Dashboard Personal | Petter | — |
| Cadastro CRN + perfil Nutri | Mendes | Petter (só regressão de personal) |
| Relacionamento Nutri ↔ Aluno | Mendes | — |
| CRUD planos / refeições / macros | Mendes | — |
| Anamnese | Mendes | — |
| Consulta nutricional | Mendes | — |
| Privacidade Nutri (remover toggles) | Mendes | — |
| Dashboard Nutri | Mendes | — |
| `users`, `professional-links`, auth | Compartilhado | o outro após o PR |
| Migrations globais | Compartilhado | os dois validam |
| Chatbot / Gemini | Compartilhado — **a definir Petter/Mendes** | o outro |
| Infra de notificações | Compartilhado — **a definir Petter/Mendes** | o outro |
| Sino do Personal | Petter (depois da infra) | — |
| Sino do Nutri | Mendes (depois da infra) | — |

---

## 5. Problemas compartilhados (catálogo)

| ID | Pri | Problema | Arquivos | Dono |
|---|---|---|---|---|
| SHARED-001 | P0 | String vs number em relationships (`51 0`) | `roles.ts`, hooks das collections, `professionalApi.ts` | Petter impl. / Mendes rev. |
| SHARED-002 | P1 | `relationId` e `userId` sempre `String`; updates copiam objeto populado | `roles.ts`, hooks `update` | mesmo PR que SHARED-001 |
| SHARED-003 | P1 | `users.read` só inclui alunos **ativos**; convite pendente pode não popular nome | `Users.ts` `readUsersAccess`, `links.ts` | Petter impl. / Mendes valida nutri |
| SHARED-004 | P1 | Chat `POST /api/ai/chat` — Gemini `PROVIDER`/`TIMEOUT`; prompt envia dados de saúde | `geminiProvider.ts`, `api/ai/chat/route.ts`, `AIChat.tsx` | A definir |
| SHARED-005 | P1 | Notificações: sino mock; toggles só em `users.preferences`; sem e-mail/push/SMS | `Layout.tsx`, `Settings.tsx` | A definir |
| SHARED-006 | P2 | `main` suja, sem branch por pessoa — risco de conflito | repo | os dois + alinhamento |
| SHARED-007 | P2 | Settings de privacidade (`profilePublic`, `shareProgress`) sem efeito real além do JSON | `Settings.tsx`, `Users.preferences` | Mendes remove UI nutri; Petter confere Settings do personal |
| SHARED-008 | P2 | WhatsApp: aluno tem `formatPhone`; onboarding profissional ainda é texto livre | `ProfessionalOnboarding.tsx`, `phone.ts` | cada um no próprio onboarding; helper já existe |

Itens SHARED-001 e SHARED-002 são **um único PR**.

---

## 6. Dependências entre módulos

```
SHARED-001/002  (IDs numéricos)
        │
        ├──────────────┬──────────────────┐
        ▼              ▼                  ▼
   PET treinos    PET avaliações    MEN planos
   PET agenda     PET financeiro    MEN anamnese
                                      MEN consulta
        │                                 │
        ▼                                 ▼
   PET testes                        MEN refeições/macros
                                     (produto, depois do save)
```

SHARED-004 e SHARED-005 podem andar em paralelo depois do P0, em arquivos que Petter/Mendes **não** compartilham com os CRUDs (`AIChat`, `Layout`, `geminiProvider`).

SHARED-003 (nome do aluno pendente / “petter pablo”) pode ser investigado em paralelo à SHARED-001, mas o populate de `users` só deve mudar **depois** de alinhar quem mexe em `Users.ts`.

---

## 7. Ordem recomendada de execução

1. **Congelar `main`.** Combinar se o lote atual não commitado entra num snapshot (`chore/snapshot-pre-auditoria`) — só com autorização. Ninguém dá force-push nem rebase.
2. Branch `fix/shared-relation-ids` a partir do snapshot. **Só SHARED-001/002.** Os dois revisam. Merge.
3. Petter: `feat/petter-personal` — treino, avaliação, agenda, financeiro, CREF, testes 1–14.
4. Mendes: `feat/mendes-nutritionist` — em paralelo **depois** do merge do item 2 — plano, anamnese, CRN, refeições, macros, privacidade, testes 1–16.
5. Branch `feat/shared-chat-notifications` (dono a definir) para SHARED-004/005.
6. Integração: os dois validam aluno + personal + nutri na mesma build.

**Não editar ao mesmo tempo:** `roles.ts`, `Users.ts`, `ProfessionalLinks.ts`, `payload.config.ts`, `professionalApi.ts`, migrations.

**Podem editar em paralelo após o P0:** telas `CreateWorkout` vs `CreateDietPlan`, `PersonalAvaliacao` vs `NutritionistAnamnese`, etc.

---

## 8. Git — estado e risco

- Branch atual: `main`.
- Há dezenas de arquivos modificados e não rastreados (domínio etapa 2/3, collections novas, front, CI, docs).
- Último commit visível na auditoria: `d178916 att 0.1`.
- **Não foi feito commit, push, reset nem migration nesta auditoria.**

Sugestão de branches:

| Branch | Conteúdo |
|---|---|
| `fix/shared-relation-ids` | Helper + hooks |
| `feat/petter-personal` | Só UI/fluxo Personal |
| `feat/mendes-nutritionist` | Só UI/fluxo Nutri |
| `feat/shared-chat-notifications` | Chat + sino |

---

## 9. Checklist de integração

- [ ] SHARED-001 merged; treino e plano salvam sem `invalid relationships`.
- [ ] Aluno vê treino publicado em `/app/treinos`.
- [ ] Aluno vê plano publicado em `/app/dieta`.
- [ ] Avaliação aparece no histórico após F5.
- [ ] Sessão aparece na agenda após F5.
- [ ] Anamnese rascunho e concluída listam após F5.
- [ ] Lançamento financeiro persiste.
- [ ] Personal não lê paciente só de nutri (e o contrário).
- [ ] Convite pendente mostra o **nome do aluno**, não o do profissional.
- [ ] Nenhum dos dois reverteu `roles.ts` no merge.

---

## 10. Critérios de conclusão da equipe

O módulo do Petter está pronto quando treino, avaliação, sessão e financeiro persistem e o aluno autorizado vê o que foi publicado.

O módulo do Mendes está pronto quando paciente vinculado recebe plano (com refeições e metas gravadas) e anamnese, e o aluno vê o plano.

Os dois só fecham depois dos testes da seção 14 de cada Markdown individual e de uma regressão cruzada (SHARED-006).

**Nenhuma funcionalidade desta auditoria foi marcada como “Funcional ponta a ponta” sem evidência de save + F5 + leitura pelo aluno.** A maior parte dos CRUDs profissionais está **Com erro** por SHARED-001.

---

## 11. To-do compartilhada

- [ ] **SHARED-001** — P0 — Petter (impl.) / Mendes (rev.) — Coercer IDs de relationship para `number` nos hooks e no POST. Arquivos: `src/access/relationIds.ts`, `src/access/roles.ts`, collections de vínculo/prescrição, `professionalApi.ts`, `studentApi.ts`. Dependências: nenhuma. Aceite: save de treino e de plano sem a frase `invalid relationships`; documentos no banco. Status: código na branch `fix/shared-relation-ids`; falta o teste ao vivo e o commit.

- [ ] **SHARED-002** — P1 — mesmo PR que SHARED-001 — Restaurar `originalDoc` só com id numérico. Aceite: PATCH de treino/plano/sessão/anamnese não reintroduz o 400. Status: coberto no mesmo diff; falta o teste ao vivo.

- [ ] **SHARED-003** — P1 — Petter impl. / Mendes valida — `users.read` incluir alunos `pending` do profissional, sem abrir o restante da base. Arquivos: `Users.ts`, `links.ts`. Depende: alinhamento em `Users.ts`. Aceite: convite pendente mostra nome/e-mail corretos.

- [ ] **SHARED-004** — P1 — A definir Petter/Mendes — Chat estável; não enviar alergias/lesões/medicamentos ao Gemini sem necessidade. Arquivos: `geminiProvider.ts`, `api/ai/chat/route.ts`, `AIChat.tsx`. Aceite: uma pergunta autenticada devolve `reply` ou erro distinto (`TIMEOUT`/`PROVIDER`/`CHAT_QUOTA`) sem 502 genérico silencioso; prompt sem campos clínicos se o aluno não pediu personalização clínica.

- [ ] **SHARED-005** — P1 — A definir — Decidir se haverá collection `notifications` ou se o sino some até existir provedor. Arquivos: `Layout.tsx`, `Settings.tsx`. Aceite: sino não mente “2 novas notificações”; toggles que não disparam canal real ficam desligados ou rotulados.

- [ ] **SHARED-006** — P2 — Os dois — Regressão cruzada após cada merge compartilhado. Aceite: checklist da §9.

- [ ] **SHARED-007** — P2 — Mendes (UI nutri) / Petter (confere personal) — Remover Perfil Público e Compartilhar Progresso; manter JSON antigo. Aceite: opções saem da UI; dados em `preferences` não são apagados.

- [ ] **SHARED-008** — P2 — Cada um no onboarding do seu papel — Reusar `formatPhone`. Aceite: WhatsApp `(61) 99999-9999` no cadastro profissional.

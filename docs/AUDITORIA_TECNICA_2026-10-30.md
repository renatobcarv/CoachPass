# Auditoria técnica — CoachPass

Data: 30/10/2026 · Branch `renatodev` (commit `4f32c82`) · Banco: Supabase (Postgres) · Stack: Next.js 15.5 + Payload 3.91 + React SPA em `src/web`

**Legenda de evidência**
- **[Comprovado]** — reproduzido nesta auditoria (requisição real, teste executado, consulta ao esquema ou erro no log).
- **[Código]** — visto no código-fonte, sem execução.
- **[Risco]** — possível problema, depende de contexto de produção.
- **[Sugestão]** — melhoria, não é defeito.

**O que foi executado de fato**
| Verificação | Resultado |
| - | - |
| `tsc --noEmit` | 0 erros |
| `npm run test:int` | 4 arquivos, **26 passaram, 3 pulados** (os 3 exigem `DATABASE_URL_TEST`, que não existe) |
| `next lint` | **2 erros**, 195 avisos |
| `npm audit --omit=dev` | 18 vulnerabilidades (10 altas, 7 moderadas, 1 baixa) |
| Sondagem de segurança na API local | 46 tentativas de acesso indevido com contas aluno, personal, nutri e anônimo |
| Exclusão de conta com dados | **Falhou com erro 500** |
| Fluxo de assinatura AbacatePay (modo teste) | Funcionou de ponta a ponta (sessão anterior) |

**Não executado:** `npm run build` (disputaria a pasta `.next` com o servidor de desenvolvimento ativo) e testes e2e (o Playwright sobe outro servidor). Os dois ficam para a fase de correção.

---

## A. Diagnóstico geral

**Estado:** o **backend é sólido** (controle de acesso por linha, validação de vínculo, política de senha, bloqueio de login, rate limit, cobrança verificada), mas o **frontend ainda é metade protótipo**: cerca de 20 telas mostram dados fixos ou fingem salvar com `setTimeout`. Há **um defeito crítico de integridade** (exclusão de conta quebrada) e **o build de produção está quebrado** por erro de lint.

**Pontos positivos**
- Controle de acesso bem desenhado: das 46 tentativas de acesso indevido, só 1 passou (seção B).
- Regras de vínculo no servidor: o profissional só cria avaliação, sessão, restrição, treino e lançamento para aluno com vínculo ativo [Comprovado].
- Hook impede virar `master`/`isSuperAdmin` pela API [Comprovado].
- Segredos fora do git: nenhum `.env` no histórico; `.env.example` só com exemplos [Comprovado].
- Cabeçalhos de segurança, HSTS, CSRF/CORS por lista de origens, playground GraphQL desligado em produção [Código].
- Cobrança AbacatePay com webhook autenticado (segredo + HMAC) e estado confirmado na API [Comprovado].
- Migrations versionadas e tipos gerados em sincronia com o banco [Comprovado].

**Principais problemas**
1. Exclusão de conta falha para qualquer usuário com dados (LGPD) [Comprovado].
2. `npm run build` quebra por 2 erros de lint numa tela fora do menu [Comprovado pelo lint + `ignoreDuringBuilds: false`].
3. Personal vira nutricionista sozinho pela API [Comprovado].
4. Muitas telas sem integração real (seção D).
5. Aluno não tem onde aceitar convite; o fluxo profissional ↔ aluno não fecha [Comprovado].
6. Fotos de perfil gravadas no disco do servidor; somem a cada deploy na Vercel [Código].

---

## B. Vulnerabilidades e riscos

| # | Problema | Gravidade | Evidência | Impacto | Local | Correção |
| - | - | - | - | - | - | - |
| B1 | **Exclusão de conta quebrada.** As chaves para `users` são `NOT NULL` com `ON DELETE SET NULL`, e a limpeza dos dados roda em `afterDelete` (depois da exclusão). O banco recusa: `null value in column "user_id" of relation "student_profiles" violates not-null constraint` | **Crítica** | Comprovado (DELETE `/api/users/:id` → 500) | Titular não consegue exercer o direito de exclusão (LGPD art. 18); exclusão pelo admin também falha | `collections/Users.ts` (afterDelete), migrations | Mover a limpeza para `beforeDelete` com `req` (mesma transação), sem limite de 200 e incluindo `workout-logs`, `transactions` e `ai-generations` |
| B2 | Limpeza da conta não inclui `workout-logs` e `transactions` e para em 200 registros por coleção | Alta | Código (`USER_DEPENDENTS`, `limit: 200`) | Sobra dado pessoal após exclusão; mesma falha de B1 | `collections/Users.ts` | Coberto pela correção de B1 |
| B3 | Excluir um treino que já tem registros falha (`workout_logs.workout_id` é `NOT NULL` + `SET NULL`) | Alta | Comprovado no esquema | Profissional não consegue apagar treino antigo | `collections/WorkoutLogs.ts`, migration | Tornar `workout` opcional no registro (o histórico fica, sem o vínculo) |
| B4 | **Personal se transforma em nutricionista** com um PATCH no próprio papel (e vice-versa) | Alta | Comprovado (PATCH `role` → 200) | Atua como nutricionista com o registro de CREF; fura a regra futura “dois papéis só no Elite” | `collections/Users.ts` (beforeChange) | Só permitir trocar entre papéis profissionais antes de concluir o onboarding (sem `professionalId`) |
| B5 | Token de sessão (JWT) guardado em `localStorage` | Média | Código (`AuthContext.tsx:81`) | Qualquer XSS rouba a sessão; a CSP está só em modo “report-only” | `context/AuthContext.tsx`, `next.config.mjs` | Curto prazo: CSP aplicada (não só report). Médio prazo: usar o cookie `httpOnly` que o Payload já emite |
| B6 | Nome de todos os usuários enviado a um serviço externo (ui-avatars.com) para gerar avatar | Média | Código (22 arquivos) | Compartilha dado pessoal com terceiro sem base legal declarada (LGPD) | vários componentes | Avatar de iniciais gerado localmente |
| B7 | Cadastro (`POST /api/users`) sem rate limit | Média | Código (`middleware.ts`) | Criação em massa de contas e de testes grátis | `middleware.ts` | Incluir a rota no rate limit |
| B8 | Rate limit em memória e IP lido do primeiro `x-forwarded-for` | Média | Código (`lib/rateLimit.ts`) | Em várias instâncias (Vercel) o limite é por instância; fora da Vercel o IP pode ser forjado | `lib/rateLimit.ts` | Usar armazenamento compartilhado (Upstash/Redis) e o IP do proxy confiável |
| B9 | E-mail não é verificado no cadastro | Média | Código (sem `auth.verify`) | Alguém cria conta com o e-mail de outra pessoa e recebe convites destinados a ela | `collections/Users.ts` | Ativar `verify` com migração que marca as contas atuais como verificadas |
| B10 | 10 vulnerabilidades altas em dependências (`zod`, `postcss`, `sharp`, `happy-dom`, `undici`, `graphql-scalars` via Payload) | Média | Comprovado (`npm audit`) | Majoritariamente DoS e casos de borda; algumas sem correção upstream | `package.json` | `npm audit fix` (sem `--force`) e acompanhar o Payload para as transitivas |
| B11 | Fotos de perfil gravadas no disco local | Média | Código (`Media` sem adapter de storage) | Somem a cada deploy na Vercel; não escala para várias instâncias | `collections/Media.ts`, `payload.config.ts` | Storage S3 compatível (Supabase Storage) |
| B12 | Exportação de dados (`/api/me/export`) limitada a 200 registros por coleção | Baixa | Código | Exportação LGPD incompleta para usuários antigos | `api/me/export/route.ts` | Paginar até o fim |
| B13 | Relacionamentos com `depth: 1` trazem o documento inteiro do usuário (plano, assinatura, sessões) para o profissional vinculado | Baixa | Comprovado (resposta de `/api/workouts`) | Exposição desnecessária de dados de cobrança do aluno | `access` dos campos de cobrança | `read` restrito ao próprio usuário nos campos de plano |
| B14 | Testes grátis ilimitados com contas novas | Baixa | Código | Abuso comercial do teste de 14 dias | `api/pro/plan` | Vincular o teste a e-mail verificado (B9) |

**O que foi testado e está correto [Comprovado]:** aluno não lê outro usuário nem dados de outros alunos em 12 coleções; aluno não cria avaliação, transação, restrição ou sessão; aluno que tenta criar treino para outra pessoa tem o treino gravado para si mesmo; personal não edita a conta do aluno; personal não lê nem grava dados de aluno não vinculado (6 coleções); aluno não vira `personal`, `master` nem `isSuperAdmin`; sem login nada é listado; `/users/me` não expõe hash, salt, tokens nem IDs do AbacatePay; webhook sem segredo responde 401; aluno não acessa a cobrança profissional.

---

## C. Código e arquitetura

| # | Problema | Evidência | Recomendação |
| - | - | - | - |
| C1 | **Build quebrado**: 2 erros `react/no-unescaped-entities` em `NutritionistCanvas.tsx:281` (tela fora do menu) | Comprovado (lint) | Corrigir agora; apagar as telas mortas (C3) |
| C2 | 195 avisos de lint: 132 variáveis e imports sem uso, 29 `any`, 29 `<img>`, 4 dependências de hook faltando | Comprovado | Limpeza gradual; tratar os 4 `exhaustive-deps` (risco de dado desatualizado) |
| C3 | Código morto: 9 telas fora do menu (`*Canvas`, `*Cursos`, `*Metas`, `*Questionarios`, `*Financeiro`, `NutritionistMaternoInfantil`, `PersonalPeriodizacao`), `ExerciseModal`, `FoodModal` e **46 de 47 componentes `ui/` (shadcn) sem uso** | Comprovado (busca de imports) | Apagar o que não tem função; reaproveitar Financeiro e Periodização (plano V2) |
| C4 | Duas cascas de layout em paralelo (`Layout` + `Sidebar` antigos e `AppShell` novo) | Código | Unificar no `AppShell` |
| C5 | Telas gigantes: `NutritionistProfile` (1.143 linhas), `Home` (1.133), `Settings` (1.112), `StudentOnboarding` (1.009) | Comprovado (`wc`) | Extrair seções e hooks de dados por domínio |
| C6 | Três clientes de API sobrepostos (`studentApi`, `professionalApi`, `nutriApi`) com funções repetidas (ex.: dois `createMealPlan`) | Código | Um cliente por coleção (`api/workouts.ts`, `api/mealPlans.ts`…) |
| C7 | Sem lazy loading: as 28 telas entram no mesmo pacote | Comprovado (`routes.tsx`, 0 `lazy`) | `React.lazy` por painel (aluno, personal, nutri) |
| C8 | Preferências e respostas do onboarding profissional só em `localStorage` (`Settings`, `proProfile.ts`) | Código | Gravar em `users.preferences` |
| C9 | `next lint` está obsoleto no Next 16 | Comprovado (aviso) | Migrar para ESLint CLI quando subir de versão |
| C10 | Princípios: o backend segue bem DRY/SRP (regras de acesso em `access/`, cobrança isolada em `lib/`); o frontend mistura busca de dados, regra e visual nos mesmos componentes | Código | Hooks de dados (`useStudentWorkouts`…) separados da apresentação |

---

## D. Funcionalidades

| Módulo | Situação | Detalhe |
| - | - | - |
| Cadastro, login, recuperação de senha | ✅ Funciona | Senha forte, bloqueio após 5 erros, reset por e-mail (Ethereal em dev) |
| Onboarding do aluno e do profissional | ✅ Funciona | Inclui a escolha de plano |
| Planos do profissional + AbacatePay | ✅ Funciona | Limite de alunos no servidor, teste, assinatura, portal |
| Convite profissional → aluno | ⚠️ Parcial | O profissional convida; **o aluno não tem tela para aceitar** (a função `respondProfessionalLink` existe, sem uso) |
| Treinos do aluno (ver) | ✅ Funciona | Lista os treinos publicados |
| Registro de treino (séries, carga) | ❌ Ausente | A API existe (`createWorkoutLog`), sem tela |
| Criar treino (personal) | ❌ Só visual | `mockStudents`, salva com `setTimeout` |
| Dieta do aluno (ver) | ✅ Funciona | |
| Criar plano alimentar (nutri) | ⚠️ Parcial | Salva de verdade; “gerar com IA” é falso |
| Detalhe do paciente (nutri) | ❌ Só visual | 20 dados fixos |
| Consulta nutricional, anamnese | ❌ Só visual | Não salvam (coleções existem) |
| Base de alimentos (nutri) | ⚠️ Parcial | Lista local; a coleção `foods` (TACO) existe e não é usada |
| Detalhe, medição, restrição e relatório do aluno (personal) | ❌ Só visual | Dados fixos ou `setTimeout` |
| Avaliação física, agenda (personal) | ❌ Só visual | Coleções `assessments` e `sessions` existem e não são usadas |
| Financeiro | ❌ Fora do menu | Coleção `transactions` existe |
| KPIs dos painéis | ⚠️ Parcial | Alunos e convites reais; treinos do dia, frequência, receita, consultas e adesão fixos |
| Chat de IA (assistente flutuante) | ❌ Só visual | Respostas fixas; o endpoint real `/api/ai/chat` existe e funciona |
| Geração de treino e dieta por IA (aluno) | ✅ Funciona | Gemini `flash-lite` com fallback local |
| Evolução do aluno | ⚠️ Parcial | Só mostra o perfil, sem histórico |
| Excluir conta | ❌ Com defeito | Tela mostra “fale com o suporte”; a API retorna 500 (B1) |
| Exportar meus dados | ⚠️ Parcial | Limite de 200 por coleção (B12) |
| Periodização | ❌ Só visual | Ver plano V2 |
| Exercícios e vídeos | ⚠️ Dependência externa | MuscleWiki (remoção no plano V2) |

**Funcionalidades ausentes relevantes:** aceite de convite, registro de treino, exclusão de conta funcional, notificações reais, papéis múltiplos, plano do aluno, periodização (todas cobertas no `PLANO_V2_PERIODIZACAO_ACESSOS.md`).

---

## E. Otimizações

| Gargalo | Evidência | Melhoria | Benefício |
| - | - | - | - |
| Pacote único com 28 telas, `recharts` e `motion` | Código | Lazy loading por painel | Primeira carga bem menor no celular |
| 29 `<img>` sem otimização + avatares externos | Lint | Avatar local; `loading="lazy"` e tamanhos definidos | Menos requisições e dados |
| Fotos de exercício via CDN do GitHub | Código | Copiar para o storage próprio | Estabilidade e cache |
| Relacionamentos com `depth: 1` em listas | Código | `depth: 0` + `select` nos campos usados | Respostas menores |
| Limpeza de conta documento a documento | Código | Exclusão por `where` em lote | Exclusão rápida e atômica |
| Gemini oscilando sob carga | Comprovado (sessão anterior) | Já resolvido com modelo `flash-lite` e timeout | — |

---

## F. Novas implementações (priorizadas por problema real)

| Funcionalidade | Problema que resolve | Valor | Complexidade |
| - | - | - | - |
| Registro de treino série a série | Sem ele não há como medir progresso nem aderência | Base de toda a evolução | Média |
| Periodização com esperado × real por semana | Profissional não sabe se o aluno está no caminho | Diferencial central do produto | Alta (plano V2) |
| Check-in semanal + pesagem | Dados de recuperação e tendência de peso | Ajustes de treino e dieta fundamentados | Baixa |
| Alertas de aluno inativo (sem treino há X dias) | Evasão silenciosa | Retenção: o maior custo do personal | Baixa |
| Cobrança dos alunos pelo profissional (PIX via AbacatePay) | Financeiro hoje é manual | Receita recorrente para o profissional e para o CoachPass | Média |
| Relatório mensal automático para o aluno | Aluno não percebe o progresso | Retenção e indicação | Média |
| Modo aluno para o profissional e plano Aluno Pro | Pedido do produto | Novo público pagante | Média (plano V2) |

---

## G. Plano de ação

### 1. CRÍTICO
| Item | Justificativa | Arquivos | Solução | Dependências | Concluído quando |
| - | - | - | - | - | - |
| G1.1 Exclusão de conta (B1, B2) | LGPD e integridade | `collections/Users.ts` | Limpeza em `beforeDelete` com `req`, por lote, todas as coleções dependentes | — | DELETE da própria conta com dados retorna 200 e não sobra registro do usuário |
| G1.2 Exclusão de treino com registros (B3) | Integridade | `collections/WorkoutLogs.ts` + migration | `workout` opcional no registro | — | Excluir treino com registros retorna 200 e os registros ficam sem vínculo |
| G1.3 Build quebrado (C1) | Deploy impossível | `NutritionistCanvas.tsx` | Corrigir os 2 erros | — | `npm run build` termina sem erro |

### 2. ALTA PRIORIDADE
| Item | Justificativa | Arquivos | Solução | Concluído quando |
| - | - | - | - | - |
| G2.1 Troca de papel profissional (B4) | Escalonamento de função | `collections/Users.ts` | Bloquear depois do onboarding | PATCH de personal para nutricionista retorna 400 |
| G2.2 Aceite de convite pelo aluno | Fluxo principal não fecha | novo componente no app do aluno | Lista de convites pendentes com aceitar/recusar | Aluno aceita e o vínculo fica ativo |
| G2.3 Excluir conta pela tela | LGPD | `Settings.tsx` | Chamar a API com confirmação | Conta excluída e sessão encerrada |
| G2.4 Chat de IA real | Funcionalidade falsa | `AIChat.tsx` | Usar `sendAiChat` | Respostas vindas do Gemini, com cota |
| G2.5 Rate limit no cadastro (B7) | Abuso | `middleware.ts` | Incluir `POST /api/users` | 11º cadastro no minuto recebe 429 |
| G2.6 Dependências (B10) | Vulnerabilidades altas | `package.json` | `npm audit fix` sem `--force` | Sem alta com correção disponível |
| G2.7 Telas sem integração (seção D) | Produto incompleto | ver plano V2, Frente 3 | Integrar com as coleções existentes | Nenhum dado fixo nas telas do menu |

### 3. MÉDIA PRIORIDADE
| Item | Solução | Concluído quando |
| - | - | - |
| G3.1 Avatar local (B6) | Componente de iniciais | Nenhuma URL `ui-avatars.com` |
| G3.2 Storage de mídia (B11) | Adapter S3 (Supabase Storage) | Foto sobrevive a um novo deploy |
| G3.3 Verificação de e-mail (B9) | `auth.verify` + migração das contas atuais | Conta nova só entra após confirmar |
| G3.4 Rate limit compartilhado (B8) | Upstash/Redis | Limite vale entre instâncias |
| G3.5 CSP aplicada (B5) | Trocar report-only por aplicada | Sem violações nos fluxos principais |
| G3.6 Lazy loading e limpeza de código morto (C3, C7) | `React.lazy` e remoção | Pacote inicial menor; lint sem imports mortos |
| G3.7 Exportação paginada (B12) e campos de cobrança privados (B13) | Paginação; `read` restrito | Exportação completa; profissional não vê cobrança do aluno |
| G3.8 Monitoramento | Sentry (erros) + logs estruturados | Erros de produção aparecem com contexto |
| G3.9 Backup | Supabase PITR (plano pago) ou `pg_dump` agendado | Restauração testada uma vez |
| G3.10 Banco de teste | `DATABASE_URL_TEST` (Supabase branch ou Postgres local) | Os 3 testes de banco rodam no CI |

### 4. EVOLUÇÃO
Plano V2 completo em `docs/PLANO_V2_PERIODIZACAO_ACESSOS.md` (MuscleWiki, papéis, Aluno Pro, fim dos dados de exemplo, periodização) e os itens da seção F.

---

## Preparação para produção — o que impede hoje
1. Build quebrado (G1.3).
2. Exclusão de conta quebrada (G1.1) — risco legal.
3. Mídia no disco local (G3.2).
4. Chave do AbacatePay de teste e webhook não cadastrado.
5. SMTP real não configurado (o app nem sobe em produção sem ele — comportamento correto).
6. Sem monitoramento nem rotina de backup testada.
7. Telas principais do profissional ainda sem integração (G2.7).

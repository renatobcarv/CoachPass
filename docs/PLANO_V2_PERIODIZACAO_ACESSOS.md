# CoachPass V2 — Plano completo

Acessos por papel, plano do aluno, fim dos dados de exemplo e periodização com resultados esperados por semana.

Data: 30/10/2026 · Base: branch `renatodev` (commit `4f32c82`)

---

## 1. Resumo

| # | Frente | O que entrega | Esforço (1 dev) |
| - | - | - | - |
| 0 | Remover a MuscleWiki | Biblioteca própria de exercícios (domínio público), sem dependência externa | 1–2 dias |
| 1 | Papéis e troca de painel | Profissional usa o painel do aluno como ele mesmo; personal + nutri na mesma conta só no Elite | 4–5 dias |
| 2 | Plano do aluno (Aluno Pro) | Aluno assinante cria os próprios treinos, dietas e periodização | 4 dias |
| 3 | Fim dos dados de exemplo | Todas as telas lendo e gravando no banco; telas mortas removidas | 9–11 dias |
| 4 | Periodização completa | Macro → meso → microciclos, metas esperadas por semana, esperado × real, alertas e ajustes | 12–15 dias |
| 5 | Qualidade e lançamento | Testes, migrations, seed, e2e, revisão de segurança | 3–4 dias |

**Total estimado:** 33–41 dias de desenvolvimento (cerca de 7–8 semanas com 1 dev; 4–5 semanas dividindo backend e frontend entre duas pessoas).

**Ordem recomendada:** 0 → 1 → 2 → 3 → 4 → 5. A frente 4 depende das frentes 1 (quem pode montar o ciclo) e 3 (registro real de treino com séries, carga e repetições).

---

## 2. Decisões que precisam de você

| # | Decisão | Recomendação |
| - | - | - |
| D1 | Preço do **Aluno Pro** | R$ 9,90/mês (menos da metade do Pro profissional; produto novo no AbacatePay) |
| D2 | Profissional no modo aluno paga o Aluno Pro? | **Não.** Qualquer profissional (inclusive Grátis) tem o modo aluno completo: “ele tem acesso a todos” |
| D3 | Elite cancelado com dois painéis (personal + nutri) | O segundo painel fica **somente leitura** (nada é apagado); volta a editar ao reassinar |
| D4 | Aluno com profissional vinculado pode criar treino próprio? | Sim, se for Aluno Pro. O profissional vê esses treinos marcados como “criado pelo aluno” |
| D5 | Apagar telas fora do menu sem função real (Canvas, Cursos, Materno-infantil, Questionários) | Apagar. Financeiro e Metas são reaproveitados (seções 5 e 6) |
| D6 | Metas semanais padrão (seção 6.3) | Usar as faixas da literatura como padrão e deixar o profissional editar por aluno |

---

## 3. Frente 0 — Remover a MuscleWiki

**Hoje:** 8 arquivos dependem dela (`api/musclewiki/route.ts`, `lib/musclewiki.ts`, `components/musclewiki/*`, partes de `CreateWorkout.tsx`, `Workouts.tsx`, `ExerciseCard.tsx`, `lib/bodymap.ts`), mais a variável `MUSCLEWIKI_API_KEY`.

**Substituto:** coleção própria `exercises`, importada da [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (cerca de 870 exercícios, domínio público/Unlicense — já usada hoje em `exercisePhotos.ts`).

| Passo | Detalhe |
| - | - |
| 0.1 | Collection `exercises`: `name` (pt), `nameEn`, `slug`, `primaryMuscles[]`, `secondaryMuscles[]`, `equipment`, `level`, `mechanic` (composto/isolado), `instructions` (pt), `images[]`, `isCustom`, `author` (exercício criado por profissional) |
| 0.2 | Script `seed:exercises`: importa o JSON, copia as imagens para o storage próprio (não depender de CDN do GitHub) e aplica tradução PT curada dos ~150 exercícios mais usados (o restante fica com nome em inglês + grupo muscular em PT) |
| 0.3 | Mesclar `data/exerciseLibrary.ts` e `data/exerciseData.ts` na coleção (são os nomes PT que já usamos) |
| 0.4 | Trocar a aba “MuscleWiki · vídeos” do `CreateWorkout` por busca na coleção (texto, grupo muscular, equipamento, nível) |
| 0.5 | Trocar `DemoFinder` (Workouts do aluno) por `ExerciseSheet` local: fotos em loop (`PhotoLoop` já existe) + passo a passo |
| 0.6 | Profissional pode cadastrar exercício próprio com link do YouTube (campo `youtubeUrl` já existe em `workouts.exercises`) |
| 0.7 | Apagar rota, lib, componentes, variável de ambiente e domínios da CSP; `bodymap.ts` fica só com os grupos PT |

**Pronto quando:** `grep -ri musclewiki src` não retorna nada e montar treino funciona sem internet externa.

---

## 4. Frente 1 — Papéis e troca de painel

### 4.1 Problema
`users.role` é **um único valor** e todas as regras de acesso (`userRole(req)`) dependem dele. Hoje um profissional não consegue ser aluno de si mesmo, nem ser personal e nutricionista ao mesmo tempo.

### 4.2 Modelo proposto
Manter `role` como **painel ativo** (continua no JWT; as regras de acesso existentes não mudam) e adicionar o que a conta **pode** ser:

| Campo | Tipo | Regra |
| - | - | - |
| `role` | select (já existe) | Painel em uso agora. Só muda pela rota de troca |
| `roles` | select múltiplo: `student`, `personal`, `nutritionist` | Papéis liberados. Todo profissional ganha `student` automaticamente |
| `professionalIds` | grupo `{ cref, crn }` | O segundo registro é exigido ao liberar o segundo papel profissional |

Migration: `roles = [role]` e, para profissionais, `+ 'student'`.

### 4.3 Regras de negócio
| Situação | Pode? |
| - | - |
| Profissional → painel do aluno (ele mesmo como aluno) | Sempre, em qualquer plano |
| Aluno puro → painel profissional | Não (passa pelo onboarding profissional, que adiciona o papel) |
| Personal → também Nutricionista (ou vice-versa) | Só com plano **Elite** em vigor + CRN/CREF válido |
| Elite vence com dois papéis profissionais | O segundo vira somente leitura (D3); o papel original continua normal |
| Limite de alunos (Grátis 5 / Pro 40) | Conta vínculos dos dois papéis juntos (Elite é ilimitado, então não muda nada na prática) |

### 4.4 Implementação
| Passo | Detalhe |
| - | - |
| 1.1 | `POST /api/me/switch-role { role }`: valida contra `roles` e o plano (`effectiveTier`), grava `role` com `overrideAccess` e devolve um token novo via `refresh-token` (o papel está no JWT) |
| 1.2 | `POST /api/me/add-role { role, registro }`: exige Elite para o segundo papel profissional; valida CREF/CRN (`validation.ts` já tem a regra) |
| 1.3 | Hook em `users` impede trocar `role` para fora de `roles` (proteção também na API REST direta) |
| 1.4 | Modo aluno do profissional usa o **mesmo id de usuário**: `student-profiles`, treinos, dietas e registros ficam ligados a ele. O onboarding do aluno roda na primeira entrada |
| 1.5 | Vínculo consigo mesmo continua proibido (já é); no modo aluno ele é “autotreinado” (seção 5) |
| 1.6 | UI: seletor **“Trocar painel”** no menu da conta (aproveitar `PanelSelector`, hoje só do master), com os painéis liberados e um cadeado + “Disponível no Elite” no painel bloqueado |
| 1.7 | `AuthContext`: guardar `roles`, trocar o token após a troca e redirecionar para a home do painel |

### 4.5 Testes obrigatórios
- Aluno não consegue chamar `switch-role` para `personal`.
- Personal Pro não consegue `add-role nutritionist`; Elite consegue.
- No modo aluno, o profissional **não** lê dados dos alunos dele (as regras de acesso usam o papel ativo).
- Elite vencido: o segundo painel abre, mas criar e editar retornam 402.

---

## 5. Frente 2 — Plano do aluno (Aluno Pro)

### 5.1 O que o aluno ganha
| Recurso | Aluno Grátis | Aluno Pro |
| - | - | - |
| Seguir treinos e dietas do profissional | ✓ | ✓ |
| Registrar treino (séries, carga, repetições, RIR) e check-in semanal | ✓ | ✓ |
| Evolução e esperado × real do ciclo em que está | ✓ | ✓ |
| **Criar os próprios treinos** (construtor + biblioteca) | — | ✓ |
| **Criar a própria dieta** (construtor + tabela TACO) | — | ✓ |
| **Montar a própria periodização** (modelos prontos) | — | ✓ |
| Gerações de IA (treino/dieta) | 2/mês | 20/mês |

Profissionais no modo aluno têm tudo do Aluno Pro sem pagar (D2).

### 5.2 Implementação
| Passo | Detalhe |
| - | - |
| 2.1 | Produto “CoachPass Aluno Pro” no AbacatePay (mensal) + `ABACATE_PRODUCT_STUDENT_PRO` |
| 2.2 | Generalizar a cobrança: `subscribe` aceita `audience: 'student'`; mesmo checkout, webhook, sincronização e portal (o código atual já está separado em `lib/abacatePay.ts` e `lib/proBilling.ts`) |
| 2.3 | `users.studentTier` (`free` / `pro`) + função `studentEntitled(user)` = Aluno Pro ativo **ou** profissional |
| 2.4 | Regras de acesso: `workouts` e `meal-plans` aceitam criação pelo aluno com `source: 'self'` quando `studentEntitled`; hoje o treino do aluno é forçado para `source: 'ai'` |
| 2.5 | Cota de IA por plano em `services/ai/quota.ts` (hoje fixa em 2) |
| 2.6 | Telas: “Meus treinos” e “Minha dieta” ganham **Criar** (reaproveitar `CreateWorkout` e `CreateDietPlan` em modo aluno, sem a escolha de aluno); paywall com a mesma linguagem da tabela de preços profissional |
| 2.7 | Treino ou dieta criados pelo aluno aparecem para o profissional vinculado com selo “criado pelo aluno” (D4) |

---

## 6. Frente 4 — Periodização completa (núcleo do produto)

> Numerada como 6 por ser a maior seção; é implementada depois da Frente 3.

### 6.1 Conceitos (como o produto organiza o tempo)
- **Macrociclo** — o ciclo inteiro do aluno (8–24 semanas) com um objetivo principal.
- **Mesociclo (fase/bloco)** — 3–6 semanas com um foco (adaptação, acumulação, intensificação, realização, deload, transição).
- **Microciclo** — 1 semana. É a unidade de acompanhamento: **cada semana tem metas esperadas e resultado real**.
- **Modelos suportados:** linear (carga sobe, volume cai), ondulatória semanal ou diária (alterna estímulos), em blocos (acumulação → intensificação → realização) e reversa (para resistência e definição).

### 6.2 Modelo de dados
**`training-cycles`** (macrociclo)
| Campo | Detalhe |
| - | - |
| `student`, `author` | Aluno e quem montou (personal, o próprio aluno Pro ou o profissional no modo aluno) |
| `coach`, `nutritionist` | Profissionais vinculados que acompanham (opcionais) |
| `goal` | hipertrofia, força, emagrecimento, recomposição, condicionamento, performance |
| `model` | linear, ondulatória semanal, ondulatória diária, blocos, reversa |
| `level` | iniciante, intermediário, avançado (cópia do perfil no momento da criação; define as faixas da seção 6.3) |
| `startDate`, `status` | rascunho, ativo, concluído, arquivado |
| `baseline` | peso, % de gordura, cintura, e1RM dos exercícios-chave (até 4) |
| `targets` | metas finais (opcionais; quando vazias o sistema propõe pelas faixas) |
| `keyLifts[]` | exercícios usados para medir força (ex.: agachamento, supino, levantamento terra, remada) |
| `phases[]` | `kind`, `weeks`, `repRange`, `rirStart → rirEnd`, `intensityPct` (min/máx de %1RM), `setsPerMuscle` (início → fim), `cardio` (min/semana), `dietPhase` (déficit, manutenção, superávit, diet break), `kcalDelta`, `proteinGPerKg`, `notes` |

**`cycle-weeks`** (microciclo, gerado ao ativar o ciclo)
| Campo | Detalhe |
| - | - |
| `cycle`, `index`, `phaseIndex`, `startDate`, `isDeload` | |
| `planned` | sessões, séries por grupo muscular, faixa de RIR, faixa de %1RM |
| `expected` | faixa de peso (mín–máx), e1RM esperado por exercício-chave (mín–máx), aderência mínima |
| `actual` | calculado: sessões feitas, séries duras por grupo, tonelagem, melhor e1RM por exercício, peso médio da semana, RIR/RPE médio, carga interna (sRPE), notas do check-in |
| `status` | `no_alvo`, `acima`, `abaixo`, `atencao` |
| `suggestions[]` | ajustes propostos (seção 6.5) com aceitar/descartar |
| `coachNote` | comentário do profissional para o aluno |

**`body-metrics`** (pesagens e medidas avulsas): `student`, `date`, `weightKg`, `waistCm` (opcional). Pesagem diária ou 3×/semana deixa a tendência confiável.

**`weekly-checkins`**: `student`, `cycleWeek`, sono, energia, dor muscular, estresse, fome (1–5), aderência à dieta (%), notas, fotos (opcional).

**Ajustes em coleções existentes**
- `workouts`: `cycle`, `phaseIndex`, `weekFrom`/`weekTo`, `dayIndex`; em cada exercício: `exercise` (relação com `exercises`), `targetSets`, `repRange`, `targetRir`, `intensityPct`, `tempo`, `rest`, `progression` (dupla progressão, +carga por semana, por %1RM).
- `workout-logs`: hoje guarda só `setsCompleted` e `load` em texto. Passa a ter **séries** (`set`, `reps`, `loadKg`, `rir` ou `rpe`, `done`) + `durationMin` e `sessionRpe`. **Sem isso não existe medição de progresso.**

### 6.3 Resultados esperados por semana (faixas padrão)
Faixas iniciais da literatura, editáveis por aluno (D6). O sistema gera a faixa da semana *n* a partir do baseline.

**Peso corporal (pela tendência, não pela pesagem do dia)**
| Objetivo | Iniciante | Intermediário | Avançado |
| - | - | - | - |
| Ganho (superávit) | +0,25 a +0,375% do peso/semana (≈1–1,5%/mês) | +0,125 a +0,25%/semana (≈0,5–1%/mês) | até +0,125%/semana (≤0,5%/mês) |
| Perda (déficit) | −0,5 a −1,0%/semana | −0,5 a −1,0%/semana | −0,5 a −0,7%/semana (mais lento preserva massa magra) |
| Recomposição / manutenção | ±0,25%/semana | ±0,25%/semana | ±0,25%/semana |

Referências: Helms, Aragon & Fitschen (2014) para perda de 0,5–1%/semana em atletas naturais; Garthe et al. (2011), em que 0,7%/semana preservou massa magra melhor que 1,4%; recomendações de ganho por nível de Aragon e Helms.

**Força (e1RM dos exercícios-chave)**
| Nível | Faixa esperada | Observação |
| - | - | - |
| Iniciante | +1 a +2,5% por semana | Progressão linear: membros inferiores sobem mais rápido que os superiores |
| Intermediário | +0,5 a +1% por semana dentro do bloco | Ganho maior nas semanas de intensificação |
| Avançado | +2 a +5% por mesociclo | Medir no fim de cada mesociclo, não semana a semana |
| Semana de deload | e1RM estável (±2%) | Queda > 3% acende alerta de fadiga |

e1RM pela fórmula de Epley com o RIR somado às repetições: `carga × (1 + (reps + RIR) / 30)`, usando só séries de até 10 repetições.

**Volume e intensidade (hipertrofia)**
| Parâmetro | Padrão |
| - | - |
| Séries duras por músculo/semana | 10–20 (dose-resposta: Schoenfeld, Ogborn & Krieger, 2017) |
| Progressão no mesociclo | +1 a +2 séries por músculo/semana, do volume mínimo ao máximo recuperável |
| Esforço | RIR 3 na semana 1 → RIR 0–1 na última semana do bloco |
| Deload | A cada 4–6 semanas (ou por alerta): volume −40 a −60%, intensidade mantida, RIR 4+ |
| Faixa de repetições | 6–30 repetições perto da falha geram hipertrofia; padrão de 6–12 nos compostos e 10–20 nos isolados |

**Força (modelo em blocos)**
| Fase | %1RM | Repetições | Volume |
| - | - | - | - |
| Acumulação | 65–75% | 6–10 | alto |
| Intensificação | 75–85% | 3–6 | médio |
| Realização (pico) | 85–95% | 1–3 | baixo |
| Deload / teste | — | — | −50% |

**Aderência:** meta ≥ 85% das sessões planejadas e ≥ 80% de aderência à dieta (check-in). Abaixo disso, o status da semana não pode ser “no alvo”, porque o resultado deixa de refletir o plano.

### 6.4 Cálculos (módulo `src/lib/periodization/`)
| Função | Uso |
| - | - |
| `e1rm(load, reps, rir)` | Força estimada por série |
| `weeklyBestE1rm(logs, exercise)` | Melhor e1RM da semana por exercício-chave |
| `hardSetsByMuscle(logs)` | Séries com RIR ≤ 4 por grupo (músculos primários = 1 série; secundários = 0,5) |
| `tonnage(logs)` | Soma de carga × repetições |
| `weightTrend(metrics)` | Média móvel exponencial do peso (α ≈ 0,1/dia) — evita reagir a água e sódio |
| `sessionLoad(log)` | sRPE × duração (carga interna de Foster) |
| `expectedBand(cycle, week)` | Faixa esperada de peso e e1RM da semana (seção 6.3) |
| `classifyWeek(expected, actual)` | `no_alvo`, `acima`, `abaixo`, `atencao` |
| `suggest(cycle, weeks)` | Regras da seção 6.5 |

Recalcula ao salvar registro de treino, pesagem ou check-in (hook com `req` na mesma transação) e uma vez por dia (job) para fechar a semana.

### 6.5 Alertas e ajustes automáticos (sempre como sugestão, quem decide é a pessoa)
| Sinal | Sugestão |
| - | - |
| Peso abaixo da faixa por 2 semanas (ganho) | +150 a +250 kcal/dia |
| Peso acima da faixa por 2 semanas (perda mais lenta) | −150 a −250 kcal/dia ou +1 sessão de cardio |
| Perda mais rápida que 1%/semana por 2 semanas | +150 kcal/dia (preservar massa magra) |
| e1RM estagnado ou em queda por 2 semanas + check-in de sono ou energia ≤ 2 | Antecipar o deload |
| Séries duras abaixo do planejado em um grupo | Avisar qual grupo ficou para trás |
| Aderência < 85% | Simplificar o plano (menos sessões) antes de mexer em carga ou caloria |
| Fim do mesociclo | Resumo da fase + proposta da próxima (volume inicial, RIR, metas) |

Ajustes de caloria aparecem para o nutricionista quando o aluno tem nutri vinculado; senão, para o próprio aluno (Aluno Pro) ou para o personal.

### 6.6 Telas
**Profissional — Periodização**
- Lista de ciclos por aluno, com o status da semana atual em semáforo.
- **Editor do ciclo:** linha do tempo de mesociclos (arrastar para mudar a duração), modelos prontos e gráfico de volume × intensidade ao longo das semanas.
- Modelos prontos: “Hipertrofia 12 semanas (3 blocos + deload)”, “Força 8 semanas em blocos”, “Emagrecimento 16 semanas com diet break”, “Ondulatória 12 semanas”, “Iniciante 8 semanas linear”.
- **Gerar com IA:** o Gemini propõe o ciclo a partir do perfil, objetivo, nível, dias por semana e restrições, sempre como rascunho editável.
- **Acompanhamento:** gráfico de faixa esperada × linha real (peso e e1RM por exercício), tabela semana a semana (planejado, feito, status), lista de alertas com aceitar/descartar e campo de comentário para o aluno.

**Aluno — Minha periodização**
- Cartão “Semana 5 de 12 · Intensificação”: o que esperar nesta semana (séries, RIR, cargas sugeridas por exercício, peso esperado).
- Registro de treino série a série, com a carga sugerida preenchida a partir da semana anterior.
- Check-in semanal (1 minuto) e pesagem rápida.
- Progresso: “você está no alvo” / “um pouco abaixo — veja o porquê”, com os mesmos gráficos simplificados.
- Fim de fase: resumo com conquistas (recordes de e1RM, peso, aderência).

**Nutricionista**
- Vê o ciclo do paciente e define a fase da dieta por mesociclo (déficit, manutenção, superávit, diet break) e a meta de proteína.
- Recebe as sugestões de ajuste calórico da seção 6.5 para aplicar no plano alimentar.

**Relatório semanal** automático (substitui o `StudentReport` falso): resumo da semana, esperado × real, recordes e alertas. A análise em texto é gerada pela IA a partir dos números reais.

### 6.7 Etapas de entrega da periodização
| Etapa | Entrega | Dias |
| - | - | - |
| 4.1 | Coleções `training-cycles`, `cycle-weeks`, `body-metrics`, `weekly-checkins` + ajustes em `workouts` e `workout-logs` + migrations | 2 |
| 4.2 | Módulo de cálculos com testes unitários (e1RM, tendência, faixas, classificação) | 2 |
| 4.3 | Registro de treino série a série no app do aluno | 2 |
| 4.4 | Editor do ciclo + modelos prontos (profissional e Aluno Pro) | 3 |
| 4.5 | Geração das semanas, faixas esperadas e painel esperado × real | 2 |
| 4.6 | Alertas e sugestões + visão do nutricionista | 2 |
| 4.7 | Check-in, pesagem, relatório semanal e geração por IA | 2 |

---

## 7. Frente 3 — Fim dos dados de exemplo (tela por tela)

### 7.1 Painel do personal
| Tela | Dado falso hoje | Fonte real | Ação |
| - | - | - | - |
| `PersonalDashboard` | KPIs “12 treinos hoje”, “89% frequência”, “R$ 12,6k”; números do link da bio (328, 12,8%) | `workout-logs` de hoje, sessões feitas ÷ planejadas em 30 dias, `transactions` pagas no mês | Calcular de verdade; **remover** os números do link da bio (não há rastreamento de cliques) |
| `CreateWorkout` | `mockStudents`, salvar com `setTimeout`, aba MuscleWiki | `fetchLinkedPeople`, `createWorkout`/`updateWorkout`, coleção `exercises` | Integrar + Frente 0 |
| `StudentDetails` | restrições, características, peso, composição e histórico fixos | `restrictions`, `student-profiles`, `assessments`, `workout-logs`, ciclo ativo | Integrar |
| `StudentMeasurement` | salvar com `setTimeout` | `createAssessment` | Integrar |
| `StudentRestriction` | lista fixa + `setTimeout` | `restrictions` | Integrar |
| `StudentReport` | 7 conjuntos fixos + “análise de IA” fixa | Relatório semanal da periodização (6.6) | Reescrever |
| `PersonalAvaliacao` | alunos e medições fixos, `setTimeout` | vínculos + `assessments` (PAR-Q no campo `parq`) | Integrar |
| `PersonalAgenda` | 6 sessões fixas | `sessions` | Integrar |
| `PersonalFinanceiro` (fora do menu; rota redireciona) | transações fixas | `transactions` | Integrar e voltar ao menu (base: `ProfessionalFinance` do Carlos) |
| `PersonalPeriodizacao` (fora do menu) | planos fixos | Frente 4 | Reescrever |
| `PersonalMetas` (fora do menu) | metas fixas | Metas do ciclo (`targets`) | Apagar; absorvida pela periodização |
| `PersonalQuestionarios`, `PersonalCanvas`, `PersonalCursos` (fora do menu) | tudo fixo | — | Apagar (D5) |

### 7.2 Painel do nutricionista
| Tela | Dado falso hoje | Fonte real | Ação |
| - | - | - | - |
| `NutritionistDashboard` | “8 consultas hoje”, “87% adesão” | `sessions` do tipo consulta hoje; aderência dos check-ins | Integrar |
| `NutritionistPatientDetails` | plano, consultas e progresso fixos (20 ocorrências) | `meal-plans`, `assessments` (consulta), `body-metrics`, ciclo | Integrar |
| `NutritionConsultation` | `mockPatients` + `setTimeout` | vínculos + `assessments` com `kind: consultation` | Integrar |
| `CreateDietPlan` | sobra de `mockPatients`; “gerar com IA” falso (`setTimeout`) | `nutriApi`; nova rota de IA para o profissional gerar o plano de um paciente | Integrar |
| `NutritionistAnamnese` | não salva | `anamneses` (com rascunho) | Integrar |
| `NutritionistAlimentos` | lista local (`foodData.ts`) | coleção `foods` (TACO) + alimentos próprios | Integrar |
| `NutritionistFinanceiro` (fora do menu) | fixo | `transactions` | Unificar com o financeiro do personal |
| `NutritionistMetas`, `Canvas`, `Cursos`, `MaternoInfantil`, `Questionarios` (fora do menu) | tudo fixo | — | Apagar (D5) |

### 7.3 Aluno e telas comuns
| Tela | Situação | Ação |
| - | - | - |
| `Dashboard`, `Diet` | Já usam a API | Adicionar o cartão da semana do ciclo |
| `Workouts` | Usa a API, mas a demonstração vem da MuscleWiki e não há registro de séries | Frente 0 + registro série a série (4.3) |
| `Evolution` | Só mostra o perfil | Gráficos reais: peso, medidas, e1RM, aderência |
| Convites | O aluno não tem onde aceitar | Tela “Convites” (`respondProfessionalLink` já existe) |
| `AIChat` | Respostas fixas no código | Usar `/api/ai/chat` real (`sendAiChat` já existe; a versão do Carlos já faz isso) |
| `Settings` | Notificações só no `localStorage` | Gravar em `users.preferences` (campo já existe) |
| `Home` (página inicial) | `PhoneMock` é ilustração de marketing, não dado | Manter |

### 7.4 Ordem dentro da Frente 3
1. Convites do aluno, `AIChat` e `Settings` (pequenos, destravam o fluxo).
2. `CreateWorkout`, `StudentDetails`, `StudentMeasurement`, `StudentRestriction`, `PersonalAvaliacao`, `PersonalAgenda`.
3. Lado do nutricionista: `PatientDetails`, `Consultation`, `CreateDietPlan`, `Anamnese`, `Alimentos`.
4. KPIs dos dois painéis e Financeiro.
5. Apagar as telas mortas.

**Pronto quando:** nenhuma tela do menu tem array fixo de pessoas, valores ou datas, e uma busca por `mock`, `setTimeout(` em botões de salvar e `Math.random` em ids não retorna nada em `src/web/components/pages`.

---

## 8. Frente 5 — Qualidade e lançamento
| Item | Detalhe |
| - | - |
| Testes unitários | Cálculos de periodização, regras de papéis, cobrança (já existem 11 testes de cobrança) |
| Testes de acesso | Para cada coleção nova: aluno, personal, nutri, profissional no modo aluno, Elite vencido |
| e2e (Playwright) | Profissional troca para aluno; Elite libera nutri; Aluno Pro assina e cria treino; ciclo completo de 2 semanas com registros e esperado × real |
| Migrations | Uma por frente; testar em banco vazio (o Supabase atual) e no banco do Carlos |
| Seed | Ciclo de demonstração de 12 semanas com 5 semanas de registros, para o painel não começar vazio |
| Segurança | Revisar `overrideAccess` nas rotas novas; rotas de troca de papel com rate limit (middleware já tem a estrutura) |
| Desempenho | Índices em `student`, `cycle`, `performedAt`; o resumo semanal fica gravado em `cycle-weeks.actual` (não recalcular a cada leitura) |

---

## 9. Riscos
| Risco | Mitigação |
| - | - |
| Trocar o papel ativo quebrar regras de acesso existentes | O papel ativo continua em `role`; as regras não mudam; testes de acesso por papel antes de liberar |
| Aluno registrar treino de forma incompleta (sem carga ou RIR) | Carga sugerida preenchida automaticamente; RIR opcional com padrão do plano; aderência separada do progresso |
| Faixas esperadas não servirem para todo aluno | Faixas editáveis por aluno e por ciclo; tudo é sugestão, nunca ajuste automático |
| Volume grande de frentes em paralelo com o Carlos | Dividir: Carlos no backend (coleções, regras, cálculos), Renato nas telas; contrato de campos em `docs/CONTRATO_CAMPOS.md` |
| Fotos de exercícios hospedadas em CDN externa | Copiar as imagens para o storage próprio no `seed:exercises` |

---

## 10. Checklist de “pronto” do V2
- [ ] Nenhuma referência à MuscleWiki no código e no `.env`
- [ ] Profissional entra no painel do aluno e volta com um clique
- [ ] Personal + nutri na mesma conta só com Elite (testado)
- [ ] Aluno Pro assina pelo AbacatePay e cria treino, dieta e ciclo próprios
- [ ] Nenhum dado fixo nas telas do menu
- [ ] Ciclo com metas esperadas por semana, registro real, status semanal e sugestões de ajuste
- [ ] Nutricionista recebe sugestões calóricas do ciclo
- [ ] Testes unitários, de acesso e e2e passando

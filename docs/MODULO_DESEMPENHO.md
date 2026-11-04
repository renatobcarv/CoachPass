# Módulo de Periodização, Progressão e Desempenho

Planejar, executar, medir e analisar a evolução do aluno. Disponível para o aluno (no painel dele) e para o personal (para os alunos vinculados e, pela troca de conta, para ele mesmo).

## Onde fica

| Público | Tela | Rota |
| - | - | - |
| Aluno | Ciclos (lista, comparação) | `/app/periodizacao` |
| Aluno | Novo ciclo / editar (Aluno Pro ou profissional no modo aluno) | `/app/periodizacao/novo`, `/:id/editar` |
| Aluno | Ciclo semana a semana (esperado × real, sugestões) | `/app/periodizacao/:id` |
| Aluno | Montar treino próprio | `/app/treinos/novo` |
| Aluno | Executar treino (registro série a série) | `/app/treino/:workoutId` (botão "Iniciar treino" em Meus treinos) |
| Aluno | Evolução (visão geral, força, volume, corpo, recuperação) | `/app/evolucao` |
| Aluno | Histórico de um exercício | `/app/exercicio/:key` |
| Personal | Ciclos dos alunos | `/personal/periodizacao` |
| Personal | Montar treino para um aluno (biblioteca, ligado ao ciclo) | `/personal/criar-treino` |
| Personal | Evolução de um aluno / histórico de exercício | `/personal/aluno/:id/evolucao`, `/personal/aluno/:id/exercicio/:key` |
| Nutricionista | Evolução do paciente | `/nutritionist/paciente/:id/evolucao` |
| Todos com 2+ painéis | Botão "Trocar para conta de aluno / painel do personal" | menu lateral e topo no celular |

## Dados (o que é planejado × o que foi feito)

- **Planejado:** `training-cycles` (fases), `cycle-weeks` (metas da semana) e `workouts.exercises` (séries, reps, carga, RIR/RPE, descanso).
- **Realizado:** `workout-logs`. Cada exercício guarda uma **cópia do planejado** no momento do treino (`planned`), as séries feitas (`reps`, `loadKg`, `rir`, `rpe`, `restSec`, `done`) e as alterações do aluno (`change`: trocado, extra, pulado). O plano pode mudar depois; o histórico não muda.
- **Corpo:** `body-metrics` (peso, cintura, abdômen, quadril, peitoral, braço, coxa, panturrilha, fotos; % de gordura só se medido, com o método).
- **Recuperação:** `weekly-checkins` (sono, fadiga, dor muscular, dor articular, disposição, recuperação, estresse, aderência à dieta).

O servidor preenche o ciclo, a semana e a cópia do planejado ao registrar um treino. Depois recalcula a semana do ciclo.

## Cálculos (`src/lib/performance`, `src/lib/periodization`)

| Item | Regra |
| - | - |
| 1RM estimado | Epley com RIR: `carga × (1 + (reps + RIR) / 30)`, só até 12 reps. Sempre rotulado como estimativa |
| Recordes | Separados: maior carga, melhor carga por nº de repetições (1–12), 1RM estimado e volume da sessão |
| Levantamentos principais | Agachamento livre, supino reto e levantamento terra, reconhecidos pelo nome. Variações (romeno, inclinado, smith, frontal…) ficam de fora |
| Volume por grupo | Séries duras (RIR ≤ 4) contam 1 para os músculos **principais** (diretas). Os **secundários** ficam numa coluna separada (indiretas) e valem 0,5 só no total ponderado. As porções do ombro são identificadas pelo nome do exercício |
| Peso | Média móvel de 7 dias, só com pesagens existentes |
| Planejado × realizado | Concluído, parcial, não feito ou extra. Diferença de carga, séries faltando, repetições acima/abaixo da faixa e RIR planejado × médio |
| Alertas de fadiga | 1RM estimado de um principal caindo 2 semanas seguidas **e** recuperação ruim no check-in. Mensagem orientativa, sem diagnóstico |
| Comparação de ciclos | Aderência média, semanas no alvo, volume médio, variação de peso e ganho do 1RM estimado dos principais |

## Progressão de carga (`progression.ts`)

Sempre **sugestão**. Nada muda no plano sem confirmação.

- **Acessórios: progressão dupla.** Abaixo da faixa, mantém (na 2ª vez seguida, reduz ~8%). Dentro da faixa, +1 repetição. Todas as séries no topo da faixa com esforço dentro do alvo, sobe a carga.
- **Principais: por desempenho.** RIR real ≥ alvo + 1 com as reps completas, sobe ~2,5% (incremento conservador). Esforço 2+ acima do alvo com reps faltando, reduz ~5%. Reps faltando, mantém.
- **Nunca sobe a carga** só porque as repetições saíram. Exige RIR/RPE registrado, esforço no alvo e check-in sem sono ruim, fadiga alta, dor articular ou baixa disposição.
- **Estagnação:** o melhor 1RM estimado das 3 últimas sessões não supera o das 3 anteriores em mais de 1%.

## Rotas de API

`GET /api/performance/overview` (filtros `studentId`, `weeks`, `cycleId`, `group`) · `GET /api/performance/exercise` · `GET /api/performance/session-plan` · `GET /api/performance/compare` · `POST /api/periodization/refresh` · `POST /api/ai/generate-cycle`. Acesso: o próprio aluno ou um profissional com vínculo ativo / que acompanha o ciclo.

## Testes

`tests/int/performance.int.spec.ts` (22 casos, inclusive o exemplo 140×4 / 130×5 / 130×5 / 125×5 e a regra "não sobe sem RIR"), `tests/int/periodization.int.spec.ts` (13), `tests/int/billing.int.spec.ts`. Total do projeto: 62 testes.

## Sem dados fictícios

Nenhum indicador é preenchido com exemplo. Sem histórico, cada área mostra um estado vazio explicando o que registrar.

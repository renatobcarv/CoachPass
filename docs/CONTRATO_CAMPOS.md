# Contrato de collections — Dev-Mendes → Dev-Petter

Slugs e campos publicados em 21/10/2026. Planos pagos / gateway ficam de fora de propósito; as funções do produto estão liberadas.

## professional-links

- student, professional, professionalRole (`personal` | `nutritionist`)
- status: `pending` → aluno aceita (`active`) ou recusa (`revoked`); profissional só encerra (`revoked`)
- acceptedAt, revokedAt
- create pela REST sempre vira `pending` e `professional = usuário logado`

## workouts / meal-plans

- student, author, status (`draft` | `published`), source (`professional` | `ai`)
- personal só cria treino com vínculo `active`; nutri só cria plano com vínculo `active`
- aluno cria treino só para si (`source: ai`)
- `POST /api/ai/generate-workout` e `POST /api/ai/generate-meal-plan` — quota 2/mês cada; 402 `QUOTA_EXCEEDED`

## workout-logs

- student, workout, performedAt, status (`completed` | `partial` | `skipped`)
- rpe (1–10, opcional), notes, exercises[].name / setsCompleted / load
- aluno cria e lê os próprios; personal/nutri lê check-ins de alunos com vínculo `active`
- create REST: `student` vem do usuário logado; o treino precisa estar `published` e pertencer ao aluno

## foods

- name, category (`protein` | `carb` | `fat` | `vegetable` | `fruit` | `dairy`)
- calories, protein, carbs, fat, fiber, sodium, unit, source (`taco` | `tbca` | `manual`)
- leitura autenticada; escrita nutri/master
- recorte de referência TACO/TBCA (~30 itens no seed), não a tabela oficial completa

## transactions

- professional, student, amount, currency, status (`pending` | `paid` | `cancelled`)
- dueDate, paidAt, description, notes
- profissional cria com vínculo `active`; aluno lê as próprias
- update preserva professional/student; gateway desligado

## assessments

- kind: `physical` | `consultation`
- student, professional, date
- weightKg, bodyFatPercent, muscleMassKg, visceralFat, bmr, hydrationPercent
- circumferences: chest, waist, hip, arm, thigh
- restingHeartRate, bloodPressure
- adherenceScore, energyScore, sleepScore (0–10)
- parq (json), notes, nextDate

## sessions

- student, professional, date, time, durationMin
- type: `training` | `assessment` | `consultation` | `followup`
- location, status: `scheduled` | `completed` | `cancelled`, recurring, notes

## restrictions

- student, professional, type (`injury` | `medical` | `dietary` | `other`)
- title, description, severity (`low` | `moderate` | `high`)
- startDate, endDate, medicalClearance, active, notes

## anamneses

- student, professional, answers (json), status (`draft` | `completed`), completedAt

## users (extras)

- bio, specialties[].value, avatarUrl, city, instagram
- consentAcceptedAt, consentVersion, healthDataConsentAt
- passwordChangedAt, preferences (json)
- role: aluno não vira personal/nutri via PATCH

## APIs

- `GET /api/me/export` — exportação LGPD (sem hash/token)
- `GET /api/health`
- `POST /api/professional-links/invite` — sempre 200 genérico (`queued`)
- `POST /api/ai/generate-workout`, `POST /api/ai/generate-meal-plan`, `POST /api/ai/chat`
- `GET/POST /api/workout-logs`, `GET /api/foods`, `GET/POST /api/transactions`
- erros estáveis: `UNAUTHENTICATED`, `FORBIDDEN`, `INVALID_EMAIL`, `RATE_LIMITED`, `QUOTA_EXCEEDED`, `CHAT_QUOTA`, `NO_KEY`

Constantes em `src/lib/cms.ts`: `ASSESSMENTS_API`, `SESSIONS_API`, `RESTRICTIONS_API`, `ANAMNESES_API`, `WORKOUT_LOGS_API`, `FOODS_API`, `TRANSACTIONS_API`, `AI_GENERATE_MEAL_PLAN_API`, `ME_EXPORT_API`.

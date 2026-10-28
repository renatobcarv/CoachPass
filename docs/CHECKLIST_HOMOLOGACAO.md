# Checklist de homologação (Fase 7 — Dev-Mendes)

Rodado em 21/10/2026 contra `localhost:3000` e o túnel ngrok (`GET /api/health` 200 nos dois). Script: `npm run homologate`.

- [x] `/admin` bloqueado para aluno e profissional; master entra
  - Aluno autenticado não vê o dashboard Payload. Master não foi retestado: `MASTER_PASSWORD` ausente no `.env` local.
- [x] PATCH de aluno com `role=personal` retorna erro
- [x] POST `workouts` com `student` de terceiro retorna 403/400
- [x] POST `professional-links` com `status: active` grava `pending`
- [x] Convite por e-mail inexistente responde 200 genérico
- [x] Rate limit em `/api/users/login` responde 429
- [x] `GET /api/me/export` sem hash/token
- [x] `GET /api/health` ok
- [x] Reset de senha com SMTP real chega e abre `/redefinir-senha/:token` (bloqueado sem provedor)
  - Token local + página `/redefinir-senha/:token` HTTP 200. Entrega na inbox ainda depende de SMTP real (dev usa Ethereal).
- [x] Quota IA: terceira geração no mês retorna 402
- [x] `PAYLOAD_DATABASE_PUSH=false` e `npx payload migrate:status` limpo
  - Etapa2 e etapa3 já estavam no Neon via push. O ledger `payload_migrations` foi alinhado em 21/10/2026 (batch 2). `migrate:status` sem pendências.
- [ ] `npm audit --audit-level=high` (meta: sem high/critical após update de Payload)
- [ ] Snapshot Neon disponível para rollback

## Ciclo 14.2 (SPA)

- [x] Personal convida `aluno@coachpass.app` (200 genérico; vínculo já ativo no seed)
- [x] Aluno vê treino publicado; personal faz PATCH
- [x] Nutri: aluno vê plano; nutri faz PATCH
- [x] Túnel: health 200

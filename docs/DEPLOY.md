# Deploy CoachPass

## Recomendação de hospedagem

Vercel + Neon + Gmail (SMTP). Root do projeto na Vercel: `apps/fitsync-cms`. A foto do aluno grava no disco local de `media`: funciona em localhost e no túnel, e some no próximo deploy da Vercel. Docker/Railway só se precisar de processo persistente.

## Variáveis (build e runtime)

Sem estas no **build** o `next build` quebra: `assertRequiredEnv()` roda no import de `payload.config.ts` com `NODE_ENV=production`.

Copie `apps/fitsync-cms/.env.example`. Em produção:

- `PAYLOAD_SECRET` ≥ 32 caracteres aleatórios
- `PAYLOAD_DATABASE_PUSH=false`
- `PAYLOAD_PUBLIC_SERVER_URL` e `FITSYNC_FRONTEND_URL` = `https://SEU-PROJETO.vercel.app`
- SMTP Gmail (sem isso o app não sobe)
- `GEMINI_API_KEY` se a IA real for usada
- `DEMO_PASSWORD` / `MASTER_PASSWORD` só para scripts locais, nunca no runtime da Vercel se não for rodar seed

Preview da Vercel entra no CORS/CSRF via `VERCEL_URL`.

## Gmail

Não há OAuth2. O nodemailer já lê `SMTP_*`.

1. Na conta Google do CoachPass: Segurança → Verificação em duas etapas → Senhas de app.
2. Gere uma senha de app para e-mail e cole em `SMTP_PASS` (não use a senha da conta).
3. `SMTP_USER` e `SMTP_FROM_EMAIL` são o mesmo Gmail. Cole no `.env` local **e** nas Environment Variables da Vercel (Production + Preview):

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-gmail@gmail.com
SMTP_PASS=senha-de-app-de-16-caracteres
SMTP_FROM_EMAIL=seu-gmail@gmail.com
SMTP_FROM_NAME=CoachPass
```

Sem essas variáveis o dev cai no Ethereal e a mensagem não entra na caixa de entrada. Produção não inicia sem `SMTP_HOST`, `SMTP_USER` e `SMTP_PASS`.

## Banco (antes do primeiro deploy)

Não rode migrate no build da Vercel (preview duplicaria).

```bash
cd apps/fitsync-cms
# PAYLOAD_DATABASE_PUSH=false já no .env
npm run migrate
npm run seed:demo   # se quiser as 3 contas no Neon de produção
```

Migrations: etapa1 → etapa2 → etapa3 (`workout_logs`, `foods`, `transactions`).

## Passos

1. `npm ci` em `apps/fitsync-cms`
2. `npm run migrate` (push desligado)
3. Deploy Vercel com root `apps/fitsync-cms` (ou `npm run build` + `npm start`)
4. Conferir `GET /api/health` → `{ ok: true, db: "up" }`

## Auditoria de dependências

Payload 3.91 e Next 15.5.28 removem as críticas conhecidas da versão anterior. Restam highs transitivos (postcss do Next, sass do Payload, sharp/libvips, braces/micromatch). `npm run audit:ci` falha em high de propósito; no GitHub Actions o passo não bloqueia o restante até esses pacotes publicarem correção compatível.

## Rollback

- App: promover o deploy anterior.
- Banco: restaurar snapshot Neon `coachpass-pre-*` ou `payload migrate:down` se a migration for reversível.

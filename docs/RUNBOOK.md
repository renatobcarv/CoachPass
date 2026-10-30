# Runbook CoachPass

## Saúde

- `GET /api/health` deve responder `{ ok: true, db: "up" }`
- 5xx > 2% por 5 min: reverter o deploy

## Login / senha

- Sem SMTP em produção o processo não inicia.
- Reset aponta para `/redefinir-senha/:token` no app, não para `/admin`.

## Banco

- Snapshot manual criado em 21/10/2026: `coachpass-pre-cleanup`
- Limpeza de usuários: `npm run users:backup` depois `npm run users:cleanup -- --apply`
- Seed demo: `DEMO_PASSWORD=... npm run seed:demo`

## Segredos

- Rotacionar `PAYLOAD_SECRET` invalida sessões.
- Não commitar `.env` nem `apps/fitsync-cms/backups/`

## IA

- Sem `GEMINI_API_KEY` o treino usa catálogo local; o chat responde 503.
- Quota treino: 2/mês. Chat: 30/dia.
- Se a chave vazou (chat, print, commit):
  1. Abra https://aistudio.google.com/apikey
  2. Revogue a chave exposta
  3. Gere outra
  4. Substitua só `GEMINI_API_KEY` no `.env` (modelo: `gemini-flash-latest`)
  5. Reinicie o servidor e confira `POST /api/ai/chat`

## SMTP (Gmail)

- Dev: sem `SMTP_*` o Payload usa Ethereal e imprime o link no terminal. A caixa de entrada do Gmail só recebe quando a senha de app está no `.env`.
- Produção: `SMTP_HOST`, `SMTP_USER` e `SMTP_PASS` obrigatórios. Sem isso o processo não inicia. Convite e reset usam o mesmo adapter.
- Valores: `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, `SMTP_SECURE=false`. `SMTP_USER` e `SMTP_FROM_EMAIL` = o Gmail oficial. `SMTP_PASS` = senha de app (Conta Google → Segurança → Senhas de app), não a senha da conta.
- Teste: “esqueci a senha” do `aluno@coachpass.app`. Se o adapter não cair no Ethereal, o e-mail segue para o Gmail. A tela `/redefinir-senha/:token` abre com o token do link.

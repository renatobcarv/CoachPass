# CoachPass

Plataforma de gestão para personal trainers e nutricionistas. App e CMS Payload no mesmo Next.js.

- App: `apps/fitsync-cms` → http://localhost:3000
- Admin Payload: http://localhost:3000/admin (somente master)
- Auditoria e plano: [COACHPASS_AUDITORIA_E_PLANO_PRODUCAO.md](COACHPASS_AUDITORIA_E_PLANO_PRODUCAO.md)
- Contrato de API para o frontend: [docs/CONTRATO_CAMPOS.md](docs/CONTRATO_CAMPOS.md)
- Deploy: [docs/DEPLOY.md](docs/DEPLOY.md)

## Desenvolvimento

```bash
cd apps/fitsync-cms
cp .env.example .env
npm install
npm run dev
```

## Scripts

| Comando | Função |
|---|---|
| `npm run dev` | Servidor local |
| `npm run seed:master` | Usuário master (`MASTER_PASSWORD`) |
| `npm run seed:demo` | Contas demo (`DEMO_PASSWORD`) |
| `npm run users:backup` | Export JSON em `backups/` |
| `npm run test:int` | Vitest (política de senha sempre; acesso só com `DATABASE_URL_TEST`) |
| `npm run audit:ci` | Falha se houver high/critical |

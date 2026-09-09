# FitSync

App (alunos, personal e nutricionista) e CMS Payload no mesmo projeto Next.js.

- App: http://localhost:3000
- Admin: http://localhost:3000/admin
- API: http://localhost:3000/api

## Desenvolvimento

1. Copie o ambiente: `cp .env.example .env` e preencha `DATABASE_URL` e `PAYLOAD_SECRET`.
2. Instale e suba o servidor:

```bash
npm install
npm run dev
```

3. Usuário master (opcional): `npm run seed:master`

## Scripts

| Comando | Função |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` / `npm start` | Produção |
| `npm run generate:types` | Tipos do Payload após mudança de collections |
| `npm run seed:master` | Garante o usuário master |

## Estrutura

```
src/
  app/(frontend)   # rotas do app (SPA)
  app/(payload)    # admin e API do Payload
  web/             # telas e componentes do app
  collections/     # collections do CMS
  lib/             # cliente da API e integrações
```

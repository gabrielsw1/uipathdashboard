# Backend - Dashboard RPA

API Node.js + Express para conectar com o UiPath Orchestrator.

## Instalação

```bash
npm install
```

## Configuração

Copie `.env.example` para `.env` e configure:

```env
ORCHESTRATOR_URL=https://cloud.uipath.com
ORCHESTRATOR_TENANT=seu-tenant
ORCHESTRATOR_CLIENT_ID=your-client-id
ORCHESTRATOR_CLIENT_SECRET=your-client-secret
PORT=3001
CACHE_TTL=300
CORS_ORIGIN=http://localhost:5173
```

## Executar

```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

## Endpoints

- `GET /health` - Health check
- `GET /api/stats/*` - Estatísticas
- `GET /api/jobs/*` - Jobs
- `GET /api/processes/*` - Processos
- `GET /api/robots/*` - Robots
- `GET /api/sessions/*` - Sessões
- `GET /api/folders/*` - Pastas
- `GET /api/releases/*` - Releases
- `GET /api/machines/*` - Máquinas


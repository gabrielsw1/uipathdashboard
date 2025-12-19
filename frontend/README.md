# Frontend - Dashboard RPA

Dashboard React + TypeScript para visualização de métricas do UiPath Orchestrator.

## Instalação

```bash
npm install
```

## Configuração

Copie `.env.example` para `.env` e configure:

```env
VITE_API_URL=http://localhost:3001
```

## Executar

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## Estrutura

- `src/components/` - Componentes React
- `src/hooks/` - Hooks customizados com React Query
- `src/services/` - Serviços de API
- `src/store/` - Estado global (Zustand)
- `src/utils/` - Utilitários

## Tecnologias

- React 18 + TypeScript
- Vite
- React Query
- Recharts
- TailwindCSS
- Zustand


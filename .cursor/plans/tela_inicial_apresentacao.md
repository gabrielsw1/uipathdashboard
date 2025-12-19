# Tela Inicial com Apresentação e Animações

## Objetivo
Criar uma tela inicial (splash/landing) que aparece antes do dashboard com:
- Animações suaves e atrativas
- Apresentação do que é a ferramenta
- Links para LinkedIn e YouTube
- Nome do desenvolvedor (Gabriel Moreno da Luz)
- Botão "Entrar" para acessar o dashboard

## Implementação

### 1. Criar componente Welcome/Landing Page
**Arquivo**: `frontend/src/pages/Welcome.tsx`

- Componente funcional React com animações
- Seções animadas:
  - Título principal com fade-in
  - Descrição da ferramenta com slide-up
  - Cards com features principais (Dashboard, ROI, Monitoramento)
  - Seção do desenvolvedor com links sociais
  - Botão "Entrar" destacado
- Animações usando CSS transitions e Tailwind classes
- Design moderno e atrativo
- Responsivo para mobile e desktop

### 2. Gerenciar estado de navegação
**Arquivo**: `frontend/src/App.tsx`

- Adicionar estado para controlar se já passou pela tela inicial
- Usar localStorage para lembrar (opcional - pode sempre mostrar)
- Mostrar Welcome na rota "/" ou "/welcome"
- Redirecionar para Dashboard após clicar em "Entrar"

### 3. Conteúdo da Apresentação
- Título: "Dashboard RPA Analytics"
- Subtítulo: "Visão analítica completa do UiPath Orchestrator"
- Features:
  - Dashboard com métricas e gráficos
  - Análise de ROI
  - Monitoramento em tempo real
- Créditos: "Desenvolvido por Gabriel Moreno da Luz"
- Links sociais: LinkedIn e YouTube

### 4. Animações
- Fade-in para elementos principais
- Slide-up para textos
- Hover effects nos cards e botões
- Transição suave ao clicar em "Entrar"

## Estrutura Visual

```
┌─────────────────────────────────────────┐
│  [Logo/Ícone animado]                   │
│  Dashboard RPA Analytics                 │
│  Visão analítica completa...            │
│                                          │
│  [Card Dashboard] [Card ROI] [Card Mon] │
│                                          │
│  Desenvolvido por Gabriel Moreno da Luz │
│  [LinkedIn] [YouTube]                    │
│                                          │
│  [Botão ENTRAR]                          │
└─────────────────────────────────────────┘
```


# 🚀 Dashboard RPA - UiPath Orchestrator

Dashboard interativo e moderno para visualização e análise de métricas do UiPath Orchestrator em tempo real.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-18%2B-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Como Usar](#-como-usar)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Tecnologias](#-tecnologias)
- [API Endpoints](#-api-endpoints)
- [Desenvolvimento](#-desenvolvimento)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)

## 🎯 Sobre o Projeto

Este projeto é um dashboard completo para monitoramento e análise do UiPath Orchestrator, oferecendo uma interface moderna e intuitiva para visualizar métricas de Jobs, Processos, Robots, Sessões e muito mais. O dashboard foi desenvolvido com foco em performance, usabilidade e visualizações interativas.

### Principais Características

- ✅ **Monitoramento em Tempo Real**: Visualização instantânea de métricas e status
- ✅ **Análise de ROI**: Cálculo e acompanhamento de retorno sobre investimento
- ✅ **Gráficos Interativos**: Visualizações modernas com Recharts e D3.js
- ✅ **Filtros Avançados**: Filtragem por pasta, processo, robot, estado e período
- ✅ **Interface Responsiva**: Design moderno com suporte a modo escuro
- ✅ **Performance Otimizada**: Cache inteligente e requisições otimizadas

## ✨ Funcionalidades

### 📊 Dashboard Principal
- **Métricas em Tempo Real**: Cards com estatísticas de Jobs, Processos, Robots e Sessões
- **Gráficos de Performance**: Timeline de execuções, gráficos de pizza, barras e linhas
- **Heatmap de Jobs**: Visualização de padrões de execução ao longo do tempo
- **Status de Robots**: Monitoramento do status e disponibilidade dos robots
- **Tabelas Interativas**: Jobs, Processos e Robots com ordenação e paginação

### 📈 Análise de ROI
- **Configuração de Custos**: Definição de custos por robot, processo e hora
- **Cálculo Automático**: ROI calculado automaticamente com base nas execuções
- **Exportação/Importação**: Salvar e carregar configurações de ROI em JSON
- **Tabela Detalhada**: Visualização completa de custos e retornos

### 🔍 Monitoramento em Tempo Real
- **Gráficos ECG**: Visualizações estilo ECG para monitoramento contínuo
- **Métricas de Performance**: CPU, memória e outros indicadores
- **Alertas Visuais**: Notificações de eventos importantes

### 🎛️ Filtros e Busca
- **Filtro por Pasta**: Seleção de pastas específicas do Orchestrator
- **Filtro por Processo**: Filtragem por processos específicos
- **Filtro por Robot**: Seleção de robots individuais
- **Filtro por Estado**: Filtragem por estado dos jobs (Running, Successful, Failed, etc.)
- **Filtro por Período**: Seleção de intervalo de datas
- **Filtro por Tipo**: Filtragem por tipo de feed e pasta

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** 18 ou superior ([Download](https://nodejs.org/))
- **npm** ou **yarn** (vem com o Node.js)
- **Conta UiPath Orchestrator** com credenciais OAuth2
- **Git** (para clonar o repositório)

### Credenciais do UiPath Orchestrator

Você precisará das seguintes informações do seu ambiente UiPath:

- URL do Orchestrator (ex: `https://cloud.uipath.com` ou URL do seu tenant)
- Tenant ID
- PAT (PERSONAL ACCESS TOKEN)

## 🔧 Instalação

### 1. Clone o Repositório

```bash
git clone https://github.com/gabrielsw1/uipathdashboard.git
cd uipathdashboard
```

### 2. Instale as Dependências do Backend

```bash
cd backend
npm install
```

### 3. Instale as Dependências do Frontend

```bash
cd ../frontend
npm install
```

## ⚙️ Configuração

### Backend

1. Crie um arquivo `.env` na pasta `backend`:

```bash
cd backend
cp .env.example .env  # Se existir um exemplo
# Ou crie manualmente
```

2. Configure as variáveis de ambiente no arquivo `.env`:
# Orchestrator Configuration
ORCHESTRATOR_URL=
ORCHESTRATOR_TENANT=
ORCHESTRATOR_ORGANIZATION=

# Autenticação - Use Personal Access Token
ORCHESTRATOR_PAT=


# Server Configuration
PORT=3001
NODE_ENV=development

# Cache Configuration
CACHE_TTL=300

# CORS Configuration
CORS_ORIGIN=http://localhost:5173


**⚠️ Importante**: Nunca commite o arquivo `.env` com suas credenciais reais!

### Frontend

O frontend está configurado para se conectar automaticamente ao backend em `http://localhost:3001` através do proxy do Vite. Se precisar alterar isso, edite o arquivo `frontend/vite.config.ts`.

## 🚀 Como Usar

### Iniciando o Backend

```bash
cd backend
npm run dev
```

O servidor estará rodando em `http://localhost:3001`

### Iniciando o Frontend

Em um novo terminal:

```bash
cd frontend
npm run dev
```

O frontend estará rodando em `http://localhost:5173`

### Acessando o Dashboard

1. Abra seu navegador e acesse `http://localhost:5173`
2. Você será redirecionado para a página de boas-vindas
3. Navegue pelo menu para acessar:
   - **Dashboard**: Visão geral com métricas e gráficos
   - **ROI**: Análise de retorno sobre investimento
   - **Monitoramento**: Visualizações em tempo real

### Usando os Filtros

1. Clique no botão **"Filtros"** no topo do Dashboard
2. Selecione os filtros desejados:
   - **Pasta**: Escolha a pasta do Orchestrator
   - **Processo**: Selecione um processo específico
   - **Robot**: Escolha um robot
   - **Estado**: Filtre por estado (Running, Successful, Failed, etc.)
   - **Período**: Selecione um intervalo de datas
3. Os dados serão atualizados automaticamente conforme você aplica os filtros

### Configurando o ROI

1. Acesse a página **ROI** pelo menu
2. Clique em **"Adicionar Configuração"**
3. Preencha os campos:
   - **Nome**: Nome da configuração
   - **Custo por Robot**: Custo mensal por robot
   - **Custo por Processo**: Custo por execução do processo
   - **Custo por Hora**: Custo por hora de execução
4. Clique em **"Salvar"**
5. O ROI será calculado automaticamente com base nas execuções

### Exportando/Importando Configurações de ROI

1. Na página ROI, clique em **"Exportar JSON"** para salvar suas configurações
2. Para importar, clique em **"Importar JSON"** e selecione o arquivo

## 📁 Estrutura do Projeto

```
uipathdashboard/
├── backend/                 # API Backend (Node.js + Express)
│   ├── src/
│   │   ├── app.ts          # Aplicação principal
│   │   ├── middleware/     # Middlewares (auth, error handling)
│   │   ├── routes/         # Rotas da API
│   │   │   ├── jobs.ts
│   │   │   ├── processes.ts
│   │   │   ├── robots.ts
│   │   │   ├── sessions.ts
│   │   │   ├── stats.ts
│   │   │   ├── folders.ts
│   │   │   ├── releases.ts
│   │   │   ├── machines.ts
│   │   │   ├── roi.ts
│   │   │   └── monitoring.ts
│   │   ├── services/       # Serviços de negócio
│   │   │   ├── orchestratorService.ts
│   │   │   ├── authService.ts
│   │   │   └── cacheService.ts
│   │   ├── types/          # Tipos TypeScript
│   │   └── utils/          # Utilitários
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   │   ├── dashboard/  # Componentes do dashboard
│   │   │   ├── filters/    # Componentes de filtro
│   │   │   ├── monitoring/ # Componentes de monitoramento
│   │   │   ├── roi/        # Componentes de ROI
│   │   │   ├── tables/     # Tabelas
│   │   │   └── ui/         # Componentes UI reutilizáveis
│   │   ├── hooks/          # Hooks customizados
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── services/       # Serviços de API
│   │   ├── store/          # Estado global (Zustand)
│   │   ├── types/          # Tipos TypeScript
│   │   └── utils/          # Utilitários
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

## 🛠️ Tecnologias

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **TypeScript** - Tipagem estática
- **Axios** - Cliente HTTP
- **node-cache** - Cache em memória
- **express-rate-limit** - Rate limiting
- **Zod** - Validação de schemas
- **dotenv** - Gerenciamento de variáveis de ambiente

### Frontend
- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **React Router** - Roteamento
- **TanStack Query** - Gerenciamento de estado do servidor
- **Zustand** - Gerenciamento de estado global
- **Recharts** - Gráficos e visualizações
- **D3.js** - Visualizações avançadas
- **TailwindCSS** - Framework CSS
- **Lucide React** - Ícones
- **date-fns** - Manipulação de datas

## 📡 API Endpoints

### Estatísticas
- `GET /api/stats/count` - Contagem geral de entidades
- `GET /api/stats/jobs` - Estatísticas de jobs
- `GET /api/stats/sessions` - Estatísticas de sessões
- `GET /api/stats/licenses` - Estatísticas de licenças

### Jobs
- `GET /api/jobs` - Lista jobs com filtros OData
- `GET /api/jobs/:key` - Detalhes de um job específico
- `POST /api/jobs/:key/stop` - Parar um job
- `POST /api/jobs/:key/restart` - Reiniciar um job

### Processos
- `GET /api/processes` - Lista processos
- `GET /api/processes/:key` - Detalhes de um processo

### Robots
- `GET /api/robots` - Lista robots
- `GET /api/robots/:key` - Detalhes de um robot

### Sessões
- `GET /api/sessions` - Lista sessões
- `GET /api/sessions/:key` - Detalhes de uma sessão

### Pastas
- `GET /api/folders` - Lista pastas
- `GET /api/folders/:id` - Detalhes de uma pasta

### Releases
- `GET /api/releases` - Lista releases
- `GET /api/releases/:key` - Detalhes de uma release

### Máquinas
- `GET /api/machines` - Lista máquinas
- `GET /api/machines/:key` - Detalhes de uma máquina

### ROI
- `GET /api/roi/config` - Obter configuração de ROI
- `POST /api/roi/config` - Salvar configuração de ROI
- `GET /api/roi/calculate` - Calcular ROI

### Monitoramento
- `GET /api/monitoring/realtime` - Dados de monitoramento em tempo real

### Health Check
- `GET /health` - Verificar status do servidor

## 🔨 Desenvolvimento

### Scripts Disponíveis

#### Backend
```bash
npm run dev      # Inicia em modo desenvolvimento com hot reload
npm run build    # Compila TypeScript para JavaScript
npm run start    # Inicia o servidor em produção
npm run type-check  # Verifica tipos TypeScript
```

#### Frontend
```bash
npm run dev      # Inicia servidor de desenvolvimento
npm run build    # Compila para produção
npm run preview  # Preview da build de produção
npm run lint     # Executa o linter
```

### Estrutura de Desenvolvimento

1. **Backend**: Desenvolvido em TypeScript com Express
2. **Frontend**: Desenvolvido em React com TypeScript e Vite
3. **Estado**: Gerenciado com Zustand e TanStack Query
4. **Estilização**: TailwindCSS com suporte a modo escuro
5. **API**: RESTful com suporte a filtros OData

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fazer um Fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abrir um Pull Request

### Padrões de Código

- Use TypeScript para tipagem
- Siga os padrões de código existentes
- Adicione comentários quando necessário
- Mantenha os componentes pequenos e reutilizáveis

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Se você tiver dúvidas ou problemas:

1. Verifique a [documentação](#-como-usar)
2. Abra uma [issue](https://github.com/gabrielsw1/uipathdashboard/issues) no GitHub
3. Entre em contato com os mantenedores

## 🎉 Agradecimentos

- UiPath pela plataforma Orchestrator
- Comunidade open source pelas bibliotecas utilizadas

---

Desenvolvido com ❤️ para a comunidade RPA

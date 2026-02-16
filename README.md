# 🏅 Sportfy

**Sportfy** é uma plataforma esportiva universitária desenvolvida para acadêmicos da UFPR (Universidade Federal do Paraná). A aplicação permite que estudantes gerenciem suas atividades esportivas, participem de campeonatos, acompanhem metas e conquistas, avaliem jogadores e acessem recursos de apoio à saúde — tudo em uma interface moderna e responsiva.

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e Execução](#-instalação-e-execução)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Páginas e Rotas](#-páginas-e-rotas)
- [Autenticação](#-autenticação)
- [Integração com API](#-integração-com-api)
- [Gerenciamento de Estado](#-gerenciamento-de-estado)
- [Componentes de UI](#-componentes-de-ui)
- [Temas](#-temas)
- [Testes](#-testes)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [PWA](#-pwa)

---

## 🎯 Visão Geral

Sportfy é o frontend de uma plataforma esportiva completa voltada ao meio acadêmico. O sistema conecta-se a uma API backend (Java/Spring Boot) rodando por padrão em `http://localhost:8081`. A aplicação oferece dois perfis de acesso:

- **Acadêmico**: estudante que pode participar de campeonatos, criar metas esportivas, visualizar conquistas, avaliar jogadores e acessar o canal de saúde.
- **Administrador**: pode gerenciar administradores, modalidades esportivas e recursos de apoio à saúde.

---

## ✨ Funcionalidades

### Para Acadêmicos
| Funcionalidade | Descrição |
|---|---|
| **Feed de Publicações** | Criar, editar, excluir e curtir publicações; comentar em posts |
| **Perfil** | Visualização do perfil com metas recentes, conquistas e campeonatos |
| **Metas Diárias** | Criar, editar, acompanhar progresso e excluir metas diárias e esportivas |
| **Conquistas** | Visualizar conquistas organizadas por modalidade esportiva (Futebol, Vôlei, Basquete, Tênis de Mesa, Handebol) |
| **Campeonatos** | Criar, buscar, excluir campeonatos; preenchimento automático de endereço via CEP (ViaCEP) |
| **Modalidades** | Inscrever-se e desinscrever-se em modalidades esportivas |
| **Estatísticas** | Gráficos de desempenho com campeonatos, metas e conquistas por modalidade |
| **Avaliação de Jogadores** | Avaliar outros jogadores com sistema de estrelas (1–5) |
| **Canal Saúde** | Consultar recursos de apoio à saúde (UFPR e externos) |
| **Configurações** | Controle de privacidade (histórico, estatísticas, conquistas); alternar tema claro/escuro |

### Para Administradores
| Funcionalidade | Descrição |
|---|---|
| **Gestão de Administradores** | CRUD completo de administradores com paginação |
| **Gestão de Modalidades** | Cadastrar e gerenciar modalidades esportivas |
| **Gestão de Saúde** | Gerenciar recursos do Canal Saúde |

---

## 🛠 Tecnologias

### Core
| Tecnologia | Versão | Uso |
|---|---|---|
| [Next.js](https://nextjs.org/) | 16.1.1 | Framework React com App Router |
| [React](https://react.dev/) | 19.0.0-rc | Biblioteca de UI |
| [TypeScript](https://www.typescriptlang.org/) | ^5 | Tipagem estática |
| [Tailwind CSS](https://tailwindcss.com/) | ^3.4.1 | Estilização utility-first |

### Gerenciamento de Estado e Data Fetching
| Tecnologia | Uso |
|---|---|
| [TanStack React Query](https://tanstack.com/query) | Cache, fetching e sincronização de dados do servidor |
| [React Hook Form](https://react-hook-form.com/) | Gerenciamento de formulários |
| [Zod](https://zod.dev/) | Validação de schemas |

### UI e Componentes
| Tecnologia | Uso |
|---|---|
| [shadcn/ui](https://ui.shadcn.com/) (estilo New York) | Biblioteca de componentes baseada em Radix UI |
| [Radix UI](https://www.radix-ui.com/) | Primitivos de UI acessíveis (Dialog, Select, Tabs, Toast, etc.) |
| [Lucide React](https://lucide.dev/) | Ícones |
| [Framer Motion](https://www.framer.com/motion/) | Animações |
| [Recharts](https://recharts.org/) | Gráficos e visualização de dados |
| [Sonner](https://sonner.emilkowal.ski/) | Notificações toast |
| [next-themes](https://github.com/pacocoursey/next-themes) | Suporte a tema claro/escuro |
| [Embla Carousel](https://www.embla-carousel.com/) | Carrossel |

### HTTP e Autenticação
| Tecnologia | Uso |
|---|---|
| [Axios](https://axios-http.com/) | Cliente HTTP |
| [jwt-decode](https://github.com/auth0/jwt-decode) | Decodificação de tokens JWT |
| Fetch API nativa | Chamadas HTTP alternativas |

### Qualidade de Código
| Tecnologia | Uso |
|---|---|
| [ESLint](https://eslint.org/) | Linting (config Rocketseat) |
| [Jest](https://jestjs.io/) | Framework de testes |
| [MSW](https://mswjs.io/) | Mock de APIs para testes |
| [Testing Library](https://testing-library.com/) | Utilitários de teste |

---

## 🏗 Arquitetura

```
src/
├── app/                    # App Router (Next.js) — páginas e layouts
│   ├── layout.tsx          # Layout raiz (ThemeProvider, QueryProvider, Toaster)
│   ├── page.tsx            # Redireciona para /auth
│   └── [feature]/page.tsx  # Páginas por funcionalidade
├── components/             # Componentes reutilizáveis
│   ├── ui/                 # Componentes shadcn/ui (35+ componentes)
│   ├── Header.tsx          # Cabeçalho com busca de usuários e menu
│   ├── Sidebar.tsx         # Navegação lateral responsiva
│   └── ...                 # Componentes de domínio
├── hooks/                  # Custom hooks (useAuth, useFeed, useGoals, etc.)
├── http/                   # Camada HTTP — funções de chamada à API organizadas por domínio
│   ├── auth/               # Login/autenticação
│   ├── feed/               # Publicações, comentários, curtidas
│   ├── goals/              # Metas diárias
│   ├── championships/      # Campeonatos
│   ├── achievements/       # Conquistas
│   ├── modality/           # Modalidades esportivas
│   ├── statistics/         # Estatísticas de uso
│   └── register/           # Registro de acadêmico
├── services/               # Serviços auxiliares (championship, metaEsportiva)
├── schemas/                # Schemas de validação Zod (signIn, signUp, createGoal)
├── interface/              # Tipos/interfaces TypeScript compartilhados
├── types/                  # Tipos adicionais (apoio-saude)
├── lib/                    # Utilitários (cn helper, API config)
└── utils/                  # Utilitários (auth, apiUtils com fetchWithAuth)
```

### Padrões Utilizados

- **App Router** (Next.js 16) com componentes Server e Client (`'use client'`)
- **Camada HTTP separada** (`src/http/`) com funções organizadas por domínio
- **Custom Hooks** encapsulando lógica de negócio e chamadas de API
- **React Query** para server state management com cache e invalidação
- **React Hook Form + Zod** para formulários com validação tipada
- **Turbopack** habilitado no modo de desenvolvimento (`next dev --turbopack`)

---

## 📦 Pré-requisitos

- **Node.js** >= 18
- **pnpm** (gerenciador de pacotes)
- **API Backend** rodando em `http://localhost:8081` (Java/Spring Boot)

---

## 🚀 Instalação e Execução

```bash
# 1. Clonar o repositório
git clone <url-do-repositorio>
cd Sportfy-frontend

# 2. Instalar dependências
pnpm install

# 3. Configurar variáveis de ambiente
# Criar arquivo .env.local com:
# NEXT_PUBLIC_API_URL=http://localhost:8081

# 4. Iniciar o servidor de desenvolvimento
pnpm dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

---

## 📜 Scripts Disponíveis

| Script | Comando | Descrição |
|---|---|---|
| `dev` | `pnpm dev` | Inicia o servidor de desenvolvimento com Turbopack |
| `build` | `pnpm build` | Gera build de produção |
| `start` | `pnpm start` | Inicia o servidor de produção |
| `lint` | `pnpm lint` | Executa o ESLint nos arquivos `src/` |
| `json-server` | `pnpm json-server` | Inicia JSON Server na porta 3001 (mock de dados) |

---

## 🗂 Páginas e Rotas

| Rota | Página | Descrição |
|---|---|---|
| `/` | Home | Redireciona para a tela de login |
| `/auth` | Login | Autenticação com username e senha |
| `/register` | Registro | Cadastro de acadêmico (requer email @ufpr.br) |
| `/feed` | Feed | Timeline de publicações, curtidas e comentários |
| `/profile` | Perfil | Dados do usuário, metas recentes, conquistas e campeonatos |
| `/profile/[username]` | Perfil Público | Visualização de perfil de outro usuário |
| `/profile/edit` | Editar Perfil | Edição de dados do perfil |
| `/goals` | Metas | Gerenciamento de metas diárias e esportivas |
| `/achievements` | Conquistas | Conquistas por modalidade esportiva |
| `/championships` | Campeonatos | Listagem, criação e gerenciamento de campeonatos |
| `/championships/[idCampeonato]` | Detalhe | Detalhes e times de um campeonato |
| `/Modality` | Modalidades | Inscrição/desinscrição em modalidades esportivas |
| `/statistics` | Estatísticas | Gráficos de desempenho por modalidade |
| `/playerRatings` | Avaliações | Avaliação de jogadores com estrelas |
| `/healthWarning` | Canal Saúde | Recursos de apoio à saúde |
| `/settings` | Configurações | Privacidade, tema e logout |
| `/admin` | Admin | Painel de gerenciamento de administradores |
| `/admin/health` | Admin Saúde | Gerenciamento de recursos de saúde |
| `/admin/modality` | Admin Modalidades | Gerenciamento de modalidades |

---

## 🔐 Autenticação

O sistema utiliza **JWT (JSON Web Token)** para autenticação:

1. O usuário faz login em `/auth` enviando `username` e `password` para `POST /login/efetuarLogin`
2. O backend retorna um token JWT que é armazenado no `localStorage`
3. O token é decodificado com `jwt-decode` para extrair informações do usuário (`idUsuario`, `sub`, `roles`, `idAcademico`)
4. Todas as requisições subsequentes incluem o header `Authorization: Bearer <token>`
5. Dois papéis são suportados: `ACADEMICO` e `ADMINISTRADOR`
6. A sidebar adapta os itens de navegação de acordo com o papel do usuário

### Validações de Login/Registro (Zod)
- **Login**: username (mín. 3 caracteres) + password (mín. 4 caracteres)
- **Registro**: curso, username, email (domínio @ufpr.br obrigatório), nome, telefone, data de nascimento

---

## 🌐 Integração com API

A API backend é consumida através de duas abordagens:

1. **Camada `src/http/`**: funções assíncronas organizadas por domínio que usam `fetch` nativo ou `axios`:
   - `auth/` — `authenticateUser()`
   - `feed/` — `fetchPosts()`, `createPost()`, `likePost()`, `unlikePost()`, `fetchComments()`, `createComment()`
   - `goals/` — `getGoals()`, `createGoal()`, `updateGoal()`, `deleteGoal()`, `getMetaEsportiva()`
   - `championships/` — `getCampeonatos()`, `createCampeonato()`, `updateCampeonato()`, `deleteCampeonato()`
   - `achievements/` — `fetchAchievements()`
   - `modality/` — `getModalidades()`, `inscreverUsuario()`, `desinscreverUsuario()`
   - `statistics/` — `fetchUsoAcademico()`
   - `register/` — `registerAcademico()`

2. **Utilitário `fetchWithAuth()`** em `src/utils/apiUtils.ts`: wrapper que injeta automaticamente o token JWT nos headers.

### Endpoints Principais do Backend
| Recurso | Endpoint Base |
|---|---|
| Login | `/login/efetuarLogin` |
| Acadêmico | `/academico/` |
| Publicações | `/publicacao/` |
| Metas Diárias | `/metaDiaria/` |
| Conquistas | `/conquista/` |
| Campeonatos | `/campeonatos/` |
| Modalidades | `/modalidadeEsportiva/` |
| Estatísticas | `/estatistica/` |
| Apoio à Saúde | `/apoioSaude` |
| Administradores | `/administrador/` |

---

## 🗃 Gerenciamento de Estado

| Tipo de Estado | Solução | Uso |
|---|---|---|
| Server State | **TanStack React Query** | Cache, fetching, invalidação e refetch automático de dados da API |
| Form State | **React Hook Form** | Gerenciamento de formulários com validação via Zod resolvers |
| Local/UI State | **React `useState`** | Estados de UI (modais, filtros, loading, etc.) |
| Persistência | **localStorage** | Token JWT, dados do usuário em cache, rotas visitadas |

O `QueryClient` é configurado com `staleTime` de 1 minuto e 1 retry por padrão, envolvendo toda a aplicação via `QueryProvider`.

---

## 🎨 Componentes de UI

A aplicação utiliza **shadcn/ui** (estilo **New York**, base de cor **Slate**, com CSS variables) sobre **Radix UI**, incluindo 35+ componentes:

`AlertDialog` · `Avatar` · `Badge` · `Breadcrumb` · `Button` · `Calendar` · `Card` · `Carousel` · `Chart` · `Checkbox` · `Combobox` · `Command` · `Dialog` · `DropdownMenu` · `Input` · `Label` · `Pagination` · `Popover` · `Progress` · `RadioGroup` · `ScrollArea` · `Select` · `Separator` · `Sheet` · `Skeleton` · `Switch` · `Table` · `Tabs` · `Textarea` · `Toast` · `Toggle` · `Tooltip`

O helper utilitário `cn()` (em `src/lib/utils.ts`) combina `clsx` e `tailwind-merge` para composição segura de classes CSS.

---

## 🌗 Temas

- Suporte a **tema claro e escuro** via `next-themes`
- Tema escuro como padrão (`defaultTheme="dark"`)
- Toggle de tema disponível na página de Configurações (`ModeToggle`)
- Cores customizadas via CSS variables HSL definidas no `globals.css`
- Configuração do Tailwind com tokens de design: `background`, `foreground`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `card`, `popover`

---

## 🧪 Testes

- **Framework**: Jest com ambiente `node`
- **Padrão de arquivos**: `**/src/**/*.test.(js|jsx|ts|tsx)`
- **Mock de APIs**: MSW (Mock Service Worker) disponível como dependência
- **Testing Library**: `@testing-library/user-event` para simulação de interações
- Exemplo de teste existente: `src/app/auth/page.client.test.tsx`

```bash
# Executar testes
pnpm test
```

---

## 🔧 Variáveis de Ambiente

| Variável | Descrição | Padrão |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | URL base da API backend | `http://localhost:8081` |
| `HIDE_NEXT_ERROR_OVERLAY` | Oculta o overlay de erros do Next.js em dev | `false` |

---

## 📱 PWA

A aplicação inclui um `manifest.json` com suporte a PWA (Progressive Web App):

- **Nome**: Sportfy Application
- **Display**: standalone
- **Ícones**: 192x192 e 512x512
- **Tema**: branco

---

## 📄 Licença

Projeto desenvolvido para fins acadêmicos — UFPR.

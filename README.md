# ServeFlow — Frontend

Interface web do sistema de gestão de restaurantes ServeFlow. Construída com React 19 e Vite, consome a API REST do backend e oferece módulos para atendimento, cozinha, estoque e financeiro.

## Tecnologias

- React 19
- Vite 8
- React Router 6
- Zustand (estado global)
- TanStack Query (cache e requisições)
- React Hook Form + Zod (formulários e validação)
- Recharts (gráficos)
- Framer Motion (animações)
- Tailwind CSS
- Axios

## Pré-requisitos

- Node.js 20+
- npm 10+
- Backend ServeFlow rodando (ver [backend-serveflow](https://github.com/derson-umc/backend-serveflow))

## Configuração

Crie o arquivo `.env.local` na raiz do projeto:

```env
VITE_API_URL=http://localhost:8080
```

## Executando

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev
```

Aplicação disponível em `http://localhost:5173`.

```bash
# Gerar build de produção
npm run build

# Pré-visualizar build
npm run preview
```

## Módulos

| Módulo | Rota | Perfis com acesso |
|---|---|---|
| Login | `/login` | Todos |
| Dashboard | `/dashboard` | Gerente |
| Menu e Pedidos | `/menu` | Gerente, Garcom |
| KDS | `/kds` | Cozinheiro, Gerente |
| Estoque | `/estoque` | Gerente |
| Financeiro | `/financeiro` | Caixa, Gerente |
| Fichas Técnicas | `/fichas-tecnicas` | Gerente, Cozinheiro |
| Gestão de Usuários | `/gestao-usuarios` | Gerente, Admin |
| Cadastrar Produtos | `/cadastro-produtos` | Gerente |
| Pagamento | `/pagamento` | Garcom, Caixa |

## Estrutura

```
src/
├── app/             # Configuração de rotas e providers
├── core/
│   ├── api/         # Clientes HTTP por módulo (Axios)
│   └── constants/   # Perfis e constantes globais
├── features/        # Módulos por funcionalidade
│   ├── auth/        # Login, landing e reset de senha
│   ├── dashboard/   # KPIs e gráficos gerenciais
│   ├── menu/        # Vendas, comandas, delivery e pagamento
│   ├── kds/         # Monitor de preparo em tempo real
│   ├── stock/       # Insumos, movimentações e relatórios
│   ├── financial/   # Caixa e relatório financeiro
│   ├── products/    # Cadastro de produtos
│   ├── recipes/     # Fichas técnicas
│   └── users/       # Gestão de usuários
├── shared/          # Componentes, hooks e utilitários reutilizáveis
└── styles/          # Design system (tokens, paleta, componentes base)
```

## Autenticação

O acesso é controlado por JWT. O token de acesso é armazenado em memória (Zustand); o refresh token mantém a sessão ativa. Rotas protegidas redirecionam para `/login` quando não autenticado.

## Licença

Projeto acadêmico — Universidade de Mogi das Cruzes (UMC).

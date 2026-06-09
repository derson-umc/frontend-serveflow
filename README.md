# ServeFlow — Frontend

Interface web do sistema de gestão de restaurantes ServeFlow. Construída com React 19 e Vite, consome a API REST do backend e cobre os principais fluxos operacionais: atendimento de mesas e delivery, acompanhamento da cozinha, controle de estoque e gestão financeira.

---

## Tecnologias

| Biblioteca | Versão | Para que serve |
|---|---|---|
| React | 19 | Interface de usuário |
| Vite | 8 | Build e servidor de desenvolvimento |
| React Router | 6 | Roteamento client-side |
| Zustand | 5 | Estado global (autenticação e carrinho) |
| TanStack Query | 5 | Cache e sincronização com a API |
| React Hook Form + Zod | 7 + 4 | Formulários e validação de dados |
| Axios | 1 | Requisições HTTP |
| Recharts | 2 | Gráficos do dashboard |
| Framer Motion | 11 | Animações e transições de tela |
| Tailwind CSS | 3 | Utilitários de estilo |

---

## Pré-requisitos

- **Node.js 20+** e **npm 10+**
- **Backend ServeFlow** rodando localmente — veja [backend-serveflow](https://github.com/derson-umc/backend-serveflow)

---

## Configuração

Crie o arquivo `.env.local` na raiz do projeto:

```env
VITE_API_URL=http://localhost:8080
```

> Se o backend estiver em outra porta, ajuste o valor acima.

---

## Rodando o projeto

```bash
# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
npm run dev
```

A aplicação ficará disponível em **http://localhost:5173**.

### Build de produção

```bash
# Gerar os arquivos otimizados para deploy
npm run build

# Pré-visualizar o build localmente antes de publicar
npm run preview
```

---

## Módulos e perfis de acesso

Cada rota é protegida por um guard que redireciona o usuário para a tela padrão do seu perfil caso tente acessar uma área sem permissão.

| Módulo | Rota | Quem acessa |
|---|---|---|
| Login | `/login` | Todos |
| Dashboard | `/dashboard` | Gerente, Admin |
| Menu e Pedidos | `/menu` | Gerente, Garçom, Admin |
| KDS — Cozinha | `/kds` | Cozinheiro, Gerente, Admin |
| Estoque | `/estoque` | Gerente, Admin |
| Financeiro | `/financeiro` | Caixa, Gerente, Admin |
| Fichas Técnicas | `/ficha-tecnica` | Gerente, Admin |
| Gestão de Usuários | `/gestao-usuarios` | Gerente, Admin |
| Cadastro de Produtos | `/cadastro-produtos` | Gerente, Cozinheiro, Garçom, Admin |
| Pagamento | `/pagamento` | Todos os perfis autenticados |

### Tela inicial por perfil

Ao fazer login, cada perfil é redirecionado automaticamente para a sua tela principal:

| Perfil | Tela inicial |
|---|---|
| Cozinheiro | `/kds` |
| Garçom | `/menu` |
| Caixa | `/financeiro` |
| Gerente / Admin | `/dashboard` |

---

## Estrutura de pastas

```
src/
├── app/             # Roteamento, guards e providers globais
├── core/
│   ├── api/         # Clientes HTTP por domínio (Axios)
│   └── constants/   # Perfis de acesso e constantes globais
├── features/        # Um diretório por funcionalidade
│   ├── auth/        # Login, landing e redefinição de senha
│   ├── dashboard/   # KPIs e gráficos gerenciais
│   ├── menu/        # Atendimento, comandas e delivery
│   ├── kds/         # Monitor de preparo em tempo real
│   ├── stock/       # Insumos, movimentações e relatórios
│   ├── financial/   # Caixa e relatório financeiro
│   ├── products/    # Cadastro de produtos
│   ├── recipes/     # Fichas técnicas
│   └── users/       # Gestão de usuários
├── shared/          # Componentes, hooks e utilitários reutilizáveis
└── styles/          # Design system (tokens de cor, tipografia e componentes base)
```

---

## Autenticação

O controle de acesso usa **JWT**. O token de acesso fica em memória via Zustand — nunca no `localStorage` — e o refresh token mantém a sessão ativa entre recarregamentos. Ao expirar a sessão ou ao fazer logout, o usuário é redirecionado automaticamente para a página inicial.

---

## Licença

Projeto acadêmico — Universidade de Mogi das Cruzes (UMC).

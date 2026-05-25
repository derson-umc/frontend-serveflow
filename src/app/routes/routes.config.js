import { lazy } from 'react';
import { ROLES, GERENTE_ROLES, KDS_ROLES, CAIXA_ROLES } from '@core/constants/roles';

const Landing        = lazy(() => import('@features/auth/landing'));
const Login          = lazy(() => import('@features/auth'));
const ChangePassword = lazy(() => import('@features/auth/change-password'));
const Dashboard      = lazy(() => import('@features/dashboard'));
const Menu           = lazy(() => import('@features/menu'));
const Payment        = lazy(() => import('@features/menu/payment'));
const Kds            = lazy(() => import('@features/kds'));
const Stock          = lazy(() => import('@features/stock'));
const Financial      = lazy(() => import('@features/financial'));
const Recipes        = lazy(() => import('@features/recipes'));
const Products       = lazy(() => import('@features/products'));
const UserManagement = lazy(() => import('@features/users/management'));
const Users          = lazy(() => import('@features/users/list'));
const Register       = lazy(() => import('@features/users/register'));

export {
  Landing,
  Login,
  ChangePassword,
  Dashboard,
  Menu,
  Payment,
  Kds,
  Stock,
  Financial,
  Recipes,
  Products,
  UserManagement,
  Users,
  Register,
};

export const ROUTES = [
  { path: '/',                 component: Landing,        public: true },
  { path: '/login',            component: Login,          public: true },
  { path: '/profile/senha',    component: ChangePassword, roles: null },
  { path: '/menu',             component: Menu,           roles: [ROLES.ROOT, ROLES.ADMIN, ROLES.GERENTE, ROLES.GARCON] },
  { path: '/kds',              component: Kds,            roles: KDS_ROLES },
  { path: '/ficha-tecnica',    component: Recipes,        roles: GERENTE_ROLES },
  { path: '/pagamento',        component: Payment,        roles: null },
  { path: '/estoque',          component: Stock,          roles: GERENTE_ROLES },
  { path: '/financeiro',       component: Financial,      roles: CAIXA_ROLES },
  { path: '/dashboard',        component: Dashboard,      roles: GERENTE_ROLES },
  { path: '/cadastro',         component: Register,       roles: GERENTE_ROLES },
  { path: '/cadastro-produtos',component: Products,       roles: KDS_ROLES },
  { path: '/gestao-usuarios',  component: UserManagement, roles: GERENTE_ROLES },
  { path: '/usuarios',         component: Users,          roles: null },
];

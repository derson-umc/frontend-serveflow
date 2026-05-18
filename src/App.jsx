import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ToastProvider } from './components/ui/Toast';
import RoleRoute from './routes/RoleRoute';
import { Loading } from './components/ui/Loading';
import { useAuthStore } from './store/useAuthStore';

/* ── Lazy page imports ──────────────────────────────────── */
const Entrada = lazy(() => import('./pages/Entrada'));
const Login = lazy(() => import('./pages/Login'));
const ChangePassword = lazy(() => import('./pages/ChangePassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Pagamento = lazy(() => import('./pages/Pagamento'));
const Estoque = lazy(() => import('./pages/Estoque'));
const Financeiro = lazy(() => import('./pages/Financeiro'));
const Cadastro = lazy(() => import('./pages/Cadastro'));
const Menu = lazy(() => import('./pages/Menu'));
const Kds = lazy(() => import('./pages/Kds'));
const FichaTecnica = lazy(() => import('./pages/FichaTecnica'));
const CadastroProdutos = lazy(() => import('./pages/CadastroProdutos'));
const GestaoUsuarios = lazy(() => import('./pages/GestaoUsuarios'));

/* ── Logout listener (dispatched by API client on 401) ──── */
function AuthLogoutListener() {
  const signOut = useAuthStore((s) => s.signOut);
  const navigate = useNavigate();

  useEffect(() => {
    function handleLogout() {
      signOut();
      navigate('/login', { replace: true });
    }
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [signOut, navigate]);

  return null;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Entrada />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/profile/senha"
          element={<RoleRoute><ChangePassword /></RoleRoute>}
        />

        <Route
          path="/menu"
          element={
            <RoleRoute roles={['root', 'admin', 'gerente', 'garcon', 'cozinheiro']}>
              <Menu />
            </RoleRoute>
          }
        />

        <Route
          path="/kds"
          element={
            <RoleRoute roles={['root', 'admin', 'gerente', 'cozinheiro']}>
              <Kds />
            </RoleRoute>
          }
        />

        <Route
          path="/ficha-tecnica"
          element={
            <RoleRoute roles={['root', 'admin', 'gerente']}>
              <FichaTecnica />
            </RoleRoute>
          }
        />

        <Route
          path="/pagamento"
          element={<RoleRoute><Pagamento /></RoleRoute>}
        />

        <Route
          path="/estoque"
          element={
            <RoleRoute roles={['root', 'admin', 'gerente']}>
              <Estoque />
            </RoleRoute>
          }
        />

        <Route
          path="/financeiro"
          element={
            <RoleRoute roles={['root', 'admin', 'gerente', 'caixa']}>
              <Financeiro />
            </RoleRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <RoleRoute roles={['root', 'admin', 'gerente']}>
              <Dashboard />
            </RoleRoute>
          }
        />

        <Route
          path="/cadastro"
          element={
            <RoleRoute roles={['root', 'admin', 'gerente']}>
              <Cadastro />
            </RoleRoute>
          }
        />

        <Route
          path="/cadastro-produtos"
          element={
            <RoleRoute roles={['root', 'admin', 'gerente']}>
              <CadastroProdutos />
            </RoleRoute>
          }
        />

        <Route
          path="/gestao-usuarios"
          element={
            <RoleRoute roles={['root', 'admin', 'gerente']}>
              <GestaoUsuarios />
            </RoleRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthLogoutListener />
      <ToastProvider />
      <Suspense fallback={<Loading fullPage message="Carregando..." />}>
        <AnimatedRoutes />
      </Suspense>
    </BrowserRouter>
  );
}

export default App;

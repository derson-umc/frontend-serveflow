import { Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ToastProvider } from '@shared/components/feedback/Toast';
import { Loading } from '@shared/components/feedback/Loading';
import { ErrorBoundary } from '@shared/components/ErrorBoundary';
import RoleRoute from './routes/RoleRoute';
import { AuthListener } from './providers/AuthListener';
import {
  Landing, Login, ChangePassword, Dashboard,
  Menu, Payment, Kds, Stock, Financial,
  Recipes, Products, UserManagement, Users, Register,
} from './routes/routes.config';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/"      element={<Landing />} />
        <Route path="/login" element={<Login />} />

        <Route path="/profile/senha" element={
          <RoleRoute><ChangePassword /></RoleRoute>
        } />

        <Route path="/menu" element={
          <RoleRoute roles={['root', 'admin', 'gerente', 'garcon']}><Menu /></RoleRoute>
        } />

        <Route path="/kds" element={
          <RoleRoute roles={['root', 'admin', 'gerente', 'cozinheiro']}><Kds /></RoleRoute>
        } />

        <Route path="/ficha-tecnica" element={
          <RoleRoute roles={['root', 'admin', 'gerente']}><Recipes /></RoleRoute>
        } />

        <Route path="/pagamento" element={
          <RoleRoute><Payment /></RoleRoute>
        } />

        <Route path="/estoque" element={
          <RoleRoute roles={['root', 'admin', 'gerente']}><Stock /></RoleRoute>
        } />

        <Route path="/financeiro" element={
          <RoleRoute roles={['root', 'admin', 'gerente', 'caixa']}><Financial /></RoleRoute>
        } />

        <Route path="/dashboard" element={
          <RoleRoute roles={['root', 'admin', 'gerente']}><Dashboard /></RoleRoute>
        } />

        <Route path="/cadastro" element={
          <RoleRoute roles={['root', 'admin', 'gerente']}><Register /></RoleRoute>
        } />

        <Route path="/cadastro-produtos" element={
          <RoleRoute roles={['root', 'admin', 'gerente', 'cozinheiro']}><Products /></RoleRoute>
        } />

        <Route path="/gestao-usuarios" element={
          <RoleRoute roles={['root', 'admin', 'gerente']}><UserManagement /></RoleRoute>
        } />

        <Route path="/usuarios" element={
          <RoleRoute><Users /></RoleRoute>
        } />

        <Route path="*" element={<RoleRoute><Menu /></RoleRoute>} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthListener />
      <ToastProvider />
      <ErrorBoundary>
        <Suspense fallback={<Loading fullPage message="Carregando..." />}>
          <AnimatedRoutes />
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ChangePassword from "./pages/ChangePassword";
import Dashboard from "./pages/Dashboard";
import Pedido from "./pages/Pedido";
import Estoque from "./pages/Estoque";
import Financeiro from "./pages/Financeiro";
import Vendas from "./pages/Vendas";
import Cadastro from "./pages/Cadastro";
import Menu from "./pages/Menu";
import RoleRoute from "./routes/RoleRoute";
import { CartProvider } from "./context/CartContext";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route
          path="/profile/senha"
          element={<RoleRoute><ChangePassword /></RoleRoute>}
        />

        <Route
          path="/menu"
          element={
            <RoleRoute roles={["root", "admin", "garcon"]}>
              <Menu />
            </RoleRoute>
          }
        />

        <Route
          path="/pedido"
          element={<RoleRoute><Pedido /></RoleRoute>}
        />

        <Route
          path="/vendas"
          element={
            <RoleRoute roles={["root", "admin", "caixa"]}>
              <Vendas />
            </RoleRoute>
          }
        />

        <Route
          path="/estoque"
          element={
            <RoleRoute roles={["root", "admin"]}>
              <Estoque />
            </RoleRoute>
          }
        />

        <Route
          path="/financeiro"
          element={
            <RoleRoute roles={["root", "admin"]}>
              <Financeiro />
            </RoleRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <RoleRoute roles={["root", "admin"]}>
              <Dashboard />
            </RoleRoute>
          }
        />

        <Route
          path="/cadastro"
          element={
            <RoleRoute roles={["root", "admin"]}>
              <Cadastro />
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
      <CartProvider>
        <AnimatedRoutes />
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;

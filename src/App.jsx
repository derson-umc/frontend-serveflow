import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Login from "./pages/Login";
import ChangePassword from "./pages/ChangePassword";
import Dashboard from "./pages/Dashboard";
import Pedido from "./pages/Pedido";
import Estoque from "./pages/Estoque";
import Financeiro from "./pages/Financeiro";
import Vendas from "./pages/Vendas";
import Cadastro from "./pages/Cadastro";
import Usuarios from "./pages/Usuarios";
import Menu from "./pages/Menu";
import RoleRoute from "./routes/RoleRoute";
import { CartProvider } from "./context/CartContext";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Login />} />

        <Route
          path="/profile/senha"
          element={<RoleRoute><ChangePassword /></RoleRoute>}
        />

        <Route
          path="/menu"
          element={
            <RoleRoute roles={["admin", "gerente", "garcon", "cozinheiro"]}>
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
            <RoleRoute roles={["admin", "gerente", "caixa"]}>
              <Vendas />
            </RoleRoute>
          }
        />

        <Route
          path="/estoque"
          element={
            <RoleRoute roles={["admin", "gerente"]}>
              <Estoque />
            </RoleRoute>
          }
        />

        <Route
          path="/financeiro"
          element={
            <RoleRoute roles={["admin", "gerente", "caixa"]}>
              <Financeiro />
            </RoleRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <RoleRoute roles={["admin", "gerente"]}>
              <Dashboard />
            </RoleRoute>
          }
        />

        <Route
          path="/cadastro"
          element={
            <RoleRoute roles={["admin", "gerente"]}>
              <Cadastro />
            </RoleRoute>
          }
        />

        <Route
          path="/usuarios"
          element={
            <RoleRoute roles={["admin", "gerente"]}>
              <Usuarios />
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

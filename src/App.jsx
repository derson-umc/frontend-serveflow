import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Pedido from "./pages/Pedido";
import Estoque from "./pages/Estoque";
import Financeiro from "./pages/Financeiro";
import Vendas from "./pages/Vendas";
import Cadastro from "./pages/Cadastro";
import PrivateRoute from "./routes/PrivateRoute";
import AdminRoute from "./routes/AdminRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />       
        <Route path="/pedido" element={<PrivateRoute><Pedido /></PrivateRoute>} />       
        <Route path="/vendas" element={<AdminRoute roles={["root", "admin", "caixa"]}><Vendas /></AdminRoute>} />       
        <Route path="/estoque"    element={<AdminRoute><Estoque /></AdminRoute>} />
        <Route path="/financeiro" element={<AdminRoute><Financeiro /></AdminRoute>} />
        <Route path="/dashboard"  element={<AdminRoute><Dashboard /></AdminRoute>} />
        <Route path="/cadastro"   element={<AdminRoute><Cadastro /></AdminRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { useState } from "react";
import { api } from "../services/api";
import Sidebar from "../components/Sidebar";

const ROLES = [
  { value: "gerente", label: "Gerente", desc: "Gestão e supervisão"},
  { value: "caixa", label: "Caixa", desc: "Pagamentos e vendas"},
  { value: "garcon", label: "Garçom", desc: "Atendimento e pedidos" },
  { value: "cozinheiro", label: "Cozinheiro", desc: "Preparo e produção"}
];

export default function Cadastro() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("caixa");
  const [jobposition, setJobposition] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!username.trim() || !password.trim() || !jobposition.trim()) return setError("Preencha todos os campos.");
    if (password.length < 8) return setError("Senha deve ter ao menos 8 caracteres.");
    try {
      setLoading(true);
      await api.post("/users", { username: username.trim(), password, role: role.toUpperCase(), jobposition: jobposition.trim() });
      setSuccess(`Usuário "${username}" cadastrado com sucesso!`);
      setUsername(""); setPassword(""); setRole("caixa"); setJobposition("");
    } catch (err) {
      setError(err?.response?.data?.error || "Erro ao cadastrar.");
    } finally { setLoading(false); }
  };

  return (
    <div className="relative flex flex-col min-h-screen" style={{ background: "#080503" }}>
      <Sidebar />
      <div className="relative flex-1 flex items-center justify-center py-10 px-4">
        <div className="w-full max-w-md">
          <div className="mb-8"><div className="flex items-center gap-3 mb-1"><div className="w-1 h-7 rounded-full" style={{ background: "linear-gradient(180deg, #f07040, #e46033)" }} /><h1 className="text-3xl font-bold tracking-tight" style={{ color: "#fff1f2" }}>Cadastrar Usuário</h1></div><p className="text-sm ml-4" style={{ color: "#7a3518" }}>Criar e gerenciar usuários do sistema</p></div>
          <div className="rounded-2xl p-8 shadow-2xl" style={{ background: "rgba(10, 2, 4, 0.92)", border: "1px solid rgba(228,96,51,0.18)" }}>
            {error && <div className="mb-5 px-3 py-2.5 rounded-lg" style={{ background: "rgba(228,96,51,0.08)", border: "1px solid rgba(228,96,51,0.28)" }}><p className="text-sm" style={{ color: "#f87171" }}>{error}</p></div>}
            {success && <div className="mb-5 px-3 py-2.5 rounded-lg" style={{ background: "rgba(52,211,153,0.07)", border: "1px solid rgba(52,211,153,0.2)" }}><p className="text-sm" style={{ color: "#4ade80" }}>{success}</p></div>}
            <form onSubmit={handleRegister}>
              <input className="w-full px-4 py-3 rounded-xl text-sm mb-4" placeholder="Usuário" value={username} onChange={(e) => setUsername(e.target.value)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(228,96,51,0.18)", color: "#fff1f2" }} />
              <input type="password" className="w-full px-4 py-3 rounded-xl text-sm mb-4" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(228,96,51,0.18)", color: "#fff1f2" }} />
              <div className="grid grid-cols-2 gap-3 mb-4">
                {ROLES.map(({ value, label, desc, icon }) => (
                  <button key={value} type="button" onClick={() => setRole(value)} className="text-left p-3 rounded-xl" style={{ background: role === value ? "rgba(228,96,51,0.12)" : "rgba(255,255,255,0.025)", border: role === value ? "1.5px solid #e46033" : "1.5px solid rgba(228,96,51,0.12)" }}>
                    <div className="flex items-center gap-2 mb-1" style={{ color: role === value ? "#f07040" : "#7a3518" }}><span>{icon}</span><span className="font-semibold text-sm">{label}</span></div>
                    <p className="text-xs leading-tight" style={{ color: role === value ? "#fecdd3" : "#4a2010" }}>{desc}</p>
                  </button>
                ))}
              </div>
              <input className="w-full px-4 py-3 rounded-xl text-sm mb-4" placeholder="Cargo (ex: Garçom noturno)" value={jobposition} onChange={(e) => setJobposition(e.target.value)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(228,96,51,0.18)", color: "#fff1f2" }} />
              <button type="submit" disabled={loading} className="w-full py-3 rounded-xl font-bold text-sm mt-1" style={{ background: "linear-gradient(135deg, #e46033 0%, #b84020 100%)", color: "#ffffff" }}>{loading ? "Cadastrando..." : "Cadastrar Usuário"}</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
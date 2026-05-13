import { useState } from "react";
import { api } from "../services/api";
import Sidebar from "../components/Sidebar";

const G  = "#2E7D32";
const GD = "#1B5E20";
const GF = "#E8F5E9";
const O  = "#F57C00";
const D  = "#424242";
const M  = "#757575";
const B  = "#E0E0E0";
const W  = "#FFFFFF";

const ROLES = [
  { value: "gerente",    label: "Gerente",    desc: "Acesso administrativo",  icon: "🏢" },
  { value: "caixa",      label: "Caixa",       desc: "Pagamentos e vendas",    icon: "💳" },
  { value: "garcon",     label: "Garçom",      desc: "Atendimento e pedidos",  icon: "🍽️" },
  { value: "cozinheiro", label: "Cozinheiro",  desc: "Preparo e produção",     icon: "👨‍🍳" },
];

export default function Cadastro() {
  const [username,   setUsername]   = useState("");
  const [password,   setPassword]   = useState("");
  const [role,       setRole]       = useState("gerente");
  const [jobposition,setJobposition]= useState("");
  const [error,      setError]      = useState("");
  const [success,    setSuccess]    = useState("");
  const [loading,    setLoading]    = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!username.trim() || !password.trim() || !jobposition.trim())
      return setError("Preencha todos os campos.");
    if (password.length < 8)
      return setError("Senha deve ter ao menos 8 caracteres.");
    try {
      setLoading(true);
      await api.post("/users", { username: username.trim(), password, role: role.toUpperCase(), jobposition: jobposition.trim() });
      setSuccess(`Usuário "${username}" cadastrado com sucesso!`);
      setUsername(""); setPassword(""); setRole("gerente"); setJobposition("");
    } catch (err) {
      setError(err?.response?.data?.error || "Erro ao cadastrar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#F5F5F5" }}>
      <Sidebar />
      <div className="flex-1 flex items-center justify-center py-10 px-4">
        <div className="w-full max-w-md">

          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1 h-7 rounded-full" style={{ background: `linear-gradient(180deg, ${O}, ${G})` }} />
              <h1 className="text-2xl font-bold" style={{ color: D }}>Cadastrar Usuário</h1>
            </div>
            <p className="text-sm ml-4" style={{ color: M }}>Criar e gerenciar usuários do sistema</p>
          </div>

          <div className="rounded-2xl p-7 shadow-sm"
            style={{ background: W, border: `1px solid ${B}`, boxShadow: "0 4px 20px rgba(0,0,0,0.09)" }}>

            {error && (
              <div className="mb-4 px-3 py-2.5 rounded-xl text-sm"
                style={{ background: "#FFEBEE", border: "1px solid #EF9A9A", color: "#C62828" }}>
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 px-3 py-2.5 rounded-xl text-sm"
                style={{ background: GF, border: "1px solid #A5D6A7", color: G }}>
                {success}
              </div>
            )}

            <form onSubmit={handleRegister}>
              <div className="mb-4">
                <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: M }}>Usuário</label>
                <input
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  placeholder="Digite o nome de usuário"
                  value={username} onChange={(e) => setUsername(e.target.value)}
                  style={{ background: "#FAFAFA", border: `1.5px solid ${B}`, color: D }}
                />
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: M }}>Senha</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  placeholder="Mínimo 8 caracteres"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  style={{ background: "#FAFAFA", border: `1.5px solid ${B}`, color: D }}
                />
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: M }}>Perfil</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {ROLES.map(({ value, label, desc, icon }) => (
                    <button key={value} type="button" onClick={() => setRole(value)}
                      className="text-left p-3 rounded-xl transition-all"
                      style={{
                        background: role === value ? GF : "#FAFAFA",
                        border: `1.5px solid ${role === value ? G : B}`,
                      }}>
                      <div className="flex items-center gap-2 mb-1">
                        <span style={{ fontSize: 16 }}>{icon}</span>
                        <span className="font-semibold text-sm" style={{ color: role === value ? G : D }}>{label}</span>
                      </div>
                      <p className="text-xs" style={{ color: M }}>{desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: M }}>Cargo</label>
                <input
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  placeholder="Ex: Garçom noturno"
                  value={jobposition} onChange={(e) => setJobposition(e.target.value)}
                  style={{ background: "#FAFAFA", border: `1.5px solid ${B}`, color: D }}
                />
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-sm transition-all"
                style={{
                  background: G, color: W, border: "none",
                  boxShadow: "0 4px 16px rgba(46,125,50,0.3)",
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = GD; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = G; }}>
                {loading ? "Cadastrando..." : "Cadastrar Usuário"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

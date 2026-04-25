import { useState } from "react";
import { api } from "../services/api";
import Sidebar from "../components/Sidebar";

const ROLES = [
  {
    value: "caixa",
    label: "Caixa",
    desc: "Pagamentos e vendas",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  {
    value: "garcon",
    label: "Garçom",
    desc: "Atendimento e pedidos",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    value: "cozinheiro",
    label: "Cozinheiro",
    desc: "Preparo e produção",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-3-3h6M6 10h.01M6 14h.01M10 10h.01M10 14h.01M14 10h.01M3 21h18M3 10a2 2 0 002-2V6a2 2 0 012-2h10a2 2 0 012 2v2a2 2 0 002 2H3z" />
      </svg>
    ),
  },
];

const USERNAME_MAX = 64;
const USERNAME_MIN = 3;
const PASSWORD_MAX = 128;
const PASSWORD_MIN = 8;

const VALID_ROLES = ROLES.map((r) => r.value);

function sanitizeBackendMessage(msg) {
  if (typeof msg !== "string") return null;
  const safe = msg.trim().slice(0, 160);
  if (/<[^>]+>/.test(safe)) return null;
  return safe || null;
}

export default function Cadastro() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("caixa");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const u = username.trim();
    const p = password;

    if (!u || !p) {
      setError("Preencha todos os campos.");
      return;
    }
    if (u.length < USERNAME_MIN) {
      setError(`Usuário deve ter ao menos ${USERNAME_MIN} caracteres.`);
      return;
    }
    if (u.length > USERNAME_MAX) {
      setError("Usuário muito longo (máx. 64 caracteres).");
      return;
    }
    if (p.length < PASSWORD_MIN) {
      setError(`Senha deve ter ao menos ${PASSWORD_MIN} caracteres.`);
      return;
    }
    if (p.length > PASSWORD_MAX) {
      setError("Senha muito longa.");
      return;
    }
    if (!/[0-9]/.test(p)) {
      setError("A senha deve conter pelo menos um número.");
      return;
    }
    if (!VALID_ROLES.includes(role)) {
      setError("Cargo inválido.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/register", { username: u, password: p, role: role.toUpperCase() });
      const roleLabel = ROLES.find((r) => r.value === role)?.label ?? role;
      setSuccess(`Usuário "${u}" cadastrado como ${roleLabel} com sucesso!`);
      setUsername("");
      setPassword("");
      setRole("caixa");
    } catch (err) {
      const rawMsg = err?.response?.data?.message;
      setError(sanitizeBackendMessage(rawMsg) || "Erro ao cadastrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen" style={{ background: "#080404" }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 85% 75% at 50% 45%, #1a0008 0%, #0d0204 40%, #080404 100%)",
        }}
      />
      
      <div
        className="absolute pointer-events-none animate-float-1"
        style={{
          width: 400, height: 400, top: "5%", right: "-8%",
          background: "radial-gradient(circle, rgba(225,29,72,0.1) 0%, transparent 70%)",
          filter: "blur(50px)", borderRadius: "50%",
        }}
      />
      <Sidebar />

      <div className="relative flex-1 flex items-center justify-center py-10 px-4 page-enter">
        <div className="w-full max-w-md">
         
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-1">
              <div
                className="w-1 h-7 rounded-full"
                style={{ background: "linear-gradient(180deg, #f43f5e, #e11d48)" }}
              />
              <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#fff1f2" }}>
                Cadastrar Usuário
              </h1>
            </div>
            <p className="text-sm ml-4" style={{ color: "#6b2130" }}>
              Criar e gerenciar usuários do sistema
            </p>
          </div>

          <div className="flex items-center gap-3 mb-7">
            <div className="flex-1 h-px" style={{ background: "rgba(225,29,72,0.15)" }} />
            <div className="w-1.5 h-1.5 rounded-full animate-pulse-glow" style={{ background: "rgba(225,29,72,0.6)" }} />
            <div className="flex-1 h-px" style={{ background: "rgba(225,29,72,0.15)" }} />
          </div>

          
          <div
            className="rounded-2xl p-8 shadow-2xl"
            style={{
              background: "rgba(10, 2, 4, 0.92)",
              border: "1px solid rgba(225,29,72,0.18)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.7), inset 0 1px 0 rgba(225,29,72,0.07)",
            }}
          >
            {error && (
              <div
                className="flex items-center gap-2 mb-5 px-3 py-2.5 rounded-lg"
                style={{
                  background: "rgba(225,29,72,0.08)",
                  border: "1px solid rgba(225,29,72,0.28)",
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="#f43f5e">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm" style={{ color: "#f87171" }}>{error}</p>
              </div>
            )}
            {success && (
              <div
                className="flex items-center gap-2 mb-5 px-3 py-2.5 rounded-lg"
                style={{
                  background: "rgba(52,211,153,0.07)",
                  border: "1px solid rgba(52,211,153,0.2)",
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="#4ade80">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm" style={{ color: "#4ade80" }}>{success}</p>
              </div>
            )}

            <form onSubmit={handleRegister} className="flex flex-col gap-4" noValidate>
              <div>
                <label
                  className="block text-xs font-semibold mb-1.5 tracking-wider uppercase"
                  style={{ color: "#6b2130" }}
                >
                  Usuário
                </label>
                <input
                  className="input-red w-full px-4 py-3 rounded-xl text-sm"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(225,29,72,0.18)",
                    color: "#fff1f2",
                  }}
                  placeholder="ex: joao, maria"
                  autoComplete="username"
                  maxLength={USERNAME_MAX}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div>
                <label
                  className="block text-xs font-semibold mb-1.5 tracking-wider uppercase"
                  style={{ color: "#6b2130" }}
                >
                  Senha
                </label>
                <input
                  type="password"
                  className="input-red w-full px-4 py-3 rounded-xl text-sm"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(225,29,72,0.18)",
                    color: "#fff1f2",
                  }}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  maxLength={PASSWORD_MAX}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <p className="text-xs mt-1.5" style={{ color: "#4a1525" }}>
                  Mín. 8 caracteres, ao menos um número
                </p>
              </div>

              <div>
                <label
                  className="block text-xs font-semibold mb-2 tracking-wider uppercase"
                  style={{ color: "#6b2130" }}
                >
                  Cargo
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {ROLES.map(({ value, label, desc, icon }) => {
                    const selected = role === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRole(value)}
                        className="role-card text-left p-3 rounded-xl"
                        style={{
                          background: selected
                            ? "rgba(225,29,72,0.12)"
                            : "rgba(255,255,255,0.025)",
                          border: selected
                            ? "1.5px solid #e11d48"
                            : "1.5px solid rgba(225,29,72,0.12)",
                          boxShadow: selected
                            ? "0 0 18px rgba(225,29,72,0.2)"
                            : "none",
                        }}
                      >
                        <div
                          className="flex items-center gap-2 mb-1"
                          style={{ color: selected ? "#f43f5e" : "#6b2130" }}
                        >
                          {icon}
                          <span className="font-semibold text-sm">{label}</span>
                        </div>
                        <p
                          className="text-xs leading-tight"
                          style={{ color: selected ? "#fecdd3" : "#4a1525" }}
                        >
                          {desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-shine w-full py-3 rounded-xl font-bold text-sm mt-1 disabled:opacity-50 tracking-wider uppercase"
                style={{
                  background: "linear-gradient(135deg, #e11d48 0%, #9f1239 100%)",
                  color: "#ffffff",
                  boxShadow: "0 4px 24px rgba(225,29,72,0.3)",
                  letterSpacing: "0.1em",
                }}
              >
                {loading ? "Cadastrando..." : "Cadastrar Usuário"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

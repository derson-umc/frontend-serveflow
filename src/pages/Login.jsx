import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../AuthContext";
import Logo from "../components/Logo";
import ParticleCanvas from "../components/ParticleCanvas";

const USERNAME_MAX = 64;
const USERNAME_MIN = 3;
const PASSWORD_MAX = 128;
const PASSWORD_MIN = 6;

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [shaking, setShaking] = useState(false);

  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro("");

    const u = username.trim();
    const p = password;

    if (!u || !p) {
      setErro("Preencha todos os campos.");
      triggerShake();
      return;
    }
    if (u.length < USERNAME_MIN) {
      setErro(`Usuário deve ter ao menos ${USERNAME_MIN} caracteres.`);
      triggerShake();
      return;
    }
    if (u.length > USERNAME_MAX) {
      setErro("Usuário muito longo.");
      triggerShake();
      return;
    }
    if (p.length < PASSWORD_MIN) {
      setErro(`Senha deve ter ao menos ${PASSWORD_MIN} caracteres.`);
      triggerShake();
      return;
    }
    if (p.length > PASSWORD_MAX) {
      setErro("Senha muito longa.");
      triggerShake();
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/login", { username: u, password: p });
      const jwt = response.data.token;
      signIn(jwt);
      navigate("/dashboard");
    } catch {
      setErro("Usuário ou senha inválidos.");
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: "#080404" }}
    >
     
      <ParticleCanvas />

     
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 35%, #1a0008 0%, #0d0204 45%, #080404 100%)",
        }}
      />

   
      <div
        className="absolute pointer-events-none animate-float-1 animate-pulse-glow"
        style={{
          width: 520, height: 520,
          top: "-10%", left: "-8%",
          background: "radial-gradient(circle, rgba(225,29,72,0.12) 0%, transparent 70%)",
          filter: "blur(60px)",
          borderRadius: "50%",
        }}
      />
      <div
        className="absolute pointer-events-none animate-float-2"
        style={{
          width: 380, height: 380,
          bottom: "-5%", right: "5%",
          background: "radial-gradient(circle, rgba(244,63,94,0.1) 0%, transparent 70%)",
          filter: "blur(50px)",
          borderRadius: "50%",
        }}
      />
      <div
        className="absolute pointer-events-none animate-float-3"
        style={{
          width: 260, height: 260,
          top: "30%", right: "-5%",
          background: "radial-gradient(circle, rgba(159,18,57,0.12) 0%, transparent 70%)",
          filter: "blur(40px)",
          borderRadius: "50%",
        }}
      />

      
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgba(225,29,72,0.5), transparent)" }}
      />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-56 h-20 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at top, rgba(225,29,72,0.15) 0%, transparent 70%)",
        }}
      />

      
      <div className="relative z-10 w-full max-w-sm px-4 flex flex-col items-center animate-slide-up">
        
        <div className="mb-5">
          <Logo size={100} showText={false} />
        </div>

       
        <h1
          className="text-4xl font-bold mb-1 text-neon-red"
          style={{ color: "#fff1f2", letterSpacing: "-0.02em" }}
        >
          Serve<span style={{ color: "#f43f5e" }}>Flow</span>
        </h1>
        <p
          className="text-xs uppercase mb-8"
          style={{ color: "#6b2130", letterSpacing: "0.20em" }}
        >
          Sistema de Restaurante
        </p>

        
        <div className="flex items-center gap-3 w-full mb-7">
          <div className="flex-1 h-px" style={{ background: "rgba(225,29,72,0.18)" }} />
          <div className="w-1.5 h-1.5 rounded-full animate-pulse-glow" style={{ background: "rgba(225,29,72,0.7)" }} />
          <div className="flex-1 h-px" style={{ background: "rgba(225,29,72,0.18)" }} />
        </div>

        
        <div
          className={`w-full rounded-2xl p-8 shadow-2xl animate-border-breathe ${shaking ? "animate-shake" : ""}`}
          style={{
            background: "rgba(10, 2, 4, 0.92)",
            border: "1px solid rgba(225,29,72,0.22)",
            backdropFilter: "blur(24px)",
            boxShadow:
              "0 24px 64px rgba(0,0,0,0.75), inset 0 1px 0 rgba(225,29,72,0.08), 0 0 40px rgba(225,29,72,0.05)",
          }}
        >
          <h2
            className="text-base font-semibold mb-6 tracking-wide"
            style={{ color: "#6b2130", letterSpacing: "0.08em" }}
          >
            ACESSO AO SISTEMA
          </h2>

          {erro && (
            <div
              className="flex items-center gap-2 mb-4 px-3 py-2.5 rounded-lg"
              style={{
                background: "rgba(225,29,72,0.08)",
                border: "1px solid rgba(225,29,72,0.28)",
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="#f43f5e">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm" style={{ color: "#f87171" }}>{erro}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4" noValidate>
            <div>
              <label
                className="block text-xs font-semibold mb-1.5 tracking-wider uppercase"
                style={{ color: "#6b2130" }}
              >
                Usuário
              </label>
              <input
                className="input-red w-full px-4 py-3 rounded-xl text-sm transition-all"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(225,29,72,0.18)",
                  color: "#fff1f2",
                }}
                placeholder="Digite seu usuário"
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
                className="input-red w-full px-4 py-3 rounded-xl text-sm transition-all"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(225,29,72,0.18)",
                  color: "#fff1f2",
                }}
                placeholder="••••••••"
                autoComplete="current-password"
                maxLength={PASSWORD_MAX}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-shine w-full py-3 rounded-xl font-bold text-sm mt-1 disabled:opacity-50 tracking-wider uppercase"
              style={{
                background: "linear-gradient(135deg, #e11d48 0%, #9f1239 100%)",
                color: "#ffffff",
                boxShadow: "0 4px 24px rgba(225,29,72,0.35)",
                letterSpacing: "0.1em",
              }}
            >
              {loading ? "Acessando..." : "Acessar Sistema"}
            </button>
          </form>
        </div>

        
        <p
          className="mt-6 text-xs"
          style={{ color: "#3d0f18", letterSpacing: "0.06em" }}
        >
          Acesso restrito · ServeFlow v1.0
        </p>
      </div>
    </div>
  );
}

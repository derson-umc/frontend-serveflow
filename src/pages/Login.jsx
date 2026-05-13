import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../services/api";
import { useAuth } from "../AuthContext";
import { validateUsername, validatePassword, USERNAME_MAX, PASSWORD_MAX } from "../utils/validators";

const G  = "#2E7D32";
const GD = "#1B5E20";
const O  = "#F57C00";
const D  = "#424242";
const M  = "#757575";
const W  = "#FFFFFF";
const B  = "#E0E0E0";

const greeting = () => {
  const h = new Date().getHours();
  if (h < 5)  return "Boa madrugada";
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
};

const STRENGTH_COLORS = ["#E0E0E0", "#EF9A9A", "#EF5350", "#43A047", "#2E7D32", "#1B5E20"];

export default function Login() {
  const navigate = useNavigate();
  const { signIn, isAuthenticated } = useAuth();

  const [username, setUsername]         = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsOn, setCapsOn]             = useState(false);
  const [erro, setErro]                 = useState("");
  const [loading, setLoading]           = useState(false);
  const [shaking, setShaking]           = useState(false);
  const [touched, setTouched]           = useState({ username: false, password: false });

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  const userCheck = useMemo(() => validateUsername(username), [username]);
  const passCheck = useMemo(() => validatePassword(password), [password]);
  const canSubmit = userCheck.valid && passCheck.valid && !loading;

  const triggerShake = () => { setShaking(true); setTimeout(() => setShaking(false), 500); };

  const handleKeyEvents = (e) => {
    if (typeof e.getModifierState === "function") setCapsOn(e.getModifierState("CapsLock"));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro("");
    setTouched({ username: true, password: true });
    if (!canSubmit) { setErro(!userCheck.valid ? userCheck.hint : passCheck.hint); triggerShake(); return; }
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { username: username.trim(), password });
      signIn(res.data.token, { id: res.data.id });
      navigate("/dashboard");
    } catch (err) {
      const s = err?.response?.status;
      setErro(s === 401 || s === 404 || s === 422 ? "Usuário ou senha inválidos." : "Não foi possível conectar. Tente novamente.");
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#F5F5F5", fontFamily: "'Inter','Segoe UI',sans-serif" }}>

      {/* Left panel — brand */}
      <div className="hidden lg:flex flex-col items-center justify-center flex-shrink-0 w-[420px] relative overflow-hidden"
        style={{ background: `linear-gradient(160deg, ${G} 0%, ${GD} 100%)` }}>
        <div className="absolute rounded-full opacity-10" style={{ width: 420, height: 420, top: "-20%", left: "-20%", background: W }} />
        <div className="absolute rounded-full opacity-10" style={{ width: 280, height: 280, bottom: "-10%", right: "-15%", background: O }} />

        <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7, ease: [0.16,1,0.3,1] }}
          className="relative z-10 flex flex-col items-center text-center px-10">
          <img src="/logo.jpeg" alt="ServeFlow"
            style={{ width: 120, height: 120, borderRadius: "50%", objectFit: "cover", border: "4px solid rgba(255,255,255,0.25)", boxShadow: "0 8px 32px rgba(0,0,0,0.2)", marginBottom: 24 }} />
          <h2 className="text-3xl font-black mb-3" style={{ color: W, letterSpacing: "-0.02em" }}>BEM-VINDO!</h2>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, lineHeight: 1.75, maxWidth: 260 }}>
            Gerencie seu restaurante com agilidade e eficiência.
          </p>
          <div className="mt-8 flex items-center gap-2">
            <div className="w-8 h-1 rounded-full" style={{ background: O }} />
            <div className="w-3 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.3)" }} />
            <div className="w-3 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.3)" }} />
          </div>
        </motion.div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex justify-center mb-6 lg:hidden">
            <img src="/logo.jpeg" alt="ServeFlow"
              style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: `3px solid ${G}` }} />
          </div>

          <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15, duration: 0.6 }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: O, letterSpacing: "0.12em" }}>Acesso ao Sistema</p>
            <h1 className="font-extrabold mb-2" style={{ color: "#1a1a1a", fontSize: 40, lineHeight: 1.15, marginBottom: 12 }}>{greeting()}</h1>
            <p className="mb-6" style={{ color: "#555555", fontSize: 16, fontWeight: 500 }}>Faça seu login para continuar</p>
          </motion.div>

          <motion.div
            animate={shaking ? { x: [-8, 8, -5, 5, -2, 2, 0] } : {}}
            transition={{ duration: 0.5 }}
            className="rounded-2xl p-8"
            style={{ background: W, boxShadow: "0 4px 24px rgba(0,0,0,0.10)", border: `1px solid ${B}` }}
          >
            <AnimatePresence>
              {erro && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-4 text-sm"
                  style={{ background: "#FFEBEE", border: "1px solid #EF9A9A", color: "#C62828" }}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {erro}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleLogin} noValidate>
              {/* Username */}
              <div className="mb-4">
                <label className="block text-xs font-bold uppercase mb-2" style={{ color: "#555555", letterSpacing: "0.08em", fontSize: 13 }}>Usuário</label>
                <div className="relative">
                  <input
                    type="text" placeholder="Digite seu usuário"
                    autoComplete="username" maxLength={USERNAME_MAX}
                    value={username} onChange={(e) => setUsername(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, username: true }))}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: "#FAFAFA", color: D,
                      border: `1.5px solid ${(touched.username || username) && !userCheck.valid ? "#EF5350" : (touched.username || username) && userCheck.valid ? G : B}`,
                      paddingRight: 38,
                    }}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {(touched.username || username.length > 0) && (userCheck.valid ? <CheckIcon color={G} /> : <ErrorIcon />)}
                  </div>
                </div>
                <AnimatePresence>
                  {(touched.username || username) && userCheck.hint && (
                    <motion.p initial={{ opacity: 0, y: -3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="mt-1 text-xs" style={{ color: userCheck.valid ? G : "#EF5350" }}>
                      {userCheck.hint}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Password */}
              <div className="mb-5">
                <label className="block text-xs font-bold uppercase mb-2" style={{ color: "#555555", letterSpacing: "0.08em", fontSize: 13 }}>Senha</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"} placeholder="••••••••"
                    autoComplete="current-password" maxLength={PASSWORD_MAX}
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyEvents} onKeyUp={handleKeyEvents}
                    onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: "#FAFAFA", color: D,
                      border: `1.5px solid ${(touched.password || password) && !passCheck.valid ? "#EF5350" : (touched.password || password) && passCheck.valid ? G : B}`,
                      paddingRight: 68,
                    }}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button type="button" onClick={() => setShowPassword((v) => !v)}
                      style={{ background: "none", border: "none", color: M, cursor: "pointer", padding: 2 }}>
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                    {(touched.password || password.length > 0) && (passCheck.valid ? <CheckIcon color={G} /> : <ErrorIcon />)}
                  </div>
                </div>
                {password && (
                  <div className="flex gap-1 mt-2">
                    {[0,1,2,3,4].map((i) => (
                      <div key={i} className="flex-1 h-1 rounded-full transition-all"
                        style={{ background: i < passCheck.strength ? STRENGTH_COLORS[passCheck.strength] : "#E0E0E0" }} />
                    ))}
                  </div>
                )}
                <AnimatePresence>
                  {(touched.password || password) && passCheck.hint && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="mt-1 text-xs" style={{ color: passCheck.valid ? G : "#EF5350" }}>
                      {passCheck.hint}
                    </motion.p>
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {capsOn && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-1 mt-1 text-xs" style={{ color: O }}>
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 11l7-7 7 7M5 19h14" /></svg>
                      Caps Lock ativo
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center mb-5 -mt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" className="rounded" style={{ accentColor: G }} />
                  <span style={{ fontSize: 13, color: "#666666" }}>Lembrar-me</span>
                </label>
              </div>

              <motion.button
                type="submit" disabled={!canSubmit}
                whileHover={canSubmit ? { y: -2, boxShadow: "0 8px 24px rgba(46,125,50,0.45)" } : {}}
                whileTap={canSubmit ? { scale: 0.98 } : {}}
                className="w-full py-3 rounded-xl font-bold text-sm tracking-wide transition-all"
                style={{
                  background: canSubmit ? G : "#E0E0E0",
                  color: canSubmit ? W : M,
                  border: "none",
                  cursor: canSubmit ? "pointer" : "not-allowed",
                  boxShadow: canSubmit ? "0 4px 16px rgba(46,125,50,0.3)" : "none",
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner /> Acessando...
                  </span>
                ) : "Entrar no Sistema"}
              </motion.button>
            </form>
          </motion.div>

          <p className="text-center mt-5 text-xs" style={{ color: "#BDBDBD" }}>
            © 2026 ServeFlow v1.0
          </p>
        </div>
      </div>
    </div>
  );
}

function CheckIcon({ color }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color || "#2E7D32"} strokeWidth={2.4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;
}
function ErrorIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF5350" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}
function Eye() {
  return <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.5 12c1.7-4.3 5.4-7 9.5-7s7.8 2.7 9.5 7c-1.7 4.3-5.4 7-9.5 7s-7.8-2.7-9.5-7z" /></svg>;
}
function EyeOff() {
  return <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 4.2A10.5 10.5 0 0112 4c4.1 0 7.8 2.7 9.5 7-.4 1-1 1.9-1.7 2.7M6.2 6.2C4.4 7.4 3 9.5 2.5 12c1.7 4.3 5.4 7 9.5 7 1.6 0 3-.4 4.3-1.1" /></svg>;
}
function Spinner() {
  return <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" /><path d="M22 12a10 10 0 00-10-10" stroke="white" strokeWidth="3" strokeLinecap="round" /></svg>;
}

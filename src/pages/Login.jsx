import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../services/api";
import { useAuth } from "../AuthContext";
import Logo from "../components/Logo";
import ParticleCanvas from "../components/ParticleCanvas";
import {
  validateUsername,
  validatePassword,
  USERNAME_MAX,
  PASSWORD_MAX,
} from "../utils/validators";

const greeting = () => {
  const h = new Date().getHours();
  if (h < 5) return "Boa madrugada";
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
};

const STRENGTH_COLORS = ["#3d0f18", "#9f1239", "#e11d48", "#f43f5e", "#fb7185", "#4ade80"];

export default function Login() {
  const navigate = useNavigate();
  const { signIn, isAuthenticated } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [touched, setTouched] = useState({ username: false, password: false });

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  const userCheck = useMemo(() => validateUsername(username), [username]);
  const passCheck = useMemo(() => validatePassword(password), [password]);
  const canSubmit = userCheck.valid && passCheck.valid && !loading;

  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  };

  const handleKeyEvents = (e) => {
    if (typeof e.getModifierState === "function") {
      setCapsOn(e.getModifierState("CapsLock"));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro("");
    setTouched({ username: true, password: true });

    if (!canSubmit) {
      setErro(!userCheck.valid ? userCheck.hint : passCheck.hint);
      triggerShake();
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/login", {
        username: username.trim(),
        password,
      });
      signIn(response.data.token, { id: response.data.id });
      navigate("/dashboard");
    } catch (err) {
      const status = err?.response?.status;
      setErro(
        status === 401 || status === 404 || status === 422
          ? "Usuário ou senha inválidos."
          : "Não foi possível conectar. Tente novamente."
      );
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
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
          width: 520, height: 520, top: "-10%", left: "-8%",
          background: "radial-gradient(circle, rgba(225,29,72,0.12) 0%, transparent 70%)",
          filter: "blur(60px)", borderRadius: "50%",
        }}
      />
      <div
        className="absolute pointer-events-none animate-float-2"
        style={{
          width: 380, height: 380, bottom: "-5%", right: "5%",
          background: "radial-gradient(circle, rgba(244,63,94,0.1) 0%, transparent 70%)",
          filter: "blur(50px)", borderRadius: "50%",
        }}
      />
      <div
        className="absolute pointer-events-none animate-float-3"
        style={{
          width: 260, height: 260, top: "30%", right: "-5%",
          background: "radial-gradient(circle, rgba(159,18,57,0.12) 0%, transparent 70%)",
          filter: "blur(40px)", borderRadius: "50%",
        }}
      />

      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgba(225,29,72,0.5), transparent)" }}
      />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-56 h-20 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at top, rgba(225,29,72,0.15) 0%, transparent 70%)" }}
      />

      <motion.div
        initial={{ y: 40, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-sm px-4 flex flex-col items-center"
      >
        <motion.div
          initial={{ scale: 0.6, rotate: -8, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ delay: 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-5"
        >
          <Logo size={100} showText={false} />
        </motion.div>

        <motion.h1
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-4xl font-bold mb-1 text-neon-red"
          style={{ color: "#fff1f2", letterSpacing: "-0.02em" }}
        >
          Serve<span style={{ color: "#f43f5e" }}>Flow</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="text-xs uppercase mb-2"
          style={{ color: "#6b2130", letterSpacing: "0.20em" }}
        >
          Sistema de Restaurante
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm mb-6"
          style={{ color: "#9f1239" }}
        >
          Faça seu acesso
        </motion.p>

        <div className="flex items-center gap-3 w-full mb-6">
          <div className="flex-1 h-px" style={{ background: "rgba(225,29,72,0.18)" }} />
          <div className="w-1.5 h-1.5 rounded-full animate-pulse-glow" style={{ background: "rgba(225,29,72,0.7)" }} />
          <div className="flex-1 h-px" style={{ background: "rgba(225,29,72,0.18)" }} />
        </div>

        <motion.div
          animate={shaking ? { x: [-7, 7, -4, 4, -2, 2, 0] } : {}}
          transition={{ duration: 0.45 }}
          className="w-full rounded-2xl p-8 shadow-2xl animate-border-breathe"
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

          <AnimatePresence>
            {erro && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
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
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="flex flex-col gap-4" noValidate>
            <Field
              label="Usuário"
              type="text"
              placeholder="Digite seu usuário"
              autoComplete="username"
              maxLength={USERNAME_MAX}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, username: true }))}
              valid={userCheck.valid}
              hint={touched.username || username ? userCheck.hint : ""}
              showStatus={touched.username || username.length > 0}
            />

            <div>
              <Field
                label="Senha"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                maxLength={PASSWORD_MAX}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyEvents}
                onKeyUp={handleKeyEvents}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                valid={passCheck.valid}
                hint={touched.password || password ? passCheck.hint : ""}
                showStatus={touched.password || password.length > 0}
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    className="p-1 rounded-md transition-colors"
                    style={{ color: "#6b2130" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#f43f5e")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#6b2130")}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                }
              />

              {/* Barra de força */}
              {password && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 flex gap-1"
                >
                  {[0, 1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: i < passCheck.strength ? 1 : 0.2 }}
                      transition={{ duration: 0.25 }}
                      className="flex-1 h-1 rounded-full origin-left"
                      style={{
                        background:
                          i < passCheck.strength
                            ? STRENGTH_COLORS[passCheck.strength]
                            : "rgba(225,29,72,0.08)",
                      }}
                    />
                  ))}
                </motion.div>
              )}

              <AnimatePresence>
                {capsOn && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="mt-2 flex items-center gap-1.5 text-xs"
                    style={{ color: "#fb7185" }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 11l7-7 7 7M5 19h14" />
                    </svg>
                    Caps Lock está ativo
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              type="submit"
              disabled={!canSubmit}
              whileHover={canSubmit ? { y: -2, boxShadow: "0 10px 36px rgba(225,29,72,0.5)" } : {}}
              whileTap={canSubmit ? { scale: 0.98 } : {}}
              className="btn-shine w-full py-3 rounded-xl font-bold text-sm mt-1 tracking-wider uppercase relative overflow-hidden"
              style={{
                background: canSubmit
                  ? "linear-gradient(135deg, #e11d48 0%, #9f1239 100%)"
                  : "linear-gradient(135deg, #4a1525 0%, #2a0810 100%)",
                color: "#ffffff",
                boxShadow: canSubmit ? "0 4px 24px rgba(225,29,72,0.35)" : "none",
                letterSpacing: "0.1em",
                cursor: canSubmit ? "pointer" : "not-allowed",
                opacity: canSubmit ? 1 : 0.6,
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner /> Acessando...
                </span>
              ) : (
                "Acessar Sistema"
              )}
            </motion.button>

          </form>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-xs"
          style={{ color: "#3d0f18", letterSpacing: "0.06em" }}
        >
          Acesso restrito · ServeFlow v1.0
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

function Field({ label, hint, valid, showStatus, rightSlot, ...inputProps }) {
  const showError = showStatus && !valid && hint;
  const showOk = showStatus && valid;

  return (
    <div>
      <label
        className="block text-xs font-semibold mb-1.5 tracking-wider uppercase"
        style={{ color: "#6b2130" }}
      >
        {label}
      </label>
      <div className="relative">
        <input
          {...inputProps}
          className="input-red w-full px-4 py-3 rounded-xl text-sm transition-all pr-10"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: showError
              ? "1px solid rgba(248,113,113,0.55)"
              : showOk
              ? "1px solid rgba(74,222,128,0.35)"
              : "1px solid rgba(225,29,72,0.18)",
            color: "#fff1f2",
          }}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {showOk && !rightSlot && <CheckIcon />}
          {showError && !rightSlot && <ErrorIcon />}
          {rightSlot}
        </div>
      </div>
      <AnimatePresence>
        {hint && showStatus && (
          <motion.p
            initial={{ opacity: 0, y: -3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            className="text-xs mt-1.5"
            style={{ color: valid ? "#4ade80" : "#f87171" }}
          >
            {hint}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth={2.4}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
function ErrorIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth={2.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function Eye() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 12c1.7-4.3 5.4-7 9.5-7s7.8 2.7 9.5 7c-1.7 4.3-5.4 7-9.5 7s-7.8-2.7-9.5-7z" />
    </svg>
  );
}
function EyeOff() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 4.2A10.5 10.5 0 0112 4c4.1 0 7.8 2.7 9.5 7-.4 1-1 1.9-1.7 2.7M6.2 6.2C4.4 7.4 3 9.5 2.5 12c1.7 4.3 5.4 7 9.5 7 1.6 0 3-.4 4.3-1.1" />
    </svg>
  );
}
function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
      <path d="M22 12a10 10 0 00-10-10" stroke="white" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

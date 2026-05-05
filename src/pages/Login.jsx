import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../services/api";
import { useAuth } from "../AuthContext";
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

const STRENGTH_COLORS = ["#3d1a08", "#9f3219", "#e46033", "#f07040", "#f09060", "#4ade80"];

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
      transition={{ duration: 0.4 }}
      className="sf-page"
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <ParticleCanvas />

      
      <div className="position-fixed" style={{ inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
        <div
          className="position-absolute animate-float-1 animate-pulse-glow"
          style={{
            width: 600, height: 600, top: "-15%", left: "-10%",
            background: "radial-gradient(circle, rgba(228,96,51,0.18) 0%, transparent 70%)",
            filter: "blur(70px)", borderRadius: "50%",
          }}
        />
        <div
          className="position-absolute animate-float-2"
          style={{
            width: 420, height: 420, bottom: "-8%", right: "2%",
            background: "radial-gradient(circle, rgba(240,112,64,0.14) 0%, transparent 70%)",
            filter: "blur(55px)", borderRadius: "50%",
          }}
        />
        <div
          className="position-absolute"
          style={{
            inset: 0,
            background: "radial-gradient(ellipse 75% 60% at 50% 30%, rgba(228,96,51,0.10) 0%, transparent 65%)",
          }}
        />
        <div
          className="position-fixed w-100"
          style={{
            top: 0, height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(228,96,51,0.7), transparent)",
          }}
        />
      </div>

      
      <div
        className="flex-grow-1 d-flex align-items-center justify-content-center position-relative px-3 py-5"
        style={{ zIndex: 1 }}
      >
        <div style={{ width: "100%", maxWidth: "840px" }}>

          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="row g-0 sf-login-card"
          >

            
            <div className="col-12 col-md-5 sf-login-panel-left d-flex flex-column align-items-center justify-content-center text-center p-5">
              <div className="deco-circle-1" />
              <div className="deco-circle-2" />
              <div className="deco-circle-3" />

              <motion.div
                initial={{ scale: 0.4, opacity: 0, rotate: -10 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ delay: 0.25, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="position-relative"
                style={{ zIndex: 1 }}
              >
                <img
                  src="/logo.jpeg"
                  alt="ServeFlow"
                  style={{
                    width: "110px",
                    height: "110px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "3px solid rgba(255,255,255,0.2)",
                    boxShadow: "0 0 40px rgba(228,96,51,0.35)",
                  }}
                />
              </motion.div>

              <motion.h2
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="text-white text-uppercase fw-black mt-4 mb-3 position-relative"
                style={{
                  fontSize: "clamp(1.5rem, 3vw, 1.9rem)",
                  letterSpacing: "-0.01em",
                  lineHeight: 1.15,
                  zIndex: 1,
                }}
              >
                BEM-VINDO<br />DE VOLTA!
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.6 }}
                className="position-relative"
                style={{
                  color: "rgba(255,241,242,0.72)",
                  fontSize: "13px",
                  lineHeight: 1.75,
                  maxWidth: "230px",
                  zIndex: 1,
                }}
              >
                Ficamos felizes em tê-lo de volta. Gerencie seu restaurante com eficiência.
              </motion.p>

              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="position-relative mt-4"
                style={{
                  width: 48, height: 2, borderRadius: 2,
                  background: "rgba(255,255,255,0.28)",
                  zIndex: 1,
                }}
              />
            </div>

            
            <motion.div
              animate={shaking ? { x: [-8, 8, -5, 5, -2, 2, 0] } : {}}
              transition={{ duration: 0.5 }}
              className="col-12 col-md-7 sf-login-panel-right p-4 p-md-5 d-flex flex-column justify-content-center"
            >

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="mb-4"
              >
                <p
                  className="text-uppercase fw-bold mb-1"
                  style={{ color: "#f07040", fontSize: "11px", letterSpacing: "0.22em" }}
                >
                  Acesso ao Sistema
                </p>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "14px", margin: 0 }}>
                  {greeting()}, faça seu login abaixo
                </p>
              </motion.div>

              
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.45, duration: 0.4 }}
                className="sf-divider mb-4"
              >
                <div
                  className="animate-pulse-glow"
                  style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(228,96,51,0.75)" }}
                />
              </motion.div>

              
              <AnimatePresence>
                {erro && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden mb-3"
                  >
                    <div
                      className="d-flex align-items-center gap-2 px-3 py-2 rounded-3"
                      style={{
                        background: "rgba(228,96,51,0.09)",
                        border: "1px solid rgba(228,96,51,0.32)",
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#f07040">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="mb-0" style={{ color: "#f87171", fontSize: "13px" }}>{erro}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              
              <form onSubmit={handleLogin} noValidate>

                
                <motion.div
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="mb-4"
                >
                  <label
                    className="form-label fw-bold text-uppercase mb-2"
                    style={{ color: "#f07040", fontSize: "11px", letterSpacing: "0.2em" }}
                  >
                    Usuário
                  </label>
                  <div className="position-relative">
                    <input
                      type="text"
                      placeholder="Digite seu usuário"
                      autoComplete="username"
                      maxLength={USERNAME_MAX}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, username: true }))}
                      className="form-control sf-input"
                      style={{
                        paddingRight: "40px",
                        fontSize: "15px",
                        color: "#ffffff",
                        background: "rgba(255,255,255,0.06)",
                        border: "1.5px solid rgba(240,112,64,0.35)",
                      }}
                    />
                    <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", display: "flex" }}>
                      {(touched.username || username.length > 0) &&
                        (userCheck.valid ? <CheckIcon /> : <ErrorIcon />)}
                    </div>
                  </div>
                  <AnimatePresence>
                    {(touched.username || username) && userCheck.hint && (
                      <motion.p
                        initial={{ opacity: 0, y: -3 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -3 }}
                        className="mt-1 mb-0"
                        style={{ fontSize: "12px", color: userCheck.valid ? "#4ade80" : "#f87171" }}
                      >
                        {userCheck.hint}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                
                <motion.div
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="mb-4"
                >
                  <label
                    className="form-label fw-bold text-uppercase mb-2"
                    style={{ color: "#f07040", fontSize: "11px", letterSpacing: "0.2em" }}
                  >
                    Senha
                  </label>
                  <div className="position-relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      maxLength={PASSWORD_MAX}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={handleKeyEvents}
                      onKeyUp={handleKeyEvents}
                      onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                      className="form-control sf-input"
                      style={{
                        paddingRight: "68px",
                        fontSize: "15px",
                        color: "#ffffff",
                        background: "rgba(255,255,255,0.06)",
                        border: "1.5px solid rgba(240,112,64,0.35)",
                      }}
                    />
                    <div style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", gap: "4px" }}>
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                        style={{
                          background: "transparent", border: "none",
                          color: "#f07040", padding: "4px", cursor: "pointer",
                          transition: "color 0.2s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#f07040")}
                      >
                        {showPassword ? <EyeOff /> : <Eye />}
                      </button>
                      {(touched.password || password.length > 0) &&
                        (passCheck.valid ? <CheckIcon /> : <ErrorIcon />)}
                    </div>
                  </div>

                  {password && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="d-flex gap-1 mt-2"
                    >
                      {[0, 1, 2, 3, 4].map((i) => (
                        <motion.div
                          key={i}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: i < passCheck.strength ? 1 : 0.2 }}
                          transition={{ duration: 0.25 }}
                          style={{
                            flex: 1, height: 3, borderRadius: 2,
                            transformOrigin: "left",
                            background: i < passCheck.strength
                              ? STRENGTH_COLORS[passCheck.strength]
                              : "rgba(228,96,51,0.08)",
                          }}
                        />
                      ))}
                    </motion.div>
                  )}

                  <AnimatePresence>
                    {(touched.password || password) && passCheck.hint && (
                      <motion.p
                        initial={{ opacity: 0, y: -3 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -3 }}
                        className="mt-1 mb-0"
                        style={{ fontSize: "12px", color: passCheck.valid ? "#4ade80" : "#f87171" }}
                      >
                        {passCheck.hint}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {capsOn && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="d-flex align-items-center gap-1 mt-2"
                        style={{ color: "#f09060", fontSize: "12px" }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 11l7-7 7 7M5 19h14" />
                        </svg>
                        Caps Lock está ativo
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  <motion.button
                    type="submit"
                    disabled={!canSubmit}
                    whileHover={canSubmit ? { y: -3, boxShadow: "0 12px 40px rgba(228,96,51,0.6)" } : {}}
                    whileTap={canSubmit ? { scale: 0.97 } : {}}
                    className="btn btn-sf-primary w-100 py-3 rounded-3 text-uppercase btn-shine"
                    style={{
                      letterSpacing: "0.1em",
                      fontSize: "13px",
                      cursor: canSubmit ? "pointer" : "not-allowed",
                      opacity: canSubmit ? 1 : 0.5,
                    }}
                  >
                    {loading ? (
                      <span className="d-flex align-items-center justify-content-center gap-2">
                        <Spinner /> Acessando...
                      </span>
                    ) : (
                      "Entrar no Sistema"
                    )}
                  </motion.button>
                </motion.div>
              </form>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.85 }}
                className="text-center mt-4 mb-0"
                style={{ color: "#4a2010", fontSize: "11px", letterSpacing: "0.06em" }}
              >
              ServeFlow 1.0
              </motion.p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth={2.4}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth={2.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function Eye() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 12c1.7-4.3 5.4-7 9.5-7s7.8 2.7 9.5 7c-1.7 4.3-5.4 7-9.5 7s-7.8-2.7-9.5-7z" />
    </svg>
  );
}

function EyeOff() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 4.2A10.5 10.5 0 0112 4c4.1 0 7.8 2.7 9.5 7-.4 1-1 1.9-1.7 2.7M6.2 6.2C4.4 7.4 3 9.5 2.5 12c1.7 4.3 5.4 7 9.5 7 1.6 0 3-.4 4.3-1.1" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
      <path d="M22 12a10 10 0 00-10-10" stroke="white" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
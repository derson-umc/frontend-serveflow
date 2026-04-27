import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/Sidebar";
import { api } from "../services/api";
import { useAuth } from "../AuthContext";
import { validatePassword } from "../utils/validators";

const STRENGTH_COLORS = ["#3d0f18", "#9f1239", "#e11d48", "#f43f5e", "#fb7185", "#4ade80"];

export default function ChangePassword() {
  // user.id vem do claim 'id' do JWT (preenchido pelo backend ao logar).
  const { user } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [capsOn, setCapsOn] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const passCheck = useMemo(() => validatePassword(next), [next]);
  const matches = next.length > 0 && next === confirm;
  const sameAsCurrent = current.length > 0 && next.length > 0 && current === next;
  const canSubmit =
    current.length > 0 &&
    passCheck.valid &&
    matches &&
    !sameAsCurrent &&
    !loading;

  const handleKeyEvents = (e) => {
    if (typeof e.getModifierState === "function") {
      setCapsOn(e.getModifierState("CapsLock"));
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!current) return setError("Informe a senha atual.");
    if (!passCheck.valid) return setError(passCheck.hint);
    if (sameAsCurrent) return setError("A nova senha deve ser diferente da atual.");
    if (!matches) return setError("As senhas não coincidem.");

    if (!user?.id) {
      setError("Sessão inválida. Faça login novamente.");
      return;
    }

    setLoading(true);
    try {
      // Endpoint granular do backend: PATCH /users/{id}/password.
      // Exige a senha atual, validada server-side via BCrypt.matches.
      await api.patch(`/users/${user.id}/password`, {
        currentPassword: current,
        newPassword: next,
      });
      setSuccess("Senha alterada com sucesso. Use a nova senha no próximo login.");
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      const status = err?.response?.status;
      const apiMsg = err?.response?.data?.error;
      setError(
        apiMsg ||
        (status === 401
          ? "Sessão expirada. Faça login novamente."
          : status === 422
          ? "Senha atual incorreta."
          : "Não foi possível alterar a senha.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex flex-col min-h-screen"
      style={{ background: "#080404" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 65% 25%, #1a0008 0%, #0d0204 40%, #080404 100%)",
        }}
      />
      <Sidebar />

      <div className="relative flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <div
                className="w-1 h-7 rounded-full"
                style={{ background: "linear-gradient(180deg, #f43f5e, #e11d48)" }}
              />
              <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#fff1f2" }}>
                Alterar senha
              </h1>
            </div>
            <p className="text-sm ml-4" style={{ color: "#6b2130" }}>
              Atualize sua senha de acesso
            </p>
          </div>

          <form
            onSubmit={submit}
            className="rounded-2xl p-7 flex flex-col gap-4"
            style={{
              background: "rgba(10,2,4,0.92)",
              border: "1px solid rgba(225,29,72,0.18)",
              backdropFilter: "blur(20px)",
            }}
          >
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="text-sm px-3 py-2 rounded-lg"
                  style={{
                    background: "rgba(225,29,72,0.08)",
                    border: "1px solid rgba(225,29,72,0.28)",
                    color: "#f87171",
                  }}
                >
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="text-sm px-3 py-2 rounded-lg"
                  style={{
                    background: "rgba(74,222,128,0.07)",
                    border: "1px solid rgba(74,222,128,0.2)",
                    color: "#4ade80",
                  }}
                >
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            <PwField
              label="Senha atual"
              value={current}
              onChange={setCurrent}
              show={showCurrent}
              onToggleShow={() => setShowCurrent((v) => !v)}
              autoComplete="current-password"
              onKeyDown={handleKeyEvents}
              onKeyUp={handleKeyEvents}
            />

            <div>
              <PwField
                label="Nova senha"
                value={next}
                onChange={setNext}
                show={showNext}
                onToggleShow={() => setShowNext((v) => !v)}
                autoComplete="new-password"
                onKeyDown={handleKeyEvents}
                onKeyUp={handleKeyEvents}
                hint={next ? passCheck.hint : ""}
                valid={passCheck.valid && !sameAsCurrent}
              />
              {next && (
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
              {sameAsCurrent && (
                <p className="text-xs mt-1.5" style={{ color: "#f87171" }}>
                  A nova senha deve ser diferente da atual
                </p>
              )}
            </div>

            <PwField
              label="Confirmar nova senha"
              value={confirm}
              onChange={setConfirm}
              show={showConfirm}
              onToggleShow={() => setShowConfirm((v) => !v)}
              autoComplete="new-password"
              onKeyDown={handleKeyEvents}
              onKeyUp={handleKeyEvents}
              hint={confirm ? (matches ? "As senhas coincidem" : "As senhas não coincidem") : ""}
              valid={matches}
            />

            <AnimatePresence>
              {capsOn && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex items-center gap-1.5 text-xs"
                  style={{ color: "#fb7185" }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 11l7-7 7 7M5 19h14" />
                  </svg>
                  Caps Lock está ativo
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileTap={canSubmit ? { scale: 0.98 } : {}}
              whileHover={canSubmit ? { y: -2, boxShadow: "0 10px 36px rgba(225,29,72,0.5)" } : {}}
              type="submit"
              disabled={!canSubmit}
              className="btn-shine w-full py-3 rounded-xl font-bold text-sm tracking-wider uppercase"
              style={{
                background: canSubmit
                  ? "linear-gradient(135deg, #e11d48 0%, #9f1239 100%)"
                  : "linear-gradient(135deg, #4a1525 0%, #2a0810 100%)",
                color: "#fff",
                boxShadow: canSubmit ? "0 4px 24px rgba(225,29,72,0.35)" : "none",
                letterSpacing: "0.1em",
                opacity: canSubmit ? 1 : 0.6,
                cursor: canSubmit ? "pointer" : "not-allowed",
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner /> Salvando...
                </span>
              ) : (
                "Salvar nova senha"
              )}
            </motion.button>

            <p className="text-xs text-center" style={{ color: "#4a1525" }}>
              Mínimo 6 caracteres · use letras, números e símbolos para uma senha forte
            </p>
          </form>
        </div>
      </div>
    </motion.div>
  );
}

function PwField({ label, value, onChange, show, onToggleShow, autoComplete, hint, valid, onKeyDown, onKeyUp }) {
  const showError = hint && !valid;
  const showOk = hint && valid;
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "#6b2130" }}>
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
          className="input-red w-full px-4 py-3 rounded-xl text-sm pr-10"
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
        <button
          type="button"
          onClick={onToggleShow}
          aria-label={show ? "Ocultar senha" : "Mostrar senha"}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors"
          style={{ color: "#6b2130" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#f43f5e")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#6b2130")}
        >
          {show ? <EyeOff /> : <Eye />}
        </button>
      </div>
      <AnimatePresence>
        {hint && (
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

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/Sidebar";
import { api } from "../services/api";
import { useAuth } from "../AuthContext";
import { validatePassword } from "../utils/validators";

const G  = "#2E7D32";
const O  = "#F57C00";
const D  = "#424242";
const M  = "#757575";
const B  = "#E0E0E0";
const W  = "#FFFFFF";

const STRENGTH_COLORS = ["#E0E0E0","#EF9A9A","#EF5350","#43A047","#2E7D32","#1B5E20"];

export default function ChangePassword() {
  const { user } = useAuth();
  const [current, setCurrent]       = useState("");
  const [next, setNext]             = useState("");
  const [confirm, setConfirm]       = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [capsOn, setCapsOn]         = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [success, setSuccess]       = useState("");

  const passCheck     = useMemo(() => validatePassword(next), [next]);
  const matches       = next.length > 0 && next === confirm;
  const sameAsCurrent = current.length > 0 && next.length > 0 && current === next;
  const canSubmit     = current.length > 0 && passCheck.valid && matches && !sameAsCurrent && !loading;

  const handleKeyEvents = (e) => {
    if (typeof e.getModifierState === "function") setCapsOn(e.getModifierState("CapsLock"));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!current)         return setError("Informe a senha atual.");
    if (!passCheck.valid) return setError(passCheck.hint);
    if (sameAsCurrent)    return setError("A nova senha deve ser diferente da atual.");
    if (!matches)         return setError("As senhas não coincidem.");
    if (!user?.id)        return setError("Sessão inválida. Faça login novamente.");
    setLoading(true);
    try {
      await api.patch(`/users/${user.id}/password`, { currentPassword: current, newPassword: next });
      setSuccess("Senha alterada com sucesso. Use a nova senha no próximo login.");
      setCurrent(""); setNext(""); setConfirm("");
    } catch (err) {
      const s = err?.response?.status;
      const m = err?.response?.data?.error;
      setError(m || (s === 401 ? "Sessão expirada." : s === 422 ? "Senha atual incorreta." : "Não foi possível alterar a senha."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col min-h-screen" style={{ background: "#F5F5F5" }}>
      <Sidebar />

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1 h-7 rounded-full" style={{ background: `linear-gradient(180deg, ${O}, ${G})` }} />
              <h1 className="text-2xl font-bold" style={{ color: D }}>Alterar Senha</h1>
            </div>
            <p className="text-sm ml-4" style={{ color: M }}>Atualize sua senha de acesso</p>
          </div>

          <div className="rounded-2xl p-7 flex flex-col gap-4"
            style={{ background: W, boxShadow: "0 4px 20px rgba(0,0,0,0.09)", border: `1px solid ${B}` }}>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="px-3 py-2.5 rounded-xl text-sm"
                  style={{ background: "#FFEBEE", border: "1px solid #EF9A9A", color: "#C62828" }}>
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="px-3 py-2.5 rounded-xl text-sm"
                  style={{ background: "#E8F5E9", border: "1px solid #A5D6A7", color: G }}>
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            <PwField label="Senha atual" value={current} onChange={setCurrent} show={showCurrent}
              onToggleShow={() => setShowCurrent((v) => !v)} autoComplete="current-password"
              onKeyDown={handleKeyEvents} onKeyUp={handleKeyEvents} />

            <div>
              <PwField label="Nova senha" value={next} onChange={setNext} show={showNext}
                onToggleShow={() => setShowNext((v) => !v)} autoComplete="new-password"
                onKeyDown={handleKeyEvents} onKeyUp={handleKeyEvents}
                hint={next ? passCheck.hint : ""} valid={passCheck.valid && !sameAsCurrent} />
              {next && (
                <div className="flex gap-1 mt-2">
                  {[0,1,2,3,4].map((i) => (
                    <div key={i} className="flex-1 h-1 rounded-full transition-all"
                      style={{ background: i < passCheck.strength ? STRENGTH_COLORS[passCheck.strength] : "#E0E0E0" }} />
                  ))}
                </div>
              )}
              {sameAsCurrent && <p className="text-xs mt-1.5" style={{ color: "#EF5350" }}>A nova senha deve ser diferente da atual</p>}
            </div>

            <PwField label="Confirmar nova senha" value={confirm} onChange={setConfirm} show={showConfirm}
              onToggleShow={() => setShowConfirm((v) => !v)} autoComplete="new-password"
              onKeyDown={handleKeyEvents} onKeyUp={handleKeyEvents}
              hint={confirm ? (matches ? "As senhas coincidem" : "As senhas não coincidem") : ""} valid={matches} />

            <AnimatePresence>
              {capsOn && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5 text-xs" style={{ color: O }}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 11l7-7 7 7M5 19h14" /></svg>
                  Caps Lock está ativo
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileTap={canSubmit ? { scale: 0.98 } : {}}
              whileHover={canSubmit ? { y: -2, boxShadow: "0 8px 24px rgba(46,125,50,0.4)" } : {}}
              type="button" onClick={submit} disabled={!canSubmit}
              className="w-full py-3 rounded-xl font-bold text-sm tracking-wide"
              style={{
                background: canSubmit ? G : "#E0E0E0",
                color: canSubmit ? W : M,
                border: "none",
                cursor: canSubmit ? "pointer" : "not-allowed",
                boxShadow: canSubmit ? "0 4px 16px rgba(46,125,50,0.3)" : "none",
              }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner /> Salvando...
                </span>
              ) : "Salvar Nova Senha"}
            </motion.button>

            <p className="text-xs text-center" style={{ color: "#BDBDBD" }}>
              Mínimo 6 caracteres · use letras, números e símbolos para uma senha forte
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function PwField({ label, value, onChange, show, onToggleShow, autoComplete, hint, valid, onKeyDown, onKeyUp }) {
  const showError = hint && !valid;
  const showOk    = hint && valid;
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: M }}>{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"} autoComplete={autoComplete}
          value={value} onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown} onKeyUp={onKeyUp}
          className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all pr-10"
          style={{
            background: "#FAFAFA", color: "#424242",
            border: `1.5px solid ${showError ? "#EF5350" : showOk ? "#2E7D32" : "#E0E0E0"}`,
          }}
        />
        <button type="button" onClick={onToggleShow}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors"
          style={{ background: "none", border: "none", color: "#757575", cursor: "pointer" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#2E7D32")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#757575")}>
          {show ? <EyeOff /> : <Eye />}
        </button>
      </div>
      <AnimatePresence>
        {hint && (
          <motion.p initial={{ opacity: 0, y: -3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-xs mt-1.5" style={{ color: valid ? "#2E7D32" : "#EF5350" }}>
            {hint}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function Eye() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.5 12c1.7-4.3 5.4-7 9.5-7s7.8 2.7 9.5 7c-1.7 4.3-5.4 7-9.5 7s-7.8-2.7-9.5-7z" /></svg>;
}
function EyeOff() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 4.2A10.5 10.5 0 0112 4c4.1 0 7.8 2.7 9.5 7-.4 1-1 1.9-1.7 2.7M6.2 6.2C4.4 7.4 3 9.5 2.5 12c1.7 4.3 5.4 7 9.5 7 1.6 0 3-.4 4.3-1.1" /></svg>;
}
function Spinner() {
  return <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" /><path d="M22 12a10 10 0 00-10-10" stroke="white" strokeWidth="3" strokeLinecap="round" /></svg>;
}

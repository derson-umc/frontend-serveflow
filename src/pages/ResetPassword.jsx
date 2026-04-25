import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../services/api";
import Logo from "../components/Logo";
import { validatePassword } from "../utils/validators";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const passCheck = useMemo(() => validatePassword(password), [password]);
  const matches = password.length > 0 && password === confirm;
  const canSubmit = !!token && passCheck.valid && matches && !loading;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!token) return setError("Token ausente. Use o link recebido por e-mail.");
    if (!passCheck.valid) return setError(passCheck.hint);
    if (!matches) return setError("As senhas não coincidem.");
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, newPassword: password });
      navigate("/?reset=ok", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.error || "Token inválido ou expirado.");
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
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 70% at 50% 35%, #1a0008 0%, #0d0204 45%, #080404 100%)" }}
      />
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-sm px-4 flex flex-col items-center"
      >
        <Logo size={72} showText={false} />
        <h1 className="text-2xl font-bold mt-4 mb-1" style={{ color: "#fff1f2" }}>
          Redefinir senha
        </h1>
        <p className="text-xs uppercase mb-7" style={{ color: "#6b2130", letterSpacing: "0.18em" }}>
          Nova senha de acesso
        </p>

        <form
          onSubmit={submit}
          className="w-full rounded-2xl p-7 shadow-2xl flex flex-col gap-4"
          style={{
            background: "rgba(10, 2, 4, 0.92)",
            border: "1px solid rgba(225,29,72,0.22)",
            backdropFilter: "blur(24px)",
          }}
        >
          {!token && (
            <div className="text-sm px-3 py-2 rounded-lg"
              style={{ background: "rgba(225,29,72,0.08)", border: "1px solid rgba(225,29,72,0.28)", color: "#f87171" }}
            >
              Token ausente. Acesse o link recebido por e-mail.
            </div>
          )}

          {error && (
            <div className="text-sm px-3 py-2 rounded-lg"
              style={{ background: "rgba(225,29,72,0.08)", border: "1px solid rgba(225,29,72,0.28)", color: "#f87171" }}
            >
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "#6b2130" }}>
              Nova senha
            </label>
            <input
              type="password"
              className="input-red w-full px-4 py-3 rounded-xl text-sm"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(225,29,72,0.18)", color: "#fff1f2" }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            {password && (
              <p className="text-xs mt-1.5" style={{ color: passCheck.valid ? "#4ade80" : "#f87171" }}>
                {passCheck.hint}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "#6b2130" }}>
              Confirmar senha
            </label>
            <input
              type="password"
              className="input-red w-full px-4 py-3 rounded-xl text-sm"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(225,29,72,0.18)", color: "#fff1f2" }}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
            {confirm && (
              <p className="text-xs mt-1.5" style={{ color: matches ? "#4ade80" : "#f87171" }}>
                {matches ? "As senhas coincidem" : "As senhas não coincidem"}
              </p>
            )}
          </div>

          <motion.button
            whileTap={canSubmit ? { scale: 0.98 } : {}}
            type="submit"
            disabled={!canSubmit}
            className="btn-shine w-full py-3 rounded-xl font-bold text-sm tracking-wider uppercase"
            style={{
              background: canSubmit ? "linear-gradient(135deg, #e11d48 0%, #9f1239 100%)" : "#3d0f18",
              color: "#fff", boxShadow: canSubmit ? "0 4px 24px rgba(225,29,72,0.35)" : "none",
              letterSpacing: "0.1em", opacity: canSubmit ? 1 : 0.6, cursor: canSubmit ? "pointer" : "not-allowed",
            }}
          >
            {loading ? "Salvando..." : "Redefinir senha"}
          </motion.button>

          <Link to="/" className="text-center text-xs" style={{ color: "#6b2130" }}>
            ← Voltar ao login
          </Link>
        </form>
      </motion.div>
    </motion.div>
  );
}

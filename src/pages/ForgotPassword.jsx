import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../services/api";
import Logo from "../components/Logo";

export default function ForgotPassword() {
  const [username, setUsername] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!username.trim()) {
      setError("Informe seu usuário.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { username: username.trim() });
      setDone(true);
    } catch {
      setError("Não foi possível processar agora. Tente novamente.");
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
          Esqueci minha senha
        </h1>
        <p className="text-xs uppercase mb-7" style={{ color: "#6b2130", letterSpacing: "0.18em" }}>
          Recuperação de acesso
        </p>

        <div
          className="w-full rounded-2xl p-7 shadow-2xl"
          style={{
            background: "rgba(10, 2, 4, 0.92)",
            border: "1px solid rgba(225,29,72,0.22)",
            backdropFilter: "blur(24px)",
          }}
        >
          {done ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <div className="inline-flex w-12 h-12 rounded-full items-center justify-center mb-3"
                style={{ background: "rgba(74,222,128,0.12)" }}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#4ade80" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm" style={{ color: "#fecdd3" }}>
                Se o usuário existir, um link de redefinição foi enviado.
              </p>
              <p className="text-xs mt-2" style={{ color: "#6b2130" }}>
                Verifique o canal cadastrado e siga as instruções.
              </p>
              <Link
                to="/"
                className="inline-block mt-5 text-xs font-semibold uppercase tracking-wider"
                style={{ color: "#f43f5e" }}
              >
                Voltar ao login
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-4">
              <p className="text-sm" style={{ color: "#fecdd3" }}>
                Informe seu usuário e enviaremos um link para redefinir sua senha.
              </p>

              {error && (
                <div
                  className="text-sm px-3 py-2 rounded-lg"
                  style={{ background: "rgba(225,29,72,0.08)", border: "1px solid rgba(225,29,72,0.28)", color: "#f87171" }}
                >
                  {error}
                </div>
              )}

              <input
                className="input-red w-full px-4 py-3 rounded-xl text-sm"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(225,29,72,0.18)", color: "#fff1f2" }}
                placeholder="Seu usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
              />
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="btn-shine w-full py-3 rounded-xl font-bold text-sm disabled:opacity-50 tracking-wider uppercase"
                style={{
                  background: "linear-gradient(135deg, #e11d48 0%, #9f1239 100%)",
                  color: "#fff", boxShadow: "0 4px 24px rgba(225,29,72,0.35)", letterSpacing: "0.1em",
                }}
              >
                {loading ? "Enviando..." : "Enviar link"}
              </motion.button>

              <Link
                to="/"
                className="text-center text-xs"
                style={{ color: "#6b2130" }}
              >
                ← Voltar ao login
              </Link>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

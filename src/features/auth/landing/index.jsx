import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "@features/auth/store/useAuthStore";

const FEATURES = [
  { icon: "🍽️", label: "Comandas digitais" },
  { icon: "📦", label: "Controle de estoque" },
  { icon: "💰", label: "Gestão financeira" },
  { icon: "👥", label: "Equipe integrada" },
];

export default function Landing() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(150deg, #1B5E20 0%, #2E7D32 45%, #1a3a1a 100%)" }}
    >
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute rounded-full" style={{ width: 560, height: 560, top: "-18%", left: "-12%", background: "rgba(255,255,255,0.03)" }} />
        <div className="absolute rounded-full" style={{ width: 380, height: 380, bottom: "-10%", right: "-8%", background: "rgba(245,124,0,0.10)" }} />
        <div className="absolute rounded-full" style={{ width: 220, height: 220, top: "28%", right: "10%", background: "rgba(255,255,255,0.04)" }} />
        <div className="absolute rounded-full" style={{ width: 140, height: 140, bottom: "20%", left: "8%", background: "rgba(245,124,0,0.07)" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-md"
      >
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.04 }}
          onClick={() => navigate("/login")}
          className="cursor-pointer mb-7"
          style={{ filter: "drop-shadow(0 16px 40px rgba(0,0,0,0.30))" }}
        >
          <img
            src="/logo.jpeg"
            alt="ServeFlow"
            style={{
              width: 136,
              height: 136,
              borderRadius: "50%",
              objectFit: "cover",
              border: "4px solid rgba(255,255,255,0.22)",
              boxShadow: "0 0 0 8px rgba(255,255,255,0.06)",
            }}
          />
        </motion.div>

        {/* Brand name */}
        <motion.h1
          initial={{ y: 18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.55 }}
          style={{ fontSize: 46, fontWeight: 900, color: "#FFFFFF", letterSpacing: "-0.03em", margin: "0 0 6px" }}
        >
          ServeFlow
        </motion.h1>

        <motion.p
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.38, duration: 0.5 }}
          style={{ fontSize: 16, color: "rgba(255,255,255,0.65)", marginBottom: 32 }}
        >
          Gestão completa para restaurantes
        </motion.p>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 40 }}
        >
          {FEATURES.map((f) => (
            <span
              key={f.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "5px 12px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                color: "rgba(255,255,255,0.80)",
                background: "rgba(255,255,255,0.09)",
                border: "1px solid rgba(255,255,255,0.14)",
              }}
            >
              <span style={{ fontSize: 13 }}>{f.icon}</span>
              {f.label}
            </span>
          ))}
        </motion.div>

        {/* CTA button */}
        <motion.button
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.45 }}
          whileHover={{ y: -3, boxShadow: "0 16px 40px rgba(245,124,0,0.50)" }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/login")}
          style={{
            width: "100%",
            padding: "15px 0",
            borderRadius: 14,
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: "0.01em",
            color: "#FFFFFF",
            background: "linear-gradient(135deg, #F57C00 0%, #E65100 100%)",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 6px 24px rgba(245,124,0,0.38)",
            transition: "box-shadow 0.2s",
            marginBottom: 20,
          }}
        >
          Acessar o Sistema →
        </motion.button>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75 }}
          style={{ fontSize: 11, color: "rgba(255,255,255,0.32)", marginTop: 4 }}
        >
          ServeFlow v1.0 · Tecnologia para restaurantes
        </motion.p>
      </motion.div>
    </div>
  );
}

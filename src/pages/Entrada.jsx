import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../AuthContext";

export default function Entrada() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #388E3C 100%)" }}>

      {/* Decorative circles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute rounded-full" style={{ width: 480, height: 480, top: "-15%", left: "-10%", background: "rgba(255,255,255,0.04)" }} />
        <div className="absolute rounded-full" style={{ width: 320, height: 320, bottom: "-8%", right: "-5%", background: "rgba(245,124,0,0.12)" }} />
        <div className="absolute rounded-full" style={{ width: 200, height: 200, top: "30%", right: "12%", background: "rgba(255,255,255,0.05)" }} />
      </div>

      <motion.div
        initial={{ scale: 0.7, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center text-center px-6"
      >
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.05, rotate: 2 }}
          onClick={() => navigate("/login")}
          className="cursor-pointer mb-8"
          style={{ filter: "drop-shadow(0 12px 32px rgba(0,0,0,0.25))" }}
        >
          <img
            src="/logo.jpeg"
            alt="ServeFlow"
            style={{
              width: 160, height: 160, borderRadius: "50%", objectFit: "cover",
              border: "5px solid rgba(255,255,255,0.25)",
            }}
          />
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-5xl font-black mb-3 tracking-tight"
          style={{ color: "#FFFFFF", letterSpacing: "-0.02em" }}
        >
          ServeFlow
        </motion.h1>

        <motion.p
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          className="text-lg mb-10"
          style={{ color: "rgba(255,255,255,0.72)" }}
        >
          Sistema de gestão para restaurantes
        </motion.p>

        <motion.button
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          whileHover={{ y: -3, boxShadow: "0 12px 32px rgba(245,124,0,0.55)" }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/login")}
          className="px-10 py-4 rounded-2xl text-base font-bold tracking-wide transition-all"
          style={{ background: "#F57C00", color: "#FFFFFF", boxShadow: "0 4px 20px rgba(245,124,0,0.4)" }}
        >
          Acessar o Sistema →
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-8 text-xs"
          style={{ color: "rgba(255,255,255,0.38)" }}
        >
          ServeFlow v1.0 · Gestão inteligente de restaurantes
        </motion.p>
      </motion.div>
    </div>
  );
}

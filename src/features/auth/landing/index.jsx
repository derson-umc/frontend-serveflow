import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "@features/auth/store/useAuthStore";

function IconClipboard() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="13" y2="16" />
    </svg>
  );
}

function IconBox() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

function IconChart() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

const FEATURES = [
  {
    Icon: IconClipboard,
    title: "Comandas Digitais",
    description: "Pedidos em tempo real, do salão até a cozinha",
  },
  {
    Icon: IconBox,
    title: "Controle de Estoque",
    description: "Monitoramento e alertas de produtos em tempo real",
  },
  {
    Icon: IconChart,
    title: "Gestão Financeira",
    description: "Controle de caixa, contas e relatórios completos",
  },
  {
    Icon: IconUsers,
    title: "Equipe Integrada",
    description: "Gerencie funções e acessos da sua equipe",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.42 + i * 0.06, duration: 0.28, ease: "easeOut" },
  }),
};

export default function Landing() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(150deg, #1B5E20 0%, #2E7D32 45%, #1a3a1a 100%)" }}
    >
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute rounded-full" style={{ width: 560, height: 560, top: "-18%", left: "-12%", background: "rgba(255,255,255,0.03)" }} />
        <div className="absolute rounded-full" style={{ width: 380, height: 380, bottom: "-10%", right: "-8%", background: "rgba(245,124,0,0.10)" }} />
        <div className="absolute rounded-full" style={{ width: 220, height: 220, top: "28%", right: "10%", background: "rgba(255,255,255,0.04)" }} />
        <div className="absolute rounded-full" style={{ width: 140, height: 140, bottom: "20%", left: "8%", background: "rgba(245,124,0,0.07)" }} />
      </div>

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeIn" }}
        className="relative z-10 w-full max-w-lg px-5 py-10"
      >
        {/* Logo + brand */}
        <header className="flex flex-col items-center text-center mb-8">
          <motion.div
            whileHover={{ scale: 1.03 }}
            onClick={() => navigate("/login")}
            className="cursor-pointer mb-6"
          >
            <img
              src="/logo.jpeg"
              alt="ServeFlow - Sistema de Gestão para Restaurantes"
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                objectFit: "cover",
                border: "4px solid rgba(255,255,255,0.22)",
                boxShadow: "0 0 0 8px rgba(255,255,255,0.06), 0 16px 40px rgba(0,0,0,0.30)",
              }}
            />
          </motion.div>

          <motion.h1
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.18, duration: 0.5 }}
            style={{
              fontFamily: "'Poppins', 'Inter', system-ui, sans-serif",
              fontSize: "clamp(34px, 9vw, 44px)",
              fontWeight: 700,
              color: "#FFFFFF",
              letterSpacing: "-0.025em",
              lineHeight: 1.2,
              margin: "0 0 8px",
            }}
          >
            ServeFlow
          </motion.h1>

          <motion.p
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.45 }}
            style={{
              fontFamily: "'Poppins', 'Inter', system-ui, sans-serif",
              fontSize: 16,
              fontWeight: 400,
              color: "rgba(255,255,255,0.65)",
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            Gestão completa para restaurantes
          </motion.p>
        </header>

        {/* Feature cards — 2 cols on md+, 1 col on mobile */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-7">
          {FEATURES.map(({ Icon, title, description }, i) => (
            <motion.article
              key={title}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.10)" }}
              style={{
                background: "#FFFFFF",
                borderTop: "1px solid #E0E0E0",
                borderRight: "1px solid #E0E0E0",
                borderBottom: "1px solid #E0E0E0",
                borderLeft: "4px solid #1B5E20",
                borderRadius: 8,
                padding: "16px",
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                transition: "box-shadow 200ms ease-in-out",
              }}
            >
              <span style={{ color: "#1B5E20", flexShrink: 0, marginTop: 2 }}>
                <Icon />
              </span>
              <div>
                <h3
                  style={{
                    fontFamily: "'Poppins', 'Inter', system-ui, sans-serif",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#1B5E20",
                    margin: "0 0 4px",
                    lineHeight: 1.4,
                  }}
                >
                  {title}
                </h3>
                <p
                  style={{
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontSize: 12,
                    color: "#666666",
                    margin: 0,
                    lineHeight: 1.55,
                  }}
                >
                  {description}
                </p>
              </div>
            </motion.article>
          ))}
        </section>

        {/* CTA */}
        <motion.button
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.42 }}
          whileHover={{
            backgroundColor: "#CC7700",
            boxShadow: "0 4px 12px rgba(230,126,0,0.30)",
          }}
          whileTap={{ scale: 0.98, backgroundColor: "#B86000" }}
          onClick={() => navigate("/login")}
          style={{
            width: "100%",
            padding: "16px 32px",
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            color: "#FFFFFF",
            backgroundColor: "#E67E00",
            border: "none",
            cursor: "pointer",
            marginBottom: 16,
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          Acessar o Sistema
        </motion.button>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.72 }}
          style={{
            textAlign: "center",
            fontSize: 12,
            color: "rgba(255,255,255,0.32)",
            fontFamily: "'Inter', system-ui, sans-serif",
            lineHeight: 1.5,
          }}
        >
          ServeFlow v1.0 · Tecnologia para restaurantes
        </motion.footer>
      </motion.main>
    </div>
  );
}

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../AuthContext";
import ParticleCanvas from "../components/ParticleCanvas";

export default function Entrada() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="sf-page"
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <ParticleCanvas />

      
      <div className="position-fixed" style={{ inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
        <div
          className="position-absolute animate-float-1 animate-pulse-glow"
          style={{
            width: 540, height: 540, top: "-12%", left: "-9%",
            background: "radial-gradient(circle, rgba(228,96,51,0.13) 0%, transparent 70%)",
            filter: "blur(65px)", borderRadius: "50%",
          }}
        />
        <div
          className="position-absolute animate-float-2"
          style={{
            width: 380, height: 380, bottom: "-6%", right: "4%",
            background: "radial-gradient(circle, rgba(240,112,64,0.10) 0%, transparent 70%)",
            filter: "blur(52px)", borderRadius: "50%",
          }}
        />
        <div
          className="position-absolute"
          style={{
            inset: 0,
            background: "radial-gradient(ellipse 75% 60% at 50% 30%, rgba(228,96,51,0.08) 0%, transparent 65%)",
          }}
        />
        <div
          className="position-fixed w-100"
          style={{
            top: 0, height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(228,96,51,0.55), transparent)",
          }}
        />
      </div>

      
      <div
        className="flex-grow-1 d-flex align-items-center justify-content-center position-relative"
        style={{ zIndex: 1 }}
      >
        <motion.img
          src="/logo.jpeg"
          alt="ServeFlow"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ scale: 1.06, boxShadow: "0 0 60px rgba(228,96,51,0.5)" }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/login")}
          style={{
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            objectFit: "cover",
            border: "3px solid rgba(228,96,51,0.3)",
            boxShadow: "0 0 40px rgba(228,96,51,0.2)",
            cursor: "pointer",
          }}
        />
      </div>
    </motion.div>
  );
}
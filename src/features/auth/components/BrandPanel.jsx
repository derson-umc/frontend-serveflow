import { motion } from 'framer-motion';
import { G, GD, O, W } from '../constants';

export function BrandPanel() {
  return (
    <div
      className="hidden lg:flex flex-col items-center justify-center flex-shrink-0 w-[420px] relative overflow-hidden"
      style={{ background: `linear-gradient(160deg, ${G} 0%, ${GD} 100%)` }}
    >
      <div className="absolute rounded-full opacity-10" style={{ width: 420, height: 420, top: '-20%', left: '-20%', background: W }} />
      <div className="absolute rounded-full opacity-10" style={{ width: 280, height: 280, bottom: '-10%', right: '-15%', background: O }} />

      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center text-center px-10"
      >
        <img
          src="/logo.jpeg"
          alt="ServeFlow"
          style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', border: '4px solid rgba(255,255,255,0.25)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', marginBottom: 24 }}
        />
        <h2 className="text-3xl font-black mb-3" style={{ color: W, letterSpacing: '-0.02em' }}>BEM-VINDO!</h2>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, lineHeight: 1.75, maxWidth: 260 }}>
          Gerencie seu restaurante com agilidade e eficiência.
        </p>
        <div className="mt-8 flex items-center gap-2">
          <div className="w-8 h-1 rounded-full" style={{ background: O }} />
          <div className="w-3 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.3)' }} />
          <div className="w-3 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.3)' }} />
        </div>
      </motion.div>
    </div>
  );
}

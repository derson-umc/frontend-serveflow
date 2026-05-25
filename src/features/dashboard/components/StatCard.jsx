import { motion } from "framer-motion";
import { palette } from "@styles/ds";

export default function StatCard({ label, value, icon, accent, bg }) {
  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
      transition={{ duration: 0.15 }}
      className="rounded-2xl p-5"
      style={{ background: palette.white, border: `1px solid ${palette.border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: palette.textMuted }}>{label}</p>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: bg || palette.greenSurface }}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold" style={{ color: accent || palette.textSecondary }}>{value}</p>
    </motion.div>
  );
}

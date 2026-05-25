import { AnimatePresence, motion } from "framer-motion";
import { palette } from "@styles/ds";

function Eye() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 12c1.7-4.3 5.4-7 9.5-7s7.8 2.7 9.5 7c-1.7 4.3-5.4 7-9.5 7s-7.8-2.7-9.5-7z" />
    </svg>
  );
}

function EyeOff() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 4.2A10.5 10.5 0 0112 4c4.1 0 7.8 2.7 9.5 7-.4 1-1 1.9-1.7 2.7M6.2 6.2C4.4 7.4 3 9.5 2.5 12c1.7 4.3 5.4 7 9.5 7 1.6 0 3-.4 4.3-1.1" />
    </svg>
  );
}

export default function PwField({ label, registration, error, show, onToggleShow, autoComplete, onKeyDown, onKeyUp }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: palette.textMuted }}>{label}</label>
      <div className="relative">
        <input
          {...registration}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
          className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all pr-10"
          style={{
            background: palette.surface, color: palette.textSecondary,
            border: `1.5px solid ${error ? palette.red : palette.border}`,
          }}
        />
        <button type="button" onClick={onToggleShow}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors"
          style={{ background: "none", border: "none", color: palette.textMuted, cursor: "pointer" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = palette.green)}
          onMouseLeave={(e) => (e.currentTarget.style.color = palette.textMuted)}>
          {show ? <EyeOff /> : <Eye />}
        </button>
      </div>
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-xs mt-1.5" style={{ color: palette.red }}>
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

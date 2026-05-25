import { motion } from 'framer-motion';
import { palette } from '@styles/ds';
import { PROGRESS_STEPS } from '../constants';

export function StatusProgress({ status }) {
  const idx = PROGRESS_STEPS.indexOf(status);
  if (idx === -1) return null;
  const pct = Math.round(((idx + 1) / PROGRESS_STEPS.length) * 100);
  return (
    <div style={{ height: 3, background: palette.border, borderRadius: 2, margin: '6px 0 2px', overflow: 'hidden' }}>
      <motion.div
        initial={false}
        animate={{ width: `${pct}%` }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        style={{ height: '100%', background: palette.green, borderRadius: 2 }}
      />
    </div>
  );
}

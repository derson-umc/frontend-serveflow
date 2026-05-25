import { AnimatePresence, motion } from 'framer-motion';
import { palette } from '@styles/ds';

export function MotionModal({ open = true, onClose, children, maxWidth = 'max-w-md' }) {
  if (!open) return null;
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 px-4"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            className={`w-full ${maxWidth} rounded-2xl p-6 shadow-2xl`}
            style={{
              background: palette.white,
              border: `1px solid ${palette.border}`,
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

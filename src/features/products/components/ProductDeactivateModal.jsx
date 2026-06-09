import { useState } from 'react';
import { motion } from 'framer-motion';
import { palette } from '@styles/ds';
import { useDeactivateProduct } from '../hooks/useProducts';
import { Spinner } from '@shared/components/feedback/Spinner';

function resolveErrorMessage(err) {
  const status = err?.response?.status;
  if (status === 400) return 'Não é possível excluir: produto possui vínculos ativos.';
  if (status === 404) return 'Produto não encontrado. Recarregue a página.';
  if (status >= 500) return 'Erro interno do servidor. Tente novamente em instantes.';
  return 'Falha ao excluir produto. Verifique a conexão e tente novamente.';
}

export function ProductDeactivateModal({ product, onClose }) {
  const deactivate = useDeactivateProduct();
  const [error, setError] = useState(null);

  async function handleConfirm() {
    setError(null);
    try {
      await deactivate.mutateAsync(product.id);
      onClose();
    } catch (err) {
      setError(resolveErrorMessage(err));
    }
  }

  function handleClose() {
    if (deactivate.isPending) return;
    setError(null);
    onClose();
  }

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-50 px-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <motion.div
        className="w-full max-w-sm rounded-2xl p-6 text-center"
        style={{ background: palette.white, border: `1px solid ${palette.border}`, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
      >
        <div className="w-14 h-14 rounded-full flex items-center justify-center text-3xl mx-auto mb-4"
          style={{ background: palette.redSurface }}>
          🗑️
        </div>

        <h3 className="text-lg font-bold mb-2" style={{ color: palette.textSecondary }}>Excluir Produto?</h3>

        <p className="text-sm mb-5" style={{ color: palette.textMuted }}>
          <span className="font-semibold" style={{ color: palette.textSecondary }}>{product.name}</span>{' '}
          será desativado e removido do menu.
        </p>

        {error && (
          <div
            className="text-sm mb-4 px-3 py-2.5 rounded-xl"
            style={{ background: palette.redSurface, border: `1px solid #EF9A9A`, color: palette.red }}
          >
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleClose}
            disabled={deactivate.isPending}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
            style={{
              background: '#F5F5F5',
              color: palette.textMuted,
              border: `1px solid ${palette.border}`,
              cursor: deactivate.isPending ? 'not-allowed' : 'pointer',
            }}
          >
            Cancelar
          </button>

          <button
            onClick={handleConfirm}
            disabled={deactivate.isPending}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
            style={{
              background: deactivate.isPending ? '#EF9A9A' : palette.red,
              color: palette.white,
              border: 'none',
              cursor: deactivate.isPending ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => { if (!deactivate.isPending) e.currentTarget.style.background = '#B71C1C'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = deactivate.isPending ? '#EF9A9A' : palette.red; }}
          >
            {deactivate.isPending
              ? <><Spinner size={15} color={palette.white} /> Excluindo...</>
              : 'Excluir'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

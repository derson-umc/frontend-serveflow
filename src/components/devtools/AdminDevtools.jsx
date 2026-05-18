import { lazy, Suspense, useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';

const ReactQueryDevtools = lazy(() =>
  import('@tanstack/react-query-devtools').then((m) => ({
    default: m.ReactQueryDevtools,
  }))
);

export function AdminDevtools() {
  const user = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false);

  const isAdmin = user?.role === 'admin';
  const enabled = import.meta.env.VITE_DEVTOOLS_ENABLED === 'true';

  if (!isAdmin || !enabled) return null;

  return (
    <>
      <button
        onClick={() => setOpen((prev) => !prev)}
        title="Ferramentas de desenvolvedor"
        style={{
          position: 'fixed',
          top: 60,
          right: 12,
          zIndex: 9999,
          background: open ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.12)',
          border: '1px solid rgba(255,255,255,0.28)',
          borderRadius: 8,
          padding: '4px 8px',
          cursor: 'pointer',
          fontSize: 14,
          lineHeight: 1,
          transition: 'background 0.15s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.22)')}
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = open
            ? 'rgba(255,255,255,0.25)'
            : 'rgba(255,255,255,0.12)')
        }
      >
        ⚙️
      </button>

      {open && (
        <Suspense fallback={null}>
          <ReactQueryDevtools initialIsOpen buttonPosition="bottom-right" />
        </Suspense>
      )}
    </>
  );
}

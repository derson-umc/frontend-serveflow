export function Spinner({ size = 24, color = 'var(--color-success)' }) {
  return (
    <span
      aria-label="Carregando"
      role="status"
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        border: `2px solid var(--color-border)`,
        borderTopColor: color,
        animation: 'spin 0.7s linear infinite',
        flexShrink: 0,
      }}
    />
  );
}

export function Loading({ message = 'Carregando...', fullPage = false }) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Spinner size={32} />
      {message && (
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
          }}
        >
          {message}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="flex items-center justify-center"
        style={{ height: '100vh', background: 'var(--color-bg)' }}>
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      {content}
    </div>
  );
}

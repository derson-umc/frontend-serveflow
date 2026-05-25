const variants = {
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-error',
  info: 'badge-info',
  default:
    'bg-[var(--color-bg)] text-[var(--color-text-secondary)] border border-[var(--color-border)]',
};

export function Badge({ variant = 'default', children, className = '' }) {
  return (
    <span className={`badge ${variants[variant] ?? variants.default} ${className}`}>
      {children}
    </span>
  );
}

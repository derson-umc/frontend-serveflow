import { Button } from './Button';

export function EmptyState({
  icon,
  title,
  description,
  action,
  actionLabel,
  compact = false,
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${compact ? 'py-8 px-4' : 'py-16 px-6'} gap-3`}
    >
      {icon && (
        <div
          style={{
            width: compact ? 44 : 56,
            height: compact ? 44 : 56,
            borderRadius: 'var(--radius-lg)',
            background: 'var(--color-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-disabled)',
            border: '1px solid var(--color-border)',
          }}
        >
          {icon}
        </div>
      )}
      {title && (
        <p
          style={{
            fontWeight: 'var(--font-semibold)',
            fontSize: compact ? 'var(--text-sm)' : 'var(--text-base)',
            color: 'var(--color-text-primary)',
          }}
        >
          {title}
        </p>
      )}
      {description && (
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
            maxWidth: 280,
          }}
        >
          {description}
        </p>
      )}
      {action && actionLabel && (
        <Button variant="primary" size="sm" onClick={action} className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

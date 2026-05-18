import { forwardRef } from 'react';

const variants = {
  primary:
    'bg-[var(--color-success)] text-white border-transparent hover:bg-[var(--color-success-dark)] active:scale-95',
  danger:
    'bg-[var(--color-error-surface)] text-[var(--color-error)] border-[var(--color-error-border)] hover:bg-[var(--color-error)] hover:text-white active:scale-95',
  warning:
    'bg-[var(--color-warning-surface)] text-[var(--color-warning)] border-[var(--color-warning-border)] hover:bg-[var(--color-accent)] hover:text-white active:scale-95',
  ghost:
    'bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border)] hover:bg-[var(--color-bg)] active:scale-95',
  brand:
    'bg-[var(--color-primary)] text-white border-transparent hover:bg-[var(--color-primary-dark)] active:scale-95',
};

const sizes = {
  xs: 'px-2 py-1 text-[var(--text-xs)] rounded-[var(--radius-sm)] gap-1',
  sm: 'px-3 py-1.5 text-[var(--text-sm)] rounded-[var(--radius-md)] gap-1.5',
  md: 'px-4 py-2 text-[var(--text-sm)] rounded-[var(--radius-md)] gap-2',
  lg: 'px-5 py-3 text-[var(--text-base)] rounded-[var(--radius-lg)] gap-2',
};

export const Button = forwardRef(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      disabled = false,
      icon,
      iconRight,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={[
          'inline-flex items-center justify-center font-semibold border',
          'transition-all duration-[var(--transition-base)] select-none',
          'focus-visible:outline-2 focus-visible:outline-offset-2',
          variants[variant] ?? variants.primary,
          sizes[size] ?? sizes.md,
          fullWidth ? 'w-full' : '',
          isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {loading ? (
          <span
            className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin"
            aria-hidden
          />
        ) : (
          icon
        )}
        {children}
        {!loading && iconRight}
      </button>
    );
  }
);

Button.displayName = 'Button';

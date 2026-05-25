import { forwardRef } from 'react';

export const Input = forwardRef(
  (
    {
      label,
      error,
      hint,
      icon,
      iconRight,
      fullWidth = true,
      className = '',
      containerClassName = '',
      ...props
    },
    ref
  ) => {
    return (
      <div className={`flex flex-col gap-1 ${containerClassName}`}>
        {label && (
          <label className="form-label" htmlFor={props.id}>
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <span className="absolute left-3 text-[var(--color-text-disabled)] flex items-center pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            className={[
              'form-input',
              icon ? 'pl-9' : '',
              iconRight ? 'pr-9' : '',
              error ? 'error' : '',
              fullWidth ? 'w-full' : '',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            {...props}
          />
          {iconRight && (
            <span className="absolute right-3 text-[var(--color-text-disabled)] flex items-center">
              {iconRight}
            </span>
          )}
        </div>
        {error && <span className="form-error">{error}</span>}
        {!error && hint && (
          <span className="text-[var(--text-xs)] text-[var(--color-text-disabled)]">{hint}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

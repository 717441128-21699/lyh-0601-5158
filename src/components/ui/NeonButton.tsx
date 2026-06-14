import { ReactNode, ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

type Variant = 'primary' | 'success' | 'warning' | 'danger' | 'ghost';

interface NeonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
}

const variantMap: Record<Variant, string> = {
  primary: 'neon-btn-primary',
  success: 'neon-btn-success',
  warning: 'neon-btn-warning',
  danger: 'neon-btn-danger',
  ghost:
    'neon-btn !bg-transparent !border-glass-border text-text-secondary hover:!border-tech-cyan/50 hover:text-tech-cyan hover:!shadow-neon-cyan',
};

export const NeonButton = ({
  variant = 'primary',
  icon,
  iconRight,
  fullWidth,
  loading,
  className,
  children,
  disabled,
  ...rest
}: NeonButtonProps) => {
  return (
    <button
      className={clsx(
        variantMap[variant],
        fullWidth && 'w-full',
        (disabled || loading) && 'opacity-60 cursor-not-allowed pointer-events-none',
        'inline-flex items-center justify-center gap-2',
        className
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && (
        <span className="inline-block w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      )}
      {!loading && icon}
      {children}
      {!loading && iconRight}
    </button>
  );
};

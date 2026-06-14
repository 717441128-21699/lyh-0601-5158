import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  icon?: ReactNode;
  cornerMark?: boolean;
  padding?: string;
}

export const GlassCard = ({ children, className, title, icon, cornerMark = true, padding = 'p-5' }: GlassCardProps) => {
  return (
    <div
      className={clsx(
        'glass-panel',
        cornerMark && 'hud-corner',
        padding,
        className
      )}
    >
      {title && (
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-glass-border">
          {icon && <span className="text-tech-cyan">{icon}</span>}
          <h3 className="section-title !mb-0">{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
};

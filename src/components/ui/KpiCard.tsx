import { ReactNode } from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { clsx } from 'clsx';
import { ProgressRing } from './ProgressRing';

type Trend = 'up' | 'down' | 'flat';

interface KpiCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: ReactNode;
  color?: 'cyan' | 'green' | 'gold' | 'red';
  trend?: Trend;
  trendValue?: string;
  progress?: number;
  progressLabel?: string;
}

const colorMap = {
  cyan: {
    text: 'text-tech-cyan',
    border: 'border-tech-cyan/25',
    icon: 'bg-tech-cyan/15 text-tech-cyan',
    ringColor: '#00D4FF',
  },
  green: {
    text: 'text-eco-green',
    border: 'border-eco-green/25',
    icon: 'bg-eco-green/15 text-eco-green',
    ringColor: '#00FF88',
  },
  gold: {
    text: 'text-approval-gold',
    border: 'border-approval-gold/25',
    icon: 'bg-approval-gold/15 text-approval-gold',
    ringColor: '#FFD700',
  },
  red: {
    text: 'text-danger-red',
    border: 'border-danger-red/25',
    icon: 'bg-danger-red/15 text-danger-red',
    ringColor: '#FF3355',
  },
};

const TrendIcon = ({ trend }: { trend: Trend }) => {
  if (trend === 'up') return <ArrowUp className="w-3.5 h-3.5 text-eco-green" />;
  if (trend === 'down') return <ArrowDown className="w-3.5 h-3.5 text-danger-red" />;
  return <Minus className="w-3.5 h-3.5 text-text-muted" />;
};

export const KpiCard = ({
  label,
  value,
  unit,
  icon,
  color = 'cyan',
  trend,
  trendValue,
  progress,
  progressLabel,
}: KpiCardProps) => {
  const c = colorMap[color];
  return (
    <div
      className={clsx(
        'glass-panel hud-corner px-4 py-3 flex items-center gap-4 min-w-[200px]',
        c.border
      )}
      style={{ boxShadow: `inset 0 0 30px ${c.ringColor}08` }}
    >
      <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center shrink-0', c.icon)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-text-secondary mb-1 truncate">{label}</div>
        <div className={clsx('flex items-baseline gap-1', c.text)}>
          <span className="font-tech text-2xl font-bold tracking-wider">{value}</span>
          {unit && <span className="text-xs text-text-muted">{unit}</span>}
        </div>
        {(trend || trendValue) && (
          <div className="flex items-center gap-1 mt-0.5 text-[11px] text-text-muted">
            {trend && <TrendIcon trend={trend} />}
            {trendValue && <span>{trendValue}</span>}
          </div>
        )}
      </div>
      {progress !== undefined && (
        <ProgressRing
          value={progress}
          size={56}
          strokeWidth={5}
          color={c.ringColor}
          label={progressLabel}
          showValue={false}
        />
      )}
    </div>
  );
};

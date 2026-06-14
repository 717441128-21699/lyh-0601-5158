import { clsx } from 'clsx';

interface ProgressRingProps {
  value: number;
  max?: number;
  label?: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
  showValue?: boolean;
  warningThreshold?: number;
  dangerThreshold?: number;
}

export const ProgressRing = ({
  value,
  max = 100,
  label,
  size = 80,
  strokeWidth = 7,
  color = '#00D4FF',
  showValue = true,
  warningThreshold,
  dangerThreshold,
}: ProgressRingProps) => {
  const percent = Math.max(0, Math.min(1, value / max));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - percent);

  let actualColor = color;
  if (dangerThreshold !== undefined && value >= dangerThreshold) {
    actualColor = '#FF3355';
  } else if (warningThreshold !== undefined && value >= warningThreshold) {
    actualColor = '#FF8800';
  }

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <filter id={`ring-glow-${label}`}>
            <feGaussianBlur stdDeviation="1.8" />
          </filter>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(26, 45, 74, 0.8)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={actualColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          filter={`url(#ring-glow-${label})`}
          style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showValue && (
          <span
            className={clsx('font-tech font-bold', size < 100 ? 'text-sm' : 'text-base')}
            style={{ color: actualColor }}
          >
            {value.toFixed(0)}%
          </span>
        )}
        {label && <span className="text-[10px] text-text-muted mt-0.5">{label}</span>}
      </div>
    </div>
  );
};

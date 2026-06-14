import { clsx } from 'clsx';

interface GaugeProps {
  value: number;
  min?: number;
  max?: number;
  label?: string;
  unit?: string;
  color?: string;
  size?: number;
  warningThreshold?: number;
  dangerThreshold?: number;
}

export const Gauge = ({
  value,
  min = 0,
  max = 100,
  label,
  unit = '%',
  color = '#00D4FF',
  size = 140,
  warningThreshold,
  dangerThreshold,
}: GaugeProps) => {
  const percent = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius;
  const dashOffset = circumference * (1 - percent);

  let actualColor = color;
  if (dangerThreshold !== undefined && value >= dangerThreshold) {
    actualColor = '#FF3355';
  } else if (warningThreshold !== undefined && value >= warningThreshold) {
    actualColor = '#FF8800';
  }

  const cx = size / 2;
  const cy = size / 2 + 8;

  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size * 0.7} viewBox={`0 0 ${size} ${size * 0.7}`}>
        <defs>
          <linearGradient id={`gauge-grad-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={actualColor} stopOpacity="0.6" />
            <stop offset="100%" stopColor={actualColor} stopOpacity="1" />
          </linearGradient>
          <filter id={`gauge-glow-${label}`}>
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="rgba(26, 45, 74, 0.8)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke={`url(#gauge-grad-${label})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          filter={`url(#gauge-glow-${label})`}
          style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.3s ease' }}
        />
        <text
          x={cx}
          y={cy - 10}
          textAnchor="middle"
          className="font-tech font-bold"
          fontSize={size * 0.2}
          fill={actualColor}
          style={{ filter: `drop-shadow(0 0 4px ${actualColor})` }}
        >
          {value.toFixed(1)}
          <tspan fontSize={size * 0.12} fill="#8AB4D8" dx="2">
            {unit}
          </tspan>
        </text>
      </svg>
      {label && (
        <div className="text-sm text-text-secondary mt-1 tracking-wide">{label}</div>
      )}
    </div>
  );
};

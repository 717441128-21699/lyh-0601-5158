import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { useState } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export const Timeline3D = () => {
  const isPlaying = useAppStore((s) => s.isPlayingTimeline);
  const setPlaying = useAppStore((s) => s.setIsPlayingTimeline);
  const [progress, setProgress] = useState(0.42);

  const days = Array.from({ length: 5 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 4 + i);
    return d;
  });

  const events = [
    { pct: 0.1, label: '方案审批', color: 'approval-gold' },
    { pct: 0.28, label: '暴雨预警', color: 'warn-orange' },
    { pct: 0.45, label: '003返航', color: 'danger-red' },
    { pct: 0.65, label: '陶粒补产', color: 'eco-green' },
    { pct: 0.82, label: '季度结算', color: 'tech-cyan' },
  ];

  return (
    <div className="h-28 bg-ocean-dark/80 backdrop-blur-xl border-t border-glass-border flex flex-col px-6 pt-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="text-sm font-semibold text-tech-cyan flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-tech-cyan animate-pulse" />
            3D 调度时间轴
          </div>
          <span className="text-xs text-text-muted">
            进度：{(progress * 100).toFixed(1)}%
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setProgress(Math.max(0, progress - 0.05))}
            className="w-8 h-8 rounded flex items-center justify-center text-text-secondary hover:bg-ocean-mid hover:text-tech-cyan transition"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={() => setPlaying(!isPlaying)}
            className={clsx(
              'w-9 h-9 rounded-full flex items-center justify-center transition-all',
              isPlaying
                ? 'bg-tech-cyan/20 text-tech-cyan border border-tech-cyan/50 shadow-neon-cyan'
                : 'bg-ocean-mid text-text-secondary hover:text-tech-cyan border border-glass-border'
            )}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <button
            onClick={() => setProgress(Math.min(1, progress + 0.05))}
            className="w-8 h-8 rounded flex items-center justify-center text-text-secondary hover:bg-ocean-mid hover:text-tech-cyan transition"
          >
            <SkipForward className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-glass-border mx-1" />
          <button className="w-8 h-8 rounded flex items-center justify-center text-text-secondary hover:bg-ocean-mid hover:text-tech-cyan transition">
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 relative">
        <div className="absolute inset-x-0 top-4 h-10">
          <div className="h-full flex items-end gap-2 px-1">
            {days.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-end justify-end gap-0.5 h-full">
                <div className="w-full bg-gradient-to-t from-tech-cyan/60 to-tech-cyan/20 rounded-t border-t border-x border-tech-cyan/40" style={{ height: `${20 + ((i + 1) % 3) * 20}%` }} />
                <div className="w-full bg-gradient-to-t from-eco-green/50 to-eco-green/15 rounded-t border-t border-x border-eco-green/30" style={{ height: `${15 + (i % 2) * 25}%` }} />
              </div>
            ))}
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-7">
          <div className="relative h-2 bg-ocean-mid/80 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-tech-cyan via-tech-cyan-soft to-eco-green rounded-full shadow-neon-cyan flow-line"
              style={{ width: `${progress * 100}%`, color: '#00D4FF' }}
            />
            <input
              type="range"
              min={0}
              max={100}
              value={progress * 100}
              onChange={(e) => setProgress(Number(e.target.value) / 100)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          {events.map((ev, i) => (
            <div
              key={i}
              className="absolute -top-1 -translate-x-1/2 cursor-pointer group"
              style={{ left: `${ev.pct * 100}%` }}
            >
              <div
                className={clsx(
                  'w-4 h-4 rounded-full border-2 border-ocean-dark scale-75 group-hover:scale-125 transition-transform animate-pulse',
                  ev.color === 'approval-gold' && 'bg-approval-gold',
                  ev.color === 'warn-orange' && 'bg-warn-orange',
                  ev.color === 'danger-red' && 'bg-danger-red',
                  ev.color === 'eco-green' && 'bg-eco-green',
                  ev.color === 'tech-cyan' && 'bg-tech-cyan'
                )}
                style={{
                  boxShadow: `0 0 8px var(--tw-shadow-color)`,
                }}
              />
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] px-2 py-0.5 rounded bg-ocean-dark/95 border border-glass-border text-text-primary opacity-0 group-hover:opacity-100 transition">
                {ev.label}
              </div>
            </div>
          ))}
        </div>

        <div className="absolute inset-x-0 bottom-0 flex justify-between text-[11px] text-text-muted">
          {days.map((d, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="font-tech text-tech-cyan-soft">{format(d, 'MM/dd')}</span>
              <span className="text-[10px]">{format(d, 'EEE', { locale: zhCN })}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

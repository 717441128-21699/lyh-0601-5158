import { Bell, Search, Clock, Calendar, MapPin } from 'lucide-react';
import { useState } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { usePermission } from '@/hooks/usePermission';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export const TopBar = () => {
  const alertCount = useAppStore((s) => s.alertCount);
  const { currentUser, roleLabel } = usePermission();
  const [showAlerts, setShowAlerts] = useState(false);
  const now = new Date();

  return (
    <header className="h-14 flex items-center justify-between px-6 bg-ocean-dark/60 backdrop-blur-xl border-b border-glass-border">
      <div className="flex items-center gap-6">
        <div>
          <h1 className="text-lg font-bold text-gradient-cyan tracking-wide">
            城市河道清淤与污泥资源化利用 · 智能调度平台
          </h1>
          <div className="flex items-center gap-3 text-[11px] text-text-muted mt-0.5">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              市水务局 · 智慧水务指挥中心
            </span>
            <span className="w-px h-3 bg-glass-border" />
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(now, 'yyyy年MM月dd日 EEEE', { locale: zhCN })}
            </span>
            <span className="w-px h-3 bg-glass-border" />
            <span className="flex items-center gap-1 font-tech text-tech-cyan-soft">
              <Clock className="w-3 h-3" />
              {format(now, 'HH:mm:ss')}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            placeholder="搜索船舶/车辆/设备..."
            className="input-field !w-64 !py-2 !pl-9 !pr-4 text-sm"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className={clsx(
              'relative w-10 h-10 rounded-lg flex items-center justify-center transition-all',
              showAlerts
                ? 'bg-warn-orange/15 text-warn-orange border border-warn-orange/30'
                : 'text-text-secondary hover:bg-ocean-mid hover:text-warn-orange-soft border border-transparent'
            )}
          >
            <Bell className="w-5 h-5" />
            {alertCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-danger-red text-white text-[10px] font-bold flex items-center justify-center border-2 border-ocean-dark animate-pulse">
                {alertCount}
              </span>
            )}
          </button>
          {showAlerts && (
            <div className="absolute right-0 top-12 w-80 glass-panel p-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="text-sm font-semibold text-text-primary mb-3 border-b border-glass-border pb-2">
                预警通知
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-thin">
                <div className="p-2 rounded-lg bg-danger-red/10 border border-danger-red/20">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-danger-red font-medium">清淤-002 液位超标</span>
                    <span className="text-text-muted">2分钟前</span>
                  </div>
                  <div className="text-[11px] text-text-secondary mt-1">船舱液位83%，已触发返航</div>
                </div>
                <div className="p-2 rounded-lg bg-warn-orange/10 border border-warn-orange/20">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-warn-orange font-medium">2号离心机含水率超标</span>
                    <span className="text-text-muted">8分钟前</span>
                  </div>
                  <div className="text-[11px] text-text-secondary mt-1">当前71%，已自动提转速至3400rpm</div>
                </div>
                <div className="p-2 rounded-lg bg-warn-orange/10 border border-warn-orange/20">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-warn-orange font-medium">陶粒库存低于阈值</span>
                    <span className="text-text-muted">25分钟前</span>
                  </div>
                  <div className="text-[11px] text-text-secondary mt-1">当前820吨，安全阈值1000吨</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pl-4 border-l border-glass-border">
          <div className="text-right">
            <div className="text-sm font-medium text-text-primary">{currentUser?.name}</div>
            <div className="text-[11px] text-approval-gold">{roleLabel(currentUser?.role)}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-approval-gold/40 to-tech-cyan/30 border border-approval-gold/50 flex items-center justify-center text-approval-gold font-bold">
            {currentUser?.name?.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
};

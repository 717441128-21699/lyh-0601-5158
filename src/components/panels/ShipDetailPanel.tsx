import { X, Anchor, Users, Clock, Activity, Droplets, Gauge as GaugeIcon } from 'lucide-react';
import EChartsReact from 'echarts-for-react';
import { useMemo } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAppStore } from '@/stores/useAppStore';
import { NeonButton } from '@/components/ui/NeonButton';

export const ShipDetailPanel = () => {
  const ship = useAppStore((s) => s.ships.find((sh) => sh.id === s.selectedShipId));
  const setSelectedShip = useAppStore((s) => s.setSelectedShip);
  const triggerReturn = useAppStore((s) => s.triggerShipReturn);

  if (!ship) {
    return (
      <GlassCard className="!p-8 text-center h-full flex flex-col items-center justify-center">
        <Anchor className="w-16 h-16 text-text-muted/40 mb-4" />
        <div className="text-text-secondary text-sm">点击3D场景中的清淤船</div>
        <div className="text-text-muted text-xs mt-1">查看船舶实时数据与历史曲线</div>
      </GlassCard>
    );
  }

  const dredgeOption = useMemo(
    () => ({
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(13,31,56,0.95)', borderColor: 'rgba(0,212,255,0.3)', textStyle: { color: '#E8F4FF' } },
      grid: { top: 10, right: 15, bottom: 22, left: 38 },
      xAxis: {
        type: 'category',
        data: ship.hourlyData.map((h) => `${h.hour}:00`),
        axisLabel: { color: '#8AB4D8', fontSize: 10, interval: 2 },
        axisLine: { lineStyle: { color: 'rgba(0,212,255,0.2)' } },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#8AB4D8', fontSize: 10 },
        axisLine: { show: false },
        splitLine: { lineStyle: { color: 'rgba(0,212,255,0.08)' } },
      },
      series: [
        {
          type: 'line',
          smooth: true,
          symbol: 'none',
          data: ship.hourlyData.map((h) => h.volume.toFixed(1)),
          lineStyle: { color: '#00D4FF', width: 2, shadowColor: '#00D4FF', shadowBlur: 10 },
          areaStyle: {
            color: {
              type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(0,212,255,0.35)' },
                { offset: 1, color: 'rgba(0,212,255,0)' },
              ],
            },
          },
        },
      ],
    }),
    [ship]
  );

  const pumpOption = useMemo(
    () => ({
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(13,31,56,0.95)', borderColor: 'rgba(0,255,136,0.3)', textStyle: { color: '#E8F4FF' } },
      grid: { top: 10, right: 15, bottom: 22, left: 38 },
      xAxis: {
        type: 'category',
        data: ship.hourlyData.map((h) => `${h.hour}:00`),
        axisLabel: { color: '#8AB4D8', fontSize: 10, interval: 3 },
        axisLine: { lineStyle: { color: 'rgba(0,255,136,0.2)' } },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value', min: 1, max: 4,
        axisLabel: { color: '#8AB4D8', fontSize: 10 },
        axisLine: { show: false },
        splitLine: { lineStyle: { color: 'rgba(0,255,136,0.08)' } },
      },
      series: [
        {
          type: 'line',
          smooth: true,
          showSymbol: true,
          symbolSize: 4,
          data: ship.hourlyData.map((h) => h.pressure.toFixed(2)),
          lineStyle: { color: '#00FF88', width: 1.8 },
          itemStyle: { color: '#00FF88', borderColor: '#0D1F38', borderWidth: 2 },
          markLine: {
            silent: true,
            lineStyle: { color: '#FF8800', type: 'dashed' },
            data: [{ yAxis: 3, label: { formatter: '警戒值 3MPa', color: '#FF8800', fontSize: 10 } }],
          },
        },
      ],
    }),
    [ship]
  );

  const statusMap: Record<string, string> = {
    working: '作业中',
    returning: '返航中',
    docking: '停靠中',
    idle: '待命',
  };
  const statusColor: Record<string, string> = {
    working: 'badge-green',
    returning: 'badge-cyan',
    docking: 'badge-gold',
    idle: '',
  };

  return (
    <GlassCard cornerMark className="!p-0 overflow-hidden flex flex-col h-full">
      <div className="px-4 py-3 border-b border-glass-border flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-tech font-bold text-lg text-tech-cyan">{ship.shipNo}</h3>
            <span className={statusColor[ship.status]}>{statusMap[ship.status]}</span>
          </div>
          <div className="text-[11px] text-text-muted mt-0.5 flex items-center gap-2">
            <span className="flex items-center gap-1"><Anchor className="w-3 h-3" /> {ship.workSection}</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> 船员{ship.crewCount}人</span>
          </div>
        </div>
        <button
          onClick={() => setSelectedShip(null)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-ocean-mid hover:text-text-primary transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4 flex-1 overflow-y-auto scrollbar-thin">
        {/* 参数网格 */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-lg bg-ocean-dark/60 border border-glass-border">
            <div className="text-[10px] text-text-muted mb-1 flex items-center gap-1">
              <Droplets className="w-3 h-3" /> 船舱液位
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-tech text-2xl font-bold" style={{ color: ship.tankLevel >= 80 ? '#FF3355' : ship.tankLevel >= 60 ? '#FF8800' : '#00FF88' }}>
                {ship.tankLevel.toFixed(0)}
              </span>
              <span className="text-[11px] text-text-muted">%</span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-ocean-mid overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{
                width: `${ship.tankLevel}%`,
                backgroundColor: ship.tankLevel >= 80 ? '#FF3355' : ship.tankLevel >= 60 ? '#FF8800' : '#00FF88',
              }} />
            </div>
          </div>
          <div className="p-3 rounded-lg bg-ocean-dark/60 border border-glass-border">
            <div className="text-[10px] text-text-muted mb-1 flex items-center gap-1">
              <Activity className="w-3 h-3" /> 累计清淤
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-tech text-2xl font-bold text-tech-cyan">{ship.currentDredgeVolume.toFixed(1)}</span>
              <span className="text-[11px] text-text-muted">/ {ship.totalCapacity}t</span>
            </div>
            <div className="mt-1 text-[10px] text-text-secondary">
              完成率 <span className="font-tech text-tech-cyan-soft">{((ship.currentDredgeVolume / ship.totalCapacity) * 100).toFixed(1)}%</span>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-ocean-dark/60 border border-glass-border">
            <div className="text-[10px] text-text-muted mb-1 flex items-center gap-1">
              <GaugeIcon className="w-3 h-3" /> 泵压
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-tech text-2xl font-bold text-warn-orange">{ship.pumpPressure.toFixed(2)}</span>
              <span className="text-[11px] text-text-muted">MPa</span>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-ocean-dark/60 border border-glass-border">
            <div className="text-[10px] text-text-muted mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3" /> 今日作业
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-tech text-2xl font-bold text-approval-gold">
                {ship.hourlyData.reduce((s, h) => s + h.volume, 0).toFixed(0)}
              </span>
              <span className="text-[11px] text-text-muted">t</span>
            </div>
          </div>
        </div>

        {/* 24h清淤曲线 */}
        <div className="rounded-lg border border-glass-border overflow-hidden">
          <div className="px-3 py-2 border-b border-glass-border text-xs text-tech-cyan font-medium flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" /> 近24小时清淤量曲线
          </div>
          <div className="h-36">
            <EChartsReact option={dredgeOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>

        {/* 泵压曲线 */}
        <div className="rounded-lg border border-glass-border overflow-hidden">
          <div className="px-3 py-2 border-b border-glass-border text-xs text-eco-green font-medium flex items-center gap-1.5">
            <GaugeIcon className="w-3.5 h-3.5" /> 近24小时泵压数据
          </div>
          <div className="h-32">
            <EChartsReact option={pumpOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>

        {/* 操作按钮 */}
        {ship.status === 'working' && ship.tankLevel < 80 && (
          <NeonButton fullWidth variant="warning" onClick={() => triggerReturn(ship.id)}>
            触发手动返航
          </NeonButton>
        )}
      </div>
    </GlassCard>
  );
};

export default ShipDetailPanel;

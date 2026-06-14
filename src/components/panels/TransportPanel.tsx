import { Truck, Star, MapPin, Clock, Timer, BarChart3 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAppStore } from '@/stores/useAppStore';
import { clsx } from 'clsx';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useMemo } from 'react';
import EChartsReact from 'echarts-for-react';

const statusLabels: Record<string, string> = {
  loading: '装料中',
  transporting: '运输中',
  queuing: '排队等待',
  unloading: '卸料中',
  returning: '返程中',
};
const statusBadge: Record<string, string> = {
  loading: 'badge-gold',
  transporting: 'badge-green',
  queuing: 'badge-orange',
  unloading: 'badge-cyan',
  returning: '',
};

export const TransportPanel = () => {
  const trucks = useAppStore((s) => s.trucks);
  const plants = useAppStore((s) => s.plants);
  const selectedTruckId = useAppStore((s) => s.selectedTruckId);
  const setSelectedTruck = useAppStore((s) => s.setSelectedTruck);

  const plantNameMap = useMemo(
    () => Object.fromEntries(plants.map((p) => [p.id, p.name.replace('脱水处理厂', '')])),
    [plants]
  );

  const queueByPlant = useMemo(() => {
    const m: Record<string, typeof trucks> = {};
    plants.forEach((p) => (m[p.id] = []));
    trucks.forEach((t) => {
      if (t.status === 'queuing' || t.status === 'unloading') {
        m[t.targetPlantId]?.push(t);
      }
    });
    return m;
  }, [trucks, plants]);

  const loadDistOption = useMemo(() => ({
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(13,31,56,0.95)', borderColor: 'rgba(0,255,136,0.3)', textStyle: { color: '#E8F4FF' } },
    grid: { top: 8, right: 10, bottom: 20, left: 32 },
    xAxis: { type: 'category', data: plants.map((p) => plantNameMap[p.id] || p.name), axisLabel: { color: '#8AB4D8', fontSize: 10 }, axisLine: { lineStyle: { color: 'rgba(0,212,255,0.2)' } }, axisTick: { show: false } },
    yAxis: { type: 'value', axisLabel: { color: '#8AB4D8', fontSize: 10 }, axisLine: { show: false }, splitLine: { lineStyle: { color: 'rgba(0,212,255,0.08)' } } },
    series: [{
      type: 'bar', barWidth: 18,
      data: plants.map((p) => ({
        value: Math.round(p.processingLoad),
        itemStyle: {
          color: p.processingLoad >= 85 ? { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#FF3355' }, { offset: 1, color: '#FF6680' }] }
            : p.processingLoad >= 65 ? { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#FF8800' }, { offset: 1, color: '#FFAA44' }] }
            : { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#00FF88' }, { offset: 1, color: '#66FFB2' }] },
          borderRadius: [4, 4, 0, 0],
        },
      })),
      label: { show: true, position: 'top', color: '#E8F4FF', fontSize: 10, formatter: '{c}%', fontFamily: 'Orbitron' },
    }],
  }), [plants, plantNameMap]);

  return (
    <GlassCard cornerMark className="!p-0 overflow-hidden flex flex-col h-full">
      <div className="px-4 py-3 border-b border-glass-border flex items-center justify-between">
        <h3 className="section-title !mb-0 text-base">
          <Truck className="w-4 h-4 text-eco-green" />
          运输调度中心
        </h3>
        <span className="badge-green">{trucks.filter((t) => t.status === 'transporting').length}辆在途</span>
      </div>

      <div className="p-4 space-y-4 flex-1 overflow-y-auto scrollbar-thin">
        {/* 处理厂负荷 */}
        <div className="rounded-lg border border-glass-border overflow-hidden">
          <div className="px-3 py-2 border-b border-glass-border text-xs text-text-primary flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-tech-cyan" />
            各处理厂实时负荷
          </div>
          <div className="h-28 p-2">
            <EChartsReact option={loadDistOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>

        {/* 各厂排队情况 */}
        <div className="grid grid-cols-3 gap-2">
          {plants.map((p) => (
            <div key={p.id} className="p-2.5 rounded-lg bg-ocean-dark/60 border border-glass-border">
              <div className="text-[10px] text-text-muted mb-1">{plantNameMap[p.id]}</div>
              <div className="flex items-baseline gap-1">
                <span className="font-tech text-xl font-bold text-tech-cyan">{queueByPlant[p.id]?.length || 0}</span>
                <span className="text-[10px] text-text-secondary">辆等待</span>
              </div>
              <div className="mt-1.5 space-y-0.5">
                {queueByPlant[p.id]?.slice(0, 2).map((t) => (
                  <div key={t.id} className="text-[9px] text-text-secondary flex justify-between">
                    <span>{t.plateNo.slice(-4)}</span>
                    <span className="text-warn-orange">#{t.queuePosition} ★{t.priority}</span>
                  </div>
                ))}
                {(queueByPlant[p.id]?.length || 0) > 2 && (
                  <div className="text-[9px] text-text-muted">+{(queueByPlant[p.id]?.length || 0) - 2}更多</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 车辆列表 */}
        <div>
          <div className="text-xs font-medium text-text-primary mb-2 flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5" />
            实时车辆列表
          </div>
          <div className="space-y-2">
            {trucks.map((t) => {
              const selected = selectedTruckId === t.id;
              const eta = t.status === 'queuing'
                ? `等待 ${Math.ceil(t.waitTime / 60000)}分`
                : t.status === 'transporting' && t.estimatedArrival
                ? `预计 ${formatDistanceToNow(t.estimatedArrival, { locale: zhCN, addSuffix: true })}`
                : '';
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTruck(selected ? null : t.id)}
                  className={clsx(
                    'p-2.5 rounded-lg border cursor-pointer transition-all',
                    selected
                      ? 'bg-ocean-dark border-eco-green/50 shadow-neon-green'
                      : 'bg-ocean-dark/50 border-glass-border hover:border-tech-cyan/40 hover:bg-ocean-dark/80'
                  )}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-tech font-semibold text-sm text-text-primary">{t.plateNo}</span>
                      <span className={statusBadge[t.status]}>{statusLabels[t.status]}</span>
                    </div>
                    <div className="text-warn-orange text-xs">
                      <Star className="w-3 h-3 inline fill-warn-orange" />
                      {t.priority}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="flex items-center gap-1 text-text-secondary">
                      <MapPin className="w-3 h-3 text-tech-cyan" />
                      {plantNameMap[t.targetPlantId] || '—'}厂
                    </span>
                    <span className="flex items-center gap-1 text-text-secondary">
                      {t.status === 'queuing' ? (
                        <>
                          <Timer className="w-3 h-3" />
                          <span className="text-warn-orange font-semibold">#{t.queuePosition} 队列</span>
                          <span>{eta || '—'}</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3" />
                          {eta || '—'}
                        </>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="flex-1 h-1.5 rounded-full bg-ocean-mid overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(t.loadWeight / t.maxLoad) * 100}%`,
                          backgroundColor: t.status === 'unloading' ? '#00D4FF' : '#00FF88',
                        }}
                      />
                    </div>
                    <span className="font-tech text-[10px] text-text-secondary">
                      {t.loadWeight.toFixed(1)}/{t.maxLoad}t
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default TransportPanel;

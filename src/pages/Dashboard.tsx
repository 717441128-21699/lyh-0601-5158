import { useState } from 'react';
import { Ship, Truck, Cog, LineChart, Boxes, FileBarChart, Anchor, Droplets, Activity, AlertTriangle, Recycle } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { useSimulation } from '@/hooks/useSimulation';
import { Scene3D } from '@/components/3d/Scene3D';
import { SideNav } from '@/components/layout/SideNav';
import { TopBar } from '@/components/layout/TopBar';
import { Timeline3D } from '@/components/layout/Timeline3D';
import { KpiCard } from '@/components/ui/KpiCard';
import { GlassCard } from '@/components/ui/GlassCard';
import { clsx } from 'clsx';

import ShipDetailPanel from '@/components/panels/ShipDetailPanel';
import TransportPanel from '@/components/panels/TransportPanel';
import EquipmentPanel from '@/components/panels/EquipmentPanel';
import ForecastPanel from '@/components/panels/ForecastPanel';
import InventoryPanel from '@/components/panels/InventoryPanel';
import ReportPanel from '@/components/panels/ReportPanel';

type TabKey = 'ship' | 'transport' | 'equipment' | 'forecast' | 'inventory' | 'report';

const tabConfig: Record<TabKey, { label: string; icon: typeof Ship; component: React.ComponentType }> = {
  ship: { label: '船舶详情', icon: Anchor, component: ShipDetailPanel },
  transport: { label: '运输调度', icon: Truck, component: TransportPanel },
  equipment: { label: '设备监控', icon: Cog, component: EquipmentPanel },
  forecast: { label: '预测调度', icon: LineChart, component: ForecastPanel },
  inventory: { label: '库存管理', icon: Boxes, component: InventoryPanel },
  report: { label: '报表导出', icon: FileBarChart, component: ReportPanel },
};

export default function Dashboard() {
  useSimulation(true);
  const [activeTab, setActiveTab] = useState<TabKey>('ship');
  const [panelCollapsed, setPanelCollapsed] = useState(false);

  const ships = useAppStore((s) => s.ships);
  const trucks = useAppStore((s) => s.trucks);
  const centrifuges = useAppStore((s) => s.centrifuges);
  const alertCount = useAppStore((s) => s.alertCount);
  const currentUser = useAppStore((s) => s.currentUser);

  const totalDredge = ships.reduce((s, ship) => s + ship.currentDredgeVolume, 0);
  const avgEff = 0.82 + ((Date.now() / 100000) % 0.04);
  const utilRate = 0.77 + ((Date.now() / 100000) % 0.03);

  const ActivePanel = tabConfig[activeTab].component;

  return (
    <div className="w-screen h-screen flex bg-deep-sea overflow-hidden">
      <SideNav />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />

        <div className="flex-1 flex flex-col min-h-0 relative">
          {/* 主3D场景层 */}
          <div className="absolute inset-0">
            <Scene3D />
          </div>

          {/* KPI卡片组 悬浮 */}
          <div className="absolute top-4 left-4 right-[380px] z-10 flex items-start gap-3 flex-wrap pointer-events-none">
            <div className="pointer-events-auto">
              <KpiCard
                label="今日累计清淤"
                value={totalDredge.toFixed(0)}
                unit="吨"
                icon={<Droplets className="w-5 h-5" />}
                color="cyan"
                trend="up"
                trendValue="+8.6%"
                progress={72}
              />
            </div>
            <div className="pointer-events-auto">
              <KpiCard
                label="平均处理效率"
                value={(avgEff * 100).toFixed(1)}
                unit="%"
                icon={<Activity className="w-5 h-5" />}
                color="green"
                trend="up"
                trendValue="+1.2%"
                progress={85}
              />
            </div>
            <div className="pointer-events-auto">
              <KpiCard
                label="资源化利用率"
                value={(utilRate * 100).toFixed(1)}
                unit="%"
                icon={<Recycle className="w-5 h-5" />}
                color="gold"
                trend="up"
                trendValue="+2.1%"
                progress={78}
              />
            </div>
            <div className="pointer-events-auto">
              <KpiCard
                label="预警数"
                value={alertCount}
                unit="条"
                icon={<AlertTriangle className="w-5 h-5" />}
                color="red"
                trend="down"
                trendValue="-2"
                progress={Math.min(100, alertCount * 15)}
              />
            </div>
          </div>

          {/* 右下悬浮：船舶快捷列表 */}
          <div className="absolute left-4 bottom-[140px] z-10 w-64 pointer-events-auto">
            <GlassCard cornerMark className="!p-3">
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-xs font-semibold text-tech-cyan flex items-center gap-1.5">
                  <Ship className="w-3.5 h-3.5" />
                  作业船舶 ({ships.filter((s) => s.status === 'working').length}/{ships.length})
                </h4>
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto scrollbar-thin pr-1">
                {ships.map((s) => {
                  const levelColor = s.tankLevel >= 80 ? '#FF3355' : s.tankLevel >= 60 ? '#FF8800' : '#00FF88';
                  return (
                    <div
                      key={s.id}
                      className={clsx(
                        'p-2 rounded-md text-[10px] cursor-pointer border transition-all flex items-center gap-2',
                        'bg-ocean-dark/50 border-glass-border hover:border-tech-cyan/40 hover:bg-ocean-dark/80'
                      )}
                      onClick={() => {
                        setActiveTab('ship');
                        useAppStore.getState().setSelectedShip(s.id);
                      }}
                    >
                      <span className="font-tech font-semibold text-tech-cyan w-14 shrink-0">
                        {s.shipNo.split('-')[1]}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="h-1 rounded-full bg-ocean-mid overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${s.tankLevel}%`, backgroundColor: levelColor }}
                          />
                        </div>
                      </div>
                      <span className="font-tech text-[9px] shrink-0" style={{ color: levelColor }}>
                        {s.tankLevel.toFixed(0)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </div>

          {/* 右侧面板 Tabs + 内容 */}
          <div
            className={clsx(
              'absolute right-4 top-4 bottom-[140px] z-10 flex flex-col transition-all duration-500',
              panelCollapsed ? 'w-12' : 'w-[360px]'
            )}
          >
            <div className={clsx(
              'mb-2 glass-panel rounded-lg p-1 flex items-center gap-1 shrink-0',
              panelCollapsed && '!p-1.5 !flex-col'
            )}>
              {(Object.keys(tabConfig) as TabKey[]).map((k) => {
                const { icon: Icon, label } = tabConfig[k];
                const active = activeTab === k;
                // 隐藏报表/预测/库存 对operator
                if (k === 'report' && currentUser?.role === 'operator') return null;
                if ((k === 'forecast' || k === 'inventory') && currentUser?.role === 'operator') return null;
                return (
                  <button
                    key={k}
                    onClick={() => {
                      setActiveTab(k);
                      if (panelCollapsed) setPanelCollapsed(false);
                    }}
                    className={clsx(
                      'flex items-center gap-1.5 px-2.5 py-2 rounded-md text-[11px] font-medium transition-all flex-1 whitespace-nowrap',
                      panelCollapsed && '!px-0 !justify-center',
                      active
                        ? 'bg-tech-cyan/15 text-tech-cyan shadow-neon-cyan'
                        : 'text-text-secondary hover:bg-ocean-mid/60 hover:text-text-primary'
                    )}
                    title={label}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!panelCollapsed && <span>{label}</span>}
                  </button>
                );
              })}
              <div className={clsx(
                'w-px h-5 bg-glass-border mx-0.5',
                panelCollapsed && '!w-full !h-px my-1.5'
              )} />
              <button
                onClick={() => setPanelCollapsed(!panelCollapsed)}
                className="w-8 h-8 rounded-md text-text-muted hover:bg-ocean-mid hover:text-tech-cyan transition-all flex items-center justify-center shrink-0"
                title={panelCollapsed ? '展开' : '收起'}
              >
                {panelCollapsed ? '◀' : '▶'}
              </button>
            </div>

            {!panelCollapsed && (
              <div className="flex-1 min-h-0">
                <ActivePanel />
              </div>
            )}
          </div>

          {/* 底部时间轴 */}
          <div className="absolute bottom-0 left-0 right-0 z-10">
            <Timeline3D />
          </div>
        </div>
      </div>
    </div>
  );
}

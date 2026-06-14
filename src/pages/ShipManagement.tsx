import { useSimulation } from '@/hooks/useSimulation';
import { SideNav } from '@/components/layout/SideNav';
import { TopBar } from '@/components/layout/TopBar';
import { Scene3D } from '@/components/3d/Scene3D';
import ShipDetailPanel from '@/components/panels/ShipDetailPanel';
import { ReactNode } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAppStore } from '@/stores/useAppStore';
import { clsx } from 'clsx';
import { Ship } from 'lucide-react';

interface SubPageLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const SubPageLayout = ({ children, title, subtitle }: SubPageLayoutProps) => {
  useSimulation(true);
  const ships = useAppStore((s) => s.ships);
  const setSelectedShip = useAppStore((s) => s.setSelectedShip);
  return (
    <div className="w-screen h-screen flex bg-deep-sea overflow-hidden">
      <SideNav />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <div className="flex-1 flex min-h-0 p-4 gap-4 overflow-hidden">
          <div className="flex-1 rounded-2xl overflow-hidden border border-glass-border relative shadow-glass">
            <Scene3D />
            <div className="absolute top-3 left-3 right-3 flex justify-between pointer-events-none z-10">
              <GlassCard className="!p-3 !rounded-xl pointer-events-auto">
                <div className="text-xs font-semibold text-tech-cyan flex items-center gap-1.5">
                  <Ship className="w-4 h-4" /> {title}
                </div>
                {subtitle && <div className="text-[10px] text-text-secondary mt-0.5">{subtitle}</div>}
              </GlassCard>
              <div className="flex pointer-events-auto gap-2">
                {ships.slice(0, 4).map((s) => {
                  const color = s.tankLevel >= 80 ? '#FF3355' : s.tankLevel >= 60 ? '#FF8800' : '#00FF88';
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedShip(s.id)}
                      className={clsx(
                        'glass-panel !rounded-xl px-2.5 py-1.5 text-[10px] font-tech border transition-all',
                        'hover:shadow-neon-cyan'
                      )}
                    >
                      <span className="text-text-primary">{s.shipNo.split('-')[1]}</span>
                      <span className="ml-1" style={{ color }}>{s.tankLevel.toFixed(0)}%</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="w-[420px] shrink-0 min-h-0">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default function ShipManagement() {
  return (
    <SubPageLayout title="船舶管理中心" subtitle="全船状态实时监控与作业调度">
      <ShipDetailPanel />
    </SubPageLayout>
  );
}

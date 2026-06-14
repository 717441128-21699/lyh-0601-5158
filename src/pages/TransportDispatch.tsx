import TransportPanel from '@/components/panels/TransportPanel';
import { useSimulation } from '@/hooks/useSimulation';
import { SideNav } from '@/components/layout/SideNav';
import { TopBar } from '@/components/layout/TopBar';
import { Scene3D } from '@/components/3d/Scene3D';
import { GlassCard } from '@/components/ui/GlassCard';
import { Truck } from 'lucide-react';

export default function TransportDispatch() {
  useSimulation(true);
  return (
    <div className="w-screen h-screen flex bg-deep-sea overflow-hidden">
      <SideNav />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <div className="flex-1 flex min-h-0 p-4 gap-4 overflow-hidden">
          <div className="flex-1 rounded-2xl overflow-hidden border border-glass-border relative shadow-glass">
            <Scene3D />
            <div className="absolute top-3 left-3 z-10 pointer-events-none">
              <GlassCard className="!p-3 !rounded-xl pointer-events-auto">
                <div className="text-xs font-semibold text-eco-green flex items-center gap-1.5">
                  <Truck className="w-4 h-4" /> 运输调度中心
                </div>
                <div className="text-[10px] text-text-secondary mt-0.5">最优路径规划 · 优先级排队</div>
              </GlassCard>
            </div>
          </div>
          <div className="w-[420px] shrink-0 min-h-0">
            <TransportPanel />
          </div>
        </div>
      </div>
    </div>
  );
}

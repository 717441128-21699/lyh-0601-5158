import { useSimulation } from '@/hooks/useSimulation';
import { SideNav } from '@/components/layout/SideNav';
import { TopBar } from '@/components/layout/TopBar';
import { Scene3D } from '@/components/3d/Scene3D';
import ForecastPanel from '@/components/panels/ForecastPanel';
import { GlassCard } from '@/components/ui/GlassCard';
import { LineChart } from 'lucide-react';

export default function ForecastSchedule() {
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
                <div className="text-xs font-semibold text-approval-gold flex items-center gap-1.5">
                  <LineChart className="w-4 h-4" /> 预测调度与三级审批
                </div>
                <div className="text-[10px] text-text-secondary mt-0.5">5天AI预测 · 河道局/环保局/企业 三级联审</div>
              </GlassCard>
            </div>
          </div>
          <div className="w-[440px] shrink-0 min-h-0">
            <ForecastPanel />
          </div>
        </div>
      </div>
    </div>
  );
}

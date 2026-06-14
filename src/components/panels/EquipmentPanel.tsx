import { Cog, AlertTriangle, History, Gauge as GaugeIcon, Droplet, Zap, Activity } from 'lucide-react';
import EChartsReact from 'echarts-for-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Gauge } from '@/components/ui/Gauge';
import { useAppStore } from '@/stores/useAppStore';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useState } from 'react';
import * as THREE from 'three';

interface MiniCentrifugeProps {
  speed: number;
}

const MiniCentrifuge3D = ({ speed }: MiniCentrifugeProps) => {
  const rotorRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (rotorRef.current) {
      const rot = (speed / 3500) * delta * 12;
      rotorRef.current.rotation.y += rot;
    }
  });
  return (
    <Canvas camera={{ position: [0, 2.5, 4], fov: 45 }} style={{ background: 'transparent' }} dpr={[1, 2]}>
      <ambientLight intensity={0.5} />
      <pointLight position={[3, 3, 2]} intensity={1} color="#00D4FF" />
      <pointLight position={[-3, 2, -2]} intensity={0.6} color="#FF8800" />
      <Suspense fallback={null}>
        <group>
          {/* 外壳（透明圆柱） */}
          <mesh>
            <cylinderGeometry args={[1.1, 1.1, 1.6, 40, 1, true]} />
            <meshPhysicalMaterial color="#4488aa" transparent opacity={0.18} metalness={0.2} roughness={0.05} side={2} transmission={0.6} thickness={0.4} />
          </mesh>
          <mesh position={[0, 0.85, 0]}>
            <torusGeometry args={[1.1, 0.06, 12, 48]} />
            <meshStandardMaterial color="#6688aa" metalness={0.8} />
          </mesh>
          <mesh position={[0, -0.85, 0]}>
            <cylinderGeometry args={[1.15, 1.15, 0.1, 48]} />
            <meshStandardMaterial color="#556677" metalness={0.8} />
          </mesh>
          {/* 螺旋转子 */}
          <group ref={rotorRef}>
            <mesh>
              <cylinderGeometry args={[0.18, 0.18, 1.5, 14]} />
              <meshStandardMaterial color="#e8b84a" metalness={0.8} roughness={0.2} />
            </mesh>
            {Array.from({ length: 6 }).map((_, i) => (
              <mesh key={i} rotation={[0, (i / 6) * Math.PI * 2, 0.4]} position={[0.45, 0, 0]}>
                <boxGeometry args={[0.7, 0.08, 0.2]} />
                <meshStandardMaterial color="#ffa844" metalness={0.7} roughness={0.25} />
              </mesh>
            ))}
            <mesh position={[0, 0.75, 0]}>
              <coneGeometry args={[0.22, 0.35, 16]} />
              <meshStandardMaterial color="#ffc060" metalness={0.8} />
            </mesh>
          </group>
          {/* 进料口 */}
          <mesh position={[0, 1.3, 0]}>
            <cylinderGeometry args={[0.3, 0.22, 0.25, 20, 1, true]} />
            <meshStandardMaterial color="#8899aa" metalness={0.6} side={2} />
          </mesh>
        </group>
      </Suspense>
    </Canvas>
  );
};

const statusMap: Record<string, string> = {
  running: '正常运行',
  warning: '预警',
  stopped: '停机',
};
const statusBadge: Record<string, string> = {
  running: 'badge-green',
  warning: 'badge-orange',
  stopped: 'badge-red',
};

export const EquipmentPanel = () => {
  const centrifuges = useAppStore((s) => s.centrifuges);
  const plants = useAppStore((s) => s.plants);
  const selectedId = useAppStore((s) => s.selectedCentrifugeId);
  const setSelected = useAppStore((s) => s.setSelectedCentrifuge);
  const adjustSpeed = useAppStore((s) => s.adjustCentrifugeSpeed);
  const [selected, setSel] = useState(centrifuges[0]?.id || null);

  useEffect(() => {
    if (selectedId) setSel(selectedId);
  }, [selectedId]);

  const current = centrifuges.find((c) => c.id === selected) || centrifuges[0];
  const plant = plants.find((p) => p.id === current?.plantId);

  const moistureHistoryOption = useMemo(() => {
    if (!current) return {};
    const history = current.optimizationRecords.slice(0, 8).reverse();
    return {
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(13,31,56,0.95)', textStyle: { color: '#E8F4FF' } },
      grid: { top: 10, right: 10, bottom: 20, left: 30 },
      xAxis: { type: 'category', data: history.map((_, i) => `R${i + 1}`), axisLabel: { color: '#8AB4D8', fontSize: 10 }, axisLine: { lineStyle: { color: 'rgba(0,212,255,0.2)' } } },
      yAxis: { type: 'value', min: 50, max: 80, axisLabel: { color: '#8AB4D8', fontSize: 10 }, axisLine: { show: false }, splitLine: { lineStyle: { color: 'rgba(0,212,255,0.08)' } } },
      series: [{
        type: 'line', smooth: true, data: history.map((r) => r.beforeMoisture),
        lineStyle: { color: '#FF8800', width: 2 }, symbolSize: 6, itemStyle: { color: '#FF8800', borderColor: '#0D1F38', borderWidth: 2 },
        markLine: { silent: true, lineStyle: { color: '#FF3355', type: 'dashed' }, data: [{ yAxis: current.standardMoisture, label: { formatter: `标准 ${current.standardMoisture}%`, color: '#FF3355', fontSize: 10 } }] },
      }],
    };
  }, [current]);

  if (!current) return null;

  return (
    <GlassCard cornerMark className="!p-0 overflow-hidden flex flex-col h-full">
      <div className="px-4 py-3 border-b border-glass-border flex items-center justify-between">
        <h3 className="section-title !mb-0 text-base">
          <Cog className="w-4 h-4 text-warn-orange" />
          脱水离心机监控
        </h3>
        <span className={statusBadge[current.status]}>{statusMap[current.status]}</span>
      </div>

      <div className="p-4 space-y-4 flex-1 overflow-y-auto scrollbar-thin">
        {/* 设备选择 */}
        <div className="grid grid-cols-3 gap-2">
          {centrifuges.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setSel(c.id);
                setSelected(c.id);
              }}
              className={clsx(
                'p-2 rounded-lg border text-left transition-all',
                selected === c.id
                  ? 'bg-tech-cyan/10 border-tech-cyan/50 shadow-neon-cyan'
                  : 'bg-ocean-dark/50 border-glass-border hover:border-tech-cyan/30'
              )}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[11px] font-semibold text-text-primary">{c.name}</span>
                <span className={clsx('w-1.5 h-1.5 rounded-full', c.status === 'running' ? 'bg-eco-green' : c.status === 'warning' ? 'bg-warn-orange animate-pulse' : 'bg-danger-red')} />
              </div>
              <div className="text-[9px] text-text-muted">{plants.find((p) => p.id === c.plantId)?.name.replace('脱水处理厂', '')}</div>
            </button>
          ))}
        </div>

        {/* 3D离心机视图 */}
        <div className="rounded-lg border border-glass-border overflow-hidden bg-ocean-dark/40">
          <div className="px-3 py-1.5 border-b border-glass-border text-[11px] text-tech-cyan flex items-center justify-between">
            <span>{plant?.name} - {current.name} 实时3D视图</span>
            <span className="font-tech text-warn-orange">{Math.round(current.rotationSpeed)}rpm</span>
          </div>
          <div className="h-44">
            <MiniCentrifuge3D key={current.id} speed={current.rotationSpeed} />
          </div>
        </div>

        {/* 参数仪表盘 */}
        <div className="grid grid-cols-2 gap-3">
          <Gauge label="出泥含水率" value={current.outletMoisture} min={40} max={85} unit="%" warningThreshold={60} dangerThreshold={current.standardMoisture} size={120} />
          <Gauge label="进料浓度" value={current.feedConcentration} min={5} max={35} unit="%" color="#FF8800" size={120} />
          <div className="col-span-2 grid grid-cols-2 gap-2">
            <div className="p-3 rounded-lg bg-ocean-dark/60 border border-glass-border">
              <div className="text-[10px] text-text-muted mb-1 flex items-center gap-1">
                <GaugeIcon className="w-3 h-3 text-tech-cyan" /> 转速
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-tech text-xl font-bold text-tech-cyan">{Math.round(current.rotationSpeed)}</span>
                <span className="text-[10px] text-text-secondary">rpm</span>
                {current.targetSpeed !== current.rotationSpeed && (
                  <span className="text-[10px] text-warn-orange">→ {current.targetSpeed}</span>
                )}
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-ocean-mid overflow-hidden">
                <div className="h-full rounded-full bg-tech-cyan" style={{ width: `${(current.rotationSpeed / 4000) * 100}%` }} />
              </div>
            </div>
            <div className="p-3 rounded-lg bg-ocean-dark/60 border border-glass-border">
              <div className="text-[10px] text-text-muted mb-1 flex items-center gap-1">
                <Zap className="w-3 h-3 text-approval-gold" /> 工作电流
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-tech text-xl font-bold text-approval-gold">{current.current.toFixed(1)}</span>
                <span className="text-[10px] text-text-secondary">A</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-ocean-mid overflow-hidden">
                <div className="h-full rounded-full bg-approval-gold" style={{ width: `${(current.current / 60) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* 预警记录 */}
        <div className="rounded-lg border border-glass-border overflow-hidden">
          <div className="px-3 py-2 border-b border-glass-border text-xs text-text-primary flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-approval-gold" />
            参数优化记录
          </div>
          <div className="max-h-48 overflow-y-auto scrollbar-thin">
            {current.optimizationRecords.length === 0 ? (
              <div className="p-3 text-center text-[11px] text-text-muted">暂无优化记录</div>
            ) : (
              <div className="divide-y divide-glass-border/50">
                {current.optimizationRecords.slice(0, 6).map((r) => (
                  <div key={r.id} className="p-2.5 hover:bg-ocean-dark/40 transition-colors">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className={clsx('w-3 h-3 shrink-0', r.beforeMoisture > 65 ? 'text-warn-orange' : 'text-tech-cyan')} />
                        <span className="text-[10px] text-text-secondary">
                          {format(r.timestamp, 'MM-dd HH:mm')}
                        </span>
                      </div>
                      <span className="text-[10px] text-text-muted">{r.operator}</span>
                    </div>
                    <div className="text-[11px] text-text-primary mb-0.5">{r.reason}</div>
                    <div className="flex gap-3 text-[10px]">
                      <span className="text-tech-cyan">
                        转速 <span className="font-tech">{r.beforeSpeed}→{r.afterSpeed}</span>
                      </span>
                      <span className="text-warn-orange">
                        含水率 <span className="font-tech">{r.beforeMoisture.toFixed(1)}%</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 含水率曲线 */}
        <div className="rounded-lg border border-glass-border overflow-hidden">
          <div className="px-3 py-2 border-b border-glass-border text-xs text-warn-orange flex items-center gap-1.5">
            <Droplet className="w-3.5 h-3.5" />
            历史含水率趋势
          </div>
          <div className="h-28 p-2">
            <EChartsReact option={moistureHistoryOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>

        {/* 调速 */}
        {current.status !== 'stopped' && (
          <div>
            <div className="text-[11px] text-text-muted mb-2">手动调整转速：{Math.round(current.targetSpeed)} rpm</div>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => adjustSpeed(current.id, 2800, '手动降速至2800')} className="neon-btn !px-3 !py-1.5 text-[11px] text-tech-cyan">2800</button>
              <button onClick={() => adjustSpeed(current.id, 3200, '手动调整至3200')} className="neon-btn !px-3 !py-1.5 text-[11px] text-tech-cyan">3200</button>
              <button onClick={() => adjustSpeed(current.id, 3600, '手动提转速至3600')} className="neon-btn !px-3 !py-1.5 text-[11px] text-warn-orange">3600</button>
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default EquipmentPanel;

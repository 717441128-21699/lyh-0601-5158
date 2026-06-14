import { Boxes, PackageOpen, AlertTriangle, CheckCircle2, Clock, Plus, Calendar, TrendingDown, TrendingUp } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { useAppStore } from '@/stores/useAppStore';
import { NeonButton } from '@/components/ui/NeonButton';
import { useState, useMemo } from 'react';
import EChartsReact from 'echarts-for-react';
import { clsx } from 'clsx';
import { format } from 'date-fns';

export const InventoryPanel = () => {
  const inventories = useAppStore((s) => s.inventories);
  const approveRep = useAppStore((s) => s.approveReplenishment);
  const createRep = useAppStore((s) => s.createReplenishment);
  const { currentUser, roleLabel } = usePermission();
  const [qty, setQty] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'陶粒' | '肥料'>('陶粒');

  const current = inventories.find((i) => i.productName === activeTab) || inventories[0];

  const trendOption = useMemo(() => {
    if (!current) return {};
    const days = 7;
    const data = Array.from({ length: days }, (_, i) => {
      const base = current.currentStock - (days - 1 - i) * (current.weeklyDemand / 7);
      return Math.max(0, base + (Math.sin(i) * 80));
    });
    const labels = Array.from({ length: days }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      return format(d, 'MM/dd');
    });
    return {
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(13,31,56,0.95)', textStyle: { color: '#E8F4FF' } },
      grid: { top: 10, right: 10, bottom: 22, left: 40 },
      xAxis: { type: 'category', data: labels, axisLabel: { color: '#8AB4D8', fontSize: 10 }, axisLine: { lineStyle: { color: 'rgba(0,212,255,0.2)' } }, axisTick: { show: false } },
      yAxis: { type: 'value', axisLabel: { color: '#8AB4D8', fontSize: 10 }, axisLine: { show: false }, splitLine: { lineStyle: { color: 'rgba(0,212,255,0.08)' } } },
      series: [{
        type: 'line', smooth: true, symbol: 'circle', symbolSize: 5, data,
        lineStyle: { color: current.productName === '陶粒' ? '#FF8800' : '#00FF88', width: 2 },
        itemStyle: { color: current.productName === '陶粒' ? '#FF8800' : '#00FF88', borderColor: '#0D1F38', borderWidth: 2 },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: (current.productName === '陶粒' ? 'rgba(255,136,0,0.35)' : 'rgba(0,255,136,0.35)') },
              { offset: 1, color: 'transparent' },
            ],
          },
        },
        markLine: { silent: true, lineStyle: { color: '#FF3355', type: 'dashed' }, data: [{ yAxis: current.safetyThreshold, label: { formatter: `安全线 ${current.safetyThreshold}`, color: '#FF3355', fontSize: 10 } }] },
      }],
    };
  }, [current]);

  const mainColor = (p: string) => (p === '陶粒' ? '#FF8800' : '#00FF88');
  const canApprove = currentUser?.role === 'river_chief' || currentUser?.role === 'administrator';

  if (!current) return null;

  return (
    <GlassCard cornerMark className="!p-0 overflow-hidden flex flex-col h-full">
      <div className="px-4 py-3 border-b border-glass-border flex items-center justify-between">
        <h3 className="section-title !mb-0 text-base">
          <Boxes className="w-4 h-4" style={{ color: mainColor(activeTab) }} />
          资源化产品库存
        </h3>
        <div className="flex gap-1 p-0.5 rounded-lg bg-ocean-dark/60 border border-glass-border">
          {inventories.map((inv) => (
            <button
              key={inv.id}
              onClick={() => setActiveTab(inv.productName)}
              className={clsx(
                'px-3 py-1 rounded-md text-[11px] font-medium transition-all',
                activeTab === inv.productName
                  ? `shadow-lg`
                  : 'text-text-muted hover:text-text-secondary'
              )}
              style={activeTab === inv.productName ? { backgroundColor: `${mainColor(inv.productName)}22`, color: mainColor(inv.productName) } : {}}
            >
              {inv.productName}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4 flex-1 overflow-y-auto scrollbar-thin">
        {/* 核心库存指标 */}
        <div className="grid grid-cols-2 gap-3">
          {inventories.map((inv) => {
            const belowSafe = inv.currentStock < inv.safetyThreshold;
            const usageDays = Math.round((inv.currentStock / inv.weeklyDemand) * 7);
            return (
              <div
                key={inv.id}
                onClick={() => setActiveTab(inv.productName)}
                className={clsx(
                  'p-3 rounded-lg border cursor-pointer transition-all relative overflow-hidden',
                  activeTab === inv.productName
                    ? 'border-tech-cyan/50 bg-ocean-dark/80'
                    : 'border-glass-border bg-ocean-dark/40 hover:border-tech-cyan/30'
                )}
              >
                {belowSafe && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 text-[9px] text-danger-red animate-pulse">
                    <AlertTriangle className="w-2.5 h-2.5" /> 低于阈值
                  </div>
                )}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                      <PackageOpen className="w-3.5 h-3.5" style={{ color: mainColor(inv.productName) }} />
                      {inv.productName}
                    </div>
                    <div className="text-[9px] text-text-muted mt-0.5">日产能 {inv.dailyOutput}t</div>
                  </div>
                  <ProgressRing
                    value={(inv.currentStock / inv.maxCapacity) * 100}
                    size={54}
                    strokeWidth={5}
                    color={mainColor(inv.productName)}
                    warningThreshold={60}
                    dangerThreshold={20}
                  />
                </div>
                <div className="flex items-baseline gap-1 mb-1.5">
                  <span className="font-tech text-2xl font-bold" style={{ color: mainColor(inv.productName) }}>
                    {inv.currentStock.toFixed(0)}
                  </span>
                  <span className="text-[10px] text-text-muted">/ {inv.maxCapacity} 吨</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <div className="p-1.5 rounded bg-ocean-dark/60 flex items-center justify-between">
                    <span className="text-text-secondary flex items-center gap-0.5">
                      <TrendingDown className="w-2.5 h-2.5" /> 周需
                    </span>
                    <span className="font-tech text-text-primary">{inv.weeklyDemand}t</span>
                  </div>
                  <div className="p-1.5 rounded bg-ocean-dark/60 flex items-center justify-between">
                    <span className="text-text-secondary flex items-center gap-0.5">
                      <TrendingUp className="w-2.5 h-2.5" /> 可用
                    </span>
                    <span className="font-tech" style={{ color: usageDays < 5 ? '#FF3355' : '#00FF88' }}>{usageDays}天</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 安全阈值条 */}
        <div className="p-3 rounded-lg bg-ocean-dark/50 border border-glass-border">
          <div className="flex justify-between text-[10px] mb-1.5">
            <span className="text-text-secondary">库存监控</span>
            <span className="text-text-secondary">安全线: <span className="font-tech text-danger-red">{current.safetyThreshold}t</span></span>
          </div>
          <div className="relative h-6 rounded-full bg-ocean-dark overflow-hidden">
            <div
              className="h-full transition-all"
              style={{
                width: `${(current.currentStock / current.maxCapacity) * 100}%`,
                backgroundColor: current.currentStock < current.safetyThreshold ? '#FF3355' : mainColor(current.productName),
                opacity: 0.85,
              }}
            />
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-danger-red"
              style={{ left: `${(current.safetyThreshold / current.maxCapacity) * 100}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-[11px] font-tech text-text-primary font-bold">
              当前: {current.currentStock.toFixed(0)}t
            </div>
          </div>
        </div>

        {/* 趋势图 */}
        <div className="rounded-lg border border-glass-border overflow-hidden">
          <div className="px-3 py-2 border-b border-glass-border text-xs font-medium flex items-center gap-1.5" style={{ color: mainColor(current.productName) }}>
            <TrendingUp className="w-3.5 h-3.5" /> {current.productName} 近7天库存趋势
          </div>
          <div className="h-36 p-2">
            <EChartsReact option={trendOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>

        {/* 补产计划表单 */}
        {(current.currentStock < current.safetyThreshold || canApprove) && (
          <div className="p-3 rounded-lg bg-warn-orange/10 border border-warn-orange/30">
            <div className="text-[11px] font-semibold text-warn-orange mb-2 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> 创建/审批补产计划
            </div>
            <div className="flex gap-2 mb-2">
              <input
                type="number"
                value={qty[current.id] || ''}
                onChange={(e) => setQty({ ...qty, [current.id]: e.target.value })}
                placeholder="补产数量（吨）"
                className="input-field !py-2 !text-xs flex-1"
              />
              <NeonButton
                variant="warning"
                onClick={() => {
                  const v = parseInt(qty[current.id] || '0', 10);
                  if (v > 0) createRep(current.id, v);
                  setQty({ ...qty, [current.id]: '' });
                }}
              >创建</NeonButton>
            </div>

            {current.replenishmentPlans.length === 0 ? (
              <div className="text-[11px] text-text-muted text-center py-2">暂无补产计划</div>
            ) : (
              <div className="space-y-1.5">
                {current.replenishmentPlans.map((r) => (
                  <div key={r.id} className="p-2 rounded bg-ocean-dark/60 border border-glass-border/50">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <span className="font-tech text-sm font-bold" style={{ color: mainColor(current.productName) }}>
                          {r.targetQuantity}t
                        </span>
                        <span className="text-[10px] text-text-muted ml-2 flex items-center gap-0.5 inline-flex">
                          <Calendar className="w-2.5 h-2.5" /> 约{r.estimatedDays}天
                        </span>
                      </div>
                      <span className={clsx(
                        'badge',
                        r.approvalStatus === 'approved' && 'badge-green',
                        r.approvalStatus === 'pending' && 'badge-gold',
                        r.approvalStatus === 'rejected' && 'badge-red'
                      )}>
                        {r.approvalStatus === 'approved' ? '已通过' : r.approvalStatus === 'pending' ? '待审批' : '已驳回'}
                      </span>
                    </div>
                    <div className="text-[10px] text-text-muted mb-1 flex items-center gap-1.5">
                      <Clock className="w-2.5 h-2.5" />
                      创建: {format(r.createdAt, 'MM-dd HH:mm')}
                      {r.approvedAt && <> · {r.approver} 审批于 {format(r.approvedAt, 'MM-dd HH:mm')}</>}
                    </div>
                    {r.approvalStatus === 'pending' && canApprove && (
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => approveRep(current.id, r.id, true)}
                          className="flex-1 px-2 py-1 rounded-md bg-eco-green/15 border border-eco-green/40 text-eco-green text-[10px] font-medium hover:bg-eco-green/25 transition flex items-center justify-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" /> 通过
                        </button>
                        <button
                          onClick={() => approveRep(current.id, r.id, false)}
                          className="flex-1 px-2 py-1 rounded-md bg-danger-red/15 border border-danger-red/40 text-danger-red text-[10px] font-medium hover:bg-danger-red/25 transition flex items-center justify-center gap-1"
                        >
                          <XCircle className="w-3 h-3" /> 驳回
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default InventoryPanel;

import { XCircle } from 'lucide-react';
import { usePermission } from '@/hooks/usePermission';

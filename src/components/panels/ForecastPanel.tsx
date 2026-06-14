import { LineChart, Cloud, Sun, CloudRain, CloudLightning, CheckCircle2, XCircle, Clock, Send, MessageSquare, CalendarRange } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAppStore } from '@/stores/useAppStore';
import { NeonButton } from '@/components/ui/NeonButton';
import { useState, useMemo } from 'react';
import EChartsReact from 'echarts-for-react';
import { clsx } from 'clsx';
import { format } from 'date-fns';

const weatherIcons: Record<string, typeof Sun> = {
  '晴': Sun,
  '多云': Cloud,
  '小雨': CloudRain,
  '大雨': CloudLightning,
};
const weatherColors: Record<string, string> = {
  '晴': '#FFD700',
  '多云': '#8AB4D8',
  '小雨': '#00D4FF',
  '大雨': '#FF3355',
};

export const ForecastPanel = () => {
  const plans = useAppStore((s) => s.plans);
  const approvePlan = useAppStore((s) => s.approvePlan);
  const { currentUser, roleLabel } = usePermission();
  const [selectedPlanId, setSel] = useState(plans[0]?.id);
  const [comment, setComment] = useState('');

  const plan = plans.find((p) => p.id === selectedPlanId) || plans[0];

  const forecastOption = useMemo(() => {
    if (!plan) return {};
    return {
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(13,31,56,0.95)', textStyle: { color: '#E8F4FF' }, axisPointer: { type: 'shadow' } },
      legend: { data: ['预测清淤量', '历史同期'], textStyle: { color: '#8AB4D8', fontSize: 10 }, right: 0, top: 0, icon: 'roundRect' },
      grid: { top: 30, right: 12, bottom: 45, left: 45 },
      xAxis: {
        type: 'category',
        data: plan.forecastData.map((d) => d.date),
        axisLabel: { color: '#8AB4D8', fontSize: 11 },
        axisLine: { lineStyle: { color: 'rgba(0,212,255,0.2)' } },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value', name: '吨', nameTextStyle: { color: '#5A7A9A', fontSize: 10, padding: [0, 0, 0, -20] },
        axisLabel: { color: '#8AB4D8', fontSize: 10 },
        axisLine: { show: false }, splitLine: { lineStyle: { color: 'rgba(0,212,255,0.08)' } },
      },
      series: [
        {
          name: '预测清淤量', type: 'bar', barWidth: 18,
          data: plan.forecastData.map((d) => d.forecastVolume),
          itemStyle: {
            color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#00D4FF' }, { offset: 1, color: '#00D4FF33' }] },
            borderRadius: [5, 5, 0, 0],
          },
          label: { show: true, position: 'top', color: '#00D4FF', fontSize: 10, fontFamily: 'Orbitron', formatter: '{c}' },
        },
        {
          name: '历史同期', type: 'line', smooth: true, symbol: 'circle', symbolSize: 7,
          data: plan.forecastData.map((d) => d.historicalVolume),
          lineStyle: { color: '#FFD700', width: 2, type: 'dashed', shadowColor: '#FFD700', shadowBlur: 6 },
          itemStyle: { color: '#FFD700', borderColor: '#0D1F38', borderWidth: 2 },
        },
      ],
    };
  }, [plan]);

  const canApprove = useMemo(() => {
    if (!plan || !currentUser) return { step: 0 as 0 | 1 | 2 | 3, can: false };
    const stepMap: Record<string, 0 | 1 | 2 | 3> = { river_chief: 1, administrator: 2 };
    // 简化：河长=河道局审批(step1)，管理局可以做环保局(2)和资源企业(3)
    if (currentUser.role === 'operator') return { step: 0, can: false };
    // 按当前approvalStep决定下一个
    const nextStep = plan.approvalStep + 1;
    if (plan.approvalStep >= 3) return { step: nextStep as any, can: false };
    if (currentUser.role === 'river_chief' && plan.approvalStep < 1) return { step: 1, can: true };
    if (currentUser.role === 'administrator' && plan.approvalStep >= 1 && plan.approvalStep < 3) {
      return { step: (plan.approvalStep + 1) as 1 | 2 | 3, can: true };
    }
    return { step: nextStep as any, can: false };
  }, [plan, currentUser]);

  const steps = [
    { label: '河道局', key: 'riverBureauApproval', icon: CheckCircle2 },
    { label: '环保局', key: 'envBureauApproval', icon: CheckCircle2 },
    { label: '资源化企业', key: 'resourceEnterpriseApproval', icon: CheckCircle2 },
  ] as const;

  if (!plan) return null;

  return (
    <GlassCard cornerMark className="!p-0 overflow-hidden flex flex-col h-full">
      <div className="px-4 py-3 border-b border-glass-border flex items-center justify-between">
        <h3 className="section-title !mb-0 text-base">
          <LineChart className="w-4 h-4 text-approval-gold" />
          预测调度与三级审批
        </h3>
        <span className={clsx(
          'badge',
          plan.status === 'executing' && 'badge-green',
          plan.status === 'approved' && 'badge-gold',
          plan.status === 'approving' && 'badge-cyan',
          plan.status === 'rejected' && 'badge-red',
          plan.status === 'draft' && '',
        )}>
          {plan.status === 'executing' ? '执行中' : plan.status === 'approved' ? '已通过' : plan.status === 'approving' ? '审批中' : plan.status === 'rejected' ? '已驳回' : '草稿'}
        </span>
      </div>

      <div className="p-4 space-y-4 flex-1 overflow-y-auto scrollbar-thin">
        {/* 方案选择 */}
        <div className="flex gap-2">
          {plans.map((p) => (
            <button
              key={p.id}
              onClick={() => setSel(p.id)}
              className={clsx(
                'flex-1 p-2.5 rounded-lg border text-left transition-all',
                p.id === plan.id
                  ? 'bg-tech-cyan/10 border-tech-cyan/50'
                  : 'bg-ocean-dark/50 border-glass-border hover:border-tech-cyan/30'
              )}
            >
              <div className="text-[11px] font-semibold text-text-primary truncate">{p.name}</div>
              <div className="text-[9px] text-text-muted mt-0.5 flex items-center gap-1">
                <CalendarRange className="w-2.5 h-2.5" />
                {p.period[0]} ~ {p.period[1]}
              </div>
            </button>
          ))}
        </div>

        {/* 三级审批流 */}
        <div className="p-3 rounded-lg bg-ocean-dark/50 border border-glass-border">
          <div className="flex items-center justify-between mb-3 relative">
            <div className="absolute left-6 right-6 top-1/2 h-0.5 bg-ocean-mid -translate-y-1/2 z-0">
              <div className="h-full bg-gradient-to-r from-tech-cyan to-eco-green transition-all"
                style={{ width: `${(plan.approvalStep / 3) * 100}%` }} />
            </div>
            {steps.map((s, i) => {
              const data = (plan as any)[s.key];
              const done = plan.approvalStep > i;
              const pending = plan.approvalStep === i;
              const Icon = s.icon;
              return (
                <div key={i} className="flex flex-col items-center gap-1.5 relative z-10">
                  <div className={clsx(
                    'w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all',
                    done && 'bg-eco-green/20 border-eco-green shadow-neon-green',
                    pending && 'bg-tech-cyan/20 border-tech-cyan shadow-neon-cyan animate-pulse',
                    !done && !pending && 'bg-ocean-dark border-ocean-light'
                  )}>
                    {done ? (
                      <Icon className="w-4 h-4 text-eco-green" />
                    ) : pending ? (
                      <Clock className="w-4 h-4 text-tech-cyan" />
                    ) : (
                      <span className="font-tech text-sm text-text-muted">{i + 1}</span>
                    )}
                  </div>
                  <div className={clsx(
                    'text-[10px] font-medium',
                    done && 'text-eco-green',
                    pending && 'text-tech-cyan',
                    !done && !pending && 'text-text-muted'
                  )}>
                    {s.label}
                  </div>
                  {data?.approver && (
                    <div className="text-[9px] text-text-muted">{data.approver}</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 当前步骤审批信息/表单 */}
          {canApprove.can && (
            <div className="mt-4 pt-3 border-t border-glass-border/50">
              <div className="text-[11px] text-tech-cyan mb-2">
                您当前可进行 <span className="font-semibold">第{canApprove.step}级 · {steps[canApprove.step - 1]?.label}</span> 审批
              </div>
              <div className="flex gap-2 mb-2">
                <input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="请输入审批意见（可选）"
                  className="input-field !py-2 !text-xs flex-1"
                />
              </div>
              <div className="flex gap-2">
                <NeonButton
                  fullWidth
                  variant="success"
                  icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  onClick={() => {
                    approvePlan(plan.id, canApprove.step, true, comment || '审批通过');
                    setComment('');
                  }}
                >通过</NeonButton>
                <NeonButton
                  fullWidth
                  variant="danger"
                  icon={<XCircle className="w-3.5 h-3.5" />}
                  onClick={() => {
                    approvePlan(plan.id, canApprove.step, false, comment || '审批驳回');
                    setComment('');
                  }}
                >驳回</NeonButton>
              </div>
            </div>
          )}

          {/* 已审批记录 */}
          <div className="mt-3 space-y-1.5">
            {steps.map((s, i) => {
              const data = (plan as any)[s.key];
              if (!data || !data.approver) return null;
              return (
                <div key={i} className="flex items-start gap-2 p-2 rounded bg-ocean-dark/50">
                  {data.status === 'approved'
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-eco-green shrink-0 mt-0.5" />
                    : <XCircle className="w-3.5 h-3.5 text-danger-red shrink-0 mt-0.5" />}
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-text-primary flex items-center gap-2">
                      <span className="font-medium">{s.label} - {data.approver}</span>
                      <span className="text-text-muted">{data.approvedAt && format(data.approvedAt, 'MM-dd HH:mm')}</span>
                    </div>
                    {data.comment && (
                      <div className="text-[10px] text-text-secondary flex items-center gap-1 mt-0.5">
                        <MessageSquare className="w-2.5 h-2.5" /> {data.comment}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {plan.status === 'executing' && (
            <div className="mt-3 p-2 rounded-lg bg-eco-green/10 border border-eco-green/30">
              <div className="flex justify-between text-[11px] text-text-secondary mb-1">
                <span>执行进度</span>
                <span className="font-tech text-eco-green">{plan.executionProgress.toFixed(1)}%</span>
              </div>
              <div className="h-2 rounded-full bg-ocean-dark overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-tech-cyan to-eco-green"
                  style={{ width: `${plan.executionProgress}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* 5天预测图表 */}
        <div className="rounded-lg border border-glass-border overflow-hidden">
          <div className="px-3 py-2 border-b border-glass-border text-xs text-tech-cyan font-medium flex items-center gap-1.5">
            <Cloud className="w-3.5 h-3.5" /> 未来5天清淤量预测
          </div>
          {/* 气象条 */}
          <div className="grid grid-cols-5 divide-x divide-glass-border/40 border-b border-glass-border/50">
            {plan.forecastData.map((d, i) => {
              const WI = weatherIcons[d.weatherType] || Sun;
              return (
                <div key={i} className="p-2 text-center">
                  <WI className="w-5 h-5 mx-auto mb-1" style={{ color: weatherColors[d.weatherType] }} />
                  <div className="text-[10px] text-text-secondary">{d.date}</div>
                  <div className="text-[10px] font-tech text-text-primary">{d.temperature[1]}°/{d.temperature[0]}°</div>
                  <div className="text-[9px] text-text-muted mt-0.5">因子×{d.weatherFactor}</div>
                </div>
              );
            })}
          </div>
          <div className="h-48 p-2">
            <EChartsReact option={forecastOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>

        {/* 船舶分配 */}
        <div className="rounded-lg border border-glass-border overflow-hidden">
          <div className="px-3 py-2 border-b border-glass-border text-xs text-text-primary flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5 text-tech-cyan" /> 每日船舶清淤分配（吨/日）
          </div>
          <div className="p-3">
            <div className="space-y-2">
              {plan.shipAssignments.map((a, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-16 text-[11px] font-tech text-tech-cyan">清淤-00{i + 1}</span>
                  <div className="flex-1 h-5 rounded-full bg-ocean-dark overflow-hidden relative">
                    <div className="h-full rounded-full bg-gradient-to-r from-tech-cyan/70 to-eco-green/70 transition-all"
                      style={{ width: `${(a.dayVolume / 600) * 100}%` }} />
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-tech text-text-primary">
                      {a.dayVolume}t
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default ForecastPanel;

// helper
import { usePermission } from '@/hooks/usePermission';

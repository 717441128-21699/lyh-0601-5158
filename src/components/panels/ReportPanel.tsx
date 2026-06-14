import { FileSpreadsheet, FileDown, Calendar, BarChart3, TrendingUp, RefreshCw } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { useAppStore } from '@/stores/useAppStore';
import { downloadBlob } from '@/utils/excel/reportExporter';
import { useState, useMemo } from 'react';
import EChartsReact from 'echarts-for-react';
import { clsx } from 'clsx';

interface MetricOption {
  id: string;
  label: string;
  checked: boolean;
}

export const ReportPanel = () => {
  const getReport = useAppStore((s) => s.getQuarterlyReportData);
  const exportReport = useAppStore((s) => s.exportReport);
  const addLog = useAppStore((s) => s.addLog);
  const now = new Date();
  const curQ = Math.floor(now.getMonth() / 3) + 1;

  const [year, setYear] = useState(now.getFullYear());
  const [quarter, setQuarter] = useState(curQ);
  const [metrics, setMetrics] = useState<MetricOption[]>([
    { id: 'dredge', label: '清淤量', checked: true },
    { id: 'efficiency', label: '处理效率', checked: true },
    { id: 'utilization', label: '资源化利用率', checked: true },
    { id: 'output', label: '资源化产出', checked: true },
  ]);
  const [exporting, setExporting] = useState(false);

  const report = useMemo(() => getReport(year, quarter), [year, quarter, getReport]);

  const monthlyOption = useMemo(() => ({
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(13,31,56,0.95)', textStyle: { color: '#E8F4FF' } },
    legend: { data: ['清淤量(t)', '处理效率', '利用率'], textStyle: { color: '#8AB4D8', fontSize: 10 }, top: 0, icon: 'roundRect' },
    grid: { top: 30, right: 50, bottom: 28, left: 55 },
    xAxis: { type: 'category', data: report.monthlyBreakdown.map((m) => m.month), axisLabel: { color: '#8AB4D8', fontSize: 11 }, axisLine: { lineStyle: { color: 'rgba(0,212,255,0.2)' } }, axisTick: { show: false } },
    yAxis: [
      { type: 'value', name: '吨', nameTextStyle: { color: '#5A7A9A', fontSize: 10 }, axisLabel: { color: '#8AB4D8', fontSize: 10 }, axisLine: { show: false }, splitLine: { lineStyle: { color: 'rgba(0,212,255,0.08)' } } },
      { type: 'value', name: '%', min: 0, max: 100, nameTextStyle: { color: '#5A7A9A', fontSize: 10 }, axisLabel: { color: '#8AB4D8', fontSize: 10, formatter: '{value}%' }, axisLine: { show: false }, splitLine: { show: false } },
    ],
    series: [
      {
        name: '清淤量(t)', type: 'bar', barWidth: 16,
        data: report.monthlyBreakdown.map((m) => m.dredgeVolume),
        itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#00D4FF' }, { offset: 1, color: '#00D4FF33' }] }, borderRadius: [5, 5, 0, 0] },
        label: { show: true, position: 'top', color: '#00D4FF', fontSize: 10, fontFamily: 'Orbitron' },
      },
      {
        name: '处理效率', type: 'line', yAxisIndex: 1, smooth: true, symbol: 'circle', symbolSize: 7,
        data: report.monthlyBreakdown.map((m) => (m.processingEfficiency * 100).toFixed(1)),
        lineStyle: { color: '#00FF88', width: 2.5, shadowColor: '#00FF88', shadowBlur: 6 },
        itemStyle: { color: '#00FF88', borderColor: '#0D1F38', borderWidth: 2 },
      },
      {
        name: '利用率', type: 'line', yAxisIndex: 1, smooth: true, symbol: 'diamond', symbolSize: 7,
        data: report.monthlyBreakdown.map((m) => (m.resourceUtilization * 100).toFixed(1)),
        lineStyle: { color: '#FFD700', width: 2.5, type: 'dashed', shadowColor: '#FFD700', shadowBlur: 6 },
        itemStyle: { color: '#FFD700', borderColor: '#0D1F38', borderWidth: 2 },
      },
    ],
  }), [report]);

  const plantCompareOption = useMemo(() => ({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, backgroundColor: 'rgba(13,31,56,0.95)', textStyle: { color: '#E8F4FF' } },
    legend: { data: ['处理量', '陶粒产出', '肥料产出'], textStyle: { color: '#8AB4D8', fontSize: 10 }, top: 0, icon: 'roundRect' },
    grid: { top: 30, right: 15, bottom: 28, left: 45 },
    xAxis: { type: 'category', data: report.plantBreakdown.map((p) => p.plantName.replace('脱水处理厂', '')), axisLabel: { color: '#8AB4D8', fontSize: 11 }, axisLine: { lineStyle: { color: 'rgba(0,212,255,0.2)' } }, axisTick: { show: false } },
    yAxis: { type: 'value', axisLabel: { color: '#8AB4D8', fontSize: 10 }, axisLine: { show: false }, splitLine: { lineStyle: { color: 'rgba(0,212,255,0.08)' } } },
    series: [
      {
        name: '处理量', type: 'bar', stack: 'x', barWidth: 22,
        data: report.plantBreakdown.map((p) => p.processedVolume),
        itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#00D4FF' }, { offset: 1, color: '#0088cc' }] } },
      },
      {
        name: '陶粒产出', type: 'bar', stack: 'y', barWidth: 22,
        data: report.plantBreakdown.map((p) => p.ceramicOutput),
        itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#FF8800' }, { offset: 1, color: '#cc6600' }] } },
      },
      {
        name: '肥料产出', type: 'bar', stack: 'y', barWidth: 22,
        data: report.plantBreakdown.map((p) => p.fertilizerOutput),
        itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#00FF88' }, { offset: 1, color: '#00cc66' }] } },
      },
    ],
  }), [report]);

  const toggleMetric = (id: string) => setMetrics((arr) => arr.map((m) => (m.id === id ? { ...m, checked: !m.checked } : m)));

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      const blob = exportReport(year, quarter);
      if (blob) {
        downloadBlob(blob, `城市河道清淤报表-${year}年Q${quarter}.xlsx`);
        addLog('导出报表', `${year}年第${quarter}季度报表导出成功`);
      }
      setExporting(false);
    }, 1200);
  };

  return (
    <GlassCard cornerMark className="!p-0 overflow-hidden flex flex-col h-full">
      <div className="px-4 py-3 border-b border-glass-border flex items-center justify-between">
        <h3 className="section-title !mb-0 text-base">
          <FileSpreadsheet className="w-4 h-4 text-approval-gold" />
          季度报表导出
        </h3>
        <NeonButton
          variant="warning"
          loading={exporting}
          icon={<FileDown className="w-4 h-4" />}
          onClick={handleExport}
        >
          导出Excel报表
        </NeonButton>
      </div>

      <div className="p-4 space-y-4 flex-1 overflow-y-auto scrollbar-thin">
        {/* 筛选条件 */}
        <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-ocean-dark/50 border border-glass-border">
          <div>
            <label className="text-[10px] text-text-secondary flex items-center gap-1 mb-1.5">
              <Calendar className="w-3 h-3" /> 统计年份
            </label>
            <select value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="input-field !py-2 text-sm">
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>{y}年</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-text-secondary flex items-center gap-1 mb-1.5">
              <BarChart3 className="w-3 h-3" /> 季度选择
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[1, 2, 3, 4].map((q) => (
                <button
                  key={q}
                  onClick={() => setQuarter(q)}
                  className={clsx(
                    'py-2 rounded-md text-sm font-tech font-semibold transition-all border',
                    quarter === q
                      ? 'bg-tech-cyan/15 border-tech-cyan/50 text-tech-cyan shadow-neon-cyan'
                      : 'bg-ocean-dark/60 border-glass-border text-text-secondary hover:border-tech-cyan/30'
                  )}
                >
                  Q{q}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] text-text-secondary flex items-center gap-1 mb-1.5">
              <RefreshCw className="w-3 h-3" /> 指标选择
            </label>
            <div className="flex flex-wrap gap-1.5">
              {metrics.map((m) => (
                <button
                  key={m.id}
                  onClick={() => toggleMetric(m.id)}
                  className={clsx(
                    'px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all',
                    m.checked
                      ? 'bg-tech-cyan/15 border-tech-cyan/40 text-tech-cyan'
                      : 'bg-ocean-dark/40 border-glass-border text-text-muted'
                  )}
                >
                  {m.checked && '✓ '}{m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 总览卡片 */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-lg bg-gradient-to-br from-tech-cyan/15 to-tech-cyan/5 border border-tech-cyan/30 relative overflow-hidden">
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-tech-cyan/10 blur-xl" />
            <div className="text-[10px] text-tech-cyan mb-1">总清淤量</div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-tech text-3xl font-bold text-tech-cyan">
                {report.totalDredgeVolume.toLocaleString()}
              </span>
              <span className="text-[11px] text-text-muted">吨</span>
            </div>
            <div className="text-[10px] text-eco-green mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> 同比增长 12.8%
            </div>
          </div>
          <div className="p-4 rounded-lg bg-gradient-to-br from-eco-green/15 to-eco-green/5 border border-eco-green/30 relative overflow-hidden">
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-eco-green/10 blur-xl" />
            <div className="text-[10px] text-eco-green mb-1">平均处理效率</div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-tech text-3xl font-bold text-eco-green">
                {(report.avgProcessingEfficiency * 100).toFixed(1)}
              </span>
              <span className="text-[11px] text-text-muted">%</span>
            </div>
            <div className="text-[10px] text-eco-green mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> 环比提升 3.5%
            </div>
          </div>
          <div className="p-4 rounded-lg bg-gradient-to-br from-approval-gold/15 to-approval-gold/5 border border-approval-gold/30 relative overflow-hidden">
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-approval-gold/10 blur-xl" />
            <div className="text-[10px] text-approval-gold mb-1">资源化利用率</div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-tech text-3xl font-bold text-approval-gold">
                {(report.avgResourceUtilization * 100).toFixed(1)}
              </span>
              <span className="text-[11px] text-text-muted">%</span>
            </div>
            <div className="text-[10px] text-eco-green mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> 达标率 100%
            </div>
          </div>
        </div>

        {/* 月度趋势图表 */}
        <div className="rounded-lg border border-glass-border overflow-hidden">
          <div className="px-3 py-2 border-b border-glass-border text-xs text-tech-cyan font-medium flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5" /> 月度核心指标对比
          </div>
          <div className="h-56 p-2">
            <EChartsReact option={monthlyOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>

        {/* 各厂对比 */}
        <div className="rounded-lg border border-glass-border overflow-hidden">
          <div className="px-3 py-2 border-b border-glass-border text-xs text-eco-green font-medium flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" /> 各处理厂产能与产出对比
          </div>
          <div className="h-52 p-2">
            <EChartsReact option={plantCompareOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>

        {/* 数据明细表 */}
        <div className="rounded-lg border border-glass-border overflow-hidden">
          <div className="px-3 py-2 border-b border-glass-border text-xs text-approval-gold font-medium flex items-center gap-1.5">
            <FileSpreadsheet className="w-3.5 h-3.5" /> 月度明细数据表
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead className="bg-ocean-dark/70">
                <tr className="text-text-secondary">
                  <th className="text-left px-3 py-2.5 font-medium">月份</th>
                  <th className="text-right px-3 py-2.5 font-medium">清淤量(吨)</th>
                  <th className="text-right px-3 py-2.5 font-medium">处理效率</th>
                  <th className="text-right px-3 py-2.5 font-medium">资源化利用率</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border/30">
                {report.monthlyBreakdown.map((m, i) => (
                  <tr key={i} className="hover:bg-ocean-dark/40 transition-colors">
                    <td className="px-3 py-2.5 text-text-primary font-medium">{m.month}</td>
                    <td className="px-3 py-2.5 text-right font-tech text-tech-cyan">{m.dredgeVolume.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-right">
                      <span className={clsx(
                        'font-tech px-2 py-0.5 rounded text-[10px]',
                        m.processingEfficiency >= 0.85 ? 'bg-eco-green/15 text-eco-green' : 'bg-warn-orange/15 text-warn-orange'
                      )}>
                        {(m.processingEfficiency * 100).toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span className={clsx(
                        'font-tech px-2 py-0.5 rounded text-[10px]',
                        m.resourceUtilization >= 0.75 ? 'bg-approval-gold/15 text-approval-gold' : 'bg-danger-red/15 text-danger-red'
                      )}>
                        {(m.resourceUtilization * 100).toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default ReportPanel;

import * as XLSX from 'xlsx';
import type { QuarterlyReport } from '@/types';

const quarterMonths = (q: number) => {
  const start = (q - 1) * 3 + 1;
  return [start, start + 1, start + 2].map((m) => `${m}月`);
};

export const generateQuarterlyReport = (year: number, quarter: number): QuarterlyReport => {
  const months = quarterMonths(quarter);
  const monthlyBreakdown = months.map((m, idx) => {
    const base = 12000 + idx * 800 + (Math.random() - 0.5) * 1500;
    return {
      month: m,
      dredgeVolume: Math.round(base),
      processingEfficiency: 0.82 + idx * 0.015 + (Math.random() - 0.5) * 0.03,
      resourceUtilization: 0.76 + idx * 0.02 + (Math.random() - 0.5) * 0.025,
    };
  });
  const totalDredge = monthlyBreakdown.reduce((s, m) => s + m.dredgeVolume, 0);
  const avgEff = monthlyBreakdown.reduce((s, m) => s + m.processingEfficiency, 0) / 3;
  const avgUtil = monthlyBreakdown.reduce((s, m) => s + m.resourceUtilization, 0) / 3;

  const plantNames = ['东区脱水处理厂', '南区脱水处理厂', '北区脱水处理厂'];
  const plantBreakdown = plantNames.map((name, i) => {
    const processed = Math.round(totalDredge * (0.28 + i * 0.08));
    return {
      plantName: name,
      processedVolume: processed,
      efficiency: 0.8 + i * 0.04,
      ceramicOutput: Math.round(processed * 0.18),
      fertilizerOutput: Math.round(processed * 0.25),
    };
  });

  return {
    quarter: `Q${quarter}`,
    year,
    totalDredgeVolume: totalDredge,
    avgProcessingEfficiency: avgEff,
    avgResourceUtilization: avgUtil,
    monthlyBreakdown,
    plantBreakdown,
  };
};

export const exportReportToExcel = (report: QuarterlyReport): Blob => {
  const wb = XLSX.utils.book_new();

  // Sheet 1: 总览
  const overviewData = [
    [`${report.year}年${report.quarter}季度 - 城市河道清淤与资源化利用季度报表`],
    [],
    ['指标名称', '数值', '单位'],
    ['总清淤量', report.totalDredgeVolume.toLocaleString(), '吨'],
    ['平均处理效率', (report.avgProcessingEfficiency * 100).toFixed(2) + '%', '%'],
    ['平均资源化利用率', (report.avgResourceUtilization * 100).toFixed(2) + '%', '%'],
    [],
    ['生成时间', new Date().toLocaleString('zh-CN')],
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(overviewData);
  ws1['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 15 }];
  ws1['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }];
  XLSX.utils.book_append_sheet(wb, ws1, '总览');

  // Sheet 2: 月度明细
  const monthHeader = ['月份', '清淤量(吨)', '处理效率', '资源化利用率'];
  const monthRows = report.monthlyBreakdown.map((m) => [
    m.month,
    m.dredgeVolume,
    (m.processingEfficiency * 100).toFixed(2) + '%',
    (m.resourceUtilization * 100).toFixed(2) + '%',
  ]);
  const ws2 = XLSX.utils.aoa_to_sheet([monthHeader, ...monthRows]);
  ws2['!cols'] = [{ wch: 15 }, { wch: 18 }, { wch: 15 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, ws2, '月度明细');

  // Sheet 3: 各厂数据
  const plantHeader = ['处理厂名称', '处理量(吨)', '效率', '陶粒产出(吨)', '肥料产出(吨)'];
  const plantRows = report.plantBreakdown.map((p) => [
    p.plantName,
    p.processedVolume,
    (p.efficiency * 100).toFixed(2) + '%',
    p.ceramicOutput,
    p.fertilizerOutput,
  ]);
  const totalPlant = report.plantBreakdown.reduce(
    (acc, p) => ({
      processed: acc.processed + p.processedVolume,
      ceramic: acc.ceramic + p.ceramicOutput,
      fert: acc.fert + p.fertilizerOutput,
    }),
    { processed: 0, ceramic: 0, fert: 0 }
  );
  plantRows.push([
    '合计',
    totalPlant.processed,
    '-',
    totalPlant.ceramic,
    totalPlant.fert,
  ]);
  const ws3 = XLSX.utils.aoa_to_sheet([plantHeader, ...plantRows]);
  ws3['!cols'] = [{ wch: 22 }, { wch: 16 }, { wch: 12 }, { wch: 16 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, ws3, '各厂数据');

  // Sheet 4: 指标对比
  const months = report.monthlyBreakdown.map((m) => m.month);
  const compareHeader = ['指标', ...months, '季度平均'];
  const effRow = report.monthlyBreakdown.map((m) => (m.processingEfficiency * 100).toFixed(2) + '%');
  const utilRow = report.monthlyBreakdown.map((m) => (m.resourceUtilization * 100).toFixed(2) + '%');
  const dredgeRow = report.monthlyBreakdown.map((m) => m.dredgeVolume);
  const ws4 = XLSX.utils.aoa_to_sheet([
    compareHeader,
    ['清淤量(吨)', ...dredgeRow, report.totalDredgeVolume],
    ['处理效率', ...effRow, (report.avgProcessingEfficiency * 100).toFixed(2) + '%'],
    ['资源化利用率', ...utilRow, (report.avgResourceUtilization * 100).toFixed(2) + '%'],
  ]);
  ws4['!cols'] = [{ wch: 20 }, ...months.map(() => ({ wch: 15 })), { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, ws4, '指标对比');

  const wbout = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  return new Blob([wbout], { type: 'application/octet-stream' });
};

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

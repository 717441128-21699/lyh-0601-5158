import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  BadgeCheck,
  Building2,
  Camera,
  ScanLine,
  CheckCircle2,
  AlertTriangle,
  Waves,
  Eye,
} from 'lucide-react';
import { NeonButton } from '@/components/ui/NeonButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAppStore } from '@/stores/useAppStore';
import type { UserRole } from '@/types';
import { clsx } from 'clsx';

interface RoleOption {
  role: UserRole;
  label: string;
  sublabel: string;
  icon: typeof Shield;
  color: string;
  shadow: string;
  desc: string[];
}

const roles: RoleOption[] = [
  {
    role: 'operator',
    label: '作业员',
    sublabel: 'Operator',
    icon: Shield,
    color: 'from-tech-cyan/40 to-tech-cyan/10 border-tech-cyan/50 text-tech-cyan',
    shadow: 'shadow-neon-cyan',
    desc: ['执行作业任务', '查看船舶与车辆', '监控设备运行'],
  },
  {
    role: 'river_chief',
    label: '河长',
    sublabel: 'River Chief',
    icon: BadgeCheck,
    color: 'from-eco-green/40 to-eco-green/10 border-eco-green/50 text-eco-green',
    shadow: 'shadow-neon-green',
    desc: ['监管区段河道', '审批调度方案', '查看全流程数据'],
  },
  {
    role: 'administrator',
    label: '管理局',
    sublabel: 'Administrator',
    icon: Building2,
    color: 'from-approval-gold/40 to-approval-gold/10 border-approval-gold/50 text-approval-gold',
    shadow: 'shadow-neon-gold',
    desc: ['全局智能调度', '三级审批决策', '导出季度报表'],
  },
];

export default function Login() {
  const navigate = useNavigate();
  const login = useAppStore((s) => s.login);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanPhase, setScanPhase] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!scanning) return;
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 6 + 1.5;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setScanProgress(100);
        setScanPhase('success');
        setTimeout(async () => {
          if (selectedRole) {
            const ok = await login(selectedRole);
            if (ok) navigate('/dashboard', { replace: true });
            else {
              setScanPhase('error');
              setErrorMsg('身份验证失败，请重试');
            }
          }
        }, 700);
      }
      setScanProgress(p);
    }, 80);
    return () => clearInterval(interval);
  }, [scanning, selectedRole, login, navigate]);

  const startScan = () => {
    if (!selectedRole) {
      setErrorMsg('请先选择登录身份');
      setScanPhase('error');
      setTimeout(() => setScanPhase('idle'), 2000);
      return;
    }
    setErrorMsg('');
    setScanProgress(0);
    setScanPhase('scanning');
    setScanning(true);
    setTimeout(() => setScanning(false), 3000);
  };

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-deep-sea bg-grid-overlay">
      <div className="absolute inset-0 radial-glow pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-deep-sea/50 to-deep-sea pointer-events-none" />

      {/* 装饰波浪 */}
      <div className="absolute bottom-0 left-0 right-0 h-48 opacity-30 pointer-events-none">
        <svg viewBox="0 0 1440 200" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="wave-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#00D4FF" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            fill="url(#wave-grad)"
            d="M0,100 C200,40 400,160 600,100 C800,40 1000,160 1200,100 C1320,60 1380,140 1440,100 L1440,200 L0,200 Z"
            className="animate-pulse-slow"
          />
          <path
            fill="url(#wave-grad)"
            d="M0,140 C180,100 380,180 580,140 C780,100 980,180 1180,140 C1320,110 1390,170 1440,140 L1440,200 L0,200 Z"
            style={{ opacity: 0.5, animation: 'float 8s ease-in-out infinite' }}
          />
        </svg>
      </div>

      {/* 顶部标题 */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center z-10">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Waves className="w-10 h-10 text-tech-cyan drop-shadow-[0_0_10px_rgba(0,212,255,0.8)]" />
          <h1 className="text-4xl font-bold tracking-wide bg-gradient-to-r from-tech-cyan via-tech-cyan-soft to-eco-green bg-clip-text text-transparent drop-shadow-lg">
            城市河道清淤与污泥资源化利用
          </h1>
        </div>
        <p className="text-lg text-text-secondary tracking-[0.3em]">3D 交 互 可 视 化 调 度 平 台</p>
        <div className="mt-2 flex items-center justify-center gap-2 text-xs text-text-muted">
          <span className="w-16 h-px bg-gradient-to-r from-transparent to-tech-cyan/40" />
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3 text-tech-cyan" />
            人脸识别认证登录系统
          </span>
          <span className="w-16 h-px bg-gradient-to-l from-transparent to-tech-cyan/40" />
        </div>
      </div>

      <div className="relative w-full h-full flex items-center justify-center gap-10 px-12 pt-32 pb-40">
        {/* 左侧：人脸识别 */}
        <GlassCard
          cornerMark
          className="!w-[420px] !p-7 shrink-0"
          title="人脸识别验证"
          icon={<Camera className="w-5 h-5" />}
        >
          <div className="relative aspect-square w-full rounded-2xl bg-gradient-to-br from-ocean-dark via-ocean-mid/50 to-ocean-dark border border-tech-cyan/20 overflow-hidden mb-5">
            {/* 网格背景 */}
            <div className="absolute inset-0 bg-grid-overlay opacity-40" />

            {/* 人脸轮廓 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-56 h-72">
                {/* 脸部椭圆虚线 */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 260">
                  <defs>
                    <linearGradient id="face-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#00FF88" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>
                  <ellipse
                    cx="100"
                    cy="130"
                    rx="80"
                    ry="115"
                    fill="none"
                    stroke="url(#face-grad)"
                    strokeWidth="2"
                    strokeDasharray="8 4"
                    className={clsx(
                      scanPhase === 'scanning' && 'animate-pulse',
                      scanPhase === 'success' && 'stroke-eco-green',
                      scanPhase === 'error' && 'stroke-danger-red'
                    )}
                  />
                  {/* 四角标记 */}
                  {[
                    { x: 15, y: 25, tr: true },
                    { x: 185, y: 25, tl: true },
                    { x: 15, y: 235, br: true },
                    { x: 185, y: 235, bl: true },
                  ].map((c, i) => (
                    <path
                      key={i}
                      d={
                        c.tr
                          ? 'M25 25 L15 25 L15 40'
                          : c.tl
                          ? 'M175 25 L185 25 L185 40'
                          : c.br
                          ? 'M25 235 L15 235 L15 220'
                          : 'M175 235 L185 235 L185 220'
                      }
                      stroke={
                        scanPhase === 'success'
                          ? '#00FF88'
                          : scanPhase === 'error'
                          ? '#FF3355'
                          : '#00D4FF'
                      }
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                    />
                  ))}
                </svg>

                {/* 抽象人脸特征 */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-40 h-48 relative">
                    <div className="absolute top-10 left-7 w-8 h-4 rounded-full bg-tech-cyan/25 border border-tech-cyan/40" />
                    <div className="absolute top-10 right-7 w-8 h-4 rounded-full bg-tech-cyan/25 border border-tech-cyan/40" />
                    <div className="absolute top-24 left-1/2 -translate-x-1/2 w-3 h-10 border-l-2 border-tech-cyan/30" />
                    <div className="absolute top-36 left-1/2 -translate-x-1/2 w-20 h-1.5 rounded-full bg-tech-cyan/20 border border-tech-cyan/30" />
                  </div>
                </div>

                {/* 扫描线 */}
                {scanPhase === 'scanning' && (
                  <div
                    className="absolute inset-x-3 h-20 bg-gradient-to-b from-tech-cyan/0 via-tech-cyan/40 to-tech-cyan/0 animate-scan pointer-events-none rounded-full blur-sm"
                    style={{ boxShadow: '0 0 30px rgba(0,212,255,0.6)' }}
                  />
                )}

                {/* 成功 */}
                {scanPhase === 'success' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-eco-green/5 animate-in zoom-in duration-500">
                    <div className="flex flex-col items-center">
                      <CheckCircle2 className="w-20 h-20 text-eco-green animate-in zoom-in" style={{ filter: 'drop-shadow(0 0 20px rgba(0,255,136,0.8))' }} />
                      <div className="mt-3 text-eco-green font-semibold text-lg tracking-wider">识别成功</div>
                    </div>
                  </div>
                )}

                {/* 脉冲环 */}
                {scanPhase === 'scanning' && (
                  <>
                    <div className="absolute inset-16 rounded-full border border-tech-cyan/40 animate-ripple" />
                    <div className="absolute inset-16 rounded-full border border-tech-cyan/40 animate-ripple" style={{ animationDelay: '0.6s' }} />
                  </>
                )}
              </div>
            </div>

            {/* 角标状态 */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 text-[10px] text-tech-cyan-soft font-tech">
              <span className="w-1.5 h-1.5 rounded-full bg-tech-cyan animate-pulse" />
              CAM-01 ACTIVE
            </div>
            <div className="absolute top-3 right-3 text-[10px] text-tech-cyan-soft font-tech">
              1920×1080 · 30FPS
            </div>

            {scanPhase === 'error' && (
              <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-danger-red/15 border border-danger-red/30 text-danger-red text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {errorMsg || '识别失败'}
              </div>
            )}
          </div>

          {/* 进度条 */}
          <div className="mb-5">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-text-secondary">识别进度</span>
              <span className={clsx(
                'font-tech',
                scanPhase === 'success' && 'text-eco-green',
                scanPhase === 'error' && 'text-danger-red',
                (scanPhase === 'idle' || scanPhase === 'scanning') && 'text-tech-cyan'
              )}>
                {scanProgress.toFixed(0)}%
              </span>
            </div>
            <div className="h-2 bg-ocean-dark rounded-full overflow-hidden border border-glass-border">
              <div
                className={clsx(
                  'h-full transition-all duration-200 rounded-full flow-line',
                  scanPhase === 'success'
                    ? 'bg-gradient-to-r from-eco-green to-eco-green-soft shadow-neon-green text-eco-green'
                    : scanPhase === 'error'
                    ? 'bg-gradient-to-r from-danger-red to-danger-red-soft text-danger-red'
                    : 'bg-gradient-to-r from-tech-cyan to-tech-cyan-soft shadow-neon-cyan text-tech-cyan'
                )}
                style={{ width: `${scanProgress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4 text-[10px] text-text-secondary">
            {[
              { k: '活体检测', v: scanPhase !== 'idle' ? '✓' : '—' },
              { k: '特征比对', v: scanProgress > 50 ? '✓' : '—' },
              { k: '权限校验', v: scanPhase === 'success' ? '✓' : '—' },
            ].map((it) => (
              <div key={it.k} className="text-center p-2 rounded-lg bg-ocean-dark/50 border border-glass-border">
                <div className="text-tech-cyan-soft font-tech mb-0.5">{it.v}</div>
                <div>{it.k}</div>
              </div>
            ))}
          </div>

          <NeonButton
            fullWidth
            loading={scanPhase === 'scanning'}
            onClick={startScan}
            icon={<ScanLine className="w-4 h-4" />}
            variant="success"
          >
            {scanPhase === 'scanning' ? '识别中...' : scanPhase === 'success' ? '正在进入系统...' : '开始人脸识别'}
          </NeonButton>
        </GlassCard>

        {/* 右侧：角色选择 */}
        <div className="flex-1 max-w-[520px] flex flex-col gap-5">
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">请选择登录身份</h2>
            <p className="text-sm text-text-secondary">
              平台采用三级权限管理，不同角色拥有不同的操作范围与审批权限
            </p>
          </div>

          <div className="space-y-3.5">
            {roles.map((r) => {
              const Icon = r.icon;
              const active = selectedRole === r.role;
              return (
                <button
                  key={r.role}
                  onClick={() => {
                    setSelectedRole(r.role);
                    setScanPhase('idle');
                    setErrorMsg('');
                  }}
                  className={clsx(
                    'w-full text-left p-5 rounded-xl transition-all duration-300 relative overflow-hidden border bg-gradient-to-r',
                    r.color,
                    active && r.shadow,
                    active ? 'scale-[1.02]' : 'hover:scale-[1.01]',
                    'backdrop-blur-xl'
                  )}
                >
                  {active && (
                    <div className="absolute inset-y-0 left-0 w-1 bg-current animate-pulse" />
                  )}
                  <div className="flex items-start gap-4 pl-2">
                    <div
                      className={clsx(
                        'w-14 h-14 rounded-xl flex items-center justify-center shrink-0',
                        'bg-ocean-dark/60 border border-current/40'
                      )}
                    >
                      <Icon className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-3 mb-0.5">
                        <span className="text-xl font-bold text-text-primary">{r.label}</span>
                        <span className="text-[11px] font-tech text-text-muted uppercase tracking-wider">
                          {r.sublabel}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {r.desc.map((d) => (
                          <span
                            key={d}
                            className="px-2 py-0.5 rounded-md text-[11px] bg-ocean-dark/50 border border-current/20 text-text-secondary"
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div
                      className={clsx(
                        'w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 transition-all',
                        active ? 'bg-current border-current' : 'border-current/40'
                      )}
                    >
                      {active && (
                        <div className="w-2.5 h-2.5 rounded-full bg-ocean-dark" />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-auto pt-4 border-t border-glass-border flex items-center justify-between text-[11px] text-text-muted">
            <span>© 2026 市河道管理局 · 智慧水务中心</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-eco-green animate-pulse" />
              系统安全 · SSL加密 · 运行正常
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

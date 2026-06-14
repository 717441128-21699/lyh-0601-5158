import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Ship,
  Truck,
  Cog,
  LineChart,
  Boxes,
  FileBarChart,
  LogOut,
  Shield,
  BadgeCheck,
  Building2,
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { usePermission } from '@/hooks/usePermission';
import { clsx } from 'clsx';

const navItems = [
  { to: '/dashboard', label: '调度中心', icon: LayoutDashboard, roles: ['operator', 'river_chief', 'administrator'] as const },
  { to: '/ships', label: '船舶管理', icon: Ship, roles: ['operator', 'river_chief', 'administrator'] as const },
  { to: '/transport', label: '运输调度', icon: Truck, roles: ['operator', 'river_chief', 'administrator'] as const },
  { to: '/equipment', label: '设备监控', icon: Cog, roles: ['operator', 'river_chief', 'administrator'] as const },
  { to: '/forecast', label: '预测调度', icon: LineChart, roles: ['river_chief', 'administrator'] as const },
  { to: '/inventory', label: '库存管理', icon: Boxes, roles: ['river_chief', 'administrator'] as const },
  { to: '/reports', label: '报表导出', icon: FileBarChart, roles: ['administrator'] as const },
];

const roleIcons = {
  operator: Shield,
  river_chief: BadgeCheck,
  administrator: Building2,
};

export const SideNav = () => {
  const navigate = useNavigate();
  const logout = useAppStore((s) => s.logout);
  const { currentUser, canAccess, roleLabel } = usePermission();
  if (!currentUser) return null;

  const RoleIcon = roleIcons[currentUser.role];

  return (
    <aside className="h-full w-20 flex flex-col items-center py-4 gap-3 bg-ocean-dark/70 backdrop-blur-xl border-r border-glass-border">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-tech-cyan/30 to-tech-cyan/10 border border-tech-cyan/40 flex items-center justify-center mb-2 shadow-neon-cyan">
        <Ship className="w-7 h-7 text-tech-cyan" />
      </div>

      <nav className="flex-1 flex flex-col items-center gap-2 w-full px-2">
        {navItems.map((item) => {
          if (!canAccess(item.to)) return null;
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'w-full aspect-square rounded-xl flex flex-col items-center justify-center gap-1 group transition-all duration-300',
                  isActive
                    ? 'bg-tech-cyan/20 text-tech-cyan shadow-neon-cyan border border-tech-cyan/40'
                    : 'text-text-secondary hover:bg-ocean-mid/70 hover:text-tech-cyan-soft border border-transparent'
                )
              }
              title={item.label}
            >
              <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
              <span className="text-[10px]">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="w-full flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-approval-gold/30 to-ocean-mid border border-approval-gold/40 flex items-center justify-center relative">
          <RoleIcon className="w-5 h-5 text-approval-gold" />
          <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-eco-green border-2 border-ocean-dark" />
        </div>
        <div className="text-center leading-tight">
          <div className="text-xs text-text-primary font-medium">{currentUser.name}</div>
          <div className="text-[10px] text-text-muted">{roleLabel(currentUser.role)}</div>
        </div>
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-text-muted hover:text-danger-red hover:bg-danger-red/10 transition-colors"
          title="退出登录"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};

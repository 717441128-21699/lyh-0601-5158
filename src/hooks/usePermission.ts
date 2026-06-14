import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';
import type { UserRole } from '@/types';

const rolePermissions: Record<UserRole, string[]> = {
  operator: ['/dashboard', '/ships', '/transport', '/equipment'],
  river_chief: ['/dashboard', '/ships', '/transport', '/equipment', '/forecast', '/inventory'],
  administrator: [
    '/dashboard',
    '/ships',
    '/transport',
    '/equipment',
    '/forecast',
    '/inventory',
    '/reports',
  ],
};

export const usePermission = () => {
  const currentUser = useAppStore((s) => s.currentUser);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!currentUser) {
      if (location.pathname !== '/login') {
        navigate('/login', { replace: true });
      }
      return;
    }

    const allowed = rolePermissions[currentUser.role];
    if (!allowed.includes(location.pathname) && location.pathname !== '/') {
      navigate('/dashboard', { replace: true });
    }
    if (location.pathname === '/') {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, location.pathname, navigate]);

  const canAccess = (route: string) => {
    if (!currentUser) return route === '/login';
    return rolePermissions[currentUser.role].includes(route);
  };

  const roleLabel = (role?: UserRole) => {
    if (role === 'operator') return '作业员';
    if (role === 'river_chief') return '河长';
    if (role === 'administrator') return '管理局';
    return '';
  };

  return { currentUser, canAccess, roleLabel };
};

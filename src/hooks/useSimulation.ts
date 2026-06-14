import { useEffect, useRef } from 'react';
import { useAppStore } from '@/stores/useAppStore';

export const useSimulation = (enabled: boolean = true) => {
  const lastTick = useRef<number>(Date.now());
  const rafRef = useRef<number>();

  useEffect(() => {
    if (!enabled) return;

    const tick = () => {
      const now = Date.now();
      const delta = now - lastTick.current;
      lastTick.current = now;
      useAppStore.getState().tickSimulation(delta);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [enabled]);
};

export const useShipAI = () => {
  // 已在 Store tickSimulation 中实现自动返航触发
};

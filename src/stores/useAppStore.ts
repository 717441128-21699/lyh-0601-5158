import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  User,
  UserRole,
  DredgeShip,
  Berth,
  TreatmentPlant,
  Centrifuge,
  TransportTruck,
  SchedulePlan,
  ProductInventory,
  OperationLog,
  ApprovalStatus,
  QuarterlyReport,
} from '@/types';
import {
  generateMockShips,
  generateMockBerths,
  generateMockPlants,
  generateMockCentrifuges,
  generateMockTrucks,
  generateMockPlans,
  generateMockInventories,
  mockUsers,
} from '@/utils/mock/mockData';
import { generateQuarterlyReport, exportReportToExcel } from '@/utils/excel/reportExporter';

interface AppState {
  currentUser: User | null;
  selectedShipId: string | null;
  selectedTruckId: string | null;
  selectedCentrifugeId: string | null;
  timeRange: [number, number];
  isPlayingTimeline: boolean;
  alertCount: number;

  ships: DredgeShip[];
  berths: Berth[];
  plants: TreatmentPlant[];
  centrifuges: Centrifuge[];
  trucks: TransportTruck[];
  plans: SchedulePlan[];
  inventories: ProductInventory[];
  logs: OperationLog[];

  login: (role: UserRole) => Promise<boolean>;
  logout: () => void;
  setSelectedShip: (id: string | null) => void;
  setSelectedTruck: (id: string | null) => void;
  setSelectedCentrifuge: (id: string | null) => void;
  setIsPlayingTimeline: (playing: boolean) => void;

  triggerShipReturn: (shipId: string) => void;
  dispatchTruck: (truckId: string, plantId: string) => void;
  adjustCentrifugeSpeed: (id: string, newSpeed: number, reason?: string) => void;
  approvePlan: (planId: string, step: number, pass: boolean, comment: string) => void;
  createReplenishment: (productId: string, qty: number) => void;
  approveReplenishment: (productId: string, planId: string, pass: boolean) => void;

  exportReport: (year: number, quarter: number) => Blob | null;
  getQuarterlyReportData: (year: number, quarter: number) => QuarterlyReport;

  addLog: (action: string, details: string) => void;
  tickSimulation: (deltaMs: number) => void;
}

const addLogEntry = (logs: OperationLog[], user: User | null, action: string, details: string): OperationLog[] => {
  if (!user) return logs;
  const newLog: OperationLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    userId: user.id,
    userName: user.name,
    role: user.role,
    action,
    timestamp: Date.now(),
    ip: '192.168.1.' + Math.floor(Math.random() * 255),
    details,
  };
  return [newLog, ...logs].slice(0, 500);
};

const distance = (a: [number, number, number], b: [number, number, number]) =>
  Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);

const lerpPos = (
  a: [number, number, number],
  b: [number, number, number],
  t: number
): [number, number, number] => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      selectedShipId: null,
      selectedTruckId: null,
      selectedCentrifugeId: null,
      timeRange: [Date.now() - 3600_000 * 24, Date.now()],
      isPlayingTimeline: false,
      alertCount: 3,

      ships: generateMockShips(),
      berths: generateMockBerths(),
      plants: generateMockPlants(),
      centrifuges: generateMockCentrifuges(),
      trucks: generateMockTrucks(),
      plans: generateMockPlans(),
      inventories: generateMockInventories(),
      logs: [],

      login: async (role: UserRole) => {
        const user = mockUsers.find((u) => u.role === role);
        if (!user) return false;
        await new Promise((r) => setTimeout(r, 1800));
        set((state) => ({
          currentUser: user,
          logs: addLogEntry(state.logs, user, '登录系统', `${user.name}以${role === 'operator' ? '作业员' : role === 'river_chief' ? '河长' : '管理局'}身份登录`),
        }));
        return true;
      },
      logout: () =>
        set((state) => {
          const logs = addLogEntry(state.logs, state.currentUser, '退出系统', '用户主动登出');
          return { currentUser: null, selectedShipId: null, selectedTruckId: null, selectedCentrifugeId: null, logs };
        }),
      setSelectedShip: (id) => set({ selectedShipId: id }),
      setSelectedTruck: (id) => set({ selectedTruckId: id }),
      setSelectedCentrifuge: (id) => set({ selectedCentrifugeId: id }),
      setIsPlayingTimeline: (playing) => set({ isPlayingTimeline: playing }),

      triggerShipReturn: (shipId) =>
        set((state) => {
          const ships = state.ships.map((s) => {
            if (s.id !== shipId || s.status === 'returning' || s.status === 'docking') return s;
            const idleBerths = state.berths.filter((b) => b.status === 'idle');
            if (idleBerths.length === 0) return s;
            const berth = idleBerths.reduce((best, b) =>
              distance(b.position, s.position) < distance(best.position, s.position) ? b : best
            );
            const path: [number, number, number][] = [
              s.position,
              [(s.position[0] + berth.position[0]) / 2, 0.5, (s.position[2] + berth.position[2]) / 2 + 1.5],
              berth.position,
            ];
            return {
              ...s,
              status: 'returning' as const,
              assignedBerthId: berth.id,
              returnPath: path,
              targetPosition: berth.position,
              pathProgress: 0,
            };
          });
          const berths = state.berths.map((b) => {
            const ship = ships.find((s) => s.assignedBerthId === b.id && s.status === 'returning');
            if (ship && b.status === 'idle') return { ...b, status: 'occupied' as const, dockedShipId: ship.id };
            return b;
          });
          const ship = ships.find((s) => s.id === shipId);
          const logs = addLogEntry(
            state.logs,
            state.currentUser,
            '船舶返航',
            `${ship?.shipNo}液位${ship?.tankLevel}%，分配至${state.berths.find((b) => b.id === ship?.assignedBerthId)?.name || '泊位'}`
          );
          return { ships, berths, logs };
        }),

      dispatchTruck: (_truckId, _plantId) => set((s) => ({ ...s })),

      adjustCentrifugeSpeed: (id, newSpeed, reason = '手动调整') =>
        set((state) => {
          const centrifuges = state.centrifuges.map((c) => {
            if (c.id !== id) return c;
            const newRecord = {
              id: `opt-${Date.now()}`,
              timestamp: Date.now(),
              beforeSpeed: c.rotationSpeed,
              afterSpeed: newSpeed,
              beforeMoisture: c.outletMoisture,
              reason,
              operator: state.currentUser?.name || '系统',
            };
            return {
              ...c,
              targetSpeed: newSpeed,
              optimizationRecords: [newRecord, ...c.optimizationRecords].slice(0, 50),
            };
          });
          const logs = addLogEntry(state.logs, state.currentUser, '离心机调速', `${id}: ${newSpeed}rpm - ${reason}`);
          return { centrifuges, logs };
        }),

      approvePlan: (planId, step, pass, comment) =>
        set((state) => {
          const plans = state.plans.map((p) => {
            if (p.id !== planId) return p;
            const nextStep: 0 | 1 | 2 | 3 = pass ? ((step + 1) as 0 | 1 | 2 | 3) : ((Math.max(0, step - 1)) as 0 | 1 | 2 | 3);
            const approvalStatus: ApprovalStatus = pass ? 'approved' : 'rejected';
            const approver = state.currentUser?.name || '审批人';
            const now = Date.now();
            const update = {
              approvalStep: nextStep,
              status: (pass && nextStep === 3 ? 'approved' : pass ? 'approving' : 'rejected') as SchedulePlan['status'],
            };
            if (step === 1) {
              return { ...p, ...update, riverBureauApproval: { status: approvalStatus, approver, comment, approvedAt: now } };
            } else if (step === 2) {
              return { ...p, ...update, envBureauApproval: { status: approvalStatus, approver, comment, approvedAt: now } };
            } else if (step === 3) {
              return { ...p, ...update, resourceEnterpriseApproval: { status: approvalStatus, approver, comment, approvedAt: now } };
            }
            return p;
          });
          const logs = addLogEntry(
            state.logs,
            state.currentUser,
            pass ? '审批通过' : '审批驳回',
            `调度方案${planId}第${step}级审批：${pass ? '通过' : '驳回'}，${comment}`
          );
          return { plans, logs };
        }),

      createReplenishment: (productId, qty) =>
        set((state) => {
          const inventories = state.inventories.map((inv) => {
            if (inv.id !== productId) return inv;
            const newPlan = {
              id: `rep-${Date.now()}`,
              productId,
              targetQuantity: qty,
              estimatedDays: Math.ceil(qty / inv.dailyOutput),
              approvalStatus: 'pending' as ApprovalStatus,
              createdAt: Date.now(),
            };
            return { ...inv, replenishmentPlans: [newPlan, ...inv.replenishmentPlans] };
          });
          const logs = addLogEntry(state.logs, state.currentUser, '创建补产计划', `${productId}: ${qty}吨`);
          return { inventories, logs };
        }),

      approveReplenishment: (productId, planId, pass) =>
        set((state) => {
          const inventories = state.inventories.map((inv) => {
            if (inv.id !== productId) return inv;
            return {
              ...inv,
              replenishmentPlans: inv.replenishmentPlans.map((p) =>
                p.id === planId
                  ? {
                      ...p,
                      approvalStatus: (pass ? 'approved' : 'rejected') as ApprovalStatus,
                      approver: state.currentUser?.name,
                      approvedAt: Date.now(),
                    }
                  : p
              ),
            };
          });
          const logs = addLogEntry(
            state.logs,
            state.currentUser,
            pass ? '补产审批通过' : '补产审批驳回',
            `补产计划${planId}: ${pass ? '通过' : '驳回'}`
          );
          return { inventories, logs };
        }),

      exportReport: (year, quarter) => {
        const data = get().getQuarterlyReportData(year, quarter);
        try {
          return exportReportToExcel(data);
        } catch (e) {
          console.error(e);
          return null;
        }
      },

      getQuarterlyReportData: (year, quarter) => generateQuarterlyReport(year, quarter),

      addLog: (action, details) =>
        set((state) => ({ logs: addLogEntry(state.logs, state.currentUser, action, details) })),

      tickSimulation: (deltaMs) => {
        set((state) => {
          const speedFactor = deltaMs / 1000;

          // 船舶模拟
          let newAlertCount = state.alertCount;
          const ships = state.ships.map((s) => {
            let ship = { ...s };

            // 液位上升（工作中）
            if (ship.status === 'working') {
              const inc = 0.08 * speedFactor * (0.8 + Math.random() * 0.4);
              ship.tankLevel = Math.min(100, ship.tankLevel + inc);
              ship.currentDredgeVolume = (ship.tankLevel / 100) * ship.totalCapacity;
              ship.pumpPressure = 2 + Math.sin(Date.now() / 2000) * 0.3 + Math.random() * 0.1;
              // 沿工作路径缓慢移动
              ship.pathProgress = ((ship.pathProgress || 0) + 0.01 * speedFactor) % 1;

              // 液位触发返航
              if (ship.tankLevel >= 80 && !ship.assignedBerthId) {
                setTimeout(() => get().triggerShipReturn(ship.id), 0);
                newAlertCount++;
              }
            } else if (ship.status === 'returning' && ship.returnPath) {
              // 返航路径前进
              const path = ship.returnPath;
              const totalSegs = path.length - 1;
              ship.pathProgress = Math.min(1, (ship.pathProgress || 0) + 0.04 * speedFactor);
              const absT = ship.pathProgress * totalSegs;
              const segIdx = Math.min(Math.floor(absT), totalSegs - 1);
              const segT = absT - segIdx;
              ship.position = lerpPos(path[segIdx], path[segIdx + 1], segT);

              if (ship.pathProgress >= 1) {
                ship.status = 'docking';
                ship.pathProgress = 0;
              }
            } else if (ship.status === 'docking') {
              // 卸载
              const dec = 1.5 * speedFactor;
              ship.tankLevel = Math.max(0, ship.tankLevel - dec);
              ship.currentDredgeVolume = (ship.tankLevel / 100) * ship.totalCapacity;
              if (ship.tankLevel <= 0) {
                ship.status = 'working';
                ship.assignedBerthId = undefined;
                ship.returnPath = undefined;
                ship.workSection = ['东河上游段', '东河中段A区', '西河下游段', '南河分叉口', '北河闸口段'][
                  Math.floor(Math.random() * 5)
                ];
                ship.pathProgress = Math.random();
              }
            }

            return ship;
          });

          // 泊位状态
          const berths = state.berths.map((b) => {
            const docking = ships.find((s) => s.assignedBerthId === b.id && (s.status === 'returning' || s.status === 'docking'));
            if (docking) return { ...b, status: 'occupied' as const, dockedShipId: docking.id };
            return { ...b, status: 'idle' as const, dockedShipId: undefined };
          });

          // 运输车模拟
          const trucks = state.trucks.map((t) => {
            let truck = { ...t };
            if (truck.status === 'transporting' && truck.routePath.length > 1) {
              const path = truck.routePath;
              const totalSegs = path.length - 1;
              truck.pathProgress = Math.min(1, (truck.pathProgress || 0) + 0.025 * speedFactor);
              const absT = truck.pathProgress * totalSegs;
              const segIdx = Math.min(Math.floor(absT), totalSegs - 1);
              const segT = absT - segIdx;
              truck.position = lerpPos(path[segIdx], path[segIdx + 1], segT);

              if (truck.pathProgress >= 0.98) {
                // 检查目标厂排队情况
                const queuingForPlant = state.trucks.filter(
                  (ot) => ot.targetPlantId === truck.targetPlantId && (ot.status === 'queuing' || ot.status === 'unloading')
                ).length;
                if (queuingForPlant > 0 && truck.priority < 3) {
                  truck.status = 'queuing';
                  truck.waitTime = queuingForPlant * 300_000;
                } else {
                  truck.status = 'unloading';
                }
              }
            } else if (truck.status === 'queuing') {
              truck.waitTime = Math.max(0, truck.waitTime - deltaMs);
              if (truck.waitTime <= 0) {
                truck.status = 'unloading';
              }
            } else if (truck.status === 'unloading') {
              const dec = 0.3 * speedFactor;
              truck.loadWeight = Math.max(0, truck.loadWeight - dec);
              if (truck.loadWeight <= 0) {
                truck.status = 'returning';
                truck.pathProgress = 1;
                // 反向路径
                truck.routePath = [...truck.routePath].reverse();
                truck.pathProgress = 0;
              }
            } else if (truck.status === 'returning' && truck.routePath.length > 1) {
              const path = truck.routePath;
              const totalSegs = path.length - 1;
              truck.pathProgress = Math.min(1, (truck.pathProgress || 0) + 0.035 * speedFactor);
              const absT = truck.pathProgress * totalSegs;
              const segIdx = Math.min(Math.floor(absT), totalSegs - 1);
              const segT = absT - segIdx;
              truck.position = lerpPos(path[segIdx], path[segIdx + 1], segT);
              if (truck.pathProgress >= 1) {
                truck.status = 'loading';
                truck.loadWeight = truck.maxLoad;
                setTimeout(() => {
                  const plants = get().plants;
                  const sorted = [...plants].sort(
                    (a, b) => a.processingLoad / a.maxLoad - b.processingLoad / b.maxLoad
                  );
                  const target = sorted[0];
                  set((s2) => ({
                    trucks: s2.trucks.map((tt) =>
                      tt.id === truck.id
                        ? {
                            ...tt,
                            status: 'transporting',
                            targetPlantId: target.id,
                            pathProgress: 0,
                            routePath: [...tt.routePath].reverse(),
                          }
                        : tt
                    ),
                  }));
                }, 2000);
              }
            } else if (truck.status === 'loading') {
              // 等待装货
            }
            return truck;
          });

          // 离心机模拟
          const centrifuges = state.centrifuges.map((c) => {
            let cent = { ...c };
            if (cent.status === 'stopped') return cent;
            // 转速趋近目标
            const speedDiff = cent.targetSpeed - cent.rotationSpeed;
            cent.rotationSpeed += speedDiff * 0.02 * speedFactor;
            cent.current = 35 + (cent.rotationSpeed / 3500) * 20 + (Math.random() - 0.5) * 2;

            // 含水率计算（随转速升高而降低）
            const baseMoisture = 75 - (cent.rotationSpeed / 3500) * 20;
            const noise = (Math.random() - 0.5) * 3;
            cent.outletMoisture = Math.max(45, Math.min(85, baseMoisture + noise));
            cent.feedConcentration = 18 + (Math.random() - 0.5) * 4;

            // 自动调速
            if (cent.outletMoisture > cent.standardMoisture + 3 && cent.status !== 'warning') {
              cent.status = 'warning';
              if (cent.targetSpeed < 3800) {
                const newTarget = Math.min(3800, cent.targetSpeed + 200);
                setTimeout(() => get().adjustCentrifugeSpeed(cent.id, newTarget, `含水率${cent.outletMoisture.toFixed(1)}%超标，自动提转速`), 0);
                newAlertCount++;
              }
            } else if (cent.outletMoisture <= cent.standardMoisture && cent.status === 'warning') {
              cent.status = 'running';
            }
            return cent;
          });

          // 处理厂负荷更新
          const plants = state.plants.map((p) => {
            const plantCents = centrifuges.filter((c) => c.plantId === p.id);
            const avgLoad = plantCents.reduce((s, c) => s + c.rotationSpeed / 3500, 0) / Math.max(1, plantCents.length);
            const newInv = Math.max(
              0,
              Math.min(p.maxInventory, p.inventory + (0.05 * speedFactor * (0.5 + avgLoad)))
            );
            const loadVal = Math.min(100, 40 + avgLoad * 60 + Math.sin(Date.now() / 5000) * 5);
            return { ...p, processingLoad: loadVal, inventory: newInv };
          });

          // 库存消耗
          const inventories = state.inventories.map((inv) => {
            let newInv = { ...inv };
            // 低于阈值自动创建补产
            if (newInv.currentStock < newInv.safetyThreshold && newInv.replenishmentPlans.filter((r) => r.approvalStatus === 'pending').length === 0) {
              setTimeout(() => get().createReplenishment(newInv.id, newInv.safetyThreshold * 2), 0);
            }
            // 如果有已批准补产计划，逐步增加
            const approved = newInv.replenishmentPlans.filter((r) => r.approvalStatus === 'approved' && r.approvedAt && Date.now() - r.approvedAt < r.estimatedDays * 86400_000);
            let output = 0;
            if (approved.length > 0) {
              output = (newInv.dailyOutput / 86400) * (deltaMs / 1000) * approved.length * 3;
            }
            // 消耗
            const consume = (newInv.weeklyDemand / (7 * 86400)) * (deltaMs / 1000);
            newInv.currentStock = Math.max(0, Math.min(newInv.maxCapacity, newInv.currentStock - consume + output));
            return newInv;
          });

          // 方案执行进度
          const plans = state.plans.map((p) => {
            if (p.status !== 'executing') return p;
            return { ...p, executionProgress: Math.min(100, p.executionProgress + 0.001 * speedFactor) };
          });

          return { ships, berths, trucks, centrifuges, plants, inventories, plans, alertCount: newAlertCount };
        });
      },
    }),
    {
      name: 'river-dredging-store',
      partialize: (s) => ({ logs: s.logs }),
    }
  )
);

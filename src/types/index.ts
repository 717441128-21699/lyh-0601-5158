export type UserRole = 'operator' | 'river_chief' | 'administrator';
export type ShipStatus = 'working' | 'returning' | 'docking' | 'idle';
export type BerthStatus = 'occupied' | 'idle';
export type TruckStatus = 'loading' | 'transporting' | 'queuing' | 'unloading' | 'returning';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type CentrifugeStatus = 'running' | 'warning' | 'stopped';
export type WeatherType = '晴' | '多云' | '小雨' | '大雨';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  department: string;
}

export interface OperationLog {
  id: string;
  userId: string;
  userName: string;
  role: UserRole;
  action: string;
  timestamp: number;
  ip: string;
  details: string;
}

export interface DredgeHourData {
  hour: number;
  volume: number;
  pressure: number;
}

export interface DredgeShip {
  id: string;
  shipNo: string;
  status: ShipStatus;
  position: [number, number, number];
  targetPosition?: [number, number, number];
  workSection: string;
  currentDredgeVolume: number;
  tankLevel: number;
  totalCapacity: number;
  pumpPressure: number;
  crewCount: number;
  hourlyData: DredgeHourData[];
  assignedBerthId?: string;
  returnPath?: [number, number, number][];
  pathProgress?: number;
}

export interface Berth {
  id: string;
  name: string;
  status: BerthStatus;
  position: [number, number, number];
  dockedShipId?: string;
}

export interface TreatmentPlant {
  id: string;
  name: string;
  position: [number, number, number];
  processingLoad: number;
  maxLoad: number;
  inventory: number;
  maxInventory: number;
  centrifugeIds: string[];
}

export interface OptimizationRecord {
  id: string;
  timestamp: number;
  beforeSpeed: number;
  afterSpeed: number;
  beforeMoisture: number;
  reason: string;
  operator: string;
}

export interface Centrifuge {
  id: string;
  plantId: string;
  name: string;
  status: CentrifugeStatus;
  feedConcentration: number;
  outletMoisture: number;
  standardMoisture: number;
  rotationSpeed: number;
  targetSpeed: number;
  current: number;
  optimizationRecords: OptimizationRecord[];
}

export interface TransportTruck {
  id: string;
  plateNo: string;
  status: TruckStatus;
  position: [number, number, number];
  loadWeight: number;
  maxLoad: number;
  priority: 1 | 2 | 3;
  originId: string;
  targetPlantId: string;
  routePath: [number, number, number][];
  estimatedArrival: number;
  waitTime: number;
  queuePosition: number;
  pathProgress?: number;
}

export interface ForecastDay {
  date: string;
  forecastVolume: number;
  historicalVolume: number;
  weatherFactor: number;
  weatherType: WeatherType;
  temperature: [number, number];
}

export interface ApprovalItem {
  status: ApprovalStatus;
  approver?: string;
  comment?: string;
  approvedAt?: number;
}

export interface SchedulePlan {
  id: string;
  name: string;
  createdAt: number;
  period: [string, string];
  forecastData: ForecastDay[];
  shipAssignments: { shipId: string; dayVolume: number }[];
  approvalStep: 0 | 1 | 2 | 3;
  riverBureauApproval: ApprovalItem;
  envBureauApproval: ApprovalItem;
  resourceEnterpriseApproval: ApprovalItem;
  status: 'draft' | 'approving' | 'approved' | 'rejected' | 'executing';
  executionProgress: number;
}

export interface ReplenishmentPlan {
  id: string;
  productId: string;
  targetQuantity: number;
  estimatedDays: number;
  approvalStatus: ApprovalStatus;
  approver?: string;
  createdAt: number;
  approvedAt?: number;
}

export interface ProductInventory {
  id: string;
  productName: '陶粒' | '肥料';
  currentStock: number;
  safetyThreshold: number;
  maxCapacity: number;
  dailyOutput: number;
  weeklyDemand: number;
  replenishmentPlans: ReplenishmentPlan[];
}

export interface QuarterlyReport {
  quarter: string;
  year: number;
  totalDredgeVolume: number;
  avgProcessingEfficiency: number;
  avgResourceUtilization: number;
  monthlyBreakdown: {
    month: string;
    dredgeVolume: number;
    processingEfficiency: number;
    resourceUtilization: number;
  }[];
  plantBreakdown: {
    plantName: string;
    processedVolume: number;
    efficiency: number;
    ceramicOutput: number;
    fertilizerOutput: number;
  }[];
}

export type Triplet = [number, number, number];

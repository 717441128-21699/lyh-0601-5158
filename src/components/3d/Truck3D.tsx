import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { TransportTruck } from '@/types';

interface Props {
  truck: TransportTruck;
  selected: boolean;
  onClick: () => void;
}

const statusColors: Record<string, string> = {
  loading: '#FFD700',
  transporting: '#00FF88',
  queuing: '#FF8800',
  unloading: '#00D4FF',
  returning: '#8AB4D8',
};

const statusLabels: Record<string, string> = {
  loading: '装料',
  transporting: '运输中',
  queuing: '排队中',
  unloading: '卸料中',
  returning: '返程',
};

export const Truck3D = ({ truck, selected, onClick }: Props) => {
  const groupRef = useRef<THREE.Group>(null);
  const wheelRefs = useRef<THREE.Group[]>([]);
  const statusColor = statusColors[truck.status];

  useFrame((state, delta) => {
    if (groupRef.current) {
      // 朝向插值
      if (truck.routePath && truck.pathProgress !== undefined) {
        const p = truck.pathProgress;
        const path = truck.routePath;
        const totalSegs = path.length - 1;
        const absT = p * totalSegs;
        const segIdx = Math.min(Math.floor(absT), totalSegs - 1);
        if (segIdx >= 0 && segIdx < totalSegs) {
          const p1 = new THREE.Vector3(...path[segIdx]);
          const p2 = new THREE.Vector3(...path[segIdx + 1]);
          const dir = new THREE.Vector3().subVectors(p2, p1);
          const angle = Math.atan2(dir.x, dir.z);
          groupRef.current.rotation.y = angle;
        }
      }
    }
    // 轮子旋转
    const rolling = truck.status === 'transporting' || truck.status === 'returning';
    wheelRefs.current.forEach((w) => {
      if (w) w.rotation.x += rolling ? delta * 15 : 0;
    });
  });

  const loadPct = (truck.loadWeight / truck.maxLoad) * 100;

  return (
    <group
      ref={groupRef}
      position={truck.position}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      {/* 选中光环 */}
      {selected && (
        <mesh position={[0, -0.35, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.1, 1.35, 36]} />
          <meshBasicMaterial color="#00FF88" transparent opacity={0.85} />
        </mesh>
      )}

      {/* 底盘 */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[1.2, 0.25, 3.2]} />
        <meshStandardMaterial color="#222" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* 车轮 */}
      {[
        [-0.55, 0.15, -1.1, 0],
        [0.55, 0.15, -1.1, 1],
        [-0.55, 0.15, 1.1, 2],
        [0.55, 0.15, 1.1, 3],
      ].map(([x, y, z, i]) => (
        <group key={i} ref={(r) => r && (wheelRefs.current[i] = r)} position={[x, y, z]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.28, 0.28, 0.2, 16]} />
            <meshStandardMaterial color="#111" roughness={0.8} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0.005]}>
            <cylinderGeometry args={[0.16, 0.16, 0.22, 10]} />
            <meshStandardMaterial color="#ddd" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* 驾驶室 */}
      <mesh position={[0, 0.9, 1.3]} castShadow>
        <boxGeometry args={[1.1, 0.9, 0.9]} />
        <meshStandardMaterial color="#e0e0e0" metalness={0.4} roughness={0.4} />
      </mesh>
      {/* 驾驶室挡风 */}
      <mesh position={[0, 1.0, 1.76]}>
        <boxGeometry args={[0.9, 0.5, 0.02]} />
        <meshStandardMaterial
          color="#00D4FF"
          emissive="#0088cc"
          emissiveIntensity={0.5}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* 污泥槽 */}
      <mesh position={[0, 0.75, -0.5]} castShadow>
        <boxGeometry args={[1.15, 0.6, 2.0]} />
        <meshStandardMaterial color="#5a4535" roughness={0.8} />
      </mesh>
      {/* 污泥装载可视化 */}
      <mesh position={[0, 0.46 + (loadPct / 100) * 0.22, -0.5]}>
        <boxGeometry args={[1.05, (loadPct / 100) * 0.45, 1.9]} />
        <meshStandardMaterial
          color="#3d2817"
          emissive="#4a3020"
          emissiveIntensity={0.2}
          roughness={0.95}
        />
      </mesh>

      {/* 车顶状态灯 */}
      <mesh position={[0, 1.5, 1.3]}>
        <boxGeometry args={[0.3, 0.08, 0.15]} />
        <meshStandardMaterial color={statusColor} emissive={statusColor} emissiveIntensity={1.5} />
      </mesh>
      <pointLight position={[0, 1.55, 1.3]} color={statusColor} distance={3} intensity={0.8} />

      {/* 信息标签 */}
      <Html position={[0, 2.4, 0]} center distanceFactor={12} style={{ pointerEvents: 'none' }}>
        <div
          className={`px-2.5 py-1.5 rounded-lg border backdrop-blur-md min-w-[140px] ${
            selected
              ? 'bg-ocean-dark/95 border-eco-green/60 shadow-neon-green'
              : 'bg-ocean-dark/80 border-glass-border'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-tech font-bold text-[11px] text-text-primary">
              {truck.plateNo}
            </span>
            <span
              className="px-1.5 py-0.5 rounded text-[9px] font-medium"
              style={{
                backgroundColor: `${statusColor}22`,
                color: statusColor,
                border: `1px solid ${statusColor}55`,
              }}
            >
              {statusLabels[truck.status]}
            </span>
          </div>
          <div className="flex items-center gap-1 mb-0.5">
            <div className="flex-1 h-1 rounded-full bg-ocean-mid overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${loadPct}%`,
                  backgroundColor: loadPct > 80 ? '#FF8800' : statusColor,
                }}
              />
            </div>
            <span className="font-tech text-[9px] text-text-secondary">
              {truck.loadWeight.toFixed(1)}t
            </span>
          </div>
          <div className="flex items-center gap-1 text-[9px] text-text-muted">
            <span>★{'★'.repeat(truck.priority - 1)}</span>
            <span className="ml-auto">
              {truck.status === 'queuing'
                ? `等待 ${Math.ceil(truck.waitTime / 60000)}分`
                : '目标: ' + (truck.targetPlantId === 'plant-1' ? '东区' : truck.targetPlantId === 'plant-2' ? '南区' : '北区')}
            </span>
          </div>
        </div>
      </Html>
    </group>
  );
};

export default Truck3D;

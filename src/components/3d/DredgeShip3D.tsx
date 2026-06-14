import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { DredgeShip } from '@/types';
import { clsx } from 'clsx';

interface Props {
  ship: DredgeShip;
  selected: boolean;
  onClick: () => void;
}

export const DredgeShip3D = ({ ship, selected, onClick }: Props) => {
  const groupRef = useRef<THREE.Group>(null);
  const propellerRef = useRef<THREE.Mesh>(null);
  const workLight = useRef<THREE.PointLight>(null);
  const bobPhase = useMemo(() => Math.random() * Math.PI * 2, []);

  const statusColor: Record<string, string> = {
    working: '#00FF88',
    returning: '#00D4FF',
    docking: '#FFD700',
    idle: '#8AB4D8',
  };

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    // 漂浮
    groupRef.current.position.y = ship.position[1] + Math.sin(t * 1.4 + bobPhase) * 0.06;
    groupRef.current.rotation.z = Math.sin(t * 1.2 + bobPhase) * 0.02;
    // 螺旋桨
    if (propellerRef.current) {
      propellerRef.current.rotation.y += ship.status === 'docking' ? 0 : 0.35;
    }
    // 作业灯光闪烁
    if (workLight.current && ship.status === 'working') {
      workLight.current.intensity = 1.5 + Math.sin(t * 6) * 0.6;
    } else if (workLight.current) {
      workLight.current.intensity = 0.5;
    }
  });

  const levelColor = ship.tankLevel >= 80 ? '#FF3355' : ship.tankLevel >= 60 ? '#FF8800' : '#00FF88';
  const color = statusColor[ship.status];

  return (
    <group
      ref={groupRef}
      position={ship.position}
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
          <ringGeometry args={[1.4, 1.8, 48]} />
          <meshBasicMaterial color="#00D4FF" transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
      )}
      {selected && (
        <mesh position={[0, -0.34, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.0, 2.05, 64]} />
          <meshBasicMaterial color="#00D4FF" transparent opacity={0.4} />
        </mesh>
      )}

      {/* 船体主体 */}
      <group>
        {/* 船身 */}
        <mesh position={[0, -0.05, 0]} castShadow>
          <boxGeometry args={[1.6, 0.5, 3.6]} />
          <meshStandardMaterial color="#1c3f5c" metalness={0.3} roughness={0.5} />
        </mesh>
        {/* 船底 */}
        <mesh position={[0, -0.35, 0]} castShadow>
          <boxGeometry args={[1.3, 0.3, 3.2]} />
          <meshStandardMaterial color="#0e2338" metalness={0.2} roughness={0.7} />
        </mesh>
        {/* 甲板 */}
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[1.5, 0.04, 3.5]} />
          <meshStandardMaterial color="#2a5078" metalness={0.5} roughness={0.3} />
        </mesh>
        {/* 驾驶楼 */}
        <mesh position={[0, 0.6, 0.8]} castShadow>
          <boxGeometry args={[1.2, 0.55, 1.0]} />
          <meshStandardMaterial color="#f0f4f8" metalness={0.3} roughness={0.4} />
        </mesh>
        {/* 驾驶楼窗户 */}
        <mesh position={[-0.5, 0.62, 1.31]}>
          <boxGeometry args={[0.03, 0.25, 0.6]} />
          <meshStandardMaterial color="#00D4FF" emissive="#00D4FF" emissiveIntensity={0.8} transparent opacity={0.85} />
        </mesh>
        <mesh position={[0.5, 0.62, 1.31]}>
          <boxGeometry args={[0.03, 0.25, 0.6]} />
          <meshStandardMaterial color="#00D4FF" emissive="#00D4FF" emissiveIntensity={0.8} transparent opacity={0.85} />
        </mesh>
        <mesh position={[0, 0.78, 1.31]}>
          <boxGeometry args={[1.0, 0.03, 0.6]} />
          <meshStandardMaterial color="#00D4FF" emissive="#00D4FF" emissiveIntensity={0.6} transparent opacity={0.8} />
        </mesh>
        {/* 桅杆 */}
        <mesh position={[0, 1.1, 0.8]}>
          <cylinderGeometry args={[0.03, 0.04, 0.7, 8]} />
          <meshStandardMaterial color="#555" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* 信号灯 */}
        <mesh position={[0, 1.48, 0.8]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} />
        </mesh>

        {/* 清淤臂 */}
        <mesh position={[0, 0.35, -1.6]} rotation={[0.35, 0, 0]}>
          <boxGeometry args={[0.2, 0.2, 1.6]} />
          <meshStandardMaterial color="#e8b84a" metalness={0.5} roughness={0.4} />
        </mesh>
        {/* 清淤头 */}
        <mesh position={[0, 0.05, -2.5]} rotation={[0.7, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.3, 0.35, 12]} />
          <meshStandardMaterial color="#ff6644" metalness={0.6} roughness={0.3} emissive="#ff3300" emissiveIntensity={0.3} />
        </mesh>
        {/* 工作灯 */}
        <pointLight ref={workLight} position={[0, 1.5, -2.2]} color="#FF8800" distance={4} intensity={1.2} />

        {/* 螺旋桨 */}
        <group position={[0, -0.3, 1.85]}>
          <mesh ref={propellerRef}>
            <boxGeometry args={[0.08, 0.08, 0.6]} />
            <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[0.08, 0.08, 0.6]} />
            <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>

        {/* 液位可视化 */}
        <group position={[0.85, 0.2, 0]}>
          <mesh>
            <boxGeometry args={[0.06, 0.6, 0.5]} />
            <meshStandardMaterial color="#0a1a28" transparent opacity={0.9} />
          </mesh>
          <mesh position={[0, -0.3 + (ship.tankLevel / 100) * 0.3, 0]}>
            <boxGeometry args={[0.04, (ship.tankLevel / 100) * 0.6, 0.45]} />
            <meshStandardMaterial color={levelColor} emissive={levelColor} emissiveIntensity={0.5} transparent opacity={0.9} />
          </mesh>
        </group>
      </group>

      {/* 浮动信息卡 */}
      <Html
        position={[0, 2.6, 0]}
        center
        style={{ pointerEvents: 'none' }}
        distanceFactor={12}
      >
        <div
          className={clsx(
            'px-3 py-2 rounded-lg border backdrop-blur-md min-w-[160px] transition-all',
            selected
              ? 'bg-ocean-dark/90 border-tech-cyan/60 shadow-neon-cyan'
              : 'bg-ocean-dark/75 border-glass-border'
          )}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-tech font-bold text-sm text-tech-cyan">{ship.shipNo}</span>
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
            />
          </div>
          <div className="text-[10px] text-text-secondary mb-1.5 flex items-center gap-1">
            📍 {ship.workSection}
          </div>
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-text-muted">清淤量</span>
            <span className="font-tech text-eco-green font-medium">{ship.currentDredgeVolume.toFixed(1)}t</span>
          </div>
          <div className="h-1.5 rounded-full bg-ocean-mid overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${ship.tankLevel}%`,
                backgroundColor: levelColor,
                boxShadow: `0 0 6px ${levelColor}`,
              }}
            />
          </div>
          <div className="flex justify-between text-[9px] mt-0.5 text-text-muted">
            <span>液位</span>
            <span className="font-tech" style={{ color: levelColor }}>
              {ship.tankLevel.toFixed(0)}%
            </span>
          </div>
        </div>
      </Html>
    </group>
  );
};

export default DredgeShip3D;

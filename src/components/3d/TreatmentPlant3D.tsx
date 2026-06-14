import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { TreatmentPlant } from '@/types';

interface Props {
  plant: TreatmentPlant;
}

export const TreatmentPlant3D = ({ plant }: Props) => {
  const smokeRef = useRef<THREE.Group>(null);
  const windowRefs = useRef<THREE.Mesh[]>([]);

  const smokeParticles = useMemo(
    () => Array.from({ length: 20 }, () => ({ speed: 0.3 + Math.random() * 0.4, offset: Math.random() * 3 })),
    []
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (smokeRef.current) {
      smokeRef.current.children.forEach((c, i) => {
        const p = smokeParticles[i];
        if (p && c instanceof THREE.Mesh) {
          const phase = ((t + p.offset) % (3 / p.speed)) * p.speed / 3;
          c.position.y = 4 + phase * 4;
          c.position.x = Math.sin(phase * 5 + i) * 0.25;
          c.position.z = Math.cos(phase * 4 + i * 0.7) * 0.2;
          const mat = c.material as THREE.MeshBasicMaterial;
          mat.opacity = 0.55 * (1 - phase);
          c.scale.setScalar(0.4 + phase * 0.6);
        }
      });
    }
    windowRefs.current.forEach((w, i) => {
      if (w) {
        const mat = w.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = 0.6 + Math.sin(t * 1.5 + i) * 0.3;
      }
    });
  });

  const loadColor =
    plant.processingLoad >= 85 ? '#FF3355' : plant.processingLoad >= 65 ? '#FF8800' : '#00FF88';
  const invPct = (plant.inventory / plant.maxInventory) * 100;

  return (
    <group position={plant.position}>
      {/* 主厂房 */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[5, 3, 4]} />
        <meshStandardMaterial color="#4a5a70" roughness={0.7} metalness={0.3} />
      </mesh>
      {/* 屋顶 */}
      <mesh position={[0, 3.15, 0]}>
        <boxGeometry args={[5.2, 0.3, 4.2]} />
        <meshStandardMaterial color="#2a3a4a" roughness={0.8} />
      </mesh>
      {/* 工厂窗户矩阵 */}
      {[
        [-2.2, 1.6, 2.01, 0.7, 0.7],
        [-0.8, 1.6, 2.01, 0.7, 0.7],
        [0.8, 1.6, 2.01, 0.7, 0.7],
        [2.2, 1.6, 2.01, 0.7, 0.7],
        [-2.2, 2.5, 2.01, 0.7, 0.6],
        [-0.8, 2.5, 2.01, 0.7, 0.6],
        [0.8, 2.5, 2.01, 0.7, 0.6],
        [2.2, 2.5, 2.01, 0.7, 0.6],
        [-2.2, 1.6, -2.01, 0.7, 0.7],
        [-0.8, 1.6, -2.01, 0.7, 0.7],
        [0.8, 1.6, -2.01, 0.7, 0.7],
        [2.2, 1.6, -2.01, 0.7, 0.7],
      ].map(([x, y, z, w, h], i) => (
        <mesh
          key={i}
          position={[x, y, z]}
          ref={(r) => r && (windowRefs.current[i] = r)}
        >
          <boxGeometry args={[w, h, 0.02]} />
          <meshStandardMaterial
            color="#FFE8A0"
            emissive="#FFB050"
            emissiveIntensity={0.8}
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}

      {/* 烟囱 */}
      <mesh position={[-1.8, 4.3, 0.8]} castShadow>
        <cylinderGeometry args={[0.3, 0.45, 2.5, 12]} />
        <meshStandardMaterial color="#555" roughness={0.8} />
      </mesh>
      <mesh position={[-0.3, 4.3, 0.8]} castShadow>
        <cylinderGeometry args={[0.3, 0.45, 2.5, 12]} />
        <meshStandardMaterial color="#555" roughness={0.8} />
      </mesh>
      {/* 烟囱顶 */}
      <mesh position={[-1.8, 5.65, 0.8]}>
        <cylinderGeometry args={[0.4, 0.3, 0.15, 12]} />
        <meshStandardMaterial color="#333" roughness={0.7} />
      </mesh>
      <mesh position={[-0.3, 5.65, 0.8]}>
        <cylinderGeometry args={[0.4, 0.3, 0.15, 12]} />
        <meshStandardMaterial color="#333" roughness={0.7} />
      </mesh>

      {/* 烟雾粒子 */}
      <group ref={smokeRef}>
        {smokeParticles.map((_, i) => (
          <mesh key={i} position={[i % 2 === 0 ? -1.8 : -0.3, 5.8, 0.8]}>
            <sphereGeometry args={[0.18, 8, 8]} />
            <meshBasicMaterial color="#bbbbbb" transparent opacity={0} depthWrite={false} />
          </mesh>
        ))}
      </group>

      {/* 存储罐 */}
      <mesh position={[2.4, 1.2, -1.5]}>
        <cylinderGeometry args={[0.7, 0.7, 2.4, 20]} />
        <meshStandardMaterial color="#2a4a6a" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[2.4, 2.5, -1.5]}>
        <sphereGeometry args={[0.7, 20, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#2a4a6a" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* 罐体液位指示 */}
      <mesh position={[2.4, 0.5 + (invPct / 100) * 1.2, -1.51]}>
        <boxGeometry args={[0.08, (invPct / 100) * 2.4, 1.2]} />
        <meshStandardMaterial
          color={loadColor}
          emissive={loadColor}
          emissiveIntensity={0.6}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* 厂区围栏 */}
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i / 16) * Math.PI * 2;
        const r = 4.5;
        return (
          <mesh key={i} position={[Math.cos(angle) * r, 0.5, Math.sin(angle) * r]}>
            <boxGeometry args={[0.08, 1, 0.08]} />
            <meshStandardMaterial color="#888" metalness={0.6} />
          </mesh>
        );
      })}

      {/* 信息标签 */}
      <Html position={[0, 5.5, 0]} center distanceFactor={16} style={{ pointerEvents: 'none' }}>
        <div className="glass-panel px-3 py-2 min-w-[200px] hud-corner">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-text-primary">{plant.name}</span>
            <span
              className="badge"
              style={{
                backgroundColor: `${loadColor}22`,
                color: loadColor,
                border: `1px solid ${loadColor}55`,
              }}
            >
              运行中
            </span>
          </div>
          <div className="space-y-1.5 text-[10px]">
            <div>
              <div className="flex justify-between text-text-secondary mb-0.5">
                <span>处理负荷</span>
                <span className="font-tech" style={{ color: loadColor }}>
                  {plant.processingLoad.toFixed(1)}%
                </span>
              </div>
              <div className="h-1 rounded-full bg-ocean-mid overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${plant.processingLoad}%`, backgroundColor: loadColor }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-text-secondary mb-0.5">
                <span>库存余量</span>
                <span className="font-tech text-tech-cyan-soft">
                  {plant.inventory.toFixed(0)}/{plant.maxInventory}t
                </span>
              </div>
              <div className="h-1 rounded-full bg-ocean-mid overflow-hidden">
                <div
                  className="h-full rounded-full bg-tech-cyan transition-all"
                  style={{ width: `${invPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
};

export default TreatmentPlant3D;

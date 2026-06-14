import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { Berth } from '@/types';

interface Props {
  berth: Berth;
}

export const Berth3D = ({ berth }: Props) => {
  const beaconRef = useRef<THREE.Mesh>(null);
  const smokeRef = useRef<THREE.Group>(null);

  const smokeParticles = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        offset: i * 0.6,
        scale: 0.3 + Math.random() * 0.3,
      })),
    []
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (beaconRef.current) {
      beaconRef.current.rotation.y = t * 0.5;
      const mat = (beaconRef.current as THREE.Mesh).material as THREE.MeshStandardMaterial;
      const pulse = 0.8 + Math.sin(t * 3) * 0.2;
      mat.emissiveIntensity = pulse;
    }
    if (smokeRef.current) {
      smokeRef.current.children.forEach((c, i) => {
        const p = smokeParticles[i];
        if (p && c instanceof THREE.Mesh) {
          const phase = ((t + p.offset) % 2.5) / 2.5;
          c.position.y = 0.5 + phase * 2;
          c.position.x = Math.sin(phase * 4 + i) * 0.1;
          c.position.z = Math.cos(phase * 3 + i) * 0.1;
          const mat = c.material as THREE.MeshBasicMaterial;
          mat.opacity = 0.6 * (1 - phase);
          c.scale.setScalar(p.scale * (1 + phase));
        }
      });
    }
  });

  const active = berth.status === 'occupied';
  const color = active ? '#FFD700' : '#00D4FF';

  return (
    <group position={berth.position}>
      {/* 码头平台 */}
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.5, 0.7, 6]} />
        <meshStandardMaterial color="#5a4535" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.72, 0]}>
        <boxGeometry args={[3.4, 0.06, 5.9]} />
        <meshStandardMaterial color="#7a6252" roughness={0.8} />
      </mesh>
      {/* 防撞垫 */}
      {[-1.5, 0, 1.5].map((z, i) => (
        <mesh key={i} position={[-1.76, 0.55, z]}>
          <boxGeometry args={[0.1, 0.5, 0.8]} />
          <meshStandardMaterial color="#222" roughness={0.6} />
        </mesh>
      ))}
      {/* 支撑桩 */}
      {[
        [-1.2, -2.3],
        [1.2, -2.3],
        [-1.2, 2.3],
        [1.2, 2.3],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, -0.3, z]}>
          <cylinderGeometry args={[0.15, 0.2, 1.5, 8]} />
          <meshStandardMaterial color="#3a2a1f" roughness={0.9} />
        </mesh>
      ))}

      {/* 灯塔 */}
      <mesh position={[0, 1.8, -2.6]}>
        <cylinderGeometry args={[0.12, 0.18, 1.6, 10]} />
        <meshStandardMaterial color="#eee" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh ref={beaconRef} position={[0, 2.85, -2.6]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} transparent opacity={0.9} />
      </mesh>
      <pointLight position={[0, 2.8, -2.6]} color={color} distance={6} intensity={1.2} />

      {/* 装卸设备（龙门吊） */}
      <mesh position={[-0.6, 1.3, 1]}>
        <boxGeometry args={[0.25, 1.5, 0.25]} />
        <meshStandardMaterial color="#e8b84a" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0.6, 1.3, 1]}>
        <boxGeometry args={[0.25, 1.5, 0.25]} />
        <meshStandardMaterial color="#e8b84a" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 2.1, 1]}>
        <boxGeometry args={[2.2, 0.22, 0.22]} />
        <meshStandardMaterial color="#e8b84a" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* 烟雾（有船停靠时） */}
      {active && (
        <group ref={smokeRef} position={[0, 0.5, 2]}>
          {smokeParticles.map((p, i) => (
            <mesh key={i} position={[0, 0, 0]}>
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshBasicMaterial color="#aaaaaa" transparent opacity={0} depthWrite={false} />
            </mesh>
          ))}
        </group>
      )}

      {/* 标签 */}
      <Html position={[0, 4, 0]} center distanceFactor={14} style={{ pointerEvents: 'none' }}>
        <div
          className={`px-2.5 py-1 rounded-md text-xs font-medium border backdrop-blur-md flex items-center gap-1.5 ${
            active
              ? 'bg-warn-orange/15 text-warn-orange border-warn-orange/40'
              : 'bg-tech-cyan/15 text-tech-cyan border-tech-cyan/40'
          }`}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
          />
          {berth.name}
          <span className="text-[10px] opacity-80">
            · {active ? '占用' : '空闲'}
          </span>
        </div>
      </Html>
    </group>
  );
};

export default Berth3D;

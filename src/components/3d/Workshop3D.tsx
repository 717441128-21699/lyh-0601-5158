import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export const Workshop3D = () => {
  const conveyRef = useRef<THREE.Mesh[]>([]);
  const lightRefs = useRef<THREE.Mesh[]>([]);

  const conveyorOffset = useMemo(() => Array.from({ length: 24 }, (_, i) => i * 0.1), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    conveyRef.current.forEach((c, i) => {
      if (c && c instanceof THREE.Mesh) {
        const mat = c.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = 0.5 + Math.sin(t * 4 - i * 0.3) * 0.5;
      }
    });
    lightRefs.current.forEach((l, i) => {
      if (l) {
        const mat = l.material as THREE.MeshStandardMaterial;
        const colors = ['#FF5555', '#00FF88', '#00D4FF', '#FFD700'];
        const idx = Math.floor((t * 1.5 + i * 0.4) % 4);
        mat.color.set(colors[idx]);
        mat.emissive.set(colors[idx]);
      }
    });
  });

  return (
    <group position={[6, 0, -10]}>
      {/* 主车间大楼（玻璃幕墙） */}
      <mesh position={[0, 2, 0]} castShadow>
        <boxGeometry args={[7, 4, 5]} />
        <meshStandardMaterial color="#2a3a50" roughness={0.6} metalness={0.4} />
      </mesh>
      {/* 玻璃幕墙 - 正面 */}
      <mesh position={[0, 2, 2.51]}>
        <boxGeometry args={[6.8, 3.8, 0.05]} />
        <meshPhysicalMaterial
          color="#4a6a8a"
          transparent
          opacity={0.4}
          metalness={0.7}
          roughness={0.05}
          transmission={0.3}
          thickness={0.3}
        />
      </mesh>
      {/* 幕墙格栅 */}
      {Array.from({ length: 9 }).map((_, i) => (
        <mesh key={`vg${i}`} position={[-3 + i * 0.75, 2, 2.54]}>
          <boxGeometry args={[0.04, 3.8, 0.03]} />
          <meshStandardMaterial color="#1a2a3a" metalness={0.8} />
        </mesh>
      ))}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={`hg${i}`} position={[0, 0.3 + i * 0.75, 2.54]}>
          <boxGeometry args={[6.8, 0.04, 0.03]} />
          <meshStandardMaterial color="#1a2a3a" metalness={0.8} />
        </mesh>
      ))}

      {/* 屋顶设备 */}
      <mesh position={[0, 4.2, 0]}>
        <boxGeometry args={[2, 0.4, 3]} />
        <meshStandardMaterial color="#556" roughness={0.8} />
      </mesh>
      {/* 冷却塔 */}
      <mesh position={[-2.5, 4.9, -1]}>
        <cylinderGeometry args={[0.6, 0.5, 1.2, 16]} />
        <meshStandardMaterial color="#7890a0" roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[-2.5, 5.6, -1]}>
        <cylinderGeometry args={[0.65, 0.6, 0.2, 16]} />
        <meshStandardMaterial color="#5a7080" roughness={0.6} />
      </mesh>
      {/* 风扇动画光 */}
      <mesh position={[-2.5, 5.7, -1]}>
        <cylinderGeometry args={[0.3, 0.3, 0.04, 16]} />
        <meshStandardMaterial color="#00D4FF" emissive="#00D4FF" emissiveIntensity={0.8} />
      </mesh>

      {/* 生产线传送带（陶粒） */}
      <mesh position={[-1, 0.6, 0.5]}>
        <boxGeometry args={[4.5, 0.15, 0.6]} />
        <meshStandardMaterial color="#333" roughness={0.8} />
      </mesh>
      {conveyorOffset.slice(0, 12).map((o, i) => (
        <mesh
          key={`ct${i}`}
          ref={(r) => r && (conveyRef.current[i] = r)}
          position={[-3.2 + ((o + (Date.now() / 500) % 5)) % 5, 0.78, 0.5]}
        >
          <boxGeometry args={[0.18, 0.12, 0.18]} />
          <meshStandardMaterial
            color="#b86020"
            emissive="#b86020"
            emissiveIntensity={0.3}
            roughness={0.9}
          />
        </mesh>
      ))}

      {/* 肥料生产线 */}
      <mesh position={[2, 0.6, -1]}>
        <boxGeometry args={[3.5, 0.15, 0.6]} />
        <meshStandardMaterial color="#333" roughness={0.8} />
      </mesh>
      {conveyorOffset.slice(12).map((o, i) => {
        const idx = i + 12;
        return (
          <mesh
            key={`ft${i}`}
            ref={(r) => r && (conveyRef.current[idx] = r)}
            position={[0.5 + ((o + (Date.now() / 500) % 4)) % 4, 0.78, -1]}
          >
            <boxGeometry args={[0.16, 0.1, 0.22]} />
            <meshStandardMaterial
              color="#4a7030"
              emissive="#6aaa40"
              emissiveIntensity={0.25}
              roughness={0.9}
            />
          </mesh>
        );
      })}

      {/* 三色警示灯 */}
      <mesh position={[3, 4.6, 1.5]}>
        <cylinderGeometry args={[0.03, 0.03, 0.6, 8]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh
          key={`sl${i}`}
          ref={(r) => r && (lightRefs.current[i] = r)}
          position={[3, 5.1 + i * 0.35, 1.5]}
        >
          <sphereGeometry args={[0.11, 12, 12]} />
          <meshStandardMaterial color="#FF5555" emissive="#FF5555" emissiveIntensity={1.2} />
        </mesh>
      ))}

      {/* 标签 */}
      <Html position={[0, 6, 0]} center distanceFactor={16} style={{ pointerEvents: 'none' }}>
        <div className="glass-panel px-3 py-2 hud-corner">
          <div className="text-xs font-semibold text-eco-green flex items-center gap-1.5 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-eco-green animate-pulse" />
            资源化利用车间
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="p-1.5 rounded bg-warn-orange/10 border border-warn-orange/20">
              <div className="text-warn-orange font-tech text-sm font-semibold">陶粒</div>
              <div className="text-text-secondary">产能 180t/日</div>
            </div>
            <div className="p-1.5 rounded bg-eco-green/10 border border-eco-green/20">
              <div className="text-eco-green font-tech text-sm font-semibold">肥料</div>
              <div className="text-text-secondary">产能 220t/日</div>
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
};

export default Workshop3D;

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export const MonitorCenter3D = () => {
  const radarRef = useRef<THREE.Group>(null);
  const antennaRef = useRef<THREE.Group>(null);
  const dishRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (radarRef.current) {
      radarRef.current.rotation.y = t * 0.8;
    }
    if (antennaRef.current) {
      antennaRef.current.rotation.y = Math.sin(t * 0.6) * 0.4;
    }
    if (dishRef.current) {
      dishRef.current.rotation.z = Math.sin(t * 0.4) * 0.15;
    }
  });

  return (
    <group position={[12, 0, 8]}>
      {/* 主楼基座 */}
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <boxGeometry args={[5, 2, 4]} />
        <meshStandardMaterial color="#3a4a60" roughness={0.7} />
      </mesh>
      {/* 主楼 */}
      <mesh position={[0, 4, 0]} castShadow>
        <boxGeometry args={[4, 4, 3.2]} />
        <meshStandardMaterial color="#506078" roughness={0.5} metalness={0.3} />
      </mesh>

      {/* 玻璃窗户矩阵 - 正面 */}
      {Array.from({ length: 4 }).map((_, row) =>
        Array.from({ length: 5 }).map((_, col) => {
          const colors = ['#00D4FF', '#00FF88', '#FFD700', '#FF8800'];
          const ci = (row + col) % colors.length;
          return (
            <mesh
              key={`fw-${row}-${col}`}
              position={[-1.5 + col * 0.75, 2.3 + row * 0.85, 1.61]}
            >
              <boxGeometry args={[0.55, 0.6, 0.03]} />
              <meshStandardMaterial
                color={colors[ci]}
                emissive={colors[ci]}
                emissiveIntensity={0.9}
                transparent
                opacity={0.85}
              />
            </mesh>
          );
        })
      )}
      {/* 数据大屏模拟 */}
      <mesh position={[0, 4, 1.62]}>
        <boxGeometry args={[3.4, 1.8, 0.04]} />
        <meshStandardMaterial
          color="#001428"
          emissive="#002040"
          emissiveIntensity={0.5}
          roughness={0.2}
        />
      </mesh>
      <mesh position={[0, 4, 1.65]}>
        <boxGeometry args={[3.2, 1.6, 0.005]} />
        <meshBasicMaterial color="#00D4FF" transparent opacity={0.25} />
      </mesh>

      {/* 半球形雷达顶 */}
      <mesh position={[0, 6.6, 0]}>
        <sphereGeometry args={[1.8, 32, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial
          color="#2a4050"
          transparent
          opacity={0.55}
          metalness={0.4}
          roughness={0.1}
          transmission={0.3}
          thickness={0.4}
        />
      </mesh>
      {/* 雷达支架 */}
      <mesh position={[0, 6.6, 0]}>
        <torusGeometry args={[1.8, 0.06, 12, 48]} />
        <meshStandardMaterial color="#667788" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* 旋转扫描线 */}
      <group ref={radarRef} position={[0, 6.6, 0]}>
        <mesh>
          <coneGeometry args={[1.7, 0.04, 4, 1, true]} />
          <meshBasicMaterial
            color="#00FF88"
            transparent
            opacity={0.35}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </group>
      <pointLight position={[0, 6.6, 0]} color="#00FF88" distance={8} intensity={1.5} />

      {/* 天线塔 */}
      <group ref={antennaRef} position={[-1.8, 5.5, -1]}>
        <mesh>
          <cylinderGeometry args={[0.04, 0.06, 2.8, 8]} />
          <meshStandardMaterial color="#aaa" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 1.5, 0]}>
          <sphereGeometry args={[0.1, 12, 12]} />
          <meshStandardMaterial color="#FF3355" emissive="#FF3355" emissiveIntensity={1.5} />
        </mesh>
        {/* 交叉天线 */}
        <mesh position={[0, 1.2, 0]}>
          <boxGeometry args={[0.6, 0.03, 0.03]} />
          <meshStandardMaterial color="#ccc" metalness={0.8} />
        </mesh>
        <mesh position={[0, 1.2, 0]}>
          <boxGeometry args={[0.03, 0.03, 0.6]} />
          <meshStandardMaterial color="#ccc" metalness={0.8} />
        </mesh>
      </group>

      {/* 卫星天线锅 */}
      <group ref={dishRef} position={[1.6, 4, -1.7]} rotation={[0.2, 0.6, 0]}>
        <mesh position={[0, 1.2, 0]}>
          <sphereGeometry args={[0.9, 24, 16, 0, Math.PI * 2, Math.PI / 3, Math.PI / 3]} />
          <meshStandardMaterial color="#e0e0e0" metalness={0.7} roughness={0.15} side={THREE.BackSide} />
        </mesh>
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 1.2, 10]} />
          <meshStandardMaterial color="#888" metalness={0.7} />
        </mesh>
        <mesh position={[0, 1.5, 0.8]}>
          <boxGeometry args={[0.2, 0.2, 0.15]} />
          <meshStandardMaterial color="#444" />
        </mesh>
      </group>

      {/* 门前广场 */}
      <mesh position={[0, 0.04, 3.5]}>
        <cylinderGeometry args={[1.6, 1.6, 0.08, 32]} />
        <meshStandardMaterial color="#3a4a5a" roughness={0.9} />
      </mesh>
      {/* 旗杆 */}
      <mesh position={[0, 1.8, 3.5]}>
        <cylinderGeometry args={[0.03, 0.04, 3.6, 10]} />
        <meshStandardMaterial color="#ddd" metalness={0.7} />
      </mesh>
      {/* 旗帜 */}
      <mesh position={[0.6, 3.3, 3.5]}>
        <boxGeometry args={[1.1, 0.65, 0.02]} />
        <meshStandardMaterial color="#FF3355" />
      </mesh>

      {/* 标签 */}
      <Html position={[0, 9, 0]} center distanceFactor={16} style={{ pointerEvents: 'none' }}>
        <div className="glass-panel px-3 py-2 hud-corner min-w-[180px]">
          <div className="text-xs font-semibold text-tech-cyan flex items-center gap-1.5 mb-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tech-cyan opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-tech-cyan" />
            </span>
            环保监控中心
          </div>
          <div className="space-y-1 text-[10px] text-text-secondary">
            <div className="flex justify-between">
              <span>在线设备</span>
              <span className="font-tech text-eco-green">28/28</span>
            </div>
            <div className="flex justify-between">
              <span>数据点</span>
              <span className="font-tech text-tech-cyan-soft">1,284</span>
            </div>
            <div className="flex justify-between">
              <span>网络延迟</span>
              <span className="font-tech text-text-primary">8ms</span>
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
};

export default MonitorCenter3D;

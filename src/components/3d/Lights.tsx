import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface LightsProps {
  children?: React.ReactNode;
}

export const Lights = ({ children }: LightsProps) => {
  const sunRef = useRef<THREE.DirectionalLight>(null);

  useFrame((state) => {
    if (sunRef.current) {
      // 模拟缓慢移动的环境光
      const t = state.clock.elapsedTime * 0.02;
      sunRef.current.position.x = Math.sin(t) * 20 + 5;
      sunRef.current.position.z = Math.cos(t) * 20 - 5;
    }
  });

  return (
    <>
      {/* 环境光 */}
      <ambientLight intensity={0.35} color="#88aacc" />
      {/* 半球光：天空+地面 */}
      <hemisphereLight args={['#4a6a9a', '#1a2a1a', 0.5]} />
      {/* 主方向光（夕阳） */}
      <directionalLight
        ref={sunRef}
        position={[8, 18, -8]}
        intensity={0.85}
        color="#ffc080"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={80}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />
      {/* 补光 */}
      <pointLight position={[-15, 8, 5]} intensity={0.3} color="#6688ff" distance={30} />
      <pointLight position={[15, 6, -12]} intensity={0.35} color="#ffaa55" distance={28} />
      <pointLight position={[-8, 5, -15]} intensity={0.25} color="#55aaff" distance={25} />
      {children}
    </>
  );
};

export default Lights;

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Triplet } from '@/types';

interface PathLineProps {
  points: Triplet[];
  color?: string;
  type?: 'return' | 'transport';
  active?: boolean;
}

export const PathLine = ({ points, color = '#00D4FF', type = 'return', active = true }: PathLineProps) => {
  const particlesRef = useRef<THREE.Points>(null);
  const tubeRef = useRef<THREE.Mesh>(null);

  const { geometry, tubeGeo } = useMemo(() => {
    if (points.length < 2) return { geometry: new THREE.BufferGeometry(), tubeGeo: new THREE.BufferGeometry() };
    const vecPts = points.map((p) => new THREE.Vector3(p[0], p[1] + 0.12, p[2]));
    const curve = new THREE.CatmullRomCurve3(vecPts, false, 'catmullrom', 0.3);
    const tube = new THREE.TubeGeometry(curve, 120, 0.06, 8, false);
    const pts = curve.getPoints(200);
    const pos = new Float32Array(pts.length * 3);
    pts.forEach((p, i) => {
      pos[i * 3] = p.x;
      pos[i * 3 + 1] = p.y;
      pos[i * 3 + 2] = p.z;
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return { geometry: g, tubeGeo: tube };
  }, [points]);

  const flowColor = type === 'return' ? '#00D4FF' : '#00FF88';

  useFrame((state) => {
    if (particlesRef.current && active) {
      const geo = particlesRef.current.geometry;
      const attr = geo.getAttribute('position') as THREE.BufferAttribute;
      const count = attr.count;
      // 重新分配粒子索引以实现流动
      const t = state.clock.elapsedTime * 0.3;
      for (let i = 0; i < count; i++) {
        const offset = (i / count + t) % 1;
        const idx = Math.floor(offset * count);
        attr.setX(i, attr.getX(idx));
        attr.setY(i, attr.getY(idx));
        attr.setZ(i, attr.getZ(idx));
      }
      attr.needsUpdate = true;
    }
    if (tubeRef.current) {
      const mat = tubeRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.35 + Math.sin(state.clock.elapsedTime * 2) * 0.15;
    }
  });

  return (
    <group>
      {/* 基础发光管 */}
      <mesh ref={tubeRef} geometry={tubeGeo}>
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </mesh>
      {/* 虚线外层 */}
      <lineSegments geometry={tubeGeo}>
        <lineBasicMaterial color={flowColor} transparent opacity={0.7} linewidth={1} />
      </lineSegments>
      {/* 流动粒子 */}
      <points ref={particlesRef} geometry={geometry}>
        <pointsMaterial
          color={flowColor}
          size={0.14}
          transparent
          opacity={0.95}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
      {/* 起点/终点标记 */}
      {points.length >= 2 && (
        <>
          <mesh position={[points[0][0], points[0][1] + 0.3, points[0][2]]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.18, 0.26, 24]} />
            <meshBasicMaterial color={flowColor} transparent opacity={0.8} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[points[points.length - 1][0], points[points.length - 1][1] + 0.3, points[points.length - 1][2]]}>
            <ringGeometry args={[0.2, 0.3, 24]} />
            <meshBasicMaterial color={flowColor} transparent opacity={0.9} side={THREE.DoubleSide} />
          </mesh>
        </>
      )}
    </group>
  );
};

export default PathLine;

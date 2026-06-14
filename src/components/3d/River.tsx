import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CatmullRomCurve3, Vector3 } from 'three';

export const River = () => {
  const waterRef = useRef<THREE.Mesh>(null);

  const riverPath = useMemo(() => {
    const points = [
      new Vector3(-12, 0.05, -8),
      new Vector3(-8, 0.05, -5),
      new Vector3(-5, 0.05, -2),
      new Vector3(-2, 0.05, 1),
      new Vector3(0, 0.05, 3),
      new Vector3(3, 0.05, 5),
      new Vector3(6, 0.05, 6.5),
      new Vector3(9, 0.05, 7.5),
      new Vector3(12, 0.05, 8),
    ];
    return new CatmullRomCurve3(points, false, 'catmullrom', 0.5);
  }, []);

  const { geometry, borderGeometry } = useMemo(() => {
    const riverWidth = 3.2;
    const tubeGeo = new THREE.TubeGeometry(riverPath, 250, riverWidth / 2, 16, false);
    const points = riverPath.getPoints(250);
    const borderPts: Vector3[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const dir = new Vector3().subVectors(p2, p1).normalize();
      const perp = new Vector3(-dir.z, 0, dir.x).multiplyScalar(riverWidth / 2);
      borderPts.push(p1.clone().add(perp));
    }
    for (let i = points.length - 1; i > 0; i--) {
      const p1 = points[i];
      const p2 = points[i - 1];
      const dir = new Vector3().subVectors(p2, p1).normalize();
      const perp = new Vector3(-dir.z, 0, dir.x).multiplyScalar(riverWidth / 2);
      borderPts.push(p1.clone().sub(perp));
    }
    const borderShape = new THREE.Shape(borderPts.map((p) => new THREE.Vector2(p.x, p.z)));
    const borderGeo = new THREE.ExtrudeGeometry(borderShape, {
      depth: 0.15,
      bevelEnabled: false,
    });
    borderGeo.rotateX(-Math.PI / 2);
    return { geometry: tubeGeo, borderGeometry: borderGeo };
  }, [riverPath]);

  useFrame(() => {
    // 预留水面动画钩子
  });

  return (
    <group>
      {/* 河床泥土 */}
      <mesh geometry={borderGeometry} position={[0, -0.12, 0]} receiveShadow>
        <meshStandardMaterial color="#3d2817" roughness={0.9} />
      </mesh>
      {/* 河岸 */}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <boxGeometry args={[32, 0.1, 24]} />
        <meshStandardMaterial color="#2e5d34" roughness={1} />
      </mesh>
      {/* 水面 */}
      <mesh ref={waterRef} geometry={geometry} position={[0, 0.08, 0]}>
        <meshStandardMaterial
          color="#0a3d6b"
          transparent
          opacity={0.85}
          roughness={0.15}
          metalness={0.4}
          emissive="#002a4a"
          emissiveIntensity={0.2}
        />
      </mesh>
      {/* 水面发光边 */}
      <mesh geometry={geometry} position={[0, 0.09, 0]}>
        <meshBasicMaterial color="#00D4FF" transparent opacity={0.15} wireframe />
      </mesh>
      {/* 陆地装饰绿地 */}
      <mesh position={[-14, 0.03, 4]} rotation={[0, 0.2, 0]}>
        <boxGeometry args={[8, 0.06, 10]} />
        <meshStandardMaterial color="#1e4a28" roughness={1} />
      </mesh>
      <mesh position={[8, 0.03, -10]} rotation={[0, -0.1, 0]}>
        <boxGeometry args={[12, 0.06, 8]} />
        <meshStandardMaterial color="#254a2e" roughness={1} />
      </mesh>
      {/* 道路 */}
      <mesh position={[0, 0.12, -12]} rotation={[0, 0.15, 0]}>
        <boxGeometry args={[35, 0.02, 2.2]} />
        <meshStandardMaterial color="#2a2a33" roughness={0.8} />
      </mesh>
      <mesh position={[-14, 0.12, 0]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[2.2, 0.02, 30]} />
        <meshStandardMaterial color="#2a2a33" roughness={0.8} />
      </mesh>
      {/* 道路标线 */}
      <mesh position={[0, 0.13, -12]} rotation={[0, 0.15, 0]}>
        <boxGeometry args={[32, 0.01, 0.08]} />
        <meshBasicMaterial color="#FFD700" />
      </mesh>
    </group>
  );
};

export default River;

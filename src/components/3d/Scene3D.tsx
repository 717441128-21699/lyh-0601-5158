import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Grid } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ToneMapping } from '@react-three/postprocessing';
import { Suspense, useMemo } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { Lights } from './Lights';
import { River } from './River';
import { DredgeShip3D } from './DredgeShip3D';
import { Berth3D } from './Berth3D';
import { TreatmentPlant3D } from './TreatmentPlant3D';
import { Workshop3D } from './Workshop3D';
import { MonitorCenter3D } from './MonitorCenter3D';
import { Truck3D } from './Truck3D';
import { PathLine } from './PathLine';

export const Scene3D = () => {
  const ships = useAppStore((s) => s.ships);
  const berths = useAppStore((s) => s.berths);
  const plants = useAppStore((s) => s.plants);
  const trucks = useAppStore((s) => s.trucks);
  const selectedShipId = useAppStore((s) => s.selectedShipId);
  const selectedTruckId = useAppStore((s) => s.selectedTruckId);
  const setSelectedShip = useAppStore((s) => s.setSelectedShip);
  const setSelectedTruck = useAppStore((s) => s.setSelectedTruck);

  // 返航路径
  const returnPaths = useMemo(
    () =>
      ships
        .filter((s) => s.status === 'returning' && s.returnPath)
        .map((s) => ({
          shipId: s.id,
          path: s.returnPath!,
        })),
    [ships]
  );

  // 运输路径（只画在途车辆）
  const transportPaths = useMemo(
    () =>
      trucks
        .filter((t) => (t.status === 'transporting' || t.status === 'queuing' || t.status === 'returning') && t.routePath.length > 1)
        .map((t) => ({
          truckId: t.id,
          path: t.routePath,
          isReturn: t.status === 'returning',
        })),
    [trucks]
  );

  return (
    <Canvas
      shadows
      camera={{ position: [16, 22, 22], fov: 45, near: 0.1, far: 200 }}
      gl={{ antialias: true, alpha: false, toneMapping: 3, toneMappingExposure: 1.05 }}
      dpr={[1, 2]}
      style={{ background: 'linear-gradient(to bottom, #0a1c30 0%, #0a1628 60%, #080f1a 100%)' }}
      onPointerMissed={() => {
        setSelectedShip(null);
        setSelectedTruck(null);
      }}
    >
      <fog attach="fog" args={['#0a1628', 28, 60]} />
      <Stars radius={80} depth={40} count={2500} factor={3} saturation={0.3} fade speed={0.4} />
      <Grid
        args={[80, 80]}
        position={[0, 0.001, 0]}
        cellSize={2}
        cellThickness={0.4}
        cellColor="#1a3456"
        sectionSize={10}
        sectionThickness={0.9}
        sectionColor="#00D4FF"
        fadeDistance={45}
        fadeStrength={1.2}
        infiniteGrid={false}
      />

      <Lights />
      <Suspense fallback={null}>
        <River />

        {returnPaths.map((rp) => (
          <PathLine key={`ret-${rp.shipId}`} points={rp.path} type="return" color="#00D4FF" />
        ))}
        {transportPaths.map((tp) => (
          <PathLine
            key={`tr-${tp.truckId}`}
            points={tp.path}
            type={tp.isReturn ? 'return' : 'transport'}
            color={tp.isReturn ? '#8AB4D8' : '#00FF88'}
          />
        ))}

        {ships.map((ship) => (
          <DredgeShip3D
            key={ship.id}
            ship={ship}
            selected={selectedShipId === ship.id}
            onClick={() => setSelectedShip(ship.id)}
          />
        ))}

        {berths.map((b) => (
          <Berth3D key={b.id} berth={b} />
        ))}

        {plants.map((p) => (
          <TreatmentPlant3D key={p.id} plant={p} />
        ))}

        <Workshop3D />
        <MonitorCenter3D />

        {trucks.map((t) => (
          <Truck3D
            key={t.id}
            truck={t}
            selected={selectedTruckId === t.id}
            onClick={() => setSelectedTruck(t.id)}
          />
        ))}
      </Suspense>

      <OrbitControls
        enableDamping
        dampingFactor={0.08}
        minDistance={8}
        maxDistance={50}
        minPolarAngle={Math.PI * 0.1}
        maxPolarAngle={Math.PI * 0.45}
        makeDefault
      />

      <EffectComposer>
        <Bloom
          intensity={0.6}
          luminanceThreshold={0.75}
          luminanceSmoothing={0.3}
          mipmapBlur
          radius={0.8}
        />
        <Vignette offset={0.25} darkness={0.5} eskil={false} />
        <ToneMapping adaptive />
      </EffectComposer>
    </Canvas>
  );
};

export default Scene3D;

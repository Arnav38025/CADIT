
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, PerspectiveCamera, Stage, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { Parameter } from '../types';

interface ThreeDViewerProps {
  parameters: Parameter[];
  geometryType: 'bracket' | 'enclosure' | 'frame';
  contextGeometry?: 'rail' | 'motor' | 'wall' | 'none';
}

const ParametricGeometry: React.FC<ThreeDViewerProps> = ({ parameters, geometryType, contextGeometry }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  const dims = useMemo(() => {
    const map: Record<string, number> = {};
    parameters.forEach(p => {
      map[p.name.toLowerCase()] = p.value;
    });
    return map;
  }, [parameters]);

  const renderContext = () => {
    if (!contextGeometry || contextGeometry === 'none') return null;

    switch (contextGeometry) {
      case 'rail':
        return (
          <group position={[0, -2, 0]}>
            <mesh>
              <boxGeometry args={[2, 40, 2]} />
              <meshStandardMaterial color="#ffffff" transparent opacity={0.15} wireframe />
            </mesh>
            <mesh position={[4, 0, 0]}>
              <boxGeometry args={[2, 40, 2]} />
              <meshStandardMaterial color="#ffffff" transparent opacity={0.15} wireframe />
            </mesh>
          </group>
        );
      case 'motor':
        return (
          <mesh position={[0, -5, 0]}>
            <boxGeometry args={[4.2, 4.2, 4.2]} />
            <meshStandardMaterial color="#4299e1" transparent opacity={0.1} />
          </mesh>
        );
      case 'wall':
        return (
          <mesh position={[0, 0, -5]}>
            <boxGeometry args={[40, 40, 1]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.05} />
          </mesh>
        );
      default:
        return null;
    }
  };

  const renderShape = () => {
    switch (geometryType) {
      case 'bracket':
        return (
          <group>
            <mesh position={[0, (dims['thickness'] || 4) / 20, 0]}>
              <boxGeometry args={[(dims['base width'] || 40) / 10, (dims['thickness'] || 4) / 10, (dims['base width'] || 40) / 10]} />
              <meshStandardMaterial color="#30363d" />
            </mesh>
            <mesh position={[0, (dims['thickness'] || 4) / 5, 0]}>
              <cylinderGeometry args={[(dims['center hole dia'] || 22) / 20, (dims['center hole dia'] || 22) / 20, (dims['thickness'] || 4) / 5, 32]} />
              <meshStandardMaterial color="#161b22" />
            </mesh>
          </group>
        );
      case 'enclosure':
        return (
          <mesh>
            <boxGeometry args={[10, (dims['internal height'] || 25) / 10, 6]} />
            <meshStandardMaterial color="#30363d" wireframe />
          </mesh>
        );
      default:
        return (
          <mesh>
            <boxGeometry args={[5, 5, 5]} />
            <meshStandardMaterial color="#30363d" />
          </mesh>
        );
    }
  };

  return (
    <>
      {/* Fix: Changed 'contactShadow={false}' to 'shadows={false}' as 'contactShadow' is not a valid prop for the Stage component in newer versions of @react-three/drei. */}
      <Stage environment="city" intensity={0.5} shadows={false}>
        {renderShape()}
      </Stage>
      {renderContext()}
    </>
  );
};

export const ThreeDViewer: React.FC<ThreeDViewerProps> = ({ parameters, geometryType, contextGeometry }) => {
  return (
    <div className="w-full h-full bg-[#0d1117] relative rounded-lg overflow-hidden border border-[#30363d]">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[12, 12, 12]} />
        <OrbitControls makeDefault />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <ParametricGeometry parameters={parameters} geometryType={geometryType} contextGeometry={contextGeometry} />
        <Grid 
          infiniteGrid 
          fadeDistance={30} 
          sectionColor="#30363d" 
          cellColor="#161b22"
          position={[0, -2, 0]}
        />
      </Canvas>
      <div className="absolute bottom-4 left-4 flex flex-col gap-2">
        <div className="bg-[#161b22]/80 backdrop-blur-md p-2 rounded border border-[#30363d] text-[10px] uppercase tracking-wider text-[#8b949e]">
          Real-time B-Rep Preview (Simulated)
        </div>
        {contextGeometry && contextGeometry !== 'none' && (
          <div className="bg-blue-900/40 backdrop-blur-md p-2 rounded border border-blue-500/30 text-[10px] uppercase tracking-wider text-blue-300 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            Assembly Ghost Mode: {contextGeometry}
          </div>
        )}
      </div>
    </div>
  );
};


import React, { useRef, useMemo } from 'react';
import { Canvas, ThreeElements } from '@react-three/fiber';
import { OrbitControls, Grid, PerspectiveCamera, Stage, Bounds } from '@react-three/drei';
import * as THREE from 'three';
import { Parameter, Material } from '../types';

// Extend JSX namespace to include React Three Fiber intrinsic elements to fix TypeScript errors.
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

interface ThreeDViewerProps {
  parameters: Parameter[];
  geometryType: 'bracket' | 'enclosure' | 'frame';
  contextGeometry?: 'rail' | 'motor' | 'wall' | 'none';
  material: Material;
  wireframe?: boolean;
}

const ParametricGeometry: React.FC<ThreeDViewerProps> = ({ parameters, geometryType, contextGeometry, material, wireframe }) => {
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
            <mesh><boxGeometry args={[2, 40, 2]} /><meshStandardMaterial color="#ffffff" transparent opacity={0.15} wireframe /></mesh>
            <mesh position={[4, 0, 0]}><boxGeometry args={[2, 40, 2]} /><meshStandardMaterial color="#ffffff" transparent opacity={0.15} wireframe /></mesh>
          </group>
        );
      case 'motor':
        return (
          <mesh position={[0, -4.5, 0]}>
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
      default: return null;
    }
  };

  const renderShape = () => {
    const matProps = {
      color: material.color,
      metalness: material.metalness,
      roughness: material.roughness,
      wireframe
    };

    switch (geometryType) {
      case 'bracket':
        return (
          <group>
            <mesh position={[0, (dims['thickness'] || 4) / 20, 0]}>
              <boxGeometry args={[(dims['base width'] || 40) / 10, (dims['thickness'] || 4) / 10, (dims['base width'] || 40) / 10]} />
              <meshStandardMaterial {...matProps} />
            </mesh>
            <mesh position={[0, (dims['thickness'] || 4) / 5, 0]}>
              <cylinderGeometry args={[(dims['center hole dia'] || 22) / 20, (dims['center hole dia'] || 22) / 20, (dims['thickness'] || 4) / 5, 32]} />
              <meshStandardMaterial {...matProps} />
            </mesh>
          </group>
        );
      case 'enclosure':
        return (
          <group>
            <mesh>
              <boxGeometry args={[10, (dims['internal height'] || 25) / 10, 6]} />
              <meshStandardMaterial {...matProps} />
            </mesh>
            {(dims['fan cutout dia'] || 0) > 0 && (
              <mesh position={[0, (dims['internal height'] || 25) / 20 + 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[(dims['fan cutout dia'] || 30) / 20, (dims['fan cutout dia'] || 30) / 20, 0.5, 32]} />
                <meshStandardMaterial color="#000000" />
              </mesh>
            )}
          </group>
        );
      default:
        return <mesh><boxGeometry args={[5, 5, 5]} /><meshStandardMaterial {...matProps} /></mesh>;
    }
  };

  return (
    <>
      <Stage environment="city" intensity={0.5} shadows={false}>
        {renderShape()}
      </Stage>
      {renderContext()}
    </>
  );
};

export const ThreeDViewer: React.FC<ThreeDViewerProps> = (props) => {
  const controlsRef = useRef<any>(null);

  const setView = (view: 'top' | 'front' | 'side') => {
    if (!controlsRef.current) return;
    switch (view) {
      case 'top': controlsRef.current.setLookAt(0, 20, 0, 0, 0, 0, true); break;
      case 'front': controlsRef.current.setLookAt(0, 0, 20, 0, 0, 0, true); break;
      case 'side': controlsRef.current.setLookAt(20, 0, 0, 0, 0, 0, true); break;
    }
  };

  return (
    <div className="w-full h-full bg-[#0d1117] relative rounded-lg overflow-hidden border border-[#30363d]">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[12, 12, 12]} />
        <OrbitControls ref={controlsRef} makeDefault />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <ParametricGeometry {...props} />
        <Grid infiniteGrid fadeDistance={30} sectionColor="#30363d" cellColor="#161b22" position={[0, -2, 0]} />
      </Canvas>
      
      {/* 3D Tool Overlay */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <div className="bg-[#161b22]/90 border border-[#30363d] rounded p-1 flex flex-col gap-1 shadow-2xl">
          <button onClick={() => setView('top')} className="p-1.5 hover:bg-[#30363d] rounded text-[10px] text-white font-bold uppercase">Top</button>
          <button onClick={() => setView('front')} className="p-1.5 hover:bg-[#30363d] rounded text-[10px] text-white font-bold uppercase">Front</button>
          <button onClick={() => setView('side')} className="p-1.5 hover:bg-[#30363d] rounded text-[10px] text-white font-bold uppercase">Side</button>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 flex flex-col gap-2">
        <div className="bg-[#161b22]/80 backdrop-blur-md p-2 rounded border border-[#30363d] text-[10px] uppercase tracking-wider text-[#8b949e]">
          Engine: CADIT Real-time Mesh v1.4
        </div>
      </div>
    </div>
  );
};

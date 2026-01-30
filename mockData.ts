
import { CADRepository, Material } from './types';

export const MATERIALS: Material[] = [
  { id: 'mat1', name: 'Aluminum 6061-T6', density: 2700, costPerKg: 15, color: '#bdc3c7', metalness: 0.9, roughness: 0.2 },
  { id: 'mat2', name: 'Carbon Fiber Reinforced', density: 1550, costPerKg: 85, color: '#2c3e50', metalness: 0.2, roughness: 0.8 },
  { id: 'mat3', name: 'PLA Plastic (Bio)', density: 1240, costPerKg: 25, color: '#27ae60', metalness: 0.0, roughness: 0.5 },
  { id: 'mat4', name: 'Titanium Grade 5', density: 4430, costPerKg: 120, color: '#7f8c8d', metalness: 1.0, roughness: 0.3 }
];

export const MOCK_REPOS: CADRepository[] = [
  {
    id: '1',
    name: 'nema17-stepper-mount',
    description: 'Adjustable mounting bracket for NEMA 17 stepper motors with heat dissipation fins.',
    author: 'robotics-pro',
    owner: 'robotics-pro',
    stars: 128,
    forksCount: 45,
    updatedAt: '2024-10-24T10:00:00Z',
    geometryType: 'bracket',
    currentMaterialId: 'mat1',
    parameters: [
      { id: 'p1', name: 'Base Width', value: 42, unit: 'mm', min: 30, max: 100, description: 'Width of the mounting base' },
      { id: 'p2', name: 'Thickness', value: 4, unit: 'mm', min: 2, max: 12, description: 'Wall thickness for structural rigidity' },
      { id: 'p3', name: 'Center Hole Dia', value: 22.5, unit: 'mm', min: 20, max: 25, description: 'Motor pilot hole diameter' },
      { id: 'p4', name: 'Fin Count', value: 5, unit: 'pcs', min: 0, max: 10, description: 'Number of cooling fins' }
    ],
    intent: [
      { id: 'i1', description: 'Must support 2.5kg load without deflection > 0.1mm', constraintType: 'load', priority: 'high' }
    ],
    history: [
      { id: 'c1', author: 'robotics-pro', timestamp: '2024-10-24T10:00:00Z', message: 'Initial commit', hash: '8a2b3c4', parametersSnapshot: [] }
    ]
  },
  {
    id: '2',
    name: 'rugged-rpi-enclosure',
    description: 'Industrial grade enclosure for Raspberry Pi 4 with integrated rail mounts.',
    author: 'industrial-designs',
    owner: 'industrial-designs',
    stars: 84,
    forksCount: 12,
    updatedAt: '2024-10-25T14:30:00Z',
    geometryType: 'enclosure',
    currentMaterialId: 'mat3',
    parameters: [
      { id: 'p1', name: 'Internal Height', value: 25, unit: 'mm', min: 20, max: 60, description: 'Space for HAT modules' },
      { id: 'p2', name: 'Wall Thickness', value: 2, unit: 'mm', min: 1, max: 5, description: 'Case shell thickness' }
    ],
    intent: [
      { id: 'i1', description: 'IP54 ingress protection rating target', constraintType: 'material', priority: 'medium' }
    ],
    history: [
      { id: 'c1', author: 'industrial-designs', timestamp: '2024-10-25T14:30:00Z', message: 'Optimized for rail mounts', hash: 'f4e5d6a', parametersSnapshot: [] }
    ]
  },
  {
    id: 'my-part-1',
    name: 'custom-drone-frame',
    description: 'Lightweight X-frame for 5-inch drones with integrated battery strap slots.',
    author: 'Jane Doe',
    owner: 'Jane Doe',
    stars: 5,
    forksCount: 0,
    updatedAt: '2024-10-26T12:00:00Z',
    geometryType: 'frame',
    currentMaterialId: 'mat2',
    parameters: [
      { id: 'p1', name: 'Arm Length', value: 120, unit: 'mm', min: 100, max: 150, description: 'Motor to motor distance' },
      { id: 'p2', name: 'Standoff Height', value: 25, unit: 'mm', min: 20, max: 35, description: 'Stack clearance' }
    ],
    intent: [],
    history: [
      { id: 'c1', author: 'Jane Doe', timestamp: '2024-10-26T12:00:00Z', message: 'V1 frame design complete', hash: 'm1y2p3a', parametersSnapshot: [] }
    ]
  }
];

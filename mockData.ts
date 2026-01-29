
import { CADRepository } from './types';

export const MOCK_REPOS: CADRepository[] = [
  {
    id: '1',
    name: 'nema17-stepper-mount',
    description: 'Adjustable mounting bracket for NEMA 17 stepper motors with heat dissipation fins.',
    author: 'robotics-pro',
    stars: 128,
    forksCount: 45,
    updatedAt: '2024-10-24T10:00:00Z',
    geometryType: 'bracket',
    parameters: [
      { id: 'p1', name: 'Base Width', value: 42, unit: 'mm', min: 30, max: 100, description: 'Width of the mounting base' },
      { id: 'p2', name: 'Thickness', value: 4, unit: 'mm', min: 2, max: 12, description: 'Wall thickness for structural rigidity' },
      { id: 'p3', name: 'Center Hole Dia', value: 22.5, unit: 'mm', min: 20, max: 25, description: 'Motor pilot hole diameter' },
      { id: 'p4', name: 'Fin Count', value: 5, unit: 'pcs', min: 0, max: 10, description: 'Number of cooling fins' }
    ],
    intent: [
      { id: 'i1', description: 'Must support 2.5kg load without deflection > 0.1mm', constraintType: 'load', priority: 'high' },
      { id: 'i2', description: 'Compatible with standard M3 socket head screws', constraintType: 'manufacturing', priority: 'medium' }
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
    stars: 84,
    forksCount: 12,
    updatedAt: '2024-10-25T14:30:00Z',
    geometryType: 'enclosure',
    parameters: [
      { id: 'p1', name: 'Internal Height', value: 25, unit: 'mm', min: 20, max: 60, description: 'Space for HAT modules' },
      { id: 'p2', name: 'Wall Thickness', value: 2, unit: 'mm', min: 1, max: 5, description: 'Case shell thickness' },
      { id: 'p3', name: 'Fan Cutout Dia', value: 30, unit: 'mm', min: 0, max: 40, description: 'Diameter for active cooling' }
    ],
    intent: [
      { id: 'i1', description: 'IP54 ingress protection rating target', constraintType: 'material', priority: 'medium' },
      { id: 'i2', description: 'No overhangs > 45 degrees for FDM printing', constraintType: 'manufacturing', priority: 'high' }
    ],
    history: [
      { id: 'c1', author: 'industrial-designs', timestamp: '2024-10-25T14:30:00Z', message: 'Optimized for rail mounts', hash: 'f4e5d6a', parametersSnapshot: [] }
    ]
  },
  {
    id: '3',
    name: 'extrusion-corner-brace',
    description: 'Parametric 2020/4040 aluminum extrusion corner connector.',
    author: 'openbuilds-fan',
    stars: 312,
    forksCount: 156,
    updatedAt: '2024-10-26T09:15:00Z',
    geometryType: 'bracket',
    parameters: [
      { id: 'p1', name: 'Leg Length', value: 30, unit: 'mm', min: 20, max: 80, description: 'Length of each leg' },
      { id: 'p2', name: 'Width', value: 20, unit: 'mm', min: 20, max: 40, description: 'Matches extrusion profile' },
      { id: 'p3', name: 'Fillet Radius', value: 5, unit: 'mm', min: 0, max: 10, description: 'Inner corner reinforcement' }
    ],
    intent: [
      { id: 'i1', description: 'Interlocking tabs for alignment', constraintType: 'geometric', priority: 'medium' }
    ],
    history: [
      { id: 'c1', author: 'openbuilds-fan', timestamp: '2024-10-26T09:15:00Z', message: 'Support 4040 profile scaling', hash: 'd1e2f3g', parametersSnapshot: [] }
    ]
  }
];


export interface Parameter {
  id: string;
  name: string;
  value: number;
  unit: string;
  min?: number;
  max?: number;
  description: string;
}

export interface DesignIntent {
  id: string;
  description: string;
  constraintType: 'geometric' | 'material' | 'manufacturing' | 'load';
  priority: 'low' | 'medium' | 'high';
}

export interface Commit {
  id: string;
  author: string;
  timestamp: string;
  message: string;
  hash: string;
  parametersSnapshot: Parameter[];
}

export interface Material {
  id: string;
  name: string;
  density: number; // kg/m^3
  costPerKg: number;
  color: string;
  metalness: number;
  roughness: number;
}

export interface CADRepository {
  id: string;
  name: string;
  description: string;
  author: string;
  owner: string; // User who currently holds this copy
  stars: number;
  forksCount: number;
  updatedAt: string;
  parameters: Parameter[];
  intent: DesignIntent[];
  history: Commit[];
  geometryType: 'bracket' | 'enclosure' | 'frame';
  currentMaterialId: string;
  forkedFrom?: string; // ID of original repo
}

export interface AIModificationResult {
  updatedParameters: Parameter[];
  explanation: string;
  intentViolations: string[];
}

export interface ActiveAdjustFeedback {
  stability: number; 
  feasibility: number;
  fitScore: number;
  engineeringInsights: string[];
  suggestedAssemblyTweak: string;
  contextGeometry?: 'rail' | 'motor' | 'wall' | 'none';
}

export interface PhysicsStats {
  estimatedMass: number;
  cost: number;
  centerOfGravity: [number, number, number];
  structuralIntegrityScore: number;
}

export interface ManufacturingAudit {
  method: 'CNC' | '3D Print' | 'Injection Mold';
  rating: number; // 0-100
  issues: string[];
  recommendations: string[];
}

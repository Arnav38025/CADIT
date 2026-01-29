
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

export interface CADRepository {
  id: string;
  name: string;
  description: string;
  author: string;
  stars: number;
  forksCount: number;
  updatedAt: string;
  parameters: Parameter[];
  intent: DesignIntent[];
  history: Commit[];
  geometryType: 'bracket' | 'enclosure' | 'frame';
}

export interface AIModificationResult {
  updatedParameters: Parameter[];
  explanation: string;
  intentViolations: string[];
}

export interface ActiveAdjustFeedback {
  stability: number; // 0-100
  feasibility: number; // 0-100
  fitScore: number; // 0-100
  engineeringInsights: string[];
  suggestedAssemblyTweak: string;
  contextGeometry?: 'rail' | 'motor' | 'wall' | 'none';
}

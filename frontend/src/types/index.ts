export interface AstronomicalObject {
  id: string;
  name: string;
  type: string;
  ra: number;
  dec: number;
  raHms: string;
  decDms: string;
  description: string;
  tags: string[];
  slug: string;
}

export interface Observation {
  id: string;
  objectId: string;
  productId: string;
  observationDate: string;
  ra: number;
  dec: number;
  wavelengthMin?: number;
  wavelengthMax?: number;
  qualityFlags?: Record<string, unknown>;
  sourceUrl?: string;
  processingStatus: 'pending' | 'processing' | 'ready' | 'error';
}

export interface Discovery {
  id: string;
  title: string;
  objectId: string;
  objectName: string;
  notes: string;
  observationIds: string[];
  analysisSummary: string;
  createdAt: string;
}

export interface Mission {
  id: string;
  title: string;
  subtitle: string;
  targetObject: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes: number;
  description: string;
  teaches: string[];
}

export type ViewMode = 'beginner' | 'advanced';

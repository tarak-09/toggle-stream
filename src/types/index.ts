export interface FeatureFlag {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  rolloutPercentage?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFlagInput {
  name: string;
  description?: string;
  enabled?: boolean;
  rolloutPercentage?: number;
}

export interface UpdateFlagInput {
  name?: string;
  description?: string;
  enabled?: boolean;
  rolloutPercentage?: number;
}

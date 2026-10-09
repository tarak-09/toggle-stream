export interface FeatureFlag {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFlagInput {
  name: string;
  description?: string;
  enabled?: boolean;
}

export interface UpdateFlagInput {
  name?: string;
  description?: string;
  enabled?: boolean;
}

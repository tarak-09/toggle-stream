export type Operator = 'eq' | 'neq' | 'in' | 'contains';

export interface Rule {
  attribute: string;
  operator: Operator;
  value: any;
}

export interface FeatureFlag {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  rolloutPercentage?: number;
  rules?: Rule[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFlagInput {
  name: string;
  description?: string;
  enabled?: boolean;
  rolloutPercentage?: number;
  rules?: Rule[];
}

export interface UpdateFlagInput {
  name?: string;
  description?: string;
  enabled?: boolean;
  rolloutPercentage?: number;
  rules?: Rule[];
}

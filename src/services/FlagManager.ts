import { EventEmitter } from 'events';
import { FeatureFlag, CreateFlagInput, UpdateFlagInput } from '../types';

class FlagManager extends EventEmitter {
  private flags: Map<string, FeatureFlag> = new Map();

  constructor() {
    super();
    // Pre-populate with a default flag for testing
    this.createFlag({ name: 'default-flag', description: 'A default flag', enabled: true }, 'default-flag');
  }

  public getAllFlags(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }

  public getFlag(id: string): FeatureFlag | undefined {
    return this.flags.get(id);
  }

  public createFlag(input: CreateFlagInput, forceId?: string): FeatureFlag {
    const id = forceId || Math.random().toString(36).substring(2, 9);
    const now = new Date();
    
    const newFlag: FeatureFlag = {
      id,
      name: input.name,
      description: input.description,
      enabled: input.enabled ?? false,
      rolloutPercentage: input.rolloutPercentage,
      rules: input.rules,
      createdAt: now,
      updatedAt: now,
    };

    this.flags.set(id, newFlag);
    this.emit('flag_updated', newFlag); // broadcast update
    return newFlag;
  }

  public updateFlag(id: string, input: UpdateFlagInput): FeatureFlag | null {
    const existing = this.flags.get(id);
    if (!existing) return null;

    const updatedFlag: FeatureFlag = {
      ...existing,
      ...input,
      updatedAt: new Date(),
    };

    this.flags.set(id, updatedFlag);
    this.emit('flag_updated', updatedFlag); // broadcast update
    return updatedFlag;
  }

  public deleteFlag(id: string): boolean {
    const existing = this.flags.get(id);
    if (!existing) return false;

    this.flags.delete(id);
    this.emit('flag_deleted', { id });
    return true;
  }
}

export const flagManager = new FlagManager();

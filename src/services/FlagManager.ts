import { EventEmitter } from 'events';
import Database from 'better-sqlite3';
import { FeatureFlag, CreateFlagInput, UpdateFlagInput } from '../types';

class FlagManager extends EventEmitter {
  private db: Database.Database;

  constructor() {
    super();
    // Use in-memory for tests, otherwise use file-based SQLite database
    const dbPath = process.env.NODE_ENV === 'test' ? ':memory:' : (process.env.DATABASE_URL || 'flags.db');
    this.db = new Database(dbPath);

    this.initDb();

    // Pre-populate with a default flag if it doesn't exist
    if (!this.getFlag('default-flag')) {
      this.createFlag({ name: 'default-flag', description: 'A default flag', enabled: true }, 'default-flag');
    }
  }

  private initDb() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS flags (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        enabled INTEGER NOT NULL,
        rolloutPercentage INTEGER,
        rules TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `);
  }

  private mapRowToFlag(row: any): FeatureFlag {
    return {
      id: row.id,
      name: row.name,
      description: row.description || undefined,
      enabled: Boolean(row.enabled),
      rolloutPercentage: row.rolloutPercentage !== null ? row.rolloutPercentage : undefined,
      rules: row.rules ? JSON.parse(row.rules) : undefined,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  public getAllFlags(): FeatureFlag[] {
    const rows = this.db.prepare('SELECT * FROM flags').all();
    return rows.map((row) => this.mapRowToFlag(row));
  }

  public getFlag(id: string): FeatureFlag | undefined {
    const row = this.db.prepare('SELECT * FROM flags WHERE id = ?').get(id);
    return row ? this.mapRowToFlag(row) : undefined;
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

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO flags (id, name, description, enabled, rolloutPercentage, rules, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      newFlag.id,
      newFlag.name,
      newFlag.description || null,
      newFlag.enabled ? 1 : 0,
      newFlag.rolloutPercentage ?? null,
      newFlag.rules ? JSON.stringify(newFlag.rules) : null,
      newFlag.createdAt.toISOString(),
      newFlag.updatedAt.toISOString()
    );

    this.emit('flag_updated', newFlag); // broadcast update
    return newFlag;
  }

  public updateFlag(id: string, input: UpdateFlagInput): FeatureFlag | null {
    const existing = this.getFlag(id);
    if (!existing) return null;

    const updatedFlag: FeatureFlag = {
      ...existing,
      ...input,
      updatedAt: new Date(),
    };

    const stmt = this.db.prepare(`
      UPDATE flags
      SET name = ?, description = ?, enabled = ?, rolloutPercentage = ?, rules = ?, updatedAt = ?
      WHERE id = ?
    `);

    stmt.run(
      updatedFlag.name,
      updatedFlag.description || null,
      updatedFlag.enabled ? 1 : 0,
      updatedFlag.rolloutPercentage ?? null,
      updatedFlag.rules ? JSON.stringify(updatedFlag.rules) : null,
      updatedFlag.updatedAt.toISOString(),
      id
    );

    this.emit('flag_updated', updatedFlag); // broadcast update
    return updatedFlag;
  }

  public deleteFlag(id: string): boolean {
    const result = this.db.prepare('DELETE FROM flags WHERE id = ?').run(id);
    if (result.changes === 0) return false;

    this.emit('flag_deleted', { id });
    return true;
  }
}

export const flagManager = new FlagManager();

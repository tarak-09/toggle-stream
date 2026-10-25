import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

describe('SQLite Persistence', () => {
  const dbPath = path.join(__dirname, 'test-persistence.db');

  afterAll(() => {
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
  });

  it('should persist flags to disk', () => {
    // Setup environment for the first instance
    process.env.NODE_ENV = 'development';
    process.env.DATABASE_URL = dbPath;

    // Isolate require to get fresh instances
    jest.resetModules();
    const { flagManager: manager1 } = require('../src/services/FlagManager');

    manager1.createFlag({ name: 'persisted-flag', enabled: true }, 'persist-id');
    
    expect(manager1.getFlag('persist-id')).toBeDefined();

    // Re-import to simulate service restart
    jest.resetModules();
    const { flagManager: manager2 } = require('../src/services/FlagManager');

    const loadedFlag = manager2.getFlag('persist-id');
    expect(loadedFlag).toBeDefined();
    expect(loadedFlag.name).toBe('persisted-flag');
    expect(loadedFlag.enabled).toBe(true);

    // Clean up NODE_ENV
    process.env.NODE_ENV = 'test';
    delete process.env.DATABASE_URL;
  });
});

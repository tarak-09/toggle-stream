import request from 'supertest';
import app from '../src/app';
import { flagManager } from '../src/services/FlagManager';

describe('Feature Flags API', () => {
  let createdFlagId: string;

  beforeAll(() => {
    // Clear initial flags
    const flags = flagManager.getAllFlags();
    for (const flag of flags) {
      flagManager.deleteFlag(flag.id);
    }
  });

  it('should get empty flag list', async () => {
    const res = await request(app).get('/api/flags');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('should create a new feature flag', async () => {
    const newFlag = {
      name: 'test-flag',
      description: 'A flag for testing',
      enabled: true,
    };

    const res = await request(app).post('/api/flags').send(newFlag);
    
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe(newFlag.name);
    expect(res.body.description).toBe(newFlag.description);
    expect(res.body.enabled).toBe(true);

    createdFlagId = res.body.id;
  });

  it('should validate missing name when creating', async () => {
    const res = await request(app).post('/api/flags').send({
      enabled: false,
    });
    
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should get a specific flag', async () => {
    const res = await request(app).get(`/api/flags/${createdFlagId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdFlagId);
    expect(res.body.name).toBe('test-flag');
  });

  it('should return 404 for unknown flag', async () => {
    const res = await request(app).get('/api/flags/non-existent-id');
    expect(res.status).toBe(404);
  });

  it('should update an existing flag', async () => {
    const res = await request(app).patch(`/api/flags/${createdFlagId}`).send({
      enabled: false,
    });

    expect(res.status).toBe(200);
    expect(res.body.enabled).toBe(false);
  });

  it('should delete a flag', async () => {
    const res = await request(app).delete(`/api/flags/${createdFlagId}`);
    expect(res.status).toBe(204);

    const getRes = await request(app).get(`/api/flags/${createdFlagId}`);
    expect(getRes.status).toBe(404);
  });
});

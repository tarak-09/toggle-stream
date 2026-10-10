import request from 'supertest';
import app from '../src/app';
import { flagManager } from '../src/services/FlagManager';

describe('Evaluate API', () => {
  let flag0: string;
  let flag100: string;
  let flag50: string;
  let disabledFlag: string;

  beforeAll(() => {
    // Clear initial flags
    const flags = flagManager.getAllFlags();
    for (const flag of flags) {
      flagManager.deleteFlag(flag.id);
    }

    flag0 = flagManager.createFlag({ name: 'flag-0', enabled: true, rolloutPercentage: 0 }).id;
    flag100 = flagManager.createFlag({ name: 'flag-100', enabled: true, rolloutPercentage: 100 }).id;
    flag50 = flagManager.createFlag({ name: 'flag-50', enabled: true, rolloutPercentage: 50 }).id;
    disabledFlag = flagManager.createFlag({ name: 'disabled-flag', enabled: false, rolloutPercentage: 100 }).id;
  });

  it('should evaluate flags for a contextId', async () => {
    const res = await request(app).post('/api/evaluate').send({ contextId: 'user-123' });
    expect(res.status).toBe(200);
    expect(res.body[flag0]).toBe(false);
    expect(res.body[flag100]).toBe(true);
    expect(res.body[disabledFlag]).toBe(false);
    // flag50 can be true or false, but it should be deterministically consistent for 'user-123'
    expect(typeof res.body[flag50]).toBe('boolean');
  });

  it('should evaluate consistently for the same contextId', async () => {
    const res1 = await request(app).post('/api/evaluate').send({ contextId: 'user-456' });
    const res2 = await request(app).post('/api/evaluate').send({ contextId: 'user-456' });
    expect(res1.body).toEqual(res2.body);
  });
  
  it('should return 400 if contextId is missing', async () => {
    const res = await request(app).post('/api/evaluate').send({});
    expect(res.status).toBe(400);
  });
});
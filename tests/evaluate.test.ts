import request from 'supertest';
import app from '../src/app';
import { flagManager } from '../src/services/FlagManager';

describe('Evaluate API', () => {
  let flag0: string;
  let flag100: string;
  let flag50: string;
  let disabledFlag: string;
  let ruleFlagEq: string;
  let ruleFlagIn: string;
  let ruleFlagContains: string;
  let ruleFlagNeq: string;

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
    
    ruleFlagEq = flagManager.createFlag({
      name: 'rule-flag-eq',
      enabled: true,
      rules: [{ attribute: 'plan', operator: 'eq', value: 'premium' }]
    }).id;

    ruleFlagIn = flagManager.createFlag({
      name: 'rule-flag-in',
      enabled: true,
      rules: [{ attribute: 'country', operator: 'in', value: ['US', 'CA'] }]
    }).id;

    ruleFlagContains = flagManager.createFlag({
      name: 'rule-flag-contains',
      enabled: true,
      rules: [{ attribute: 'email', operator: 'contains', value: '@acme.com' }]
    }).id;

    ruleFlagNeq = flagManager.createFlag({
      name: 'rule-flag-neq',
      enabled: true,
      rules: [{ attribute: 'version', operator: 'neq', value: 'v1' }]
    }).id;
  });

  it('should evaluate flags for a contextId', async () => {
    const res = await request(app).post('/api/evaluate').send({ contextId: 'user-123' });
    expect(res.status).toBe(200);
    expect(res.body[flag0]).toBe(false);
    expect(res.body[flag100]).toBe(true);
    expect(res.body[disabledFlag]).toBe(false);
    // flag50 can be true or false, but it should be deterministically consistent for 'user-123'
    expect(typeof res.body[flag50]).toBe('boolean');
    // Rule flags should be false by default if attributes are missing, except neq if missing attribute !== 'v1' (undefined !== 'v1' -> true)
    expect(res.body[ruleFlagEq]).toBe(false);
    expect(res.body[ruleFlagIn]).toBe(false);
    expect(res.body[ruleFlagContains]).toBe(false);
    expect(res.body[ruleFlagNeq]).toBe(true);
  });

  it('should evaluate rule flags correctly with matching attributes', async () => {
    const res = await request(app).post('/api/evaluate').send({
      contextId: 'user-789',
      attributes: { plan: 'premium', country: 'CA', email: 'test@acme.com', version: 'v2' }
    });
    expect(res.status).toBe(200);
    expect(res.body[ruleFlagEq]).toBe(true);
    expect(res.body[ruleFlagIn]).toBe(true);
    expect(res.body[ruleFlagContains]).toBe(true);
    expect(res.body[ruleFlagNeq]).toBe(true);
  });

  it('should evaluate rule flags correctly with non-matching attributes', async () => {
    const res = await request(app).post('/api/evaluate').send({
      contextId: 'user-101',
      attributes: { plan: 'basic', country: 'UK', email: 'test@gmail.com', version: 'v1' }
    });
    expect(res.status).toBe(200);
    expect(res.body[ruleFlagEq]).toBe(false);
    expect(res.body[ruleFlagIn]).toBe(false);
    expect(res.body[ruleFlagContains]).toBe(false);
    expect(res.body[ruleFlagNeq]).toBe(false);
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
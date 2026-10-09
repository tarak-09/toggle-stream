import request from 'supertest';
import app from '../src/app';
import { flagManager } from '../src/services/FlagManager';

describe('SSE Stream API', () => {
  it('should push events on flag update', (done) => {
    // We can test SSE by making a request and reading the stream
    const req = request(app).get('/api/stream').buffer(false);

    req.end((err, res) => {
      if (err) return done(err);
    });

    req.on('response', (res) => {
      expect(res.headers['content-type']).toBe('text/event-stream');
      
      let dataReceived = '';
      let updated = false;

      res.on('data', (chunk: Buffer) => {
        dataReceived += chunk.toString();
        
        if (dataReceived.includes('event: initial')) {
          // Trigger an update
          flagManager.createFlag({ name: 'sse-test', enabled: true }, 'test-id-123');
        }

        if (dataReceived.includes('event: update') && dataReceived.includes('test-id-123')) {
          updated = true;
          // Clean up to end the request somehow or just finish the test
          res.destroy(); // close stream
          expect(updated).toBe(true);
          done();
        }
      });
    });
  });
});

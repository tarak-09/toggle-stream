import request from 'supertest';
import app from '../src/app';
import { flagManager } from '../src/services/FlagManager';

describe('SSE Stream API', () => {
  it('should push events on flag update', (done) => {
    const req = request(app).get('/api/stream').buffer(false);

    req.end((err, res) => {
      if (err) return done(err);
    });

    req.on('response', (res) => {
      let dataReceived = '';

      res.on('data', (chunk: Buffer) => {
        const str = chunk.toString();
        console.log("CHUNK:", str);
        dataReceived += str;
        
        if (str.includes('event: initial')) {
          console.log("Triggering create...");
          flagManager.createFlag({ name: 'sse-test', enabled: true }, 'test-id-123');
        }

        if (dataReceived.includes('event: update') && dataReceived.includes('test-id-123')) {
          console.log("Received update!");
          res.destroy();
          done();
        }
      });
    });
  });
});

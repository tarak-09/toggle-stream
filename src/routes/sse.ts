import { Router } from 'express';
import { flagManager } from '../services/FlagManager';

const router = Router();

router.get('/', (req, res) => {
  // Set headers for SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  // Send initial data (current state of all flags)
  const initialFlags = flagManager.getAllFlags();
  res.write(`event: initial\ndata: ${JSON.stringify(initialFlags)}\n\n`);

  // Event handlers
  const onFlagUpdated = (flag: any) => {
    res.write(`event: update\ndata: ${JSON.stringify(flag)}\n\n`);
  };

  const onFlagDeleted = (data: any) => {
    res.write(`event: delete\ndata: ${JSON.stringify(data)}\n\n`);
  };

  // Subscribe to updates
  flagManager.on('flag_updated', onFlagUpdated);
  flagManager.on('flag_deleted', onFlagDeleted);

  // Keep connection alive with heartbeat
  const heartbeatId = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 30000);

  // Cleanup on client disconnect
  req.on('close', () => {
    clearInterval(heartbeatId);
    flagManager.off('flag_updated', onFlagUpdated);
    flagManager.off('flag_deleted', onFlagDeleted);
  });
});

export default router;

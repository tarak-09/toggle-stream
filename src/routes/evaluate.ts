import { Router } from 'express';
import { z } from 'zod';
import { flagManager } from '../services/FlagManager';
import { createHash } from 'crypto';

const router = Router();

const evaluateSchema = z.object({
  contextId: z.string().min(1, 'contextId is required'),
});

router.post('/', (req, res) => {
  const parseResult = evaluateSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid input', details: parseResult.error.issues });
  }

  const { contextId } = parseResult.data;
  const flags = flagManager.getAllFlags();
  const result: Record<string, boolean> = {};

  for (const flag of flags) {
    if (!flag.enabled) {
      result[flag.id] = false;
      continue;
    }

    if (flag.rolloutPercentage !== undefined) {
      const hash = createHash('sha256').update(`${flag.id}:${contextId}`).digest('hex');
      const num = parseInt(hash.substring(0, 8), 16);
      const isRolledOut = (num % 100) < flag.rolloutPercentage;
      result[flag.id] = isRolledOut;
    } else {
      result[flag.id] = true;
    }
  }

  res.json(result);
});

export default router;
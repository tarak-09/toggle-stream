import { Router } from 'express';
import { z } from 'zod';
import { flagManager } from '../services/FlagManager';

const router = Router();

const createFlagSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  enabled: z.boolean().optional(),
  rolloutPercentage: z.number().min(0).max(100).optional(),
});

const updateFlagSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  enabled: z.boolean().optional(),
  rolloutPercentage: z.number().min(0).max(100).optional(),
});

router.get('/', (req, res) => {
  res.json(flagManager.getAllFlags());
});

router.get('/:id', (req, res) => {
  const flag = flagManager.getFlag(req.params.id);
  if (!flag) {
    return res.status(404).json({ error: 'Flag not found' });
  }
  res.json(flag);
});

router.post('/', (req, res) => {
  const parseResult = createFlagSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid input', details: parseResult.error.issues });
  }

  const newFlag = flagManager.createFlag(parseResult.data);
  res.status(201).json(newFlag);
});

router.patch('/:id', (req, res) => {
  const parseResult = updateFlagSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid input', details: parseResult.error.issues });
  }

  const updatedFlag = flagManager.updateFlag(req.params.id, parseResult.data);
  if (!updatedFlag) {
    return res.status(404).json({ error: 'Flag not found' });
  }

  res.json(updatedFlag);
});

router.delete('/:id', (req, res) => {
  const success = flagManager.deleteFlag(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Flag not found' });
  }

  res.status(204).send();
});

export default router;

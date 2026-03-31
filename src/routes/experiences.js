import { Router } from 'express';
import { db, generateId, now } from '../data/store.js';
import { createExperienceSchema, updateExperienceSchema } from '../schemas/index.js';
import { validate } from '../middleware/validate.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// GET /experiences - public
router.get('/', (req, res) => {
  return res.status(200).json(db.experiences);
});

// POST /experiences - protected
router.post('/', authMiddleware, validate(createExperienceSchema), (req, res) => {
  const item = {
    id: generateId(),
    ...req.validatedBody,
    createdAt: now(),
    updatedAt: now(),
  };
  db.experiences.push(item);
  return res.status(201).json(item);
});

// PUT /experiences/:id - protected
router.put('/:id', authMiddleware, validate(updateExperienceSchema), (req, res) => {
  const index = db.experiences.findIndex(e => e.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Experience not found' });
  }
  const updated = { ...db.experiences[index], ...req.validatedBody, updatedAt: now() };
  db.experiences[index] = updated;
  return res.status(200).json(updated);
});

// DELETE /experiences/:id - protected
router.delete('/:id', authMiddleware, (req, res) => {
  const index = db.experiences.findIndex(e => e.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Experience not found' });
  }
  db.experiences.splice(index, 1);
  return res.status(204).send();
});

export default router;

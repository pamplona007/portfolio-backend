import { Router } from 'express';
import { db, generateId, now } from '../data/store.js';
import { createEducationSchema, updateEducationSchema } from '../schemas/index.js';
import { validate } from '../middleware/validate.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// GET /education - public
router.get('/', (req, res) => {
  return res.status(200).json(db.education);
});

// POST /education - protected
router.post('/', authMiddleware, validate(createEducationSchema), (req, res) => {
  const item = {
    id: generateId(),
    ...req.validatedBody,
    createdAt: now(),
    updatedAt: now(),
  };
  db.education.push(item);
  return res.status(201).json(item);
});

// PUT /education/:id - protected
router.put('/:id', authMiddleware, validate(updateEducationSchema), (req, res) => {
  const index = db.education.findIndex(e => e.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Education item not found' });
  }
  const updated = { ...db.education[index], ...req.validatedBody, updatedAt: now() };
  db.education[index] = updated;
  return res.status(200).json(updated);
});

// DELETE /education/:id - protected
router.delete('/:id', authMiddleware, (req, res) => {
  const index = db.education.findIndex(e => e.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Education item not found' });
  }
  db.education.splice(index, 1);
  return res.status(204).send();
});

export default router;

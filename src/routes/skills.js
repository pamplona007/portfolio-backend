import { Router } from 'express';
import { db, generateId, now } from '../data/store.js';
import { createSkillSchema, updateSkillSchema } from '../schemas/index.js';
import { validate } from '../middleware/validate.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// GET /skills - public
router.get('/', (req, res) => {
  return res.status(200).json(db.skills);
});

// POST /skills - protected
router.post('/', authMiddleware, validate(createSkillSchema), (req, res) => {
  const item = {
    id: generateId(),
    ...req.validatedBody,
    createdAt: now(),
    updatedAt: now(),
  };
  db.skills.push(item);
  return res.status(201).json(item);
});

// PUT /skills/:id - protected
router.put('/:id', authMiddleware, validate(updateSkillSchema), (req, res) => {
  const index = db.skills.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Skill not found' });
  }
  const updated = { ...db.skills[index], ...req.validatedBody, updatedAt: now() };
  db.skills[index] = updated;
  return res.status(200).json(updated);
});

// DELETE /skills/:id - protected
router.delete('/:id', authMiddleware, (req, res) => {
  const index = db.skills.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Skill not found' });
  }
  db.skills.splice(index, 1);
  return res.status(204).send();
});

export default router;

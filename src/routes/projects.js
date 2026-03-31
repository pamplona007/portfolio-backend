import { Router } from 'express';
import { db, generateId, now } from '../data/store.js';
import { createProjectSchema, updateProjectSchema } from '../schemas/index.js';
import { validate } from '../middleware/validate.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// GET /projects - public
router.get('/', (req, res) => {
  return res.status(200).json(db.projects);
});

// POST /projects - protected
router.post('/', authMiddleware, validate(createProjectSchema), (req, res) => {
  const item = {
    id: generateId(),
    ...req.validatedBody,
    link: req.validatedBody.link ?? null,
    imageUrl: req.validatedBody.imageUrl ?? null,
    featured: req.validatedBody.featured ?? false,
    createdAt: now(),
    updatedAt: now(),
  };
  db.projects.push(item);
  return res.status(201).json(item);
});

// PUT /projects/:id - protected
router.put('/:id', authMiddleware, validate(updateProjectSchema), (req, res) => {
  const index = db.projects.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Project not found' });
  }
  const updated = { ...db.projects[index], ...req.validatedBody, updatedAt: now() };
  db.projects[index] = updated;
  return res.status(200).json(updated);
});

// DELETE /projects/:id - protected
router.delete('/:id', authMiddleware, (req, res) => {
  const index = db.projects.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Project not found' });
  }
  db.projects.splice(index, 1);
  return res.status(204).send();
});

export default router;

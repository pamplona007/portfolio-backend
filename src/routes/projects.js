import { Router } from 'express';
import { prisma } from '../data/store.js';
import { createProjectSchema, updateProjectSchema } from '../schemas/index.js';
import { validate } from '../middleware/validate.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// GET /projects - public
router.get('/', async (req, res) => {
  const items = await prisma.project.findMany();
  return res.status(200).json(items);
});

// POST /projects - protected
router.post('/', authMiddleware, validate(createProjectSchema), async (req, res) => {
  const item = await prisma.project.create({
    data: {
      ...req.validatedBody,
      userId: req.user.id,
    },
  });
  return res.status(201).json(item);
});

// PUT /projects/:id - protected
router.put('/:id', authMiddleware, validate(updateProjectSchema), async (req, res) => {
  try {
    const updated = await prisma.project.update({
      where: { id: req.params.id },
      data: req.validatedBody,
    });
    return res.status(200).json(updated);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Project not found' });
    }
    throw err;
  }
});

// DELETE /projects/:id - protected
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Project not found' });
    }
    throw err;
  }
});

export default router;

import { Router } from 'express';
import { prisma } from '../data/store.js';
import { createExperienceSchema, updateExperienceSchema } from '../schemas/index.js';
import { validate } from '../middleware/validate.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// GET /experiences - public
router.get('/', async (req, res) => {
  const items = await prisma.experience.findMany();
  return res.status(200).json(items);
});

// POST /experiences - protected
router.post('/', authMiddleware, validate(createExperienceSchema), async (req, res) => {
  const item = await prisma.experience.create({
    data: {
      ...req.validatedBody,
      userId: req.user.id,
    },
  });
  return res.status(201).json(item);
});

// PUT /experiences/:id - protected
router.put('/:id', authMiddleware, validate(updateExperienceSchema), async (req, res) => {
  try {
    const updated = await prisma.experience.update({
      where: { id: req.params.id },
      data: req.validatedBody,
    });
    return res.status(200).json(updated);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Experience not found' });
    }
    throw err;
  }
});

// DELETE /experiences/:id - protected
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.experience.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Experience not found' });
    }
    throw err;
  }
});

export default router;

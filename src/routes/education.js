import { Router } from 'express';
import { prisma } from '../data/store.js';
import { createEducationSchema, updateEducationSchema } from '../schemas/index.js';
import { validate } from '../middleware/validate.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// GET /education - public
router.get('/', async (req, res) => {
  const items = await prisma.education.findMany();
  return res.status(200).json(items);
});

// POST /education - protected
router.post('/', authMiddleware, validate(createEducationSchema), async (req, res) => {
  const item = await prisma.education.create({
    data: {
      ...req.validatedBody,
      userId: req.user.id,
    },
  });
  return res.status(201).json(item);
});

// PUT /education/:id - protected
router.put('/:id', authMiddleware, validate(updateEducationSchema), async (req, res) => {
  try {
    const updated = await prisma.education.update({
      where: { id: req.params.id },
      data: req.validatedBody,
    });
    return res.status(200).json(updated);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Education item not found' });
    }
    throw err;
  }
});

// DELETE /education/:id - protected
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.education.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Education item not found' });
    }
    throw err;
  }
});

export default router;

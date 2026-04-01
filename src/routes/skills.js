import { Router } from 'express';
import { prisma } from '../data/store.js';
import { createSkillSchema, updateSkillSchema } from '../schemas/index.js';
import { validate } from '../middleware/validate.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// GET /skills - public
router.get('/', async (req, res) => {
  const items = await prisma.skill.findMany();
  return res.status(200).json(items);
});

// POST /skills - protected
router.post('/', authMiddleware, validate(createSkillSchema), async (req, res) => {
  const item = await prisma.skill.create({
    data: {
      ...req.validatedBody,
      userId: req.user.id,
    },
  });
  return res.status(201).json(item);
});

// PUT /skills/:id - protected
router.put('/:id', authMiddleware, validate(updateSkillSchema), async (req, res) => {
  try {
    const updated = await prisma.skill.update({
      where: { id: req.params.id },
      data: req.validatedBody,
    });
    return res.status(200).json(updated);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Skill not found' });
    }
    throw err;
  }
});

// DELETE /skills/:id - protected
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.skill.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Skill not found' });
    }
    throw err;
  }
});

export default router;

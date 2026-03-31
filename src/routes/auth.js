import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, generateId, now } from '../data/store.js';
import { registerSchema, loginSchema } from '../schemas/index.js';
import { validate } from '../middleware/validate.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// POST /auth/register
router.post('/register', validate(registerSchema), async (req, res) => {
  const { email, password, name } = req.validatedBody;

  // Check if email already exists
  if (db.users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = {
    id: generateId(),
    email,
    password: hashedPassword,
    name,
    createdAt: now(),
    updatedAt: now(),
  };
  db.users.push(user);

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  const { password: _, ...userWithoutPassword } = user;
  return res.status(201).json({ token, user: userWithoutPassword });
});

// POST /auth/login
router.post('/login', validate(loginSchema), async (req, res) => {
  const { email, password } = req.validatedBody;

  const user = db.users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  const { password: _, ...userWithoutPassword } = user;
  return res.status(200).json({ token, user: userWithoutPassword });
});

// GET /auth/me
router.get('/me', authMiddleware, (req, res) => {
  return res.status(200).json(req.user);
});

export default router;

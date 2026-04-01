import jwt from 'jsonwebtoken';
import { prisma } from '../data/store.js';

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    prisma.user
      .findUnique({ where: { id: decoded.userId } })
      .then(user => {
        if (!user) {
          return res.status(401).json({ error: 'User not found' });
        }
        req.user = { id: user.id, email: user.email, name: user.name };
        next();
      })
      .catch(() => res.status(401).json({ error: 'User not found' }));
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

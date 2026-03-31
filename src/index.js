import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import educationRoutes from './routes/education.js';
import experiencesRoutes from './routes/experiences.js';
import skillsRoutes from './routes/skills.js';
import projectsRoutes from './routes/projects.js';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use('/auth', authRoutes);
  app.use('/education', educationRoutes);
  app.use('/experiences', experiencesRoutes);
  app.use('/skills', skillsRoutes);
  app.use('/projects', projectsRoutes);

  app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

  return app;
}

// Only auto-start if this is the main module
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  const app = createApp();
  const PORT = process.env.PORT || 3005;
  app.listen(PORT, () => {
    console.log(`Portfolio backend running on port ${PORT}`);
  });
}

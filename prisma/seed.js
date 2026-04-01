import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.education.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Create demo user
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'demo@example.com',
      password: hashedPassword,
      name: 'Demo User',
    },
  });

  // Education
  await prisma.education.createMany({
    data: [
      {
        userId: user.id,
        institution: 'MIT',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        startDate: '2015-09-01',
        endDate: '2019-06-01',
        description: 'Focus on AI and Machine Learning',
        current: false,
      },
      {
        userId: user.id,
        institution: 'Stanford University',
        degree: 'Master of Science',
        field: 'Artificial Intelligence',
        startDate: '2019-09-01',
        description: 'Deep Learning specialisation',
        current: true,
      },
    ],
  });

  // Experience
  await prisma.experience.createMany({
    data: [
      {
        userId: user.id,
        company: 'Google',
        role: 'Software Engineer',
        startDate: '2020-01-01',
        description: 'Working on Search infrastructure',
        current: true,
      },
      {
        userId: user.id,
        company: 'Startup XYZ',
        role: 'Junior Developer',
        startDate: '2019-06-01',
        endDate: '2019-12-31',
        description: 'Full-stack development',
        current: false,
      },
    ],
  });

  // Skills
  await prisma.skill.createMany({
    data: [
      { userId: user.id, name: 'JavaScript', level: 5, category: 'Frontend' },
      { userId: user.id, name: 'TypeScript', level: 4, category: 'Frontend' },
      { userId: user.id, name: 'Node.js', level: 5, category: 'Backend' },
      { userId: user.id, name: 'Python', level: 4, category: 'Backend' },
      { userId: user.id, name: 'React', level: 5, category: 'Frontend' },
      { userId: user.id, name: 'PostgreSQL', level: 4, category: 'Database' },
      { userId: user.id, name: 'Docker', level: 3, category: 'DevOps' },
      { userId: user.id, name: 'AWS', level: 3, category: 'Cloud' },
    ],
  });

  // Projects
  await prisma.project.createMany({
    data: [
      {
        userId: user.id,
        title: 'Portfolio Website',
        description: 'Personal portfolio built with React and Node.js',
        techStack: ['React', 'Node.js', 'PostgreSQL'],
        link: 'https://example.com',
        featured: true,
      },
      {
        userId: user.id,
        title: 'E-commerce API',
        description: 'RESTful API for an e-commerce platform',
        techStack: ['Node.js', 'Express', 'PostgreSQL', 'Prisma'],
        link: 'https://api.example.com',
        featured: true,
      },
      {
        userId: user.id,
        title: 'Task Manager',
        description: 'Collaborative task management app',
        techStack: ['React', 'TypeScript', 'Firebase'],
        featured: false,
      },
    ],
  });

  console.log('Database seeded successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

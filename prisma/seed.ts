import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data (order matters for FK constraints)
  await prisma.education.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'demo@portfolio.com',
      password: hashedPassword,
      name: 'Demo User',
    },
  });

  console.log(`✅ Created user: ${user.email}`);

  // Education
  const [edu1, edu2] = await Promise.all([
    prisma.education.create({
      data: {
        userId: user.id,
        institution: 'Universidade de São Paulo',
        degree: 'Bacharelado em Ciência da Computação',
        field: 'Ciência da Computação',
        startDate: '2015-03-01',
        endDate: '2019-12-01',
        description:
          'Formação completa em algoritmos, estruturas de dados, banco de dados e engenharia de software. Participou de projetos de pesquisa em machine learning.',
        current: false,
      },
    }),
    prisma.education.create({
      data: {
        userId: user.id,
        institution: 'Udemy / Coursera',
        degree: 'Certificações Profissionalizantes',
        field: 'Full-Stack Development',
        startDate: '2020-01-01',
        description:
          'Completou cursos avançados em React, Node.js, TypeScript, PostgreSQL e cloud computing (AWS).',
        current: true,
      },
    }),
  ]);

  console.log(`✅ Created ${2} education entries`);

  // Experience
  const [exp1, exp2] = await Promise.all([
    prisma.experience.create({
      data: {
        userId: user.id,
        company: 'TechCorp Solutions',
        role: 'Desenvolvedor Full-Stack',
        startDate: '2020-06-01',
        description:
          'Desenvolvimento de aplicações web com React, Node.js e TypeScript. Implementação de APIs RESTful, integração com bancos PostgreSQL e deploy em AWS.',
        current: true,
      },
    }),
    prisma.experience.create({
      data: {
        userId: user.id,
        company: 'StartupHub',
        role: 'Estagiário em Desenvolvimento',
        startDate: '2019-01-01',
        endDate: '2020-05-01',
        description:
          'Auxílio no desenvolvimento front-end com React, manutenção de APIs Express e suporte ao time de produto.',
        current: false,
      },
    }),
  ]);

  console.log(`✅ Created ${2} experience entries`);

  // Skills
  const skills = await Promise.all([
    prisma.skill.create({
      data: { userId: user.id, name: 'React', level: 5, category: 'Frontend' },
    }),
    prisma.skill.create({
      data: { userId: user.id, name: 'TypeScript', level: 4, category: 'Frontend' },
    }),
    prisma.skill.create({
      data: { userId: user.id, name: 'Node.js', level: 5, category: 'Backend' },
    }),
    prisma.skill.create({
      data: { userId: user.id, name: 'PostgreSQL', level: 4, category: 'Database' },
    }),
    prisma.skill.create({
      data: { userId: user.id, name: 'Docker', level: 3, category: 'DevOps' },
    }),
  ]);

  console.log(`✅ Created ${skills.length} skills`);

  // Projects
  const [proj1, proj2] = await Promise.all([
    prisma.project.create({
      data: {
        userId: user.id,
        title: 'Portfolio Pessoal',
        description:
          'API e interface administrativa para gerenciamento de portfólio pessoal, com autenticação JWT, CRUD completo e persistência em PostgreSQL via Prisma ORM.',
        techStack: ['React', 'Node.js', 'Express', 'TypeScript', 'Prisma', 'PostgreSQL'],
        link: 'https://portfolio-demo.com',
        featured: true,
      },
    }),
    prisma.project.create({
      data: {
        userId: user.id,
        title: 'TaskBoard',
        description:
          'Aplicação web para gestão de tarefas com boards Kanban, drag-and-drop, múltiplos usuários e tempo real via WebSockets.',
        techStack: ['React', 'TypeScript', 'Socket.io', 'Node.js', 'MongoDB'],
        featured: true,
      },
    }),
  ]);

  console.log(`✅ Created ${2} projects`);
  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('Demo credentials:');
  console.log('  Email:    demo@portfolio.com');
  console.log('  Password: demo123');
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

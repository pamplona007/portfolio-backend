import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';

let server;
let baseUrl;

beforeAll(async () => {
  const { createApp } = await import('../src/index.js');
  const app = createApp();
  server = app.listen(3008);
  baseUrl = 'http://localhost:3008';
  await new Promise(r => setTimeout(r, 300));
});

beforeEach(async () => {
  const { resetData } = await import('../src/data/store.js');
  resetData();
});

afterAll(() => {
  server.close();
});

const request = async (method, path, body, token) => {
  const opts = { method, headers: {} };
  if (token) opts.headers['Authorization'] = `Bearer ${token}`;
  if (body) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(`${baseUrl}${path}`, opts);
  let data;
  const text = await res.text();
  try { data = JSON.parse(text); } catch { data = text; }
  return { status: res.status, data };
};

// Helper to get a fresh auth token
const getToken = async (email = 'user@test.com') =>
  (await request('POST', '/auth/register', { email, password: 'pass123', name: 'User' })).data.token;

describe('Auth', () => {
  describe('POST /auth/register', () => {
    it('201 - registers a new user and returns token', async () => {
      const { status, data } = await request('POST', '/auth/register', {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });
      expect(status).toBe(201);
      expect(data).toHaveProperty('token');
      expect(data).toHaveProperty('user');
      expect(data.user.email).toBe('test@example.com');
      expect(data.user.name).toBe('Test User');
      expect(data.user).not.toHaveProperty('password');
    });

    it('400 - returns error if email already exists', async () => {
      await request('POST', '/auth/register', { email: 'dup@example.com', password: 'pass123', name: 'A' });
      const { status, data } = await request('POST', '/auth/register', { email: 'dup@example.com', password: 'pass123', name: 'B' });
      expect(status).toBe(400);
      expect(data.error || JSON.stringify(data)).toMatch(/email/i);
    });

    it('400 - returns error if fields are missing', async () => {
      const { status } = await request('POST', '/auth/register', { email: 'test@example.com' });
      expect(status).toBe(400);
    });

    it('400 - returns error if email is invalid', async () => {
      const { status } = await request('POST', '/auth/register', { email: 'not-an-email', password: 'pass', name: 'A' });
      expect(status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    it('200 - returns token for valid credentials', async () => {
      await request('POST', '/auth/register', { email: 'login@example.com', password: 'password123', name: 'Test' });
      const { status, data } = await request('POST', '/auth/login', { email: 'login@example.com', password: 'password123' });
      expect(status).toBe(200);
      expect(data).toHaveProperty('token');
      expect(data).toHaveProperty('user');
    });

    it('401 - returns error for wrong password', async () => {
      await request('POST', '/auth/register', { email: 'login2@example.com', password: 'password123', name: 'Test' });
      const { status } = await request('POST', '/auth/login', { email: 'login2@example.com', password: 'wrongpass' });
      expect(status).toBe(401);
    });

    it('401 - returns error for unknown email', async () => {
      const { status } = await request('POST', '/auth/login', { email: 'unknown@example.com', password: 'pass' });
      expect(status).toBe(401);
    });
  });

  describe('GET /auth/me', () => {
    it('401 - returns 401 without token', async () => {
      const { status } = await request('GET', '/auth/me');
      expect(status).toBe(401);
    });

    it('200 - returns user profile with valid token', async () => {
      const { data: reg } = await request('POST', '/auth/register', { email: 'me@example.com', password: 'pass123', name: 'Me' });
      const { status, data } = await request('GET', '/auth/me', null, reg.token);
      expect(status).toBe(200);
      expect(data.email).toBe('me@example.com');
      expect(data.name).toBe('Me');
      expect(data).not.toHaveProperty('password');
    });
  });
});

describe('Education', () => {
  describe('GET /education', () => {
    it('200 - returns empty array initially', async () => {
      const { status, data } = await request('GET', '/education');
      expect(status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(0);
    });

    it('200 - returns education items', async () => {
      const token = await getToken('edu@test.com');
      await request('POST', '/education', { institution: 'MIT', degree: 'BS', field: 'CS', startDate: '2020-01-01', current: false }, token);
      const { status, data } = await request('GET', '/education');
      expect(status).toBe(200);
      expect(data.length).toBe(1);
      expect(data[0].institution).toBe('MIT');
    });
  });

  describe('POST /education', () => {
    it('401 - returns 401 without auth', async () => {
      const { status } = await request('POST', '/education', { institution: 'MIT' });
      expect(status).toBe(401);
    });

    it('201 - creates education item', async () => {
      const token = await getToken('edu2@test.com');
      const { status, data } = await request('POST', '/education', {
        institution: 'Stanford',
        degree: 'MS',
        field: 'AI',
        startDate: '2022-01-01',
        current: true,
        description: 'Machine Learning focus'
      }, token);
      expect(status).toBe(201);
      expect(data.institution).toBe('Stanford');
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('createdAt');
      expect(data).toHaveProperty('updatedAt');
    });

    it('400 - returns error for missing required fields', async () => {
      const token = await getToken('edu3@test.com');
      const { status } = await request('POST', '/education', { institution: 'MIT' }, token);
      expect(status).toBe(400);
    });
  });

  describe('PUT /education/:id', () => {
    it('401 - returns 401 without auth', async () => {
      const { status } = await request('PUT', '/education/some-id', { institution: 'MIT' });
      expect(status).toBe(401);
    });

    it('404 - returns 404 for unknown id', async () => {
      const token = await getToken('edu4@test.com');
      const { status } = await request('PUT', '/education/00000000-0000-0000-0000-000000000000', { institution: 'MIT' }, token);
      expect(status).toBe(404);
    });

    it('200 - updates education item', async () => {
      const token = await getToken('edu5@test.com');
      const { data: created } = await request('POST', '/education', {
        institution: 'MIT',
        degree: 'BS',
        field: 'CS',
        startDate: '2020-01-01',
        current: false
      }, token);
      const { status, data } = await request('PUT', `/education/${created.id}`, { institution: 'Harvard' }, token);
      expect(status).toBe(200);
      expect(data.institution).toBe('Harvard');
    });
  });

  describe('DELETE /education/:id', () => {
    it('401 - returns 401 without auth', async () => {
      const { status } = await request('DELETE', '/education/some-id');
      expect(status).toBe(401);
    });

    it('404 - returns 404 for unknown id', async () => {
      const token = await getToken('edu6@test.com');
      const { status } = await request('DELETE', '/education/00000000-0000-0000-0000-000000000000', null, token);
      expect(status).toBe(404);
    });

    it('204 - deletes education item', async () => {
      const token = await getToken('edu7@test.com');
      const { data: created } = await request('POST', '/education', {
        institution: 'MIT',
        degree: 'BS',
        field: 'CS',
        startDate: '2020-01-01'
      }, token);
      const { status } = await request('DELETE', `/education/${created.id}`, null, token);
      expect(status).toBe(204);
      const { data } = await request('GET', '/education');
      expect(data.length).toBe(0);
    });
  });
});

describe('Experiences', () => {
  describe('GET /experiences', () => {
    it('200 - returns empty array initially', async () => {
      const { status, data } = await request('GET', '/experiences');
      expect(status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });

    it('200 - returns experiences items', async () => {
      const token = await getToken('exp@test.com');
      await request('POST', '/experiences', { company: 'Google', role: 'Engineer', startDate: '2020-01-01', current: true }, token);
      const { status, data } = await request('GET', '/experiences');
      expect(status).toBe(200);
      expect(data.length).toBe(1);
      expect(data[0].company).toBe('Google');
    });
  });

  describe('POST /experiences', () => {
    it('401 - returns 401 without auth', async () => {
      const { status } = await request('POST', '/experiences', { company: 'Google' });
      expect(status).toBe(401);
    });

    it('201 - creates experience item', async () => {
      const token = await getToken('exp2@test.com');
      const { status, data } = await request('POST', '/experiences', {
        company: 'Google',
        role: 'Senior Engineer',
        startDate: '2020-01-01',
        current: true,
        description: 'Working on search'
      }, token);
      expect(status).toBe(201);
      expect(data.company).toBe('Google');
      expect(data).toHaveProperty('id');
    });

    it('400 - returns error for missing required fields', async () => {
      const token = await getToken('exp3@test.com');
      const { status } = await request('POST', '/experiences', { company: 'Google' }, token);
      expect(status).toBe(400);
    });
  });

  describe('PUT /experiences/:id', () => {
    it('404 - returns 404 for unknown id', async () => {
      const token = await getToken('exp4@test.com');
      const { status } = await request('PUT', '/experiences/00000000-0000-0000-0000-000000000000', { company: 'Google' }, token);
      expect(status).toBe(404);
    });

    it('200 - updates experience item', async () => {
      const token = await getToken('exp5@test.com');
      const { data: created } = await request('POST', '/experiences', {
        company: 'Google',
        role: 'Engineer',
        startDate: '2020-01-01',
        current: true
      }, token);
      const { status, data } = await request('PUT', `/experiences/${created.id}`, { company: 'Meta' }, token);
      expect(status).toBe(200);
      expect(data.company).toBe('Meta');
    });
  });

  describe('DELETE /experiences/:id', () => {
    it('404 - returns 404 for unknown id', async () => {
      const token = await getToken('exp6@test.com');
      const { status } = await request('DELETE', '/experiences/00000000-0000-0000-0000-000000000000', null, token);
      expect(status).toBe(404);
    });

    it('204 - deletes experience item', async () => {
      const token = await getToken('exp7@test.com');
      const { data: created } = await request('POST', '/experiences', {
        company: 'Google',
        role: 'Engineer',
        startDate: '2020-01-01'
      }, token);
      const { status } = await request('DELETE', `/experiences/${created.id}`, null, token);
      expect(status).toBe(204);
    });
  });
});

describe('Skills', () => {
  describe('GET /skills', () => {
    it('200 - returns empty array initially', async () => {
      const { status, data } = await request('GET', '/skills');
      expect(status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });

    it('200 - returns skills items', async () => {
      const token = await getToken('skl@test.com');
      await request('POST', '/skills', { name: 'JavaScript', level: 5, category: 'frontend' }, token);
      const { status, data } = await request('GET', '/skills');
      expect(status).toBe(200);
      expect(data.length).toBe(1);
      expect(data[0].name).toBe('JavaScript');
    });
  });

  describe('POST /skills', () => {
    it('401 - returns 401 without auth', async () => {
      const { status } = await request('POST', '/skills', { name: 'JS' });
      expect(status).toBe(401);
    });

    it('201 - creates skill item', async () => {
      const token = await getToken('skl2@test.com');
      const { status, data } = await request('POST', '/skills', {
        name: 'TypeScript',
        level: 4,
        category: 'frontend'
      }, token);
      expect(status).toBe(201);
      expect(data.name).toBe('TypeScript');
      expect(data.level).toBe(4);
      expect(data).toHaveProperty('id');
    });

    it('400 - returns error for invalid level (not 1-5)', async () => {
      const token = await getToken('skl3@test.com');
      const { status } = await request('POST', '/skills', { name: 'JS', level: 10, category: 'frontend' }, token);
      expect(status).toBe(400);
    });

    it('400 - returns error for missing required fields', async () => {
      const token = await getToken('skl4@test.com');
      const { status } = await request('POST', '/skills', { name: 'JS' }, token);
      expect(status).toBe(400);
    });
  });

  describe('PUT /skills/:id', () => {
    it('404 - returns 404 for unknown id', async () => {
      const token = await getToken('skl5@test.com');
      const { status } = await request('PUT', '/skills/00000000-0000-0000-0000-000000000000', { name: 'JS' }, token);
      expect(status).toBe(404);
    });

    it('200 - updates skill item', async () => {
      const token = await getToken('skl6@test.com');
      const { data: created } = await request('POST', '/skills', { name: 'JavaScript', level: 3, category: 'frontend' }, token);
      const { status, data } = await request('PUT', `/skills/${created.id}`, { name: 'JavaScript', level: 5 }, token);
      expect(status).toBe(200);
      expect(data.level).toBe(5);
    });
  });

  describe('DELETE /skills/:id', () => {
    it('404 - returns 404 for unknown id', async () => {
      const token = await getToken('skl7@test.com');
      const { status } = await request('DELETE', '/skills/00000000-0000-0000-0000-000000000000', null, token);
      expect(status).toBe(404);
    });

    it('204 - deletes skill item', async () => {
      const token = await getToken('skl8@test.com');
      const { data: created } = await request('POST', '/skills', { name: 'JavaScript', level: 5, category: 'frontend' }, token);
      const { status } = await request('DELETE', `/skills/${created.id}`, null, token);
      expect(status).toBe(204);
    });
  });
});

describe('Projects', () => {
  describe('GET /projects', () => {
    it('200 - returns empty array initially', async () => {
      const { status, data } = await request('GET', '/projects');
      expect(status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });

    it('200 - returns projects items', async () => {
      const token = await getToken('prj@test.com');
      await request('POST', '/projects', { title: 'My App', description: 'An app', techStack: ['Node'] }, token);
      const { status, data } = await request('GET', '/projects');
      expect(status).toBe(200);
      expect(data.length).toBe(1);
      expect(data[0].title).toBe('My App');
    });
  });

  describe('POST /projects', () => {
    it('401 - returns 401 without auth', async () => {
      const { status } = await request('POST', '/projects', { title: 'My App' });
      expect(status).toBe(401);
    });

    it('201 - creates project item', async () => {
      const token = await getToken('prj2@test.com');
      const { status, data } = await request('POST', '/projects', {
        title: 'Portfolio',
        description: 'My portfolio',
        techStack: ['React', 'Node'],
        link: 'https://example.com',
        imageUrl: 'https://example.com/img.png',
        featured: true
      }, token);
      expect(status).toBe(201);
      expect(data.title).toBe('Portfolio');
      expect(data.techStack).toEqual(['React', 'Node']);
      expect(data.featured).toBe(true);
      expect(data).toHaveProperty('id');
    });

    it('201 - creates project without optional fields', async () => {
      const token = await getToken('prj3@test.com');
      const { status, data } = await request('POST', '/projects', {
        title: 'Simple Project',
        description: 'A simple project',
        techStack: ['JS']
      }, token);
      expect(status).toBe(201);
      expect(data.link).toBeNull();
      expect(data.imageUrl).toBeNull();
      expect(data.featured).toBe(false);
    });

    it('400 - returns error for missing required fields', async () => {
      const token = await getToken('prj4@test.com');
      const { status } = await request('POST', '/projects', { title: 'My App' }, token);
      expect(status).toBe(400);
    });
  });

  describe('PUT /projects/:id', () => {
    it('404 - returns 404 for unknown id', async () => {
      const token = await getToken('prj5@test.com');
      const { status } = await request('PUT', '/projects/00000000-0000-0000-0000-000000000000', { title: 'App' }, token);
      expect(status).toBe(404);
    });

    it('200 - updates project item', async () => {
      const token = await getToken('prj6@test.com');
      const { data: created } = await request('POST', '/projects', {
        title: 'My App',
        description: 'An app',
        techStack: ['Node']
      }, token);
      const { status, data } = await request('PUT', `/projects/${created.id}`, { title: 'Updated App' }, token);
      expect(status).toBe(200);
      expect(data.title).toBe('Updated App');
    });
  });

  describe('DELETE /projects/:id', () => {
    it('404 - returns 404 for unknown id', async () => {
      const token = await getToken('prj7@test.com');
      const { status } = await request('DELETE', '/projects/00000000-0000-0000-0000-000000000000', null, token);
      expect(status).toBe(404);
    });

    it('204 - deletes project item', async () => {
      const token = await getToken('prj8@test.com');
      const { data: created } = await request('POST', '/projects', {
        title: 'My App',
        description: 'An app',
        techStack: ['Node']
      }, token);
      const { status } = await request('DELETE', `/projects/${created.id}`, null, token);
      expect(status).toBe(204);
    });
  });
});

# Portfolio Backend

Personal portfolio API built with Express, Prisma 7, and PostgreSQL.

## Prerequisites

- Node.js 18+
- PostgreSQL (local or Docker)

## Setup

### 1. Install dependencies

```bash
npm install
```

This runs `postinstall` which automatically generates the Prisma client.

### 2. Configure database

Copy `.env.example` to `.env` and update the `DATABASE_URL`:

```bash
cp .env.example .env
```

Example connection strings:

- **Local PostgreSQL:** `postgresql://postgres:postgres@localhost:5432/portfolio`
- **Docker:** `postgresql://postgres:postgres@localhost:5432/portfolio`
- **Remote/Cloud:** Use your cloud provider's connection string

### 3. Create the database

If using a local PostgreSQL, create the database first:

```bash
createdb portfolio
```

Or with Docker:

```bash
docker run -d --name portfolio-db -e POSTGRES_DB=portfolio -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16-alpine
```

### 4. Push schema to database

```bash
npm run db:push
```

This synchronises your Prisma schema with the database (creates/updates tables).

### 5. (Optional) Seed the database

```bash
npm run db:seed
```

This populates the database with demo data.

### 6. Start the server

```bash
npm run dev
```

The API runs on `http://localhost:3005`.

## API Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /auth/register | No | Register new user |
| POST | /auth/login | No | Login |
| GET | /auth/me | Yes | Get current user |
| GET | /education | No | List education |
| POST | /education | Yes | Create education |
| PUT | /education/:id | Yes | Update education |
| DELETE | /education/:id | Yes | Delete education |
| GET | /experiences | No | List experiences |
| POST | /experiences | Yes | Create experience |
| PUT | /experiences/:id | Yes | Update experience |
| DELETE | /experiences/:id | Yes | Delete experience |
| GET | /skills | No | List skills |
| POST | /skills | Yes | Create skill |
| PUT | /skills/:id | Yes | Update skill |
| DELETE | /skills/:id | Yes | Delete skill |
| GET | /projects | No | List projects |
| POST | /projects | Yes | Create project |
| PUT | /projects/:id | Yes | Update project |
| DELETE | /projects/:id | Yes | Delete project |

## Test

```bash
npm test
```

## Prisma Commands

```bash
npm run db:push   # Push schema to database
npm run db:seed   # Seed database with demo data
npx prisma studio # Open Prisma Studio (visual database editor)
```

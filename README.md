# Wazzup - A basic live messaging app

## Local development

### Prerequisites

- Docker
- Node v22.9

### Installation

Run docker compose

```bash
docker compose up
```

The frontend app will be available at http://localhost:3000/. The backend's default address is http://localhost:4000/.

To generate some dummy data, run

```bash
docker compose exec backend npm run seed-db
```

### Local DB inspection

```bash
npx prisma studio
```

## Tech stack

- Typescript
- React
- TailwindCSS
- Fastify
- TRPC
- Postgres
- Prisma
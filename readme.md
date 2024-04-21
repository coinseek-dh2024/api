# CoinSeek API

**API for CoinSeek app**

## Technologies used

- Nest.js
- Prisma
- Postgres
- Docker

## Setup

Install dependencies

```bash
pnpm install
```

Start docker containers

```bash
docker compose up -d
```

Push schema to database

```bash
pnpx prisma db push
```

Start the API

```bash
pnpm dev
```
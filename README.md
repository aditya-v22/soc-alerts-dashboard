# DefenderMate — SOC Alerts Dashboard

A full-stack web application for Security Operations Center (SOC) analysts to triage security alerts.

## Stack

- **Frontend**: Next.js 15, shadcn/ui, TanStack Query, Recharts
- **Backend**: NestJS, Prisma 7, SQLite (libsql)

## Project Structure

```
defendermate/
├── backend/    # NestJS API
└── frontend/   # Next.js app
```

## Getting Started

### Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

API available at `http://localhost:3001`  
Swagger docs at `http://localhost:3001/api/docs`

### Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

App available at `http://localhost:3000`

## Demo Credentials

```
username: analyst
password: DefenderM8!
```

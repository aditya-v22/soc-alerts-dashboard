# DefenderMate — SOC Alerts Dashboard

A full-stack web application for Security Operations Center (SOC) analysts to triage security alerts.

## Stack

- **Backend**: NestJS, Prisma, SQLite

## Project Structure

```
defendermate/
└── backend/    # NestJS API
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

## Demo Credentials

```
username: analyst
password: DefenderM8!
```

# DPCS

Digital Prescription and Pharmacy Coordination System.

This repository has two apps:

- `backend`: Express, Prisma, MySQL API
- `frontend`: React, Vite web app

## Quick Start

Start the backend first, then the frontend.

```bash
cd backend
npm install
copy .env.example .env
npm run prisma:migrate -- --name init
npm run prisma:seed
npm run dev
```

In another terminal:

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Local URLs:

- Frontend: `http://127.0.0.1:5173`
- Backend health: `http://127.0.0.1:4000/health`
- Swagger docs: `http://127.0.0.1:4000/api/docs`

## Notes

- Create a MySQL database named `dpcs` before running migrations.
- Lookup values such as roles, genders, prescription statuses, medicine timings, and notification types are stored in database tables, not enums.
- Seed data creates the lookup table rows, starter medicines, and an admin account.

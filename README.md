# School Meal Management (Client + Server)

This project is now split into two clean modules:

- `client/`: React + Vite + shadcn-style UI + theme
- `server/`: Express + MongoDB (Mongoose) API

No `localStorage` is used for app data. Session auth is cookie-based and all data is persisted in MongoDB.

## 1) Setup

1. Install dependencies at repo root:
   - `npm install`
2. Create server env:
   - copy `server/.env.example` to `server/.env`
3. Ensure MongoDB is running.

## 2) Run

- `npm run dev`

This starts:
- API server on `http://localhost:4000`
- client on `http://localhost:5173`

## 3) Build

- `npm run build`

## Default Admin Login

- email: `admin@schoolmeal.tn.gov`
- password: `Admin@123`

(Override with `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `server/.env`.)

## Welcome Email (Nodemailer)

When an admin creates an organizer, the server sends a professional welcome email to the organizer's email address with account details and the temporary password.

Add these values in `server/.env`:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM_NAME`
- `SMTP_FROM_EMAIL`

If SMTP is not configured or email delivery fails, organizer creation is rejected.

## Vercel Deployment

Deploy `client` and `server` as two separate Vercel projects.

### Client (Vite SPA)

1. Import repo in Vercel and set **Root Directory** to `client`.
2. Framework preset: `Vite`.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Add environment variable:
   - `VITE_API_BASE_URL=https://<your-server-vercel-domain>`

`client/vercel.json` already contains SPA rewrite config.

### Server (Express API)

1. Import repo in Vercel and set **Root Directory** to `server`.
2. Build command: `npm install` (or default).
3. Add environment variables from `server/.env.example`.
4. Set `CLIENT_ORIGIN` to your deployed client URL (or comma-separated list for multiple origins).

`server/vercel.json` and `server/api/index.ts` are already configured to run Express as a serverless API.

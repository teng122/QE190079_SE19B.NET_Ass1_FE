# TaskTrack frontend

Next.js App Router frontend for the Task & Team Management assignment.

## Requirements

- Node.js 20 or later
- A running TaskTrack API

## Local development

1. Copy `.env.example` to `.env.local`.
2. Set `NEXT_PUBLIC_API_URL` to the backend origin (do not add `/api`). The local API defaults to `http://localhost:5195`.
3. From this directory, run:

   ```bash
   npm ci
   npm run dev
   ```

The frontend is available at `http://localhost:3000`.

## Pages

- `/` — dashboard, summary counts, and active project cards
- `/departments` and `/departments/[id]` — department directory and detail
- `/projects/[id]` and `/tasks/[id]` — project and task details
- `/search` — live task filters for title, status, priority, project, and tag
- `/departments/manage`, `/projects/manage`, `/tasks/manage`, `/tags/manage` — public CRUD pages

All data is loaded from the API. Management pages validate required fields in the browser, show operation notifications, and confirm deletions.

## Deploy to Vercel

Import this frontend project into Vercel and set `NEXT_PUBLIC_API_URL` to the deployed backend origin, for example `https://your-api.example.com` (without `/api`). Add the Vercel origin to the backend's `CORS_ALLOWED_ORIGINS`, then deploy both services.

Do not put database credentials or other secrets in frontend environment variables.

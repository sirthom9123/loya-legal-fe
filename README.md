# AI Legal OS — Frontend

**React** (Vite) + **React Router** + **Tailwind CSS** v4. Client dashboard with sidebar navigation, JWT auth against the Django API, and a separate staff **Admin** area when `is_staff` is true.

## Requirements

- **Node.js** 18+ (20+ recommended)
- npm (or pnpm/yarn)

## Setup

```bash
cd frontend
npm install
```

## Environment (optional)

Create **`frontend/.env`** (or `.env.local`) if the API is not on the same machine as the dev proxy:

```env
# Backend origin for links (e.g. Django Admin from Admin dashboard)
VITE_DJANGO_ORIGIN=http://127.0.0.1:8000
```

During **`npm run dev`**, API calls use the Vite proxy: **`/api` → `http://localhost:8000`**. Ensure the backend is running on port **8000** (or change `vite.config.js`).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (default **http://localhost:5173**) |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build locally |

## Features

- **Auth:** Login, register, JWT in `localStorage` (`access`, `refresh`)
- **Client shell:** `ClientLayout` — sidebar (Dashboard, Documents, Semantic search, Assistant (RAG), Chat, Workflows, Playbooks, Settings), top bar (semantic search shortcut, notifications, user menu), breadcrumbs
- **Documents:** Upload, table view, detail, and retry/reprocess for failed jobs
- **AI:** Semantic search (`/search`), Assistant (`/assistant`) with RAG + clause risk + drafting workflows, and raw chat (`/chat`) with latency/token observability
- **Profile:** Settings + account danger zone
- **Admin:** `/admin/dashboard` (staff only) — stats + link to Django Admin
- **Design:** Green / vanilla theme — see `UI Enhancement.md` in repo root

## Project layout

| Path | Role |
|------|------|
| `src/App.jsx` | Routes + protected / admin routes |
| `src/components/` | `ClientLayout`, `AdminLayout`, `UserMenu`, etc. |
| `src/pages/` | Page screens |
| `src/utils/` | `authHeaders`, `apiError`, `sessionUser`, `breadcrumb`, `aiActivity` |
| `vite.config.js` | Dev server + `/api` proxy |
| `tailwind.config.js` | Theme tokens |

## Backend dependency

The UI expects the Django API at **`/api`** (see backend README). CORS must allow the Vite origin (e.g. `http://localhost:5173`).

## License

Proprietary / project-specific — adjust as needed.

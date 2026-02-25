# SkillGraph — Competitive Programming Progress Tracker

> Unified contest history, tag analysis, and recommendation engine for competitive programmers.

SkillGraph combines backend platform adapters and a React frontend to visualize contest history, identify weak tags, and provide tailored practice recommendations.

---

Contents

- Problem statement
- Features
- Tech stack (detailed)
- Quick start
- Environment variables
- File & folder structure (detailed)
- Per-file explanations (key files)
- Future roadmap

---

Problem statement

Competitive programmers use multiple judge platforms and lack a single dashboard summarizing contest history, tag-level weaknesses, and prioritized problems to practice. SkillGraph ingests platform data (submissions, standings), computes upsolve/contest behavior, shows rating trajectories, and recommends problems based on weak tags and rating ranges.

---

Features

- Multi-platform support (Codeforces, LeetCode — pluggable adapters)
- Contest vs Upsolve detection and analysis
- Tag-level analytics: attempts, solves, weak-tag detection
- Recommendation engine: filter by rating, tag, and difficulty
- Visualizations: rating timeline, distribution, derived stats and streaks
- Auth (JWT), user model and submission history persistence
- Admin/test creation endpoints and contest scheduler

---

Tech stack (detailed)

- Node.js (v18+) — server runtime
- Express — HTTP server, middleware, routing
- MongoDB + Mongoose — primary datastore and schemas
- Redis (optional) + Bull/BullMQ — background jobs and rate-limited scrapers (recommended for production)
- Authentication: JWT (`jsonwebtoken`), password hashing via `bcrypt`
- HTTP: `axios` for server-to-server calls; frontend uses `fetch` (native) or `axios`
- React (v18+) — frontend UI
- React Router — client-side routing
- State: local hooks and context; replaceable with `zustand` or `redux` if needed
- Styling: Tailwind CSS + PostCSS; responsive component-first UI
- Build/tooling: Vite (fast dev), esbuild/SWC (opt-in for faster builds)
- Charts: Chart.js for rating/history visualizations
- Linting/Formatting: ESLint, Prettier, relevant plugins (react-hooks)
- Testing: Jest + React Testing Library for unit tests; Playwright/Cypress for E2E
- Containerization & Deployment: Dockerfiles included; recommend Docker Compose for local DB and Redis; production via Docker + Nginx or managed platforms (Vercel/Heroku)
- CI/CD: GitHub Actions for lint/test/build pipelines
- Monitoring: Console logging; consider Sentry for error tracking and Prometheus/Grafana for metrics

---

Quick start (local development)

Open two terminals.

Backend:
```bash
cd backend
npm install
npm run dev   # nodemon server.js
```

Frontend:
```bash
cd frontend
npm install
npm run dev   # vite -> http://localhost:5173
```

From project root you can start each via the npm scripts:
```bash
npm run start-backend
npm run start-frontend
```

Health checks:
```bash
curl http://localhost:5001/health
curl http://localhost:5173/
```

Note: The backend will start without `MONGODB_URI` set (development mode logs a warning and continues). For full functionality, provide a MongoDB URI or run a local Mongo container.

---

Environment variables

Place a `.env` file in `backend/` with:

- `PORT` (defaults to 5001)
- `MONGODB_URI` (mongodb connection string)
- `JWT_SECRET` (auth signing key)
- `REDIS_URL` (optional — for job queues)

Example `.env`:
```
PORT=5001
MONGODB_URI=mongodb://localhost:27017/skillgraph
JWT_SECRET=changeme
REDIS_URL=redis://localhost:6379
```

---

File & folder structure (detailed)

Top-level layout:

- `backend/` — server-side application
  - `server.js` — app bootstrap: loads env, connects DB, mounts routes, starts scheduler
  - `package.json` — backend scripts (`start`, `dev`) and dependencies
  - `config/`
    - `db.js` — mongoose connection (handles missing URI in dev)
    - other config files (e.g., logger, mail) may appear here
  - `routes/` — route modules grouped by domain
    - `index.js` — aggregates mounts under `/api`
    - `authRoutes.js`, `codeforcesRoutes.js`, `contestRoutes.js`, `problemRoutes.js`, `submissionRoutes.js` etc.
  - `controllers/` — receive req/res and call `services/`
    - `authController.js`, `codeforcesController.js`, `contestController.js`, ...
  - `models/` — Mongoose schemas
    - `UserModel.js`, `ProblemModel.js`, `TestModel.js`, `SubmissionHistoryModel.js`, `TestResultModel.js`, `LiveResponseModel.js`, etc.
  - `services/` — core business logic and external API adapters
    - `codeforcesServices.js` — Codeforces API client + processing
    - `codeforcesService.js` — compatibility alias (re-export)
    - `leetcodeService.js` (if added) — LeetCode adapter
  - `middlewares/` — express middleware
    - `authMiddleware.js`, `adminMiddleware.js`, `checkTestMiddleware.js`
  - `utils/` — helpers and background tasks
    - `contestScheduler.js` — scheduled tasks to refresh contest lists
    - `helpers.js`, `validator.js`

- `frontend/` — client-side app (Vite + React)
  - `index.html` — Vite HTML entry
  - `package.json` — frontend scripts (`dev`, `build`, `preview`)
  - `vite.config.js`, `postcss.config.js`, `tailwind.config.js`
  - `src/`
    - `main.jsx` — mounts React app and providers
    - `App.jsx` — router and layout
    - `pages/` — route components (Dashboard.jsx, Contest.jsx, History.jsx, Practice.jsx, AuthPage.jsx, Signup/Login)
    - `components/` — UI primitives and domain components
      - `dashboard/` — ActivityCalendar.jsx, QuickStats.jsx, PlatformCard.jsx, etc.
      - `contest/` — CodeEditor.jsx, Question.jsx, Timer.jsx, QuestionNavigator.jsx
    - `api/` — client-side API helpers
      - `api.js` — low-level fetch wrappers
      - `config.js` — `API_BASE` constant
      - `platformAPIs.js` — `fetchCodeforcesHistory`, `fetchLeetCodeHistory` transformations
      - `practiceApi.js`, `activityAPIs.js`, `auth.js`
    - `hooks/` — reusable hooks (useContest.js, useProblems.js)
    - `services/` — cross-cutting utilities (connectivity, session)
    - `assets/` — static assets
    - `App.css`, `index.css` — styles (Tailwind entry)

- `docker/` — docker images for judge and tooling (optional)
- `docker-compose.yml` — example compose file (optional) to run app + mongo + redis

---

Per-file explanations (key files)

- `backend/server.js`
  - Starts the Express server, applies global middleware (`cors`, `express.json`), mounts API router, health endpoint, error handlers, and initializes the contest scheduler.

- `backend/config/db.js`
  - Manages Mongoose connection lifecycle; returns early in development when `MONGODB_URI` is unset to allow running without DB.

- `backend/routes/index.js`
  - Imports and mounts subrouters: `app.use('/api/auth', authRoutes)`, `app.use('/api/codeforces', codeforcesRoutes)`, etc.

- `backend/controllers/codeforcesController.js`
  - Orchestrates platform service calls and shapes the API response for the frontend (profile, upsolve, tags, recommendations, upcoming contests).

- `backend/services/codeforcesServices.js`
  - Encapsulates Codeforces HTTP calls and processing logic: parsing submissions, grouping by contest, computing solved/upsolved, analyzing tags, and exposing helper functions used by controllers and CLI tasks.

- `frontend/src/api/platformAPIs.js`
  - Converts raw backend responses to the small objects used by UI components (e.g., `history` with `newRating`, `ratingChange`, `rank`). Add platform adapters here to keep pages decoupled from backend shape.

- `frontend/src/pages/History.jsx`
  - Loads history for the selected platform and handle, computes derived stats, and renders charts with Chart.js; imports `fetchCodeforcesHistory` and `fetchLeetCodeHistory` from `api/platformAPIs.js`.

---

Future roadmap (short)

- Add more platform adapters (AtCoder, CodeChef)
- Add background workers/queues for scraping with Redis + Bull
- Add collaborative recommendation features and ML-based difficulty prediction
- Add tests and CI pipelines (GitHub Actions)
- Add Docker Compose dev stack and a `concurrently` script for dev convenience

---

Troubleshooting & notes

- If the frontend fails during Vite pre-bundling, check for missing exports in `frontend/src/api/*.js` vs imports in `pages/`.
- Mongoose duplicate-index warnings mean a model defines the same index in two ways (remove duplicate `schema.index()` or `index:true`). These are warnings but should be cleaned up before production.

---

Contributing

1. Fork the repo and create a feature branch
2. Add tests where appropriate
3. Submit a PR with a clear description and link to a demo (if applicable)

---

If you want, I can also:
- add a `.env.example` file
- add a `concurrently` script to `package.json` to run both servers from root
- add a `docker-compose.yml` example that runs `mongo` + `redis` + backend for local dev

Tell me which you'd prefer next.
# SkillGraph — Competitive Programming Progress Tracker

SkillGraph is a full-stack web application that helps competitive programmers track contest history, generate personalized practice recommendations, analyze tag-level strengths/weaknesses, and visualize rating progress across multiple platforms (initially Codeforces and LeetCode).

This repository contains a Node/Express backend and a React + Vite frontend with Tailwind CSS. It is designed for local development (Docker files are included but not required).

---

**Contents of this README**
- Problem statement
- Features
- Tech stack
- Getting started (run locally)
- Environment variables
- File structure and explanation
- Future scope
- Contributing

---

**Problem statement**

Competitive programmers often use multiple platforms and need a single unified view of their contest history, strengths/weaknesses by tag, and tailored practice recommendations. SkillGraph aggregates contest and submission data, analyzes performance, and provides actionable practice suggestions and visualizations so users can improve efficiently.

**Who this helps**
- Individual competitive programmers tracking progress
- Coaches and coding teams monitoring multiple users
- Learners seeking targeted study plans

---

## Features

- Aggregate contest history and rating progression for Codeforces and LeetCode
- Upsolve analysis: detect problems solved during contest vs upsolved later
- Tag analysis: per-tag attempt/solve statistics and weak-tag detection
- Personalized recommendations filtered by rating and weak tags
- Visualizations: rating timeline, distribution of rating changes, derived stats
- Auth scaffolding (JWT), user models, and submission history endpoints
- Admin endpoints for test/problem creation and management

---

## Tech stack

- Backend: Node.js, Express, Mongoose (MongoDB), node-cron
- Frontend: React, Vite, Tailwind CSS, Chart.js
- HTTP clients: fetch / axios
- Dev tools: nodemon, eslint

---

## Quick start (local development)

1) Install dependencies (two terminals recommended)

Backend:
```bash
cd backend
npm install
npm run dev   # runs nodemon server.js
```

Frontend:
```bash
cd frontend
npm install
npm run dev   # starts Vite at http://localhost:5173
```

Alternatively from project root (open two terminals):
```bash
npm run start-backend
npm run start-frontend
```

Health checks:
```bash
curl http://localhost:5001/health
curl http://localhost:5173/
```

Note: If you don't have a MongoDB connection for development, the backend will start without DB connection (see `backend/config/db.js`). To enable DB features set `MONGODB_URI` in your environment.

---

## Environment variables

Create a `.env` file in `backend/` with values like:

- `PORT` (optional, defaults to 5001)
- `MONGODB_URI` (MongoDB connection string)
- `JWT_SECRET` (for authentication)

Example `.env`:
```
PORT=5001
MONGODB_URI=mongodb://localhost:27017/skillgraph
JWT_SECRET=changeme
```

---

## File structure (high level)

The repository is split into `backend/` and `frontend/`. Below is a concise explanation of the important folders and files.

- `backend/`
  - `server.js` — Express app entry point, routes mount, health check, starts scheduler
  - `package.json` — backend scripts and deps
  - `config/` — DB connection and other configuration helpers (`db.js`)
  - `controllers/` — Express controllers for routes (auth, codeforces, contests, problems, submissions)
  - `models/` — Mongoose models (User, Problem, Test, SubmissionHistory, etc.)
  - `routes/` — Route definitions grouped by feature
  - `services/` — Third-party API integrations and business logic (e.g., `codeforcesServices.js`)
  - `utils/` — Helpers and background tasks (`contestScheduler.js`, `helpers.js`)
  - `middlewares/` — Request middleware (auth, admin checks, test checks)

- `frontend/`
  - `index.html` — Vite entry HTML
  - `src/` — React source code
    - `main.jsx` — React entry, router mount
    - `App.jsx` — top-level app shell
    - `pages/` — Page views (Dashboard, Contest, History, Practice, Auth)
    - `components/` — Reusable UI (dashboard cards, contest UI, code editor)
    - `api/` — Frontend API clients (`platformAPIs.js`, `practiceApi.js`, `auth.js`)
    - `services/` — Cross-cutting frontend services
    - `hooks/` — Custom React hooks
    - `assets/` — Static assets
  - `package.json` — frontend scripts and deps

Other files:
- `docker/` — Dockerfiles and judge image (optional)
- `docker-compose.yml` — compose configuration (optional)

File structure tips
- Controllers should be thin: move heavy logic to `services/` (easier to test)
- Keep API endpoints stable under `backend/routes` and version them if adding breaking changes

---

## Future scope and roadmap

- Add more platforms (AtCoder, HackerRank, CodeChef) and unify APIs
- Improve recommendation engine with collaborative filtering and performance forecasting
- Add background workers and queues for rate-limited platform scraping
- Add user profiles with goal tracking, streaks, and adaptive daily practice
- Add tests (unit/integration) and CI pipeline
- Docker Compose for easy local environment with MongoDB

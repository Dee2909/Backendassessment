# Finance Dashboard — Full Stack

A production-ready finance dashboard with role-based access control, real-time analytics, and a premium React UI.

**Live Stack:**
- **Frontend:** Vercel (React + Vite + Tailwind CSS v4)
- **Backend:** Render (Node.js + Express + Prisma)
- **Database:** Neon PostgreSQL (serverless)

---

## 🚀 Deployment Guide

### 1. Deploy Backend to Render

1. Go to [render.com](https://render.com) → **New → Web Service**
2. Connect your GitHub repo: `Dee2909/Backendassessment`
3. Configure the service:

| Setting | Value |
|---|---|
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npx prisma generate` |
| **Start Command** | `npm start` |

4. Add **Environment Variables** (in Render dashboard → Environment):

| Key | Value |
|---|---|
| `DATABASE_URL` | Your Neon PostgreSQL URL |
| `JWT_SECRET` | A long random secret string |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | *(add after Vercel deploy — your Vercel URL)* |

5. Click **Deploy** — Render will give you a URL like `https://finance-dashboard-api.onrender.com`

6. **Seed the database** (one time, from your local machine):
```bash
cd backend
npm run db:seed
```

---

### 2. Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo: `Dee2909/Backendassessment`
3. Configure the project:

| Setting | Value |
|---|---|
| **Root Directory** | `frontend` |
| **Framework Preset** | `Vite` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

4. Add **Environment Variable**:

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://your-backend.onrender.com/api` |

5. Click **Deploy** — Vercel gives you a URL like `https://finance-dashboard.vercel.app`

---

### 3. Link Backend CORS to Frontend

Once you have your Vercel URL, go back to **Render → Environment Variables** and set:

```
FRONTEND_URL = https://finance-dashboard.vercel.app
```

Then **redeploy** the backend service.

---

## 🏃 Local Development

### Backend
```bash
cd backend
npm install
npx prisma generate
npm run db:push    # sync schema to DB
npm run db:seed    # create test users + records
npm run dev        # starts with nodemon on port 5001
```

### Frontend
```bash
cd frontend
npm install
npm run dev        # starts Vite dev server on port 5173
```

---

## 🔐 Test Credentials (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | admin@finance.com | admin123 |
| Analyst | analyst@finance.com | analyst123 |
| Viewer | viewer@finance.com | viewer123 |

---

## 🏗 Architecture

```
Backend Assessment/
├── backend/                  # Express + Prisma API
│   ├── prisma/schema.prisma  # PostgreSQL schema
│   ├── src/
│   │   ├── routes/           # auth, users, records, dashboard
│   │   ├── middleware/       # JWT auth, RBAC, error handling
│   │   ├── lib/              # validation, constants, helpers
│   │   └── index.js          # Express server entry point
│   └── .env.example
└── frontend/                 # React + Vite + Tailwind
    ├── src/
    │   ├── pages/            # Dashboard, Analytics, Records, Users, Login
    │   ├── components/       # Shared UI components
    │   ├── services/         # API client layer
    │   ├── hooks/            # useAuth, useToast
    │   └── context/          # Auth + Toast providers
    ├── vercel.json           # SPA routing config
    └── .env.example
```

---

## 📡 API Reference

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Login |
| POST | `/api/auth/register` | Public | Register |
| GET | `/api/auth/me` | Any | Current user |
| GET | `/api/dashboard/summary` | Any | Totals & balance |
| GET | `/api/dashboard/category` | Analyst, Admin | Category breakdown |
| GET | `/api/dashboard/monthly` | Analyst, Admin | Monthly trends |
| GET | `/api/dashboard/recent` | Any | Recent transactions |
| GET | `/api/records` | Any | Paginated records + filters |
| POST | `/api/records` | Admin | Create record |
| PATCH | `/api/records/:id` | Admin | Update record |
| DELETE | `/api/records/:id` | Admin | Delete record |
| GET | `/api/users` | Admin | All users |
| GET | `/api/users/summary` | Admin | User stats |
| POST | `/api/users` | Admin | Create user |
| PATCH | `/api/users/:id` | Admin | Update user |

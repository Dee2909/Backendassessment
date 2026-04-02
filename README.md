# Finance Dashboard

A full-stack finance data processing backend and dashboard UI built for the backend assessment. The project covers role-based access control, financial record CRUD, dashboard analytics, user status management, and an admin-facing control panel.

## Tech Stack

### Backend
- Node.js + Express.js
- PostgreSQL (Neon) with Prisma ORM
- JWT authentication with `jsonwebtoken`
- Password hashing with `bcryptjs`

### Frontend
- React + Vite
- Tailwind CSS
- Axios
- Recharts
- React Router

## Assignment Coverage

- User and role management with `Viewer`, `Analyst`, and `Admin`
- Active and inactive user status enforcement
- Finance record create, read, update, and delete flows
- Record filtering by date, category, type, and search term
- Dashboard summary APIs for totals, category breakdowns, monthly trends, and recent activity
- Backend validation and structured error responses
- Responsive frontend with role-aware views and an admin workspace

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL, or the provided Neon database URL

### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm start
```

The backend runs on `http://localhost:5001`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`.

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@finance.com | admin123 |
| Analyst | analyst@finance.com | analyst123 |
| Viewer | viewer@finance.com | viewer123 |

## API Summary

### Auth
- `POST /api/auth/register` - Public registration for Viewer accounts
- `POST /api/auth/login` - Authenticate and return JWT
- `GET /api/auth/me` - Return the authenticated user

### Users
- `GET /api/users` - Filtered and paginated user list (Admin only)
- `GET /api/users/summary` - Counts by role and status (Admin only)
- `POST /api/users` - Create user with role and status (Admin only)
- `PATCH /api/users/:id` - Update profile, role, status, or password (Admin only)

### Records
- `GET /api/records` - Filtered and paginated record list
- `GET /api/records/meta` - Available categories for forms and filters
- `POST /api/records` - Create record (Admin only)
- `PATCH /api/records/:id` - Update record (Admin only)
- `DELETE /api/records/:id` - Delete record (Admin only)

### Dashboard
- `GET /api/dashboard/summary` - Total income, total expense, net balance, record count, recent activity count
- `GET /api/dashboard/category` - Category totals and counts (Analyst/Admin)
- `GET /api/dashboard/monthly` - Monthly income and expense trends (Analyst/Admin)
- `GET /api/dashboard/recent` - Recent transaction feed

## Role Permissions

| Feature | Viewer | Analyst | Admin |
|---------|--------|---------|-------|
| View summary metrics | ✓ | ✓ | ✓ |
| View analytics charts | | ✓ | ✓ |
| View records | ✓ | ✓ | ✓ |
| Search and filter records | ✓ | ✓ | ✓ |
| Create or edit records | | | ✓ |
| Delete records | | | ✓ |
| Manage users and access | | | ✓ |

## Environment Variables

### Backend `.env`

```bash
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
PORT=5001
```

### Frontend

Optional:

```bash
VITE_API_URL=http://localhost:5001/api
```

## Notes

- `npm run db:seed` creates one user for each role and resets the sample finance records.
- Inactive users cannot log in or use protected APIs.
- The Admin screen is the main place to demonstrate user management and record write access.
- Public registration creates Viewer accounts only. Elevated roles are managed by admins.
# Backendassessment

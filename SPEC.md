# Finance Dashboard - Technical Specification

## 1. Project Overview

- **Project Name**: Finance Dashboard
- **Type**: Full-stack Web Application
- **Core Functionality**: A role-based finance dashboard for managing financial records with authentication, analytics, and CRUD operations
- **Target Users**: Finance teams - Viewers (read-only), Analysts (analytics), Admins (full control)

---

## 2. Tech Stack

### Backend
- Node.js + Express.js
- PostgreSQL with Prisma ORM
- JWT Authentication (jsonwebtoken + bcryptjs)

### Frontend
- React.js with Vite
- Tailwind CSS
- Axios for HTTP requests
- Recharts for visualizations

---

## 3. UI/UX Specification

### Color Palette
- **Primary**: `#0F172A` (slate-900 - sidebar/nav)
- **Secondary**: `#1E293B` (slate-800 - cards)
- **Accent**: `#10B981` (emerald-500 - income/positive)
- **Danger**: `#EF4444` (red-500 - expense/negative)
- **Background**: `#F8FAFC` (slate-50 - main bg)
- **Text Primary**: `#1E293B` (slate-800)
- **Text Secondary**: `#64748B` (slate-500)
- **Border**: `#E2E8F0` (slate-200)

### Typography
- **Font Family**: Inter (system fallback)
- **Headings**: 24px (h1), 20px (h2), 16px (h3) - font-semibold
- **Body**: 14px - font-normal
- **Small**: 12px

### Spacing System
- Base unit: 4px
- Padding: 16px (cards), 24px (page)
- Margins: 16px between cards
- Border radius: 8px (cards), 6px (inputs/buttons)

### Layout Structure
- **Sidebar**: Fixed left, 240px width, dark theme
- **Main Content**: Fluid, padding 24px
- **Cards**: White bg, shadow-sm, border-radius 8px
- **Responsive**: Sidebar collapses to hamburger on mobile (<768px)

---

## 4. Page Specifications

### 4.1 Login Page
- Centered card (400px max-width)
- Logo/title at top
- Email input with icon
- Password input with icon
- Submit button (full-width, primary color)
- Link to register (if applicable)
- Error message display area

### 4.2 Dashboard Page
- **Summary Cards Row**: 3 cards showing Total Income, Total Expense, Net Balance
- **Charts Row**: 2 cards side by side
  - Left: Category pie chart (income categories)
  - Right: Monthly trend bar chart (last 6 months)
- **Recent Transactions**: Table showing last 5 records

### 4.3 Records Page
- **Header**: Title + "Add Record" button (Admin only)
- **Filters Bar**: Date range, Category dropdown, Type dropdown, Search input
- **Table**: Columns - Date, Category, Type, Amount, Notes, Actions
- **Pagination**: Page numbers + prev/next

### 4.4 Admin Panel
- **Users Tab**: Table of users with role badges
- **Records Tab**: Full CRUD interface
- Edit/Delete actions per row

---

## 5. Components

### Sidebar
- Logo/brand at top
- Navigation items with icons
- Active state: bg-emerald-500/10, text-emerald-500
- User info at bottom with logout button

### DataTable
- Striped rows (alternating slate-50/white)
- Hover state: bg-slate-50
- Sortable headers
- Action buttons (edit/delete) for Admin

### StatCard
- Icon (emerald/red based on type)
- Label (small, secondary color)
- Value (large, bold)
- Optional trend indicator

### Modal
- Centered overlay
- White card with close button
- Form fields with labels
- Save/Cancel buttons

### Chart Components
- Consistent color scheme
- Tooltips on hover
- Legend below/beside chart
- Loading skeleton while data loads

---

## 6. API Endpoints

### Auth
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login, returns JWT

### Records
- `GET /api/records` - Get all records (filtered)
- `POST /api/records` - Create record (Admin)
- `PATCH /api/records/:id` - Update record (Admin)
- `DELETE /api/roles/:id` - Delete record (Admin)

### Dashboard
- `GET /api/dashboard/summary` - Total income/expense/balance
- `GET /api/dashboard/category` - Category breakdown
- `GET /api/dashboard/monthly` - Monthly trends (6 months)

---

## 7. Access Control

### Roles
| Role | Permissions |
|------|-------------|
| Viewer | View dashboard, View records |
| Analyst | Viewer + View analytics |
| Admin | Full CRUD on records, View all |

### Middleware
- `authenticateJWT` - Verify token
- `authorizeRole(...roles)` - Check role permissions

---

## 8. Database Schema

### User
- id: UUID (primary key)
- name: String
- email: String (unique)
- password: String (hashed)
- role: Enum (Viewer, Analyst, Admin)
- status: String (active/inactive)
- createdAt: DateTime

### Record
- id: UUID (primary key)
- userId: UUID (foreign key)
- amount: Decimal
- type: Enum (income, expense)
- category: String
- date: DateTime
- notes: String (optional)
- createdAt: DateTime

---

## 9. Acceptance Criteria

- [ ] User can register and login
- [ ] JWT stored in localStorage
- [ ] Protected routes redirect to login
- [ ] Viewer sees dashboard and records (read-only)
- [ ] Analyst sees analytics on dashboard
- [ ] Admin can add/edit/delete records
- [ ] Dashboard shows correct totals
- [ ] Charts render with real data
- [ ] Records table is filterable and paginated
- [ ] Responsive on mobile devices
- [ ] Error states handled gracefully
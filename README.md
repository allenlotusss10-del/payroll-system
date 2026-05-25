# 💼 PayrollPro — HR & Payroll Management System

A full-stack **MERN** (MongoDB, Express, React, Node.js) application for managing employee records and payroll processing, built for the **Isaii MERN Stack Developer Intern** assessment.

---

## ✨ Features

| Module | Features |
|--------|----------|
| **Authentication** | JWT login/register, role-based access (admin, hr, viewer), protected routes |
| **Dashboard** | Live stats (headcount, payroll totals, paid/pending), department breakdown, recent payrolls |
| **Employees** | Full CRUD, search by name/ID/email, filter by department & status, auto Employee ID generation |
| **Payroll** | View records by month/year/status, mark as paid, delete pending, salary slip modal |
| **Generate Payroll** | Auto-calculates HRA/DA/PF/Tax, live salary preview, extra allowance/deduction overrides |

---

## 🗂️ Project Structure

```
payroll-system/
├── backend/
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js   # Register, login, getMe
│   │   ├── employeeController.js
│   │   ├── payrollController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   └── auth.js             # JWT protect + adminOnly guards
│   ├── models/
│   │   ├── User.js
│   │   ├── Employee.js
│   │   └── Payroll.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── employees.js
│   │   ├── payroll.js
│   │   └── dashboard.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axios.js         # Axios instance with JWT interceptor
    │   ├── components/
    │   │   ├── Layout.jsx
    │   │   ├── Sidebar.jsx
    │   │   └── PrivateRoute.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx  # Global auth state
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Employees.jsx
    │   │   ├── Payroll.jsx
    │   │   └── GeneratePayroll.jsx
    │   ├── App.jsx              # Routes
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## ⚙️ Prerequisites

Make sure you have these installed:

- **Node.js** v18+ → https://nodejs.org
- **MongoDB** running locally → https://www.mongodb.com/try/download/community
  - Or use a free cloud instance at https://cloud.mongodb.com
- **Git** → https://git-scm.com

---

## 🚀 Local Setup & Run

### Step 1 — Clone the repo

```bash
git clone <your-repo-url>
cd payroll-system
```

### Step 2 — Setup the Backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and fill in:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/payrollpro
JWT_SECRET=any_long_random_string_here
```

Start the backend:

```bash
npm run dev        # development (with nodemon)
# or
npm start          # production
```

> ✅ You should see: `🚀 Server running on http://localhost:5000` and `✅ MongoDB Connected`

### Step 3 — Setup the Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

> ✅ App opens at **http://localhost:3000**

---

## 🔐 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Backend server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/payrollpro` |
| `JWT_SECRET` | Secret key for JWT signing | `mySuperSecret123` |

---

## 📡 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Employees (protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees` | List all (supports ?search, ?department, ?status) |
| POST | `/api/employees` | Add employee |
| PUT | `/api/employees/:id` | Update employee |
| DELETE | `/api/employees/:id` | Delete employee |

### Payroll (protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payroll` | List records (supports ?month, ?year, ?status) |
| POST | `/api/payroll/generate` | Generate new payroll |
| PATCH | `/api/payroll/:id/pay` | Mark as paid |
| DELETE | `/api/payroll/:id` | Delete (pending only) |

### Dashboard (protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Aggregated stats |

---

## 💡 Salary Calculation Logic

```
Gross = Basic + HRA (40%) + DA (10%) + Medical (₹1500) + Other Allowances (5%)
PF Deduction = 12% of Basic
Tax Deduction = 10% of Gross (if Gross > ₹50,000)
Net Salary = Gross - Total Deductions
```

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, React Router v6, Vite, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Styling | Pure CSS with CSS Variables |

---

## 🔒 Security Notes

- Passwords are hashed with **bcryptjs** before storing
- All API routes (except login/register) are **JWT protected**
- `.env` is gitignored — never commit real credentials

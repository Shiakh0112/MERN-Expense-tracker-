# ExpenseTrack — Full Stack Expense Management System

A full-stack expense tracking application with role-based access control, real-time budget alerts, PDF/Excel export, email notifications, dark mode, PWA support, and activity logging.

---

## 🔗 Live Demo

| | URL |
|---|---|
| **Frontend** | https://mern-expense-tracker-two.vercel.app |
| **Backend API** | https://mern-expense-tracker-chqc.onrender.com |
| **Git Repo** | https://github.com/Shiakh0112/MERN-Expense-tracker- |

---

## 🔐 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | khanashfaq9423@gmail.com | Shaikh0112 |
| **Member** | khatikashfaq992@gmail.com | Shaikh0112 |
| **Viewer** | ashfaqkhatik5109@gmail.com | Shaikh0112 |

---

## Tech Stack

**Frontend**
- React 18 + Vite
- Redux Toolkit (state management)
- Tailwind CSS (styling + dark mode)
- Recharts (charts)
- React Router v6
- Axios
- jsPDF + jspdf-autotable (PDF export)
- XLSX (Excel export)
- React Hot Toast
- React Icons
- vite-plugin-pwa (PWA)

**Backend**
- Node.js + Express 5
- MongoDB + Mongoose 9
- JWT Authentication
- bcryptjs (password hashing)
- Nodemailer (email notifications)
- Cloudinary + Multer (file uploads)
- Morgan (logging)

---

## Features

### Authentication
- Register / Login with JWT
- Role-based access: **Admin**, **Member**, **Viewer**
- Persistent login via localStorage

### Role Permissions
| Feature | Admin | Member | Viewer |
|---|---|---|---|
| View expenses | ✅ All users | ✅ Own only | ✅ Own only |
| Add expense | ✅ | ✅ | ❌ |
| Delete expense | ✅ Any | ✅ Own only | ❌ |
| Approve / Reject | ✅ | ❌ | ❌ |
| Manage categories | ✅ | ❌ | ❌ |
| View activity log | ✅ | ❌ | ❌ |

### Expense Management
- Create, update, delete expenses
- Filter by category, status, date range, search
- Infinite scroll pagination
- Receipt upload (image / PDF) via Cloudinary
- Status: Pending → Approved / Rejected

### Export
- Export to **PDF** (styled with jsPDF)
- Export to **Excel** (XLSX)

### Budget Alerts
- Set monthly budget limit
- Progress bar showing usage
- Warning at 80% usage
- Alert when budget exceeded

### Email Notifications
- Auto email to user when Admin approves or rejects expense
- HTML email template via Nodemailer + Gmail

### Dynamic Categories
- Default categories: Food, Travel, Salary, Office, Other
- Admin can add custom categories with icons
- Admin can delete custom categories (defaults protected)
- Categories sync across all dropdowns and filters

### Dashboard
- Total, Approved, Pending, Rejected stat cards
- Monthly expenses bar chart
- Category breakdown pie chart
- Budget status widget

### Profile
- Update name and password
- Upload avatar (Cloudinary)

### Activity Log (Admin only)
- Tracks: Register, Login, Expense Created, Deleted, Approved, Rejected
- Shows user name, email, action, details, IP, timestamp

### Dark Mode
- Toggle in sidebar
- Persisted in localStorage
- Full dark mode via Tailwind `dark:` classes

### PWA
- Installable on mobile and desktop
- Auto update via vite-plugin-pwa

---

## Project Structure

```
exprence tracker/
├── backend/
│   ├── config/
│   │   ├── db.js
│   │   └── cloudinary.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── expenseController.js
│   │   ├── budgetController.js
│   │   ├── categoryController.js
│   │   ├── activityController.js
│   │   ├── profileController.js
│   │   └── teamController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Expense.js
│   │   ├── Team.js
│   │   ├── Budget.js
│   │   ├── Category.js
│   │   └── ActivityLog.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── expenseRoutes.js
│   │   ├── budgetRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── activityRoutes.js
│   │   ├── profileRoutes.js
│   │   └── teamRoutes.js
│   ├── utils/
│   │   ├── asyncHandler.js
│   │   ├── generateToken.js
│   │   └── emailService.js
│   ├── .env
│   └── server.js
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── Layout.jsx
    │   │   │   └── Sidebar.jsx
    │   │   ├── expenses/
    │   │   │   └── ExpenseModal.jsx
    │   │   ├── CategoryIcon.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── hooks/
    │   │   └── useDarkMode.js
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── ExpenseList.jsx
    │   │   ├── AddExpense.jsx
    │   │   ├── Profile.jsx
    │   │   └── ActivityLog.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── store/
    │   │   ├── slices/
    │   │   │   ├── authSlice.js
    │   │   │   ├── expenseSlice.js
    │   │   │   └── categorySlice.js
    │   │   └── store.js
    │   ├── utils/
    │   │   └── exportUtils.js
    │   ├── App.jsx
    │   └── main.jsx
    ├── .env
    ├── vercel.json
    └── vite.config.js
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Cloudinary account
- Gmail account (for email notifications)

### Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

CLIENT_URL=http://localhost:5173,https://your-frontend.vercel.app

EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password

NODE_ENV=development
```

```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

---

## API Endpoints

### Auth
| Method | Endpoint | Access |
|---|---|---|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| GET | /api/auth/me | Protected |

### Expenses
| Method | Endpoint | Access |
|---|---|---|
| POST | /api/expenses/create | Admin, Member |
| GET | /api/expenses/my-expenses | All |
| PUT | /api/expenses/update/:id | Admin, Member |
| DELETE | /api/expenses/delete/:id | Admin, Member |
| GET | /api/expenses/monthly-report | All |
| GET | /api/expenses/category-summary | All |
| GET | /api/expenses/total | All |
| POST | /api/expenses/upload-receipt | Admin, Member |

### Budget
| Method | Endpoint | Access |
|---|---|---|
| POST | /api/budget/set | All |
| GET | /api/budget/status | All |

### Categories
| Method | Endpoint | Access |
|---|---|---|
| GET | /api/categories | All |
| POST | /api/categories | Admin |
| DELETE | /api/categories/:id | Admin |

### Profile
| Method | Endpoint | Access |
|---|---|---|
| PUT | /api/profile/update | All |

### Activity Log
| Method | Endpoint | Access |
|---|---|---|
| GET | /api/activity | Admin |

---

## Deployment

### Frontend — Vercel
1. Push `frontend/` folder to GitHub
2. Import in Vercel
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`
6. `vercel.json` handles SPA routing automatically

### Backend — Render
1. Push `backend/` folder to GitHub
2. Import in Render as Web Service
3. Start command: `node server.js`
4. Add all `.env` variables in Render dashboard

---

## Gmail App Password Setup

1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Go to App Passwords
4. Select "Mail" → Generate
5. Copy the 16-character password → use as `EMAIL_PASS`

---

## License

MIT

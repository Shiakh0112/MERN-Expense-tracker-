require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const teamRoutes = require("./routes/teamRoutes");
const budgetRoutes = require("./routes/budgetRoutes");
const activityRoutes = require("./routes/activityRoutes");
const profileRoutes = require("./routes/profileRoutes");
const categoryRoutes = require("./routes/categoryRoutes");

connectDB();

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173,https://mern-expense-tracker-two.vercel.app").split(",");
app.use(cors({
  origin: (origin, cb) => cb(null, !origin || allowedOrigins.includes(origin)),
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/budget", budgetRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/categories", categoryRoutes);

app.get("/", (req, res) => res.json({ message: "Expense Tracker API Running" }));

// 404 handler
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`));

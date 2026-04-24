const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const { upload } = require("../config/cloudinary");
const {
  createExpense,
  getMyExpenses,
  getTeamExpenses,
  updateExpense,
  deleteExpense,
  getMonthlyReport,
  getCategorySummary,
  getTotalExpenses,
  uploadReceipt,
} = require("../controllers/expenseController");

// Viewer cannot create/update/delete
router.post("/create", protect, authorize("Admin", "Member"), createExpense);
router.get("/my-expenses", protect, getMyExpenses);
router.get("/team/:teamId", protect, getTeamExpenses);
router.put("/update/:expenseId", protect, authorize("Admin", "Member"), updateExpense);
router.delete("/delete/:expenseId", protect, authorize("Admin", "Member"), deleteExpense);

// Analytics
router.get("/monthly-report", protect, getMonthlyReport);
router.get("/category-summary", protect, getCategorySummary);
router.get("/total", protect, getTotalExpenses);

// File upload
router.post("/upload-receipt", protect, authorize("Admin", "Member"), upload.single("receipt"), uploadReceipt);

module.exports = router;

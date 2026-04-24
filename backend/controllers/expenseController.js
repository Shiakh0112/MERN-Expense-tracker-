const mongoose = require("mongoose");
const Expense = require("../models/Expense");
const Team = require("../models/Team");
const User = require("../models/User");
const { cloudinary } = require("../config/cloudinary");
const { sendExpenseStatusEmail } = require("../utils/emailService");
const { logActivity } = require("./activityController");
const { Types } = mongoose;

// @POST /api/expenses/create
const createExpense = async (req, res) => {
  const { title, amount, category, description, date, teamId } = req.body;

  if (!title || !amount || !category || !date)
    return res.status(400).json({ message: "title, amount, category, date are required" });

  if (teamId) {
    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });
  }

  const expense = await Expense.create({
    title,
    amount,
    category,
    description,
    date,
    createdBy: req.user._id,
    teamId: teamId || null,
    receiptUrl: req.body.receiptUrl || null,
    receiptPublicId: req.body.receiptPublicId || null,
  });

  res.status(201).json(expense);
  logActivity(req.user._id, "Expense Created", `"${title}" - PKR ${amount}`, req.ip);
};

// @GET /api/expenses/my-expenses
const getMyExpenses = async (req, res) => {
  const { category, status, startDate, endDate, search, page = 1, limit = 10 } = req.query;

  const filter = req.user.role === "Admin" ? {} : { createdBy: req.user._id };
  if (category) filter.category = category;
  if (status) filter.status = status;
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }
  if (search) filter.title = { $regex: search, $options: "i" };

  const total = await Expense.countDocuments(filter);
  const expenses = await Expense.find(filter)
    .populate("teamId", "name")
    .populate("createdBy", "name email")
    .sort({ date: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({ expenses, total, page: Number(page), pages: Math.ceil(total / limit) });
};

// @GET /api/expenses/team/:teamId
const getTeamExpenses = async (req, res) => {
  const { teamId } = req.params;
  const { category, status, startDate, endDate, search, page = 1, limit = 10 } = req.query;

  const team = await Team.findById(teamId);
  if (!team) return res.status(404).json({ message: "Team not found" });

  const isMember =
    req.user.role === "Admin" ||
    team.members.some((m) => m.toString() === req.user._id.toString()) ||
    team.createdBy.toString() === req.user._id.toString();

  if (!isMember) return res.status(403).json({ message: "Not a team member" });

  const filter = { teamId };
  if (category) filter.category = category;
  if (status) filter.status = status;
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }
  if (search) filter.title = { $regex: search, $options: "i" };

  const total = await Expense.countDocuments(filter);
  const expenses = await Expense.find(filter)
    .populate("createdBy", "name email")
    .sort({ date: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({ expenses, total, page: Number(page), pages: Math.ceil(total / limit) });
};

// @PUT /api/expenses/update/:expenseId
const updateExpense = async (req, res) => {
  const expense = await Expense.findById(req.params.expenseId);
  if (!expense) return res.status(404).json({ message: "Expense not found" });

  const isOwner = expense.createdBy.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "Admin";

  if (!isOwner && !isAdmin)
    return res.status(403).json({ message: "Not authorized to update this expense" });

  // Only admin can change status
  if (req.body.status && !isAdmin)
    return res.status(403).json({ message: "Only Admin can change status" });

  const { title, amount, category, description, date, teamId, receiptUrl, receiptPublicId, status } = req.body;

  const updateData = { title, amount, category, description, date, teamId, receiptUrl, receiptPublicId };
  // Remove undefined keys
  Object.keys(updateData).forEach((k) => updateData[k] === undefined && delete updateData[k]);
  if (status && isAdmin) updateData.status = status;

  const updated = await Expense.findByIdAndUpdate(req.params.expenseId, updateData, {
    new: true,
    runValidators: true,
  });

  // Send email if admin changed status
  if (status && isAdmin && (status === "Approved" || status === "Rejected")) {
    const owner = await User.findById(expense.createdBy);
    if (owner) {
      sendExpenseStatusEmail({
        to: owner.email,
        name: owner.name,
        title: expense.title,
        amount: expense.amount,
        status,
      }).catch(() => {});
    }
    logActivity(req.user._id, `Expense ${status}`, `"${expense.title}" marked ${status}`, req.ip);
  }

  res.json(updated);
};

// @DELETE /api/expenses/delete/:expenseId
const deleteExpense = async (req, res) => {
  const expense = await Expense.findById(req.params.expenseId);
  if (!expense) return res.status(404).json({ message: "Expense not found" });

  const isOwner = expense.createdBy.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "Admin";

  if (!isOwner && !isAdmin)
    return res.status(403).json({ message: "Not authorized to delete this expense" });

  // Delete receipt from Cloudinary if exists
  if (expense.receiptPublicId) {
    await cloudinary.uploader.destroy(expense.receiptPublicId, { resource_type: "auto" });
  }

  await expense.deleteOne();
  logActivity(req.user._id, "Expense Deleted", `"${expense.title}"`, req.ip);
  res.json({ message: "Expense deleted successfully" });
};

// @GET /api/expenses/monthly-report
const getMonthlyReport = async (req, res) => {
  const { year = new Date().getFullYear(), teamId } = req.query;

  const matchStage = {
    createdBy: req.user._id,
    date: {
      $gte: new Date(`${year}-01-01`),
      $lte: new Date(`${year}-12-31`),
    },
  };
  if (teamId) matchStage.teamId = new Types.ObjectId(teamId);

  const report = await Expense.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: { month: { $month: "$date" }, year: { $year: "$date" } },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.month": 1 } },
  ]);

  res.json(report);
};

// @GET /api/expenses/category-summary
const getCategorySummary = async (req, res) => {
  const { startDate, endDate, teamId } = req.query;

  const matchStage = { createdBy: req.user._id };
  if (startDate || endDate) {
    matchStage.date = {};
    if (startDate) matchStage.date.$gte = new Date(startDate);
    if (endDate) matchStage.date.$lte = new Date(endDate);
  }
  if (teamId) matchStage.teamId = new Types.ObjectId(teamId);

  const summary = await Expense.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$category",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
  ]);

  res.json(summary);
};

// @GET /api/expenses/total
const getTotalExpenses = async (req, res) => {
  const { startDate, endDate, teamId } = req.query;

  const matchStage = { createdBy: req.user._id };
  if (startDate || endDate) {
    matchStage.date = {};
    if (startDate) matchStage.date.$gte = new Date(startDate);
    if (endDate) matchStage.date.$lte = new Date(endDate);
  }
  if (teamId) matchStage.teamId = new Types.ObjectId(teamId);

  const result = await Expense.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$amount" },
        totalCount: { $sum: 1 },
        approved: { $sum: { $cond: [{ $eq: ["$status", "Approved"] }, "$amount", 0] } },
        pending: { $sum: { $cond: [{ $eq: ["$status", "Pending"] }, "$amount", 0] } },
        rejected: { $sum: { $cond: [{ $eq: ["$status", "Rejected"] }, "$amount", 0] } },
      },
    },
  ]);

  res.json(result[0] || { totalAmount: 0, totalCount: 0, approved: 0, pending: 0, rejected: 0 });
};

// @POST /api/expenses/upload-receipt
const uploadReceipt = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  res.json({
    receiptUrl: req.file.path,
    receiptPublicId: req.file.filename,
  });
};

module.exports = {
  createExpense,
  getMyExpenses,
  getTeamExpenses,
  updateExpense,
  deleteExpense,
  getMonthlyReport,
  getCategorySummary,
  getTotalExpenses,
  uploadReceipt,
};

const Budget = require("../models/Budget");
const Expense = require("../models/Expense");

// @POST /api/budget/set
const setBudget = async (req, res) => {
  const { monthlyLimit } = req.body;
  if (!monthlyLimit || monthlyLimit < 1)
    return res.status(400).json({ message: "Valid monthly limit required" });

  const budget = await Budget.findOneAndUpdate(
    { userId: req.user._id },
    { monthlyLimit },
    { upsert: true, new: true }
  );
  res.json(budget);
};

// @GET /api/budget/status
const getBudgetStatus = async (req, res) => {
  const budget = await Budget.findOne({ userId: req.user._id });
  if (!budget) return res.json({ budget: null, spent: 0, percentage: 0 });

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const result = await Expense.aggregate([
    {
      $match: {
        createdBy: req.user._id,
        date: { $gte: start, $lte: end },
        status: { $ne: "Rejected" },
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const spent = result[0]?.total || 0;
  const percentage = Math.round((spent / budget.monthlyLimit) * 100);

  res.json({ budget: budget.monthlyLimit, spent, percentage });
};

module.exports = { setBudget, getBudgetStatus };

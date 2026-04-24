const ActivityLog = require("../models/ActivityLog");

// @GET /api/activity  (Admin only)
const getActivityLogs = async (req, res) => {
  const logs = await ActivityLog.find()
    .populate("userId", "name email role")
    .sort({ createdAt: -1 })
    .limit(100);
  res.json(logs);
};

// Helper to log activity — used internally
const logActivity = async (userId, action, details = "", ip = "") => {
  try {
    await ActivityLog.create({ userId, action, details, ip });
  } catch (_) {}
};

module.exports = { getActivityLogs, logActivity };

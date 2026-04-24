const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const { getActivityLogs } = require("../controllers/activityController");

router.get("/", protect, authorize("Admin"), getActivityLogs);

module.exports = router;

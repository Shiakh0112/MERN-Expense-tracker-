const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { setBudget, getBudgetStatus } = require("../controllers/budgetController");

router.post("/set", protect, setBudget);
router.get("/status", protect, getBudgetStatus);

module.exports = router;

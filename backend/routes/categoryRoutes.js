const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const { getCategories, createCategory, deleteCategory } = require("../controllers/categoryController");

router.get("/", protect, getCategories);
router.post("/", protect, authorize("Admin"), createCategory);
router.delete("/:id", protect, authorize("Admin"), deleteCategory);

module.exports = router;

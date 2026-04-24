const Category = require("../models/Category");

const DEFAULT_CATEGORIES = [
  { name: "Food", icon: "MdRestaurant" },
  { name: "Travel", icon: "MdFlight" },
  { name: "Salary", icon: "MdAccountBalance" },
  { name: "Office", icon: "MdBusiness" },
  { name: "Other", icon: "MdCategory" },
];

// Seed defaults if empty
const seedDefaults = async () => {
  const count = await Category.countDocuments();
  if (count === 0) {
    await Category.insertMany(DEFAULT_CATEGORIES);
  }
};
seedDefaults();

// @GET /api/categories  — all users
const getCategories = async (req, res) => {
  const categories = await Category.find().sort({ createdAt: 1 });
  res.json(categories);
};

// @POST /api/categories  — Admin only
const createCategory = async (req, res) => {
  const { name, icon } = req.body;
  if (!name) return res.status(400).json({ message: "Category name required" });

  const exists = await Category.findOne({ name: { $regex: `^${name}$`, $options: "i" } });
  if (exists) return res.status(400).json({ message: "Category already exists" });

  const category = await Category.create({ name, icon: icon || "📦", createdBy: req.user._id });
  res.status(201).json(category);
};

// @DELETE /api/categories/:id  — Admin only
const deleteCategory = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ message: "Category not found" });

  const defaults = DEFAULT_CATEGORIES.map((c) => c.name);
  if (defaults.includes(category.name))
    return res.status(400).json({ message: "Default categories cannot be deleted" });

  await category.deleteOne();
  res.json({ message: "Category deleted" });
};

module.exports = { getCategories, createCategory, deleteCategory };

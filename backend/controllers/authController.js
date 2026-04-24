const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { logActivity } = require("./activityController");

// @POST /api/auth/register
const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: "All fields required" });

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: "Email already registered" });

  const user = await User.create({ name, email, password, role });
  logActivity(user._id, "Registered", `New ${role} account`, req.ip);
  res.status(201).json({
    user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    token: generateToken(user._id),
  });
};

// @POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password)))
    return res.status(401).json({ message: "Invalid credentials" });

  res.json({
    user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    token: generateToken(user._id),
  });
  logActivity(user._id, "Login", `Logged in`, req.ip);
};

// @GET /api/auth/me
const getMe = async (req, res) => {
  res.json(req.user);
};

module.exports = { register, login, getMe };

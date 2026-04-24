const User = require("../models/User");
const { cloudinary } = require("../config/cloudinary");

// @PUT /api/profile/update
const updateProfile = async (req, res) => {
  const { name, password } = req.body;
  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (password) {
    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    user.password = password;
  }

  if (req.file) {
    if (user.avatarPublicId) {
      await cloudinary.uploader.destroy(user.avatarPublicId);
    }
    user.avatar = req.file.path;
    user.avatarPublicId = req.file.filename;
  }

  await user.save();
  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar || null,
  });
};

module.exports = { updateProfile };

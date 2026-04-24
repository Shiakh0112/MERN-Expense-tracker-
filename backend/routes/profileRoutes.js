const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { upload } = require("../config/cloudinary");
const { updateProfile } = require("../controllers/profileController");

router.put("/update", protect, upload.single("avatar"), updateProfile);

module.exports = router;

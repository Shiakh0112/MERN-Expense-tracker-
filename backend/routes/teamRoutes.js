const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const { createTeam, getMyTeams, addMember } = require("../controllers/teamController");

router.post("/create", protect, authorize("Admin", "Member"), createTeam);
router.get("/my-teams", protect, getMyTeams);
router.post("/:teamId/add-member", protect, authorize("Admin"), addMember);

module.exports = router;

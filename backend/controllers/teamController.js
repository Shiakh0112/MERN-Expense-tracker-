const Team = require("../models/Team");
const User = require("../models/User");

// @POST /api/teams/create
const createTeam = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Team name required" });

  const team = await Team.create({ name, createdBy: req.user._id, members: [req.user._id] });
  res.status(201).json(team);
};

// @GET /api/teams/my-teams
const getMyTeams = async (req, res) => {
  const teams = await Team.find({
    $or: [{ createdBy: req.user._id }, { members: req.user._id }],
  }).populate("members", "name email role");
  res.json(teams);
};

// @POST /api/teams/:teamId/add-member
const addMember = async (req, res) => {
  const { email } = req.body;
  const team = await Team.findById(req.params.teamId);
  if (!team) return res.status(404).json({ message: "Team not found" });

  if (team.createdBy.toString() !== req.user._id.toString() && req.user.role !== "Admin")
    return res.status(403).json({ message: "Only team creator or Admin can add members" });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  if (team.members.includes(user._id))
    return res.status(400).json({ message: "User already in team" });

  team.members.push(user._id);
  await team.save();
  res.json({ message: "Member added", team });
};

module.exports = { createTeam, getMyTeams, addMember };

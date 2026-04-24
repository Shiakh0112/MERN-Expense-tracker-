const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    date: { type: Date, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", default: null },
    receiptUrl: { type: String, default: null },
    receiptPublicId: { type: String, default: null },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

// Indexes for performance
expenseSchema.index({ createdBy: 1 });
expenseSchema.index({ teamId: 1 });
expenseSchema.index({ date: -1 });
expenseSchema.index({ createdBy: 1, date: -1 });

module.exports = mongoose.model("Expense", expenseSchema);

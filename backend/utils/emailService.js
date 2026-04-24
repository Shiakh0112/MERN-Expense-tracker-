const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendExpenseStatusEmail = async ({ to, name, title, amount, status }) => {
  const color = status === "Approved" ? "#10b981" : "#ef4444";
  const emoji = status === "Approved" ? "✅" : "❌";

  await transporter.sendMail({
    from: `"ExpenseTrack" <${process.env.EMAIL_USER}>`,
    to,
    subject: `${emoji} Your expense "${title}" has been ${status}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
        <div style="background:${color};padding:24px;text-align:center">
          <h1 style="color:white;margin:0;font-size:22px">${emoji} Expense ${status}</h1>
        </div>
        <div style="padding:24px">
          <p style="color:#374151">Hi <strong>${name}</strong>,</p>
          <p style="color:#374151">Your expense has been <strong style="color:${color}">${status}</strong> by the Admin.</p>
          <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:16px 0">
            <p style="margin:4px 0;color:#6b7280;font-size:14px">Expense Title</p>
            <p style="margin:4px 0;color:#111827;font-weight:600">${title}</p>
            <p style="margin:12px 0 4px;color:#6b7280;font-size:14px">Amount</p>
            <p style="margin:4px 0;color:#111827;font-weight:600">PKR ${Number(amount).toLocaleString()}</p>
          </div>
          <p style="color:#9ca3af;font-size:12px;margin-top:24px">ExpenseTrack — Automated Notification</p>
        </div>
      </div>
    `,
  });
};

module.exports = { sendExpenseStatusEmail };

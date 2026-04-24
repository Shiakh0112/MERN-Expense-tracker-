import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMonthlyReport, fetchCategorySummary, fetchTotal,
  fetchBudgetStatus, setBudget,
} from "../store/slices/expenseSlice";
import { fetchCategories } from "../store/slices/categorySlice";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { MdAttachMoney, MdCheckCircle, MdPending, MdCancel, MdWarning } from "react-icons/md";
import toast from "react-hot-toast";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const COLORS = ["#6366f1","#f59e0b","#10b981","#ef4444","#8b5cf6"];

function StatCard({ icon, label, value, color }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-800">PKR {Number(value || 0).toLocaleString()}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const dispatch = useDispatch();
  const { monthlyReport, categorySummary, totals, budget, loading } = useSelector((s) => s.expenses);
  const { list: categories } = useSelector((s) => s.categories);
  const { user } = useSelector((s) => s.auth);
  const [budgetInput, setBudgetInput] = useState("");
  const [showBudgetForm, setShowBudgetForm] = useState(false);

  useEffect(() => {
    dispatch(fetchMonthlyReport({}));
    dispatch(fetchCategorySummary({}));
    dispatch(fetchTotal({}));
    dispatch(fetchBudgetStatus());
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleSetBudget = async (e) => {
    e.preventDefault();
    if (!budgetInput || budgetInput < 1) return toast.error("Enter valid amount");
    const res = await dispatch(setBudget(Number(budgetInput)));
    if (setBudget.fulfilled.match(res)) {
      toast.success("Budget set!");
      setShowBudgetForm(false);
      dispatch(fetchBudgetStatus());
    }
  };

  const barData = MONTHS.map((month, i) => {
    const found = monthlyReport.find((r) => r._id.month === i + 1);
    return { month, total: found?.total || 0 };
  });

  const pieData = categorySummary.map((c) => ({ name: c._id, value: c.total }));

  const budgetPct = budget?.percentage || 0;
  const budgetAlert = budget?.budget && budgetPct >= 80;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome back, {user?.name} 👋</h1>
          <p className="text-gray-500 text-sm mt-1">Here's your expense overview</p>
        </div>
        <button
          onClick={() => setShowBudgetForm((v) => !v)}
          className="btn-secondary text-sm"
        >
          {budget?.budget ? `Budget: PKR ${Number(budget.budget).toLocaleString()}` : "Set Monthly Budget"}
        </button>
      </div>

      {/* Budget Alert */}
      {budgetAlert && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${budgetPct >= 100 ? "bg-red-50 border-red-200 text-red-700" : "bg-yellow-50 border-yellow-200 text-yellow-700"}`}>
          <MdWarning size={22} />
          <div>
            <p className="font-semibold text-sm">
              {budgetPct >= 100 ? "Budget Exceeded!" : "Budget Warning!"}
            </p>
            <p className="text-xs">
              You've used PKR {Number(budget.spent).toLocaleString()} of PKR {Number(budget.budget).toLocaleString()} ({budgetPct}%)
            </p>
          </div>
          <div className="ml-auto w-32 bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${budgetPct >= 100 ? "bg-red-500" : "bg-yellow-500"}`}
              style={{ width: `${Math.min(budgetPct, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Budget progress (non-alert) */}
      {budget?.budget && !budgetAlert && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-green-50 border-green-200 text-green-700">
          <MdCheckCircle size={22} />
          <p className="text-sm">
            Budget: PKR {Number(budget.spent).toLocaleString()} / {Number(budget.budget).toLocaleString()} used ({budgetPct}%)
          </p>
          <div className="ml-auto w-32 bg-gray-200 rounded-full h-2">
            <div className="h-2 rounded-full bg-green-500" style={{ width: `${budgetPct}%` }} />
          </div>
        </div>
      )}

      {/* Budget Form */}
      {showBudgetForm && (
        <form onSubmit={handleSetBudget} className="card flex items-end gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Budget (PKR)</label>
            <input
              type="number"
              min="1"
              className="input"
              placeholder="e.g. 50000"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary">Save</button>
          <button type="button" className="btn-secondary" onClick={() => setShowBudgetForm(false)}>Cancel</button>
        </form>
      )}

      {loading && !totals ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<MdAttachMoney size={24} className="text-white" />} label="Total Expenses" value={totals?.totalAmount} color="bg-primary" />
            <StatCard icon={<MdCheckCircle size={24} className="text-white" />} label="Approved" value={totals?.approved} color="bg-green-500" />
            <StatCard icon={<MdPending size={24} className="text-white" />} label="Pending" value={totals?.pending} color="bg-yellow-500" />
            <StatCard icon={<MdCancel size={24} className="text-white" />} label="Rejected" value={totals?.rejected} color="bg-red-500" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="text-base font-semibold text-gray-700 mb-4">Monthly Expenses</h2>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => `PKR ${v.toLocaleString()}`} />
                  <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h2 className="text-base font-semibold text-gray-700 mb-4">Category Breakdown</h2>
              {pieData.length === 0 ? (
                <div className="flex items-center justify-center h-60 text-gray-400 text-sm">No data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => `PKR ${v.toLocaleString()}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

import { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyExpenses, updateExpense } from "../store/slices/expenseSlice";
import { fetchCategories } from "../store/slices/categorySlice";
import ExpenseModal from "../components/expenses/ExpenseModal";
import CategoryIcon from "../components/CategoryIcon";
import { Link } from "react-router-dom";
import { MdSearch, MdFilterList, MdAdd, MdPictureAsPdf, MdTableChart } from "react-icons/md";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { exportToPDF, exportToExcel } from "../utils/exportUtils";

const STATUSES = ["", "Pending", "Approved", "Rejected"];
const statusClass = { Pending: "badge-pending", Approved: "badge-approved", Rejected: "badge-rejected" };

export default function ExpenseList() {
  const dispatch = useDispatch();
  const { expenses, loading, total, pages, page } = useSelector((s) => s.expenses);
  const { user } = useSelector((s) => s.auth);
  const { list: categories } = useSelector((s) => s.categories);
  const isAdmin = user?.role === "Admin";
  const isViewer = user?.role === "Viewer";
  const [selected, setSelected] = useState(null);
  const [allExpenses, setAllExpenses] = useState([]);
  const [filters, setFilters] = useState({
    search: "", category: "", status: "", startDate: "", endDate: "", page: 1,
  });
  const observerRef = useRef(null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.category) params.category = filters.category;
    if (filters.status) params.status = filters.status;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    params.page = filters.page;
    params.limit = 10;
    dispatch(fetchMyExpenses(params));
  }, [filters, dispatch]);

  useEffect(() => {
    if (filters.page === 1) {
      setAllExpenses(expenses);
    } else {
      setAllExpenses((prev) => {
        const ids = new Set(prev.map((e) => e._id));
        return [...prev, ...expenses.filter((e) => !ids.has(e._id))];
      });
    }
  }, [expenses]);

  const setFilter = (key, value) => {
    setAllExpenses([]);
    setFilters((f) => ({ ...f, [key]: value, page: 1 }));
  };

  const lastRowRef = useCallback((node) => {
    if (loading) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && page < pages) {
        setFilters((f) => ({ ...f, page: f.page + 1 }));
      }
    });
    if (node) observerRef.current.observe(node);
  }, [loading, page, pages]);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">My Expenses</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} total records</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => { if (!allExpenses.length) return toast.error("No expenses to export"); exportToPDF(allExpenses, user?.name); }}
            className="btn-secondary flex items-center gap-1 text-sm text-red-600 border-red-200 hover:bg-red-50"
          >
            <MdPictureAsPdf size={18} /> PDF
          </button>
          <button
            onClick={() => { if (!allExpenses.length) return toast.error("No expenses to export"); exportToExcel(allExpenses, user?.name); }}
            className="btn-secondary flex items-center gap-1 text-sm text-green-600 border-green-200 hover:bg-green-50"
          >
            <MdTableChart size={18} /> Excel
          </button>
          {!isViewer && (
            <Link to="/add-expense" className="btn-primary flex items-center gap-1 text-sm">
              <MdAdd size={18} /> Add Expense
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input className="input pl-8" placeholder="Search by title..." value={filters.search} onChange={(e) => setFilter("search", e.target.value)} />
            </div>
          </div>

          <div className="min-w-[130px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
            <select className="input" value={filters.category} onChange={(e) => setFilter("category", e.target.value)}>
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="min-w-[120px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <select className="input" value={filters.status} onChange={(e) => setFilter("status", e.target.value)}>
              {STATUSES.map((s) => <option key={s} value={s}>{s || "All Status"}</option>)}
            </select>
          </div>
          <div className="min-w-[130px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
            <input type="date" className="input" value={filters.startDate} onChange={(e) => setFilter("startDate", e.target.value)} />
          </div>
          <div className="min-w-[130px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
            <input type="date" className="input" value={filters.endDate} onChange={(e) => setFilter("endDate", e.target.value)} />
          </div>
          <button
            className="btn-secondary flex items-center gap-1 text-sm"
            onClick={() => { setAllExpenses([]); setFilters({ search: "", category: "", status: "", startDate: "", endDate: "", page: 1 }); }}
          >
            <MdFilterList size={16} /> Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {allExpenses.length === 0 && !loading ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">No expenses found</p>
            <p className="text-sm mt-1">Try adjusting your filters or add a new expense</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
                <tr>
                  {["Title", "Category", "Amount", "Date", "Status", "Team", ...(isAdmin ? ["Created By", "Action"] : [])].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {allExpenses.map((exp, idx) => (
                  <tr
                    key={exp._id}
                    ref={idx === allExpenses.length - 1 ? lastRowRef : null}
                    onClick={() => setSelected(exp)}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{exp.title}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      <span className="flex items-center gap-1.5">
                        <CategoryIcon name={categories.find((c) => c.name === exp.category)?.icon} size={15} className="text-primary" />
                        {exp.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-100">PKR {Number(exp.amount).toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{format(new Date(exp.date), "dd MMM yyyy")}</td>
                    <td className="px-4 py-3"><span className={statusClass[exp.status]}>{exp.status}</span></td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{exp.teamId?.name || "—"}</td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-200">{exp.createdBy?.name || "—"}</p>
                          <p className="text-xs text-gray-400">{exp.createdBy?.email}</p>
                        </div>
                      </td>
                    )}
                    {isAdmin && (
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <select
                          className="text-xs border border-gray-200 rounded px-2 py-1 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                          value={exp.status}
                          onChange={async (e) => {
                            const res = await dispatch(updateExpense({ id: exp._id, data: { status: e.target.value } }));
                            if (updateExpense.fulfilled.match(res)) {
                              toast.success("Status updated");
                              dispatch(fetchMyExpenses({ page: filters.page }));
                            } else toast.error("Failed to update status");
                          }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {loading && (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {!loading && page >= pages && allExpenses.length > 0 && (
              <p className="text-center text-xs text-gray-400 py-4">All expenses loaded</p>
            )}
          </div>
        )}
      </div>

      {selected && <ExpenseModal expense={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

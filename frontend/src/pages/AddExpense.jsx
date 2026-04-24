import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createExpense, uploadReceipt } from "../store/slices/expenseSlice";
import { fetchCategories, addCategory, removeCategory } from "../store/slices/categorySlice";
import toast from "react-hot-toast";
import { MdCloudUpload, MdClose, MdAdd, MdDelete } from "react-icons/md";
import CategoryIcon, { AVAILABLE_ICONS } from "../components/CategoryIcon";

export default function AddExpense() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, uploadLoading } = useSelector((s) => s.expenses);
  const { list: categories } = useSelector((s) => s.categories);
  const { user } = useSelector((s) => s.auth);
  const isAdmin = user?.role === "Admin";

  const [form, setForm] = useState({
    title: "", amount: "", category: "",
    description: "", date: "", teamId: "",
    receiptUrl: "", receiptPublicId: "",
  });
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);

  // Admin: new category form
  const [showCatManager, setShowCatManager] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("MdCategory");

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Set default category once loaded
  useEffect(() => {
    if (categories.length && !form.category) {
      setForm((f) => ({ ...f, category: categories[0].name }));
    }
  }, [categories]);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(f.type)) return toast.error("Only images or PDF allowed");
    if (f.size > 5 * 1024 * 1024) return toast.error("File must be under 5MB");
    setFile(f);
    setPreview(f.type !== "application/pdf" ? URL.createObjectURL(f) : "pdf");
  };

  const handleUpload = async () => {
    if (!file) return toast.error("Select a file first");
    const fd = new FormData();
    fd.append("receipt", file);
    const res = await dispatch(uploadReceipt(fd));
    if (uploadReceipt.fulfilled.match(res)) {
      setForm((f) => ({ ...f, receiptUrl: res.payload.receiptUrl, receiptPublicId: res.payload.receiptPublicId }));
      toast.success("Receipt uploaded!");
    } else {
      toast.error(res.payload || "Upload failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amount || !form.date || !form.category)
      return toast.error("Fill all required fields");
    const res = await dispatch(createExpense({
      ...form,
      amount: Number(form.amount),
      teamId: form.teamId || undefined,
    }));
    if (createExpense.fulfilled.match(res)) {
      toast.success("Expense added!");
      navigate("/expenses");
    } else {
      toast.error(res.payload || "Failed to add expense");
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return toast.error("Enter category name");
    const res = await dispatch(addCategory({ name: newCatName.trim(), icon: newCatIcon }));
    if (addCategory.fulfilled.match(res)) {
      toast.success("Category added!");
      setNewCatName("");
      setNewCatIcon("📦");
    } else {
      toast.error(res.payload || "Failed");
    }
  };

  const handleDeleteCategory = async (id, name) => {
    const res = await dispatch(removeCategory(id));
    if (removeCategory.fulfilled.match(res)) {
      toast.success(`"${name}" deleted`);
      if (form.category === name) setForm((f) => ({ ...f, category: categories[0]?.name || "" }));
    } else {
      toast.error(res.payload || "Cannot delete default category");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Add New Expense</h1>

      {/* Admin: Category Manager */}
      {isAdmin && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Manage Categories</h2>
            <button
              type="button"
              onClick={() => setShowCatManager((v) => !v)}
              className="text-xs text-primary hover:underline"
            >
              {showCatManager ? "Hide" : "Show"}
            </button>
          </div>

          {showCatManager && (
            <div className="space-y-3">
              {/* Existing categories */}
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <div key={cat._id} className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-full text-sm">
                    <CategoryIcon name={cat.icon} size={15} />
                    <span>{cat.name}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat._id, cat.name)}
                      className="ml-1 text-red-400 hover:text-red-600"
                    >
                      <MdDelete size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add new category */}
              <form onSubmit={handleAddCategory} className="flex items-end gap-2 flex-wrap">
                <div className="flex-1 min-w-[140px]">
                  <label className="block text-xs font-medium text-gray-500 mb-1">New Category Name</label>
                  <input
                    className="input"
                    placeholder="e.g. Healthcare"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Icon</label>
                  <select
                    className="input w-48"
                    value={newCatIcon}
                    onChange={(e) => setNewCatIcon(e.target.value)}
                  >
                    {AVAILABLE_ICONS.map((ic) => (
                      <option key={ic} value={ic}>{ic.replace("Md", "")}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn-primary flex items-center gap-1 text-sm">
                  <MdAdd size={16} /> Add
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Expense Form */}
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Title *</label>
              <input
                className="input"
                placeholder="e.g. Team Lunch"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Amount (PKR) *</label>
              <input
                type="number"
                min="0"
                className="input"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Dynamic Category Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Category *</label>
              <select
                className="input"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Date *</label>
              <input
                type="date"
                className="input"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Team ID (optional)</label>
            <input
              className="input"
              placeholder="Leave blank for personal expense"
              value={form.teamId}
              onChange={(e) => setForm({ ...form, teamId: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Description</label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="Additional details..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          {/* Receipt Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Receipt (Image / PDF)</label>
            <div className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-lg p-4">
              {preview ? (
                <div className="relative">
                  {preview === "pdf" ? (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>📄</span> {file?.name}
                    </div>
                  ) : (
                    <img src={preview} alt="preview" className="max-h-40 rounded object-contain" />
                  )}
                  <button
                    type="button"
                    onClick={() => { setPreview(null); setFile(null); setForm((f) => ({ ...f, receiptUrl: "", receiptPublicId: "" })); }}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5"
                  >
                    <MdClose size={14} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center gap-2 cursor-pointer text-gray-400 hover:text-primary transition-colors">
                  <MdCloudUpload size={32} />
                  <span className="text-sm">Click to select file</span>
                  <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFile} />
                </label>
              )}
            </div>
            {file && !form.receiptUrl && (
              <button type="button" onClick={handleUpload} disabled={uploadLoading} className="mt-2 btn-secondary text-sm">
                {uploadLoading ? "Uploading..." : "Upload Receipt"}
              </button>
            )}
            {form.receiptUrl && <p className="text-xs text-green-600 mt-1">✓ Receipt uploaded successfully</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Add Expense"}
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate("/expenses")}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

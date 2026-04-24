import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { deleteExpense, updateExpense } from "../../store/slices/expenseSlice";
import toast from "react-hot-toast";
import { MdClose, MdDelete, MdOpenInNew } from "react-icons/md";
import { format } from "date-fns";

const statusClass = { Pending: "badge-pending", Approved: "badge-approved", Rejected: "badge-rejected" };

export default function ExpenseModal({ expense, onClose }) {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const isAdmin = user?.role === "Admin";
  const isOwner = expense.createdBy?._id === user?._id || expense.createdBy === user?._id;

  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    const res = await dispatch(deleteExpense(expense._id));
    if (deleteExpense.fulfilled.match(res)) {
      toast.success("Expense deleted");
      onClose();
    } else {
      toast.error(res.payload || "Delete failed");
    }
  };

  const handleStatus = async (status) => {
    const res = await dispatch(updateExpense({ id: expense._id, data: { status } }));
    if (updateExpense.fulfilled.match(res)) {
      toast.success(`Marked as ${status}`);
      onClose();
    } else {
      toast.error(res.payload || "Update failed");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Expense Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <MdClose size={22} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-800">{expense.title}</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                {expense.category} • {format(new Date(expense.date), "dd MMM yyyy")}
              </p>
            </div>
            <span className={statusClass[expense.status]}>{expense.status}</span>
          </div>

          <div className="bg-indigo-50 rounded-xl px-4 py-3">
            <p className="text-sm text-gray-500">Amount</p>
            <p className="text-2xl font-bold text-primary">PKR {Number(expense.amount).toLocaleString()}</p>
          </div>

          {expense.description && (
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Description</p>
              <p className="text-sm text-gray-700">{expense.description}</p>
            </div>
          )}

          {expense.teamId && (
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Team</p>
              <p className="text-sm text-gray-700">{expense.teamId?.name || expense.teamId}</p>
            </div>
          )}

          {expense.createdBy?.name && (
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Created By</p>
              <p className="text-sm text-gray-700">{expense.createdBy.name} ({expense.createdBy.email})</p>
            </div>
          )}

          {expense.receiptUrl && (
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Receipt</p>
              {expense.receiptUrl.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                <img src={expense.receiptUrl} alt="receipt" className="rounded-lg max-h-48 object-contain border" />
              ) : (
                <a
                  href={expense.receiptUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-primary text-sm hover:underline"
                >
                  <MdOpenInNew size={16} /> View Receipt
                </a>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex flex-wrap gap-2">
          {isAdmin && expense.status === "Pending" && (
            <>
              <button
                onClick={() => handleStatus("Approved")}
                className="text-sm font-medium px-4 py-2 rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => handleStatus("Rejected")}
                className="text-sm font-medium px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Reject
              </button>
            </>
          )}
          {(isAdmin || isOwner) && (
            confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-red-600 font-medium">Sure?</span>
                <button onClick={handleDelete} className="text-sm font-medium px-3 py-1.5 rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors">Yes, Delete</button>
                <button onClick={() => setConfirmDelete(false)} className="text-sm font-medium px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">Cancel</button>
              </div>
            ) : (
              <button onClick={handleDelete} className="flex items-center gap-1 text-sm text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors">
                <MdDelete size={16} /> Delete
              </button>
            )
          )}
          <button onClick={onClose} className="btn-secondary text-sm ml-auto">Close</button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import api from "../services/api";
import { format } from "date-fns";
import { MdHistory } from "react-icons/md";

const actionColor = {
  "Registered": "bg-blue-100 text-blue-700",
  "Login": "bg-green-100 text-green-700",
  "Expense Created": "bg-indigo-100 text-indigo-700",
  "Expense Deleted": "bg-red-100 text-red-700",
  "Expense Approved": "bg-green-100 text-green-700",
  "Expense Rejected": "bg-red-100 text-red-700",
};

export default function ActivityLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/activity").then((res) => {
      setLogs(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <MdHistory size={28} className="text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Activity Log</h1>
          <p className="text-sm text-gray-500">All user actions in the system</p>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No activity yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["User", "Action", "Details", "IP", "Time"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{log.userId?.name || "—"}</p>
                      <p className="text-xs text-gray-400">{log.userId?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${actionColor[log.action] || "bg-gray-100 text-gray-600"}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{log.details || "—"}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{log.ip || "—"}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{format(new Date(log.createdAt), "dd MMM yyyy, hh:mm a")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

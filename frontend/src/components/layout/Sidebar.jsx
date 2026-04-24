import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import { useDarkMode } from "../../hooks/useDarkMode";
import {
  MdDashboard, MdAddCircleOutline, MdListAlt,
  MdLogout, MdAttachMoney, MdPerson, MdHistory,
  MdLightMode, MdDarkMode,
} from "react-icons/md";

const allLinks = [
  { to: "/", label: "Dashboard", icon: <MdDashboard size={20} />, roles: ["Admin", "Member", "Viewer"] },
  { to: "/expenses", label: "Expenses", icon: <MdListAlt size={20} />, roles: ["Admin", "Member", "Viewer"] },
  { to: "/add-expense", label: "Add Expense", icon: <MdAddCircleOutline size={20} />, roles: ["Admin", "Member"] },
  { to: "/profile", label: "Profile", icon: <MdPerson size={20} />, roles: ["Admin", "Member", "Viewer"] },
  { to: "/activity", label: "Activity Log", icon: <MdHistory size={20} />, roles: ["Admin"] },
];

export default function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const [dark, setDark] = useDarkMode();
  const links = allLinks.filter((l) => l.roles.includes(user?.role));

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <aside className="w-60 min-h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-100 dark:border-gray-700">
        <MdAttachMoney size={28} className="text-primary" />
        <span className="font-bold text-lg text-gray-800 dark:text-white">ExpenseTrack</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-50 text-primary dark:bg-indigo-900/40"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700"
              }`
            }
          >
            {icon}
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-700 space-y-2">
        {/* Dark mode toggle */}
        <button
          onClick={() => setDark((d) => !d)}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          {dark ? <MdLightMode size={18} /> : <MdDarkMode size={18} />}
          {dark ? "Light Mode" : "Dark Mode"}
        </button>

        <div className="flex items-center gap-3 px-2">
          {user?.avatar ? (
            <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          )}
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <MdLogout size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}

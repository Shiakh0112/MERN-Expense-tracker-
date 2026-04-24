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

  return (
    <aside className="w-60 min-h-screen bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-gray-100 dark:border-gray-800">
        <div className="p-1.5 bg-indigo-600 rounded-lg">
          <MdAttachMoney size={22} className="text-white" />
        </div>
        <span className="font-bold text-lg text-gray-900 dark:text-white">ExpenseTrack</span>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-600/15 dark:text-indigo-400"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
              }`
            }
          >
            {icon}
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-800 space-y-1">
        {/* Dark mode toggle */}
        <button
          onClick={() => setDark((d) => !d)}
          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 rounded-lg transition-all"
        >
          {dark
            ? <MdLightMode size={20} className="text-amber-500" />
            : <MdDarkMode size={20} className="text-indigo-500" />
          }
          {dark ? "Light Mode" : "Dark Mode"}
        </button>

        {/* User info */}
        <div className="flex items-center gap-3 px-3 py-2.5">
          {user?.avatar ? (
            <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-100 dark:ring-indigo-900" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          )}
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">{user?.role}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => { dispatch(logout()); navigate("/login"); }}
          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 dark:text-red-400 rounded-lg transition-all"
        >
          <MdLogout size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}

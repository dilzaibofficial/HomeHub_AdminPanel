import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineSquares2X2,
  HiOutlineUsers,
  HiOutlineHomeModern,
  HiOutlineChatBubbleLeftRight,
  HiOutlineShieldCheck,
  HiOutlineArrowRightOnRectangle,
} from "react-icons/hi2";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/", label: "Overview", icon: HiOutlineSquares2X2, end: true },
  { to: "/users", label: "Users", icon: HiOutlineUsers },
  { to: "/properties", label: "Properties", icon: HiOutlineHomeModern },
  { to: "/chat", label: "Support Chat", icon: HiOutlineChatBubbleLeftRight },
  { to: "/admins", label: "Admins", icon: HiOutlineShieldCheck },
];

const Sidebar = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="flex h-full w-64 flex-col bg-slate-950 text-slate-300">
      <div className="flex items-center gap-3 px-6 py-6">
        <img src="/logo.png" alt="HomeHub" className="h-9 w-9 rounded-xl object-contain bg-white p-1" />
        <div>
          <p className="text-sm font-bold tracking-tight text-white">HomeHub</p>
          <p className="text-[11px] font-medium uppercase tracking-wider text-brand-500">Admin</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? "text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl bg-brand-500"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <item.icon className="relative z-10 h-5 w-5" />
                <span className="relative z-10">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 px-3 py-4">
        <div className="mb-2 flex items-center gap-3 rounded-xl px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500/20 text-xs font-bold text-brand-500">
            {admin?.username?.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{admin?.username}</p>
            <p className="text-[11px] text-slate-500">Administrator</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <HiOutlineArrowRightOnRectangle className="h-5 w-5" />
          Log Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

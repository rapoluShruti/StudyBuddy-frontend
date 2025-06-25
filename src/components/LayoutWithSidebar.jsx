// components/LayoutWithSidebar.jsx
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useState } from "react";
import useAuth from "../context/AuthContext/useAuth";
import { Menu, LogOut } from "lucide-react";

export default function LayoutWithSidebar() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  if (!user) {
    navigate("/login");
    return null;
  }

  const toggleSidebar = () => setIsOpen((prev) => !prev);

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />
      <div
        className={`flex-1 min-h-screen transition-all duration-300 ${
          isOpen ? "ml-64" : "ml-0"
        }`}
      >
        {/* Top nav */}
        <header className="bg-white shadow px-4 py-3 flex justify-between items-center sticky top-0 z-10">
          <button onClick={toggleSidebar}>
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-3">
            <span className="font-semibold">{user.username}</span>
            <button
              onClick={logout}
              className="text-red-500 flex items-center gap-1"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

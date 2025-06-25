import { Link } from "react-router-dom";
import { Home, History, Plus, Crown } from "lucide-react";
import Layout from "./Layout";

export default function Sidebar({ isOpen, toggleSidebar }) {
  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-white border-r shadow-md z-20 transform transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } w-64`}
    >
      <div className="p-4 font-bold text-lg border-b flex justify-between items-center">
        StudyBuddy
        <button onClick={toggleSidebar} className="text-sm text-gray-500">
          ✕
        </button>
      </div>
      <nav className="p-4 space-y-3">
        <Link to="/" className="flex items-center gap-2 hover:text-blue-600">
          <Home size={18} /> Home
        </Link>
        <Link
          to="/history"
          className="flex items-center gap-2 hover:text-blue-600"
        >
          <History size={18} /> History
        </Link>
        <Link
          to="/new-plan"
          className="flex items-center gap-2 hover:text-blue-600"
        >
          <Plus size={18} /> New Plan
        </Link>
        <Link
          to="/go-pro"
          className="flex items-center gap-2 hover:text-blue-600"
        >
          <Crown size={18} /> Go Pro
        </Link>
      </nav>
    </aside>
  );
}

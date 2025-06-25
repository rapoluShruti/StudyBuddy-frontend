import React from "react";

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
      {/* Left side: Logo + Brand */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-md bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="white"
            viewBox="0 0 24 24"
            className="w-5 h-5"
          >
            <path d="M12 2L1 7l11 5 9-4.09V17h2V7L12 2zm0 13l-8-3.636V17l8 3.636L20 17v-5.636L12 15z" />
          </svg>
        </div>
        <div>
          <div className="text-lg font-semibold text-gray-800">
            StudyPath AI
          </div>
          <div className="text-sm text-gray-500">
            Personalized Learning Roadmaps
          </div>
        </div>
      </div>

      {/* Right side: Label */}
      <div className="flex items-center space-x-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4 text-yellow-400"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2l1.09 3.41H17l-2.91 2.11 1.1 3.41L12 10.91l-3.19 2.02 1.1-3.41L7 5.41h3.91z" />
        </svg>
        <span className="text-sm text-gray-700">AI-Powered Study Plans</span>
      </div>
    </nav>
  );
};

export default Navbar;

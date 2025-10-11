import React from "react";
import { Search, Bell, MessageCircle } from "lucide-react";

const Header = ({ userName = "User", avatarUrl }) => {
  return (
    <header className="w-full flex items-center justify-between bg-white py-3 px-6 shadow-sm border-b border-gray-100">
      {/* Search */}
      <div className="relative w-80">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search anything..."
          className="w-full pl-9 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm text-gray-700"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Notification */}
        <button className="relative p-2 rounded-xl hover:bg-gray-100 transition">
          <Bell className="text-gray-600" size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Messages */}
        <button className="relative p-2 rounded-xl hover:bg-gray-100 transition">
          <MessageCircle className="text-gray-600" size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-orange-700 flex items-center justify-center overflow-hidden cursor-pointer">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="User Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white font-medium text-sm">{userName[0]}</span>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

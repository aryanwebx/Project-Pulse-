import { Link } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import CommunityDisplay from "../Community/CommunityDisplay";
import NotificationBell from "./NotificationBell";

const Header = () => {
  const { user, logout } = useAuth();
  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-20 border-b border-[#e6e8ec] bg-white/95 backdrop-blur">
      <div className="flex h-[73px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-4 min-w-0 flex-1">
          {/* App Logo/Name */}
          <div className="flex items-center space-x-3 shrink-0">
            <img src="/project-pulse-mark.svg" alt="Project Pulse" className="h-8 w-8" />
            <span className="hidden text-base font-bold tracking-[-.02em] text-[#182230] sm:block">
              Project Pulse
            </span>
          </div>

          {/* Community Display - Shows user's single community */}
          <div className="min-w-0 flex-1 max-w-md">
            {user?.role !== "super_admin" ? <CommunityDisplay /> : ""}
            {/* <CommunityDisplay /> */}
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          {user ? (
            <div className="flex items-center space-x-3">
              <NotificationBell />
              <Link
                to="/app/profile"
                className="flex items-center space-x-3 rounded-lg p-1.5 hover:bg-[#f7f8fa] transition-colors"
                title="Account Settings">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-32">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary-100">
                  <span className="text-sm font-bold text-primary-700">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
                title="Logout">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </div>
          ) : (
            <div className="space-x-2">
              <a href="/login" className="btn-secondary text-sm">
                Login
              </a>
              <a href="/register" className="btn-primary text-sm">
                Sign Up
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

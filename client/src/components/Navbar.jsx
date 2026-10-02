import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, LogOut, User as UserIcon, LayoutDashboard, Target } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
              <ShieldCheck className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent tracking-tight">
                MERN<span className="text-emerald-400">Auth</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                JWT Protected
              </span>
            </div>
          </Link>

          {/* Navigation Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/"
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>

                <Link
                  to="/habits"
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-sm font-medium text-emerald-300 hover:text-emerald-200 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors"
                >
                  <Target className="w-4 h-4 text-emerald-400" />
                  <span>Habits</span>
                </Link>

                <div className="hidden md:flex items-center space-x-2 pl-2 border-l border-slate-800">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-200 leading-tight">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      {user?.email}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-sm font-medium text-red-400 hover:text-red-300 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all duration-200"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-md shadow-emerald-500/20 transition-all duration-200 hover:shadow-emerald-500/30"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  ShieldCheck,
  User,
  Key,
  Database,
  Activity,
  Copy,
  Check,
  RefreshCw,
  Clock,
  Layers,
  Server,
  Lock,
  Target,
} from 'lucide-react';

export default function Dashboard() {
  const { user, token, logout, setUser } = useAuth();
  const [profileData, setProfileData] = useState(user);
  const [serverHealth, setServerHealth] = useState({ status: 'checking', message: '', latency: null });
  const [refreshing, setRefreshing] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  // Check backend server health
  const checkHealth = async () => {
    const start = performance.now();
    try {
      const res = await api.get('/health');
      const latency = Math.round(performance.now() - start);
      setServerHealth({
        status: 'online',
        message: res.data.message || 'Server is active',
        latency,
      });
    } catch (err) {
      setServerHealth({
        status: 'offline',
        message: err.message || 'Cannot connect to backend server',
        latency: null,
      });
    }
  };

  // Re-fetch current user profile via protected /api/auth/me
  const fetchFreshProfile = async () => {
    setRefreshing(true);
    try {
      const res = await api.get('/auth/me');
      if (res.data?.user) {
        setProfileData(res.data.user);
        setUser(res.data.user);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setTimeout(() => setRefreshing(false), 400);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const handleCopyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Welcome Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-10 mb-8 border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>JWT Authentication Active</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Hello, {profileData?.name || 'Developer'}! 👋
            </h1>
            <p className="mt-2 text-slate-400 text-sm sm:text-base max-w-2xl">
              You are securely authenticated. Your requests automatically include the Bearer token intercepted by Axios and validated by Express JWT middleware.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/habits"
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20"
            >
              <Target className="w-4 h-4" />
              <span>Open Habits Tracker</span>
            </Link>

            <button
              onClick={fetchFreshProfile}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-sm font-medium transition-all shadow-md cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Verify Token (/me)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics & Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Backend Status Card */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              API Server Status
            </span>
            <span
              className={`flex h-2.5 w-2.5 relative ${
                serverHealth.status === 'online' ? 'text-emerald-500' : 'text-amber-500'
              }`}
            >
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <div className="mt-4 flex items-baseline space-x-3">
            <span className="text-2xl font-bold text-white capitalize">
              {serverHealth.status}
            </span>
            {serverHealth.latency !== null && (
              <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                {serverHealth.latency} ms
              </span>
            )}
          </div>
          <p className="mt-2 text-xs text-slate-400 truncate">
            {serverHealth.message || 'Express running on port 5000'}
          </p>
        </div>

        {/* User Identity Card */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active User Account
            </span>
            <User className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-4">
            <p className="text-xl font-bold text-white truncate">
              {profileData?.name}
            </p>
            <p className="text-xs text-slate-400 truncate mt-1">
              {profileData?.email}
            </p>
          </div>
          <div className="mt-3 flex items-center text-[11px] text-slate-500">
            <Clock className="w-3 h-3 mr-1" />
            <span>ID: {profileData?._id}</span>
          </div>
        </div>

        {/* Security / JWT Card */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Security Protocol
            </span>
            <Lock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white">HS256</span>
            <span className="text-xs text-slate-400">Bcrypt Salt 10</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Mongoose Pre-Save Hook + Stateless JWT Bearer
          </p>
        </div>
      </div>

      {/* Main Content Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* JWT Token Card */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Current Bearer Token</h2>
                <p className="text-xs text-slate-400">Stored in client localStorage and verified on protected calls</p>
              </div>
            </div>

            <button
              onClick={handleCopyToken}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              {copiedToken ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Token</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-4 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400/90 break-all select-all max-h-36 overflow-y-auto">
            {token || 'No token found in session'}
          </div>

          <div className="mt-5 space-y-2 text-xs text-slate-400">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Token Type:</span>
              <span className="text-slate-200 font-mono">Bearer (RFC 6750)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Authorization Header:</span>
              <span className="text-slate-200 font-mono">Authorization: Bearer &lt;token&gt;</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Middleware Handler:</span>
              <span className="text-emerald-400 font-mono">middleware/authMiddleware.js</span>
            </div>
          </div>
        </div>

        {/* Live User Record / Verified Profile */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Verified Profile Payload</h2>
              <p className="text-xs text-slate-400">Returned from GET /api/auth/me (Protected Route)</p>
            </div>
          </div>

          <div className="mt-4 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 max-h-56 overflow-y-auto">
            <pre className="text-emerald-400/90">
              {JSON.stringify(
                {
                  _id: profileData?._id,
                  name: profileData?.name,
                  email: profileData?.email,
                  createdAt: profileData?.createdAt,
                  updatedAt: profileData?.updatedAt,
                },
                null,
                2
              )}
            </pre>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
            <span>Password field is safely excluded via <code className="text-emerald-400">.select('-password')</code></span>
          </div>
        </div>
      </div>

      {/* MERN Architecture Overview */}
      <div className="mt-8 glass-card rounded-2xl p-6 sm:p-8 border border-slate-800">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Project Structure & Endpoints</h2>
            <p className="text-xs text-slate-400">Clean MVC architecture with separation of concerns</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
              POST /api/auth/register
            </span>
            <p className="text-xs text-slate-300 font-medium">Registration</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Validates input, checks existing email, hashes password with bcrypt, and responds with JWT token.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] font-semibold text-teal-400 uppercase tracking-wider block mb-1">
              POST /api/auth/login
            </span>
            <p className="text-xs text-slate-300 font-medium">Authentication</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Queries user with password hash, compares with bcrypt, and issues a signed JWT token on match.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider block mb-1">
              GET /api/auth/me
            </span>
            <p className="text-xs text-slate-300 font-medium">Protected Profile</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Protected by <code className="text-white">protect</code> middleware. Verifies JWT and returns the sanitized user.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider block mb-1">
              GET /api/health
            </span>
            <p className="text-xs text-slate-300 font-medium">Health Check</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Returns operational status, uptime timestamp, and server availability for monitoring.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

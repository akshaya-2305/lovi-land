import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Habits from './pages/Habits';
import NotFound from './pages/NotFound';

// Redirect authenticated users away from Login and Register pages
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white">
          {/* Main Navigation */}
          <Navbar />

          {/* Main Application Routes */}
          <main className="flex-1">
            <Routes>
              {/* Protected Dashboard Route */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* Protected Habits Tracker Route */}
              <Route
                path="/habits"
                element={
                  <ProtectedRoute>
                    <Habits />
                  </ProtectedRoute>
                }
              />

              {/* Public Authentication Routes */}
              <Route
                path="/login"
                element={
                  <PublicOnlyRoute>
                    <Login />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicOnlyRoute>
                    <Register />
                  </PublicOnlyRoute>
                }
              />

              {/* Catch-all 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          {/* Clean Footer */}
          <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p>MERN Stack Architecture • Express, Mongoose, JWT & React Vite</p>
              <div className="flex items-center space-x-4 text-slate-400">
                <span>API: <code className="text-emerald-400">/api/auth</code></span>
                <span>•</span>
                <span>Tailwind CSS v3.4</span>
              </div>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

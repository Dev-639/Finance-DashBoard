import React from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { LayoutDashboard, Receipt, Users, LogOut, LineChart } from 'lucide-react';


import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Records from './pages/Records';
import UserManagement from './pages/UserManagement';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, hasRole } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !hasRole(allowedRoles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['VIEWER', 'ANALYST', 'ADMIN'] },
    { name: 'Financial Records', path: '/records', icon: Receipt, roles: ['ANALYST', 'ADMIN'] },
    { name: 'User Management', path: '/users', icon: Users, roles: ['ADMIN'] },
  ];

  return (
    <div className="flex h-screen bg-background">
      
      <aside className="w-64 bg-surface border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-200 font-bold text-xl text-primary-600">
          <LineChart className="mr-2" /> FinanceDash
        </div>
        
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.filter(item => user && item.roles.includes(user.role)).map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center px-3 py-2.5 rounded-lg font-medium transition-colors ${
                location.pathname.startsWith(item.path)
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3 shrink-0" />
              {item.name}
            </Link>
          ))}
        </nav>
        
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3 truncate">
              <p className="text-sm font-medium text-slate-700 truncate">{user?.username}</p>
              <p className="text-xs text-slate-500 truncate">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </button>
        </div>
      </aside>

      
      <main className="flex-1 overflow-auto flex flex-col min-w-0">
        <div className="p-8 pb-16">
          {children}
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute allowedRoles={['VIEWER', 'ANALYST', 'ADMIN']}>
          <Layout><Dashboard /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/records" element={
        <ProtectedRoute allowedRoles={['ANALYST', 'ADMIN']}>
          <Layout><Records /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/users" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <Layout><UserManagement /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  Home, 
  Users, 
  Calendar, 
  BookOpen, 
  UserCheck,
  BarChart3,
  History,
  Menu,
  X,
  History as HistoryIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/Button';

export const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/teams', label: 'Teams', icon: Users },
    { path: '/lesson-planner', label: 'Plan Lesson', icon: Calendar },
    { path: '/exercises', label: 'Exercises', icon: BookOpen },
    { path: '/history', label: 'History', icon: History }
  ];

  const isActivePath = (path: string): boolean => {
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  // Define active and inactive classes
  const activeClasses = "flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 bg-gradient-to-r from-amber-500/20 to-amber-400/20 text-amber-300 border border-amber-500/30 shadow-lg shadow-amber-500/10";
  const inactiveClasses = "flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-slate-300 hover:text-slate-100 hover:bg-slate-800/50";

  return (
    <nav className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <button 
                onClick={() => handleNavigation('/dashboard')}
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              >
                <span className="text-2xl">🎭</span>
                <span className="font-display text-2xl text-yellow-500">ImprovCoach</span>
              </button>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={isActive ? activeClasses : inactiveClasses}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Logout */}
          <div className="hidden md:flex ml-auto">
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-400 hover:text-gray-200 p-2"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-800">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActivePath(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={isActive ? activeClasses : inactiveClasses}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
              
              <div className="border-t border-gray-800 pt-3 mt-3">
                <div className="px-3 py-2 text-gray-400 text-sm">
                  {user?.firstName} {user?.lastName}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 w-full px-3 py-2 text-gray-300 hover:text-gray-100 hover:bg-gray-800 rounded-lg text-sm"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
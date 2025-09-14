import React, { useState } from 'react';
import { useAuth } from '../context/AuthContex';
import { Button } from './ui/Button';
import ToggelSwitch from '../ui/ToggelSwitch';
import { 
  Home, 
  Building2, 
  Upload, 
  FileCheck, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  User,
  Shield,
  GraduationCap
} from 'lucide-react';

const RoleBasedNavbar = () => {
  const { currentUser, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-5 w-5" />;
      case 'institute':
        return <Building2 className="h-5 w-5" />;
      case 'verifier':
        return <GraduationCap className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'text-red-600 dark:text-red-400';
      case 'institute':
        return 'text-blue-600 dark:text-blue-400';
      case 'verifier':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getNavigationItems = () => {
    if (!currentUser) return [];

    switch (currentUser.role) {
      case 'admin':
        return [
          { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
          { name: 'Institutes', href: '/admin/institutes', icon: Building2 },
          { name: 'Verifications', href: '/admin/verifications', icon: FileCheck },
          { name: 'Analytics', href: '/admin/analytics', icon: Users },
        ];
      case 'institute':
        return [
          { name: 'Dashboard', href: '/institute/dashboard', icon: Home },
          { name: 'Upload', href: '/institute/upload', icon: Upload },
          { name: 'Certificates', href: '/institute/certificates', icon: FileCheck },
          { name: 'Analytics', href: '/institute/analytics', icon: Users },
        ];
      default:
        return [];
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <img className="h-8 rounded-2xl w-8" src="/logo.ico" alt="Trustify Logo" />
              <span onClick={
() => window.location.href = '/' 
              }  className="ml-2 text-xl font-bold text-gray-900 dark:text-white hover:cursor-pointer">
                Trustify
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </a>
              );
            })}
          </div>
            <div className='flex items-center rounded-2xl border border-gray-300 dark:border-gray-600'> 
            <div  className='flex items-center mx-4'>
            <ToggelSwitch />
            </div>
            </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {getRoleIcon(currentUser?.role)}
              <div className="text-sm">
                <p className="font-medium text-gray-900 dark:text-white">
                  {currentUser?.name || currentUser?.institutionName || 'User'}
                </p>
                <p className={`text-xs ${getRoleColor(currentUser?.role)}`}>
                  {currentUser?.role?.toUpperCase() || 'USER'}
                </p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 dark:bg-gray-900">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </a>
              );
            })}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex items-center space-x-2 px-3 py-2">
                {getRoleIcon(currentUser?.role)}
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {currentUser?.name || currentUser?.institutionName || 'User'}
                  </p>
                  <p className={`text-xs ${getRoleColor(currentUser?.role)}`}>
                    {currentUser?.role?.toUpperCase() || 'USER'}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="w-full mt-2 flex items-center justify-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default RoleBasedNavbar;

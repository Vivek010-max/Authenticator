import React, { useState, useEffect } from "react";
import ToggelSwitch from "../ui/ToggelSwitch";
import { Link } from "react-router-dom";

const handleThemeChange = () => {
  const currentTheme = document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";
  document.documentElement.classList.toggle("dark");
  localStorage.setItem("theme", currentTheme === "dark" ? "light" : "dark");
};

const PublicNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/60 backdrop-blur-md shadow-md dark:bg-black dark:shadow-neutral-800 dark:shadow-2xl transition-colors duration-300">
      <div className="container mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo / Brand Name */}
          <Link
            to="/upload-verification"
            className="flex items-center space-x-2"
          >
            <img
              src="/logo.ico"
              alt="Trustify Logo"
              className="h-8 rounded-2xl w-8"
            />
            <span className="font-bold text-xl text-gray-900 dark:text-white">
              Trustra
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden sm:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
            >
              Landing
            </Link>
            <Link
              to="/upload-verification"
              className="text-gray-700 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors duration-200"
            >
              Upload Certificate
            </Link>
            <Link
              to="/issue"
              className="text-gray-700 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors duration-200"
            >
              Issue Certificate
            </Link>
          </div>

          {/* Login + Theme */}
          <div className="hidden sm:flex items-center space-x-4">
            <Link
              to="/login"
              className="px-4 py-2 rounded-2xl border border-black bg-transparent text-black font-medium hover:bg-black hover:text-white transition-colors duration-300 dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black"
            >
              Login
            </Link>

            {/* Settings Dropdown */}
            <div className="relative">
              <button
                onClick={handleDropdownToggle}
                className="p-2 rounded-full text-black dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83l-2.83 2.83a2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0l-2.83-2.83a2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0-.33-1.82 1.65 1.65 0 0 0-1.82-.33l-.06-.06a2 2 0 0 1 0-2.83l2.83-2.83a2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0l2.83 2.83a2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82z" />
                </svg>
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-900 dark:border dark:border-white/90 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                  <div className="py-1" role="menu">
                    <button
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      role="menuitem"
                    >
                      <div className="flex items-center gap-2 px-3 py-2 rounded-2xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-black shadow-sm">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                          Theme
                        </span>
                        <ToggelSwitch onChange={handleThemeChange} />
                      </div>
                    </button>
                    <Link
                      to="/about"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-black"
                      role="menuitem"
                    >
                      About
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center space-x-4">
            <button
              onClick={handleMenuToggle}
              className="text-gray-700 dark:text-gray-300 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="sm:hidden mt-4">
            <div className="flex flex-col space-y-2">
              <Link
                to="/"
                className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                Home
              </Link>
              <Link
                to="/upload-verification"
                className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                Upload Certificate
              </Link>
              <Link
                to="/login"
                className="block px-4 py-2 rounded-full text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors duration-200 text-center shadow-md"
              >
                Login
              </Link>

              {/* Settings dropdown (mobile) */}
              <div className="relative">
                <button
                  onClick={handleDropdownToggle}
                  className="w-full text-left block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  <span className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83l-2.83 2.83a2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0l-2.83-2.83a2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0-.33-1.82 1.65 1.65 0 0 0-1.82-.33l-.06-.06a2 2 0 0 1 0-2.83l2.83-2.83a2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0l2.83 2.83a2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82z" />
                    </svg>
                    Settings
                  </span>
                </button>
                {isDropdownOpen && (
                  <div className="mt-2 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <Link
                      to="/about"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      role="menuitem"
                    >
                      About
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default PublicNavbar;

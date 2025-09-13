import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const navigate = useNavigate();

  // Theme persistence
  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(theme);
  }, [theme]);

  // Proactive token refresh
  const refreshTokenProactively = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return;

    try {
      const res = await axios.post("/api/v1/auth/refresh-token", {
        refreshToken: refreshToken
      });
      
      localStorage.setItem("accessToken", res.data.data.accessToken);
      localStorage.setItem("refreshToken", res.data.data.refreshToken);
      console.log('[Auth] Token refreshed proactively');
    } catch (error) {
      console.error('[Auth] Proactive token refresh failed:', error);
      // Don't logout here, let the response interceptor handle it
    }
  };

  // Set up proactive token refresh every 50 minutes
  useEffect(() => {
    const tokenRefreshInterval = setInterval(refreshTokenProactively, 50 * 60 * 1000); // 50 minutes
    
    return () => clearInterval(tokenRefreshInterval);
  }, []);

  // Fetch user on load
  const fetchCurrentUser = async () => {
    console.log('[Auth] Fetching current user: GET /api/v1/auth/me');
    try {
      const res = await axios.get("/api/v1/auth/me");
      console.log('[Auth] Current user response:', res.data);
      setCurrentUser(res.data.data);
    } catch (error) {
      console.error('[Auth] Error fetching current user:', error, error?.response);
      setCurrentUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  // Check for token on mount and fetch user if token exists
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      fetchCurrentUser();
    } else {
      setAuthLoading(false);
    }
  }, []);

  // Login helper
  const login = async (credentials) => {
    console.log('[Auth] Logging in: POST /api/v1/auth/login', credentials);
    setAuthLoading(true);
    try {
      const res = await axios.post("/api/v1/auth/login", credentials);
      console.log('[Auth] Login response:', res.data);
      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      console.log('[Auth] Setting current user:', res.data.user);
      setCurrentUser(res.data.user);
      setAuthLoading(false);
      console.log('[Auth] Login completed, currentUser set to:', res.data.user);
      return res;
    } catch (err) {
      console.error('[Auth] Login error:', err, err?.response);
      setAuthLoading(false);
      throw err;
    }
  };

  // Signup helper
  const signup = async (data) => {
    console.log('[Auth] Registering: POST /api/v1/auth/register', data);
    setAuthLoading(true);
    try {
      const res = await axios.post("/api/v1/auth/register", data);
      console.log('[Auth] Register response:', res.data);
      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      console.log('[Auth] Setting current user:', res.data.user);
      setCurrentUser(res.data.user);
      setAuthLoading(false);
      console.log('[Auth] Signup completed, currentUser set to:', res.data.user);
      return res;
    } catch (err) {
      console.error('[Auth] Register error:', err, err?.response);
      setAuthLoading(false);
      throw err;
    }
  };

  // Logout helper
  const logout = async () => {
    console.log('[Auth] Logging out');
    setAuthLoading(true);
    try {
      await axios.post("/api/v1/auth/logout");
    } catch (err) {
      console.error('[Auth] Logout error:', err, err?.response);
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setCurrentUser(null);
    setAuthLoading(false);
    navigate("/");
  };

  // Update current user helper
  const updateCurrentUser = (updatedUserData) => {
    setCurrentUser(prev => ({ ...prev, ...updatedUserData }));
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      setCurrentUser, 
      updateCurrentUser,
      authLoading, 
      login, 
      signup, 
      logout, 
      theme, 
      setTheme,
      refreshTokenProactively
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

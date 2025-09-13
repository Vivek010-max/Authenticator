import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Landing from "./pages/Landing";
import { useAuth } from "./context/AuthContex";
import UploadVerification from "./pages/UploadVerification";
import Login from "./pages/Login";
import RoleBasedNavbar from "./components/RoleBasedNavbar";

// Admin Pages
import AdminDashboard from "./pages/Admin/AdminDashboard";
import InstituteManagement from "./pages/Admin/InstituteManagement";

// Institute Pages
import InstituteDashboard from "./pages/Institute/InstituteDashboard";
import CertificateUpload from "./pages/Institute/CertificateUpload";
import CertificatesList from "./pages/Institute/CertificatesList";

// Guest Pages
import GuestVerification from "./pages/Guest/GuestVerification";

function App() {
  const { currentUser, authLoading } = useAuth();
  const location = useLocation();

  // Pages where we don't want the main Navbar
  const pagesWithoutNavbar = ["/", "/login", "/signup", "/upload-verification"];

  // Get the appropriate redirect path based on user role
  const getRedirectPath = (user) => {
    if (!user) return "/";
    switch (user.role) {
      case 'admin':
        return "/admin/dashboard";
      case 'institute':
        return "/institute/dashboard";
      case 'verifier':
        return "/upload-verification";
      default:
        return "/";
    }
  };

  // Check if current route requires authentication
  const requiresAuth = (path) => {
    return path.startsWith('/admin') || path.startsWith('/institute');
  };

  // Check if user has permission for current route
  const hasPermission = (path, user) => {
    if (!user) return false;
    if (path.startsWith('/admin') && user.role !== 'admin') return false;
    if (path.startsWith('/institute') && user.role !== 'institute') return false;
    return true;
  };

  const shouldShowNavbar = !pagesWithoutNavbar.includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {shouldShowNavbar && <RoleBasedNavbar />}
      
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            !authLoading && currentUser
              ? <Navigate to={getRedirectPath(currentUser)} replace />
              : <Landing />
          }
        />

        <Route
          path="/login"
          element={
            !authLoading && currentUser
              ? <Navigate to={getRedirectPath(currentUser)} replace />
              : <Login />
          }
        />

        <Route
          path="/upload-verification"
          element={<GuestVerification />}
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            
              <AdminDashboard />
              
          }
        />

        <Route
          path="/admin/institutes"
          element={
            !authLoading && currentUser && hasPermission('/admin', currentUser)
              ? <InstituteManagement />
              : <Navigate to="/login" replace />
          }
        />

        {/* Institute Routes */}
        <Route
          path="/institute/dashboard"
          element={
            !authLoading && currentUser && hasPermission('/institute', currentUser)
              ? <InstituteDashboard />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/institute/upload"
          element={
            !authLoading && currentUser && hasPermission('/institute', currentUser)
              ? <CertificateUpload />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/institute/certificates"
          element={
            !authLoading && currentUser && hasPermission('/institute', currentUser)
              ? <CertificatesList />
              : <Navigate to="/login" replace />
          }
        />

        {/* Fallback Routes */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  404
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  Page not found
                </p>
                <a
                  href="/"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Go Home
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </div>
  );
}

export default App;

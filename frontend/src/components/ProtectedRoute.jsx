import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// Component để bảo vệ routes yêu cầu authentication
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  console.log("🔍 ProtectedRoute - loading:", loading, "isAuthenticated:", isAuthenticated, "user:", user);

  // Đợi cho đến khi AuthContext hoàn thành việc load
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang kiểm tra đăng nhập...</p>
        </div>
      </div>
    );
  }

  // Chỉ redirect khi đã load xong và không authenticated
  if (!isAuthenticated || !user) {
    console.log("🔍 Redirecting to login from:", location.pathname);
    // Redirect về login với thông tin current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Component để bảo vệ routes chỉ dành cho guest (chưa login)
const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang kiểm tra đăng nhập...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    // Redirect về home nếu đã login
    return <Navigate to="/" replace />;
  }

  return children;
};

export { ProtectedRoute, GuestRoute };

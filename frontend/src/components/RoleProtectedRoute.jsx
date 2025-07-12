import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// Component để bảo vệ routes yêu cầu authentication và role cụ thể
const RoleProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  console.log("🔍 RoleProtectedRoute - loading:", loading, "isAuthenticated:", isAuthenticated, "user:", user, "allowedRoles:", allowedRoles);

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

  // Kiểm tra role nếu có yêu cầu
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    console.log("🔍 Access denied - user role:", user.role, "allowed roles:", allowedRoles);
    // Redirect về dashboard nếu không có quyền
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Component để bảo vệ routes chỉ dành cho admin
const AdminRoute = ({ children }) => {
  return <RoleProtectedRoute allowedRoles={["admin"]}>{children}</RoleProtectedRoute>;
};

// Component để bảo vệ routes chỉ dành cho manager
const ManagerRoute = ({ children }) => {
  return <RoleProtectedRoute allowedRoles={["manager"]}>{children}</RoleProtectedRoute>;
};

// Component để bảo vệ routes dành cho admin hoặc manager
const AdminManagerRoute = ({ children }) => {
  return <RoleProtectedRoute allowedRoles={["admin", "manager"]}>{children}</RoleProtectedRoute>;
};

export { RoleProtectedRoute, AdminRoute, ManagerRoute, AdminManagerRoute }; 
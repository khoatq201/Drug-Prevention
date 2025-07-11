import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

const GoogleAuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();

  useEffect(() => {
    const handleGoogleAuthSuccess = () => {
      try {
        const data = searchParams.get("data");
        console.log("🔍 Raw data from URL:", data);

        if (data) {
          const authData = JSON.parse(decodeURIComponent(data));
          console.log("🔍 Parsed auth data:", authData);

          const { user, token, refreshToken } = authData;
          console.log("🔍 User:", user);
          console.log("🔍 Token:", token ? "exists" : "missing");
          console.log("🔍 Refresh Token:", refreshToken ? "exists" : "missing");

          // Use AuthContext method for Google login
          const result = loginWithGoogle({ user, token, refreshToken });
          console.log("🔍 Login result:", result);

          if (result && result.success) {
            console.log("✅ Google login success");
            // Set flag to show welcome toast on home page
            sessionStorage.setItem("justLoggedIn", "true");
            // Use setTimeout to ensure state update is processed
            setTimeout(() => {
              window.location.href = "/";
            }, 100);
          } else {
            throw new Error(result?.message || "Google login failed");
          }
        } else {
          console.error("❌ No data parameter in URL");
          throw new Error("Không có dữ liệu từ Google OAuth");
        }
      } catch (error) {
        console.error("❌ Google OAuth error:", error);
        console.error("❌ Error stack:", error.stack);
        toast.error("Đăng nhập Google thất bại!");
        navigate("/login", { replace: true });
      }
    };

    handleGoogleAuthSuccess();
  }, [searchParams, navigate, loginWithGoogle]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Đang xử lý đăng nhập Google...</p>
      </div>
    </div>
  );
};

export default GoogleAuthSuccess;

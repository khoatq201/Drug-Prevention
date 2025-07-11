import React, { useState } from "react";
import { FaGoogle } from "react-icons/fa";

const GoogleLoginButton = ({ onSuccess, onError }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    console.log("🔍 Starting Google OAuth with Passport...");

    try {
      // Sử dụng backend Passport Google OAuth
      const backendUrl =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const googleAuthUrl = `${backendUrl}/auth/google`;

      console.log("🔍 Redirecting to:", googleAuthUrl);

      // Redirect trực tiếp đến backend OAuth endpoint
      window.location.href = googleAuthUrl;
    } catch (error) {
      console.error("❌ Google login error:", error);
      setIsLoading(false);
      onError && onError(error.message);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className={`w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200 ${
        isLoading ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700 mr-2"></div>
          <span>Đang chuyển hướng...</span>
        </>
      ) : (
        <>
          <FaGoogle className="text-lg mr-2 text-red-500" />
          <span>Đăng nhập với Google</span>
        </>
      )}
    </button>
  );
};

export default GoogleLoginButton;

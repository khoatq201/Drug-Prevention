import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import GoogleLoginButton from "../../components/Google/GoogleLoginButton";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const result = await login(data.email, data.password);
    if (result.success) {
      navigate("/", { replace: true });
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-green-100 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse"></div>
      <div
        className="absolute top-0 right-0 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"
        style={{ animationDelay: "2s" }}
      ></div>
      <div
        className="absolute -bottom-8 left-20 w-80 h-80 bg-teal-100 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse"
        style={{ animationDelay: "4s" }}
      ></div>

      <motion.div
        className="max-w-md w-full space-y-8 relative z-10"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {/* Header */}
        <motion.div className="text-center" variants={fadeInUp}>
          <motion.div className="text-center" variants={fadeInUp}>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Đăng nhập Hệ thống
            </h2>

            <p className="text-gray-600">
              Xây dựng cộng đồng không ma túy, an toàn và lành mạnh
            </p>
          </motion.div>
        </motion.div>

        {/* Login Form */}
        <motion.div
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100/50 p-8"
          variants={fadeInUp}
        >
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Email Field */}
            <motion.div variants={fadeInUp}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  autoComplete="email"
                  className={`w-full px-4 py-3 pl-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 bg-white/70 backdrop-blur-sm ${
                    errors.email
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Nhập email của bạn"
                  {...register("email", {
                    required: "Email là bắt buộc",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Email không hợp lệ",
                    },
                  })}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                </div>
              </div>
              {errors.email && (
                <motion.p
                  className="mt-1 text-sm text-red-600 flex items-center"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.email.message}
                </motion.p>
              )}
            </motion.div>

            {/* Password Field */}
            <motion.div variants={fadeInUp}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className={`w-full px-4 py-3 pl-12 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 bg-white/70 backdrop-blur-sm ${
                    errors.password
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Nhập mật khẩu"
                  {...register("password", {
                    required: "Mật khẩu là bắt buộc",
                    minLength: {
                      value: 6,
                      message: "Mật khẩu phải có ít nhất 6 ký tự",
                    },
                  })}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <motion.p
                  className="mt-1 text-sm text-red-600 flex items-center"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.password.message}
                </motion.p>
              )}
            </motion.div>

            {/* Remember Me & Forgot Password */}
            <motion.div
              className="flex items-center justify-between"
              variants={fadeInUp}
            >
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded accent-green-600"
                />
                <label
                  htmlFor="remember-me"
                  className="cursor-pointer ml-2 block text-sm text-gray-700"
                >
                  Ghi nhớ đăng nhập
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-green-600 hover:text-green-700 transition-colors"
                >
                  Quên mật khẩu?
                </Link>
              </div>
            </motion.div>

            {/* Login Button */}
            <motion.button
              type="submit"
              disabled={loading}
              className={`
    w-full py-3 px-4 rounded-lg font-semibold text-white
    transition-colors duration-200
    ${
      loading
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
    }
  `}
              variants={fadeInUp}
              whileHover={
                !loading
                  ? {
                      scale: 1.02,
                      transition: { duration: 0.2, ease: "easeInOut" },
                    }
                  : {}
              }
              whileTap={
                !loading
                  ? {
                      scale: 0.98,
                      transition: { duration: 0.1, ease: "easeInOut" },
                    }
                  : {}
              }
              animate={{
                scale: loading ? 1 : 1,
                transition: { duration: 0.2, ease: "easeInOut" },
              }}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Đang đăng nhập...
                </div>
              ) : (
                "Đăng nhập"
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <motion.div className="mt-6" variants={fadeInUp}>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Hoặc</span>
              </div>
            </div>
          </motion.div>

          {/* Google Login */}
          <motion.div className="mt-6" variants={fadeInUp}>
            <GoogleLoginButton
              onError={(error) => {
                console.error("Google login error:", error);
              }}
            />
          </motion.div>

          {/* Register Link */}
          <motion.div className="mt-6 text-center" variants={fadeInUp}>
            <p className="text-gray-600 text-sm">
              Chưa có tài khoản?{" "}
              <Link
                to="/register"
                className="text-green-600 hover:text-green-700 font-semibold underline transition-colors"
              >
                Đăng ký ngay
              </Link>
            </p>
          </motion.div>
        </motion.div>

        {/* Help Link */}
        <motion.div className="text-center" variants={fadeInUp}>
          <p className="text-sm text-gray-600">
            Cần hỗ trợ?{" "}
            <Link
              to="/contact"
              className="font-medium text-green-600 hover:text-green-700 transition-colors"
            >
              Liên hệ với chúng tôi
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;

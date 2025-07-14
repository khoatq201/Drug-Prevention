import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import GoogleLoginButton from "../../components/Google/GoogleLoginButton";
import api from "../../utils/api";

const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const response = await api.post("/auth/send-registration-otp", {
        email: data.email,
        firstName: data.firstName,
      });

      if (response.data.success) {
        toast.success("Mã xác thực đã được gửi đến email của bạn");
        // Navigate to OTP verification with all form data
        navigate("/otp-verification", {
          state: {
            email: data.email,
            firstName: data.firstName,
            type: "registration",
            formData: data,
          },
        });
      }
    } catch (error) {
      const message = error.response?.data?.message || "Có lỗi xảy ra";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const ageGroups = [
    { value: "student", label: "Học sinh (6-18 tuổi)" },
    { value: "university_student", label: "Sinh viên (18-25 tuổi)" },
    { value: "parent", label: "Phụ huynh" },
    { value: "teacher", label: "Giáo viên" },
    { value: "other", label: "Khác" },
  ];

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
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Tạo tài khoản mới
          </h2>

          <p className="text-gray-600 text-lg">
            Bước đầu tiên trên hành trình phòng chống ma túy
          </p>
        </motion.div>

        {/* Register Form */}
        <motion.div
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100/50 p-8"
          variants={fadeInUp}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* First Name Field */}
            <motion.div variants={fadeInUp}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  {...register("firstName", {
                    required: "Tên không được để trống",
                    maxLength: {
                      value: 50,
                      message: "Tên không được vượt quá 50 ký tự",
                    },
                  })}
                  className={`w-full px-4 py-3 pl-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 bg-white/70 backdrop-blur-sm ${
                    errors.firstName
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Nhập tên của bạn"
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              </div>
              {errors.firstName && (
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
                  {errors.firstName.message}
                </motion.p>
              )}
            </motion.div>

            {/* Email Field */}
            <motion.div variants={fadeInUp}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  {...register("email", {
                    required: "Email không được để trống",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Email không hợp lệ",
                    },
                  })}
                  className={`w-full px-4 py-3 pl-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 bg-white/70 backdrop-blur-sm ${
                    errors.email
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Nhập email của bạn"
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

            {/* Register Button */}
            <motion.button
              type="submit"
              disabled={loading}
              className={`
                cursor-pointer w-full py-3 px-4 rounded-lg font-semibold text-white
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
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Đang gửi...
                </div>
              ) : (
                "Gửi mã xác thực"
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

          {/* Login Link */}
          <motion.div className="mt-6 text-center" variants={fadeInUp}>
            <p className="text-gray-600 text-sm">
              Đã có tài khoản?{" "}
              <Link
                to="/login"
                className="text-green-600 hover:text-green-700 font-semibold underline transition-colors"
              >
                Đăng nhập ngay
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

export default Register;

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-md w-full space-y-8"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <div className="text-center">
          <motion.div
            className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </motion.div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Tạo tài khoản mới
          </h2>

          <p className="text-gray-600">Bước 1: Xác thực email</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* First Name */}
            <motion.div variants={fadeInUp}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("firstName", {
                  required: "Tên không được để trống",
                  maxLength: {
                    value: 50,
                    message: "Tên không được vượt quá 50 ký tự",
                  },
                })}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 ${
                  errors.firstName
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder="Nhập tên của bạn"
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.firstName.message}
                </p>
              )}
            </motion.div>

            {/* Email */}
            <motion.div variants={fadeInUp}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                {...register("email", {
                  required: "Email không được để trống",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Email không hợp lệ",
                  },
                })}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 ${
                  errors.email ? "border-red-300 bg-red-50" : "border-gray-300"
                }`}
                placeholder="Nhập email của bạn"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </motion.div>

            <motion.button
              type="submit"
              disabled={loading}
              className={`
                w-full py-3 px-4 rounded-lg font-semibold text-white
                transition duration-200 transform
                ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 hover:scale-105"
                }
              `}
              variants={fadeInUp}
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
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

          {/* Google Login */}
          <motion.div className="mt-6" variants={fadeInUp}>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Hoặc</span>
              </div>
            </div>

            <div className="mt-6">
              <GoogleLoginButton />
            </div>
          </motion.div>

          <motion.div className="mt-6 text-center" variants={fadeInUp}>
            <p className="text-gray-600 text-sm">
              Đã có tài khoản?{" "}
              <Link
                to="/login"
                className="text-green-600 hover:text-green-700 font-semibold underline"
              >
                Đăng nhập ngay
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;

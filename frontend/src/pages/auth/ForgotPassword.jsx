import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import api from "../../utils/api";

const ForgotPassword = () => {
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
      const response = await api.post("/auth/forgot-password", {
        email: data.email,
      });

      if (response.data.success) {
        toast.success("Mã xác thực đã được gửi đến email của bạn");
        navigate("/otp-verification", {
          state: {
            email: data.email,
            type: "password_reset",
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

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const slideInLeft = {
    hidden: { opacity: 0, x: -60 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-md w-full space-y-8"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <motion.div
              className="mx-auto w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6"
              variants={slideInLeft}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <svg
                className="w-10 h-10 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </motion.div>

            <motion.h2
              className="text-3xl font-bold text-gray-900 mb-2"
              variants={slideInLeft}
            >
              Quên mật khẩu?
            </motion.h2>

            <motion.p className="text-gray-600" variants={fadeInUp}>
              Nhập email của bạn để nhận mã xác thực đặt lại mật khẩu
            </motion.p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <motion.div variants={fadeInUp}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
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
                    : "bg-orange-600 hover:bg-orange-700 hover:scale-105"
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

          <motion.div className="mt-6 text-center" variants={fadeInUp}>
            <p className="text-gray-600 text-sm">
              Nhớ mật khẩu?{" "}
              <Link
                to="/login"
                className="text-green-600 hover:text-green-700 font-semibold underline"
              >
                Đăng nhập ngay
              </Link>
            </p>
          </motion.div>

          <motion.div className="mt-4 text-center" variants={fadeInUp}>
            <p className="text-gray-600 text-sm">
              Chưa có tài khoản?{" "}
              <Link
                to="/register"
                className="text-blue-600 hover:text-blue-700 font-semibold underline"
              >
                Đăng ký ngay
              </Link>
            </p>
          </motion.div>
        </div>

        {/* Information Card */}
        <motion.div
          className="bg-white rounded-xl p-6 shadow-lg"
          variants={fadeInUp}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6 text-blue-500 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                Lưu ý bảo mật
              </h3>
              <p className="text-xs text-gray-600">
                Mã xác thực sẽ có hiệu lực trong 10 phút. Vui lòng kiểm tra cả
                hộp thư spam nếu không thấy email.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;

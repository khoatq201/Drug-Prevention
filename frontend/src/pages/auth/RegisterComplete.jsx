import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import api from "../../utils/api";

const RegisterComplete = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch("password");

  // Kiểm tra xem có dữ liệu từ OTP verification không
  useEffect(() => {
    if (
      !location.state?.email ||
      !location.state?.firstName ||
      !location.state?.verified
    ) {
      toast.error("Phiên làm việc đã hết hạn. Vui lòng đăng ký lại.");
      navigate("/register");
    }
  }, [location.state, navigate]);

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const registrationData = {
        firstName: location.state.firstName,
        lastName: data.lastName,
        email: location.state.email,
        password: data.password,
        phone: data.phone,
        gender: data.gender,
        ageGroup: data.ageGroup,
      };

      const response = await api.post("/auth/register", registrationData);

      if (response.data.success) {
        toast.success("Đăng ký thành công! Chào mừng bạn đến với hệ thống.");

        // Lưu thông tin đăng nhập
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("refreshToken", response.data.refreshToken);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        // Chuyển đến trang chính hoặc dashboard
        navigate("/dashboard");
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Có lỗi xảy ra khi hoàn tất đăng ký";
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

  if (!location.state?.email || !location.state?.verified) {
    return null;
  }

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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </motion.div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Hoàn tất đăng ký
          </h2>

          <p className="text-gray-600">Bước 2: Điền thông tin cá nhân</p>

          <div className="mt-4 p-3 bg-green-100 rounded-lg">
            <p className="text-sm text-green-800">
              ✅ Email đã được xác thực: <strong>{location.state.email}</strong>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Last Name */}
            <motion.div variants={fadeInUp}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Họ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("lastName", {
                  required: "Họ không được để trống",
                  maxLength: {
                    value: 50,
                    message: "Họ không được vượt quá 50 ký tự",
                  },
                })}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 ${
                  errors.lastName
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder="Nhập họ của bạn"
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.lastName.message}
                </p>
              )}
            </motion.div>

            {/* Phone */}
            <motion.div variants={fadeInUp}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại
              </label>
              <input
                type="tel"
                {...register("phone", {
                  pattern: {
                    value: /^(\+84|0)[3|5|7|8|9][0-9]{8}$/,
                    message: "Số điện thoại không hợp lệ",
                  },
                })}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 ${
                  errors.phone ? "border-red-300 bg-red-50" : "border-gray-300"
                }`}
                placeholder="Nhập số điện thoại"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.phone.message}
                </p>
              )}
            </motion.div>

            {/* Age Group */}
            <motion.div variants={fadeInUp}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nhóm tuổi <span className="text-red-500">*</span>
              </label>
              <select
                {...register("ageGroup", { required: "Nhóm tuổi là bắt buộc" })}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 ${
                  errors.ageGroup
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
              >
                <option value="">Chọn nhóm tuổi</option>
                {ageGroups.map((group) => (
                  <option key={group.value} value={group.value}>
                    {group.label}
                  </option>
                ))}
              </select>
              {errors.ageGroup && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.ageGroup.message}
                </p>
              )}
            </motion.div>

            {/* Gender */}
            <motion.div variants={fadeInUp}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giới tính
              </label>
              <div className="flex space-x-4">
                <div className="flex items-center">
                  <input
                    id="male"
                    type="radio"
                    value="male"
                    {...register("gender")}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                  />
                  <label htmlFor="male" className="ml-2 text-sm text-gray-700">
                    Nam
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="female"
                    type="radio"
                    value="female"
                    {...register("gender")}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                  />
                  <label
                    htmlFor="female"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Nữ
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="other"
                    type="radio"
                    value="other"
                    {...register("gender")}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                  />
                  <label htmlFor="other" className="ml-2 text-sm text-gray-700">
                    Khác
                  </label>
                </div>
              </div>
            </motion.div>

            {/* Password */}
            <motion.div variants={fadeInUp}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password", {
                    required: "Mật khẩu là bắt buộc",
                    minLength: {
                      value: 6,
                      message: "Mật khẩu phải có ít nhất 6 ký tự",
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message:
                        "Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số",
                    },
                  })}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 ${
                    errors.password
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Nhập mật khẩu"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </motion.div>

            {/* Confirm Password */}
            <motion.div variants={fadeInUp}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Xác nhận mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword", {
                    required: "Xác nhận mật khẩu là bắt buộc",
                    validate: (value) =>
                      value === password || "Mật khẩu xác nhận không khớp",
                  })}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 ${
                    errors.confirmPassword
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Nhập lại mật khẩu"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </motion.div>

            {/* Terms and Conditions */}
            <motion.div variants={fadeInUp}>
              <div className="flex items-center">
                <input
                  id="terms"
                  type="checkbox"
                  {...register("terms", {
                    required: "Bạn phải đồng ý với điều khoản sử dụng",
                  })}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
                  Tôi đồng ý với{" "}
                  <Link
                    to="/terms"
                    className="text-green-600 hover:text-green-700 underline"
                  >
                    Điều khoản sử dụng
                  </Link>{" "}
                  và{" "}
                  <Link
                    to="/privacy"
                    className="text-green-600 hover:text-green-700 underline"
                  >
                    Chính sách bảo mật
                  </Link>
                  <span className="text-red-500"> *</span>
                </label>
              </div>
              {errors.terms && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.terms.message}
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
                  Hoàn tất đăng ký...
                </div>
              ) : (
                "Hoàn tất đăng ký"
              )}
            </motion.button>
          </form>

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

export default RegisterComplete;

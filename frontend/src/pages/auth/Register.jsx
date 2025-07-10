import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../../contexts/AuthContext";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser, loading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch("password");

  const onSubmit = async (data) => {
    const { confirmPassword, ...userData } = data;
    const result = await registerUser(userData);
    if (result.success) {
      navigate("/");
    }
  };

  const ageGroups = [
    { value: "student", label: "Học sinh (6-18 tuổi)" },
    { value: "university_student", label: "Sinh viên (18-25 tuổi)" },
    { value: "parent", label: "Phụ huynh" },
    { value: "teacher", label: "Giáo viên" },
    { value: "other", label: "Khác" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">PC</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Tạo tài khoản mới
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Đã có tài khoản?{" "}
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Đăng nhập ngay
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Họ <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    id="firstName"
                    type="text"
                    autoComplete="given-name"
                    className={`form-input ${errors.firstName ? "border-red-300" : ""}`}
                    {...register("firstName", {
                      required: "Họ là bắt buộc",
                      maxLength: {
                        value: 50,
                        message: "Họ không được vượt quá 50 ký tự",
                      },
                    })}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Tên <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    id="lastName"
                    type="text"
                    autoComplete="family-name"
                    className={`form-input ${errors.lastName ? "border-red-300" : ""}`}
                    {...register("lastName", {
                      required: "Tên là bắt buộc",
                      maxLength: {
                        value: 50,
                        message: "Tên không được vượt quá 50 ký tự",
                      },
                    })}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`form-input ${errors.email ? "border-red-300" : ""}`}
                  {...register("email", {
                    required: "Email là bắt buộc",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Email không hợp lệ",
                    },
                  })}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Số điện thoại
              </label>
              <div className="mt-1">
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  className={`form-input ${errors.phone ? "border-red-300" : ""}`}
                  {...register("phone", {
                    pattern: {
                      value: /^[0-9+\-\s()]+$/,
                      message: "Số điện thoại không hợp lệ",
                    },
                  })}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            {/* Age Group */}
            <div>
              <label
                htmlFor="ageGroup"
                className="block text-sm font-medium text-gray-700"
              >
                Nhóm tuổi <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <select
                  id="ageGroup"
                  className={`form-input ${errors.ageGroup ? "border-red-300" : ""}`}
                  {...register("ageGroup", {
                    required: "Vui lòng chọn nhóm tuổi",
                  })}
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
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Giới tính
              </label>
              <div className="mt-2 space-y-2">
                <div className="flex items-center">
                  <input
                    id="male"
                    type="radio"
                    value="male"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    {...register("gender")}
                  />
                  <label
                    htmlFor="male"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Nam
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="female"
                    type="radio"
                    value="female"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    {...register("gender")}
                  />
                  <label
                    htmlFor="female"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Nữ
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="other"
                    type="radio"
                    value="other"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    {...register("gender")}
                  />
                  <label
                    htmlFor="other"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Khác
                  </label>
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className={`form-input pr-10 ${errors.password ? "border-red-300" : ""}`}
                  {...register("password", {
                    required: "Mật khẩu là bắt buộc",
                    minLength: {
                      value: 6,
                      message: "Mật khẩu phải có ít nhất 6 ký tự",
                    },
                  })}
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
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Xác nhận mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className={`form-input pr-10 ${errors.confirmPassword ? "border-red-300" : ""}`}
                  {...register("confirmPassword", {
                    required: "Xác nhận mật khẩu là bắt buộc",
                    validate: (value) =>
                      value === password || "Mật khẩu xác nhận không khớp",
                  })}
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
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-center">
              <input
                id="terms"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                {...register("terms", {
                  required: "Bạn phải đồng ý với điều khoản sử dụng",
                })}
              />
              <label
                htmlFor="terms"
                className="ml-2 block text-sm text-gray-900"
              >
                Tôi đồng ý với{" "}
                <Link
                  to="/terms"
                  className="text-primary-600 hover:text-primary-500"
                  target="_blank"
                >
                  Điều khoản sử dụng
                </Link>{" "}
                và{" "}
                <Link
                  to="/privacy"
                  className="text-primary-600 hover:text-primary-500"
                  target="_blank"
                >
                  Chính sách bảo mật
                </Link>
              </label>
            </div>
            {errors.terms && (
              <p className="text-sm text-red-600">{errors.terms.message}</p>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Đang đăng ký...
                  </div>
                ) : (
                  "Đăng ký tài khoản"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;

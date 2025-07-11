import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import OTPInput from "../../components/OTPInput";
import api from "../../utils/api";

const OTPVerification = () => {
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [otpError, setOtpError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  // Get data from location state
  const { email, firstName, type = "registration" } = location.state || {};

  useEffect(() => {
    // Redirect if no email provided
    if (!email) {
      navigate("/register");
      return;
    }

    // Start countdown for resend
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate]);

  const handleOTPComplete = async (otpValue) => {
    setLoading(true);
    setOtpError("");

    try {
      const endpoint =
        type === "registration"
          ? "/auth/verify-registration-otp"
          : "/auth/verify-reset-otp";

      const response = await api.post(endpoint, {
        email,
        otp: otpValue,
      });

      if (response.data.success) {
        toast.success(response.data.message);

        if (type === "registration") {
          // Navigate to complete registration
          navigate("/register/complete", {
            state: { email, firstName, verified: true },
          });
        } else {
          // Navigate to reset password
          navigate("/reset-password", {
            state: { email, verified: true },
          });
        }
      }
    } catch (error) {
      const message = error.response?.data?.message || "Xác thực OTP thất bại";
      setOtpError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    setOtpError("");

    try {
      const endpoint =
        type === "registration"
          ? "/auth/send-registration-otp"
          : "/auth/forgot-password";

      const payload =
        type === "registration" ? { email, firstName } : { email };

      const response = await api.post(endpoint, payload);

      if (response.data.success) {
        toast.success("Mã OTP mới đã được gửi");
        setCountdown(60);

        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Không thể gửi lại mã OTP";
      toast.error(message);
    } finally {
      setResendLoading(false);
    }
  };

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
        <div className="bg-white rounded-2xl shadow-xl p-8">
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
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </motion.div>

            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Xác thực OTP
            </h2>

            <p className="text-gray-600 mb-2">
              {type === "registration"
                ? "Mã xác thực đăng ký đã được gửi đến"
                : "Mã xác thực đặt lại mật khẩu đã được gửi đến"}
            </p>

            <p className="text-green-600 font-semibold mb-8">{email}</p>
          </div>

          <OTPInput
            length={6}
            onComplete={handleOTPComplete}
            loading={loading}
            error={otpError}
          />

          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm mb-4">Không nhận được mã?</p>

            {countdown > 0 ? (
              <p className="text-gray-500 text-sm">
                Gửi lại sau {countdown} giây
              </p>
            ) : (
              <button
                onClick={handleResendOTP}
                disabled={resendLoading}
                className="text-green-600 hover:text-green-700 font-semibold text-sm underline disabled:opacity-50"
              >
                {resendLoading ? "Đang gửi..." : "Gửi lại mã OTP"}
              </button>
            )}
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() =>
                navigate(type === "registration" ? "/register" : "/login")
              }
              className="text-gray-500 hover:text-gray-700 text-sm underline"
            >
              ← Quay lại {type === "registration" ? "đăng ký" : "đăng nhập"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OTPVerification;

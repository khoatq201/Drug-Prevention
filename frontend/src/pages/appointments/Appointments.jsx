import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import {
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  StarIcon,
  PlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const Appointments = () => {
  const { user, isAuthenticated, api } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedCounselor, setSelectedCounselor] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/appointments" } } });
      return;
    }
    fetchAppointments();
    fetchCounselors();
  }, [isAuthenticated, navigate]);

  const fetchAppointments = async () => {
    try {
      const response = await api.get("/appointments/my-appointments");
      setAppointments(response.data.data || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const fetchCounselors = async () => {
    try {
      const response = await api.get("/counselors");
      setCounselors(response.data.data || []);
    } catch (error) {
      console.error("Error fetching counselors:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Chờ xác nhận";
      case "confirmed":
        return "Đã xác nhận";
      case "completed":
        return "Đã hoàn thành";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      case "confirmed":
        return <CheckCircleIcon className="w-4 h-4" />;
      case "completed":
        return <CheckCircleIcon className="w-4 h-4" />;
      case "cancelled":
        return <XCircleIcon className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    return timeString.slice(0, 5);
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gray-50 py-12"
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div className="text-center mb-12" variants={fadeInUp}>
          <CalendarDaysIcon className="mx-auto h-16 w-16 text-purple-600 mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Lịch hẹn tư vấn
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Đặt lịch hẹn với chuyên viên tư vấn để nhận được sự hỗ trợ chuyên nghiệp
            về phòng chống ma túy.
          </p>
        </motion.div>

        {/* Action Button */}
        <motion.div className="flex justify-center mb-8" variants={fadeInUp}>
          <Link
            to="/appointments/book"
            className="btn-primary"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Đặt lịch hẹn mới
          </Link>
        </motion.div>

        {/* Appointments List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* My Appointments */}
          <motion.div className="lg:col-span-2" variants={fadeInUp}>
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Lịch hẹn của tôi
                </h2>
              </div>
              
              <div className="p-6">
                {appointments.length > 0 ? (
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <motion.div
                        key={appointment._id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        whileHover={{ scale: 1.01 }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <UserIcon className="w-5 h-5 text-gray-400 mr-2" />
                              <span className="font-medium text-gray-900">
                                {appointment.counselorId?.firstName} {appointment.counselorId?.lastName}
                              </span>
                            </div>
                            
                            <div className="flex items-center text-sm text-gray-600 mb-2">
                              <CalendarDaysIcon className="w-4 h-4 mr-2" />
                              <span>{formatDate(appointment.appointmentDate)}</span>
                            </div>
                            
                            <div className="flex items-center text-sm text-gray-600 mb-3">
                              <ClockIcon className="w-4 h-4 mr-2" />
                              <span>
                                {formatTime(appointment.appointmentTime?.start)} - {formatTime(appointment.appointmentTime?.end)}
                              </span>
                            </div>

                            {appointment.notes && (
                              <p className="text-sm text-gray-600 mb-3">
                                <strong>Ghi chú:</strong> {appointment.notes}
                              </p>
                            )}
                          </div>

                          <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getStatusColor(appointment.status)}`}>
                            {getStatusIcon(appointment.status)}
                            <span className="ml-1">{getStatusText(appointment.status)}</span>
                          </div>
                        </div>

                        {appointment.status === "pending" && (
                          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                            <button className="btn-outline text-sm">
                              Chỉnh sửa
                            </button>
                            <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                              Hủy lịch
                            </button>
                          </div>
                        )}

                        {appointment.status === "completed" && !appointment.feedback && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <button className="btn-outline text-sm">
                              Đánh giá chuyên viên
                            </button>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Chưa có lịch hẹn nào
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Bạn chưa có lịch hẹn nào. Hãy đặt lịch hẹn đầu tiên với chuyên viên tư vấn.
                    </p>
                    <Link to="/appointments/book" className="btn-primary">
                      Đặt lịch hẹn ngay
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div className="space-y-6" variants={fadeInUp}>
            {/* Available Counselors */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Chuyên viên tư vấn
                </h3>
              </div>
              
              <div className="p-6">
                {counselors.slice(0, 3).map((counselor) => (
                  <div key={counselor._id} className="flex items-center space-x-3 mb-4 last:mb-0">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {counselor.userId?.firstName} {counselor.userId?.lastName}
                      </p>
                      <div className="flex items-center">
                        <StarIcon className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-600 ml-1">
                          {counselor.performance?.averageRating?.toFixed(1) || "5.0"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                <Link 
                  to="/counselors" 
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  Xem tất cả chuyên viên →
                </Link>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-purple-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-purple-900 mb-4">
                Lưu ý khi đặt lịch hẹn
              </h3>
              <ul className="space-y-2 text-sm text-purple-700">
                <li>• Đặt lịch trước ít nhất 24 giờ</li>
                <li>• Chuẩn bị câu hỏi trước buổi tư vấn</li>
                <li>• Đảm bảo môi trường yên tĩnh</li>
                <li>• Có thể hủy/đổi lịch trước 2 giờ</li>
              </ul>
            </div>

            {/* Emergency Contact */}
            <div className="bg-red-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Trường hợp khẩn cấp
              </h3>
              <p className="text-sm text-red-700 mb-4">
                Nếu bạn đang trong tình trạng khẩn cấp, hãy liên hệ ngay:
              </p>
              <div className="space-y-1">
                <a 
                  href="tel:115" 
                  className="block text-sm font-medium text-red-800 hover:text-red-900"
                >
                  📞 115 - Cấp cứu
                </a>
                <a 
                  href="tel:113" 
                  className="block text-sm font-medium text-red-800 hover:text-red-900"
                >
                  📞 113 - Công an
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Appointments;

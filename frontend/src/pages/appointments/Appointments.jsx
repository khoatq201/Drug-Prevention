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
  PencilIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const Appointments = () => {
  const { user, isAuthenticated, api } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [editFormData, setEditFormData] = useState({
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
    type: 'online',
    urgency: 'medium'
  });
  const [cancelReason, setCancelReason] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);

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
      const response = await api.get("/appointments");
      setAppointments(response.data.data || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const fetchCounselors = async () => {
    try {
      const response = await api.get("/counselors/search");
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

  const handleEditAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setEditFormData({
      appointmentDate: appointment.appointmentDate.split('T')[0],
      appointmentTime: `${appointment.appointmentTime.start}-${appointment.appointmentTime.end}`,
      reason: appointment.reason,
      type: appointment.type,
      urgency: appointment.urgency
    });
    setShowEditModal(true);
    // Load available slots for the current date
    if (appointment.counselorId?._id) {
      fetchAvailableSlots(appointment.counselorId._id, appointment.appointmentDate.split('T')[0]);
    }
  };

  const handleCancelAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowCancelModal(true);
  };

  const fetchAvailableSlots = async (counselorUserId, date) => {
    try {
      // First find the counselor by userId to get the counselor document ID
      const counselorResponse = await api.get(`/counselors/search?userId=${counselorUserId}`);
      const counselorDoc = counselorResponse.data.data?.[0];
      
      if (!counselorDoc) {
        throw new Error("Không tìm thấy chuyên viên");
      }
      
      // Then fetch the schedule using the counselor document ID
      const response = await api.get(`/counselors/${counselorDoc._id}/schedule?date=${date}`);
      setAvailableSlots(response.data.data?.availableSlots || []);
    } catch (error) {
      console.error("Error fetching available slots:", error);
      toast.error("Không thể tải lịch trống");
      setAvailableSlots([]);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const [startTime, endTime] = editFormData.appointmentTime.split('-');
      
      const response = await api.put(`/appointments/${selectedAppointment._id}`, {
        appointmentDate: editFormData.appointmentDate,
        appointmentTime: {
          start: startTime.trim(),
          end: endTime.trim()
        },
        reason: editFormData.reason,
        type: editFormData.type,
        urgency: editFormData.urgency
      });

      if (response.data.success) {
        toast.success("Lịch hẹn đã được cập nhật thành công!");
        setShowEditModal(false);
        fetchAppointments();
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast.error(error.response?.data?.message || "Không thể cập nhật lịch hẹn");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api.delete(`/appointments/${selectedAppointment._id}`, {
        data: { reason: cancelReason }
      });

      if (response.data.success) {
        toast.success("Lịch hẹn đã được hủy thành công!");
        setShowCancelModal(false);
        setCancelReason('');
        fetchAppointments();
      }
    } catch (error) {
      console.error("Error canceling appointment:", error);
      toast.error(error.response?.data?.message || "Không thể hủy lịch hẹn");
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
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
                            <button 
                              onClick={() => handleEditAppointment(appointment)}
                              className="btn-outline text-sm inline-flex items-center"
                            >
                              <PencilIcon className="w-4 h-4 mr-1" />
                              Chỉnh sửa
                            </button>
                            <button 
                              onClick={() => handleCancelAppointment(appointment)}
                              className="text-red-600 hover:text-red-700 text-sm font-medium inline-flex items-center"
                            >
                              <XCircleIcon className="w-4 h-4 mr-1" />
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
                  to="/appointments/book" 
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  Đặt lịch hẹn với chuyên viên →
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

      {/* Edit Appointment Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Chỉnh sửa lịch hẹn
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày hẹn
                </label>
                <input
                  type="date"
                  value={editFormData.appointmentDate}
                  onChange={(e) => {
                    setEditFormData({ ...editFormData, appointmentDate: e.target.value });
                    if (selectedAppointment?.counselorId?._id && e.target.value) {
                      fetchAvailableSlots(selectedAppointment.counselorId._id, e.target.value);
                    }
                  }}
                  min={getMinDate()}
                  max={getMaxDate()}
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giờ hẹn
                </label>
                <select
                  value={editFormData.appointmentTime}
                  onChange={(e) => setEditFormData({ ...editFormData, appointmentTime: e.target.value })}
                  className="form-input"
                  required
                >
                  <option value="">Chọn giờ</option>
                  {availableSlots.map((slot, index) => {
                    const timeSlot = typeof slot === 'string' ? slot : `${slot.start}-${slot.end}`;
                    return (
                      <option key={index} value={timeSlot}>
                        {timeSlot}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hình thức tư vấn
                </label>
                <select
                  value={editFormData.type}
                  onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                  className="form-input"
                >
                  <option value="online">Tư vấn online</option>
                  <option value="in_person">Tư vấn trực tiếp</option>
                  <option value="phone">Tư vấn qua điện thoại</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mức độ khẩn cấp
                </label>
                <select
                  value={editFormData.urgency}
                  onChange={(e) => setEditFormData({ ...editFormData, urgency: e.target.value })}
                  className="form-input"
                >
                  <option value="low">Thấp</option>
                  <option value="medium">Trung bình</option>
                  <option value="high">Cao</option>
                  <option value="emergency">Khẩn cấp</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lý do tư vấn
                </label>
                <textarea
                  value={editFormData.reason}
                  onChange={(e) => setEditFormData({ ...editFormData, reason: e.target.value })}
                  className="form-input"
                  rows={3}
                  required
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn-outline flex-1"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {loading ? "Đang cập nhật..." : "Cập nhật"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Appointment Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Hủy lịch hẹn
              </h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-600 mb-2">
                Bạn có chắc chắn muốn hủy lịch hẹn với <strong>{selectedAppointment?.counselorId?.firstName} {selectedAppointment?.counselorId?.lastName}</strong> vào ngày <strong>{selectedAppointment && formatDate(selectedAppointment.appointmentDate)}</strong>?
              </p>
              <p className="text-sm text-red-600">
                Lưu ý: Hành động này không thể hoàn tác.
              </p>
            </div>
            
            <form onSubmit={handleCancelSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lý do hủy (tùy chọn)
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Nhập lý do hủy lịch hẹn..."
                  className="form-input"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="btn-outline flex-1"
                >
                  Không hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 flex-1"
                >
                  {loading ? "Đang hủy..." : "Xác nhận hủy"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Appointments;

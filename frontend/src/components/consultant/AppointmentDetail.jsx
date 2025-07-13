import { useState } from "react";
import {
  XMarkIcon,
  UserIcon,
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  VideoCameraIcon,
  PhoneIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

const AppointmentDetail = ({ appointment, isOpen, onClose, onStatusUpdate }) => {
  const [notes, setNotes] = useState("");

  if (!isOpen || !appointment) return null;

  const statusOptions = [
    { value: "pending", label: "Chờ xác nhận", color: "text-yellow-600 bg-yellow-100" },
    { value: "confirmed", label: "Đã xác nhận", color: "text-blue-600 bg-blue-100" },
    { value: "in_progress", label: "Đang diễn ra", color: "text-green-600 bg-green-100" },
    { value: "completed", label: "Hoàn thành", color: "text-gray-600 bg-gray-100" },
    { value: "cancelled", label: "Đã hủy", color: "text-red-600 bg-red-100" },
    { value: "no_show", label: "Không đến", color: "text-red-600 bg-red-100" },
  ];

  const urgencyOptions = [
    { value: "low", label: "Thấp", color: "text-green-600 bg-green-100" },
    { value: "medium", label: "Trung bình", color: "text-yellow-600 bg-yellow-100" },
    { value: "high", label: "Cao", color: "text-orange-600 bg-orange-100" },
    { value: "urgent", label: "Khẩn cấp", color: "text-red-600 bg-red-100" },
  ];

  const getStatusInfo = (status) => {
    return statusOptions.find(opt => opt.value === status) || statusOptions[0];
  };

  const getUrgencyInfo = (urgency) => {
    return urgencyOptions.find(opt => opt.value === urgency) || urgencyOptions[0];
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "online":
        return VideoCameraIcon;
      case "in_person":
        return MapPinIcon;
      case "phone":
        return PhoneIcon;
      default:
        return ChatBubbleLeftRightIcon;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "online":
        return "Trực tuyến";
      case "in_person":
        return "Trực tiếp";
      case "phone":
        return "Điện thoại";
      default:
        return "Khác";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeObj) => {
    if (typeof timeObj === 'string') return timeObj;
    return `${timeObj?.start || ''} - ${timeObj?.end || ''}`;
  };

  const TypeIcon = getTypeIcon(appointment.type);
  const statusInfo = getStatusInfo(appointment.status);
  const urgencyInfo = getUrgencyInfo(appointment.urgency);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Chi tiết lịch hẹn</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Client Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <UserIcon className="w-5 h-5 mr-2" />
              Thông tin khách hàng
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Họ và tên</p>
                <p className="font-medium text-gray-900">
                  {appointment.userId?.firstName} {appointment.userId?.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{appointment.userId?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Số điện thoại</p>
                <p className="font-medium text-gray-900">{appointment.contactInfo?.phoneNumber || "Không có"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Nhóm tuổi</p>
                <p className="font-medium text-gray-900">{appointment.userId?.ageGroup || "Không xác định"}</p>
              </div>
            </div>
          </div>

          {/* Appointment Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <CalendarDaysIcon className="w-5 h-5 mr-2" />
                  Thông tin cuộc hẹn
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Ngày hẹn</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(appointment.appointmentDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Thời gian</p>
                    <p className="font-medium text-gray-900 flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      {formatTime(appointment.appointmentTime)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Hình thức</p>
                    <p className="font-medium text-gray-900 flex items-center">
                      <TypeIcon className="w-4 h-4 mr-1" />
                      {getTypeLabel(appointment.type)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Mức độ ưu tiên</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${urgencyInfo.color}`}>
                      {urgencyInfo.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Trạng thái hiện tại</p>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Contact Details */}
              {appointment.type === "online" && appointment.onlineInfo && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Thông tin trực tuyến</h4>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Platform</p>
                    <p className="font-medium">{appointment.onlineInfo.platform}</p>
                    {appointment.onlineInfo.meetingLink && (
                      <>
                        <p className="text-sm text-gray-600 mt-2">Link cuộc họp</p>
                        <a
                          href={appointment.onlineInfo.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 break-all"
                        >
                          {appointment.onlineInfo.meetingLink}
                        </a>
                      </>
                    )}
                  </div>
                </div>
              )}

              {appointment.type === "in_person" && appointment.locationInfo && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Địa điểm</h4>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="font-medium">{appointment.locationInfo.address}</p>
                    {appointment.locationInfo.room && (
                      <p className="text-sm text-gray-600">Phòng: {appointment.locationInfo.room}</p>
                    )}
                    {appointment.locationInfo.notes && (
                      <p className="text-sm text-gray-600 mt-1">{appointment.locationInfo.notes}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Reason */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Lý do tư vấn</h4>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-gray-700">{appointment.reason}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Assessment Info */}
          {appointment.relatedAssessment && (
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <DocumentTextIcon className="w-5 h-5 mr-2" />
                Đánh giá liên quan
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Điểm số</p>
                  <p className="font-medium text-gray-900">{appointment.relatedAssessment.score}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Mức độ rủi ro</p>
                  <p className="font-medium text-gray-900">{appointment.relatedAssessment.riskLevel}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày đánh giá</p>
                  <p className="font-medium text-gray-900">
                    {new Date(appointment.relatedAssessment.completedAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Notes Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Ghi chú của chuyên viên</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Thêm ghi chú về cuộc hẹn này..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Status Update */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Cập nhật trạng thái</h3>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((status) => (
                <button
                  key={status.value}
                  onClick={() => onStatusUpdate(appointment._id, status.value)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    appointment.status === status.value
                      ? `${status.color} border-current`
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Đóng
          </button>
          <button
            onClick={() => {
              // Save notes logic here
              onClose();
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Lưu ghi chú
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetail;
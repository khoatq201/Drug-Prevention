import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import ConsultantSidebar from "../../components/layout/ConsultantSidebar";
import ConsultantHeader from "../../components/layout/ConsultantHeader";
import AppointmentDetail from "../../components/consultant/AppointmentDetail";
import {
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChatBubbleLeftRightIcon,
  VideoCameraIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const ConsultantAppointments = () => {
  const { user, api } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    date: "",
    type: "",
    urgency: "",
  });
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    limit: 10,
  });
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const statusOptions = [
    { value: "pending", label: "Chờ xác nhận", color: "text-yellow-600 bg-yellow-100" },
    { value: "confirmed", label: "Đã xác nhận", color: "text-blue-600 bg-blue-100" },
    { value: "in_progress", label: "Đang diễn ra", color: "text-green-600 bg-green-100" },
    { value: "completed", label: "Hoàn thành", color: "text-gray-600 bg-gray-100" },
    { value: "cancelled", label: "Đã hủy", color: "text-red-600 bg-red-100" },
    { value: "no_show", label: "Không đến", color: "text-red-600 bg-red-100" },
  ];

  const typeOptions = [
    { value: "online", label: "Trực tuyến", icon: VideoCameraIcon },
    { value: "in_person", label: "Trực tiếp", icon: MapPinIcon },
    { value: "phone", label: "Điện thoại", icon: ChatBubbleLeftRightIcon },
  ];

  const urgencyOptions = [
    { value: "low", label: "Thấp", color: "text-green-600" },
    { value: "medium", label: "Trung bình", color: "text-yellow-600" },
    { value: "high", label: "Cao", color: "text-orange-600" },
    { value: "urgent", label: "Khẩn cấp", color: "text-red-600" },
  ];

  useEffect(() => {
    fetchAppointments();
  }, [pagination.current, filters, searchTerm]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.current,
        limit: pagination.limit,
        search: searchTerm,
        ...Object.fromEntries(
          Object.entries(filters).filter(([, value]) => value !== "")
        ),
      });

      const response = await api.get(`/appointments/counselor/${user._id}?${queryParams}`);
      
      if (response.data.success) {
        setAppointments(response.data.data);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
          count: response.data.pagination.count,
          totalResults: response.data.pagination.totalResults,
        }));
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Không thể tải danh sách lịch hẹn");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await api.put(`/appointments/${appointmentId}`, {
        status: newStatus,
      });
      
      toast.success("Cập nhật trạng thái thành công");
      fetchAppointments();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Không thể cập nhật trạng thái");
    }
  };

  const getStatusLabel = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption?.label || status;
  };

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption?.color || "text-gray-600 bg-gray-100";
  };

  const getTypeLabel = (type) => {
    const typeOption = typeOptions.find(opt => opt.value === type);
    return typeOption?.label || type;
  };

  const getTypeIcon = (type) => {
    const typeOption = typeOptions.find(opt => opt.value === type);
    return typeOption?.icon || ChatBubbleLeftRightIcon;
  };

  const getUrgencyLabel = (urgency) => {
    const urgencyOption = urgencyOptions.find(opt => opt.value === urgency);
    return urgencyOption?.label || urgency;
  };

  const getUrgencyColor = (urgency) => {
    const urgencyOption = urgencyOptions.find(opt => opt.value === urgency);
    return urgencyOption?.color || "text-gray-600";
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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ConsultantSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col">
        <ConsultantHeader onMenuToggle={() => setSidebarOpen(true)} />
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Quản lý lịch hẹn
                </h1>
                <p className="mt-2 text-gray-600">
                  Quản lý và theo dõi các cuộc hẹn tư vấn của bạn
                </p>
              </div>
              <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <CalendarDaysIcon className="w-5 h-5" />
                  <span>Hôm nay: {new Date().toLocaleDateString("vi-VN")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 space-y-4 lg:space-y-0">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo tên khách hàng, lý do..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-4">
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Tất cả trạng thái</option>
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange("type", e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Tất cả hình thức</option>
                  {typeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <input
                  type="date"
                  value={filters.date}
                  onChange={(e) => handleFilterChange("date", e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mb-6">
            <p className="text-gray-600">
              Hiển thị {pagination.count} / {pagination.totalResults} lịch hẹn
            </p>
          </div>

          {/* Appointments List */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : appointments.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <CalendarDaysIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Không có lịch hẹn
              </h3>
              <p className="text-gray-600 mb-4">
                Chưa có lịch hẹn nào theo tiêu chí tìm kiếm
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Khách hàng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thời gian
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hình thức
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lý do
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mức độ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {appointments.map((appointment) => {
                      const TypeIcon = getTypeIcon(appointment.type);
                      return (
                        <tr key={appointment._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <UserIcon className="w-6 h-6 text-green-600" />
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {appointment.userId?.firstName} {appointment.userId?.lastName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {appointment.userId?.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatDate(appointment.appointmentDate)}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <ClockIcon className="w-4 h-4 mr-1" />
                              {formatTime(appointment.appointmentTime)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              <TypeIcon className="w-4 h-4 mr-2" />
                              {getTypeLabel(appointment.type)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate">
                              {appointment.reason}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-medium ${getUrgencyColor(appointment.urgency)}`}>
                              {getUrgencyLabel(appointment.urgency)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={appointment.status}
                              onChange={(e) => handleStatusChange(appointment._id, e.target.value)}
                              className={`text-sm px-3 py-1 rounded-full border-0 font-medium ${getStatusColor(appointment.status)}`}
                            >
                              {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                setShowDetail(true);
                              }}
                              className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                              title="Xem chi tiết"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {pagination.total > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="flex items-center space-x-1">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
                  disabled={pagination.current === 1}
                  className="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                
                {Array.from({ length: pagination.total }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setPagination(prev => ({ ...prev, current: page }))}
                    className={`px-3 py-2 rounded-lg ${
                      page === pagination.current
                        ? "bg-green-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
                  disabled={pagination.current === pagination.total}
                  className="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </nav>
            </div>
          )}

          {/* Appointment Detail Modal */}
          <AppointmentDetail
            appointment={selectedAppointment}
            isOpen={showDetail}
            onClose={() => {
              setShowDetail(false);
              setSelectedAppointment(null);
            }}
            onStatusUpdate={handleStatusChange}
          />
        </main>
      </div>
    </div>
  );
};

export default ConsultantAppointments;
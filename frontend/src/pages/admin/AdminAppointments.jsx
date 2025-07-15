import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AdminSidebar from '../../components/layout/AdminSidebar';
import AdminHeader from '../../components/layout/AdminHeader';
import {
  CalendarDaysIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  VideoCameraIcon,
  MapPinIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const AdminAppointments = () => {
  const { api } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    urgency: '',
    counselor: '',
    date: '',
  });
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    totalResults: 0,
  });
  const [counselors, setCounselors] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  });

  const statusOptions = [
    { value: 'pending', label: 'Chờ xác nhận', color: 'text-yellow-600 bg-yellow-100' },
    { value: 'confirmed', label: 'Đã xác nhận', color: 'text-blue-600 bg-blue-100' },
    { value: 'in_progress', label: 'Đang diễn ra', color: 'text-green-600 bg-green-100' },
    { value: 'completed', label: 'Hoàn thành', color: 'text-gray-600 bg-gray-100' },
    { value: 'cancelled', label: 'Đã hủy', color: 'text-red-600 bg-red-100' },
    { value: 'no_show', label: 'Không đến', color: 'text-red-600 bg-red-100' },
  ];

  const typeOptions = [
    { value: 'online', label: 'Trực tuyến', icon: VideoCameraIcon, color: 'text-blue-600 bg-blue-100' },
    { value: 'in_person', label: 'Trực tiếp', icon: MapPinIcon, color: 'text-green-600 bg-green-100' },
    { value: 'phone', label: 'Điện thoại', icon: PhoneIcon, color: 'text-purple-600 bg-purple-100' },
  ];

  const urgencyOptions = [
    { value: 'low', label: 'Thấp', color: 'text-green-600' },
    { value: 'medium', label: 'Trung bình', color: 'text-yellow-600' },
    { value: 'high', label: 'Cao', color: 'text-orange-600' },
    { value: 'urgent', label: 'Khẩn cấp', color: 'text-red-600' },
  ];

  useEffect(() => {
    fetchAppointments();
    fetchCounselors();
    fetchAllAppointmentsForStats();
  }, [searchTerm, filters, pagination.current]);

  const fetchAppointments = async (page = 1) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        search: searchTerm,
        ...Object.fromEntries(
          Object.entries(filters).filter(([, value]) => value !== '')
        ),
      });

      const response = await api.get(`/appointments?${queryParams}`);
      if (response.data.success) {
        setAppointments(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Không thể tải danh sách cuộc hẹn');
    } finally {
      setLoading(false);
    }
  };

  const fetchCounselors = async () => {
    try {
      const response = await api.get('/counselors?limit=100&status=active');
      if (response.data.success) {
        setCounselors(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching counselors:', error);
    }
  };

  const fetchAllAppointmentsForStats = async () => {
    try {
      // Fetch all appointments without pagination for statistics
      const response = await api.get('/appointments?limit=1000');
      if (response.data.success) {
        const allAppointments = response.data.data;
        
        // Calculate stats from appointments data
        const stats = {
          total: allAppointments.length,
          pending: allAppointments.filter(apt => apt.status === 'pending').length,
          confirmed: allAppointments.filter(apt => apt.status === 'confirmed').length,
          completed: allAppointments.filter(apt => apt.status === 'completed').length,
          cancelled: allAppointments.filter(apt => apt.status === 'cancelled').length,
        };
        
        setStats(stats);
      }
    } catch (error) {
      console.error('Error fetching appointments for stats:', error);
      toast.error('Không thể tải thống kê cuộc hẹn');
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await api.put(`/appointments/${appointmentId}`, { status: newStatus });
      toast.success('Cập nhật trạng thái thành công');
      fetchAppointments(pagination.current);
      fetchAllAppointmentsForStats();
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  const handleDelete = async (appointmentId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa cuộc hẹn này?')) {
      return;
    }

    try {
      await api.delete(`/appointments/${appointmentId}`);
      toast.success('Xóa cuộc hẹn thành công');
      fetchAppointments(pagination.current);
      fetchAllAppointmentsForStats();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error('Không thể xóa cuộc hẹn');
    }
  };

  const getStatusStyle = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option?.color || 'text-gray-600 bg-gray-100';
  };

  const getStatusLabel = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option?.label || status;
  };

  const getTypeInfo = (type) => {
    const option = typeOptions.find(opt => opt.value === type);
    return option || { label: type, icon: ChatBubbleLeftRightIcon, color: 'text-gray-600 bg-gray-100' };
  };

  const getUrgencyInfo = (urgency) => {
    const option = urgencyOptions.find(opt => opt.value === urgency);
    return option || { label: urgency, color: 'text-gray-600' };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeObj) => {
    if (typeof timeObj === 'string') return timeObj;
    return `${timeObj?.start || ''} - ${timeObj?.end || ''}`;
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col">
        <AdminHeader onMenuToggle={() => setSidebarOpen(true)} />
        
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quản lý cuộc hẹn</h1>
              <p className="text-gray-600">Quản lý tất cả cuộc hẹn tư vấn trong hệ thống</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CalendarDaysIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tổng cuộc hẹn</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <ClockIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Chờ xác nhận</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Đã xác nhận</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.confirmed || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Hoàn thành</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completed || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircleIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Đã hủy</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.cancelled || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo tên khách hàng, chuyên viên..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Tất cả trạng thái</option>
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Tất cả hình thức</option>
                  {typeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Counselor Filter */}
              <div>
                <select
                  value={filters.counselor}
                  onChange={(e) => handleFilterChange('counselor', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Tất cả chuyên viên</option>
                  {counselors.map((counselor) => (
                    <option key={counselor._id} value={counselor._id}>
                      {counselor.userId?.firstName} {counselor.userId?.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Filter */}
              <div>
                <input
                  type="date"
                  value={filters.date}
                  onChange={(e) => handleFilterChange('date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mb-6">
            <p className="text-gray-600">
              Hiển thị {((pagination.current - 1) * 20) + 1} đến {Math.min(pagination.current * 20, pagination.totalResults)} 
              của {pagination.totalResults} cuộc hẹn
            </p>
          </div>

          {/* Appointments Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Khách hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Chuyên viên
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thời gian
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hình thức
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
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          <span className="ml-2">Đang tải...</span>
                        </div>
                      </td>
                    </tr>
                  ) : appointments.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                        Không tìm thấy cuộc hẹn nào
                      </td>
                    </tr>
                  ) : (
                    appointments.map((appointment) => {
                      const typeInfo = getTypeInfo(appointment.type);
                      const urgencyInfo = getUrgencyInfo(appointment.urgency);
                      const TypeIcon = typeInfo.icon;

                      return (
                        <tr key={appointment._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <UserIcon className="w-6 h-6 text-blue-600" />
                              </div>
                              <div className="ml-4">
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
                              {appointment.counselorId?.firstName} {appointment.counselorId?.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {appointment.counselorId?.email}
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
                            <div className="flex items-center">
                              <TypeIcon className="w-4 h-4 mr-2" />
                              <span className={`text-sm px-2 py-1 rounded-full ${typeInfo.color}`}>
                                {typeInfo.label}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-medium ${urgencyInfo.color}`}>
                              {urgencyInfo.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={appointment.status}
                              onChange={(e) => handleStatusChange(appointment._id, e.target.value)}
                              className={`text-sm px-3 py-1 rounded-full border-0 font-medium ${getStatusStyle(appointment.status)}`}
                            >
                              {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedAppointment(appointment);
                                  setShowDetail(true);
                                }}
                                className="text-blue-600 hover:text-blue-900 p-1"
                                title="Xem chi tiết"
                              >
                                <EyeIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(appointment._id)}
                                className="text-red-600 hover:text-red-900 p-1"
                                title="Xóa"
                              >
                                <XCircleIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.total > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-700">
                    Hiển thị {((pagination.current - 1) * 20) + 1} đến {Math.min(pagination.current * 20, pagination.totalResults)} 
                    của {pagination.totalResults} kết quả
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => fetchAppointments(pagination.current - 1)}
                      disabled={pagination.current === 1}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Trước
                    </button>
                    <span className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
                      {pagination.current}
                    </span>
                    <button
                      onClick={() => fetchAppointments(pagination.current + 1)}
                      disabled={pagination.current === pagination.total}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Appointment Detail Modal */}
          {showDetail && selectedAppointment && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Chi tiết cuộc hẹn
                  </h2>
                  <button
                    onClick={() => setShowDetail(false)}
                    className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Client Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông tin khách hàng</h3>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm text-gray-600">Họ và tên:</span>
                          <p className="font-medium text-gray-900">
                            {selectedAppointment.userId?.firstName} {selectedAppointment.userId?.lastName}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Email:</span>
                          <p className="font-medium text-gray-900">{selectedAppointment.userId?.email}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Số điện thoại:</span>
                          <p className="font-medium text-gray-900">{selectedAppointment.userId?.phone || 'Chưa có'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Counselor Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông tin chuyên viên</h3>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm text-gray-600">Họ và tên:</span>
                          <p className="font-medium text-gray-900">
                            {selectedAppointment.counselorId?.firstName} {selectedAppointment.counselorId?.lastName}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Email:</span>
                          <p className="font-medium text-gray-900">{selectedAppointment.counselorId?.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Appointment Details */}
                  <div className="mt-6 bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Chi tiết cuộc hẹn</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Ngày hẹn:</span>
                        <p className="font-medium text-gray-900">{formatDate(selectedAppointment.appointmentDate)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Thời gian:</span>
                        <p className="font-medium text-gray-900">{formatTime(selectedAppointment.appointmentTime)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Hình thức:</span>
                        <p className="font-medium text-gray-900">{getTypeInfo(selectedAppointment.type).label}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Mức độ:</span>
                        <p className="font-medium text-gray-900">{getUrgencyInfo(selectedAppointment.urgency).label}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Trạng thái:</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(selectedAppointment.status)}`}>
                          {getStatusLabel(selectedAppointment.status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Reason */}
                  {selectedAppointment.reason && (
                    <div className="mt-6 bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Lý do hẹn</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedAppointment.reason}</p>
                    </div>
                  )}

                  {/* Notes */}
                  {selectedAppointment.notes && (
                    <div className="mt-6 bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Ghi chú</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedAppointment.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowDetail(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminAppointments;
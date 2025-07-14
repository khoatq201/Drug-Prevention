import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import ConsultantSidebar from "../../components/layout/ConsultantSidebar";
import ConsultantHeader from "../../components/layout/ConsultantHeader";
import ClientAssessmentHistory from "../../components/consultant/ClientAssessmentHistory";
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const ConsultantClients = () => {
  const { user, api } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredClients, setFilteredClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showClientDetail, setShowClientDetail] = useState(false);
  const [showAssessmentHistory, setShowAssessmentHistory] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    // Filter clients based on search term
    const filtered = clients.filter(client =>
      `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.includes(searchTerm)
    );
    setFilteredClients(filtered);
  }, [clients, searchTerm]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      // Fetch all appointments for this counselor to get unique clients
      const response = await api.get(`/appointments/counselor/${user._id}?limit=1000`);
      if (response.data.success) {
        const appointments = response.data.data;
        
        // Get unique clients from appointments
        const clientMap = new Map();
        appointments.forEach(appointment => {
          if (appointment.userId) {
            const clientId = appointment.userId._id;
            if (!clientMap.has(clientId)) {
              // Calculate client stats
              const clientAppointments = appointments.filter(apt => apt.userId._id === clientId);
              const completedSessions = clientAppointments.filter(apt => apt.status === 'completed').length;
              const totalSessions = clientAppointments.length;
              const lastAppointment = clientAppointments
                .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))[0];
              const nextAppointment = clientAppointments
                .filter(apt => new Date(apt.appointmentDate) > new Date() && apt.status !== 'cancelled')
                .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))[0];

              clientMap.set(clientId, {
                ...appointment.userId,
                stats: {
                  totalSessions,
                  completedSessions,
                  lastAppointmentDate: lastAppointment?.appointmentDate,
                  nextAppointmentDate: nextAppointment?.appointmentDate,
                  riskLevel: appointment.relatedAssessment?.riskLevel || 'Chưa đánh giá',
                },
                appointments: clientAppointments,
              });
            }
          }
        });

        setClients(Array.from(clientMap.values()));
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast.error("Không thể tải danh sách khách hàng");
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'low':
      case 'thấp':
        return 'text-green-600 bg-green-100';
      case 'moderate':
      case 'trung bình':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
      case 'cao':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa có';
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const openClientDetail = (client) => {
    setSelectedClient(client);
    setShowClientDetail(true);
  };

  const openAssessmentHistory = (client) => {
    setSelectedClient(client);
    setShowAssessmentHistory(true);
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
                  Khách hàng của tôi
                </h1>
                <p className="mt-2 text-gray-600">
                  Quản lý thông tin và theo dõi tiến trình của khách hàng
                </p>
              </div>
              <div className="mt-4 sm:mt-0 text-right">
                <p className="text-sm text-gray-500">Tổng số khách hàng</p>
                <p className="text-2xl font-bold text-green-600">{clients.length}</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          {/* Clients List */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? "Không tìm thấy khách hàng" : "Chưa có khách hàng"}
              </h3>
              <p className="text-gray-600">
                {searchTerm ? "Thử thay đổi từ khóa tìm kiếm" : "Chưa có khách hàng nào đặt lịch với bạn"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClients.map((client) => (
                <div
                  key={client._id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
                >
                  {/* Client Header */}
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-semibold text-lg">
                        {client.firstName?.charAt(0)}{client.lastName?.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {client.firstName} {client.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">{client.ageGroup || 'Không xác định'}</p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <EnvelopeIcon className="w-4 h-4 mr-2" />
                      <span className="truncate">{client.email}</span>
                    </div>
                    {client.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <PhoneIcon className="w-4 h-4 mr-2" />
                        <span>{client.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">
                        {client.stats.completedSessions}
                      </div>
                      <div className="text-xs text-gray-600">Buổi hoàn thành</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">
                        {client.stats.totalSessions}
                      </div>
                      <div className="text-xs text-gray-600">Tổng buổi</div>
                    </div>
                  </div>

                  {/* Risk Level */}
                  <div className="mb-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskLevelColor(client.stats.riskLevel)}`}>
                      Mức độ rủi ro: {client.stats.riskLevel}
                    </span>
                  </div>

                  {/* Last/Next Appointment */}
                  <div className="text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <CalendarDaysIcon className="w-4 h-4 mr-1" />
                      <span>Lần cuối: {formatDate(client.stats.lastAppointmentDate)}</span>
                    </div>
                    {client.stats.nextAppointmentDate && (
                      <div className="flex items-center mt-1">
                        <CalendarDaysIcon className="w-4 h-4 mr-1" />
                        <span>Lần tới: {formatDate(client.stats.nextAppointmentDate)}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => openClientDetail(client)}
                      className="flex items-center justify-center px-2 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                    >
                      <EyeIcon className="w-4 h-4 mr-1" />
                      Chi tiết
                    </button>
                    <button
                      onClick={() => openAssessmentHistory(client)}
                      className="flex items-center justify-center px-2 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                    >
                      <ClipboardDocumentCheckIcon className="w-4 h-4 mr-1" />
                      Đánh giá
                    </button>
                    <button
                      onClick={() => {
                        // Navigate to appointments with client filter
                        window.location.href = `/consultant/appointments?clientId=${client._id}`;
                      }}
                      className="col-span-2 flex items-center justify-center px-2 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                    >
                      <CalendarDaysIcon className="w-4 h-4 mr-1" />
                      Xem lịch hẹn
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Client Detail Modal */}
          {showClientDetail && selectedClient && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Thông tin chi tiết khách hàng
                  </h2>
                  <button
                    onClick={() => setShowClientDetail(false)}
                    className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông tin cơ bản</h3>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm text-gray-600">Họ và tên:</span>
                          <p className="font-medium text-gray-900">
                            {selectedClient.firstName} {selectedClient.lastName}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Email:</span>
                          <p className="font-medium text-gray-900">{selectedClient.email}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Số điện thoại:</span>
                          <p className="font-medium text-gray-900">{selectedClient.phone || 'Chưa có'}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Nhóm tuổi:</span>
                          <p className="font-medium text-gray-900">{selectedClient.ageGroup || 'Không xác định'}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Mức độ rủi ro:</span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskLevelColor(selectedClient.stats.riskLevel)}`}>
                            {selectedClient.stats.riskLevel}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Statistics */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Thống kê</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {selectedClient.stats.completedSessions}
                          </div>
                          <div className="text-sm text-gray-600">Buổi hoàn thành</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {selectedClient.stats.totalSessions}
                          </div>
                          <div className="text-sm text-gray-600">Tổng buổi</div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-sm text-gray-600 mb-1">Tỷ lệ hoàn thành</div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{
                                width: `${selectedClient.stats.totalSessions > 0 
                                  ? (selectedClient.stats.completedSessions / selectedClient.stats.totalSessions) * 100 
                                  : 0}%`
                              }}
                            ></div>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {selectedClient.stats.totalSessions > 0 
                              ? Math.round((selectedClient.stats.completedSessions / selectedClient.stats.totalSessions) * 100)
                              : 0}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Appointments */}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Lịch hẹn gần đây</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      {selectedClient.appointments?.slice(0, 5).map((appointment) => (
                        <div key={appointment._id} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                          <div>
                            <p className="font-medium text-gray-900">
                              {new Date(appointment.appointmentDate).toLocaleDateString("vi-VN")}
                            </p>
                            <p className="text-sm text-gray-600">{appointment.reason}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            appointment.status === 'completed' ? 'text-green-600 bg-green-100' :
                            appointment.status === 'confirmed' ? 'text-blue-600 bg-blue-100' :
                            appointment.status === 'cancelled' ? 'text-red-600 bg-red-100' :
                            'text-yellow-600 bg-yellow-100'
                          }`}>
                            {appointment.status === 'completed' ? 'Hoàn thành' :
                             appointment.status === 'confirmed' ? 'Đã xác nhận' :
                             appointment.status === 'cancelled' ? 'Đã hủy' : 'Chờ xác nhận'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowClientDetail(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Đóng
                  </button>
                  <button
                    onClick={() => {
                      setShowClientDetail(false);
                      openAssessmentHistory(selectedClient);
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Xem đánh giá
                  </button>
                  <button
                    onClick={() => {
                      window.location.href = `/consultant/appointments?clientId=${selectedClient._id}`;
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Xem tất cả lịch hẹn
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Client Assessment History Modal */}
          <ClientAssessmentHistory
            client={selectedClient}
            isOpen={showAssessmentHistory}
            onClose={() => {
              setShowAssessmentHistory(false);
              setSelectedClient(null);
            }}
          />
        </main>
      </div>
    </div>
  );
};

export default ConsultantClients;
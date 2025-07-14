import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ConsultantSidebar from "../components/layout/ConsultantSidebar";
import ConsultantHeader from "../components/layout/ConsultantHeader";
import {
  CalendarDaysIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ArrowRightIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const ConsultantDashboard = () => {
  const { user, api } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    todayAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
    totalClients: 0,
    monthlyAppointments: 0,
  });
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentClients, setRecentClients] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchAppointmentStats(),
        fetchTodayAppointments(),
        fetchUpcomingAppointments(),
      ]);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointmentStats = async () => {
    try {
      const response = await api.get(`/appointments/counselor/${user._id}?limit=100`);
      if (response.data.success) {
        const appointments = response.data.data;
        const today = new Date().toDateString();
        
        const todayCount = appointments.filter(apt => 
          new Date(apt.appointmentDate).toDateString() === today
        ).length;
        
        const upcomingCount = appointments.filter(apt => 
          new Date(apt.appointmentDate) > new Date() && apt.status !== 'cancelled'
        ).length;
        
        const completedCount = appointments.filter(apt => 
          apt.status === 'completed'
        ).length;

        const uniqueClients = new Set(appointments.map(apt => apt.userId?._id)).size;
        
        // Monthly appointments (current month)
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyCount = appointments.filter(apt => {
          const aptDate = new Date(apt.appointmentDate);
          return aptDate.getMonth() === currentMonth && aptDate.getFullYear() === currentYear;
        }).length;

        setStats({
          totalAppointments: appointments.length,
          todayAppointments: todayCount,
          upcomingAppointments: upcomingCount,
          completedAppointments: completedCount,
          totalClients: uniqueClients,
          monthlyAppointments: monthlyCount,
        });
      }
    } catch (error) {
      console.error("Error fetching appointment stats:", error);
    }
  };

  const fetchTodayAppointments = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await api.get(`/appointments/counselor/${user._id}?date=${today}&limit=5`);
      if (response.data.success) {
        setTodayAppointments(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching today appointments:", error);
    }
  };

  const fetchUpcomingAppointments = async () => {
    try {
      const response = await api.get(`/appointments/counselor/${user._id}?status=confirmed&limit=5`);
      if (response.data.success) {
        const upcoming = response.data.data.filter(apt => 
          new Date(apt.appointmentDate) > new Date()
        );
        setUpcomingAppointments(upcoming);
      }
    } catch (error) {
      console.error("Error fetching upcoming appointments:", error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeObj) => {
    if (typeof timeObj === 'string') return timeObj;
    return `${timeObj?.start || ''} - ${timeObj?.end || ''}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'confirmed': return 'text-blue-600 bg-blue-100';
      case 'in_progress': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-gray-600 bg-gray-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Chờ xác nhận';
      case 'confirmed': return 'Đã xác nhận';
      case 'in_progress': return 'Đang diễn ra';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <ConsultantSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col">
          <ConsultantHeader onMenuToggle={() => setSidebarOpen(true)} />
          <main className="flex-1 p-6">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ConsultantSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col">
        <ConsultantHeader onMenuToggle={() => setSidebarOpen(true)} />
        <main className="flex-1 p-6">
          {/* Welcome Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Chào mừng, {user?.firstName} {user?.lastName}
                </h1>
                <p className="mt-2 text-gray-600">
                  Tổng quan hoạt động tư vấn của bạn hôm nay
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Hôm nay</p>
                <p className="text-2xl font-bold text-green-600">{stats.todayAppointments}</p>
                <p className="text-sm text-gray-500">cuộc hẹn</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CalendarDaysIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tổng cuộc hẹn</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalAppointments}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Đã hoàn thành</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedAppointments}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <ClockIcon className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Sắp tới</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.upcomingAppointments}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <UserGroupIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Khách hàng</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalClients}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Today's Appointments */}
            <div className="bg-white rounded-lg shadow">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Lịch hẹn hôm nay</h2>
                <Link
                  to="/consultant/appointments"
                  className="text-green-600 hover:text-green-700 font-medium flex items-center"
                >
                  Xem tất cả
                  <ArrowRightIcon className="w-4 h-4 ml-1" />
                </Link>
              </div>
              <div className="p-6">
                {todayAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarDaysIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">Không có lịch hẹn nào hôm nay</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {todayAppointments.map((appointment) => (
                      <div key={appointment._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 font-semibold text-sm">
                              {appointment.userId?.firstName?.charAt(0)}
                              {appointment.userId?.lastName?.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {appointment.userId?.firstName} {appointment.userId?.lastName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatTime(appointment.appointmentTime)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                            {getStatusLabel(appointment.status)}
                          </span>
                          <Link
                            to="/consultant/appointments"
                            className="text-green-600 hover:text-green-700 p-1 rounded hover:bg-green-50"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white rounded-lg shadow">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Lịch hẹn sắp tới</h2>
                <Link
                  to="/consultant/appointments?status=confirmed"
                  className="text-green-600 hover:text-green-700 font-medium flex items-center"
                >
                  Xem tất cả
                  <ArrowRightIcon className="w-4 h-4 ml-1" />
                </Link>
              </div>
              <div className="p-6">
                {upcomingAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">Không có lịch hẹn sắp tới</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <div key={appointment._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">
                              {appointment.userId?.firstName?.charAt(0)}
                              {appointment.userId?.lastName?.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {appointment.userId?.firstName} {appointment.userId?.lastName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDate(appointment.appointmentDate)} - {formatTime(appointment.appointmentTime)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                            {getStatusLabel(appointment.status)}
                          </span>
                          <Link
                            to="/consultant/appointments"
                            className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Thao tác nhanh</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/consultant/appointments"
                className="bg-green-50 border border-green-200 rounded-lg p-4 hover:bg-green-100 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-200 rounded-lg flex items-center justify-center group-hover:bg-green-300 transition-colors">
                    <CalendarDaysIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Quản lý lịch hẹn</h4>
                    <p className="text-sm text-gray-600">Xem và cập nhật lịch hẹn</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/consultant/schedule"
                className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-200 rounded-lg flex items-center justify-center group-hover:bg-blue-300 transition-colors">
                    <ClockIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Lịch làm việc</h4>
                    <p className="text-sm text-gray-600">Thiết lập thời gian làm việc</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/consultant/clients"
                className="bg-purple-50 border border-purple-200 rounded-lg p-4 hover:bg-purple-100 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-200 rounded-lg flex items-center justify-center group-hover:bg-purple-300 transition-colors">
                    <UserGroupIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Khách hàng</h4>
                    <p className="text-sm text-gray-600">Quản lý thông tin khách hàng</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ConsultantDashboard;
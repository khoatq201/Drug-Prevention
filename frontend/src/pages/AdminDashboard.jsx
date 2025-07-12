import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/layout/AdminSidebar";
import AdminHeader from "../components/layout/AdminHeader";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const statsEndpoints = [
  { key: "users", label: "Người dùng", url: "/users/stats/overview" },
  { key: "courses", label: "Khóa học", url: "/courses/stats/overview" },
  { key: "assessments", label: "Đánh giá", url: "/assessments/stats/overview" },
  { key: "counselors", label: "Chuyên viên tư vấn", url: "/counselors/stats/overview" },
  { key: "programs", label: "Chương trình", url: "/programs/stats/overview" },
  { key: "blogs", label: "Bài viết", url: "/blogs/stats/overview" },
  { key: "appointments", label: "Cuộc hẹn", url: "/appointments/stats/overview" },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const AdminDashboard = () => {
  const { user, isAuthenticated, api, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({});
  const [error, setError] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  
  // Ref để đảm bảo chỉ fetch 1 lần khi AuthContext sẵn sàng
  const hasInitialFetch = useRef(false);

  useEffect(() => {
    if (authLoading) return; // Đợi xác thực xong
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/admin" } } });
      return;
    }
    if (user?.role !== "admin") {
      navigate("/dashboard");
      return;
    }
    
    // Chỉ fetch khi AuthContext đã hoàn toàn sẵn sàng
    if (!hasInitialFetch.current) {
      const timer = setTimeout(() => {
        console.log("🔍 AdminDashboard - AuthContext ready, fetching stats");
        fetchAllStats();
        hasInitialFetch.current = true;
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, authLoading, user, navigate]);

  const fetchAllStats = async () => {
    // Kiểm tra token trước khi gọi API
    const token = localStorage.getItem("token");
    if (!isAuthenticated || !token) {
      console.log("🔍 AdminDashboard - fetchAllStats skipped - not ready:", { 
        isAuthenticated, 
        token: !!token 
      });
      return;
    }

    setLoadingStats(true);
    setError(null);
    try {
      console.log("🔍 AdminDashboard - fetchAllStats called - all conditions met");
      
      const results = await Promise.all(
        statsEndpoints.map((endpoint) =>
          api.get(endpoint.url).then((res) => res.data.data).catch(() => null)
        )
      );
      const statsObj = {};
      statsEndpoints.forEach((endpoint, idx) => {
        statsObj[endpoint.key] = results[idx];
      });
      setStats(statsObj);
    } catch (err) {
      console.error("🔍 AdminDashboard - fetchAllStats error:", err);
      setError("Lỗi khi tải thống kê hệ thống.");
      
      // Nếu lỗi 401, có thể token chưa sẵn sàng
      if (err.response?.status === 401) {
        console.log("🔍 AdminDashboard - 401 error, token might not be ready");
        hasInitialFetch.current = false; // Reset để có thể thử lại
      }
    } finally {
      setLoadingStats(false);
    }
  };

  const getChartData = () => {
    const data = [];
    if (stats.users?.overview) {
      data.push({
        name: "Người dùng",
        total: stats.users.overview.totalUsers,
        active: stats.users.overview.activeUsers,
      });
    }
    if (stats.courses) {
      data.push({
        name: "Khóa học",
        total: stats.courses.totalCourses,
        enrollments: stats.courses.totalEnrollments,
      });
    }
    if (stats.assessments) {
      data.push({
        name: "Đánh giá",
        total: stats.assessments.totalAssessments,
      });
    }
    if (stats.counselors?.overview) {
      data.push({
        name: "Chuyên viên",
        total: stats.counselors.overview.totalCounselors,
        sessions: stats.counselors.overview.totalSessions,
      });
    }
    return data;
  };

  const getPieData = () => {
    if (!stats.users?.roleBreakdown) return [];
    return stats.users.roleBreakdown.map((item, index) => ({
      name: item.role,
      value: item.count,
      color: COLORS[index % COLORS.length],
    }));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (loadingStats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col">
        <AdminHeader onMenuToggle={() => setSidebarOpen(true)} />
        
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Tổng quan hệ thống</h1>
            <p className="text-gray-600">Thống kê tổng quan về hoạt động của hệ thống</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tổng người dùng</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.users?.overview?.totalUsers || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Khóa học</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.courses?.totalCourses || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Đánh giá</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.assessments?.totalAssessments || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Chuyên viên</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.counselors?.overview?.totalCounselors || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Bar Chart */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Thống kê tổng quan</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" fill="#8884d8" name="Tổng số" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Phân bố vai trò người dùng</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getPieData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getPieData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Users Stats */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Thống kê người dùng</h3>
              {stats.users?.overview ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Đang hoạt động:</span>
                    <span className="font-semibold">{stats.users.overview.activeUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Đã xác thực email:</span>
                    <span className="font-semibold">{stats.users.overview.verifiedUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tỉ lệ xác thực:</span>
                    <span className="font-semibold">{stats.users.overview.verificationRate}%</span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Không có dữ liệu</p>
              )}
            </div>

            {/* Courses Stats */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Thống kê khóa học</h3>
              {stats.courses ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Tổng khóa học:</span>
                    <span className="font-semibold">{stats.courses.totalCourses}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tổng lượt đăng ký:</span>
                    <span className="font-semibold">{stats.courses.totalEnrollments}</span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Không có dữ liệu</p>
              )}
            </div>

            {/* Blog Stats */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Thống kê bài viết</h3>
              {stats.blogs?.overview ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Tổng bài viết:</span>
                    <span className="font-semibold">{stats.blogs.overview.totalPosts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lượt xem:</span>
                    <span className="font-semibold">{stats.blogs.overview.totalViews}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lượt thích:</span>
                    <span className="font-semibold">{stats.blogs.overview.totalLikes}</span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Không có dữ liệu</p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard; 
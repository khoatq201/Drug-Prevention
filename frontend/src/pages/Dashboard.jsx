import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import {
  ChartBarIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  BookOpenIcon,
  TrophyIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

const Dashboard = () => {
  const { user, isAuthenticated, api } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    assessmentsCompleted: 0,
    coursesEnrolled: 0,
    coursesCompleted: 0,
    upcomingAppointments: 0,
    totalScore: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [recentAssessments, setRecentAssessments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/dashboard" } } });
      return;
    }
    
    // Redirect consultant to their dashboard
    if (user?.role === "consultant") {
      navigate("/consultant");
      return;
    }
    
    fetchDashboardData();
  }, [isAuthenticated, user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchUserStats(),
        fetchRecentAssessments(),
        fetchUpcomingAppointments(),
        fetchEnrolledCourses(),
      ]);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await api.get("/users/stats");
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  const fetchRecentAssessments = async () => {
    try {
      const response = await api.get("/assessments/my-assessments?limit=3");
      if (response.data.success) {
        setRecentAssessments(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching recent assessments:", error);
    }
  };

  const fetchUpcomingAppointments = async () => {
    try {
      const response = await api.get("/appointments");
      if (response.data.success) {
        const allAppointments = response.data.data || [];
        
        // Filter for upcoming appointments (pending or confirmed status and future date)
        const upcoming = allAppointments.filter(appointment => {
          const appointmentDate = new Date(appointment.appointmentDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          return appointmentDate >= today && (appointment.status === 'pending' || appointment.status === 'confirmed');
        });
        
        setUpcomingAppointments(upcoming);
      }
    } catch (error) {
      console.error("Error fetching upcoming appointments:", error);
    }
  };

  const fetchEnrolledCourses = async () => {
    try {
      debugger
      const response = await api.get(`/courses/user/${user?._id}/enrolled`);
      console.log('Enrolled courses response:', response.data);
      if (response.data.success) {
        setEnrolledCourses(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
    }
  };

  const getRiskLevel = (score, type) => {
    if (type === 'ASSIST') {
      if (score >= 27) return { level: 'Cao', color: 'text-red-600', bgColor: 'bg-red-100' };
      if (score >= 4) return { level: 'Trung bình', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
      return { level: 'Thấp', color: 'text-green-600', bgColor: 'bg-green-100' };
    }
    return { level: 'Chưa đánh giá', color: 'text-gray-600', bgColor: 'bg-gray-100' };
  };

  const getRiskLevelStyle = (riskLevel) => {
    switch (riskLevel) {
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      case "moderate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "severe":
        return "bg-red-200 text-red-900 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRiskLevelText = (riskLevel) => {
    switch (riskLevel) {
      case "low":
        return "Rủi ro thấp";
      case "moderate":
        return "Rủi ro trung bình";
      case "high":
        return "Rủi ro cao";
      case "severe":
        return "Rủi ro rất cao";
      default:
        return "Chưa xác định";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
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
      className="min-h-screen bg-gray-50 py-8"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <motion.div className="mb-8" variants={fadeInUp}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {getGreeting()}, {user?.firstName}!
              </h1>
              <p className="text-gray-600 mt-1">
                Chào mừng bạn quay lại với hệ thống phòng chống ma túy
              </p>
            </div>
            <div className="hidden md:block">
              <ChartBarIcon className="h-12 w-12 text-blue-600" />
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" variants={fadeInUp}>
          <div className="stats-card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClipboardDocumentListIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Bài đánh giá</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.assessmentsCompleted}</p>
              </div>
            </div>
          </div>

          <div className="stats-card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpenIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Khóa học</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {enrolledCourses.length}
                </p>
              </div>
            </div>
          </div>

          <div className="stats-card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarDaysIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Lịch hẹn sắp tới</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.upcomingAppointments}</p>
              </div>
            </div>
          </div>

          <div className="stats-card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrophyIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Điểm tổng</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalScore}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Assessments */}
            <motion.div className="bg-white rounded-lg shadow-md" variants={fadeInUp}>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Đánh giá gần đây
                  </h2>
                  <Link
                    to="/assessments"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Xem tất cả
                  </Link>
                </div>
              </div>
              
              <div className="p-6">
                {recentAssessments.length > 0 ? (
                  <div className="space-y-4">
                    {recentAssessments.map((assessment) => {
                      const assessmentName = assessment.assessmentId?.name || assessment.type;
                      const riskLevel = assessment.riskLevel?.level || 'unknown';
                      const score = assessment.score?.total || 0;
                      const risk = getRiskLevel(score, assessment.assessmentId?.type);
                      return (
                        <Link 
                          key={assessment._id} 
                          to={`/assessments/${assessment.assessmentId?._id}/result/${assessment._id}`}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
                        >
                          <div className="flex items-center">
                            <ClipboardDocumentListIcon className="h-8 w-8 text-gray-400 mr-3" />
                            <div>
                              <p className="font-medium text-gray-900">{assessmentName}</p>
                              <p className="text-sm text-gray-500">{formatDate(assessment.completedAt)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">{score} điểm</p>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRiskLevelStyle(riskLevel)}`}>
                              {getRiskLevelText(riskLevel)}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Chưa có bài đánh giá nào
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Hãy thực hiện bài đánh giá đầu tiên để hiểu rõ mức độ rủi ro.
                    </p>
                    <Link to="/assessments" className="btn-primary">
                      Bắt đầu đánh giá
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Enrolled Courses */}
            <motion.div className="bg-white rounded-lg shadow-md" variants={fadeInUp}>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Khóa học của tôi
                  </h2>
                  <Link
                    to="/courses"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Xem tất cả
                  </Link>
                </div>
              </div>
              
              <div className="p-6">
                {enrolledCourses.length > 0 ? (
                  <div className="space-y-4">
                    {enrolledCourses.map((enrollment) => {
                      const course = enrollment.courseId || enrollment;
                      // Flatten all lessons from all modules
                      const allLessons = course.modules?.flatMap(m => m.lessons || []) || [];
                      const completedLessons = enrollment.progress?.completedLessons || [];
                      const progress = allLessons.length > 0
                        ? Math.round((completedLessons.length / allLessons.length) * 100)
                        : 0;
                      return (
                        <div key={course._id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">{course.title}</h3>
                              <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                            </div>
                            {progress === 100 ? (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                <CheckCircleIcon className="w-3 h-3 mr-1" />
                                Hoàn thành
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                <ClockIcon className="w-3 h-3 mr-1" />
                                Đang học
                              </span>
                            )}
                          </div>
                          
                          <div className="mb-3">
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                              <span>Tiến độ</span>
                              <span>{progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <Link
                            to={`/courses/${course._id}`}
                            className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            {progress === 100 ? 'Xem lại' : 'Tiếp tục học'}
                            <ArrowRightIcon className="w-4 h-4 ml-1" />
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Chưa tham gia khóa học nào
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Khám phá các khóa học phòng chống ma túy để nâng cao kiến thức.
                    </p>
                    <Link to="/courses" className="btn-primary">
                      Xem khóa học
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <motion.div className="space-y-6" variants={fadeInUp}>
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Hành động nhanh
                </h3>
              </div>
              
              <div className="p-6 space-y-3">
                <Link to="/assessments" className="quick-action-btn flex items-center">
                  <ClipboardDocumentListIcon className="w-5 h-5 mr-3" />
                  Làm bài đánh giá
                </Link>
                
                <Link to="/courses" className="quick-action-btn flex items-center">
                  <AcademicCapIcon className="w-5 h-5 mr-3" />
                  Tham gia khóa học
                </Link>
                
                <Link to="/appointments/book" className="quick-action-btn flex items-center">
                  <CalendarDaysIcon className="w-5 h-5 mr-3" />
                  Đặt lịch tư vấn
                </Link>
                
                <Link to="/programs" className="quick-action-btn flex items-center">
                  <UserGroupIcon className="w-5 h-5 mr-3" />
                  Tham gia chương trình
                </Link>
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Lịch hẹn sắp tới
                  </h3>
                  <Link
                    to="/appointments"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Xem tất cả
                  </Link>
                </div>
              </div>
              
              <div className="p-6">
                {upcomingAppointments.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingAppointments.map((appointment) => (
                      <div key={appointment._id} className="flex items-center p-3 border border-gray-200 rounded-lg">
                        <CalendarDaysIcon className="w-5 h-5 text-purple-600 mr-3" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {appointment.counselorId?.firstName} {appointment.counselorId?.lastName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(appointment.appointmentDate)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <CalendarDaysIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Không có lịch hẹn nào</p>
                  </div>
                )}
              </div>
            </div>

            {/* Health Tip */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                💡 Mẹo hôm nay
              </h3>
              <p className="text-sm text-gray-700 mb-4">
                Duy trì lối sống lành mạnh với thể dục đều đặn, ăn uống cân bằng và
                dành thời gian cho gia đình bạn bè sẽ giúp giảm nguy cơ tiếp xúc với
                các chất gây nghiện.
              </p>
              <Link
                to="/blog"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Đọc thêm mẹo hay →
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;

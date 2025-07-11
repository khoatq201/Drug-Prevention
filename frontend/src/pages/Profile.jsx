import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import {
  UserCircleIcon,
  PencilIcon,
  LockClosedIcon,
  BellIcon,
  ShieldCheckIcon,
  EyeIcon,
  CalendarIcon,
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  TrophyIcon,
  CheckCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const Profile = () => {
  const { user, isAuthenticated, api, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    assessmentsCompleted: 0,
    coursesCompleted: 0,
    appointmentsAttended: 0,
    certificatesEarned: 0,
  });
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
    ageGroup: "",
    occupation: "",
    city: "",
    province: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    appointmentReminders: true,
    courseUpdates: true,
    assessmentResults: true,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/profile" } } });
      return;
    }
    
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : "",
        gender: user.gender || "",
        ageGroup: user.ageGroup || "",
        occupation: user.occupation || "",
        city: user.city || "",
        province: user.province || "",
      });
      
      setNotifications({
        emailNotifications: user.notificationPreferences?.email || true,
        appointmentReminders: user.notificationPreferences?.appointments || true,
        courseUpdates: user.notificationPreferences?.courses || true,
        assessmentResults: user.notificationPreferences?.assessments || true,
      });
    }
    
    fetchUserStats();
  }, [isAuthenticated, user, navigate]);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await api.put("/users/profile", formData);
      
      if (response.data.success) {
        updateUser(response.data.data);
        setEditMode(false);
        toast.success("Cập nhật thông tin thành công!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Không thể cập nhật thông tin");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Mật khẩu mới không khớp");
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    try {
      setLoading(true);
      await api.put("/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Đổi mật khẩu thành công!");
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(error.response?.data?.message || "Không thể đổi mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = async () => {
    try {
      setLoading(true);
      await api.put("/users/notifications", {
        notificationPreferences: {
          email: notifications.emailNotifications,
          appointments: notifications.appointmentReminders,
          courses: notifications.courseUpdates,
          assessments: notifications.assessmentResults,
        }
      });
      
      toast.success("Cập nhật thiết lập thành công!");
    } catch (error) {
      console.error("Error updating notifications:", error);
      toast.error("Không thể cập nhật thiết lập");
    } finally {
      setLoading(false);
    }
  };

  const ageGroupLabels = {
    student: "Học sinh",
    university_student: "Sinh viên",
    parent: "Phụ huynh",
    teacher: "Giáo viên",
    other: "Khác"
  };

  const genderLabels = {
    male: "Nam",
    female: "Nữ",
    other: "Khác"
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <motion.div 
      className="min-h-screen bg-gray-50 py-8"
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
        <motion.div className="text-center mb-8" variants={fadeInUp}>
          <UserCircleIcon className="mx-auto h-16 w-16 text-blue-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Thông tin cá nhân
          </h1>
          <p className="text-gray-600">
            Quản lý tài khoản và thiết lập cá nhân của bạn
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div className="lg:col-span-1" variants={fadeInUp}>
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <UserCircleIcon className="w-10 h-10 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </h2>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                  </div>
                </div>
              </div>
              
              <nav className="p-6">
                <div className="space-y-2">
                  {[
                    { id: "profile", label: "Thông tin cá nhân", icon: UserCircleIcon },
                    { id: "security", label: "Bảo mật", icon: LockClosedIcon },
                    { id: "notifications", label: "Thông báo", icon: BellIcon },
                    { id: "activity", label: "Hoạt động", icon: EyeIcon },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg flex items-center transition-colors ${
                          activeTab === item.id
                            ? "bg-blue-100 text-blue-700"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        }`}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </nav>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div className="lg:col-span-3" variants={fadeInUp}>
            {activeTab === "profile" && (
              <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Thông tin cá nhân
                    </h2>
                    <button
                      onClick={() => setEditMode(!editMode)}
                      className="btn-outline"
                    >
                      {editMode ? (
                        <><XMarkIcon className="w-4 h-4 mr-2" />Hủy</>
                      ) : (
                        <><PencilIcon className="w-4 h-4 mr-2" />Chỉnh sửa</>
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  {editMode ? (
                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Họ *
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="form-input"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tên *
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="form-input"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="form-input"
                            disabled
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Số điện thoại
                          </label>
                          <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            className="form-input"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ngày sinh
                          </label>
                          <input
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleInputChange}
                            className="form-input"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Giới tính
                          </label>
                          <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            className="form-input"
                          >
                            <option value="">Chọn giới tính</option>
                            <option value="male">Nam</option>
                            <option value="female">Nữ</option>
                            <option value="other">Khác</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nhóm tuổi
                          </label>
                          <select
                            name="ageGroup"
                            value={formData.ageGroup}
                            onChange={handleInputChange}
                            className="form-input"
                          >
                            <option value="">Chọn nhóm tuổi</option>
                            <option value="student">Học sinh</option>
                            <option value="university_student">Sinh viên</option>
                            <option value="parent">Phụ huynh</option>
                            <option value="teacher">Giáo viên</option>
                            <option value="other">Khác</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nghề nghiệp
                          </label>
                          <input
                            type="text"
                            name="occupation"
                            value={formData.occupation}
                            onChange={handleInputChange}
                            className="form-input"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Thành phố
                          </label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className="form-input"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tỉnh/Thành phố
                          </label>
                          <input
                            type="text"
                            name="province"
                            value={formData.province}
                            onChange={handleInputChange}
                            className="form-input"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => setEditMode(false)}
                          className="btn-outline"
                        >
                          Hủy
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="btn-primary disabled:opacity-50"
                        >
                          {loading ? "Lưu..." : "Lưu thay đổi"}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">
                          Họ và tên
                        </label>
                        <p className="mt-1 text-gray-900">
                          {user?.firstName} {user?.lastName}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">
                          Email
                        </label>
                        <p className="mt-1 text-gray-900">{user?.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">
                          Số điện thoại
                        </label>
                        <p className="mt-1 text-gray-900">
                          {user?.phoneNumber || "Chưa cập nhật"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">
                          Ngày sinh
                        </label>
                        <p className="mt-1 text-gray-900">
                          {user?.dateOfBirth 
                            ? new Date(user.dateOfBirth).toLocaleDateString("vi-VN")
                            : "Chưa cập nhật"
                          }
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">
                          Giới tính
                        </label>
                        <p className="mt-1 text-gray-900">
                          {user?.gender ? genderLabels[user.gender] : "Chưa cập nhật"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">
                          Nhóm tuổi
                        </label>
                        <p className="mt-1 text-gray-900">
                          {user?.ageGroup ? ageGroupLabels[user.ageGroup] : "Chưa cập nhật"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">
                          Nghề nghiệp
                        </label>
                        <p className="mt-1 text-gray-900">
                          {user?.occupation || "Chưa cập nhật"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">
                          Địa chỉ
                        </label>
                        <p className="mt-1 text-gray-900">
                          {user?.city && user?.province 
                            ? `${user.city}, ${user.province}`
                            : "Chưa cập nhật"
                          }
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Bảo mật tài khoản
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Quản lý mật khẩu và các thiết lập bảo mật
                  </p>
                </div>
                
                <div className="p-6">
                  <form onSubmit={handlePasswordUpdate} className="max-w-md space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mật khẩu hiện tại *
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="form-input"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mật khẩu mới *
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="form-input"
                        required
                        minLength={6}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Xác nhận mật khẩu mới *
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="form-input"
                        required
                        minLength={6}
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary disabled:opacity-50"
                    >
                      {loading ? "Đang cập nhật..." : "Đổi mật khẩu"}
                    </button>
                  </form>
                  
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <div className="flex items-center">
                      <ShieldCheckIcon className="w-8 h-8 text-green-500 mr-3" />
                      <div>
                        <h3 className="font-medium text-gray-900">Tài khoản an toàn</h3>
                        <p className="text-sm text-gray-600">
                          Tài khoản của bạn được bảo vệ bằng mật khẩu mạnh
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Cài đặt thông báo
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Quản lý cách thức nhận thông báo từ hệ thống
                  </p>
                </div>
                
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Thông báo qua email</h3>
                      <p className="text-sm text-gray-600">
                        Nhận thông báo tổng quát qua email
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.emailNotifications}
                        onChange={() => handleNotificationChange('emailNotifications')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Nhắc nhở lịch hẹn</h3>
                      <p className="text-sm text-gray-600">
                        Nhậc nhở trước cuộc hẹn tư vấn
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.appointmentReminders}
                        onChange={() => handleNotificationChange('appointmentReminders')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Cập nhật khóa học</h3>
                      <p className="text-sm text-gray-600">
                        Thông báo về bài học mới và cập nhật khóa học
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.courseUpdates}
                        onChange={() => handleNotificationChange('courseUpdates')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Kết quả đánh giá</h3>
                      <p className="text-sm text-gray-600">
                        Thông báo kết quả các bài đánh giá rủi ro
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.assessmentResults}
                        onChange={() => handleNotificationChange('assessmentResults')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="pt-6 border-t border-gray-200">
                    <button
                      onClick={handleNotificationUpdate}
                      disabled={loading}
                      className="btn-primary disabled:opacity-50"
                    >
                      {loading ? "Lưu..." : "Lưu thiết lập"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "activity" && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <ClipboardDocumentListIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{stats.assessmentsCompleted}</div>
                    <div className="text-sm text-gray-600">Bài đánh giá</div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <AcademicCapIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{stats.coursesCompleted}</div>
                    <div className="text-sm text-gray-600">Khóa học</div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <CalendarIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{stats.appointmentsAttended}</div>
                    <div className="text-sm text-gray-600">Cuộc hẹn</div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <TrophyIcon className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{stats.certificatesEarned}</div>
                    <div className="text-sm text-gray-600">Chứng chỉ</div>
                  </div>
                </div>
                
                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow-md">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Hoạt động gần đây
                    </h2>
                  </div>
                  
                  <div className="p-6">
                    <div className="text-center py-8 text-gray-500">
                      <EyeIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p>Chức năng đang được phát triển</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;

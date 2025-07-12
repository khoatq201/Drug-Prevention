import React from 'react';
import { X, User, Mail, Phone, Calendar, MapPin, Shield, Activity } from 'lucide-react';

const UserDetail = ({ user, onClose }) => {
  // Role labels
  const roleLabels = {
    guest: 'Khách',
    member: 'Thành viên',
    staff: 'Nhân viên',
    consultant: 'Tư vấn viên',
    manager: 'Quản lý',
    admin: 'Quản trị viên',
  };

  // Age group labels
  const ageGroupLabels = {
    student: 'Học sinh',
    university_student: 'Sinh viên',
    parent: 'Phụ huynh',
    teacher: 'Giáo viên',
    other: 'Khác',
  };

  // Gender labels
  const genderLabels = {
    male: 'Nam',
    female: 'Nữ',
    other: 'Khác',
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'Chưa cập nhật';
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format date time
  const formatDateTime = (date) => {
    if (!date) return 'Chưa cập nhật';
    return new Date(date).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <User className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">
              Chi tiết người dùng
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* User Avatar and Basic Info */}
          <div className="flex items-start space-x-6 mb-8">
            <div className="h-24 w-24 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-700">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {user.firstName} {user.lastName}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-1" />
                  {user.email}
                </div>
                {user.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    {user.phone}
                  </div>
                )}
              </div>
              <div className="mt-2 flex items-center space-x-4">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  user.role === 'admin' ? 'bg-red-100 text-red-800' :
                  user.role === 'manager' ? 'bg-orange-100 text-orange-800' :
                  user.role === 'staff' ? 'bg-blue-100 text-blue-800' :
                  user.role === 'consultant' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {roleLabels[user.role] || user.role}
                </span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  user.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user.isActive ? 'Hoạt động' : 'Không hoạt động'}
                </span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  user.isEmailVerified 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {user.isEmailVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Thông tin cá nhân
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Họ và tên</label>
                  <p className="text-sm text-gray-900">{user.firstName} {user.lastName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-sm text-gray-900">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Số điện thoại</label>
                  <p className="text-sm text-gray-900">{user.phone || 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Ngày sinh</label>
                  <p className="text-sm text-gray-900">
                    {user.dateOfBirth ? (
                      <>
                        {formatDate(user.dateOfBirth)}
                        {calculateAge(user.dateOfBirth) && (
                          <span className="text-gray-500 ml-2">({calculateAge(user.dateOfBirth)} tuổi)</span>
                        )}
                      </>
                    ) : 'Chưa cập nhật'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Giới tính</label>
                  <p className="text-sm text-gray-900">{genderLabels[user.gender] || user.gender}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Nhóm tuổi</label>
                  <p className="text-sm text-gray-900">{ageGroupLabels[user.ageGroup] || user.ageGroup}</p>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Thông tin tài khoản
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Vai trò</label>
                  <p className="text-sm text-gray-900">{roleLabels[user.role] || user.role}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Trạng thái tài khoản</label>
                  <p className="text-sm text-gray-900">
                    {user.isActive ? 'Hoạt động' : 'Không hoạt động'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Xác thực email</label>
                  <p className="text-sm text-gray-900">
                    {user.isEmailVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Ngày tạo tài khoản</label>
                  <p className="text-sm text-gray-900">{formatDateTime(user.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Cập nhật lần cuối</label>
                  <p className="text-sm text-gray-900">{formatDateTime(user.updatedAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Đăng nhập lần cuối</label>
                  <p className="text-sm text-gray-900">
                    {user.lastLogin ? formatDateTime(user.lastLogin) : 'Chưa đăng nhập'}
                  </p>
                </div>
              </div>
            </div>

            {/* Activity Information */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Hoạt động
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Đánh giá rủi ro</label>
                  <p className="text-sm text-gray-900">
                    {user.assessmentHistory?.length || 0} lần thực hiện
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Khóa học đã tham gia</label>
                  <p className="text-sm text-gray-900">
                    {user.courseHistory?.length || 0} khóa học
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Lịch hẹn</label>
                  <p className="text-sm text-gray-900">
                    {user.appointmentHistory?.length || 0} lịch hẹn
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Chương trình tham gia</label>
                  <p className="text-sm text-gray-900">
                    {user.programHistory?.length || 0} chương trình
                  </p>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Tùy chọn
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Ngôn ngữ</label>
                  <p className="text-sm text-gray-900">
                    {user.preferences?.language === 'vi' ? 'Tiếng Việt' : 'English'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Thông báo email</label>
                  <p className="text-sm text-gray-900">
                    {user.preferences?.emailNotifications ? 'Bật' : 'Tắt'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Thông báo SMS</label>
                  <p className="text-sm text-gray-900">
                    {user.preferences?.smsNotifications ? 'Bật' : 'Tắt'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          {user.assessmentHistory && user.assessmentHistory.length > 0 && (
            <div className="mt-6 bg-gray-50 p-6 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Đánh giá gần đây</h4>
              <div className="space-y-2">
                {user.assessmentHistory.slice(0, 3).map((assessment, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-white rounded border">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {assessment.assessmentType}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(assessment.completedAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        Điểm: {assessment.score}
                      </p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        assessment.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                        assessment.riskLevel === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {assessment.riskLevel === 'high' ? 'Cao' :
                         assessment.riskLevel === 'moderate' ? 'Trung bình' : 'Thấp'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Course History */}
          {user.courseHistory && user.courseHistory.length > 0 && (
            <div className="mt-6 bg-gray-50 p-6 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Khóa học đã tham gia</h4>
              <div className="space-y-2">
                {user.courseHistory.slice(0, 3).map((course, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-white rounded border">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Khóa học #{course.courseId}
                      </p>
                      <p className="text-xs text-gray-500">
                        Đăng ký: {formatDateTime(course.enrolledAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        Tiến độ: {course.progress}%
                      </p>
                      {course.completedAt && (
                        <p className="text-xs text-gray-500">
                          Hoàn thành: {formatDateTime(course.completedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetail; 
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  ArrowLeftIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ClockIcon,
  ChartBarIcon,
  CalendarIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import toast from "react-hot-toast";

const CounselorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { api } = useAuth();
  const [counselor, setCounselor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const specializationOptions = [
    { value: "addiction_counseling", label: "Tư vấn nghiện" },
    { value: "youth_counseling", label: "Tư vấn trẻ em - thanh thiếu niên" },
    { value: "family_therapy", label: "Trị liệu gia đình" },
    { value: "group_therapy", label: "Trị liệu nhóm" },
    { value: "cognitive_behavioral", label: "Liệu pháp nhận thức hành vi" },
    { value: "trauma_therapy", label: "Trị liệu chấn thương" },
    { value: "crisis_intervention", label: "Can thiệp khủng hoảng" },
    { value: "prevention_education", label: "Giáo dục phòng ngừa" },
    { value: "harm_reduction", label: "Giảm thiểu tác hại" },
    { value: "recovery_coaching", label: "Huấn luyện phục hồi" },
  ];

  useEffect(() => {
    fetchCounselorDetails();
  }, [id]);

  const fetchCounselorDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/counselors/${id}`);
      
      if (response.data.success) {
        setCounselor(response.data.data);
        setStatistics(response.data.statistics);
      }
    } catch (error) {
      console.error("Error fetching counselor details:", error);
      toast.error("Không thể tải thông tin chuyên viên");
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationToggle = async () => {
    try {
      const newStatus = !counselor.verificationStatus?.isVerified;
      await api.put(`/counselors/${id}/verify`, {
        isVerified: newStatus,
      });
      
      toast.success(
        `Chuyên viên đã được ${newStatus ? "xác minh" : "hủy xác minh"} thành công`
      );
      fetchCounselorDetails();
    } catch (error) {
      console.error("Error updating verification:", error);
      toast.error("Không thể cập nhật trạng thái xác minh");
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await api.put(`/counselors/${id}`, {
        status: newStatus,
      });
      
      toast.success("Cập nhật trạng thái thành công");
      fetchCounselorDetails();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Không thể cập nhật trạng thái");
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <StarIconSolid key={i} className="w-5 h-5 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <StarIcon className="w-5 h-5 text-gray-300" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <StarIconSolid className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
        );
      } else {
        stars.push(<StarIcon key={i} className="w-5 h-5 text-gray-300" />);
      }
    }
    return stars;
  };

  const getSpecializationLabel = (spec) => {
    return specializationOptions.find(opt => opt.value === spec)?.label || spec;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const formatWorkingHours = (workingHours) => {
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    const dayLabels = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
    
    return days.map((day, index) => {
      const schedule = workingHours[day];
      return (
        <div key={day} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
          <span className="font-medium text-gray-900">{dayLabels[index]}</span>
          <span className="text-gray-600">
            {schedule?.isAvailable ? (
              schedule.slots?.length > 0 ? (
                schedule.slots.map(slot => `${slot.start}-${slot.end}`).join(", ")
              ) : "Có sẵn"
            ) : "Không có sẵn"}
          </span>
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!counselor) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Không tìm thấy thông tin chuyên viên
          </h3>
          <Link
            to="/manager/counselors"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/manager/counselors")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {counselor.userId?.firstName} {counselor.userId?.lastName}
              </h1>
              <p className="text-gray-600">Chi tiết chuyên viên tư vấn</p>
            </div>
          </div>
          <Link
            to={`/manager/counselors/${id}/edit`}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <PencilIcon className="w-5 h-5 mr-2" />
            Chỉnh sửa
          </Link>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Summary */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary-600 font-bold text-2xl">
                    {counselor.userId?.firstName?.charAt(0)}
                    {counselor.userId?.lastName?.charAt(0)}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {counselor.userId?.firstName} {counselor.userId?.lastName}
                </h2>
                <p className="text-gray-600 mb-4">
                  {counselor.experience?.totalYears} năm kinh nghiệm
                </p>
                
                {/* Rating */}
                <div className="flex items-center justify-center mb-4">
                  <div className="flex items-center space-x-1">
                    {renderStars(counselor.performance?.averageRating || 0)}
                  </div>
                  <span className="ml-2 text-lg font-medium text-gray-900">
                    {counselor.performance?.averageRating?.toFixed(1) || "0.0"}
                  </span>
                  <span className="ml-1 text-gray-500">
                    ({counselor.performance?.totalReviews || 0})
                  </span>
                </div>

                {/* Verification Status */}
                <div className="flex items-center justify-center mb-4">
                  <button
                    onClick={handleVerificationToggle}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      counselor.verificationStatus?.isVerified
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {counselor.verificationStatus?.isVerified ? (
                      <>
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        Đã xác minh
                      </>
                    ) : (
                      <>
                        <XCircleIcon className="w-4 h-4 mr-1" />
                        Chưa xác minh
                      </>
                    )}
                  </button>
                </div>

                {/* Status */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái
                  </label>
                  <select
                    value={counselor.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="active">Hoạt động</option>
                    <option value="on_leave">Nghỉ phép</option>
                    <option value="unavailable">Không có sẵn</option>
                    <option value="suspended">Tạm ngưng</option>
                  </select>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <EnvelopeIcon className="w-4 h-4 mr-2" />
                    {counselor.userId?.email}
                  </div>
                  {counselor.userId?.phone && (
                    <div className="flex items-center text-gray-600">
                      <PhoneIcon className="w-4 h-4 mr-2" />
                      {counselor.userId.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Thống kê tổng quan
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tổng buổi tư vấn</span>
                  <span className="font-semibold">
                    {counselor.performance?.totalSessions || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tổng khách hàng</span>
                  <span className="font-semibold">
                    {counselor.performance?.totalClients || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tỷ lệ hoàn thành</span>
                  <span className="font-semibold">
                    {counselor.performance?.completionRate || 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Thời gian phản hồi</span>
                  <span className="font-semibold">
                    {counselor.performance?.responseTime || 0}h
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Detailed Information */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex">
                  {[
                    { id: "overview", label: "Tổng quan", icon: UserGroupIcon },
                    { id: "experience", label: "Kinh nghiệm", icon: AcademicCapIcon },
                    { id: "schedule", label: "Lịch làm việc", icon: CalendarIcon },
                    { id: "reviews", label: "Đánh giá", icon: StarIcon },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center px-6 py-3 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? "border-primary-500 text-primary-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <tab.icon className="w-5 h-5 mr-2" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    {/* Biography */}
                    {counselor.biography && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">
                          Tiểu sử
                        </h4>
                        <p className="text-gray-700 leading-relaxed">
                          {counselor.biography}
                        </p>
                      </div>
                    )}

                    {/* Specializations */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">
                        Chuyên môn
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {counselor.specializations?.map((spec) => (
                          <span
                            key={spec}
                            className="inline-block bg-primary-100 text-primary-800 text-sm px-3 py-1 rounded-full"
                          >
                            {getSpecializationLabel(spec)}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Areas of Expertise */}
                    {counselor.areasOfExpertise?.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">
                          Lĩnh vực chuyên môn
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {counselor.areasOfExpertise.map((area, index) => (
                            <span
                              key={index}
                              className="inline-block bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full"
                            >
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Languages */}
                    {counselor.languages?.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">
                          Ngôn ngữ
                        </h4>
                        <div className="space-y-2">
                          {counselor.languages.map((lang, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <span className="text-gray-700">
                                {lang.language === "vi" ? "Tiếng Việt" : 
                                 lang.language === "en" ? "Tiếng Anh" : lang.language}
                              </span>
                              <span className="text-sm text-gray-500 capitalize">
                                {lang.proficiency}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Client Types */}
                    {counselor.clientTypes?.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">
                          Loại hình tư vấn
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {counselor.clientTypes.map((type, index) => (
                            <span
                              key={index}
                              className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                            >
                              {type === "individual" ? "Cá nhân" :
                               type === "couple" ? "Cặp đôi" :
                               type === "family" ? "Gia đình" :
                               type === "group" ? "Nhóm" : type}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Experience Tab */}
                {activeTab === "experience" && (
                  <div className="space-y-6">
                    {/* Credentials */}
                    {counselor.credentials?.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                          Bằng cấp & Chứng chỉ
                        </h4>
                        <div className="space-y-4">
                          {counselor.credentials.filter(cred => cred.isActive).map((cred, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h5 className="font-semibold text-gray-900">{cred.title}</h5>
                                  <p className="text-gray-600">{cred.institution}</p>
                                  <p className="text-sm text-gray-500">{cred.year}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  cred.type === "degree" ? "bg-green-100 text-green-800" :
                                  cred.type === "certificate" ? "bg-blue-100 text-blue-800" :
                                  "bg-gray-100 text-gray-800"
                                }`}>
                                  {cred.type === "degree" ? "Bằng cấp" :
                                   cred.type === "certificate" ? "Chứng chỉ" :
                                   cred.type === "license" ? "Giấy phép" : cred.type}
                                </span>
                              </div>
                              {cred.expiryDate && (
                                <p className="text-sm text-gray-500 mt-2">
                                  Hết hạn: {formatDate(cred.expiryDate)}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Work History */}
                    {counselor.experience?.workHistory?.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                          Kinh nghiệm làm việc
                        </h4>
                        <div className="space-y-4">
                          {counselor.experience.workHistory.map((work, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h5 className="font-semibold text-gray-900">{work.position}</h5>
                                  <p className="text-gray-600">{work.organization}</p>
                                </div>
                                {work.isCurrent && (
                                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                    Hiện tại
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 mb-2">
                                {formatDate(work.startDate)} - {work.endDate ? formatDate(work.endDate) : "Hiện tại"}
                              </p>
                              {work.description && (
                                <p className="text-gray-700 text-sm">{work.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Schedule Tab */}
                {activeTab === "schedule" && (
                  <div className="space-y-6">
                    {/* Working Hours */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Lịch làm việc
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        {formatWorkingHours(counselor.availability?.workingHours || {})}
                      </div>
                    </div>

                    {/* Session Settings */}
                    {counselor.sessionSettings && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                          Cài đặt buổi tư vấn
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h5 className="font-medium text-gray-900 mb-2">Thời gian mặc định</h5>
                            <p className="text-gray-600">{counselor.sessionSettings.defaultDuration} phút</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h5 className="font-medium text-gray-900 mb-2">Nghỉ giữa các buổi</h5>
                            <p className="text-gray-600">{counselor.sessionSettings.breakBetweenSessions} phút</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h5 className="font-medium text-gray-900 mb-2">Tối đa buổi/ngày</h5>
                            <p className="text-gray-600">{counselor.sessionSettings.maxAppointmentsPerDay}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h5 className="font-medium text-gray-900 mb-2">Đặt trước</h5>
                            <p className="text-gray-600">{counselor.sessionSettings.advanceBookingDays} ngày</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === "reviews" && (
                  <div className="space-y-6">
                    {counselor.reviews?.length > 0 ? (
                      <div className="space-y-4">
                        {counselor.reviews.slice(0, 10).map((review, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center">
                                  {renderStars(review.rating)}
                                </div>
                                <span className="font-medium text-gray-900">
                                  {review.rating}/5
                                </span>
                              </div>
                              <span className="text-sm text-gray-500">
                                {formatDate(review.submittedAt)}
                              </span>
                            </div>
                            {review.comment && (
                              <p className="text-gray-700 mb-2">{review.comment}</p>
                            )}
                            {review.aspects && (
                              <div className="text-sm text-gray-600">
                                <span>Chuyên nghiệp: {review.aspects.professionalism}/5</span>
                                <span className="mx-2">|</span>
                                <span>Giao tiếp: {review.aspects.communication}/5</span>
                                <span className="mx-2">|</span>
                                <span>Hiệu quả: {review.aspects.effectiveness}/5</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <StarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Chưa có đánh giá nào</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CounselorDetail;
import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import {
  UserGroupIcon,
  StarIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

const CounselorStats = () => {
  const { api } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCounselorStats();
  }, []);

  const fetchCounselorStats = async () => {
    try {
      setLoading(true);
      const response = await api.get("/counselors/stats/overview");
      
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching counselor stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <StarIconSolid key={i} className="w-4 h-4 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <StarIcon className="w-4 h-4 text-gray-300" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <StarIconSolid className="w-4 h-4 text-yellow-400" />
            </div>
          </div>
        );
      } else {
        stars.push(<StarIcon key={i} className="w-4 h-4 text-gray-300" />);
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const { overview, specializationBreakdown } = stats;

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <UserGroupIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Thống kê chuyên viên tư vấn
            </h2>
            <p className="text-gray-600">Tổng quan hiệu suất và hoạt động</p>
          </div>
        </div>
        <Link
          to="/manager/counselors"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Quản lý
          <ArrowRightIcon className="w-4 h-4 ml-2" />
        </Link>
      </div>

      {/* Main Stats */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Counselors */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Tổng chuyên viên</p>
                <p className="text-2xl font-bold text-blue-900">
                  {overview.totalCounselors || 0}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-200 rounded-lg flex items-center justify-center">
                <UserGroupIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Average Rating */}
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">Đánh giá TB</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-yellow-900">
                    {overview.avgRating?.toFixed(1) || "0.0"}
                  </p>
                  <div className="flex items-center">
                    {renderStars(overview.avgRating || 0)}
                  </div>
                </div>
              </div>
              <div className="w-10 h-10 bg-yellow-200 rounded-lg flex items-center justify-center">
                <StarIcon className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Total Sessions */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Tổng buổi tư vấn</p>
                <p className="text-2xl font-bold text-green-900">
                  {overview.totalSessions?.toLocaleString() || 0}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-200 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Total Clients */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Tổng khách hàng</p>
                <p className="text-2xl font-bold text-purple-900">
                  {overview.totalClients?.toLocaleString() || 0}
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-200 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Specialization Breakdown */}
        {specializationBreakdown && specializationBreakdown.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Phân bổ chuyên môn
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {specializationBreakdown.slice(0, 6).map((spec, index) => (
                <div
                  key={spec.specialization}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 text-sm">
                      {getSpecializationLabel(spec.specialization)}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {spec.count} người
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      {renderStars(spec.avgRating || 0)}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {spec.avgRating?.toFixed(1) || "0.0"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/manager/counselors/new"
            className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-200 rounded-lg flex items-center justify-center group-hover:bg-blue-300 transition-colors">
                <UserGroupIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Thêm chuyên viên</h4>
                <p className="text-sm text-gray-600">Tạo hồ sơ chuyên viên mới</p>
              </div>
            </div>
          </Link>

          <Link
            to="/manager/counselors?verificationStatus=pending"
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 hover:bg-yellow-100 transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-yellow-200 rounded-lg flex items-center justify-center group-hover:bg-yellow-300 transition-colors">
                <ClockIcon className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Chờ xác minh</h4>
                <p className="text-sm text-gray-600">Xem chuyên viên chờ duyệt</p>
              </div>
            </div>
          </Link>

          <Link
            to="/manager/counselors?sortBy=rating&minRating=4"
            className="bg-green-50 border border-green-200 rounded-lg p-4 hover:bg-green-100 transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-200 rounded-lg flex items-center justify-center group-hover:bg-green-300 transition-colors">
                <StarIcon className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Chuyên viên xuất sắc</h4>
                <p className="text-sm text-gray-600">Đánh giá 4+ sao</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

// Helper function to get specialization label
const getSpecializationLabel = (spec) => {
  const specializationOptions = {
    addiction_counseling: "Tư vấn nghiện",
    youth_counseling: "Tư vấn trẻ em - thanh thiếu niên",
    family_therapy: "Trị liệu gia đình",
    group_therapy: "Trị liệu nhóm",
    cognitive_behavioral: "Liệu pháp nhận thức hành vi",
    trauma_therapy: "Trị liệu chấn thương",
    crisis_intervention: "Can thiệp khủng hoảng",
    prevention_education: "Giáo dục phòng ngừa",
    harm_reduction: "Giảm thiểu tác hại",
    recovery_coaching: "Huấn luyện phục hồi",
  };
  
  return specializationOptions[spec] || spec;
};

export default CounselorStats;
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import {
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  CalendarIcon,
  ShareIcon,
  DocumentArrowDownIcon,
  UserIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const AssessmentResult = () => {
  const { assessmentId, resultId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, api } = useAuth();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  // Assessment metadata
  const assessmentMeta = {
    assist: {
      name: "ASSIST",
      fullName: "Alcohol, Smoking and Substance Involvement Screening Test",
      icon: ChartBarIcon,
      color: "bg-blue-500",
    },
    crafft: {
      name: "CRAFFT",
      fullName: "Car, Relax, Alone, Forget, Friends, Trouble",
      icon: ClipboardDocumentCheckIcon,
      color: "bg-green-500",
    },
    audit: {
      name: "AUDIT",
      fullName: "Alcohol Use Disorders Identification Test",
      icon: ExclamationTriangleIcon,
      color: "bg-yellow-500",
    },
    dast: {
      name: "DAST-10",
      fullName: "Drug Abuse Screening Test",
      icon: CheckCircleIcon,
      color: "bg-red-500",
    },
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: `/assessments/${assessmentId}/result/${resultId}` } } });
      return;
    }
    fetchResult();
  }, [assessmentId, resultId, isAuthenticated, navigate]);

  const fetchResult = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/assessments/${assessmentId}/result/${resultId}`);
      if (response.data.success) {
        setResult(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching assessment result:", error);
      toast.error("Không thể tải kết quả đánh giá");
      navigate("/assessments");
    } finally {
      setLoading(false);
    }
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

  const getRiskLevelIcon = (riskLevel) => {
    switch (riskLevel) {
      case "low":
        return CheckCircleIcon;
      case "moderate":
        return ClockIcon;
      case "high":
        return ExclamationTriangleIcon;
      case "severe":
        return ExclamationTriangleIcon;
      default:
        return ClipboardDocumentCheckIcon;
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Kết quả đánh giá ${result.assessmentId.name}`,
        text: `Tôi vừa hoàn thành bài đánh giá ${result.assessmentId.name} với mức độ rủi ro: ${getRiskLevelText(result.riskLevel.level)}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Đã sao chép link kết quả");
    }
  };

  const handleRetakeAssessment = () => {
    navigate(`/assessments/${assessmentId}`);
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

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy kết quả</h3>
          <p className="mt-1 text-sm text-gray-500">Kết quả đánh giá không tồn tại hoặc đã bị xóa.</p>
          <div className="mt-6">
            <Link to="/assessments" className="btn-primary">
              Quay lại danh sách đánh giá
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const assessmentType = result.assessmentId.type?.toLowerCase();
  const meta = assessmentMeta[assessmentType] || {};
  const IconComponent = meta.icon || ClipboardDocumentCheckIcon;
  const RiskIcon = getRiskLevelIcon(result.riskLevel.level);

  return (
    <motion.div 
      className="min-h-screen bg-gray-50 py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md mb-8 overflow-hidden">
          <div className={`${meta.color || 'bg-blue-500'} px-6 py-8 text-white`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <IconComponent className="h-12 w-12 mr-4" />
                <div>
                  <h1 className="text-3xl font-bold">{result.assessmentId.name}</h1>
                  <p className="text-xl opacity-90 mt-1">{meta.fullName || result.assessmentId.description}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm opacity-75">Hoàn thành lúc</div>
                <div className="text-lg font-medium">
                  {new Date(result.completedAt).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Result Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Risk Level */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <RiskIcon className="h-8 w-8 text-gray-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Mức độ rủi ro</h3>
            </div>
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-medium border ${getRiskLevelStyle(result.riskLevel.level)}`}>
              {getRiskLevelText(result.riskLevel.level)}
            </div>
            <p className="text-gray-600 mt-3">{result.riskLevel.description}</p>
          </div>

          {/* Score */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <ChartBarIcon className="h-8 w-8 text-gray-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Điểm số</h3>
            </div>
            <div className="text-3xl font-bold text-blue-600">
              {result.score.total}
            </div>
            <p className="text-gray-600">điểm</p>
          </div>

          {/* Assessment Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <UserIcon className="h-8 w-8 text-gray-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Thông tin</h3>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <div>Người thực hiện: {user?.fullName}</div>
              <div>Loại đánh giá: {result.assessmentId.name}</div>
              <div>Mã kết quả: {result._id.slice(-8)}</div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {result.recommendations && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Khuyến nghị</h3>
            
            {result.recommendations.actions && result.recommendations.actions.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Các bước cần thực hiện:</h4>
                <ul className="space-y-2">
                  {result.recommendations.actions.map((action, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.recommendations.resources && result.recommendations.resources.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Tài nguyên hỗ trợ:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.recommendations.resources.map((resource, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900">{resource.title}</h5>
                      <p className="text-sm text-gray-600 mb-2">{resource.description}</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {resource.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Bước tiếp theo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={handleRetakeAssessment}
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <ClipboardDocumentCheckIcon className="h-5 w-5 mr-2" />
              Làm lại bài đánh giá
            </button>

            <Link
              to="/appointments/book"
              className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <CalendarIcon className="h-5 w-5 mr-2" />
              Đặt lịch tư vấn
            </Link>

            <button
              onClick={handleShare}
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <ShareIcon className="h-5 w-5 mr-2" />
              Chia sẻ kết quả
            </button>

            <Link
              to="/courses"
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              Xem khóa học
            </Link>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={() => navigate("/assessments")}
            className="btn-outline"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Quay lại đánh giá
          </button>
          
          <Link
            to="/dashboard"
            className="btn-primary"
          >
            Về Dashboard
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default AssessmentResult;
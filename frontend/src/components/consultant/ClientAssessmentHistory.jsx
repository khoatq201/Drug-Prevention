import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  CalendarIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const ClientAssessmentHistory = ({ client, isOpen, onClose }) => {
  const { api } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [showAssessmentDetail, setShowAssessmentDetail] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    totalResults: 0,
  });

  // Assessment type metadata
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
    if (isOpen && client) {
      fetchAssessments();
    }
  }, [isOpen, client]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAssessments = async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.get(`/users/${client._id}/assessments?page=${page}&limit=10`);
      if (response.data.success) {
        setAssessments(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching client assessments:", error);
      toast.error("Không thể tải lịch sử đánh giá");
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

  const openAssessmentDetail = async (assessment) => {
    try {
      // Fetch full assessment result details
      const response = await api.get(`/assessments/${assessment.assessmentId}/result/${assessment._id}`);
      if (response.data.success) {
        setSelectedAssessment(response.data.data);
        setShowAssessmentDetail(true);
      }
    } catch (error) {
      console.error("Error fetching assessment detail:", error);
      toast.error("Không thể tải chi tiết đánh giá");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Lịch sử đánh giá - {client?.firstName} {client?.lastName}
            </h2>
            <p className="text-gray-600 mt-1">
              Tổng số bài đánh giá: {pagination.totalResults}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : assessments.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardDocumentCheckIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có bài đánh giá
              </h3>
              <p className="text-gray-600">
                Khách hàng này chưa thực hiện bài đánh giá nào.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {assessments.map((assessment) => {
                const assessmentType = assessment.assessmentId?.type?.toLowerCase();
                const meta = assessmentMeta[assessmentType] || {};
                const IconComponent = meta.icon || ClipboardDocumentCheckIcon;
                const RiskIcon = getRiskLevelIcon(assessment.riskLevel?.level);

                return (
                  <div
                    key={assessment._id}
                    className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-full ${meta.color || 'bg-gray-500'} text-white`}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {assessment.assessmentId?.name || "Không xác định"}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {meta.fullName || assessment.assessmentId?.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            <div className="flex items-center text-sm text-gray-500">
                              <CalendarIcon className="w-4 h-4 mr-1" />
                              {new Date(assessment.completedAt).toLocaleDateString("vi-VN", {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <ChartBarIcon className="w-4 h-4 mr-1" />
                              Điểm: {assessment.score?.total || 0}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="flex items-center space-x-2 mb-2">
                            <RiskIcon className="w-5 h-5 text-gray-600" />
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRiskLevelStyle(assessment.riskLevel?.level)}`}>
                              {getRiskLevelText(assessment.riskLevel?.level)}
                            </span>
                          </div>
                          <button
                            onClick={() => openAssessmentDetail(assessment)}
                            className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                          >
                            <EyeIcon className="w-4 h-4 mr-1" />
                            Xem chi tiết
                          </button>
                        </div>
                      </div>
                    </div>

                    {assessment.riskLevel?.description && (
                      <div className="mt-4 p-3 bg-white rounded-lg border-l-4 border-blue-500">
                        <p className="text-sm text-gray-700">
                          <strong>Mô tả:</strong> {assessment.riskLevel.description}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {pagination.total > 1 && (
            <div className="mt-6 flex justify-center">
              <nav className="flex items-center space-x-1">
                <button
                  onClick={() => fetchAssessments(pagination.current - 1)}
                  disabled={pagination.current === 1}
                  className="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                
                {Array.from({ length: pagination.total }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => fetchAssessments(page)}
                    className={`px-3 py-2 rounded-lg ${
                      page === pagination.current
                        ? "bg-green-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => fetchAssessments(pagination.current + 1)}
                  disabled={pagination.current === pagination.total}
                  className="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </nav>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>

      {/* Assessment Detail Modal */}
      {showAssessmentDetail && selectedAssessment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                Chi tiết kết quả đánh giá
              </h3>
              <button
                onClick={() => setShowAssessmentDetail(false)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Assessment Header */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500 rounded-full text-white">
                    <ClipboardDocumentCheckIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {selectedAssessment.assessmentId?.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Hoàn thành: {new Date(selectedAssessment.completedAt).toLocaleDateString("vi-VN", {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Results Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900 mb-2">Điểm số</h5>
                  <div className="text-3xl font-bold text-blue-600">
                    {selectedAssessment.score?.total || 0}
                  </div>
                  <p className="text-sm text-gray-600">điểm</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900 mb-2">Mức độ rủi ro</h5>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getRiskLevelStyle(selectedAssessment.riskLevel?.level)}`}>
                    {getRiskLevelText(selectedAssessment.riskLevel?.level)}
                  </span>
                  {selectedAssessment.riskLevel?.description && (
                    <p className="text-sm text-gray-600 mt-2">
                      {selectedAssessment.riskLevel.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Recommendations */}
              {selectedAssessment.recommendations && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900 mb-3">Khuyến nghị</h5>
                  
                  {selectedAssessment.recommendations.actions && selectedAssessment.recommendations.actions.length > 0 && (
                    <div className="mb-4">
                      <h6 className="font-medium text-gray-800 mb-2">Các bước cần thực hiện:</h6>
                      <ul className="space-y-2">
                        {selectedAssessment.recommendations.actions.map((action, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedAssessment.recommendations.resources && selectedAssessment.recommendations.resources.length > 0 && (
                    <div>
                      <h6 className="font-medium text-gray-800 mb-2">Tài nguyên hỗ trợ:</h6>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedAssessment.recommendations.resources.map((resource, index) => (
                          <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                            <h6 className="font-medium text-gray-900">{resource.title}</h6>
                            <p className="text-sm text-gray-600 mb-2">{resource.description}</p>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {resource.type}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={() => setShowAssessmentDetail(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientAssessmentHistory;
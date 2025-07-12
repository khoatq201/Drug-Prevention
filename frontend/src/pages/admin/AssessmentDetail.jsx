import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import AdminSidebar from "../../components/layout/AdminSidebar";
import AdminHeader from "../../components/layout/AdminHeader";
import { ArrowLeftIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

const AssessmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { api, isAuthenticated, loading: authLoading } = useAuth();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Reset retry count when auth state changes
    setRetryCount(0);
    
    // Chỉ fetch khi đã authenticated và không còn loading
    if (!isAuthenticated || authLoading) return;
    
    // Thêm delay nhỏ để đảm bảo token đã được set
    const timer = setTimeout(() => {
      fetchAssessment();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, authLoading, id]);

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col">
          <AdminHeader onMenuToggle={() => setSidebarOpen(true)} />
          <main className="flex-1 p-6">
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return null; // Will be handled by ProtectedRoute
  }

  const fetchAssessment = async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      
      const response = await api.get(`/assessments/${id}`);
      if (response.data.success) {
        setAssessment(response.data.data);
      }
    } catch (err) {
      console.error('Fetch assessment error:', err);
      
      if (err.response?.status === 401) {
        // Retry once if it's a 401 error (token might not be ready)
        if (retryCount < 1) {
          setRetryCount(prev => prev + 1);
          setTimeout(() => {
            fetchAssessment();
          }, 500);
          return;
        }
        setError("Không có quyền truy cập. Vui lòng đăng nhập lại.");
      } else if (err.response?.status === 404) {
        setError("Không tìm thấy đánh giá này.");
      } else {
        setError("Lỗi khi tải thông tin đánh giá. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      try {
        await api.delete(`/assessments/${id}`);
        alert('Đánh giá đã được xóa thành công!');
        navigate('/admin/assessments');
      } catch (err) {
        console.error('Error deleting assessment:', err);
        alert('Có lỗi xảy ra khi xóa đánh giá!');
      }
    }
  };

  const getTypeLabel = (type) => {
    const typeLabels = {
      ASSIST: "ASSIST",
      CRAFFT: "CRAFFT",
      AUDIT: "AUDIT",
      DAST: "DAST",
      CUSTOM: "Tùy chỉnh",
    };
    return typeLabels[type] || type;
  };

  const getAgeGroupLabel = (ageGroup) => {
    const ageGroupLabels = {
      student: "Học sinh",
      university_student: "Sinh viên",
      parent: "Phụ huynh",
      teacher: "Giáo viên",
      other: "Khác",
    };
    return ageGroupLabels[ageGroup] || ageGroup;
  };

  const getQuestionTypeLabel = (type) => {
    const typeLabels = {
      multiple_choice: "Trắc nghiệm",
      yes_no: "Có/Không",
      scale: "Thang điểm",
      text: "Văn bản",
    };
    return typeLabels[type] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col">
          <AdminHeader onMenuToggle={() => setSidebarOpen(true)} />
          <main className="flex-1 p-6">
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col">
          <AdminHeader onMenuToggle={() => setSidebarOpen(true)} />
          <main className="flex-1 p-6">
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error || "Không tìm thấy đánh giá"}</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    setError(null);
                    setRetryCount(0);
                    fetchAssessment();
                  }}
                  className="btn-primary"
                >
                  Thử lại
                </button>
                <button
                  onClick={() => navigate('/admin/assessments')}
                  className="btn-secondary"
                >
                  Quay lại danh sách
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col">
        <AdminHeader onMenuToggle={() => setSidebarOpen(true)} />
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => navigate('/admin/assessments')}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                Quay lại danh sách đánh giá
              </button>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{assessment.name}</h1>
                <p className="text-gray-600 mt-1">{assessment.description}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm text-gray-500">
                    {assessment.questions?.length || 0} câu hỏi
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    assessment.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {assessment.isActive ? "Đang hoạt động" : "Vô hiệu hóa"}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  className="btn-secondary flex items-center gap-2 text-red-600 hover:text-red-700"
                >
                  <TrashIcon className="w-4 h-4" />
                  Xóa
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Basic Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Assessment Details */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Loại đánh giá</label>
                    <p className="mt-1 text-sm text-gray-900">{getTypeLabel(assessment.type)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                      assessment.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {assessment.isActive ? "Hoạt động" : "Vô hiệu"}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ngôn ngữ</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {assessment.language === "vi" ? "Tiếng Việt" : "English"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phiên bản</label>
                    <p className="mt-1 text-sm text-gray-900">{assessment.version || "1.0"}</p>
                  </div>
                </div>
              </div>

              {/* Target Age Groups */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Nhóm tuổi mục tiêu</h2>
                <div className="flex flex-wrap gap-2">
                  {assessment.targetAgeGroup.map((group, index) => (
                    <span
                      key={index}
                      className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800"
                    >
                      {getAgeGroupLabel(group)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Questions */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Câu hỏi ({assessment.questions?.length || 0})
                </h2>
                <div className="space-y-4">
                  {assessment.questions?.map((question, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900">
                          Câu {index + 1}: {question.question}
                        </h3>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {getQuestionTypeLabel(question.type)}
                        </span>
                      </div>
                      
                      {(question.type === "multiple_choice" || question.type === "yes_no") && (
                        <div className="mt-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Tùy chọn:</h4>
                          <div className="space-y-1">
                            {question.options?.map((option, optIndex) => (
                              <div key={optIndex} className="flex items-center gap-2 text-sm">
                                <span className="text-gray-500">•</span>
                                <span className="text-gray-900">{option.text}</span>
                                <span className="text-gray-500">(Điểm: {option.value})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {question.type === "scale" && question.scale && (
                        <div className="mt-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Thang điểm:</h4>
                          <div className="text-sm text-gray-600">
                            Từ {question.scale.min} đến {question.scale.max} 
                            {question.scale.step && ` (bước: ${question.scale.step})`}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Scoring Information */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin chấm điểm</h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phương pháp</label>
                    <p className="mt-1 text-sm text-gray-900">{assessment.scoring?.method || "sum"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Điểm tối đa</label>
                    <p className="mt-1 text-sm text-gray-900">{assessment.scoring?.maxScore || 0}</p>
                  </div>
                </div>
              </div>

              {/* Risk Levels */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Mức độ rủi ro</h2>
                <div className="space-y-3">
                  {assessment.scoring?.riskLevels?.map((level, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded border">
                      <div>
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {level.level}
                        </span>
                        <p className="text-xs text-gray-500">
                          {level.minScore} - {level.maxScore} điểm
                        </p>
                      </div>
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: level.color }}
                      ></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Khuyến nghị</h2>
                <div className="space-y-3">
                  {assessment.recommendations?.map((rec, index) => (
                    <div key={index} className="border rounded p-3">
                      <h4 className="text-sm font-medium text-gray-900 capitalize mb-2">
                        {rec.riskLevel}
                      </h4>
                      <div className="space-y-1">
                        {rec.actions?.map((action, actionIndex) => (
                          <p key={actionIndex} className="text-xs text-gray-600">
                            • {action}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metadata */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin khác</h2>
                <div className="space-y-3 text-sm">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ngày tạo</label>
                    <p className="mt-1 text-gray-900">
                      {new Date(assessment.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cập nhật lần cuối</label>
                    <p className="mt-1 text-gray-900">
                      {new Date(assessment.updatedAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AssessmentDetail; 
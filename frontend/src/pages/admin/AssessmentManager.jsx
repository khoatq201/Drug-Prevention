import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import AssessmentTable from "./AssessmentTable";
import AssessmentForm from "./AssessmentForm";
import { MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/outline";

const AssessmentManager = ({
  role = "admin",
  Sidebar,
  Header,
}) => {
  const { api, isAuthenticated, loading: authLoading } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState(null);
  const [filters, setFilters] = useState({
    type: "",
    ageGroup: "",
    isActive: "",
    search: "",
  });
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    limit: 20,
  });
  const searchTimeout = useRef();

  useEffect(() => {
    if (!isAuthenticated || authLoading) return;
    fetchAssessments();
    // eslint-disable-next-line
  }, [isAuthenticated, authLoading, filters.type, filters.ageGroup, filters.isActive, pagination.current]);

  useEffect(() => {
    if (!isAuthenticated || authLoading) return;
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchAssessments();
    }, 400);
    return () => clearTimeout(searchTimeout.current);
    // eslint-disable-next-line
  }, [filters.search]);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.current,
        limit: pagination.limit,
      });
      if (filters.type) params.append('type', filters.type);
      if (filters.ageGroup) params.append('ageGroup', filters.ageGroup);
      if (filters.isActive !== "") params.append('isActive', filters.isActive);
      if (filters.search) params.append('search', filters.search);
      // endpoint cho admin/manager đều là /assessments/admin
      const response = await api.get(`/assessments/admin?${params}`);
      if (response.data.success) {
        setAssessments(response.data.data);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
        }));
      }
    } catch (err) {
      setError("Lỗi khi tải danh sách đánh giá");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, current: page }));
  };

  const handleAddNew = () => {
    setEditingAssessment(null);
    setShowForm(true);
  };

  const handleEdit = (assessment) => {
    setEditingAssessment(assessment);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingAssessment(null);
  };

  const handleFormSubmit = async (assessmentData) => {
    try {
      if (editingAssessment) {
        await api.put(`/assessments/${editingAssessment._id}`, assessmentData);
      } else {
        await api.post('/assessments', assessmentData);
      }
      handleFormClose();
      fetchAssessments();
    } catch (err) {
      console.error('Error saving assessment:', err);
    }
  };

  const handleToggleActive = async (assessmentId, isActive) => {
    try {
      await api.patch(`/assessments/${assessmentId}/toggle-active`, { isActive });
      fetchAssessments();
    } catch (err) {
      console.error('Error toggling assessment status:', err);
    }
  };

  const handleDelete = async (assessmentId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      try {
        await api.delete(`/assessments/${assessmentId}`);
        fetchAssessments();
      } catch (err) {
        console.error('Error deleting assessment:', err);
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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {Sidebar && <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
      <div className="flex-1 flex flex-col">
        {Header && <Header onMenuToggle={() => setSidebarOpen(true)} />}
        <main className="flex-1 p-6">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý đánh giá</h1>
              <p className="text-gray-600">Quản lý tất cả bài đánh giá trong hệ thống</p>
            </div>
            <button
              onClick={handleAddNew}
              className="btn-primary flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Thêm đánh giá mới
            </button>
          </div>

          {/* Filters */}
          <div className="card mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo tên, mô tả..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Tất cả loại</option>
                <option value="ASSIST">ASSIST</option>
                <option value="CRAFFT">CRAFFT</option>
                <option value="AUDIT">AUDIT</option>
                <option value="DAST">DAST</option>
                <option value="CUSTOM">Tùy chỉnh</option>
              </select>
              <select
                value={filters.ageGroup}
                onChange={(e) => handleFilterChange("ageGroup", e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Tất cả nhóm tuổi</option>
                <option value="student">Học sinh</option>
                <option value="university_student">Sinh viên</option>
                <option value="parent">Phụ huynh</option>
                <option value="teacher">Giáo viên</option>
                <option value="other">Khác</option>
              </select>
              <select
                value={filters.isActive}
                onChange={(e) => handleFilterChange("isActive", e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="true">Đang hoạt động</option>
                <option value="false">Vô hiệu hóa</option>
              </select>
            </div>
          </div>

          {/* Assessments Table */}
          <AssessmentTable
            assessments={assessments}
            loading={loading}
            pagination={pagination}
            onPageChange={handlePageChange}
            onEdit={handleEdit}
            onToggleActive={handleToggleActive}
            onDelete={handleDelete}
            getTypeLabel={getTypeLabel}
            getAgeGroupLabel={getAgeGroupLabel}
            role={role}
          />

          {/* Assessment Form Modal */}
          {showForm && (
            <AssessmentForm
              assessment={editingAssessment}
              onClose={handleFormClose}
              onSubmit={handleFormSubmit}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default AssessmentManager; 
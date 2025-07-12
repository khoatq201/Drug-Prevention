import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import CourseGrid from "./CourseGrid";
import { MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/outline";

const CourseManager = ({
  role = "admin",
  Sidebar,
  Header,
  addCourseLink = "/admin/courses/new",
  editCourseLink = (id) => `/admin/courses/edit/${id}`
}) => {
  const { api, isAuthenticated, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    level: "",
    isPublished: "",
    search: "",
  });
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    limit: 20,
  });
  const searchTimeout = useRef();
  const hasInitialFetch = useRef(false);

  useEffect(() => {
    if (isAuthenticated && !authLoading && !hasInitialFetch.current) {
      const timer = setTimeout(() => {
        fetchCourses();
        hasInitialFetch.current = true;
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    if (hasInitialFetch.current) {
      fetchCourses();
    }
  }, [filters.category, filters.level, filters.isPublished, pagination.current]);

  useEffect(() => {
    if (!isAuthenticated || authLoading) return;
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchCourses();
    }, 400);
    return () => clearTimeout(searchTimeout.current);
  }, [filters.search]);

  const fetchCourses = async () => {
    const token = localStorage.getItem("token");
    if (!isAuthenticated || !token) return;
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.current,
        limit: pagination.limit,
      });
      if (filters.category) params.append('category', filters.category);
      if (filters.level) params.append('level', filters.level);
      if (filters.isPublished !== "") params.append('isPublished', filters.isPublished);
      if (filters.search) params.append('search', filters.search);
      // endpoint cho admin/manager đều là /courses/admin/all
      const response = await api.get(`/courses/admin/all?${params}`);
      if (response.data.success) {
        setCourses(response.data.data);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
        }));
      }
    } catch (err) {
      setError("Lỗi khi tải danh sách khóa học");
      if (err.response?.status === 401) {
        hasInitialFetch.current = false;
      }
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

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa khóa học này?")) return;
    try {
      await api.delete(`/courses/${courseId}`);
      setSuccess("Khóa học đã được xóa thành công");
      fetchCourses();
    } catch (err) {
      setError("Lỗi khi xóa khóa học");
    }
  };

  const getCategoryLabel = (category) => {
    const categoryLabels = {
      drug_awareness: "Nhận thức về ma túy",
      prevention_skills: "Kỹ năng phòng tránh",
      refusal_skills: "Kỹ năng từ chối",
      life_skills: "Kỹ năng sống",
      counseling: "Tư vấn",
      rehabilitation: "Phục hồi",
    };
    return categoryLabels[category] || category;
  };

  const getLevelLabel = (level) => {
    const levelLabels = {
      beginner: "Cơ bản",
      intermediate: "Trung cấp",
      advanced: "Nâng cao",
    };
    return levelLabels[level] || level;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {Sidebar && <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
      <div className="flex-1 flex flex-col">
        {Header && <Header onMenuToggle={() => setSidebarOpen(true)} />}
        <main className="flex-1 p-6">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý khóa học</h1>
              <p className="text-gray-600">Quản lý tất cả khóa học trong hệ thống</p>
            </div>
            <Link
              to={addCourseLink}
              className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Thêm khóa học
            </Link>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600">{success}</p>
            </div>
          )}

          {/* Filters */}
          <div className="card mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm khóa học..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Tất cả danh mục</option>
                <option value="drug_awareness">Nhận thức về ma túy</option>
                <option value="prevention_skills">Kỹ năng phòng tránh</option>
                <option value="refusal_skills">Kỹ năng từ chối</option>
                <option value="life_skills">Kỹ năng sống</option>
                <option value="counseling">Tư vấn</option>
                <option value="rehabilitation">Phục hồi</option>
              </select>
              <select
                value={filters.level}
                onChange={(e) => handleFilterChange("level", e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Tất cả cấp độ</option>
                <option value="beginner">Cơ bản</option>
                <option value="intermediate">Trung cấp</option>
                <option value="advanced">Nâng cao</option>
              </select>
              <select
                value={filters.isPublished}
                onChange={(e) => handleFilterChange("isPublished", e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="true">Đã xuất bản</option>
                <option value="false">Chưa xuất bản</option>
              </select>
            </div>
          </div>
          {/* Courses Grid */}
          <CourseGrid
            courses={courses}
            loading={loading}
            pagination={pagination}
            onPageChange={handlePageChange}
            onDeleteCourse={handleDeleteCourse}
            getCategoryLabel={getCategoryLabel}
            getLevelLabel={getLevelLabel}
            editCourseLink={editCourseLink}
            role={role}
          />
        </main>
      </div>
    </div>
  );
};

export default CourseManager; 
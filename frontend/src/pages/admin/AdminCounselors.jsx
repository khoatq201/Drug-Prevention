import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/layout/AdminSidebar";
import AdminHeader from "../../components/layout/AdminHeader";
import {
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  UserGroupIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import toast from "react-hot-toast";

const AdminCounselors = () => {
  const { api } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    specialization: "",
    status: "",
    verificationStatus: "",
    minRating: "",
    sortBy: "rating",
  });
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    limit: 12,
  });

  const specializationOptions = [
    { value: "addiction_counseling", label: "Tư vấn nghiện" },
    { value: "youth_counseling", label: "Tư vấn trẻ em - thanh thiếu niên" },
    { value: "family_therapy", label: "Trị liệu gia đình" },
    { value: "group_therapy", label: "Trị liệu nhóm" },
    { value: "cognitive_behavioral", label: "Liệu pháp nhận thức hành vi" },
    { value: "trauma_therapy", label: "Trị liệu chấn thương" },
    { value: "crisis_intervention", label: "Can thiệp khủng hoảng" },
    { value: "prevention_education", label: "Giáo dục phòng ngừa" },
  ];

  const statusOptions = [
    { value: "active", label: "Hoạt động", color: "text-green-600" },
    { value: "on_leave", label: "Nghỉ phép", color: "text-yellow-600" },
    { value: "unavailable", label: "Không có sẵn", color: "text-gray-600" },
    { value: "suspended", label: "Tạm ngưng", color: "text-red-600" },
  ];

  useEffect(() => {
    fetchCounselors();
  }, [pagination.current, filters, searchTerm]);

  const fetchCounselors = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.current,
        limit: pagination.limit,
        search: searchTerm,
        ...Object.fromEntries(
          Object.entries(filters).filter(([, value]) => value !== "")
        ),
      });

      const response = await api.get(`/counselors?${queryParams}`);
      
      if (response.data.success) {
        setCounselors(response.data.data);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
          count: response.data.pagination.count,
          totalResults: response.data.pagination.totalResults,
        }));
      }
    } catch (error) {
      console.error("Error fetching counselors:", error);
      toast.error("Không thể tải danh sách chuyên viên");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchCounselors();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleVerificationToggle = async (counselorId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await api.put(`/counselors/${counselorId}/verify`, {
        isVerified: newStatus,
      });
      
      toast.success(
        `Chuyên viên đã được ${newStatus ? "xác minh" : "hủy xác minh"} thành công`
      );
      fetchCounselors();
    } catch (error) {
      console.error("Error updating verification:", error);
      toast.error("Không thể cập nhật trạng thái xác minh");
    }
  };

  const handleStatusChange = async (counselorId, newStatus) => {
    try {
      await api.put(`/counselors/${counselorId}`, {
        status: newStatus,
      });
      
      toast.success("Cập nhật trạng thái thành công");
      fetchCounselors();
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

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption?.color || "text-gray-600";
  };


  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col">
        <AdminHeader onMenuToggle={() => setSidebarOpen(true)} />
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Quản lý chuyên viên tư vấn
                </h1>
                <p className="mt-2 text-gray-600">
                  Quản lý hồ sơ và hiệu suất của các chuyên viên tư vấn
                </p>
              </div>
              <Link
                to="/admin/counselors/new"
                className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Thêm chuyên viên
              </Link>
            </div>
          </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 space-y-4 lg:space-y-0">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo tên, email, chuyên môn..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-4">
                <select
                  value={filters.specialization}
                  onChange={(e) => handleFilterChange("specialization", e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Tất cả chuyên môn</option>
                  {specializationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Tất cả trạng thái</option>
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.verificationStatus}
                  onChange={(e) => handleFilterChange("verificationStatus", e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Trạng thái xác minh</option>
                  <option value="verified">Đã xác minh</option>
                  <option value="pending">Chờ xác minh</option>
                </select>

                <select
                  value={filters.minRating}
                  onChange={(e) => handleFilterChange("minRating", e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Đánh giá tối thiểu</option>
                  <option value="4">4+ sao</option>
                  <option value="3">3+ sao</option>
                  <option value="2">2+ sao</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600">
            Hiển thị {pagination.count} / {pagination.totalResults} chuyên viên
          </p>
        </div>

        {/* Counselors Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : counselors.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không tìm thấy chuyên viên
            </h3>
            <p className="text-gray-600 mb-4">
              Thử thay đổi tiêu chí tìm kiếm hoặc bộ lọc
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setFilters({
                  specialization: "",
                  status: "",
                  verificationStatus: "",
                  minRating: "",
                  sortBy: "rating",
                });
                setPagination(prev => ({ ...prev, current: 1 }));
              }}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {counselors.map((counselor) => (
              <div
                key={counselor._id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-semibold text-lg">
                        {counselor.userId?.firstName?.charAt(0)}
                        {counselor.userId?.lastName?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {counselor.userId?.firstName} {counselor.userId?.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {counselor.experience?.totalYears} năm kinh nghiệm
                      </p>
                    </div>
                  </div>
                  
                  {/* Verification Status */}
                  <button
                    onClick={() => handleVerificationToggle(
                      counselor._id,
                      counselor.verificationStatus?.isVerified
                    )}
                    className={`p-2 rounded-full ${
                      counselor.verificationStatus?.isVerified
                        ? "text-green-600 hover:bg-green-50"
                        : "text-yellow-600 hover:bg-yellow-50"
                    }`}
                    title={
                      counselor.verificationStatus?.isVerified
                        ? "Đã xác minh - Click để hủy"
                        : "Chưa xác minh - Click để xác minh"
                    }
                  >
                    {counselor.verificationStatus?.isVerified ? (
                      <CheckCircleIcon className="w-6 h-6" />
                    ) : (
                      <XCircleIcon className="w-6 h-6" />
                    )}
                  </button>
                </div>

                {/* Rating */}
                <div className="flex items-center mb-3">
                  <div className="flex items-center space-x-1">
                    {renderStars(counselor.performance?.averageRating || 0)}
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-900">
                    {counselor.performance?.averageRating?.toFixed(1) || "0.0"}
                  </span>
                  <span className="ml-1 text-sm text-gray-500">
                    ({counselor.performance?.totalReviews || 0} đánh giá)
                  </span>
                </div>

                {/* Specializations */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {counselor.specializations?.slice(0, 2).map((spec) => {
                      const specLabel = specializationOptions.find(
                        opt => opt.value === spec
                      )?.label || spec;
                      return (
                        <span
                          key={spec}
                          className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full"
                        >
                          {specLabel}
                        </span>
                      );
                    })}
                    {counselor.specializations?.length > 2 && (
                      <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                        +{counselor.specializations.length - 2} khác
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {counselor.performance?.totalSessions || 0}
                    </div>
                    <div className="text-xs text-gray-600">Buổi tư vấn</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {counselor.performance?.totalClients || 0}
                    </div>
                    <div className="text-xs text-gray-600">Khách hàng</div>
                  </div>
                </div>

                {/* Status */}
                <div className="mb-4">
                  <select
                    value={counselor.status}
                    onChange={(e) => handleStatusChange(counselor._id, e.target.value)}
                    className={`w-full text-sm px-3 py-2 border border-gray-300 rounded-lg ${getStatusColor(
                      counselor.status
                    )} font-medium`}
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigate(`/admin/counselors/${counselor._id}`)}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    <EyeIcon className="w-4 h-4 mr-1" />
                    Xem
                  </button>
                  <button
                    onClick={() => navigate(`/admin/counselors/${counselor._id}/edit`)}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors text-sm"
                  >
                    <PencilIcon className="w-4 h-4 mr-1" />
                    Sửa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.total > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-1">
              <button
                onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
                disabled={pagination.current === 1}
                className="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              
              {Array.from({ length: pagination.total }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setPagination(prev => ({ ...prev, current: page }))}
                  className={`px-3 py-2 rounded-lg ${
                    page === pagination.current
                      ? "bg-primary-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
                disabled={pagination.current === pagination.total}
                className="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </nav>
          </div>
        )}
        </main>
      </div>
    </div>
  );
};

export default AdminCounselors;
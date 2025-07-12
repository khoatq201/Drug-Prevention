import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import AdminSidebar from "../../components/layout/AdminSidebar";
import AdminHeader from "../../components/layout/AdminHeader";
import UserTable from "./UserTable";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const AdminUsers = () => {
  const { api, isAuthenticated, loading: authLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState({
    role: "",
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

  // Chỉ fetch khi xác thực xong
  useEffect(() => {
    if (!isAuthenticated || authLoading) return;
    fetchUsers();
    // eslint-disable-next-line
  }, [isAuthenticated, authLoading, filters.role, filters.ageGroup, filters.isActive, pagination.current]);

  // Debounce search input
  useEffect(() => {
    if (!isAuthenticated || authLoading) return;
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchUsers();
    }, 400);
    return () => clearTimeout(searchTimeout.current);
    // eslint-disable-next-line
  }, [filters.search]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.current,
        limit: pagination.limit,
      });
      
      // Chỉ thêm filter nếu có giá trị
      if (filters.role) params.append('role', filters.role);
      if (filters.ageGroup) params.append('ageGroup', filters.ageGroup);
      if (filters.isActive !== "") params.append('isActive', filters.isActive);
      if (filters.search) params.append('search', filters.search);
      
      const response = await api.get(`/users?${params}`);
      if (response.data.success) {
        setUsers(response.data.data);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
        }));
      }
    } catch (err) {
      setError("Lỗi khi tải danh sách người dùng");
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

  const getRoleLabel = (role) => {
    const roleLabels = {
      admin: "Quản trị viên",
      manager: "Quản lý",
      consultant: "Chuyên viên tư vấn",
      staff: "Nhân viên",
      member: "Thành viên",
      guest: "Khách",
    };
    return roleLabels[role] || role;
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
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col">
        <AdminHeader onMenuToggle={() => setSidebarOpen(true)} />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
            <p className="text-gray-600">Quản lý tất cả người dùng trong hệ thống</p>
          </div>

          {/* Filters */}
          <div className="card mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo tên, email..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              <select
                value={filters.role}
                onChange={(e) => handleFilterChange("role", e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Tất cả vai trò</option>
                <option value="admin">Quản trị viên</option>
                <option value="manager">Quản lý</option>
                <option value="consultant">Chuyên viên tư vấn</option>
                <option value="staff">Nhân viên</option>
                <option value="member">Thành viên</option>
                <option value="guest">Khách</option>
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

          {/* Users Table */}
          <UserTable
            users={users}
            loading={loading}
            pagination={pagination}
            onPageChange={handlePageChange}
            getRoleLabel={getRoleLabel}
            getAgeGroupLabel={getAgeGroupLabel}
          />
        </main>
      </div>
    </div>
  );
};

export default AdminUsers; 
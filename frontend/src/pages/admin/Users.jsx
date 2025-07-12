import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users as UsersIcon, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  UserPlus,
  Download,
  RefreshCw
} from 'lucide-react';
import api from '../../utils/api';
import AdminSidebar from '../../components/layout/AdminSidebar';
import AdminHeader from '../../components/layout/AdminHeader';
import UserForm from '../../components/admin/UserForm';
import UserDetail from '../../components/admin/UserDetail';
import Pagination from '../../components/common/Pagination';
import { toast } from 'react-hot-toast';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    totalResults: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    ageGroup: '',
    isActive: '',
    isEmailVerified: '',
    sort: '-createdAt',
  });

  // Fetch users
  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...filters,
      });

      const response = await api.get(`/users/admin/all?${params}`);
      
      if (response.data.success) {
        setUsers(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Lỗi khi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await api.get('/users/admin/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  // Handle search
  const handleSearch = (value) => {
    handleFilterChange('search', value);
  };

  // Handle page change
  const handlePageChange = (page) => {
    fetchUsers(page);
  };

  // Handle create user
  const handleCreateUser = async (userData) => {
    try {
      const response = await api.post('/users/admin/create', userData);
      if (response.data.success) {
        toast.success('Tạo người dùng thành công');
        setShowForm(false);
        fetchUsers();
        fetchStats();
      }
    } catch (error) {
      console.error('Error creating user:', error);
      const message = error.response?.data?.message || 'Lỗi khi tạo người dùng';
      toast.error(message);
    }
  };

  // Handle update user
  const handleUpdateUser = async (userData) => {
    try {
      const response = await api.put(`/users/admin/${editingUser._id}`, userData);
      if (response.data.success) {
        toast.success('Cập nhật người dùng thành công');
        setShowForm(false);
        setEditingUser(null);
        fetchUsers();
        fetchStats();
      }
    } catch (error) {
      console.error('Error updating user:', error);
      const message = error.response?.data?.message || 'Lỗi khi cập nhật người dùng';
      toast.error(message);
    }
  };

  // Handle delete user
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      return;
    }

    try {
      const response = await api.delete(`/users/admin/${userId}`);
      if (response.data.success) {
        toast.success('Xóa người dùng thành công');
        fetchUsers();
        fetchStats();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      const message = error.response?.data?.message || 'Lỗi khi xóa người dùng';
      toast.error(message);
    }
  };

  // Handle restore user
  const handleRestoreUser = async (userId) => {
    try {
      const response = await api.post(`/users/admin/${userId}/restore`);
      if (response.data.success) {
        toast.success('Khôi phục người dùng thành công');
        fetchUsers();
        fetchStats();
      }
    } catch (error) {
      console.error('Error restoring user:', error);
      const message = error.response?.data?.message || 'Lỗi khi khôi phục người dùng';
      toast.error(message);
    }
  };

  // Open edit form
  const openEditForm = (user) => {
    setEditingUser(user);
    setShowForm(true);
  };

  // Open detail modal
  const openDetail = (user) => {
    setSelectedUser(user);
    setShowDetail(true);
  };

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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col">
        <AdminHeader onMenuToggle={() => setSidebarOpen(true)} />
        
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
              <p className="text-gray-600">Quản lý tất cả người dùng trong hệ thống</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
            >
              <UserPlus size={20} />
              Thêm người dùng
            </button>
          </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UsersIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng người dùng</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overview.totalUsers || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <UsersIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Người dùng hoạt động</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overview.activeUsers || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <UsersIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đã xác thực email</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overview.verifiedUsers || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <UsersIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tháng này</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overview.newUsersThisMonth || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, email..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả vai trò</option>
              {Object.entries(roleLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* Age Group Filter */}
          <div>
            <select
              value={filters.ageGroup}
              onChange={(e) => handleFilterChange('ageGroup', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả nhóm tuổi</option>
              {Object.entries(ageGroupLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filters.isActive}
              onChange={(e) => handleFilterChange('isActive', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="true">Hoạt động</option>
              <option value="false">Không hoạt động</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="-createdAt">Mới nhất</option>
              <option value="createdAt">Cũ nhất</option>
              <option value="name">Tên A-Z</option>
              <option value="email">Email A-Z</option>
              <option value="role">Vai trò</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nhóm tuổi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="animate-spin h-5 w-5 text-gray-400 mr-2" />
                      Đang tải...
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    Không tìm thấy người dùng nào
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.phone || 'Chưa có số điện thoại'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                      <div className="text-sm text-gray-500">
                        {user.isEmailVerified ? (
                          <span className="text-green-600">Đã xác thực</span>
                        ) : (
                          <span className="text-red-600">Chưa xác thực</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'admin' ? 'bg-red-100 text-red-800' :
                        user.role === 'manager' ? 'bg-orange-100 text-orange-800' :
                        user.role === 'staff' ? 'bg-blue-100 text-blue-800' :
                        user.role === 'consultant' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {roleLabels[user.role] || user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ageGroupLabels[user.ageGroup] || user.ageGroup}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openDetail(user)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => openEditForm(user)}
                          className="text-indigo-600 hover:text-indigo-900 p-1"
                          title="Chỉnh sửa"
                        >
                          <Edit size={16} />
                        </button>
                        {user.isActive ? (
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Xóa"
                          >
                            <Trash2 size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRestoreUser(user._id)}
                            className="text-green-600 hover:text-green-900 p-1"
                            title="Khôi phục"
                          >
                            <RefreshCw size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.total > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <Pagination
              currentPage={pagination.current}
              totalPages={pagination.total}
              onPageChange={handlePageChange}
              totalResults={pagination.totalResults}
            />
          </div>
        )}
      </div>

      {/* User Form Modal */}
      {showForm && (
        <UserForm
          user={editingUser}
          onClose={() => {
            setShowForm(false);
            setEditingUser(null);
          }}
          onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
        />
      )}

      {/* User Detail Modal */}
      {showDetail && selectedUser && (
        <UserDetail
          user={selectedUser}
          onClose={() => {
            setShowDetail(false);
            setSelectedUser(null);
          }}
        />
      )}
        </main>
      </div>
    </div>
  );
};

export default Users; 
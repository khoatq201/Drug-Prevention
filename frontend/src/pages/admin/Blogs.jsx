import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  FilePlus,
  Download,
  RefreshCw,
  Calendar,
  User,
  Tag
} from 'lucide-react';
import api from '../../utils/api';
import AdminSidebar from '../../components/layout/AdminSidebar';
import AdminHeader from '../../components/layout/AdminHeader';
import BlogForm from '../../components/admin/BlogForm';
import BlogDetail from '../../components/admin/BlogDetail';
import Pagination from '../../components/common/Pagination';
import { toast } from 'react-hot-toast';

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [editingBlog, setEditingBlog] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    totalResults: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: '',
    featured: '',
    language: '',
    sort: '-createdAt',
  });

  // Fetch blogs
  const fetchBlogs = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...filters,
      });

      const response = await api.get(`/blogs/admin/all?${params}`);
      
      if (response.data.success) {
        setBlogs(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast.error('Lỗi khi tải danh sách bài viết');
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await api.get('/blogs/admin/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchBlogs();
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
    fetchBlogs(page);
  };

  // Handle create blog
  const handleCreateBlog = async (blogData) => {
    try {
      const response = await api.post('/blogs/admin/create', blogData);
      if (response.data.success) {
        toast.success('Tạo bài viết thành công');
        setShowForm(false);
        fetchBlogs();
        fetchStats();
      }
    } catch (error) {
      console.error('Error creating blog:', error);
      const message = error.response?.data?.message || 'Lỗi khi tạo bài viết';
      toast.error(message);
    }
  };

  // Handle update blog
  const handleUpdateBlog = async (blogData) => {
    try {
      const response = await api.put(`/blogs/admin/${editingBlog._id}`, blogData);
      if (response.data.success) {
        toast.success('Cập nhật bài viết thành công');
        setShowForm(false);
        setEditingBlog(null);
        fetchBlogs();
        fetchStats();
      }
    } catch (error) {
      console.error('Error updating blog:', error);
      const message = error.response?.data?.message || 'Lỗi khi cập nhật bài viết';
      toast.error(message);
    }
  };

  // Handle delete blog
  const handleDeleteBlog = async (blogId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      return;
    }

    try {
      const response = await api.delete(`/blogs/admin/${blogId}`);
      if (response.data.success) {
        toast.success('Xóa bài viết thành công');
        fetchBlogs();
        fetchStats();
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      const message = error.response?.data?.message || 'Lỗi khi xóa bài viết';
      toast.error(message);
    }
  };

  // Handle restore blog
  const handleRestoreBlog = async (blogId) => {
    try {
      const response = await api.post(`/blogs/admin/${blogId}/restore`);
      if (response.data.success) {
        toast.success('Khôi phục bài viết thành công');
        fetchBlogs();
        fetchStats();
      }
    } catch (error) {
      console.error('Error restoring blog:', error);
      const message = error.response?.data?.message || 'Lỗi khi khôi phục bài viết';
      toast.error(message);
    }
  };

  // Open edit form
  const openEditForm = (blog) => {
    setEditingBlog(blog);
    setShowForm(true);
  };

  // Open detail modal
  const openDetail = (blog) => {
    setSelectedBlog(blog);
    setShowDetail(true);
  };

  // Status labels
  const statusLabels = {
    draft: 'Bản nháp',
    published: 'Đã xuất bản',
    archived: 'Đã lưu trữ',
  };

  // Category labels
  const categoryLabels = {
    news: 'Tin tức',
    education: 'Giáo dục',
    prevention: 'Phòng ngừa',
    research: 'Nghiên cứu',
    success_stories: 'Câu chuyện thành công',
    community: 'Cộng đồng',
    health: 'Sức khỏe',
    family: 'Gia đình',
    resources: 'Tài nguyên',
  };

  // Language labels
  const languageLabels = {
    vi: 'Tiếng Việt',
    en: 'English',
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
              <h1 className="text-2xl font-bold text-gray-900">Quản lý bài viết</h1>
              <p className="text-gray-600">Quản lý tất cả bài viết trong hệ thống</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
            >
              <FilePlus size={20} />
              Thêm bài viết
            </button>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tổng bài viết</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.overview.totalPosts || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Đã xuất bản</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.overview.publishedPosts || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Eye className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tổng lượt xem</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.overview.totalViews || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Bài nổi bật</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.overview.featuredPosts || 0}</p>
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
                    placeholder="Tìm kiếm theo tiêu đề, nội dung..."
                    value={filters.search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Tất cả trạng thái</option>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Tất cả danh mục</option>
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Featured Filter */}
              <div>
                <select
                  value={filters.featured}
                  onChange={(e) => handleFilterChange('featured', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Tất cả bài viết</option>
                  <option value="true">Bài nổi bật</option>
                  <option value="false">Bài thường</option>
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
                  <option value="title">Tiêu đề A-Z</option>
                  <option value="views">Lượt xem cao nhất</option>
                  <option value="category">Danh mục</option>
                </select>
              </div>
            </div>
          </div>

          {/* Blogs Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bài viết
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tác giả
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Danh mục
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thống kê
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
                  ) : blogs.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                        Không tìm thấy bài viết nào
                      </td>
                    </tr>
                  ) : (
                    blogs.map((blog) => (
                      <tr key={blog._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-start">
                            <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                              {blog.featuredImage?.url ? (
                                <img 
                                  src={blog.featuredImage.url} 
                                  alt={blog.featuredImage.alt || blog.title}
                                  className="h-12 w-12 rounded-lg object-cover"
                                />
                              ) : (
                                <FileText className="h-6 w-6 text-gray-400" />
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 line-clamp-2">
                                {blog.title}
                              </div>
                              <div className="text-sm text-gray-500 line-clamp-1">
                                {blog.excerpt}
                              </div>
                              <div className="flex items-center mt-1">
                                {blog.settings?.isFeatured && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 mr-2">
                                    Nổi bật
                                  </span>
                                )}
                                {blog.settings?.isPinned && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                    Ghim
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {blog.author?.firstName} {blog.author?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {blog.author?.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {categoryLabels[blog.category] || blog.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            blog.status === 'published' ? 'bg-green-100 text-green-800' :
                            blog.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {statusLabels[blog.status] || blog.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center">
                              <Eye className="h-4 w-4 mr-1" />
                              {blog.views?.count || 0}
                            </div>
                            <div className="flex items-center">
                              <Tag className="h-4 w-4 mr-1" />
                              {blog.likes?.length || 0}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => openDetail(blog)}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="Xem chi tiết"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => openEditForm(blog)}
                              className="text-indigo-600 hover:text-indigo-900 p-1"
                              title="Chỉnh sửa"
                            >
                              <Edit size={16} />
                            </button>
                            {blog.status !== 'archived' ? (
                              <button
                                onClick={() => handleDeleteBlog(blog._id)}
                                className="text-red-600 hover:text-red-900 p-1"
                                title="Xóa"
                              >
                                <Trash2 size={16} />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleRestoreBlog(blog._id)}
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

          {/* Blog Form Modal */}
          {showForm && (
            <BlogForm
              blog={editingBlog}
              onClose={() => {
                setShowForm(false);
                setEditingBlog(null);
              }}
              onSubmit={editingBlog ? handleUpdateBlog : handleCreateBlog}
            />
          )}

          {/* Blog Detail Modal */}
          {showDetail && selectedBlog && (
            <BlogDetail
              blog={selectedBlog}
              onClose={() => {
                setShowDetail(false);
                setSelectedBlog(null);
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default Blogs; 
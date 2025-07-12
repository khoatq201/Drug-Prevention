import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import BlogForm from '../../components/admin/BlogForm';
import BlogDetail from '../../components/admin/BlogDetail';
import Pagination from '../../components/common/Pagination';
import { toast } from 'react-hot-toast';
import { FilePlus, FileText, Eye, Edit, Trash2, User } from 'lucide-react';

const BlogManager = ({
  role = 'admin',
  Sidebar,
  Header,
}) => {
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
    } catch (error) {}
  };

  useEffect(() => {
    fetchBlogs();
    fetchStats();
    // eslint-disable-next-line
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
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
      toast.error(error.response?.data?.message || 'Lỗi khi tạo bài viết');
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
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật bài viết');
    }
  };

  // Handle delete blog
  const handleDeleteBlog = async (blogId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;
    try {
      const response = await api.delete(`/blogs/admin/${blogId}`);
      if (response.data.success) {
        toast.success('Xóa bài viết thành công');
        fetchBlogs();
        fetchStats();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi xóa bài viết');
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
      {Sidebar && <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
      <div className="flex-1 flex flex-col">
        {Header && <Header onMenuToggle={() => setSidebarOpen(true)} />}
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

          {/* Blog Table */}
          <div className="card overflow-x-auto mb-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiêu đề</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Danh mục</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tác giả</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {blogs.map((blog) => (
                  <tr key={blog._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 line-clamp-2">{blog.title}</div>
                      <div className="text-xs text-gray-500 line-clamp-1">{blog.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {categoryLabels[blog.category] || blog.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-xs text-gray-700">
                        <User className="w-4 h-4" />
                        {blog.author?.fullName || blog.author?.name || 'Ẩn danh'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        blog.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : blog.status === 'archived'
                          ? 'bg-gray-200 text-gray-500'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {statusLabels[blog.status] || blog.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <a
                          href={`/blog/${blog._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Xem bài viết công khai"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => openEditForm(blog)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBlog(blog._id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.total > 1 && (
            <Pagination
              currentPage={pagination.current}
              totalPages={pagination.total}
              onPageChange={handlePageChange}
            />
          )}

          {/* Blog Form Modal */}
          {showForm && (
            <BlogForm
              blog={editingBlog}
              onClose={() => { setShowForm(false); setEditingBlog(null); }}
              onSubmit={editingBlog ? handleUpdateBlog : handleCreateBlog}
            />
          )}

          {/* Blog Detail Modal */}
          {showDetail && selectedBlog && (
            <BlogDetail
              blog={selectedBlog}
              onClose={() => setShowDetail(false)}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default BlogManager; 
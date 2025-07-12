import React, { useState, useEffect } from 'react';
import { X, Save, FileText, Image, Settings, Calendar, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

const BlogForm = ({ blog, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    tags: [],
    targetAudience: [],
    language: 'vi',
    status: 'draft',
    featuredImage: {
      url: '',
      alt: '',
      caption: '',
    },
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: [],
    },
    settings: {
      allowComments: true,
      requireApproval: false,
      allowLikes: true,
      isFeatured: false,
      isPinned: false,
    },
    scheduledFor: '',
  });

  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');

  // Category options
  const categories = [
    { value: 'news', label: 'Tin tức' },
    { value: 'education', label: 'Giáo dục' },
    { value: 'prevention', label: 'Phòng ngừa' },
    { value: 'research', label: 'Nghiên cứu' },
    { value: 'success_stories', label: 'Câu chuyện thành công' },
    { value: 'community', label: 'Cộng đồng' },
    { value: 'health', label: 'Sức khỏe' },
    { value: 'family', label: 'Gia đình' },
    { value: 'resources', label: 'Tài nguyên' },
  ];

  // Target audience options
  const targetAudiences = [
    { value: 'student', label: 'Học sinh' },
    { value: 'university_student', label: 'Sinh viên' },
    { value: 'parent', label: 'Phụ huynh' },
    { value: 'teacher', label: 'Giáo viên' },
    { value: 'counselor', label: 'Tư vấn viên' },
    { value: 'general', label: 'Chung' },
  ];

  // Initialize form data when editing
  useEffect(() => {
    if (blog) {
      setFormData({
        title: blog.title || '',
        excerpt: blog.excerpt || '',
        content: blog.content || '',
        category: blog.category || '',
        tags: blog.tags || [],
        targetAudience: blog.targetAudience || [],
        language: blog.language || 'vi',
        status: blog.status || 'draft',
        featuredImage: blog.featuredImage || { url: '', alt: '', caption: '' },
        seo: blog.seo || { metaTitle: '', metaDescription: '', keywords: [] },
        settings: {
          allowComments: blog.settings?.allowComments !== undefined ? blog.settings.allowComments : true,
          requireApproval: blog.settings?.requireApproval !== undefined ? blog.settings.requireApproval : false,
          allowLikes: blog.settings?.allowLikes !== undefined ? blog.settings.allowLikes : true,
          isFeatured: blog.settings?.isFeatured || false,
          isPinned: blog.settings?.isPinned || false,
        },
        scheduledFor: blog.scheduledFor ? new Date(blog.scheduledFor).toISOString().slice(0, 16) : '',
      });
    }
  }, [blog]);

  // Handle form field changes
  const handleChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  // Handle array field changes
  const handleArrayChange = (field, value, action = 'add') => {
    if (action === 'add') {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value],
      }));
    } else if (action === 'remove') {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter(item => item !== value),
      }));
    }
  };

  // Add tag
  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      handleArrayChange('tags', tagInput.trim());
      setTagInput('');
    }
  };

  // Add keyword
  const addKeyword = () => {
    if (keywordInput.trim() && !formData.seo.keywords.includes(keywordInput.trim())) {
      handleArrayChange('seo.keywords', keywordInput.trim());
      setKeywordInput('');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Tiêu đề là bắt buộc');
      return;
    }

    if (!formData.excerpt.trim()) {
      toast.error('Tóm tắt là bắt buộc');
      return;
    }

    if (!formData.content.trim()) {
      toast.error('Nội dung là bắt buộc');
      return;
    }

    if (!formData.category) {
      toast.error('Danh mục là bắt buộc');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <FileText className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">
              {blog ? 'Chỉnh sửa bài viết' : 'Thêm bài viết mới'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Title */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề bài viết *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập tiêu đề bài viết"
                maxLength={200}
              />
            </div>

            {/* Excerpt */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tóm tắt bài viết *
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => handleChange('excerpt', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập tóm tắt bài viết"
                maxLength={500}
              />
            </div>

            {/* Category and Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Chọn danh mục</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngôn ngữ
              </label>
              <select
                value={formData.language}
                onChange={(e) => handleChange('language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
              </select>
            </div>

            {/* Status and Scheduled For */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="draft">Bản nháp</option>
                <option value="published">Xuất bản</option>
                <option value="archived">Lưu trữ</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lên lịch xuất bản
              </label>
              <input
                type="datetime-local"
                value={formData.scheduledFor}
                onChange={(e) => handleChange('scheduledFor', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung bài viết *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => handleChange('content', e.target.value)}
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập nội dung bài viết"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập tag và nhấn Enter"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Thêm
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleArrayChange('tags', tag, 'remove')}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Target Audience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đối tượng mục tiêu
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {targetAudiences.map(audience => (
                <label key={audience.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.targetAudience.includes(audience.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleArrayChange('targetAudience', audience.value);
                      } else {
                        handleArrayChange('targetAudience', audience.value, 'remove');
                      }
                    }}
                    className="mr-2"
                  />
                  {audience.label}
                </label>
              ))}
            </div>
          </div>

          {/* Featured Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ảnh đại diện
            </label>
            <div className="space-y-3">
              <input
                type="url"
                value={formData.featuredImage.url}
                onChange={(e) => handleChange('featuredImage.url', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="URL ảnh"
              />
              <input
                type="text"
                value={formData.featuredImage.alt}
                onChange={(e) => handleChange('featuredImage.alt', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Alt text cho ảnh"
              />
              <input
                type="text"
                value={formData.featuredImage.caption}
                onChange={(e) => handleChange('featuredImage.caption', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Chú thích ảnh"
              />
            </div>
          </div>

          {/* SEO Settings */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Cài đặt SEO
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={formData.seo.metaTitle}
                  onChange={(e) => handleChange('seo.metaTitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Meta title cho SEO"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description
                </label>
                <textarea
                  value={formData.seo.metaDescription}
                  onChange={(e) => handleChange('seo.metaDescription', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Meta description cho SEO"
                  maxLength={160}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keywords
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập keyword và nhấn Enter"
                  />
                  <button
                    type="button"
                    onClick={addKeyword}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Thêm
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.seo.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => handleArrayChange('seo.keywords', keyword, 'remove')}
                        className="ml-2 text-green-600 hover:text-green-800"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Blog Settings */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Cài đặt bài viết
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.settings.allowComments}
                    onChange={(e) => handleChange('settings.allowComments', e.target.checked)}
                    className="mr-2"
                  />
                  Cho phép bình luận
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.settings.requireApproval}
                    onChange={(e) => handleChange('settings.requireApproval', e.target.checked)}
                    className="mr-2"
                  />
                  Yêu cầu duyệt bình luận
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.settings.allowLikes}
                    onChange={(e) => handleChange('settings.allowLikes', e.target.checked)}
                    className="mr-2"
                  />
                  Cho phép thích
                </label>
              </div>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.settings.isFeatured}
                    onChange={(e) => handleChange('settings.isFeatured', e.target.checked)}
                    className="mr-2"
                  />
                  Bài viết nổi bật
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.settings.isPinned}
                    onChange={(e) => handleChange('settings.isPinned', e.target.checked)}
                    className="mr-2"
                  />
                  Ghim bài viết
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {blog ? 'Cập nhật' : 'Tạo bài viết'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogForm; 
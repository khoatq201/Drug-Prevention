import React from 'react';
import { X, Eye, Calendar, User, Tag, FileText, Settings, BarChart3 } from 'lucide-react';

const BlogDetail = ({ blog, onClose }) => {
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

  // Status labels
  const statusLabels = {
    draft: 'Bản nháp',
    published: 'Đã xuất bản',
    archived: 'Đã lưu trữ',
  };

  // Target audience labels
  const targetAudienceLabels = {
    student: 'Học sinh',
    university_student: 'Sinh viên',
    parent: 'Phụ huynh',
    teacher: 'Giáo viên',
    counselor: 'Tư vấn viên',
    general: 'Chung',
  };

  // Language labels
  const languageLabels = {
    vi: 'Tiếng Việt',
    en: 'English',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <FileText className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Chi tiết bài viết</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Featured Image */}
          {blog.featuredImage?.url && (
            <div>
              <img
                src={blog.featuredImage.url}
                alt={blog.featuredImage.alt || blog.title}
                className="w-full h-64 object-cover rounded-lg"
              />
              {blog.featuredImage.caption && (
                <p className="text-sm text-gray-600 mt-2 text-center">
                  {blog.featuredImage.caption}
                </p>
              )}
            </div>
          )}

          {/* Title and Basic Info */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{blog.title}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-2" />
                <span>Tác giả: {blog.author?.firstName} {blog.author?.lastName}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Tạo: {new Date(blog.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Eye className="h-4 w-4 mr-2" />
                <span>Lượt xem: {blog.views?.count || 0}</span>
              </div>
            </div>

            {/* Status and Category */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                blog.status === 'published' ? 'bg-green-100 text-green-800' :
                blog.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {statusLabels[blog.status] || blog.status}
              </span>
              <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                {categoryLabels[blog.category] || blog.category}
              </span>
              <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-purple-100 text-purple-800">
                {languageLabels[blog.language] || blog.language}
              </span>
              {blog.settings?.isFeatured && (
                <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">
                  Nổi bật
                </span>
              )}
              {blog.settings?.isPinned && (
                <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800">
                  Ghim
                </span>
              )}
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tóm tắt</h3>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
              {blog.excerpt}
            </p>
          </div>

          {/* Content */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nội dung</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="prose max-w-none">
                {blog.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <Tag className="h-5 w-5 mr-2" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Target Audience */}
          {blog.targetAudience && blog.targetAudience.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Đối tượng mục tiêu</h3>
              <div className="flex flex-wrap gap-2">
                {blog.targetAudience.map((audience, index) => (
                  <span
                    key={index}
                    className="inline-flex px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full"
                  >
                    {targetAudienceLabels[audience] || audience}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Statistics */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Thống kê
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{blog.views?.count || 0}</div>
                <div className="text-sm text-gray-600">Lượt xem</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{blog.likes?.length || 0}</div>
                <div className="text-sm text-gray-600">Lượt thích</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">{blog.comments?.length || 0}</div>
                <div className="text-sm text-gray-600">Bình luận</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {blog.views?.uniqueViews || 0}
                </div>
                <div className="text-sm text-gray-600">Lượt xem duy nhất</div>
              </div>
            </div>
          </div>

          {/* SEO Information */}
          {blog.seo && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Thông tin SEO
              </h3>
              <div className="space-y-3">
                {blog.seo.metaTitle && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Meta Title</label>
                    <p className="text-gray-900 bg-gray-50 p-2 rounded">{blog.seo.metaTitle}</p>
                  </div>
                )}
                {blog.seo.metaDescription && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Meta Description</label>
                    <p className="text-gray-900 bg-gray-50 p-2 rounded">{blog.seo.metaDescription}</p>
                  </div>
                )}
                {blog.seo.keywords && blog.seo.keywords.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Keywords</label>
                    <div className="flex flex-wrap gap-2">
                      {blog.seo.keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="inline-flex px-2 py-1 text-sm bg-gray-100 text-gray-800 rounded"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Blog Settings */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Cài đặt bài viết
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className={`w-3 h-3 rounded-full mr-2 ${
                    blog.settings?.allowComments ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                  Cho phép bình luận: {blog.settings?.allowComments ? 'Có' : 'Không'}
                </div>
                <div className="flex items-center">
                  <span className={`w-3 h-3 rounded-full mr-2 ${
                    blog.settings?.requireApproval ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                  Yêu cầu duyệt bình luận: {blog.settings?.requireApproval ? 'Có' : 'Không'}
                </div>
                <div className="flex items-center">
                  <span className={`w-3 h-3 rounded-full mr-2 ${
                    blog.settings?.allowLikes ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                  Cho phép thích: {blog.settings?.allowLikes ? 'Có' : 'Không'}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className={`w-3 h-3 rounded-full mr-2 ${
                    blog.settings?.isFeatured ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                  Bài viết nổi bật: {blog.settings?.isFeatured ? 'Có' : 'Không'}
                </div>
                <div className="flex items-center">
                  <span className={`w-3 h-3 rounded-full mr-2 ${
                    blog.settings?.isPinned ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                  Ghim bài viết: {blog.settings?.isPinned ? 'Có' : 'Không'}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin bổ sung</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Slug:</span>
                <span className="ml-2 text-gray-900">{blog.slug}</span>
              </div>
              {blog.publishedAt && (
                <div>
                  <span className="font-medium text-gray-700">Ngày xuất bản:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date(blog.publishedAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              )}
              {blog.scheduledFor && (
                <div>
                  <span className="font-medium text-gray-700">Lên lịch:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date(blog.scheduledFor).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              )}
              {blog.lastViewedAt && (
                <div>
                  <span className="font-medium text-gray-700">Lần xem cuối:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date(blog.lastViewedAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-6 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail; 
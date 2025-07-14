import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  UserIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

const Blog = () => {
  const { api } = useAuth();
  const [posts, setPosts] = useState([]);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Add debounce for search
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const categoryLabels = {
    news: "Tin tức",
    education: "Giáo dục",
    prevention: "Phòng ngừa",
    research: "Nghiên cứu",
    success_stories: "Câu chuyện thành công",
    community: "Cộng đồng",
    health: "Sức khỏe",
    family: "Gia đình",
    resources: "Tài nguyên",
  };

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // Delay 500ms

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch posts when debounced search term or category changes
  useEffect(() => {
    fetchPosts();
  }, [selectedCategory, debouncedSearchTerm]);

  // Fetch featured posts and categories only once on mount
  useEffect(() => {
    fetchFeaturedPosts();
    fetchCategories();
  }, []);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (selectedCategory) {
        params.append("category", selectedCategory);
      }

      if (debouncedSearchTerm.trim()) {
        params.append("search", debouncedSearchTerm.trim());
      }

      const response = await api.get(`/blogs?${params.toString()}`);
      setPosts(response.data.data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [api, selectedCategory, debouncedSearchTerm]);

  const fetchFeaturedPosts = async () => {
    try {
      const response = await api.get("/blogs/featured");
      setFeaturedPosts(response.data.data || []);
    } catch (error) {
      console.error("Error fetching featured posts:", error);
      setFeaturedPosts([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/blogs/categories");
      setCategories(response.data.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setDebouncedSearchTerm(""); // Clear debounced term immediately
  };

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setDebouncedSearchTerm(searchTerm.trim());
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Check if any filters are active
  const hasActiveFilters = debouncedSearchTerm || selectedCategory;

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-50 py-12"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="text-center mb-12" variants={fadeInUp}>
          <DocumentTextIcon className="mx-auto h-16 w-16 text-blue-600 mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Blog về phòng chống ma túy
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Chia sẻ kinh nghiệm, kiến thức và những câu chuyện truyền cảm hứng
            trong hành trình phòng chống tệ nạn ma túy.
          </p>
        </motion.div>

        <motion.div
          className="bg-white rounded-lg shadow-md p-6 mb-8"
          variants={fadeInUp}
        >
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col lg:flex-row gap-4"
          >
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition-colors"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>

            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden btn-outline"
            >
              <FunnelIcon className="w-5 h-5 mr-2" />
              Bộ lọc
            </button>

            <div className="hidden lg:block">
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition-colors"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((category) => (
                  <option key={category.category} value={category.category}>
                    {categoryLabels[category.category] || category.category} (
                    {category.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Clear filters button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="btn-outline"
              >
                Xóa bộ lọc
              </button>
            )}
          </form>

          {/* Mobile filters */}
          {showFilters && (
            <motion.div
              className="lg:hidden mt-4 pt-4 border-t border-gray-200"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition-colors"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((category) => (
                  <option key={category.category} value={category.category}>
                    {categoryLabels[category.category] || category.category} (
                    {category.count})
                  </option>
                ))}
              </select>
            </motion.div>
          )}

          {/* Show active filters */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-gray-600">
                  Bộ lọc đang áp dụng:
                </span>
                {debouncedSearchTerm && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Tìm kiếm: "{debouncedSearchTerm}"
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm("");
                        setDebouncedSearchTerm("");
                      }}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedCategory && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Danh mục:{" "}
                    {categoryLabels[selectedCategory] || selectedCategory}
                    <button
                      type="button"
                      onClick={() => setSelectedCategory("")}
                      className="ml-1 text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            {/* Featured posts - only show when no filters are active */}
            {featuredPosts.length > 0 && !hasActiveFilters && (
              <motion.div className="mb-12" variants={fadeInUp}>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Bài viết nổi bật
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featuredPosts.slice(0, 2).map((post) => (
                    <motion.div
                      key={post._id}
                      className="blog-card"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      {post.featuredImage && (
                        <div className="aspect-video bg-gray-200 overflow-hidden">
                          <img
                            src={post.featuredImage.url}
                            alt={post.featuredImage.alt || post.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className="blog-category">
                            {categoryLabels[post.category] || post.category}
                          </span>
                          <div className="flex items-center text-sm text-gray-500">
                            <EyeIcon className="w-4 h-4 mr-1" />
                            <span>{post.views?.count || 0}</span>
                          </div>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {truncateText(post.excerpt)}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-500">
                            <CalendarIcon className="w-4 h-4 mr-1" />
                            <span>{formatDate(post.publishedAt)}</span>
                          </div>
                          <Link
                            to={`/blog/${post.slug || post._id}`}
                            className="text-green-600 hover:text-green-700 font-medium"
                          >
                            Đọc tiếp →
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            <motion.div variants={fadeInUp}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {hasActiveFilters ? "Kết quả tìm kiếm" : "Bài viết mới nhất"}
                </h2>
                {hasActiveFilters && (
                  <p className="text-sm text-gray-600">
                    Tìm thấy {posts.length} kết quả
                  </p>
                )}
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="spinner"></div>
                </div>
              ) : posts.length > 0 ? (
                <div className="space-y-6">
                  {posts.map((post) => (
                    <motion.div
                      key={post._id}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="md:flex">
                        {post.featuredImage && (
                          <div className="md:w-1/3">
                            <div className="aspect-video md:aspect-square bg-gray-200 overflow-hidden">
                              <img
                                src={post.featuredImage.url}
                                alt={post.featuredImage.alt || post.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        )}
                        <div className="p-6 flex-1">
                          <div className="flex items-center justify-between mb-3">
                            <span className="blog-category">
                              {categoryLabels[post.category] || post.category}
                            </span>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                <EyeIcon className="w-4 h-4 mr-1" />
                                <span>{post.views?.count || 0}</span>
                              </div>
                              <div className="flex items-center">
                                <HeartIcon className="w-4 h-4 mr-1" />
                                <span>{post.likes?.length || 0}</span>
                              </div>
                              <div className="flex items-center">
                                <ChatBubbleLeftIcon className="w-4 h-4 mr-1" />
                                <span>{post.comments?.length || 0}</span>
                              </div>
                            </div>
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {post.title}
                          </h3>
                          <p className="text-gray-600 mb-4">
                            {truncateText(post.excerpt)}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-sm text-gray-500">
                              <UserIcon className="w-4 h-4 mr-1" />
                              <span>
                                {post.author?.firstName} {post.author?.lastName}
                              </span>
                              <span className="mx-2">•</span>
                              <CalendarIcon className="w-4 h-4 mr-1" />
                              <span>{formatDate(post.publishedAt)}</span>
                            </div>
                            <Link
                              to={`/blog/${post.slug || post._id}`}
                              className="text-green-600 hover:text-green-700 font-medium"
                            >
                              Đọc tiếp →
                            </Link>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Không tìm thấy bài viết
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {hasActiveFilters
                      ? "Thử thay đổi từ khóa tìm kiếm hoặc danh mục để tìm bài viết phù hợp."
                      : "Hiện tại chưa có bài viết nào được đăng tải."}
                  </p>
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="btn-outline">
                      Xóa bộ lọc
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </div>

          {/* Sticky Sidebar */}
          <motion.div
            className="space-y-6 sticky top-20 self-start"
            variants={fadeInUp}
          >
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Danh mục
              </h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.category}
                    onClick={() => handleCategoryChange(category.category)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.category
                        ? "bg-green-100 text-green-800"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>
                        {categoryLabels[category.category] || category.category}
                      </span>
                      <span className="text-sm text-gray-500">
                        {category.count}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Đăng ký nhận tin
              </h3>
              <p className="text-sm text-green-700 mb-4">
                Nhận những bài viết mới nhất về phòng chống ma túy qua email.
              </p>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Email của bạn"
                  className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none"
                />
                <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
                  Đăng ký
                </button>
              </div>
            </div>

            {featuredPosts.length > 2 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Bài viết phổ biến
                </h3>
                <div className="space-y-4">
                  {featuredPosts.slice(2, 5).map((post) => (
                    <div key={post._id} className="flex space-x-3">
                      {post.featuredImage && (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={post.featuredImage.url}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/blog/${post.slug || post._id}`}
                          className="text-sm font-medium text-gray-900 hover:text-green-600 line-clamp-2"
                        >
                          {post.title}
                        </Link>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(post.publishedAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Blog;

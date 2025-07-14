import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import {
  AcademicCapIcon,
  ClockIcon,
  UserGroupIcon,
  StarIcon,
  PlayIcon,
  BookOpenIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

const Courses = () => {
  const { user, isAuthenticated, api, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasInitialFetchRef = useRef(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Course categories
  const categories = [
    { value: "", label: "Tất cả danh mục" },
    { value: "awareness", label: "Nâng cao nhận thức" },
    { value: "prevention", label: "Phòng ngừa" },
    { value: "counseling", label: "Tư vấn" },
    { value: "family", label: "Gia đình" },
    { value: "school", label: "Trường học" },
    { value: "community", label: "Cộng đồng" },
  ];

  const levels = [
    { value: "", label: "Tất cả cấp độ" },
    { value: "beginner", label: "Cơ bản" },
    { value: "intermediate", label: "Trung cấp" },
    { value: "advanced", label: "Nâng cao" },
  ];

  const ageGroups = [
    { value: "", label: "Tất cả độ tuổi" },
    { value: "student", label: "Học sinh" },
    { value: "university_student", label: "Sinh viên" },
    { value: "parent", label: "Phụ huynh" },
    { value: "teacher", label: "Giáo viên" },
    { value: "other", label: "Khác" },
  ];

  // Initial fetch - chỉ chạy 1 lần khi auth loading hoàn thành và user data sẵn sàng
  useEffect(() => {
    console.log("🔍 useEffect authLoading changed:", authLoading);
    console.log("🔍 Current user:", user);
    console.log("🔍 Current isAuthenticated:", isAuthenticated);

    // Chỉ fetch khi auth loading hoàn thành và chưa fetch lần đầu
    if (!authLoading && !hasInitialFetchRef.current) {
      // Nếu có token, đợi user data load xong
      if (localStorage.getItem("token")) {
        if (user && isAuthenticated) {
          fetchCourses();
          hasInitialFetchRef.current = true;
        }
      } else {
        // Không có token, fetch ngay
        fetchCourses();
        hasInitialFetchRef.current = true;
      }
    }
  }, [authLoading, user, isAuthenticated]);

  // Refetch khi filters thay đổi (sau khi đã fetch lần đầu)
  useEffect(() => {
    if (hasInitialFetchRef.current) {
      fetchCourses();
    }
  }, [selectedCategory, selectedLevel, searchTerm]);

  const fetchCourses = async () => {
    console.log("🚀 fetchCourses called");
    console.log("🚀 authLoading:", authLoading);
    console.log("🚀 hasInitialFetchRef.current:", hasInitialFetchRef.current);
    console.log(
      "🚀 localStorage token:",
      localStorage.getItem("token") ? "exists" : "missing"
    );

    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory) params.append("category", selectedCategory);
      if (selectedLevel) params.append("level", selectedLevel);
      if (searchTerm) params.append("search", searchTerm);

      // Chỉ gửi ageGroup nếu user đã đăng nhập và có ageGroup
      if (isAuthenticated && user?.ageGroup) {
        params.append("ageGroup", user.ageGroup);
      }

      console.log("🔍 Fetching courses with params:", params.toString());
      console.log("🔍 User:", user);
      console.log("🔍 IsAuthenticated:", isAuthenticated);
      const response = await api.get(`/courses?${params.toString()}`);
      console.log(
        "🔍 Response courses count:",
        response.data.data?.length || 0
      );
      setCourses(response.data.data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelStyle = (level) => {
    switch (level) {
      case "beginner":
        return "level-beginner";
      case "intermediate":
        return "level-intermediate";
      case "advanced":
        return "level-advanced";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getLevelText = (level) => {
    switch (level) {
      case "beginner":
        return "Cơ bản";
      case "intermediate":
        return "Trung cấp";
      case "advanced":
        return "Nâng cao";
      default:
        return level;
    }
  };

  const formatDuration = (duration) => {
    if (duration >= 60) {
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    return `${duration}m`;
  };

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
        {/* Header */}
        <motion.div className="text-center mb-12" variants={fadeInUp}>
          <AcademicCapIcon className="mx-auto h-16 w-16 text-green-600 mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Khóa học đào tạo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Nâng cao kiến thức và kỹ năng phòng chống ma túy thông qua các khóa
            học chuyên nghiệp được thiết kế phù hợp với từng độ tuổi.
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          className="bg-white rounded-lg shadow-md p-6 mb-8"
          variants={fadeInUp}
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm khóa học..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter Toggle (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden btn-outline"
            >
              <FunnelIcon className="w-5 h-5 mr-2" />
              Bộ lọc
            </button>

            {/* Filters (Desktop) */}
            <div className="hidden lg:flex gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {levels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Mobile Filters */}
          {showFilters && (
            <motion.div
              className="lg:hidden mt-4 pt-4 border-t border-gray-200"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="form-input"
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="form-input"
                >
                  {levels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Courses Grid */}
        {authLoading || loading ? (
          <div className="flex justify-center">
            <div className="spinner"></div>
          </div>
        ) : courses.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
          >
            {courses.map((course) => (
              <motion.div
                key={course._id}
                className="course-card bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full"
                variants={fadeInUp}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                {course.thumbnail && (
                  <div className="aspect-video bg-gray-200 overflow-hidden">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-6 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`course-level ${getLevelStyle(course.level)}`}
                    >
                      {getLevelText(course.level)}
                    </span>
                    <div className="flex items-center text-yellow-500">
                      <StarIcon className="w-4 h-4 fill-current" />
                      <span className="ml-1 text-sm text-gray-600">
                        {course.rating || "4.5"}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                    {course.title}
                  </h3>

                  <p className="text-gray-600 mb-4 line-clamp-3 flex-1">
                    {course.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      <span>{formatDuration(course.duration)}</span>
                    </div>
                    <div className="flex items-center">
                      <UserGroupIcon className="w-4 h-4 mr-1" />
                      <span>{course.enrollmentCount || 0} học viên</span>
                    </div>
                  </div>

                  <div className="flex-1" />
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-lg font-bold text-green-600">
                      {course.pricing.price === 0
                        ? "Miễn phí"
                        : `${course.pricing.price?.toLocaleString()}đ`}
                    </div>
                    <Link to={`/courses/${course._id}`} className="btn-primary">
                      <PlayIcon className="w-4 h-4 mr-1" />
                      Bắt đầu
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div className="text-center py-12" variants={fadeInUp}>
            <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không tìm thấy khóa học
            </h3>
            <p className="text-gray-600 mb-6">
              Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc để tìm khóa học phù hợp.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("");
                setSelectedLevel("");
              }}
              className="btn-outline"
            >
              Xóa bộ lọc
            </button>
          </motion.div>
        )}

        {/* Statistics */}
        <motion.div
          className="mt-16 bg-white rounded-lg shadow-md p-8"
          variants={fadeInUp}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">25+</div>
              <div className="text-gray-600">Khóa học</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                2,500+
              </div>
              <div className="text-gray-600">Học viên</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">95%</div>
              <div className="text-gray-600">Hài lòng</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">24/7</div>
              <div className="text-gray-600">Hỗ trợ</div>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        {!isAuthenticated && (
          <motion.div
            className="text-center mt-12 bg-green-600 text-white rounded-lg p-8"
            variants={fadeInUp}
          >
            <h3 className="text-2xl font-bold mb-4">
              Đăng ký để theo dõi tiến độ học tập
            </h3>
            <p className="text-green-100 mb-6 max-w-2xl mx-auto">
              Tạo tài khoản để lưu tiến độ học tập, nhận chứng chỉ hoàn thành và
              kết nối với cộng đồng học viên.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-green-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200"
              >
                Đăng ký miễn phí
              </Link>
              <Link
                to="/login"
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-green-600 transition-all duration-200"
              >
                Đăng nhập
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Courses;

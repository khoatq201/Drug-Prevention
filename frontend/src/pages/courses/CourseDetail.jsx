import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import {
  AcademicCapIcon,
  ClockIcon,
  UserGroupIcon,
  StarIcon,
  PlayIcon,
  CheckCircleIcon,
  BookOpenIcon,
  DocumentTextIcon,
  TrophyIcon,
  ChatBubbleLeftEllipsisIcon,
  ArrowLeftIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, api } = useAuth();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchCourse();
    if (isAuthenticated) {
      fetchEnrollment();
    }
  }, [id, isAuthenticated]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/courses/${id}`);
      if (response.data.success) {
        setCourse(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching course:", error);
      toast.error("Không thể tải thông tin khóa học");
      navigate("/courses");
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollment = async () => {
    debugger
    try {
      const response = await api.get(`/courses/${id}/enrollment`);
      if (response.data.success) {
        setEnrollment(response.data.data);
      }
    } catch (error) {
      // Not enrolled yet, which is fine
      console.log("Not enrolled in course");
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: `/courses/${id}` } } });
      return;
    }

    try {
      setEnrolling(true);
      const response = await api.post(`/courses/${id}/enroll`);
      if (response.data.success) {
        setEnrollment(response.data.data);
        toast.success("Đăng ký khóa học thành công!");
      }
    } catch (error) {
      console.error("Error enrolling in course:", error);
      toast.error("Không thể đăng ký khóa học");
    } finally {
      setEnrolling(false);
    }
  };

  const handleStartLessson = (lessonId) => {
    if (!enrollment) {
      toast.error("Vui lòng đăng ký khóa học trước");
      return;
    }
    if (!lessonId) {
      toast.error("Không tìm thấy bài học!");
      return;
    }
    navigate(`/courses/${id}/lessons/${lessonId}`);
  };

  const getLevelStyle = (level) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
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

  const isLessonAccessible = (lesson, index) => {
    if (!enrollment) return false;
    if (index === 0) return true; // First lesson is always accessible

    // Flatten all lessons
    const allLessons = course.modules?.flatMap(m => m.lessons || []) || [];
    const completedLessons = enrollment.progress?.completedLessons || [];
    const previousLessonId = allLessons[index - 1] && (
      typeof allLessons[index - 1]._id === "string"
        ? allLessons[index - 1]._id
        : allLessons[index - 1]._id?.$oid
    );
    return completedLessons.includes(previousLessonId);
  };

  const getProgress = () => {
    if (!enrollment || !course?.modules) return 0;
    const allLessons = course.modules.flatMap(m => m.lessons || []);
    const completedLessons = enrollment.progress?.completedLessons || [];
    return allLessons.length > 0
      ? Math.round((completedLessons.length / allLessons.length) * 100)
      : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Không tìm thấy khóa học
            </h1>
            <button onClick={() => navigate("/courses")} className="btn-primary">
              Quay lại danh sách khóa học
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gray-50 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.button
          onClick={() => navigate("/courses")}
          className="mb-6 btn-outline"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Quay lại
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Header */}
            <motion.div
              className="bg-white rounded-lg shadow-md overflow-hidden mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {course.thumbnail && (
                <div className="aspect-video bg-gray-200">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelStyle(course.level)}`}>
                    {getLevelText(course.level)}
                  </span>
                  <div className="flex items-center text-yellow-500">
                    <StarIcon className="w-5 h-5 fill-current" />
                    <span className="ml-1 text-sm text-gray-600">
                      {course.rating || "4.5"} ({course.reviewCount || 0} đánh giá)
                    </span>
                  </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {course.title}
                </h1>

                <p className="text-gray-600 text-lg mb-6">
                  {course.description}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center text-gray-600">
                    <ClockIcon className="w-5 h-5 mr-2" />
                    <span>{formatDuration(course.duration)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <BookOpenIcon className="w-5 h-5 mr-2" />
                    <span>
                      {course.modules
                        ? course.modules.reduce((total, module) => total + (module.lessons?.length || 0), 0)
                        : 0} bài học
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <UserGroupIcon className="w-5 h-5 mr-2" />
                    <span>{course.enrollmentCount || 0} học viên</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <TrophyIcon className="w-5 h-5 mr-2" />
                    <span>Chứng chỉ</span>
                  </div>
                </div>

                {enrollment && (
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Tiến độ học tập</span>
                      <span>{getProgress()}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className="bg-green-600 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${getProgress()}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Tabs */}
            <motion.div
              className="bg-white rounded-lg shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: "overview", label: "Tổng quan", icon: DocumentTextIcon },
                    { id: "curriculum", label: "Nội dung", icon: BookOpenIcon },
                    { id: "reviews", label: "Đánh giá", icon: ChatBubbleLeftEllipsisIcon },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-4 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                          ? "border-green-500 text-green-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                          }`}
                      >
                        <Icon className="w-4 h-4 mr-2 inline" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Mô tả khóa học
                      </h3>
                      <div className="prose max-w-none text-gray-600">
                        {course.fullDescription || course.description}
                      </div>
                    </div>

                    {course.objectives && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          Mục tiêu học tập
                        </h3>
                        <ul className="space-y-2">
                          {course.objectives.map((objective, index) => (
                            <li key={index} className="flex items-start">
                              <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-600">{objective}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {course.prerequisites && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          Yêu cầu tiên quyết
                        </h3>
                        <ul className="space-y-2">
                          {course.prerequisites.map((prereq, index) => (
                            <li key={index} className="flex items-start">
                              <span className="w-2 h-2 bg-gray-400 rounded-full mr-3 mt-2 flex-shrink-0" />
                              <span className="text-gray-600">{prereq}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "curriculum" && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Nội dung khóa học
                    </h3>
                    <div className="space-y-6">
                      {course.modules?.map((module, moduleIdx) => (
                        <div key={module._id || moduleIdx}>
                          <h4 className="font-semibold text-gray-800 mb-2">{module.title}</h4>
                          <div className="space-y-3">
                            {module.lessons?.map((lesson, lessonIdx) => {
                              const index = lessonIdx; // You may want to use a global index if needed
                              const isAccessible = isLessonAccessible(lesson, index);
                              const isCompleted = enrollment?.progress?.completedLessons?.includes(lesson._id);

                              return (
                                <motion.div
                                  key={lesson._id}
                                  className={`border rounded-lg p-4 transition-colors ${isAccessible ? "border-gray-200 hover:border-green-300" : "border-gray-100 bg-gray-50"
                                    }`}
                                  whileHover={isAccessible ? { scale: 1.01 } : {}}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center flex-1">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${isCompleted ? "bg-green-500" : isAccessible ? "bg-blue-500" : "bg-gray-300"
                                        }`}>
                                        {isCompleted ? (
                                          <CheckCircleIcon className="w-5 h-5 text-white" />
                                        ) : isAccessible ? (
                                          <PlayIcon className="w-4 h-4 text-white" />
                                        ) : (
                                          <LockClosedIcon className="w-4 h-4 text-gray-500" />
                                        )}
                                      </div>
                                      <div className="flex-1">
                                        <h4 className={`font-medium ${isAccessible ? "text-gray-900" : "text-gray-500"
                                          }`}>
                                          {lesson.title}
                                        </h4>
                                        <p className={`text-sm ${isAccessible ? "text-gray-600" : "text-gray-400"
                                          }`}>
                                          {lesson.description}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500 mr-4">
                                      <ClockIcon className="w-4 h-4 mr-1" />
                                      <span>{formatDuration(lesson.duration)}</span>
                                    </div>
                                    {isAccessible && (
                                      <button
                                        onClick={() => handleStartLessson(lesson._id)}
                                        className="btn-outline text-sm"
                                      >
                                        {isCompleted ? "Xem lại" : "Bắt đầu"}
                                      </button>
                                    )}
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Đánh giá từ học viên
                    </h3>
                    <div className="text-center py-8 text-gray-500">
                      Chức năng đánh giá sẽ sớm được cập nhật
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Enrollment Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {course.pricing.price === 0 ? "Miễn phí" : `${course.pricing.price?.toLocaleString()}đ`}
                </div>
                {course.originalPrice && course.originalPrice > course.pricing.price && (
                  <div className="text-sm text-gray-500 line-through">
                    {course.originalPrice.toLocaleString()}đ
                  </div>
                )}
              </div>

              {enrollment ? (
                <div className="space-y-4">
                  <div className="text-center text-green-600 font-medium">
                    ✓ Đã đăng ký
                  </div>
                  {course.modules && course.modules.length > 0 && (
                    <button
                      onClick={() => {
                        // Flatten all lessons and go to the first one
                        const allLessons = course.modules.flatMap(m => m.lessons || []);
                        const firstLesson = allLessons[0];
                        const lessonId = firstLesson && (typeof firstLesson._id === "string" ? firstLesson._id : firstLesson._id?.$oid);
                        if (lessonId) {
                          handleStartLessson(lessonId);
                        } else {
                          toast.error("Không tìm thấy bài học đầu tiên!");
                          console.error("No valid lessonId for first lesson", firstLesson);
                        }
                      }}
                      className="w-full btn-primary"
                    >
                      <PlayIcon className="w-4 h-4 mr-2" />
                      Học Ngay!
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {enrolling ? (
                    <div className="spinner w-4 h-4 mr-2" />
                  ) : (
                    <AcademicCapIcon className="w-4 h-4 mr-2" />
                  )}
                  {enrolling ? "Đang đăng ký..." : "Đăng ký ngay"}
                </button>
              )}

              <div className="mt-6 text-center text-sm text-gray-600">
                <p>• Truy cập trọn đời</p>
                <p>• Chứng chỉ hoàn thành</p>
                <p>• Hỗ trợ 24/7</p>
              </div>
            </div>

            {/* Course Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Thông tin khóa học
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Thời lượng:</span>
                  <span className="font-medium">{formatDuration(course.duration)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số bài học:</span>
                  <span className="font-medium">{course.modules?.lessons?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cấp độ:</span>
                  <span className="font-medium">{getLevelText(course.level)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngôn ngữ:</span>
                  <span className="font-medium">Tiếng Việt</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Học viên:</span>
                  <span className="font-medium">{course.enrollmentCount || 0}</span>
                </div>
              </div>
            </div>

            {/* Instructor */}
            {course.instructor && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Giảng viên
                </h3>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                    <UserGroupIcon className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {course.instructor.firstName} {course.instructor.lastName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {course.instructor.title || "Chuyên gia"}
                    </div>
                  </div>
                </div>
                {course.instructor.bio && (
                  <p className="text-sm text-gray-600 mt-3">
                    {course.instructor.bio}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseDetail;
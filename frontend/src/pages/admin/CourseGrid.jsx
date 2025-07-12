import React from "react";
import { Link } from "react-router-dom";
import { EyeIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

const CourseGrid = ({ 
  courses, 
  loading, 
  pagination,
  onPageChange,
  onDeleteCourse,
  getCategoryLabel, 
  getLevelLabel 
}) => {
  if (loading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Danh sách khóa học</h2>
        <span className="text-sm text-gray-500">
          Tổng cộng: {pagination?.totalResults || 0} khóa học
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course._id} className="course-card">
            <div className="aspect-video bg-gray-200 rounded-t-lg flex items-center justify-center">
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover rounded-t-lg"
                />
              ) : (
                <div className="text-gray-500">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`course-level level-${course.level}`}>
                  {getLevelLabel(course.level)}
                </span>
                <span className="text-sm text-gray-500">
                  {course.duration} phút
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                {course.title}
              </h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {course.description}
              </p>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">
                  {course.enrollment?.currentEnrollment || 0} học viên
                </span>
                <div className="flex items-center">
                  <span className="text-yellow-500">★</span>
                  <span className="text-sm ml-1">
                    {course.ratings?.average?.toFixed(1) || "0.0"}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {getCategoryLabel(course.category)}
                </span>
                <div className="flex space-x-2">
                  <Link
                    to={`/courses/${course._id}`}
                    className="text-blue-600 hover:text-blue-900 p-1"
                    title="Xem chi tiết"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </Link>
                  <Link
                    to={`/admin/courses/edit/${course._id}`}
                    className="text-green-600 hover:text-green-900 p-1"
                    title="Chỉnh sửa"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </Link>
                  <button 
                    className="text-red-600 hover:text-red-900 p-1"
                    title="Xóa"
                    onClick={() => onDeleteCourse(course._id)}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {courses.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Không có khóa học nào</p>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.total > 1 && (
        <div className="mt-6 flex justify-center">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(pagination.current - 1)}
              disabled={pagination.current === 1}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            
            {Array.from({ length: Math.min(5, pagination.total) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`px-3 py-2 text-sm border rounded-lg ${
                    page === pagination.current
                      ? "bg-green-500 text-white border-green-500"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              );
            })}
            
            <button
              onClick={() => onPageChange(pagination.current + 1)}
              disabled={pagination.current === pagination.total}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default React.memo(CourseGrid); 
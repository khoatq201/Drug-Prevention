import React from "react";
import { Link } from "react-router-dom";
import { PencilIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/outline";
import Pagination from "../../components/common/Pagination";

const AssessmentTable = ({
  assessments,
  loading,
  pagination,
  onPageChange,
  onEdit,
  onToggleActive,
  onDelete,
  getTypeLabel,
  getAgeGroupLabel,
  role = 'admin',
}) => {
  const basePath = role === 'manager' ? '/manager/assessments' : '/admin/assessments';

  if (loading) {
    return (
      <div className="card">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  if (assessments.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <p className="text-gray-500">Không có đánh giá nào</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên đánh giá
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Loại
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nhóm tuổi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Số câu hỏi
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
            {assessments.map((assessment) => (
              <tr key={assessment._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {assessment.name}
                    </div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {assessment.description}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {getTypeLabel(assessment.type)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-wrap gap-1">
                    {assessment.targetAgeGroup.map((group, index) => (
                      <span
                        key={index}
                        className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800"
                      >
                        {getAgeGroupLabel(group)}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {assessment.questions?.length || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => onToggleActive(assessment._id, !assessment.isActive)}
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer ${
                      assessment.isActive
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-red-100 text-red-800 hover:bg-red-200"
                    }`}
                  >
                    {assessment.isActive ? "Hoạt động" : "Vô hiệu"}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(assessment.createdAt).toLocaleDateString("vi-VN")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <Link
                      to={`${basePath}/${assessment._id}`}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                      title="Xem chi tiết"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => onEdit(assessment)}
                      className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                      title="Chỉnh sửa"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(assessment._id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                      title="Xóa"
                    >
                      <TrashIcon className="w-4 h-4" />
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
        <div className="px-6 py-4 border-t border-gray-200">
          <Pagination
            currentPage={pagination.current}
            totalPages={pagination.total}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default AssessmentTable; 
import React from "react";
import { Link } from "react-router-dom";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h1 className="mt-2 text-4xl font-bold text-gray-900">404</h1>
        <p className="mt-2 text-lg text-gray-600">Trang không tìm thấy</p>
        <p className="mt-2 text-sm text-gray-500">
          Xin lỗi, chúng tôi không thể tìm thấy trang bạn đang tìm kiếm.
        </p>
        <div className="mt-6">
          <Link to="/" className="btn-primary">
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

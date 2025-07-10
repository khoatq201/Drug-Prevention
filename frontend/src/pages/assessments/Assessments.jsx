import React from "react";
import { ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline";

const Assessments = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <ClipboardDocumentCheckIcon className="mx-auto h-12 w-12 text-green-600" />
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Đánh giá rủi ro
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Các bài đánh giá ASSIST, CRAFFT sẽ được triển khai sớm
          </p>
        </div>
      </div>
    </div>
  );
};

export default Assessments;

import React from "react";
import { useParams } from "react-router-dom";

const CourseDetail = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Chi tiết khóa học {id}
        </h1>
      </div>
    </div>
  );
};

export default CourseDetail;

import React from "react";
import { AcademicCapIcon } from "@heroicons/react/24/outline";

const Courses = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <AcademicCapIcon className="mx-auto h-12 w-12 text-primary-600" />
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Khóa học đào tạo
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Các khóa học về phòng chống ma túy sẽ được triển khai sớm
          </p>
        </div>
      </div>
    </div>
  );
};

export default Courses;

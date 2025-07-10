import React from "react";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";

const Appointments = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <CalendarDaysIcon className="mx-auto h-12 w-12 text-purple-600" />
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Đặt lịch hẹn
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Đặt lịch hẹn với chuyên viên tư vấn
          </p>
        </div>
      </div>
    </div>
  );
};

export default Appointments;

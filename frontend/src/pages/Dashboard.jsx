import React from "react";
import { ChartBarIcon } from "@heroicons/react/24/outline";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <ChartBarIcon className="mx-auto h-12 w-12 text-blue-600" />
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Bảng điều khiển
          </h1>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

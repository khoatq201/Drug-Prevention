import { Link, useLocation } from "react-router-dom";
import {
  CalendarDaysIcon,
  UserIcon,
  ChartBarIcon,
  ClockIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

const ConsultantSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/consultant",
      icon: ChartBarIcon,
    },
    {
      name: "Lịch hẹn của tôi",
      path: "/consultant/appointments",
      icon: CalendarDaysIcon,
    },
    {
      name: "Lịch làm việc",
      path: "/consultant/schedule",
      icon: ClockIcon,
    },
    {
      name: "Khách hàng",
      path: "/consultant/clients",
      icon: UsersIcon,
    },
    {
      name: "Hồ sơ chuyên viên",
      path: "/consultant/profile",
      icon: UserIcon,
    },
  ];

  const isActive = (path) => {
    if (path === "/consultant") {
      return location.pathname === "/consultant";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } w-64`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-lg font-bold text-gray-900">Chuyên viên</span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-md hover:bg-gray-100"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                    isActive(item.path)
                      ? "bg-green-100 text-green-700 border-r-2 border-green-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              <p>Phiên bản 1.0.0</p>
              <p>© 2024 Drug Prevention</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConsultantSidebar;
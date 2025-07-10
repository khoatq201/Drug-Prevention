import React from "react";
import { Link } from "react-router-dom";
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Trang chủ", href: "/" },
    { name: "Khóa học", href: "/courses" },
    { name: "Đánh giá rủi ro", href: "/assessments" },
    { name: "Blog", href: "/blog" },
    { name: "Đặt lịch hẹn", href: "/appointments" },
  ];

  const supportLinks = [
    { name: "Liên hệ", href: "/contact" },
    { name: "Hướng dẫn sử dụng", href: "/help" },
    { name: "Câu hỏi thường gặp", href: "/faq" },
    { name: "Chính sách bảo mật", href: "/privacy" },
    { name: "Điều khoản sử dụng", href: "/terms" },
  ];

  const emergencyHotlines = [
    { name: "Đường dây nóng phòng chống tệ nạn xã hội", phone: "1800-1567" },
    { name: "Trung tâm Chống độc 115", phone: "115" },
    { name: "Cơ quan công an", phone: "113" },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Organization Info */}
          <div className="col-span-1 lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PC</span>
              </div>
              <span className="text-xl font-bold">Phòng chống Ma túy</span>
            </div>
            <p className="text-gray-300 mb-4">
              Tổ chức tình nguyện hỗ trợ phòng ngừa sử dụng ma túy trong cộng
              đồng, cung cấp giáo dục, đánh giá rủi ro và tư vấn chuyên nghiệp.
            </p>

            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-300">
                <PhoneIcon className="w-4 h-4 mr-2" />
                <span>+84-123-456-789</span>
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <EnvelopeIcon className="w-4 h-4 mr-2" />
                <span>contact@drugprevention.org</span>
              </div>
              <div className="flex items-start text-sm text-gray-300">
                <MapPinIcon className="w-4 h-4 mr-2 mt-0.5" />
                <span>123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Hỗ trợ</h3>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Emergency Hotlines */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-red-400">
              Đường dây khẩn cấp
            </h3>
            <div className="space-y-3">
              {emergencyHotlines.map((hotline, index) => (
                <div key={index} className="text-sm">
                  <div className="text-gray-300 mb-1">{hotline.name}</div>
                  <a
                    href={`tel:${hotline.phone}`}
                    className="text-red-400 font-semibold hover:text-red-300 transition-colors duration-200"
                  >
                    {hotline.phone}
                  </a>
                </div>
              ))}
            </div>

            <div className="mt-6 p-3 bg-red-900/20 border border-red-700/30 rounded-lg">
              <p className="text-red-300 text-xs">
                <strong>Lưu ý:</strong> Nếu bạn hoặc người thân đang trong tình
                trạng khẩn cấp do sử dụng chất kích thích, hãy gọi ngay số điện
                thoại khẩn cấp.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-300 text-sm mb-4 md:mb-0">
              © {currentYear} Tổ chức Phòng chống Ma túy Cộng đồng. Tất cả
              quyền được bảo lưu.
            </div>

            {/* Social Links - Placeholder */}
            <div className="flex space-x-4">
              <span className="text-gray-300 text-sm">Theo dõi chúng tôi:</span>
              <div className="flex space-x-2">
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                  aria-label="Facebook"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                  aria-label="YouTube"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

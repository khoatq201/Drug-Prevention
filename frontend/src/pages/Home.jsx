import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import {
  AcademicCapIcon,
  ClipboardDocumentCheckIcon,
  CalendarDaysIcon,
  UsersIcon,
  ShieldCheckIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  // Debug auth state
  console.log(
    "🏠 Home component render - isAuthenticated:",
    isAuthenticated,
    "user:",
    user
  );

  // Show welcome toast when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Check if we just came from login (to avoid showing toast on every page reload)
      const justLoggedIn = sessionStorage.getItem("justLoggedIn");
      if (justLoggedIn) {
        toast.success(`Chào mừng trở lại, ${user.firstName}! 🎉`, {
          duration: 4000,
          position: "top-center",
          style: {
            background: "#10B981",
            color: "white",
            padding: "16px 24px",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "500",
          },
          icon: "👋",
        });
        // Remove the flag after showing toast
        sessionStorage.removeItem("justLoggedIn");
      }
    }
  }, [isAuthenticated, user]);

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const slideInLeft = {
    hidden: { opacity: 0, x: -60 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8 } },
  };

  const slideInRight = {
    hidden: { opacity: 0, x: 60 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8 } },
  };

  const features = [
    {
      icon: AcademicCapIcon,
      title: "Khóa học đào tạo",
      description:
        "Các khóa học online về nhận thức ma túy, kỹ năng phòng tránh và từ chối, phân theo độ tuổi phù hợp.",
      link: "/courses",
      color: "bg-green-500",
    },
    {
      icon: ClipboardDocumentCheckIcon,
      title: "Đánh giá rủi ro",
      description:
        "Thực hiện các bài khảo sát ASSIST, CRAFFT để xác định mức độ nguy cơ và nhận khuyến nghị phù hợp.",
      link: "/assessments",
      color: "bg-emerald-500",
    },
    {
      icon: CalendarDaysIcon,
      title: "Đặt lịch tư vấn",
      description:
        "Đặt lịch hẹn trực tuyến với chuyên viên tư vấn để được hỗ trợ chuyên nghiệp.",
      link: "/appointments",
      color: "bg-teal-500",
    },
    {
      icon: UsersIcon,
      title: "Chương trình cộng đồng",
      description:
        "Tham gia các chương trình truyền thông và giáo dục cộng đồng về phòng chống ma túy.",
      link: "/programs",
      color: "bg-lime-500",
    },
  ];

  const stats = [
    { label: "Học viên đã tham gia", value: "2,500+" },
    { label: "Khóa học có sẵn", value: "45+" },
    { label: "Chuyên viên tư vấn", value: "20+" },
    { label: "Đánh giá rủi ro hoàn thành", value: "1,200+" },
  ];

  const testimonials = [
    {
      name: "Nguyễn Thị Mai",
      role: "Phụ huynh",
      content:
        "Chương trình đã giúp tôi hiểu rõ hơn về cách giáo dục con em về tác hại của ma túy và cách phòng tránh hiệu quả.",
      avatar: "/api/placeholder/50/50",
    },
    {
      name: "Trần Văn Nam",
      role: "Giáo viên",
      content:
        "Các khóa học rất hữu ích cho công việc giảng dạy của tôi. Nội dung được thiết kế khoa học và dễ hiểu.",
      avatar: "/api/placeholder/50/50",
    },
    {
      name: "Lê Thị Hoa",
      role: "Sinh viên",
      content:
        "Bài đánh giá rủi ro giúp tôi nhận thức được những nguy cơ tiềm ẩn và biết cách bảo vệ bản thân.",
      avatar: "/api/placeholder/50/50",
    },
  ];

  return (
    <motion.div className="min-h-screen" initial="hidden" animate="visible">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 via-green-700 to-green-800 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div className="text-center" variants={fadeInUp}>
            <motion.h1
              className="text-4xl md:text-6xl font-bold mb-6"
              variants={slideInLeft}
            >
              Cùng nhau phòng chống
              <motion.span
                className="block text-green-200"
                variants={slideInRight}
              >
                Ma túy trong cộng đồng
              </motion.span>
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto"
              variants={fadeInUp}
            >
              Nền tảng giáo dục và hỗ trợ toàn diện giúp nâng cao nhận thức,
              đánh giá rủi ro và cung cấp tư vấn chuyên nghiệp về phòng chống ma
              túy.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp}>
                <Link
                  to="/courses"
                  className="bg-white text-green-600 px-8 py-3.5 rounded-lg font-semibold hover:bg-gray-100 transition duration-200 inline-block"
                >
                  Khám phá khóa học
                </Link>
              </motion.div>
              <motion.div variants={fadeInUp}>
                <Link
                  to="/assessments"
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition duration-200 inline-block"
                >
                  Đánh giá rủi ro
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <motion.section
        className="py-20 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" variants={fadeInUp}>
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
              variants={slideInLeft}
            >
              Dịch vụ của chúng tôi
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              variants={slideInRight}
            >
              Chúng tôi cung cấp các giải pháp toàn diện để hỗ trợ cộng đồng
              trong việc phòng ngừa và chống lại tệ nạn ma túy.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="card group hover:shadow-lg transition duration-200 flex flex-col"
                variants={fadeInUp}
                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition duration-200`}
                  whileHover={{ rotate: 360, transition: { duration: 0.5 } }}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-4 flex-1 ">
                  {feature.description}
                </p>
                <Link
                  to={feature.link}
                  className="text-green-600 font-medium hover:text-green-700 transition duration-200 mt-auto"
                >
                  Tìm hiểu thêm →
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        className="py-16 bg-gray-50"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            variants={staggerContainer}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                variants={fadeInUp}
                whileHover={{ scale: 1.1, transition: { duration: 0.2 } }}
              >
                <motion.div
                  className="text-3xl md:text-4xl font-bold text-green-600 mb-2"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* About Section */}
      <motion.section
        className="py-20 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={slideInLeft}>
              <motion.h2
                className="text-3xl md:text-4xl font-bold text-gray-900 mb-6"
                variants={fadeInUp}
              >
                Về tổ chức của chúng tôi
              </motion.h2>
              <motion.p
                className="text-lg text-gray-600 mb-6"
                variants={fadeInUp}
              >
                Chúng tôi là một tổ chức tình nguyện phi lợi nhuận, hoạt động
                với sứ mệnh phòng ngừa và giảm thiểu tác hại của ma túy trong
                cộng đồng thông qua giáo dục, đánh giá và tư vấn chuyên nghiệp.
              </motion.p>
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
                variants={staggerContainer}
              >
                <motion.div className="flex items-center" variants={fadeInUp}>
                  <ShieldCheckIcon className="w-6 h-6 text-green-600 mr-3" />
                  <span className="text-gray-700">Chuyên nghiệp</span>
                </motion.div>
                <motion.div className="flex items-center" variants={fadeInUp}>
                  <HeartIcon className="w-6 h-6 text-green-600 mr-3" />
                  <span className="text-gray-700">Tận tâm</span>
                </motion.div>
                <motion.div className="flex items-center" variants={fadeInUp}>
                  <UsersIcon className="w-6 h-6 text-green-600 mr-3" />
                  <span className="text-gray-700">Cộng đồng</span>
                </motion.div>
                <motion.div className="flex items-center" variants={fadeInUp}>
                  <AcademicCapIcon className="w-6 h-6 text-green-600 mr-3" />
                  <span className="text-gray-700">Giáo dục</span>
                </motion.div>
              </motion.div>
              <motion.div variants={fadeInUp}>
                <Link to="/about" className="btn-primary inline-block">
                  Tìm hiểu thêm
                </Link>
              </motion.div>
            </motion.div>
            <motion.div className="relative" variants={slideInRight}>
              <motion.div
                className="aspect-w-4 aspect-h-3 rounded-lg overflow-hidden bg-gray-200 relative transform scale-80"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src="/images/ChatGPT Image 15_49_02 8 thg 7, 2025.png"
                  alt="Tổ chức phòng chống ma túy"
                  className="object-cover w-full h-full"
                />
                {/* Gradient overlay để làm mờ viền */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-white/20"></div>
              </motion.div>
              <motion.div
                className="absolute -bottom-6 -right-6 bg-green-600 text-white p-6 rounded-lg shadow-lg"
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <div className="text-2xl font-bold">5+</div>
                <div className="text-sm">Năm hoạt động</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section
        className="py-20 bg-gray-50"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" variants={fadeInUp}>
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
              variants={slideInLeft}
            >
              Phản hồi từ cộng đồng
            </motion.h2>
            <motion.p className="text-xl text-gray-600" variants={slideInRight}>
              Những chia sẻ từ những người đã tham gia chương trình của chúng
              tôi
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="card"
                variants={fadeInUp}
                whileHover={{
                  scale: 1.05,
                  boxShadow:
                    "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)",
                  transition: { duration: 0.2 },
                }}
              >
                <motion.div
                  className="flex items-center mb-4"
                  initial={{ x: -20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <motion.div
                    className="w-12 h-12 bg-gray-300 rounded-full mr-4"
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Placeholder avatar */}
                  </motion.div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {testimonial.role}
                    </div>
                  </div>
                </motion.div>
                <motion.p
                  className="text-gray-600 italic"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  viewport={{ once: true }}
                >
                  "{testimonial.content}"
                </motion.p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="py-16 bg-green-600"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-white mb-4"
            variants={fadeInUp}
          >
            Bắt đầu hành trình của bạn ngay hôm nay
          </motion.h2>
          <motion.p
            className="text-xl text-green-100 mb-8 max-w-2xl mx-auto"
            variants={fadeInUp}
          >
            Tham gia cộng đồng của chúng tôi để được hỗ trợ và bảo vệ bản thân
            khỏi tác hại của ma túy.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={staggerContainer}
          >
            {isAuthenticated ? (
              // Show for logged in users
              <>
                <motion.div variants={fadeInUp}>
                  <Link
                    to="/dashboard"
                    className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-200 inline-block"
                  >
                    Đi tới Dashboard
                  </Link>
                </motion.div>
                <motion.div variants={fadeInUp}>
                  <Link
                    to="/courses"
                    className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition duration-200 inline-block"
                  >
                    Khám phá khóa học
                  </Link>
                </motion.div>
              </>
            ) : (
              // Show for guest users
              <>
                <motion.div variants={fadeInUp}>
                  <Link
                    to="/register"
                    className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-200 inline-block"
                  >
                    Đăng ký ngay
                  </Link>
                </motion.div>
                <motion.div variants={fadeInUp}>
                  <Link
                    to="/contact"
                    className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition duration-200 inline-block"
                  >
                    Liên hệ với chúng tôi
                  </Link>
                </motion.div>
              </>
            )}
          </motion.div>
        </div>
      </motion.section>
    </motion.div>
  );
};

export default Home;

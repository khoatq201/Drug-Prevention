import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import {
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlayIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

const Assessments = () => {
  const { user, isAuthenticated, api } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [userAssessments, setUserAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Available assessment types
  const assessmentTypes = [
    {
      id: "assist",
      name: "ASSIST",
      fullName: "Alcohol, Smoking and Substance Involvement Screening Test",
      description: "Công cụ sàng lọc toàn diện đánh giá mức độ rủi ro sử dụng các chất gây nghiện.",
      targetAudience: ["university_student", "parent", "teacher", "other"],
      duration: "10-15 phút",
      questions: 8,
      color: "bg-blue-500",
      icon: ChartBarIcon,
    },
    {
      id: "crafft",
      name: "CRAFFT",
      fullName: "Car, Relax, Alone, Forget, Friends, Trouble",
      description: "Công cụ sàng lọc dành cho thanh thiếu niên từ 12-21 tuổi về rủi ro sử dụng chất gây nghiện.",
      targetAudience: ["student", "university_student"],
      duration: "5-10 phút",
      questions: 6,
      color: "bg-green-500",
      icon: ClipboardDocumentCheckIcon,
    },
    {
      id: "audit",
      name: "AUDIT",
      fullName: "Alcohol Use Disorders Identification Test",
      description: "Đánh giá rối loạn sử dụng rượu bia và xác định mức độ can thiệp cần thiết.",
      targetAudience: ["university_student", "parent", "teacher", "other"],
      duration: "8-12 phút",
      questions: 10,
      color: "bg-yellow-500",
      icon: ExclamationTriangleIcon,
    },
    {
      id: "dast",
      name: "DAST-10",
      fullName: "Drug Abuse Screening Test",
      description: "Sàng lọc nhanh về mức độ nghiêm trọng của vấn đề liên quan đến ma túy.",
      targetAudience: ["university_student", "parent", "teacher", "other"],
      duration: "5-8 phút",
      questions: 10,
      color: "bg-red-500",
      icon: CheckCircleIcon,
    },
  ];

  useEffect(() => {
    fetchAssessments();
    if (isAuthenticated) {
      fetchUserAssessments();
    }
  }, [isAuthenticated]);

  const fetchAssessments = async () => {
    try {
      console.log("Fetching assessments from API...");
      const response = await api.get("/assessments");
      console.log("Assessments response:", response.data);
      setAssessments(response.data.data || []);
    } catch (error) {
      console.error("Error fetching assessments:", error);
      setAssessments(assessmentTypes); // Fallback to hardcoded data
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAssessments = async () => {
    try {
      console.log("Fetching user assessments...");
      const response = await api.get("/assessments/my-assessments");
      console.log("User assessments response:", response.data);
      setUserAssessments(response.data.data || []);
    } catch (error) {
      console.error("Error fetching user assessments:", error);
      // It's ok if this fails - user just won't see their history
    }
  };

  const getAvailableAssessments = () => {
    if (!user) return assessments;
    
    return assessments.filter(assessment =>
      !assessment.targetAgeGroup || assessment.targetAgeGroup.length === 0 || assessment.targetAgeGroup.includes(user.ageGroup)
    );
  };

  const getUserAssessmentResult = (assessmentId) => {
    return userAssessments.find(result => 
      result.assessmentId._id === assessmentId || result.assessmentId === assessmentId
    );
  };

  const getRiskLevelStyle = (riskLevel) => {
    switch (riskLevel) {
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      case "moderate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRiskLevelText = (riskLevel) => {
    switch (riskLevel) {
      case "low":
        return "Rủi ro thấp";
      case "moderate":
        return "Rủi ro trung bình";
      case "high":
        return "Rủi ro cao";
      default:
        return "Chưa xác định";
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gray-50 py-12"
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div className="text-center mb-12" variants={fadeInUp}>
          <ClipboardDocumentCheckIcon className="mx-auto h-16 w-16 text-green-600 mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Đánh giá rủi ro sử dụng chất gây nghiện
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Thực hiện các bài đánh giá khoa học để xác định mức độ rủi ro và nhận được
            những khuyến nghị phù hợp cho việc phòng ngừa và can thiệp.
          </p>
        </motion.div>

        {/* Assessment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {getAvailableAssessments().map((assessment, index) => {
            const userResult = getUserAssessmentResult(assessment._id);
            const assessmentMeta = assessmentTypes.find(t => t.id === assessment.type.toLowerCase()) || {};
            const IconComponent = assessmentMeta.icon || ClipboardDocumentCheckIcon;

            return (
              <motion.div
                key={assessment._id}
                className="assessment-card"
                variants={fadeInUp}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 ${assessmentMeta.color || 'bg-blue-500'} rounded-lg flex items-center justify-center`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  {userResult && (
                    <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getRiskLevelStyle(userResult.riskLevel)}`}>
                      {getRiskLevelText(userResult.riskLevel)}
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {assessment.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3 font-medium">
                  {assessmentMeta.fullName || assessment.fullName || assessment.name}
                </p>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {assessment.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                  <span>{assessment.questions?.length || 0} câu hỏi</span>
                  <span>{assessment.estimatedTime || assessmentMeta.duration || '10-15'} phút</span>
                </div>

                <div className="flex gap-3">
                  {userResult ? (
                    <>
                      <Link
                        to={`/assessments/${assessment._id}/result/${userResult._id}`}
                        className="flex-1 btn-outline text-center"
                      >
                        <EyeIcon className="w-4 h-4 mr-2" />
                        Xem kết quả
                      </Link>
                      <Link
                        to={`/assessments/${assessment._id}`}
                        className="flex-1 btn-primary text-center"
                      >
                        <PlayIcon className="w-4 h-4 mr-2" />
                        Làm lại
                      </Link>
                    </>
                  ) : (
                    <Link
                      to={`/assessments/${assessment._id}`}
                      className="w-full btn-primary text-center"
                    >
                      <PlayIcon className="w-4 h-4 mr-2" />
                      Bắt đầu đánh giá
                    </Link>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Information Section */}
        <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-8" variants={fadeInUp}>
          <div className="card">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <ClipboardDocumentCheckIcon className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Khoa học và chính xác
            </h3>
            <p className="text-gray-600">
              Các công cụ đánh giá được sử dụng rộng rãi trong y học và được validate
              bởi các nghiên cứu khoa học.
            </p>
          </div>

          <div className="card">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Bảo mật tuyệt đối
            </h3>
            <p className="text-gray-600">
              Thông tin của bạn được bảo mật hoàn toàn. Kết quả chỉ được chia sẻ
              với sự đồng ý của bạn.
            </p>
          </div>

          <div className="card">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <ExclamationTriangleIcon className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Khuyến nghị cá nhân hóa
            </h3>
            <p className="text-gray-600">
              Nhận được những lời khuyên và hướng dẫn phù hợp với kết quả đánh giá
              của bạn.
            </p>
          </div>
        </motion.div>

        {/* Call to Action */}
        {!isAuthenticated && (
          <motion.div 
            className="text-center mt-12 bg-white rounded-lg p-8 shadow-md"
            variants={fadeInUp}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Đăng nhập để lưu kết quả đánh giá
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Tạo tài khoản để theo dõi lịch sử đánh giá, nhận khuyến nghị cá nhân hóa
              và kết nối với chuyên viên tư vấn.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary">
                Đăng ký miễn phí
              </Link>
              <Link to="/login" className="btn-outline">
                Đăng nhập
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Assessments;

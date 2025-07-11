import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import {
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const AssessmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, api } = useAuth();
  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  // Assessment metadata
  const assessmentMeta = {
    assist: {
      name: "ASSIST",
      fullName: "Alcohol, Smoking and Substance Involvement Screening Test",
      description: "Công cụ sàng lọc toàn diện đánh giá mức độ rủi ro sử dụng các chất gây nghiện.",
      icon: ChartBarIcon,
      color: "bg-blue-500",
    },
    crafft: {
      name: "CRAFFT",
      fullName: "Car, Relax, Alone, Forget, Friends, Trouble",
      description: "Công cụ sàng lọc dành cho thanh thiếu niên từ 12-21 tuổi về rủi ro sử dụng chất gây nghiện.",
      icon: ClipboardDocumentCheckIcon,
      color: "bg-green-500",
    },
    audit: {
      name: "AUDIT",
      fullName: "Alcohol Use Disorders Identification Test",
      description: "Đánh giá rối loạn sử dụng rượu bia và xác định mức độ can thiệp cần thiết.",
      icon: ExclamationTriangleIcon,
      color: "bg-yellow-500",
    },
    dast: {
      name: "DAST-10",
      fullName: "Drug Abuse Screening Test",
      description: "Sàng lọc nhanh về mức độ nghiêm trọng của vấn đề liên quan đến ma túy.",
      icon: CheckCircleIcon,
      color: "bg-red-500",
    },
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: `/assessments/${id}` } } });
      return;
    }
    fetchAssessment();
  }, [id, isAuthenticated, navigate]);

  const fetchAssessment = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/assessments/${id}`);
      if (response.data.success) {
        setAssessment(response.data.data);
        setQuestions(response.data.data.questions || []);
      }
    } catch (error) {
      console.error("Error fetching assessment:", error);
      toast.error("Không thể tải bài đánh giá");
      navigate("/assessments");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== questions.length) {
      toast.error("Vui lòng trả lời tất cả các câu hỏi");
      return;
    }

    try {
      setSubmitting(true);
      const formattedAnswers = questions.map(question => {
        const selectedOption = question.options.find(opt => opt.text === answers[question._id]);
        return {
          questionId: question._id,
          answer: answers[question._id],
          score: selectedOption?.value || 0
        };
      });

      const response = await api.post(`/assessments/${id}/submit`, {
        answers: formattedAnswers
      });

      if (response.data.success) {
        toast.success("Đã hoàn thành bài đánh giá!");
        navigate(`/assessments/${id}/result/${response.data.data._id}`);
      }
    } catch (error) {
      console.error("Error submitting assessment:", error);
      console.error("Error response:", error.response?.data);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi nộp bài");
    } finally {
      setSubmitting(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const meta = assessmentMeta[id] || {};
  const IconComponent = meta.icon || ClipboardDocumentCheckIcon;

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (showIntro) {
    return (
      <motion.div 
        className="min-h-screen bg-gray-50 py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Header */}
            <div className={`${meta.color} px-6 py-8 text-white`}>
              <div className="flex items-center">
                <IconComponent className="h-12 w-12 mr-4" />
                <div>
                  <h1 className="text-3xl font-bold">{meta.name}</h1>
                  <p className="text-xl opacity-90 mt-1">{meta.fullName}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Giới thiệu về bài đánh giá
                </h2>
                <p className="text-gray-600 text-lg mb-6">
                  {meta.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{questions.length}</div>
                    <div className="text-sm text-gray-600">Câu hỏi</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">10-15</div>
                    <div className="text-sm text-gray-600">Phút</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">100%</div>
                    <div className="text-sm text-gray-600">Bảo mật</div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                  <h3 className="font-semibold text-blue-900 mb-3">Lưu ý quan trọng:</h3>
                  <ul className="text-blue-800 space-y-2 text-sm">
                    <li>• Hãy trả lời một cách trung thực và chính xác nhất</li>
                    <li>• Thông tin của bạn được bảo mật tuyệt đối</li>
                    <li>• Kết quả chỉ mang tính chất tham khảo, không thay thế chẩn đoán y khoa</li>
                    <li>• Bạn có thể tạm dừng và quay lại làm tiếp bất cứ lúc nào</li>
                  </ul>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between">
                <button
                  onClick={() => navigate("/assessments")}
                  className="btn-outline"
                >
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  Quay lại
                </button>
                <button
                  onClick={() => setShowIntro(false)}
                  className="btn-primary"
                >
                  Bắt đầu đánh giá
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gray-50 py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Header */}
        <div className="bg-white rounded-lg shadow-md mb-6 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <IconComponent className={`h-8 w-8 text-white rounded-lg p-1 ${meta.color} mr-3`} />
              <div>
                <h1 className="text-xl font-bold text-gray-900">{meta.name}</h1>
                <p className="text-sm text-gray-600">
                  Câu {currentQuestionIndex + 1} trong {questions.length}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/assessments")}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div 
              className="bg-blue-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <motion.div 
            className="bg-white rounded-lg shadow-md p-8"
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {currentQuestion.question}
            </h2>

            <div className="space-y-3">
              {currentQuestion.options?.map((option, index) => (
                <motion.label
                  key={index}
                  className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    answers[currentQuestion._id] === option.text
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name={currentQuestion._id}
                      value={option.text}
                      checked={answers[currentQuestion._id] === option.text}
                      onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                      className="w-4 h-4 text-blue-600 mr-3"
                    />
                    <span className="text-gray-900">{option.text}</span>
                  </div>
                </motion.label>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Câu trước
              </button>

              {currentQuestionIndex === questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={!answers[currentQuestion._id] || submitting}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <div className="spinner w-4 h-4 mr-2" />
                  ) : (
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                  )}
                  Hoàn thành
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={!answers[currentQuestion._id]}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Câu tiếp theo
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Question Navigator */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Tiến độ:</h3>
          <div className="grid grid-cols-10 gap-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                  index === currentQuestionIndex
                    ? "bg-blue-600 text-white"
                    : answers[questions[index]?._id]
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AssessmentDetail;

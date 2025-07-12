import React, { useState, useEffect } from "react";
import { XMarkIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

const AssessmentForm = ({ assessment, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "CUSTOM",
    description: "",
    targetAgeGroup: [],
    language: "vi",
    isActive: true,
    questions: [],
    scoring: {
      method: "sum",
      maxScore: 0,
      riskLevels: [
        {
          level: "low",
          minScore: 0,
          maxScore: 0,
          description: "Rủi ro thấp",
          color: "#22c55e",
        },
        {
          level: "moderate",
          minScore: 1,
          maxScore: 1,
          description: "Rủi ro trung bình",
          color: "#f59e0b",
        },
        {
          level: "high",
          minScore: 2,
          maxScore: 2,
          description: "Rủi ro cao",
          color: "#ef4444",
        },
      ],
    },
    recommendations: [
      {
        riskLevel: "low",
        actions: ["Tiếp tục duy trì lối sống lành mạnh"],
        resources: [],
        urgency: "low",
      },
      {
        riskLevel: "moderate",
        actions: ["Tìm hiểu thêm về tác hại của chất gây nghiện"],
        resources: [],
        urgency: "medium",
      },
      {
        riskLevel: "high",
        actions: ["Liên hệ chuyên gia tư vấn ngay"],
        resources: [],
        urgency: "high",
      },
    ],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (assessment) {
      setFormData({
        name: assessment.name || "",
        type: assessment.type || "CUSTOM",
        description: assessment.description || "",
        targetAgeGroup: assessment.targetAgeGroup || [],
        language: assessment.language || "vi",
        isActive: assessment.isActive !== undefined ? assessment.isActive : true,
        questions: assessment.questions || [],
        scoring: assessment.scoring || formData.scoring,
        recommendations: assessment.recommendations || formData.recommendations,
      });
    }
  }, [assessment]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tên đánh giá là bắt buộc";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Mô tả là bắt buộc";
    }

    if (formData.targetAgeGroup.length === 0) {
      newErrors.targetAgeGroup = "Chọn ít nhất một nhóm tuổi";
    }

    if (formData.questions.length === 0) {
      newErrors.questions = "Thêm ít nhất một câu hỏi";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleAgeGroupChange = (ageGroup, checked) => {
    setFormData(prev => ({
      ...prev,
      targetAgeGroup: checked
        ? [...prev.targetAgeGroup, ageGroup]
        : prev.targetAgeGroup.filter(group => group !== ageGroup)
    }));
    if (errors.targetAgeGroup) {
      setErrors(prev => ({ ...prev, targetAgeGroup: "" }));
    }
  };

  const addQuestion = () => {
    const newQuestion = {
      question: "",
      type: "multiple_choice",
      options: [
        { text: "Có", value: 1, isOther: false },
        { text: "Không", value: 0, isOther: false },
      ],
      isRequired: true,
      order: formData.questions.length + 1,
      category: "",
      weightage: 1,
    };

    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
  };

  const moveQuestion = (index, direction) => {
    if (direction === 'up' && index > 0) {
      setFormData(prev => ({
        ...prev,
        questions: prev.questions.map((q, i) => {
          if (i === index) return prev.questions[i - 1];
          if (i === index - 1) return prev.questions[i + 1];
          return q;
        }).map((q, i) => ({ ...q, order: i + 1 }))
      }));
    } else if (direction === 'down' && index < formData.questions.length - 1) {
      setFormData(prev => ({
        ...prev,
        questions: prev.questions.map((q, i) => {
          if (i === index) return prev.questions[i + 1];
          if (i === index + 1) return prev.questions[i - 1];
          return q;
        }).map((q, i) => ({ ...q, order: i + 1 }))
      }));
    }
  };

  const updateQuestion = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === index ? { ...q, [field]: value } : q
      ),
    }));
  };

  const removeQuestion = (index) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const addOption = (questionIndex) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === questionIndex
          ? {
              ...q,
              options: [...q.options, { text: "", value: 0, isOther: false }],
            }
          : q
      ),
    }));
  };

  const updateOption = (questionIndex, optionIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === questionIndex
          ? {
              ...q,
              options: q.options.map((opt, j) =>
                j === optionIndex ? { ...opt, [field]: value } : opt
              ),
            }
          : q
      ),
    }));
  };

  const removeOption = (questionIndex, optionIndex) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === questionIndex
          ? {
              ...q,
              options: q.options.filter((_, j) => j !== optionIndex),
            }
          : q
      ),
    }));
  };

  const ageGroupOptions = [
    { value: "student", label: "Học sinh" },
    { value: "university_student", label: "Sinh viên" },
    { value: "parent", label: "Phụ huynh" },
    { value: "teacher", label: "Giáo viên" },
    { value: "other", label: "Khác" },
  ];

  const questionTypes = [
    { value: "multiple_choice", label: "Trắc nghiệm" },
    { value: "yes_no", label: "Có/Không" },
    { value: "scale", label: "Thang điểm" },
    { value: "text", label: "Văn bản" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {assessment ? "Chỉnh sửa đánh giá" : "Thêm đánh giá mới"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên đánh giá *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nhập tên đánh giá"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại đánh giá
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange("type", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="ASSIST">ASSIST</option>
                <option value="CRAFFT">CRAFFT</option>
                <option value="AUDIT">AUDIT</option>
                <option value="DAST">DAST</option>
                <option value="CUSTOM">Tùy chỉnh</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.description ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Mô tả về bài đánh giá"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nhóm tuổi mục tiêu *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {ageGroupOptions.map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.targetAgeGroup.includes(option.value)}
                    onChange={(e) => handleAgeGroupChange(option.value, e.target.checked)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
            {errors.targetAgeGroup && (
              <p className="mt-1 text-sm text-red-600">{errors.targetAgeGroup}</p>
            )}
          </div>

          {/* Questions Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Câu hỏi</h3>
              <button
                type="button"
                onClick={addQuestion}
                className="btn-secondary flex items-center gap-2"
              >
                <PlusIcon className="w-4 h-4" />
                Thêm câu hỏi
              </button>
            </div>

            {formData.questions.map((question, qIndex) => (
              <div key={qIndex} className="border rounded-lg p-4 mb-4">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-md font-medium">Câu hỏi {qIndex + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nội dung câu hỏi
                    </label>
                    <input
                      type="text"
                      value={question.question}
                      onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Nhập nội dung câu hỏi"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loại câu hỏi
                    </label>
                    <select
                      value={question.type}
                      onChange={(e) => updateQuestion(qIndex, "type", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      {questionTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Options for multiple choice and yes_no */}
                {(question.type === "multiple_choice" || question.type === "yes_no") && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Tùy chọn
                      </label>
                      <button
                        type="button"
                        onClick={() => addOption(qIndex)}
                        className="text-sm text-green-600 hover:text-green-800"
                      >
                        + Thêm tùy chọn
                      </button>
                    </div>
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          value={option.text}
                          onChange={(e) => updateOption(qIndex, oIndex, "text", e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Nội dung tùy chọn"
                        />
                        <input
                          type="number"
                          value={option.value}
                          onChange={(e) => updateOption(qIndex, oIndex, "value", parseInt(e.target.value) || 0)}
                          className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Điểm"
                        />
                        <button
                          type="button"
                          onClick={() => removeOption(qIndex, oIndex)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {errors.questions && (
              <p className="mt-1 text-sm text-red-600">{errors.questions}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              {assessment ? "Cập nhật" : "Tạo đánh giá"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssessmentForm; 
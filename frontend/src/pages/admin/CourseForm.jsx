import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import AdminSidebar from "../../components/layout/AdminSidebar";
import AdminHeader from "../../components/layout/AdminHeader";

const CourseForm = () => {
  const { api, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    fullDescription: "",
    category: "",
    targetAgeGroup: [],
    level: "beginner",
    duration: 1,
    thumbnail: "",
    previewVideo: "",
    prerequisites: [],
    objectives: [],
    requirements: [],
    tags: [],
    language: "vi",
    isPublished: false,
    "enrollment.isOpen": true,
    "enrollment.maxStudents": null,
    "pricing.isFree": true,
    "pricing.price": 0,
    "certificate.isAvailable": true,
    "certificate.requirements.completionRate": 100,
    "certificate.requirements.minimumScore": 70,
    "settings.allowDiscussions": true,
    "settings.allowDownloads": true,
    "settings.showProgress": true,
    "settings.certificateAutoIssue": true,
  });

  const [prerequisite, setPrerequisite] = useState("");
  const [objective, setObjective] = useState("");
  const [requirement, setRequirement] = useState("");
  const [tag, setTag] = useState("");

  const categories = [
    { value: "drug_awareness", label: "Nhận thức về ma túy" },
    { value: "prevention_skills", label: "Kỹ năng phòng tránh" },
    { value: "refusal_skills", label: "Kỹ năng từ chối" },
    { value: "life_skills", label: "Kỹ năng sống" },
    { value: "counseling", label: "Tư vấn" },
    { value: "rehabilitation", label: "Phục hồi" },
  ];

  const ageGroups = [
    { value: "student", label: "Học sinh" },
    { value: "university_student", label: "Sinh viên" },
    { value: "parent", label: "Phụ huynh" },
    { value: "teacher", label: "Giáo viên" },
    { value: "other", label: "Khác" },
  ];

  const levels = [
    { value: "beginner", label: "Cơ bản" },
    { value: "intermediate", label: "Trung cấp" },
    { value: "advanced", label: "Nâng cao" },
  ];

  // Load course data if editing
  useEffect(() => {
    if (id && isAuthenticated && !authLoading) {
      fetchCourse();
    }
  }, [id, isAuthenticated, authLoading]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/courses/${id}`);
      if (response.data.success) {
        const course = response.data.data;
        setFormData({
          title: course.title || "",
          description: course.description || "",
          fullDescription: course.fullDescription || "",
          category: course.category || "",
          targetAgeGroup: course.targetAgeGroup || [],
          level: course.level || "beginner",
          duration: course.duration || 1,
          thumbnail: course.thumbnail || "",
          previewVideo: course.previewVideo || "",
          prerequisites: course.prerequisites || [],
          objectives: course.objectives || [],
          requirements: course.requirements || [],
          tags: course.tags || [],
          language: course.language || "vi",
          isPublished: course.isPublished || false,
          "enrollment.isOpen": course.enrollment?.isOpen ?? true,
          "enrollment.maxStudents": course.enrollment?.maxStudents || null,
          "pricing.isFree": course.pricing?.isFree ?? true,
          "pricing.price": course.pricing?.price || 0,
          "certificate.isAvailable": course.certificate?.isAvailable ?? true,
          "certificate.requirements.completionRate": course.certificate?.requirements?.completionRate || 100,
          "certificate.requirements.minimumScore": course.certificate?.requirements?.minimumScore || 70,
          "settings.allowDiscussions": course.settings?.allowDiscussions ?? true,
          "settings.allowDownloads": course.settings?.allowDownloads ?? true,
          "settings.showProgress": course.settings?.showProgress ?? true,
          "settings.certificateAutoIssue": course.settings?.certificateAutoIssue ?? true,
        });
      }
    } catch (err) {
      setError("Lỗi khi tải thông tin khóa học");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleNestedChange = (path, value) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleArrayChange = (field, value, action = "add") => {
    setFormData(prev => ({
      ...prev,
      [field]: action === "add" 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  const handleAgeGroupChange = (ageGroup) => {
    setFormData(prev => ({
      ...prev,
      targetAgeGroup: prev.targetAgeGroup.includes(ageGroup)
        ? prev.targetAgeGroup.filter(ag => ag !== ageGroup)
        : [...prev.targetAgeGroup, ageGroup]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const courseData = {
        ...formData,
        enrollment: {
          isOpen: formData["enrollment.isOpen"],
          maxStudents: formData["enrollment.maxStudents"],
        },
        pricing: {
          isFree: formData["pricing.isFree"],
          price: formData["pricing.price"],
        },
        certificate: {
          isAvailable: formData["certificate.isAvailable"],
          requirements: {
            completionRate: formData["certificate.requirements.completionRate"],
            minimumScore: formData["certificate.requirements.minimumScore"],
          },
        },
        settings: {
          allowDiscussions: formData["settings.allowDiscussions"],
          allowDownloads: formData["settings.allowDownloads"],
          showProgress: formData["settings.showProgress"],
          certificateAutoIssue: formData["settings.certificateAutoIssue"],
        },
      };

      // Remove nested properties
      delete courseData["enrollment.isOpen"];
      delete courseData["enrollment.maxStudents"];
      delete courseData["pricing.isFree"];
      delete courseData["pricing.price"];
      delete courseData["certificate.isAvailable"];
      delete courseData["certificate.requirements.completionRate"];
      delete courseData["certificate.requirements.minimumScore"];
      delete courseData["settings.allowDiscussions"];
      delete courseData["settings.allowDownloads"];
      delete courseData["settings.showProgress"];
      delete courseData["settings.certificateAutoIssue"];

      if (id) {
        // Update existing course
        await api.put(`/courses/${id}`, courseData);
        setSuccess("Khóa học đã được cập nhật thành công");
      } else {
        // Create new course
        await api.post("/courses", courseData);
        setSuccess("Khóa học đã được tạo thành công");
      }

      setTimeout(() => {
        navigate("/admin/courses");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi lưu khóa học");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Đang tải...</p>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col">
        <AdminHeader onMenuToggle={() => setSidebarOpen(true)} />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {id ? "Chỉnh sửa khóa học" : "Thêm khóa học mới"}
            </h1>
            <p className="text-gray-600">
              {id ? "Cập nhật thông tin khóa học" : "Tạo khóa học mới cho hệ thống"}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Thông tin cơ bản</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiêu đề khóa học *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Danh mục *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cấp độ
                  </label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {levels.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thời lượng (giờ) *
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    min="0.5"
                    step="0.5"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả ngắn *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả đầy đủ
                </label>
                <textarea
                  name="fullDescription"
                  value={formData.fullDescription}
                  onChange={handleInputChange}
                  rows="5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Target Audience */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Đối tượng mục tiêu</h2>
              <div className="space-y-2">
                {ageGroups.map(ageGroup => (
                  <label key={ageGroup.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.targetAgeGroup.includes(ageGroup.value)}
                      onChange={() => handleAgeGroupChange(ageGroup.value)}
                      className="mr-2"
                    />
                    {ageGroup.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Media */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Media</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thumbnail URL
                  </label>
                  <input
                    type="url"
                    name="thumbnail"
                    value={formData.thumbnail}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video preview URL
                  </label>
                  <input
                    type="url"
                    name="previewVideo"
                    value={formData.previewVideo}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Lists */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Thông tin bổ sung</h2>
              
              {/* Prerequisites */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Điều kiện tiên quyết
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={prerequisite}
                    onChange={(e) => setPrerequisite(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Thêm điều kiện tiên quyết"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (prerequisite.trim()) {
                        handleArrayChange("prerequisites", prerequisite.trim());
                        setPrerequisite("");
                      }
                    }}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Thêm
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.prerequisites.map((item, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => handleArrayChange("prerequisites", item, "remove")}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Objectives */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mục tiêu học tập
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Thêm mục tiêu học tập"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (objective.trim()) {
                        handleArrayChange("objectives", objective.trim());
                        setObjective("");
                      }
                    }}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Thêm
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.objectives.map((item, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => handleArrayChange("objectives", item, "remove")}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Thêm tag"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (tag.trim()) {
                        handleArrayChange("tags", tag.trim());
                        setTag("");
                      }
                    }}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Thêm
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((item, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => handleArrayChange("tags", item, "remove")}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Cài đặt</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-3">Đăng ký</h3>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData["enrollment.isOpen"]}
                        onChange={(e) => handleNestedChange("enrollment.isOpen", e.target.checked)}
                        className="mr-2"
                      />
                      Mở đăng ký
                    </label>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số học viên tối đa (để trống = không giới hạn)
                      </label>
                      <input
                        type="number"
                        value={formData["enrollment.maxStudents"] || ""}
                        onChange={(e) => handleNestedChange("enrollment.maxStudents", e.target.value || null)}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Chứng chỉ</h3>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData["certificate.isAvailable"]}
                        onChange={(e) => handleNestedChange("certificate.isAvailable", e.target.checked)}
                        className="mr-2"
                      />
                      Cấp chứng chỉ
                    </label>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tỷ lệ hoàn thành tối thiểu (%)
                      </label>
                      <input
                        type="number"
                        value={formData["certificate.requirements.completionRate"]}
                        onChange={(e) => handleNestedChange("certificate.requirements.completionRate", parseInt(e.target.value))}
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Điểm tối thiểu
                      </label>
                      <input
                        type="number"
                        value={formData["certificate.requirements.minimumScore"]}
                        onChange={(e) => handleNestedChange("certificate.requirements.minimumScore", parseInt(e.target.value))}
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Publish Settings */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Xuất bản</h2>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isPublished"
                    checked={formData.isPublished}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  Xuất bản khóa học
                </label>
                <p className="text-sm text-gray-600">
                  Khóa học sẽ hiển thị cho người dùng khi được xuất bản
                </p>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                {loading ? "Đang lưu..." : (id ? "Cập nhật" : "Tạo khóa học")}
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin/courses")}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Hủy
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default CourseForm; 
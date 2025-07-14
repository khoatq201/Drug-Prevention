import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import ConsultantSidebar from "../../components/layout/ConsultantSidebar";
import ConsultantHeader from "../../components/layout/ConsultantHeader";
import {
  UserIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  LanguageIcon,
  StarIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  DocumentTextIcon,
  PhoneIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import toast from "react-hot-toast";

const ConsultantProfile = () => {
  const { user, api } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [counselorProfile, setCounselorProfile] = useState(null);
  // Helper functions for languages transformation
  const transformLanguagesFromServer = (serverLanguages) => {
    if (!Array.isArray(serverLanguages)) return [];
    return serverLanguages.map(lang => 
      typeof lang === 'string' ? lang : lang.language
    );
  };

  const transformLanguagesToServer = (clientLanguages) => {
    if (!Array.isArray(clientLanguages)) return [];
    return clientLanguages.map(lang => ({
      language: lang,
      proficiency: "intermediate" // Default proficiency
    }));
  };

  const [formData, setFormData] = useState({
    biography: "",
    specializations: [],
    languages: [],
    experience: {
      totalYears: 0,
      workHistory: [],
    },
    education: [],
    certifications: [],
    areasOfExpertise: [],
    contactPreferences: {
      preferredContactMethod: "email",
      businessPhone: "",
      businessEmail: "",
    },
    settings: {
      isPublicProfile: true,
      allowOnlineConsultations: true,
    },
  });

  const specializationOptions = [
    { value: "addiction_counseling", label: "Tư vấn nghiện" },
    { value: "youth_counseling", label: "Tư vấn trẻ em - thanh thiếu niên" },
    { value: "family_therapy", label: "Trị liệu gia đình" },
    { value: "group_therapy", label: "Trị liệu nhóm" },
    { value: "cognitive_behavioral", label: "Liệu pháp nhận thức hành vi" },
    { value: "trauma_therapy", label: "Trị liệu chấn thương" },
    { value: "crisis_intervention", label: "Can thiệp khủng hoảng" },
    { value: "prevention_education", label: "Giáo dục phòng ngừa" },
  ];

  const languageOptions = [
    { value: "vi", label: "Tiếng Việt" },
    { value: "en", label: "English" },
    { value: "zh", label: "中文" },
    { value: "ko", label: "한국어" },
    { value: "ja", label: "日本語" },
  ];

  useEffect(() => {
    fetchCounselorProfile();
  }, []);

  const fetchCounselorProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/counselors/user/${user._id}`);
      if (response.data.success && response.data.data) {
        const profile = response.data.data;
        setCounselorProfile(profile);
        setFormData({
          biography: profile.biography || "",
          specializations: profile.specializations || [],
          languages: transformLanguagesFromServer(profile.languages || []),
          experience: profile.experience || { totalYears: 0, workHistory: [] },
          education: profile.education || [],
          certifications: profile.certifications || [],
          areasOfExpertise: profile.areasOfExpertise || [],
          contactPreferences: profile.contactPreferences || {
            preferredContactMethod: "email",
            businessPhone: "",
            businessEmail: "",
          },
          settings: profile.settings || {
            isPublicProfile: true,
            allowOnlineConsultations: true,
          },
        });
      }
    } catch (error) {
      console.error("Error fetching counselor profile:", error);
      if (error.response?.status === 404) {
        // Profile doesn't exist, create one
        await createCounselorProfile();
      } else {
        toast.error("Không thể tải hồ sơ chuyên viên");
      }
    } finally {
      setLoading(false);
    }
  };

  const createCounselorProfile = async () => {
    try {
      // Transform languages to server format before sending
      const dataToSend = {
        ...formData,
        languages: transformLanguagesToServer(formData.languages)
      };

      const response = await api.post("/counselors", {
        userId: user._id,
        ...dataToSend,
      });
      if (response.data.success) {
        setCounselorProfile(response.data.data);
        toast.success("Hồ sơ chuyên viên đã được tạo");
      }
    } catch (error) {
      console.error("Error creating counselor profile:", error);
      toast.error("Không thể tạo hồ sơ chuyên viên");
    }
  };

  const handleSave = async () => {
    try {
      // Transform languages to server format before sending
      const dataToSend = {
        ...formData,
        languages: transformLanguagesToServer(formData.languages)
      };

      if (counselorProfile) {
        const response = await api.put(`/counselors/${counselorProfile._id}`, dataToSend);
        if (response.data.success) {
          setCounselorProfile(response.data.data);
          setEditing(false);
          toast.success("Hồ sơ đã được cập nhật");
        }
      } else {
        await createCounselorProfile();
        setEditing(false);
      }
    } catch (error) {
      console.error("Error saving counselor profile:", error);
      toast.error("Không thể lưu hồ sơ");
    }
  };

  const handleCancel = () => {
    if (counselorProfile) {
      setFormData({
        biography: counselorProfile.biography || "",
        specializations: counselorProfile.specializations || [],
        languages: transformLanguagesFromServer(counselorProfile.languages || []),
        experience: counselorProfile.experience || { totalYears: 0, workHistory: [] },
        education: counselorProfile.education || [],
        certifications: counselorProfile.certifications || [],
        areasOfExpertise: counselorProfile.areasOfExpertise || [],
        contactPreferences: counselorProfile.contactPreferences || {
          preferredContactMethod: "email",
          businessPhone: "",
          businessEmail: "",
        },
        settings: counselorProfile.settings || {
          isPublicProfile: true,
          allowOnlineConsultations: true,
        },
      });
    }
    setEditing(false);
  };

  const addWorkHistory = () => {
    setFormData(prev => ({
      ...prev,
      experience: {
        ...prev.experience,
        workHistory: [
          ...prev.experience.workHistory,
          {
            position: "",
            organization: "",
            startDate: "",
            endDate: "",
            description: "",
          }
        ]
      }
    }));
  };

  const removeWorkHistory = (index) => {
    setFormData(prev => ({
      ...prev,
      experience: {
        ...prev.experience,
        workHistory: prev.experience.workHistory.filter((_, i) => i !== index)
      }
    }));
  };

  const updateWorkHistory = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      experience: {
        ...prev.experience,
        workHistory: prev.experience.workHistory.map((item, i) => 
          i === index ? { ...item, [field]: value } : item
        )
      }
    }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        {
          degree: "",
          institution: "",
          graduationYear: "",
          major: "",
        }
      ]
    }));
  };

  const removeEducation = (index) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const updateEducation = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <StarIconSolid key={i} className="w-5 h-5 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <StarIcon className="w-5 h-5 text-gray-300" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <StarIconSolid className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
        );
      } else {
        stars.push(<StarIcon key={i} className="w-5 h-5 text-gray-300" />);
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <ConsultantSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col">
          <ConsultantHeader onMenuToggle={() => setSidebarOpen(true)} />
          <main className="flex-1 p-6">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ConsultantSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col">
        <ConsultantHeader onMenuToggle={() => setSidebarOpen(true)} />
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <UserIcon className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </h1>
                  <p className="text-gray-600">Chuyên viên tư vấn</p>
                  {counselorProfile?.performance && (
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center">
                        {renderStars(counselorProfile.performance.averageRating || 0)}
                      </div>
                      <span className="text-sm text-gray-600">
                        ({counselorProfile.performance.totalReviews || 0} đánh giá)
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex space-x-3">
                {editing ? (
                  <>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                    >
                      <XMarkIcon className="w-5 h-5 mr-2" />
                      Hủy
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                    >
                      <CheckIcon className="w-5 h-5 mr-2" />
                      Lưu
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    <PencilIcon className="w-5 h-5 mr-2" />
                    Chỉnh sửa
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Biography */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <DocumentTextIcon className="w-6 h-6 mr-2" />
                  Giới thiệu bản thân
                </h2>
                {editing ? (
                  <textarea
                    value={formData.biography}
                    onChange={(e) => setFormData(prev => ({ ...prev, biography: e.target.value }))}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Giới thiệu về bản thân, kinh nghiệm và phương pháp tư vấn..."
                  />
                ) : (
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {formData.biography || "Chưa có thông tin giới thiệu"}
                  </p>
                )}
              </div>

              {/* Specializations */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <AcademicCapIcon className="w-6 h-6 mr-2" />
                  Chuyên môn
                </h2>
                {editing ? (
                  <div className="space-y-2">
                    {specializationOptions.map((option) => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.specializations.includes(option.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                specializations: [...prev.specializations, option.value]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                specializations: prev.specializations.filter(s => s !== option.value)
                              }));
                            }
                          }}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500 mr-2"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {formData.specializations.map((spec) => {
                      const option = specializationOptions.find(opt => opt.value === spec);
                      return (
                        <span
                          key={spec}
                          className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full"
                        >
                          {option?.label || spec}
                        </span>
                      );
                    })}
                    {formData.specializations.length === 0 && (
                      <p className="text-gray-500">Chưa có thông tin chuyên môn</p>
                    )}
                  </div>
                )}
              </div>

              {/* Experience */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <BriefcaseIcon className="w-6 h-6 mr-2" />
                  Kinh nghiệm làm việc
                </h2>
                
                {editing && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tổng số năm kinh nghiệm
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.experience.totalYears}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        experience: { ...prev.experience, totalYears: parseInt(e.target.value) || 0 }
                      }))}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                )}

                <div className="space-y-4">
                  {!editing && (
                    <p className="text-gray-600 mb-4">
                      <strong>Tổng kinh nghiệm:</strong> {formData.experience.totalYears} năm
                    </p>
                  )}
                  
                  {formData.experience.workHistory.map((work, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      {editing ? (
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Vị trí
                                </label>
                                <input
                                  type="text"
                                  value={work.position}
                                  onChange={(e) => updateWorkHistory(index, "position", e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Tổ chức
                                </label>
                                <input
                                  type="text"
                                  value={work.organization}
                                  onChange={(e) => updateWorkHistory(index, "organization", e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Từ ngày
                                </label>
                                <input
                                  type="date"
                                  value={work.startDate}
                                  onChange={(e) => updateWorkHistory(index, "startDate", e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Đến ngày
                                </label>
                                <input
                                  type="date"
                                  value={work.endDate}
                                  onChange={(e) => updateWorkHistory(index, "endDate", e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                              </div>
                            </div>
                            <button
                              onClick={() => removeWorkHistory(index)}
                              className="ml-4 text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50"
                            >
                              <XMarkIcon className="w-5 h-5" />
                            </button>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Mô tả công việc
                            </label>
                            <textarea
                              value={work.description}
                              onChange={(e) => updateWorkHistory(index, "description", e.target.value)}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h4 className="font-semibold text-gray-900">{work.position}</h4>
                          <p className="text-gray-600">{work.organization}</p>
                          <p className="text-sm text-gray-500">
                            {work.startDate} - {work.endDate || 'Hiện tại'}
                          </p>
                          {work.description && (
                            <p className="text-gray-700 mt-2">{work.description}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {editing && (
                    <button
                      onClick={addWorkHistory}
                      className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors"
                    >
                      + Thêm kinh nghiệm làm việc
                    </button>
                  )}

                  {!editing && formData.experience.workHistory.length === 0 && (
                    <p className="text-gray-500">Chưa có thông tin kinh nghiệm làm việc</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin liên hệ</h2>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <EnvelopeIcon className="w-5 h-5 mr-2" />
                    <span>{user?.email}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <PhoneIcon className="w-5 h-5 mr-2" />
                    <span>{user?.phone || 'Chưa cập nhật'}</span>
                  </div>
                </div>
              </div>

              {/* Languages */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <LanguageIcon className="w-6 h-6 mr-2" />
                  Ngôn ngữ
                </h2>
                {editing ? (
                  <div className="space-y-2">
                    {languageOptions.map((option) => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.languages.includes(option.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                languages: [...prev.languages, option.value]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                languages: prev.languages.filter(l => l !== option.value)
                              }));
                            }
                          }}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500 mr-2"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {formData.languages.map((lang) => {
                      const option = languageOptions.find(opt => opt.value === lang);
                      return (
                        <div key={lang} className="text-gray-700">
                          {option?.label || lang}
                        </div>
                      );
                    })}
                    {formData.languages.length === 0 && (
                      <p className="text-gray-500">Chưa có thông tin ngôn ngữ</p>
                    )}
                  </div>
                )}
              </div>

              {/* Settings */}
              {editing && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Cài đặt</h2>
                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.settings.isPublicProfile}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          settings: { ...prev.settings, isPublicProfile: e.target.checked }
                        }))}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500 mr-2"
                      />
                      <span className="text-sm text-gray-700">Cho phép hiển thị hồ sơ công khai</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.settings.allowOnlineConsultations}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          settings: { ...prev.settings, allowOnlineConsultations: e.target.checked }
                        }))}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500 mr-2"
                      />
                      <span className="text-sm text-gray-700">Cho phép tư vấn trực tuyến</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Statistics */}
              {counselorProfile?.performance && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Thống kê</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tổng buổi tư vấn:</span>
                      <span className="font-semibold">{counselorProfile.performance.totalSessions || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tổng khách hàng:</span>
                      <span className="font-semibold">{counselorProfile.performance.totalClients || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Đánh giá trung bình:</span>
                      <span className="font-semibold">
                        {counselorProfile.performance.averageRating?.toFixed(1) || 0}/5
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tỷ lệ hoàn thành:</span>
                      <span className="font-semibold">
                        {counselorProfile.performance.completionRate?.toFixed(1) || 0}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ConsultantProfile;
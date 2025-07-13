import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useForm, useFieldArray } from "react-hook-form";
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const CounselorForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { api } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);
  const [consultantUsers, setConsultantUsers] = useState([]);
  const isEdit = !!id;

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      specializations: [],
      languages: [{ language: "vi", proficiency: "native" }],
      credentials: [{ type: "degree", title: "", institution: "", year: new Date().getFullYear(), isActive: true }],
      experience: {
        totalYears: 0,
        workHistory: [{ organization: "", position: "", startDate: "", isCurrent: true, description: "" }],
      },
      areasOfExpertise: [""],
      clientTypes: [],
      availability: {
        workingHours: {
          monday: { isAvailable: true, slots: [{ start: "09:00", end: "17:00" }] },
          tuesday: { isAvailable: true, slots: [{ start: "09:00", end: "17:00" }] },
          wednesday: { isAvailable: true, slots: [{ start: "09:00", end: "17:00" }] },
          thursday: { isAvailable: true, slots: [{ start: "09:00", end: "17:00" }] },
          friday: { isAvailable: true, slots: [{ start: "09:00", end: "17:00" }] },
          saturday: { isAvailable: false, slots: [] },
          sunday: { isAvailable: false, slots: [] },
        },
      },
      sessionSettings: {
        defaultDuration: 60,
        breakBetweenSessions: 15,
        maxAppointmentsPerDay: 8,
        advanceBookingDays: 30,
      },
      status: "active",
      settings: {
        isPublicProfile: true,
        allowOnlineConsultations: true,
        autoConfirmAppointments: false,
        sendReminders: true,
      },
    },
  });

  const {
    fields: credentialFields,
    append: appendCredential,
    remove: removeCredential,
  } = useFieldArray({
    control,
    name: "credentials",
  });

  const {
    fields: workHistoryFields,
    append: appendWorkHistory,
    remove: removeWorkHistory,
  } = useFieldArray({
    control,
    name: "experience.workHistory",
  });

  const {
    fields: expertiseFields,
    append: appendExpertise,
    remove: removeExpertise,
  } = useFieldArray({
    control,
    name: "areasOfExpertise",
  });

  const {
    fields: languageFields,
    append: appendLanguage,
    remove: removeLanguage,
  } = useFieldArray({
    control,
    name: "languages",
  });

  const specializationOptions = [
    { value: "addiction_counseling", label: "Tư vấn nghiện" },
    { value: "youth_counseling", label: "Tư vấn trẻ em - thanh thiếu niên" },
    { value: "family_therapy", label: "Trị liệu gia đình" },
    { value: "group_therapy", label: "Trị liệu nhóm" },
    { value: "cognitive_behavioral", label: "Liệu pháp nhận thức hành vi" },
    { value: "motivational_interviewing", label: "Phỏng vấn thúc đẩy động lực" },
    { value: "trauma_therapy", label: "Trị liệu chấn thương" },
    { value: "crisis_intervention", label: "Can thiệp khủng hoảng" },
    { value: "prevention_education", label: "Giáo dục phòng ngừa" },
    { value: "harm_reduction", label: "Giảm thiểu tác hại" },
    { value: "recovery_coaching", label: "Huấn luyện phục hồi" },
    { value: "relapse_prevention", label: "Phòng ngừa tái phạm" },
  ];

  const clientTypeOptions = [
    { value: "individual", label: "Cá nhân" },
    { value: "couple", label: "Cặp đôi" },
    { value: "family", label: "Gia đình" },
    { value: "group", label: "Nhóm" },
    { value: "children", label: "Trẻ em" },
    { value: "adolescents", label: "Thanh thiếu niên" },
    { value: "adults", label: "Người lớn" },
    { value: "seniors", label: "Người cao tuổi" },
  ];

  const languageOptions = [
    { value: "vi", label: "Tiếng Việt" },
    { value: "en", label: "Tiếng Anh" },
    { value: "zh", label: "Tiếng Trung" },
    { value: "fr", label: "Tiếng Pháp" },
    { value: "ja", label: "Tiếng Nhật" },
    { value: "ko", label: "Tiếng Hàn" },
  ];

  const proficiencyOptions = [
    { value: "basic", label: "Cơ bản" },
    { value: "intermediate", label: "Trung bình" },
    { value: "advanced", label: "Nâng cao" },
    { value: "native", label: "Bản ngữ" },
  ];

  const credentialTypes = [
    { value: "degree", label: "Bằng cấp" },
    { value: "certificate", label: "Chứng chỉ" },
    { value: "license", label: "Giấy phép" },
    { value: "award", label: "Giải thưởng" },
    { value: "training", label: "Đào tạo" },
  ];

  useEffect(() => {
    if (isEdit) {
      fetchCounselorData();
    } else {
      fetchConsultantUsers();
    }
  }, [id]);

  const fetchCounselorData = async () => {
    try {
      setInitialLoading(true);
      const response = await api.get(`/counselors/${id}`);
      
      if (response.data.success) {
        const counselor = response.data.data;
        
        // Populate form with existing data
        Object.keys(counselor).forEach((key) => {
          if (counselor[key] !== null && counselor[key] !== undefined) {
            setValue(key, counselor[key]);
          }
        });
        
        // Handle special cases for arrays
        if (counselor.areasOfExpertise?.length === 0) {
          setValue("areasOfExpertise", [""]);
        }
        
        if (counselor.credentials?.length === 0) {
          setValue("credentials", [{ type: "degree", title: "", institution: "", year: new Date().getFullYear(), isActive: true }]);
        }
      }
    } catch (error) {
      console.error("Error fetching counselor data:", error);
      toast.error("Không thể tải thông tin chuyên viên");
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchConsultantUsers = async () => {
    try {
      // Get users with consultant role who don't have counselor profile yet
      const response = await api.get("/users?role=consultant&limit=100");
      
      if (response.data.success) {
        const consultants = response.data.data;
        
        // Get existing counselors to filter out users who already have profiles
        const counselorsResponse = await api.get("/counselors?limit=100");
        const existingCounselorUserIds = counselorsResponse.data.data.map(
          counselor => counselor.userId._id || counselor.userId
        );
        
        // Filter out users who already have counselor profiles
        const availableConsultants = consultants.filter(
          user => !existingCounselorUserIds.includes(user._id)
        );
        
        setConsultantUsers(availableConsultants);
      }
    } catch (error) {
      console.error("Error fetching consultant users:", error);
      toast.error("Không thể tải danh sách người dùng consultant");
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      // Clean up empty values
      const cleanData = {
        ...data,
        areasOfExpertise: data.areasOfExpertise.filter(area => area.trim() !== ""),
        credentials: data.credentials.filter(cred => cred.title.trim() !== ""),
        experience: {
          ...data.experience,
          workHistory: data.experience.workHistory.filter(work => work.organization.trim() !== ""),
        },
      };

      if (isEdit) {
        await api.put(`/counselors/${id}`, cleanData);
        toast.success("Cập nhật thông tin chuyên viên thành công");
      } else {
        // For new counselor, check if we need to create user account too
        if (cleanData.createUserAccount) {
          // Use the new API to create both user and counselor
          const response = await api.post("/counselors/create-with-user", {
            // User data
            firstName: cleanData.firstName,
            lastName: cleanData.lastName,
            email: cleanData.email,
            password: cleanData.password,
            phone: cleanData.phone,
            dateOfBirth: cleanData.dateOfBirth,
            gender: cleanData.gender,
            ageGroup: cleanData.ageGroup,
            // Counselor data
            biography: cleanData.biography,
            specializations: cleanData.specializations,
            languages: cleanData.languages,
            experience: cleanData.experience,
            education: cleanData.credentials.filter(c => c.type === "degree"),
            certifications: cleanData.credentials.filter(c => c.type !== "degree"),
            areasOfExpertise: cleanData.areasOfExpertise,
            availability: cleanData.availability,
            sessionSettings: cleanData.sessionSettings,
            settings: cleanData.settings,
          });
          
          if (response.data.temporaryPassword) {
            toast.success(`Tạo chuyên viên thành công! Mật khẩu tạm thời: ${response.data.temporaryPassword}`, {
              duration: 10000,
            });
          } else {
            toast.success("Tạo tài khoản và hồ sơ chuyên viên thành công");
          }
        } else {
          // Just create counselor profile for existing user
          await api.post("/counselors", cleanData);
          toast.success("Tạo hồ sơ chuyên viên thành công");
        }
      }
      
      navigate("/manager/counselors");
    } catch (error) {
      console.error("Error saving counselor:", error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi lưu thông tin");
    } finally {
      setLoading(false);
    }
  };

  const dayLabels = {
    monday: "Thứ 2",
    tuesday: "Thứ 3", 
    wednesday: "Thứ 4",
    thursday: "Thứ 5",
    friday: "Thứ 6",
    saturday: "Thứ 7",
    sunday: "Chủ nhật",
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/manager/counselors")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isEdit ? "Chỉnh sửa chuyên viên" : "Thêm chuyên viên mới"}
              </h1>
              <p className="text-gray-600">
                {isEdit ? "Cập nhật thông tin chuyên viên tư vấn" : "Tạo hồ sơ chuyên viên tư vấn mới"}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* User Account Section (only for new counselor) */}
          {!isEdit && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Tài khoản người dùng
              </h2>
              
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register("createUserAccount")}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Tạo tài khoản người dùng mới cho chuyên viên này
                  </span>
                </label>
              </div>
              
              {watch("createUserAccount") && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ *
                    </label>
                    <input
                      type="text"
                      {...register("firstName", {
                        required: watch("createUserAccount") ? "Họ là bắt buộc" : false,
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    {errors.firstName && (
                      <p className="text-red-600 text-sm mt-1">{errors.firstName.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên *
                    </label>
                    <input
                      type="text"
                      {...register("lastName", {
                        required: watch("createUserAccount") ? "Tên là bắt buộc" : false,
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    {errors.lastName && (
                      <p className="text-red-600 text-sm mt-1">{errors.lastName.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      {...register("email", {
                        required: watch("createUserAccount") ? "Email là bắt buộc" : false,
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Email không hợp lệ",
                        },
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    {errors.email && (
                      <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mật khẩu (để trống để tự động tạo)
                    </label>
                    <input
                      type="password"
                      {...register("password", {
                        minLength: {
                          value: 6,
                          message: "Mật khẩu phải có ít nhất 6 ký tự",
                        },
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    {errors.password && (
                      <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      {...register("phone")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày sinh
                    </label>
                    <input
                      type="date"
                      {...register("dateOfBirth")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giới tính
                    </label>
                    <select
                      {...register("gender")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nhóm tuổi
                    </label>
                    <select
                      {...register("ageGroup")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Chọn nhóm tuổi</option>
                      <option value="student">Học sinh</option>
                      <option value="university_student">Sinh viên</option>
                      <option value="parent">Phụ huynh</option>
                      <option value="teacher">Giáo viên</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                </div>
              )}
              
              {!watch("createUserAccount") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn người dùng có sẵn (role: consultant) *
                  </label>
                  <select
                    {...register("userId", {
                      required: !watch("createUserAccount") ? "Vui lòng chọn người dùng" : false,
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Chọn người dùng</option>
                    {consultantUsers.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.firstName} {user.lastName} - {user.email}
                      </option>
                    ))}
                  </select>
                  {errors.userId && (
                    <p className="text-red-600 text-sm mt-1">{errors.userId.message}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    Lưu ý: Chỉ người dùng có role "consultant" mới có thể tạo hồ sơ chuyên viên
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Thông tin cơ bản
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Biography */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiểu sử
                </label>
                <textarea
                  {...register("biography")}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Mô tả về chuyên viên, kinh nghiệm và phương pháp tiếp cận..."
                />
              </div>

              {/* Approach */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phương pháp tiếp cận
                </label>
                <textarea
                  {...register("approach")}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Mô tả phương pháp và triết lý tư vấn..."
                />
              </div>

              {/* Total Years Experience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số năm kinh nghiệm *
                </label>
                <input
                  type="number"
                  {...register("experience.totalYears", {
                    required: "Số năm kinh nghiệm là bắt buộc",
                    min: { value: 0, message: "Số năm kinh nghiệm không thể âm" },
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                {errors.experience?.totalYears && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.experience.totalYears.message}
                  </p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái
                </label>
                <select
                  {...register("status")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="active">Hoạt động</option>
                  <option value="on_leave">Nghỉ phép</option>
                  <option value="unavailable">Không có sẵn</option>
                  <option value="suspended">Tạm ngưng</option>
                </select>
              </div>
            </div>
          </div>

          {/* Specializations */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Chuyên môn
            </h2>
            
            <div className="space-y-6">
              {/* Specializations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lĩnh vực chuyên môn
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {specializationOptions.map((option) => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="checkbox"
                        value={option.value}
                        {...register("specializations")}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Client Types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại hình tư vấn
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {clientTypeOptions.map((option) => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="checkbox"
                        value={option.value}
                        {...register("clientTypes")}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Areas of Expertise */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lĩnh vực chuyên môn khác
                </label>
                {expertiseFields.map((field, index) => (
                  <div key={field.id} className="flex items-center mb-2">
                    <input
                      {...register(`areasOfExpertise.${index}`)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Nhập lĩnh vực chuyên môn..."
                    />
                    {expertiseFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeExpertise(index)}
                        className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => appendExpertise("")}
                  className="mt-2 inline-flex items-center px-3 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg"
                >
                  <PlusIcon className="w-4 h-4 mr-1" />
                  Thêm lĩnh vực
                </button>
              </div>
            </div>
          </div>

          {/* Languages */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Ngôn ngữ
            </h2>
            
            {languageFields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <select
                    {...register(`languages.${index}.language`)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {languageOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <select
                    {...register(`languages.${index}.proficiency`)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {proficiencyOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                {languageFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLanguage(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            
            <button
              type="button"
              onClick={() => appendLanguage({ language: "en", proficiency: "intermediate" })}
              className="inline-flex items-center px-3 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg"
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              Thêm ngôn ngữ
            </button>
          </div>

          {/* Credentials */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Bằng cấp & Chứng chỉ
            </h2>
            
            {credentialFields.map((field, index) => (
              <div key={field.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loại
                    </label>
                    <select
                      {...register(`credentials.${index}.type`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      {credentialTypes.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Năm
                    </label>
                    <input
                      type="number"
                      {...register(`credentials.${index}.year`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên bằng cấp/chứng chỉ
                    </label>
                    <input
                      {...register(`credentials.${index}.title`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Tên bằng cấp hoặc chứng chỉ..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tổ chức cấp
                    </label>
                    <input
                      {...register(`credentials.${index}.institution`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Trường/tổ chức cấp bằng..."
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      {...register(`credentials.${index}.isActive`)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Còn hiệu lực</span>
                  </label>
                  
                  {credentialFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCredential(index)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Xóa
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            <button
              type="button"
              onClick={() => appendCredential({
                type: "certificate",
                title: "",
                institution: "",
                year: new Date().getFullYear(),
                isActive: true,
              })}
              className="inline-flex items-center px-3 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg"
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              Thêm bằng cấp/chứng chỉ
            </button>
          </div>

          {/* Work History */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Kinh nghiệm làm việc
            </h2>
            
            {workHistoryFields.map((field, index) => (
              <div key={field.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chức vụ
                    </label>
                    <input
                      {...register(`experience.workHistory.${index}.position`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Chức vụ..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tổ chức
                    </label>
                    <input
                      {...register(`experience.workHistory.${index}.organization`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Tên tổ chức..."
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày bắt đầu
                    </label>
                    <input
                      type="date"
                      {...register(`experience.workHistory.${index}.startDate`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày kết thúc
                    </label>
                    <input
                      type="date"
                      {...register(`experience.workHistory.${index}.endDate`)}
                      disabled={watch(`experience.workHistory.${index}.isCurrent`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả công việc
                  </label>
                  <textarea
                    {...register(`experience.workHistory.${index}.description`)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Mô tả công việc và thành tích..."
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      {...register(`experience.workHistory.${index}.isCurrent`)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Đang làm việc hiện tại</span>
                  </label>
                  
                  {workHistoryFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeWorkHistory(index)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Xóa
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            <button
              type="button"
              onClick={() => appendWorkHistory({
                organization: "",
                position: "",
                startDate: "",
                isCurrent: false,
                description: "",
              })}
              className="inline-flex items-center px-3 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg"
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              Thêm kinh nghiệm
            </button>
          </div>

          {/* Working Hours */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Lịch làm việc
            </h2>
            
            {Object.keys(dayLabels).map((day) => (
              <div key={day} className="mb-6 last:mb-0">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-lg font-medium text-gray-900">
                    {dayLabels[day]}
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      {...register(`availability.workingHours.${day}.isAvailable`)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Có sẵn</span>
                  </label>
                </div>
                
                {watch(`availability.workingHours.${day}.isAvailable`) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Từ
                      </label>
                      <input
                        type="time"
                        {...register(`availability.workingHours.${day}.slots.0.start`)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Đến
                      </label>
                      <input
                        type="time"
                        {...register(`availability.workingHours.${day}.slots.0.end`)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Session Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Cài đặt buổi tư vấn
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời gian mặc định (phút)
                </label>
                <input
                  type="number"
                  {...register("sessionSettings.defaultDuration")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nghỉ giữa các buổi (phút)
                </label>
                <input
                  type="number"
                  {...register("sessionSettings.breakBetweenSessions")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tối đa buổi/ngày
                </label>
                <input
                  type="number"
                  {...register("sessionSettings.maxAppointmentsPerDay")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đặt trước (ngày)
                </label>
                <input
                  type="number"
                  {...register("sessionSettings.advanceBookingDays")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Cài đặt
            </h2>
            
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register("settings.isPublicProfile")}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Hồ sơ công khai</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register("settings.allowOnlineConsultations")}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Cho phép tư vấn trực tuyến</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register("settings.autoConfirmAppointments")}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Tự động xác nhận lịch hẹn</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register("settings.sendReminders")}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Gửi nhắc nhở</span>
              </label>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate("/manager/counselors")}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CounselorForm;
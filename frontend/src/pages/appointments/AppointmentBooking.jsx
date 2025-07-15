import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import {
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  StarIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const AppointmentBooking = () => {
  const { user, isAuthenticated, api } = useAuth();
  const navigate = useNavigate();
  const [counselors, setCounselors] = useState([]);
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [notes, setNotes] = useState("");
  const [appointmentType, setAppointmentType] = useState("online");
  const [urgency, setUrgency] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [bookingStep, setBookingStep] = useState(1); // 1: Select counselor, 2: Select date/time, 3: Confirm

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/appointments/book" } } });
      return;
    }
    
    // PHASE 1: Prevent consultants from accessing appointment booking
    if (user && user.role === 'consultant') {
      toast.error("Chuyên viên tư vấn không thể đặt lịch hẹn");
      navigate("/dashboard");
      return;
    }
    
    fetchCounselors();
  }, [isAuthenticated, navigate, user]);

  const fetchCounselors = async () => {
    try {
      setLoading(true);
      const response = await api.get("/counselors/search");
      setCounselors(response.data.data || []);
    } catch (error) {
      console.error("Error fetching counselors:", error);
      toast.error("Không thể tải danh sách chuyên viên");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async (counselorUserId, date) => {
    try {
      const response = await api.get(`/counselors/user/${counselorUserId}/schedule?date=${date}`);
      setAvailableSlots(response.data.data?.availableSlots || []);
    } catch (error) {
      console.error("Error fetching available slots:", error);
      toast.error("Không thể tải lịch trống");
    }
  };

  const handleCounselorSelect = (counselor) => {
    setSelectedCounselor(counselor);
    setBookingStep(2);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedTime("");
    if (selectedCounselor && date) {
      fetchAvailableSlots(selectedCounselor.userId._id, date);
    }
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    // Don't automatically go to step 3, let user fill in other information
  };

  const handleBooking = async () => {
    if (!selectedCounselor || !selectedDate || !selectedTime || !notes.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);
      const [startTime, endTime] = selectedTime.split("-");
      
      const response = await api.post("/appointments", {
        counselorId: selectedCounselor._id,
        appointmentDate: selectedDate,
        appointmentTime: {
          start: startTime.trim(),
          end: endTime.trim(),
        },
        type: appointmentType,
        reason: notes.trim(),
        urgency: urgency,
        contactInfo: {
          email: user.email,
          phoneNumber: user.phone,
          preferredContact: "email"
        },
      });

      if (response.data.success) {
        toast.success("Đặt lịch hẹn thành công!");
        navigate("/appointments");
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast.error(error.response?.data?.message || "Không thể đặt lịch hẹn");
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30); // Book up to 30 days in advance
    return maxDate.toISOString().split('T')[0];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <motion.div 
      className="min-h-screen bg-gray-50 py-8"
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div className="mb-8" variants={fadeInUp}>
          <button
            onClick={() => navigate("/appointments")}
            className="mb-4 btn-outline"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Quay lại
          </button>
          
          <div className="text-center">
            <CalendarDaysIcon className="mx-auto h-16 w-16 text-purple-600 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Đặt lịch hẹn tư vấn
            </h1>
            <p className="text-gray-600">
              Chọn chuyên viên và thời gian phù hợp cho buổi tư vấn của bạn
            </p>
          </div>
        </motion.div>

        {/* Progress Steps */}
        <motion.div className="mb-8" variants={fadeInUp}>
          <div className="flex items-center justify-center space-x-8">
            {[
              { step: 1, label: "Chọn chuyên viên" },
              { step: 2, label: "Chọn thời gian" },
              { step: 3, label: "Xác nhận" },
            ].map((item) => (
              <div key={item.step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                  bookingStep >= item.step
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}>
                  {bookingStep > item.step ? (
                    <CheckCircleIcon className="w-5 h-5" />
                  ) : (
                    item.step
                  )}
                </div>
                <span className={`ml-2 font-medium ${
                  bookingStep >= item.step ? "text-purple-600" : "text-gray-600"
                }`}>
                  {item.label}
                </span>
                {item.step < 3 && (
                  <div className={`w-8 h-0.5 ml-4 ${
                    bookingStep > item.step ? "bg-purple-600" : "bg-gray-200"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Step 1: Select Counselor */}
        {bookingStep === 1 && (
          <motion.div variants={fadeInUp}>
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Chọn chuyên viên tư vấn
                </h2>
                <p className="text-gray-600 mt-1">
                  Chọn chuyên viên phù hợp với nhu cầu tư vấn của bạn
                </p>
              </div>
              
              <div className="p-6">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="spinner"></div>
                  </div>
                ) : counselors.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {counselors.map((counselor) => (
                      <motion.div
                        key={counselor._id}
                        className="border border-gray-200 rounded-lg p-6 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                        onClick={() => handleCounselorSelect(counselor)}
                      >
                        <div className="flex items-start">
                          <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mr-4">
                            <UserIcon className="w-8 h-8 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {counselor.userId?.firstName} {counselor.userId?.lastName}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {counselor.specializations?.join(", ") || "Chuyên viên tư vấn"}
                            </p>
                            
                            <div className="flex items-center mb-3">
                              <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-gray-600 ml-1">
                                {counselor.performance?.averageRating?.toFixed(1) || "5.0"}
                              </span>
                              <span className="text-sm text-gray-400 ml-2">
                                ({counselor.performance?.totalSessions || 0} buổi tư vấn)
                              </span>
                            </div>
                            
                            {counselor.biography && (
                              <p className="text-sm text-gray-600 line-clamp-3">
                                {counselor.biography}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              Kinh nghiệm: {counselor.experience?.totalYears || "2+"} năm
                            </span>
                            <button className="btn-outline text-sm">
                              Chọn chuyên viên
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <UserIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Chưa có chuyên viên nào
                    </h3>
                    <p className="text-gray-600">
                      Hiện tại chưa có chuyên viên nào có sẵn. Vui lòng thử lại sau.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Select Date and Time */}
        {bookingStep === 2 && selectedCounselor && (
          <motion.div variants={fadeInUp}>
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Chọn ngày và giờ
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Chuyên viên: {selectedCounselor.userId?.firstName} {selectedCounselor.userId?.lastName}
                    </p>
                  </div>
                  <button
                    onClick={() => setBookingStep(1)}
                    className="btn-outline"
                  >
                    Đổi chuyên viên
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn ngày
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    min={getMinDate()}
                    max={getMaxDate()}
                    className="form-input max-w-xs"
                  />
                </div>

                {/* Time Selection */}
                {selectedDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chọn giờ ({formatDate(selectedDate)})
                    </label>
                    {availableSlots.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {availableSlots.map((slot, index) => {
                          const timeSlot = typeof slot === 'string' ? slot : `${slot.start}-${slot.end}`;
                          return (
                            <button
                              key={index}
                              onClick={() => handleTimeSelect(timeSlot)}
                              className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                                selectedTime === timeSlot
                                  ? "border-purple-500 bg-purple-50 text-purple-700"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <ClockIcon className="w-4 h-4 mx-auto mb-1" />
                              {timeSlot}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <ClockIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-gray-600">
                          Không có lịch trống trong ngày này
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Appointment Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hình thức tư vấn
                  </label>
                  <select
                    value={appointmentType}
                    onChange={(e) => setAppointmentType(e.target.value)}
                    className="form-input"
                  >
                    <option value="online">Tư vấn online</option>
                    <option value="in_person">Tư vấn trực tiếp</option>
                    <option value="phone">Tư vấn qua điện thoại</option>
                  </select>
                </div>

                {/* Urgency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mức độ khẩn cấp
                  </label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    className="form-input"
                  >
                    <option value="low">Thấp</option>
                    <option value="medium">Trung bình</option>
                    <option value="high">Cao</option>
                    <option value="emergency">Khẩn cấp</option>
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lý do tư vấn <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Mô tả vấn đề bạn muốn tư vấn..."
                    className="form-input"
                    rows={4}
                    required
                  />
                </div>

                {/* Continue Button */}
                {selectedTime && (
                  <div className="flex justify-between pt-6">
                    <button
                      onClick={() => setBookingStep(1)}
                      className="btn-outline"
                    >
                      Quay lại
                    </button>
                    <button
                      onClick={() => {
                        if (!notes.trim()) {
                          toast.error("Vui lòng nhập lý do tư vấn");
                          return;
                        }
                        setBookingStep(3);
                      }}
                      className="btn-primary"
                    >
                      Tiếp tục xác nhận
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Confirmation */}
        {bookingStep === 3 && selectedCounselor && selectedDate && selectedTime && (
          <motion.div variants={fadeInUp}>
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Xác nhận thông tin đặt lịch
                </h2>
                <p className="text-gray-600 mt-1">
                  Vui lòng kiểm tra lại thông tin trước khi xác nhận
                </p>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-medium text-gray-900 mb-4">Thông tin cuộc hẹn</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <UserIcon className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <span className="font-medium">Chuyên viên: </span>
                        {selectedCounselor.userId?.firstName} {selectedCounselor.userId?.lastName}
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <CalendarDaysIcon className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <span className="font-medium">Ngày: </span>
                        {formatDate(selectedDate)}
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <ClockIcon className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <span className="font-medium">Giờ: </span>
                        {selectedTime}
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-5 h-5 mr-3">
                        <span className="text-gray-400">💻</span>
                      </div>
                      <div>
                        <span className="font-medium">Hình thức: </span>
                        {appointmentType === "online" ? "Tư vấn online" : 
                         appointmentType === "in_person" ? "Tư vấn trực tiếp" : "Tư vấn qua điện thoại"}
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-5 h-5 mr-3">
                        <span className="text-gray-400">🔥</span>
                      </div>
                      <div>
                        <span className="font-medium">Mức độ: </span>
                        {urgency === "low" ? "Thấp" : 
                         urgency === "medium" ? "Trung bình" : 
                         urgency === "high" ? "Cao" : "Khẩn cấp"}
                      </div>
                    </div>
                    
                    {notes && (
                      <div className="flex items-start">
                        <div className="w-5 h-5 mr-3 mt-0.5">
                          <span className="text-gray-400">💬</span>
                        </div>
                        <div>
                          <span className="font-medium">Lý do: </span>
                          {notes}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Lưu ý quan trọng:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Vui lòng có mặt đúng giờ hẹn</li>
                    <li>• Bạn có thể hủy hoặc đổi lịch trước 2 giờ</li>
                    <li>• Chúng tôi sẽ gửi email nhắc nhở trước cuộc hẹn</li>
                    <li>• Mọi thông tin tư vấn được bảo mật tuyệt đối</li>
                  </ul>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setBookingStep(2)}
                    className="btn-outline"
                  >
                    Quay lại
                  </button>
                  <button
                    onClick={handleBooking}
                    disabled={loading}
                    className="btn-primary disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="spinner w-4 h-4 mr-2" />
                    ) : (
                      <CheckCircleIcon className="w-4 h-4 mr-2" />
                    )}
                    {loading ? "Đang đặt lịch..." : "Xác nhận đặt lịch"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default AppointmentBooking;
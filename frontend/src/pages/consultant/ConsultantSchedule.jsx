import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import ConsultantSidebar from "../../components/layout/ConsultantSidebar";
import ConsultantHeader from "../../components/layout/ConsultantHeader";
import {
  ClockIcon,
  CalendarDaysIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const ConsultantSchedule = () => {
  const { user, api } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState({
    workingHours: {
      monday: { isAvailable: false, slots: [{ start: "09:00", end: "17:00" }] },
      tuesday: { isAvailable: false, slots: [{ start: "09:00", end: "17:00" }] },
      wednesday: { isAvailable: false, slots: [{ start: "09:00", end: "17:00" }] },
      thursday: { isAvailable: false, slots: [{ start: "09:00", end: "17:00" }] },
      friday: { isAvailable: false, slots: [{ start: "09:00", end: "17:00" }] },
      saturday: { isAvailable: false, slots: [] },
      sunday: { isAvailable: false, slots: [] },
    },
    sessionSettings: {
      defaultDuration: 60,
      breakBetweenSessions: 15,
      maxAppointmentsPerDay: 8,
      advanceBookingDays: 30,
    },
    exceptions: [],
  });
  const [editingException, setEditingException] = useState(null);
  const [showExceptionForm, setShowExceptionForm] = useState(false);

  const daysOfWeek = [
    { key: "monday", label: "Thứ Hai" },
    { key: "tuesday", label: "Thứ Ba" },
    { key: "wednesday", label: "Thứ Tư" },
    { key: "thursday", label: "Thứ Năm" },
    { key: "friday", label: "Thứ Sáu" },
    { key: "saturday", label: "Thứ Bảy" },
    { key: "sunday", label: "Chủ Nhật" },
  ];

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      // Note: This assumes you have a counselor profile endpoint
      const response = await api.get(`/counselors/user/${user._id}`);
      if (response.data.success && response.data.data) {
        const counselor = response.data.data;
        if (counselor.availability) {
          setSchedule(prev => ({
            ...prev,
            workingHours: counselor.availability.workingHours || prev.workingHours,
            exceptions: counselor.availability.exceptions || [],
          }));
        }
        if (counselor.sessionSettings) {
          setSchedule(prev => ({
            ...prev,
            sessionSettings: counselor.sessionSettings,
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching schedule:", error);
      toast.error("Không thể tải lịch làm việc");
    } finally {
      setLoading(false);
    }
  };

  const handleWorkingHoursChange = (day, field, value) => {
    setSchedule(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day],
          [field]: value,
        },
      },
    }));
  };

  const handleSessionSettingsChange = (field, value) => {
    setSchedule(prev => ({
      ...prev,
      sessionSettings: {
        ...prev.sessionSettings,
        [field]: value,
      },
    }));
  };

  const saveSchedule = async () => {
    try {
      // Note: This endpoint might need to be created if it doesn't exist
      await api.put(`/counselors/user/${user._id}/schedule`, {
        workingHours: schedule.workingHours,
        sessionSettings: schedule.sessionSettings,
        exceptions: schedule.exceptions,
      });
      toast.success("Lịch làm việc đã được cập nhật");
    } catch (error) {
      console.error("Error saving schedule:", error);
      toast.error("Không thể lưu lịch làm việc");
    }
  };

  const addException = (exceptionData) => {
    const newException = {
      id: Date.now().toString(),
      ...exceptionData,
    };
    setSchedule(prev => ({
      ...prev,
      exceptions: [...prev.exceptions, newException],
    }));
    setShowExceptionForm(false);
  };

  const removeException = (exceptionId) => {
    setSchedule(prev => ({
      ...prev,
      exceptions: prev.exceptions.filter(ex => ex.id !== exceptionId),
    }));
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
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Lịch làm việc
                </h1>
                <p className="mt-2 text-gray-600">
                  Thiết lập thời gian làm việc và khả năng tiếp nhận khách hàng
                </p>
              </div>
              <button
                onClick={saveSchedule}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <CheckIcon className="w-5 h-5 mr-2" />
                Lưu thay đổi
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Working Hours */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <ClockIcon className="w-6 h-6 mr-2" />
                  Giờ làm việc
                </h2>
                <p className="text-gray-600 mt-1">Thiết lập giờ làm việc cho từng ngày trong tuần</p>
              </div>
              <div className="p-6 space-y-4">
                {daysOfWeek.map((day) => (
                  <div key={day.key} className="flex items-center space-x-4">
                    <div className="w-20">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={schedule.workingHours[day.key]?.isAvailable || false}
                          onChange={(e) => handleWorkingHoursChange(day.key, "isAvailable", e.target.checked)}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">
                          {day.label}
                        </span>
                      </label>
                    </div>
                    <div className="flex items-center space-x-2 flex-1">
                      <input
                        type="time"
                        value={schedule.workingHours[day.key]?.start || "09:00"}
                        onChange={(e) => handleWorkingHoursChange(day.key, "start", e.target.value)}
                        disabled={!schedule.workingHours[day.key]?.isAvailable}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
                      />
                      <span className="text-gray-500">đến</span>
                      <input
                        type="time"
                        value={schedule.workingHours[day.key]?.end || "17:00"}
                        onChange={(e) => handleWorkingHoursChange(day.key, "end", e.target.value)}
                        disabled={!schedule.workingHours[day.key]?.isAvailable}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Session Settings */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <CalendarDaysIcon className="w-6 h-6 mr-2" />
                  Cài đặt buổi tư vấn
                </h2>
                <p className="text-gray-600 mt-1">Thiết lập thông số cho các buổi tư vấn</p>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thời gian mỗi buổi (phút)
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="180"
                    step="15"
                    value={schedule.sessionSettings.defaultDuration}
                    onChange={(e) => handleSessionSettingsChange("defaultDuration", parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thời gian nghỉ giữa các buổi (phút)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    step="5"
                    value={schedule.sessionSettings.breakBetweenSessions}
                    onChange={(e) => handleSessionSettingsChange("breakBetweenSessions", parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số buổi tối đa mỗi ngày
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={schedule.sessionSettings.maxAppointmentsPerDay}
                    onChange={(e) => handleSessionSettingsChange("maxAppointmentsPerDay", parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allowOnlineBooking"
                    checked={schedule.sessionSettings.allowOnlineBooking}
                    onChange={(e) => handleSessionSettingsChange("allowOnlineBooking", e.target.checked)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <label htmlFor="allowOnlineBooking" className="ml-2 text-sm font-medium text-gray-700">
                    Cho phép đặt lịch trực tuyến
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Exceptions */}
          <div className="mt-6 bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Ngày đặc biệt</h2>
                  <p className="text-gray-600 mt-1">Thiết lập lịch đặc biệt cho các ngày nghỉ lễ hoặc không khả dụng</p>
                </div>
                <button
                  onClick={() => setShowExceptionForm(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Thêm ngày đặc biệt
                </button>
              </div>
            </div>
            <div className="p-6">
              {schedule.exceptions.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarDaysIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">Chưa có ngày đặc biệt nào</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {schedule.exceptions.map((exception) => (
                    <div key={exception.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{exception.title}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(exception.date).toLocaleDateString("vi-VN")} - {exception.type === "unavailable" ? "Không khả dụng" : "Giờ đặc biệt"}
                        </p>
                      </div>
                      <button
                        onClick={() => removeException(exception.id)}
                        className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Exception Form Modal */}
          {showExceptionForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Thêm ngày đặc biệt</h3>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.target);
                      addException({
                        title: formData.get("title"),
                        date: formData.get("date"),
                        type: formData.get("type"),
                        notes: formData.get("notes"),
                      });
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tiêu đề
                      </label>
                      <input
                        type="text"
                        name="title"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Ví dụ: Nghỉ lễ Tết"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ngày
                      </label>
                      <input
                        type="date"
                        name="date"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Loại
                      </label>
                      <select
                        name="type"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="unavailable">Không khả dụng</option>
                        <option value="special_hours">Giờ đặc biệt</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ghi chú
                      </label>
                      <textarea
                        name="notes"
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Ghi chú thêm..."
                      />
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowExceptionForm(false)}
                        className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Thêm
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ConsultantSchedule;
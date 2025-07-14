import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import AdminSidebar from "../../components/layout/AdminSidebar";
import AdminHeader from "../../components/layout/AdminHeader";
import { toast } from "react-hot-toast";

const AdminModulesLessons = () => {
  const { api, isAuthenticated, loading: authLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [modules, setModules] = useState([]);
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleDescription, setModuleDescription] = useState("");
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonContent, setLessonContent] = useState("");
  const [lessonType, setLessonType] = useState("text");
  const [lessonDuration, setLessonDuration] = useState(1);
  const [lessonVideoUrl, setLessonVideoUrl] = useState("");
  const [lessonResources, setLessonResources] = useState([]);
  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceUrl, setResourceUrl] = useState("");
  const [resourceType, setResourceType] = useState("link");

  // Fetch all courses for dropdown
  useEffect(() => {
    if (!isAuthenticated || authLoading) return;
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await api.get("/courses/admin/all?limit=100");
        if (res.data.success) {
          setCourses(res.data.data);
        }
      } catch (err) {
        setError("Lỗi khi tải danh sách khóa học");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [isAuthenticated, authLoading, api]);

  // Fetch modules when course changes
  useEffect(() => {
    if (!selectedCourseId) return;
    const fetchModules = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/courses/${selectedCourseId}`);
        if (res.data.success) {
          setModules(res.data.data.modules || []);
        }
      } catch (err) {
        setError("Lỗi khi tải module");
      } finally {
        setLoading(false);
      }
    };
    fetchModules();
  }, [selectedCourseId, api]);

  // Fetch lessons when module changes
  useEffect(() => {
    if (!selectedModuleId || !modules.length) {
      setLessons([]);
      return;
    }
    const module = modules.find((m) => m._id === selectedModuleId);
    setLessons(module ? module.lessons : []);
  }, [selectedModuleId, modules]);

  // Module CRUD handlers
  const handleAddModule = async () => {
    if (!moduleTitle) return toast.error("Vui lòng nhập tiêu đề module");
    try {
      setLoading(true);
      const res = await api.post(`/courses/${selectedCourseId}/modules`, {
        title: moduleTitle,
        description: moduleDescription,
        order: modules.length + 1,
      });
      if (res.data.success) {
        toast.success("Đã thêm module");
        setShowModuleForm(false);
        setModuleTitle("");
        setModuleDescription("");
        // Refresh modules
        const courseRes = await api.get(`/courses/${selectedCourseId}`);
        setModules(courseRes.data.data.modules || []);
      }
    } catch (err) {
      toast.error("Lỗi khi thêm module");
    } finally {
      setLoading(false);
    }
  };

  const handleEditModule = async () => {
    if (!editingModule) return;
    try {
      setLoading(true);
      const res = await api.put(`/courses/${selectedCourseId}/modules/${editingModule._id}`, {
        title: moduleTitle,
        description: moduleDescription,
      });
      if (res.data.success) {
        toast.success("Đã cập nhật module");
        setShowModuleForm(false);
        setEditingModule(null);
        setModuleTitle("");
        setModuleDescription("");
        const courseRes = await api.get(`/courses/${selectedCourseId}`);
        setModules(courseRes.data.data.modules || []);
      }
    } catch (err) {
      toast.error("Lỗi khi cập nhật module");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa module này?")) return;
    try {
      setLoading(true);
      const res = await api.delete(`/courses/${selectedCourseId}/modules/${moduleId}`);
      if (res.data.success) {
        toast.success("Đã xóa module");
        const courseRes = await api.get(`/courses/${selectedCourseId}`);
        setModules(courseRes.data.data.modules || []);
        setSelectedModuleId("");
      }
    } catch (err) {
      toast.error("Lỗi khi xóa module");
    } finally {
      setLoading(false);
    }
  };

  // Lesson CRUD handlers
  const handleAddLesson = async () => {
    if (!lessonTitle) return toast.error("Vui lòng nhập tiêu đề bài học");
    try {
      setLoading(true);
      const lessonPayload = {
        title: lessonTitle,
        content: lessonContent,
        type: lessonType,
        duration: lessonDuration,
        order: lessons.length + 1,
      };
      if (lessonType === "video" && lessonVideoUrl) lessonPayload.videoUrl = lessonVideoUrl;
      if (lessonResources.length > 0) lessonPayload.resources = lessonResources;

      const res = await api.post(`/courses/${selectedCourseId}/modules/${selectedModuleId}/lessons`, lessonPayload);
      if (res.data.success) {
        toast.success("Đã thêm bài học");
        setShowLessonForm(false);
        setLessonTitle("");
        setLessonContent("");
        setLessonType("text");
        setLessonDuration(1);
        setLessonVideoUrl("");
        setLessonResources([]);
        // Refresh modules/lessons
        const courseRes = await api.get(`/courses/${selectedCourseId}`);
        setModules(courseRes.data.data.modules || []);
        setSelectedModuleId(selectedModuleId); // trigger lessons update
      }
    } catch (err) {
      toast.error("Lỗi khi thêm bài học");
    } finally {
      setLoading(false);
    }
  };

  const handleEditLesson = async () => {
    if (!editingLesson) return;
    try {
      setLoading(true);
      const lessonPayload = {
        title: lessonTitle,
        content: lessonContent,
        type: lessonType,
        duration: lessonDuration,
      };
      if (lessonType === "video" && lessonVideoUrl) lessonPayload.videoUrl = lessonVideoUrl;
      if (lessonResources.length > 0) lessonPayload.resources = lessonResources;

      const res = await api.put(`/courses/${selectedCourseId}/modules/${selectedModuleId}/lessons/${editingLesson._id}`, lessonPayload);
      if (res.data.success) {
        toast.success("Đã cập nhật bài học");
        setShowLessonForm(false);
        setEditingLesson(null);
        setLessonTitle("");
        setLessonContent("");
        setLessonType("text");
        setLessonDuration(1);
        setLessonVideoUrl("");
        setLessonResources([]);
        const courseRes = await api.get(`/courses/${selectedCourseId}`);
        setModules(courseRes.data.data.modules || []);
        setSelectedModuleId(selectedModuleId);
      }
    } catch (err) {
      toast.error("Lỗi khi cập nhật bài học");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài học này?")) return;
    try {
      setLoading(true);
      const res = await api.delete(`/courses/${selectedCourseId}/modules/${selectedModuleId}/lessons/${lessonId}`);
      if (res.data.success) {
        toast.success("Đã xóa bài học");
        const courseRes = await api.get(`/courses/${selectedCourseId}`);
        setModules(courseRes.data.data.modules || []);
        setSelectedModuleId(selectedModuleId);
      }
    } catch (err) {
      toast.error("Lỗi khi xóa bài học");
    } finally {
      setLoading(false);
    }
  };

  // Filter visible modules and lessons before rendering
  const visibleModules = modules.filter(m => m.isVisible !== false);
  const visibleLessons = lessons.filter(l => l.isVisible !== false);

  // UI rendering
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col">
        <AdminHeader onMenuToggle={() => setSidebarOpen(true)} />
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-bold mb-4">Quản lý module & bài học</h1>
          {error && <div className="mb-4 text-red-600">{error}</div>}
          <div className="mb-4">
            <label className="block mb-1 font-medium">Chọn khóa học:</label>
            <select
              className="px-4 py-2 border rounded-lg"
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value);
                setSelectedModuleId("");
              }}
            >
              <option value="">-- Chọn khóa học --</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
          {selectedCourseId && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block font-medium">Module:</label>
                <button
                  className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  onClick={() => { setShowModuleForm(true); setEditingModule(null); setModuleTitle(""); setModuleDescription(""); }}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Thêm module
                </button>
              </div>
              {visibleModules.length === 0 ? (
                <div className="text-gray-500 text-center py-8">Chưa có module nào cho khóa học này.</div>
              ) : (
                <ul className="space-y-2">
                  {visibleModules.map((module) => (
                    <li
                      key={module._id}
                      className={`p-3 bg-white rounded shadow flex justify-between items-center transition-all duration-200 cursor-pointer border
                        ${selectedModuleId === module._id ? "bg-green-50 border-green-500 scale-[1.02]" : "hover:bg-gray-50 border-transparent"}`}
                      onClick={() => setSelectedModuleId(module._id)}
                      style={{ boxShadow: selectedModuleId === module._id ? '0 0 0 2px #22c55e33' : undefined }}
                    >
                      <span className="font-medium text-gray-900">{module.title}</span>
                      <div className="flex items-center space-x-2">
                        <button
                          className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-150
                            ${selectedModuleId === module._id ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-green-100"}`}
                          onClick={e => { e.stopPropagation(); setSelectedModuleId(module._id); }}
                        >
                          Xem bài học
                        </button>
                        <button
                          className="text-yellow-600 hover:text-yellow-800 p-1"
                          onClick={e => { e.stopPropagation(); setShowModuleForm(true); setEditingModule(module); setModuleTitle(module.title); setModuleDescription(module.description || ""); }}
                          title="Sửa module"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6-6M3 21h18" /></svg>
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 p-1"
                          onClick={e => { e.stopPropagation(); handleDeleteModule(module._id); }}
                          title="Xóa module"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {showModuleForm && (
            <div className="mb-4 p-4 bg-white rounded shadow">
              <h2 className="font-semibold mb-2">{editingModule ? "Sửa module" : "Thêm module"}</h2>
              <input
                className="w-full mb-2 px-3 py-2 border rounded"
                placeholder="Tiêu đề module"
                value={moduleTitle}
                onChange={e => setModuleTitle(e.target.value)}
              />
              <textarea
                className="w-full mb-2 px-3 py-2 border rounded"
                placeholder="Mô tả module"
                value={moduleDescription}
                onChange={e => setModuleDescription(e.target.value)}
              />
              <div className="space-x-2">
                <button
                  className="bg-green-600 text-white px-3 py-1 rounded"
                  onClick={editingModule ? handleEditModule : handleAddModule}
                >
                  {editingModule ? "Cập nhật" : "Thêm"}
                </button>
                <button
                  className="bg-gray-300 px-3 py-1 rounded"
                  onClick={() => {
                    setShowModuleForm(false);
                    setEditingModule(null);
                    setModuleTitle("");
                    setModuleDescription("");
                  }}
                >
                  Hủy
                </button>
              </div>
            </div>
          )}
          {selectedModuleId && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">Danh sách bài học</h2>
                <button
                  className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  onClick={() => { setShowLessonForm(true); setEditingLesson(null); setLessonTitle(""); setLessonContent(""); setLessonType("text"); setLessonDuration(1); setLessonVideoUrl(""); setLessonResources([]); }}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Thêm bài học
                </button>
              </div>
              <ul className="space-y-2">
                {visibleLessons.map((lesson) => (
                  <li key={lesson._id} className="p-3 bg-white rounded shadow flex justify-between items-center hover:bg-green-50 transition-all duration-200">
                    <span className="font-medium text-gray-900">{lesson.title}</span>
                    <div className="flex items-center space-x-2">
                      <button
                        className="text-yellow-600 hover:text-yellow-800 p-1"
                        onClick={() => { setShowLessonForm(true); setEditingLesson(lesson); setLessonTitle(lesson.title); setLessonContent(lesson.content || ""); setLessonType(lesson.type || "text"); setLessonDuration(lesson.duration || 1); setLessonVideoUrl(lesson.videoUrl || ""); setLessonResources(lesson.resources || []); }}
                        title="Sửa bài học"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6-6M3 21h18" /></svg>
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800 p-1"
                        onClick={() => handleDeleteLesson(lesson._id)}
                        title="Xóa bài học"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {showLessonForm && (
            <div className="mb-4 p-4 bg-white rounded shadow">
              <h2 className="font-semibold mb-2">{editingLesson ? "Sửa bài học" : "Thêm bài học"}</h2>
              <input
                className="w-full mb-2 px-3 py-2 border rounded"
                placeholder="Tiêu đề bài học"
                value={lessonTitle}
                onChange={e => setLessonTitle(e.target.value)}
              />
              <textarea
                className="w-full mb-2 px-3 py-2 border rounded"
                placeholder="Nội dung bài học"
                value={lessonContent}
                onChange={e => setLessonContent(e.target.value)}
              />
              <div className="mb-2">
                <label className="block mb-1">Loại bài học:</label>
                <select
                  className="px-3 py-2 border rounded"
                  value={lessonType}
                  onChange={e => setLessonType(e.target.value)}
                >
                  <option value="text">Text</option>
                  <option value="video">Video</option>
                  <option value="interactive">Interactive</option>
                  <option value="quiz">Quiz</option>
                </select>
              </div>
              {lessonType === "video" && (
                <div className="mb-2">
                  <label className="block mb-1">Video URL:</label>
                  <input
                    type="url"
                    className="w-full px-3 py-2 border rounded"
                    placeholder="https://..."
                    value={lessonVideoUrl}
                    onChange={e => setLessonVideoUrl(e.target.value)}
                  />
                </div>
              )}
              <div className="mb-2">
                <label className="block mb-1">Thời lượng (phút):</label>
                <input
                  type="number"
                  min={1}
                  className="px-3 py-2 border rounded"
                  value={lessonDuration}
                  onChange={e => setLessonDuration(Number(e.target.value))}
                />
              </div>
              {/* Resources section */}
              <div className="mb-2">
                <label className="block mb-1">Tài nguyên (tùy chọn):</label>
                <div className="flex gap-2 mb-2">
                  <input
                    className="flex-1 px-2 py-1 border rounded"
                    placeholder="Tiêu đề"
                    value={resourceTitle}
                    onChange={e => setResourceTitle(e.target.value)}
                  />
                  <input
                    className="flex-1 px-2 py-1 border rounded"
                    placeholder="URL"
                    value={resourceUrl}
                    onChange={e => setResourceUrl(e.target.value)}
                  />
                  <select
                    className="px-2 py-1 border rounded"
                    value={resourceType}
                    onChange={e => setResourceType(e.target.value)}
                  >
                    <option value="link">Link</option>
                    <option value="pdf">PDF</option>
                    <option value="doc">DOC</option>
                    <option value="video">Video</option>
                    <option value="audio">Audio</option>
                  </select>
                  <button
                    className="bg-green-500 text-white px-2 py-1 rounded"
                    type="button"
                    onClick={() => {
                      if (!resourceTitle || !resourceUrl) return;
                      setLessonResources([...lessonResources, { title: resourceTitle, url: resourceUrl, type: resourceType }]);
                      setResourceTitle("");
                      setResourceUrl("");
                      setResourceType("link");
                    }}
                  >
                    Thêm
                  </button>
                </div>
                {lessonResources.length > 0 && (
                  <ul className="mb-2">
                    {lessonResources.map((res, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm mb-1">
                        <span className="font-medium">{res.title}</span>
                        <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{res.url}</a>
                        <span className="bg-gray-200 px-2 py-0.5 rounded text-xs">{res.type}</span>
                        <button
                          className="text-red-500 ml-2"
                          type="button"
                          onClick={() => setLessonResources(lessonResources.filter((_, i) => i !== idx))}
                        >
                          Xóa
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="space-x-2">
                <button
                  className="bg-green-600 text-white px-3 py-1 rounded"
                  onClick={editingLesson ? handleEditLesson : handleAddLesson}
                >
                  {editingLesson ? "Cập nhật" : "Thêm"}
                </button>
                <button
                  className="bg-gray-300 px-3 py-1 rounded"
                  onClick={() => {
                    setShowLessonForm(false);
                    setEditingLesson(null);
                    setLessonTitle("");
                    setLessonContent("");
                    setLessonType("text");
                    setLessonDuration(1);
                    setLessonVideoUrl("");
                    setLessonResources([]);
                  }}
                >
                  Hủy
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminModulesLessons; 
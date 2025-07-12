import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { CheckCircleIcon, PlayIcon } from "@heroicons/react/24/outline";

const isYouTubeUrl = (url) => {
  return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\//.test(url || "");
};

const getYouTubeId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const Lesson = () => {
  const { id: courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { api } = useAuth();
  const [course, setCourse] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    fetchCourse();
    fetchEnrollment();
    // eslint-disable-next-line
  }, [courseId, lessonId]);

  const fetchCourse = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/courses/${courseId}`);
      if (res.data.success) {
        setCourse(res.data.data);
        // Find lesson
        const allLessons = res.data.data.modules.flatMap(m => m.lessons || []);
        const found = allLessons.find(l => l._id === lessonId || l._id?.$oid === lessonId);
        setLesson(found);
      }
    } catch (e) {
      toast.error("Không thể tải bài học");
      navigate(`/courses/${courseId}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollment = async () => {
    try {
      const res = await api.get(`/courses/${courseId}/enrollment`);
      if (res.data.success) {
        setEnrollment(res.data.data);
      }
    } catch (e) {
      // Not enrolled yet, which is fine
      setEnrollment(null);
    }
  };

  const handleMarkCompleted = async () => {
    setMarking(true);
    try {
      await api.put(`/courses/${courseId}/progress`, { lessonId });
      toast.success("Đã đánh dấu hoàn thành bài học!");
      fetchEnrollment();
    } catch (e) {
      toast.error("Không thể cập nhật tiến độ");
    } finally {
      setMarking(false);
    }
  };

  const handleNextLesson = () => {
    if (!course) return;
    const allLessons = course.modules.flatMap(m => m.lessons || []);
    const idx = allLessons.findIndex(l => l._id === lessonId || l._id?.$oid === lessonId);
    if (idx >= 0 && idx < allLessons.length - 1) {
      const nextId = typeof allLessons[idx + 1]._id === "string" ? allLessons[idx + 1]._id : allLessons[idx + 1]._id?.$oid;
      navigate(`/courses/${courseId}/lessons/${nextId}`);
    } else {
      navigate(`/courses/${courseId}`);
    }
  };

  if (loading || !lesson || !course) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="spinner"></div></div>;

  // Sidebar data
  const completedLessons = enrollment?.progress?.completedLessons || [];
  const isLessonCompleted = completedLessons.includes(lesson._id) || completedLessons.includes(lesson._id?.$oid);

  return (
    <motion.div className="min-h-screen bg-gray-50 py-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="md:col-span-1 bg-white rounded-lg shadow-md p-4 h-fit sticky top-8">
          <h3 className="font-semibold text-lg mb-4">Nội dung khóa học</h3>
          <div className="space-y-4">
            {course.modules.map((module, mIdx) => (
              <div key={module._id || mIdx}>
                <div className="font-medium text-gray-800 mb-2">{module.title}</div>
                <ul className="space-y-1">
                  {module.lessons.map((l, lIdx) => {
                    const lId = typeof l._id === "string" ? l._id : l._id?.$oid;
                    const isCurrent = lId === lessonId;
                    const done = completedLessons.includes(lId);
                    return (
                      <li key={lId}>
                        <button
                          className={`flex items-center w-full text-left px-2 py-1 rounded transition-colors ${isCurrent ? "bg-green-100 font-semibold" : "hover:bg-gray-100"}`}
                          onClick={() => navigate(`/courses/${courseId}/lessons/${lId}`)}
                        >
                          {done && <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />}
                          {!done && <PlayIcon className="w-4 h-4 text-gray-400 mr-2" />}
                          <span className="truncate">{l.title}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </aside>
        {/* Main Content */}
        <div className="md:col-span-3 bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center mb-4">
            <h1 className="text-2xl font-bold flex items-center">
              {lesson.title}
              {isLessonCompleted && <CheckCircleIcon className="w-6 h-6 text-green-500 ml-2" />}
            </h1>
          </div>
          <div>
          </div>
          {/* Video */}
          {lesson.videoUrl && (
            <div className="mb-6">
              {isYouTubeUrl(lesson.videoUrl) ? (
                <div className="aspect-video w-full rounded overflow-hidden">
                  <iframe
                    src={`https://www.youtube.com/embed/${getYouTubeId(lesson.videoUrl)}`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                </div>
              ) : (
                <video src={lesson.videoUrl} controls className="w-full rounded" />
              )}
            </div>
          )}
          {/* Content */}
          {lesson.content && lesson.content.trim().length >= 20 && (
            <div className="prose mb-6" dangerouslySetInnerHTML={{ __html: lesson.content }} />
          )}
          {/* Fallback for empty lesson */}
          {((!lesson.content || lesson.content.trim().length < 20) && !lesson.videoUrl) && (
            <div className="text-gray-500 italic mb-6">Bài học này chưa có nội dung hoặc video.</div>
          )}
          {/* Resources */}
          {lesson.resources && lesson.resources.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Tài liệu:</h3>
              <ul className="list-disc pl-5">
                {lesson.resources.map((r, i) => (
                  <li key={i}><a href={r.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{r.title}</a></li>
                ))}
              </ul>
            </div>
          )}
          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
            <button onClick={handleMarkCompleted} className="btn-primary" disabled={marking || isLessonCompleted}>{isLessonCompleted ? "Đã hoàn thành" : marking ? "Đang lưu..." : "Đánh dấu hoàn thành"}</button>
            <button onClick={handleNextLesson} className="btn-outline">Bài tiếp theo</button>
            <button onClick={() => navigate(`/courses/${courseId}`)} className="btn-outline">Quay lại khóa học</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Lesson;
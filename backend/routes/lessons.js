const express = require("express");
const router = express.Router();
const Lesson = require("../models/Lesson");
const Course = require("../models/Course");
const UserProgress = require("../models/UserProgress");
const { auth, authorize } = require("../middleware/auth");

// Get lessons for a course
router.get("/course/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;
    const { moduleId } = req.query;
    
    let query = { courseId, isPublished: true };
    if (moduleId) {
      query.moduleId = moduleId;
    }
    
    const lessons = await Lesson.find(query)
      .sort({ order: 1 })
      .populate("prerequisites", "title order")
      .select("-instructorNotes");
    
    // If user is authenticated, check accessibility
    if (req.user) {
      const userProgress = await UserProgress.findByUserAndCourse(req.user._id, courseId);
      
      const lessonsWithAccess = lessons.map(lesson => {
        const lessonObj = lesson.toObject();
        lessonObj.isAccessible = lesson.isAccessibleForUser(userProgress);
        lessonObj.isCompleted = userProgress?.completedLessons?.some(
          completed => completed.lessonId.toString() === lesson._id.toString()
        ) || false;
        return lessonObj;
      });
      
      return res.json({
        success: true,
        data: lessonsWithAccess,
      });
    }
    
    res.json({
      success: true,
      data: lessons,
    });
  } catch (error) {
    console.error("Error fetching lessons:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách bài học",
    });
  }
});

// Get lesson by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id)
      .populate("courseId", "title description")
      .populate("prerequisites", "title order");
    
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài học",
      });
    }
    
    // Check if user has access to this lesson
    const userProgress = await UserProgress.findByUserAndCourse(req.user._id, lesson.courseId._id);
    
    if (!userProgress) {
      return res.status(403).json({
        success: false,
        message: "Bạn chưa đăng ký khóa học này",
      });
    }
    
    const isAccessible = lesson.isAccessibleForUser(userProgress);
    if (!isAccessible && !lesson.isPreview) {
      return res.status(403).json({
        success: false,
        message: "Bạn chưa thể truy cập bài học này. Vui lòng hoàn thành các bài học trước đó.",
      });
    }
    
    // Update current lesson in user progress
    await userProgress.updateCurrentLesson(lesson._id);
    
    // Remove instructor notes for students
    const lessonData = lesson.toObject();
    delete lessonData.instructorNotes;
    
    // Add user-specific data
    lessonData.isCompleted = userProgress.completedLessons?.some(
      completed => completed.lessonId.toString() === lesson._id.toString()
    ) || false;
    
    lessonData.userProgress = userProgress.currentLesson?.lessonId?.toString() === lesson._id.toString()
      ? userProgress.currentLesson
      : null;
    
    res.json({
      success: true,
      data: lessonData,
    });
  } catch (error) {
    console.error("Error fetching lesson:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin bài học",
    });
  }
});

// Update lesson progress
router.post("/:id/progress", auth, async (req, res) => {
  try {
    const { timeSpent, position, completed } = req.body;
    const lessonId = req.params.id;
    
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài học",
      });
    }
    
    let userProgress = await UserProgress.findByUserAndCourse(req.user._id, lesson.courseId);
    if (!userProgress) {
      return res.status(403).json({
        success: false,
        message: "Bạn chưa đăng ký khóa học này",
      });
    }
    
    // Update current lesson position
    await userProgress.updateCurrentLesson(lessonId, position || 0);
    
    // If lesson is completed
    if (completed) {
      await userProgress.completeLesson(lessonId, { timeSpent });
      
      // Update overall course progress
      const totalLessons = await Lesson.countDocuments({ 
        courseId: lesson.courseId, 
        isPublished: true 
      });
      await userProgress.updateProgress(totalLessons);
    }
    
    res.json({
      success: true,
      message: "Cập nhật tiến độ thành công",
      data: {
        progress: userProgress.overallProgress,
        completed: completed || false,
      },
    });
  } catch (error) {
    console.error("Error updating lesson progress:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật tiến độ",
    });
  }
});

// Submit quiz for lesson
router.post("/:id/quiz", auth, async (req, res) => {
  try {
    const { answers } = req.body;
    const lessonId = req.params.id;
    
    const lesson = await Lesson.findById(lessonId);
    if (!lesson || !lesson.quiz || !lesson.quiz.questions.length) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài quiz",
      });
    }
    
    let userProgress = await UserProgress.findByUserAndCourse(req.user._id, lesson.courseId);
    if (!userProgress) {
      return res.status(403).json({
        success: false,
        message: "Bạn chưa đăng ký khóa học này",
      });
    }
    
    // Calculate quiz score
    let correctAnswers = 0;
    const totalQuestions = lesson.quiz.questions.length;
    const detailedAnswers = [];
    
    lesson.quiz.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      let isCorrect = false;
      
      if (question.type === "multiple_choice") {
        const correctOption = question.options.find(opt => opt.isCorrect);
        isCorrect = correctOption && correctOption.text === userAnswer;
      } else if (question.type === "true_false") {
        isCorrect = question.correctAnswer === userAnswer;
      } else if (question.type === "short_answer") {
        isCorrect = question.correctAnswer?.toLowerCase().trim() === userAnswer?.toLowerCase().trim();
      }
      
      if (isCorrect) correctAnswers++;
      
      detailedAnswers.push({
        questionIndex: index,
        selectedAnswer: userAnswer,
        isCorrect,
      });
    });
    
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= lesson.quiz.passingScore;
    
    // Save quiz result
    const quizResult = {
      lessonId,
      score,
      totalQuestions,
      correctAnswers,
      answers: detailedAnswers,
      passed,
    };
    
    userProgress.quizResults.push(quizResult);
    
    // If quiz passed, mark lesson as completed
    if (passed) {
      await userProgress.completeLesson(lessonId, { score });
      
      // Update overall course progress
      const totalLessons = await Lesson.countDocuments({ 
        courseId: lesson.courseId, 
        isPublished: true 
      });
      await userProgress.updateProgress(totalLessons);
    }
    
    await userProgress.save();
    
    res.json({
      success: true,
      message: passed ? "Chúc mừng! Bạn đã vượt qua bài quiz" : "Bạn chưa đạt điểm tối thiểu. Hãy thử lại!",
      data: {
        score,
        correctAnswers,
        totalQuestions,
        passed,
        passingScore: lesson.quiz.passingScore,
        progress: userProgress.overallProgress,
      },
    });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi nộp bài quiz",
    });
  }
});

// Add bookmark
router.post("/:id/bookmark", auth, async (req, res) => {
  try {
    const { timestamp, note } = req.body;
    const lessonId = req.params.id;
    
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài học",
      });
    }
    
    let userProgress = await UserProgress.findByUserAndCourse(req.user._id, lesson.courseId);
    if (!userProgress) {
      return res.status(403).json({
        success: false,
        message: "Bạn chưa đăng ký khóa học này",
      });
    }
    
    await userProgress.addBookmark(lessonId, timestamp, note);
    
    res.json({
      success: true,
      message: "Đã thêm bookmark",
    });
  } catch (error) {
    console.error("Error adding bookmark:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi thêm bookmark",
    });
  }
});

// Get next lesson
router.get("/:id/next", auth, async (req, res) => {
  try {
    const currentLesson = await Lesson.findById(req.params.id);
    if (!currentLesson) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài học",
      });
    }
    
    const nextLesson = await Lesson.findOne({
      courseId: currentLesson.courseId,
      order: { $gt: currentLesson.order },
      isPublished: true,
    }).sort({ order: 1 });
    
    if (!nextLesson) {
      return res.json({
        success: true,
        data: null,
        message: "Đây là bài học cuối cùng",
      });
    }
    
    // Check accessibility
    const userProgress = await UserProgress.findByUserAndCourse(req.user._id, currentLesson.courseId);
    const isAccessible = nextLesson.isAccessibleForUser(userProgress);
    
    res.json({
      success: true,
      data: {
        ...nextLesson.toObject(),
        isAccessible,
      },
    });
  } catch (error) {
    console.error("Error getting next lesson:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy bài học tiếp theo",
    });
  }
});

// Get previous lesson
router.get("/:id/previous", auth, async (req, res) => {
  try {
    const currentLesson = await Lesson.findById(req.params.id);
    if (!currentLesson) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài học",
      });
    }
    
    const previousLesson = await Lesson.findOne({
      courseId: currentLesson.courseId,
      order: { $lt: currentLesson.order },
      isPublished: true,
    }).sort({ order: -1 });
    
    if (!previousLesson) {
      return res.json({
        success: true,
        data: null,
        message: "Đây là bài học đầu tiên",
      });
    }
    
    res.json({
      success: true,
      data: previousLesson,
    });
  } catch (error) {
    console.error("Error getting previous lesson:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy bài học trước đó",
    });
  }
});

// Create lesson (admin only)
router.post("/", auth, authorize("admin"), async (req, res) => {
  try {
    const lesson = new Lesson({
      ...req.body,
      createdBy: req.user._id,
    });
    
    await lesson.save();
    
    // Update course statistics
    const course = await Course.findById(lesson.courseId);
    if (course) {
      await course.updateStats();
    }
    
    res.status(201).json({
      success: true,
      message: "Bài học đã được tạo thành công",
      data: lesson,
    });
  } catch (error) {
    console.error("Error creating lesson:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo bài học",
      error: error.message,
    });
  }
});

// Update lesson (admin only)
router.put("/:id", auth, authorize("admin"), async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastModifiedBy: req.user._id },
      { new: true, runValidators: true }
    );
    
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài học",
      });
    }
    
    // Update course statistics
    const course = await Course.findById(lesson.courseId);
    if (course) {
      await course.updateStats();
    }
    
    res.json({
      success: true,
      message: "Bài học đã được cập nhật thành công",
      data: lesson,
    });
  } catch (error) {
    console.error("Error updating lesson:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật bài học",
      error: error.message,
    });
  }
});

// Delete lesson (admin only)
router.delete("/:id", auth, authorize("admin"), async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndDelete(req.params.id);
    
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài học",
      });
    }
    
    // Update course statistics
    const course = await Course.findById(lesson.courseId);
    if (course) {
      await course.updateStats();
    }
    
    res.json({
      success: true,
      message: "Bài học đã được xóa thành công",
    });
  } catch (error) {
    console.error("Error deleting lesson:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa bài học",
    });
  }
});

module.exports = router;
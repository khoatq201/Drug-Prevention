const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const Lesson = require("../models/Lesson");
const UserProgress = require("../models/UserProgress");
const User = require("../models/User");
const { auth, authorize } = require("../middleware/auth");

// Get all courses with filtering
router.get("/", async (req, res) => {
  try {
    const {
      category,
      level,
      ageGroup,
      language,
      sort = "-createdAt",
      page = 1,
      limit = 12,
      search,
    } = req.query;

    let query = {
      isPublished: true,
      "enrollment.isOpen": true,
    };

    // Only filter by language if specified
    if (language) {
      query.language = language;
    }

    // Apply filters
    if (category) query.category = category;
    if (level) query.level = level;
    if (ageGroup) {
      query.targetAgeGroup = ageGroup;
    } else if (req.user && req.user.ageGroup) {
      // Auto-filter by user's age group if authenticated
      query.targetAgeGroup = req.user.ageGroup;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const skip = (page - 1) * limit;

    const courses = await Course.find(query)
      .select("-modules.quiz")
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Course.countDocuments(query);

    res.json({
      success: true,
      data: courses,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: courses.length,
        totalResults: total,
      },
      filters: {
        category,
        level,
        ageGroup,
        language,
        search,
      },
    });
  } catch (error) {
    console.error("Get courses error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách khóa học",
    });
  }
});

// Get course categories with age group filtering
router.get("/categories", async (req, res) => {
  try {
    const { ageGroup } = req.query;

    let matchConditions = {
      isPublished: true,
      "enrollment.isOpen": true,
    };

    if (ageGroup) {
      matchConditions.targetAgeGroup = ageGroup;
    } else if (req.user && req.user.ageGroup) {
      matchConditions.targetAgeGroup = req.user.ageGroup;
    }

    const categories = await Course.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          avgRating: { $avg: "$ratings.average" },
          levels: { $addToSet: "$level" },
        },
      },
      {
        $project: {
          category: "$_id",
          count: 1,
          avgRating: { $round: ["$avgRating", 2] },
          levels: 1,
          _id: 0,
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Category labels in Vietnamese
    const categoryLabels = {
      drug_awareness: "Nhận thức về ma túy",
      prevention_skills: "Kỹ năng phòng tránh",
      refusal_skills: "Kỹ năng từ chối",
      life_skills: "Kỹ năng sống",
      counseling: "Tư vấn",
      rehabilitation: "Phục hồi",
    };

    const enrichedCategories = categories.map((cat) => ({
      ...cat,
      label: categoryLabels[cat.category] || cat.category,
    }));

    res.json({
      success: true,
      data: enrichedCategories,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh mục khóa học",
    });
  }
});

// Search courses with advanced filtering
router.get("/search", async (req, res) => {
  try {
    const {
      q,
      category,
      level,
      ageGroup,
      minDuration,
      maxDuration,
      isFree,
      hasVideo,
      hasCertificate,
      language = "vi",
      sort = "relevance",
      page = 1,
      limit = 12,
    } = req.query;

    let query = {
      isPublished: true,
      "enrollment.isOpen": true,
      language,
    };

    // Search query
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { tags: { $in: [new RegExp(q, "i")] } },
        { "instructors.firstName": { $regex: q, $options: "i" } },
        { "instructors.lastName": { $regex: q, $options: "i" } },
      ];
    }

    // Filters
    if (category) query.category = category;
    if (level) query.level = level;
    if (ageGroup) {
      query.targetAgeGroup = ageGroup;
    } else if (req.user && req.user.ageGroup) {
      query.targetAgeGroup = req.user.ageGroup;
    }
    if (minDuration) query.duration = { $gte: parseFloat(minDuration) };
    if (maxDuration) {
      query.duration = { ...query.duration, $lte: parseFloat(maxDuration) };
    }
    if (isFree === "true") query["pricing.isFree"] = true;
    if (hasCertificate === "true") query["certificate.isAvailable"] = true;

    // Sorting
    let sortOptions = {};
    switch (sort) {
      case "newest":
        sortOptions = { createdAt: -1 };
        break;
      case "oldest":
        sortOptions = { createdAt: 1 };
        break;
      case "rating":
        sortOptions = { "ratings.average": -1 };
        break;
      case "duration":
        sortOptions = { duration: 1 };
        break;
      case "popularity":
        sortOptions = { "enrollment.currentEnrollment": -1 };
        break;
      default:
        sortOptions = { "ratings.average": -1, createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    const courses = await Course.find(query)
      .select("-modules.quiz")
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Course.countDocuments(query);

    res.json({
      success: true,
      data: courses,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: courses.length,
        totalResults: total,
      },
      searchQuery: q,
      filters: {
        category,
        level,
        ageGroup,
        minDuration,
        maxDuration,
        isFree,
        hasVideo,
        hasCertificate,
      },
    });
  } catch (error) {
    console.error("Search courses error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tìm kiếm khóa học",
    });
  }
});

// Get course enrollment details
router.get("/:id/enrollment", auth, async (req, res) => {
  try {
    const userProgress = await UserProgress.findByUserAndCourse(
      req.user._id,
      req.params.id
    );
    if (!userProgress) {
      return res.status(404).json({
        success: false,
        message: "Bạn chưa đăng ký khóa học này",
      });
    }
    res.json({
      success: true,
      data: userProgress,
    });
  } catch (error) {
    console.error("Get enrollment error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin đăng ký khóa học",
    });
  }
});

// Get course by ID
router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy khóa học",
      });
    }

    if (!course.isPublished) {
      return res.status(404).json({
        success: false,
        message: "Khóa học chưa được xuất bản",
      });
    }

    // Check if user's age group matches course target
    if (req.user && !course.targetAgeGroup.includes(req.user.ageGroup)) {
      return res.status(403).json({
        success: false,
        message: "Khóa học này không dành cho nhóm tuổi của bạn",
      });
    }

    // Get lessons for this course
    const lessons = await Lesson.find({
      courseId: course._id,
      isPublished: true,
    })
      .sort({ order: 1 })
      .select("-content -instructorNotes");

    let courseData = course.toObject();
    courseData.lessons = lessons;

    let userProgress = null;
    if (!req.user) {
      // For non-authenticated users, only show preview lessons
      courseData.lessons = lessons.filter((lesson) => lesson.isPreview);
    } else {
      // Get user progress
      userProgress = await UserProgress.findByUserAndCourse(
        req.user._id,
        course._id
      );

      if (userProgress) {
        // User is enrolled, show all lessons with accessibility info
        courseData.lessons = lessons.map((lesson) => {
          const lessonObj = lesson.toObject();
          lessonObj.isAccessible = lesson.isAccessibleForUser(userProgress);
          lessonObj.isCompleted =
            userProgress.completedLessons?.some(
              (completed) =>
                completed.lessonId.toString() === lesson._id.toString()
            ) || false;
          return lessonObj;
        });
      } else {
        // User not enrolled, show only preview lessons
        courseData.lessons = lessons.filter((lesson) => lesson.isPreview);
      }
    }

    res.json({
      success: true,
      data: courseData,
      canEnroll: course.canEnroll(),
      userEnrolled: !!userProgress,
      userProgress: userProgress
        ? {
            progress: userProgress.overallProgress,
            status: userProgress.status,
            currentLesson: userProgress.currentLesson,
            completedLessons: userProgress.completedLessons.length,
            totalLessons: lessons.length,
          }
        : null,
    });
  } catch (error) {
    console.error("Get course error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin khóa học",
    });
  }
});

// Enroll in course
router.post("/:id/enroll", auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy khóa học",
      });
    }

    // Check if course is available for enrollment
    if (!course.canEnroll()) {
      return res.status(400).json({
        success: false,
        message: "Khóa học hiện không thể đăng ký",
      });
    }

    // Check if user's age group matches course target
    if (!course.targetAgeGroup.includes(req.user.ageGroup)) {
      return res.status(403).json({
        success: false,
        message: "Khóa học này không dành cho nhóm tuổi của bạn",
      });
    }

    // Check if user is already enrolled
    const existingProgress = await UserProgress.findByUserAndCourse(
      req.user._id,
      course._id
    );

    if (existingProgress) {
      return res.status(400).json({
        success: false,
        message: "Bạn đã đăng ký khóa học này rồi",
      });
    }

    // Create user progress record
    const userProgress = new UserProgress({
      userId: req.user._id,
      courseId: course._id,
      status: "enrolled",
    });

    await userProgress.save();

    // Update course enrollment count
    await Course.findByIdAndUpdate(course._id, {
      $inc: { "enrollment.currentEnrollment": 1 },
    });

    res.json({
      success: true,
      message: "Đăng ký khóa học thành công",
      data: userProgress,
    });
  } catch (error) {
    console.error("Enroll course error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi đăng ký khóa học",
    });
  }
});

// // Get user's enrollment status
// router.get("/:id/enrollment", auth, async (req, res) => {
//   try {
//     const userProgress = await UserProgress.findByUserAndCourse(
//       req.user._id,
//       req.params.id
//     );

//     res.json({
//       success: true,
//       data: userProgress,
//     });
//   } catch (error) {
//     console.error("Get enrollment error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Lỗi khi lấy thông tin đăng ký",
//     });
//   }
// });

// Get user's enrolled courses
router.get("/my-courses", auth, async (req, res) => {
  try {
    const { status = "all", page = 1, limit = 10 } = req.query;

    let query = { userId: req.user._id };

    // Filter by status
    if (status === "completed") {
      query.status = "completed";
    } else if (status === "in_progress") {
      query.status = "in_progress";
    } else if (status === "enrolled") {
      query.status = "enrolled";
    }

    // Pagination
    const skip = (page - 1) * limit;

    const enrollments = await UserProgress.find(query)
      .populate(
        "courseId",
        "title description thumbnail category level duration ratings"
      )
      .sort({ lastAccessedAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await UserProgress.countDocuments(query);

    res.json({
      success: true,
      data: enrollments,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: enrollments.length,
        totalResults: total,
      },
    });
  } catch (error) {
    console.error("Get my courses error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách khóa học đã đăng ký",
    });
  }
});

// Create new course (admin only)
router.post("/", auth, authorize("admin"), async (req, res) => {
  try {
    const course = new Course({
      ...req.body,
      createdBy: req.user._id,
      publishedAt: req.body.isPublished ? new Date() : undefined,
    });

    await course.save();

    res.status(201).json({
      success: true,
      message: "Khóa học đã được tạo thành công",
      data: course,
    });
  } catch (error) {
    console.error("Create course error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo khóa học",
      error: error.message,
    });
  }
});

// Update course (admin only)
router.put("/:id", auth, authorize("admin"), async (req, res) => {
  try {
    const updateData = { ...req.body };
    updateData.lastModifiedBy = req.user._id;

    if (req.body.isPublished && !req.body.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const course = await Course.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy khóa học",
      });
    }

    res.json({
      success: true,
      message: "Khóa học đã được cập nhật thành công",
      data: course,
    });
  } catch (error) {
    console.error("Update course error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật khóa học",
      error: error.message,
    });
  }
});

// Delete course (admin only)
router.delete("/:id", auth, authorize("admin"), async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { isPublished: false, "enrollment.isOpen": false },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy khóa học",
      });
    }

    res.json({
      success: true,
      message: "Khóa học đã được xóa thành công",
    });
  } catch (error) {
    console.error("Delete course error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa khóa học",
    });
  }
});

// Get course statistics (staff and above)
router.get("/stats/overview", auth, authorize("staff"), async (req, res) => {
  try {
    const { category, ageGroup, startDate, endDate } = req.query;

    let matchConditions = { isPublished: true };

    if (category) matchConditions.category = category;
    if (ageGroup) matchConditions.targetAgeGroup = ageGroup;
    if (startDate && endDate) {
      matchConditions.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const stats = await Course.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: "$category",
          totalCourses: { $sum: 1 },
          totalEnrollments: { $sum: "$enrollment.currentEnrollment" },
          avgRating: { $avg: "$ratings.average" },
          avgDuration: { $avg: "$duration" },
        },
      },
      {
        $project: {
          category: "$_id",
          totalCourses: 1,
          totalEnrollments: 1,
          avgRating: { $round: ["$avgRating", 2] },
          avgDuration: { $round: ["$avgDuration", 2] },
          _id: 0,
        },
      },
    ]);

    const totalCourses = await Course.countDocuments(matchConditions);
    const totalEnrollments = await Course.aggregate([
      { $match: matchConditions },
      {
        $group: { _id: null, total: { $sum: "$enrollment.currentEnrollment" } },
      },
    ]);

    res.json({
      success: true,
      data: {
        totalCourses,
        totalEnrollments: totalEnrollments[0]?.total || 0,
        categoryStats: stats,
      },
    });
  } catch (error) {
    console.error("Get course stats error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thống kê khóa học",
    });
  }
});

module.exports = router;

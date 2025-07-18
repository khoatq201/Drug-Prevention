const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Course = require("../models/Course");
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
      isVisible: { $ne: false },
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
      .select("-modules.lessons.content -modules.quiz")
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
      isVisible: { $ne: false },
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
      isVisible: { $ne: false },
    };

    // Search query
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { tags: { $in: [new RegExp(q, "i")] } },
        { "instructors.name": { $regex: q, $options: "i" } },
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
    if (hasVideo === "true") query["modules.lessons.type"] = "video";
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
      .select("-modules.lessons.content -modules.quiz")
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
  console.log("Reached /:id/enrollment endpoint with courseId:", req.params.id);
  try {
    const courseId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "ID khóa học không hợp lệ",
      });
    }
    const enrollment = req.user.courseHistory.find(
      (enroll) => enroll.courseId.toString() === courseId
    );
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Bạn chưa đăng ký khóa học này",
      });
    }
    // Return progress.completedLessons and percent
    res.json({
      success: true,
      data: {
        ...enrollment.toObject ? enrollment.toObject() : enrollment,
        progress: enrollment.progress || { completedLessons: [], percent: 0 },
      },
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
    let course = await Course.findById(req.params.id);

    if (!course || course.isVisible === false) {
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

    // Hide detailed lesson content for non-enrolled users
    let courseData = course.toObject();
    courseData = filterVisibleCourse(courseData);
    
    if (!req.user) {
      // For non-authenticated users, only show basic info
      courseData.modules = courseData.modules.map(module => ({
        ...module,
        lessons: module.lessons.map(lesson => ({
          _id: lesson._id,
          title: lesson.title,
          type: lesson.type,
          duration: lesson.duration,
          order: lesson.order,
          content: lesson.content,
          videoUrl: lesson.videoUrl,
          resources: lesson.resources,
        })),
        quiz: undefined,
      }));
    } else {
      // Check if user is enrolled
      const userEnrolled = req.user.courseHistory.some(
        (enrollment) => enrollment.courseId.toString() === course._id.toString()
      );
      
      if (!userEnrolled) {
        // Show preview content only
        courseData.modules = courseData.modules.map(module => ({
          ...module,
          lessons: module.lessons.map((lesson, index) => ({
            _id: lesson._id,
            title: lesson.title,
            type: lesson.type,
            duration: lesson.duration,
            order: lesson.order,
            content: index === 0 ? lesson.content : "Nội dung khóa học. Đăng ký để xem chi tiết.",
            videoUrl: lesson.videoUrl,
            resources: lesson.resources,
          })),
          quiz: undefined,
        }));
      }
    }

    res.json({
      success: true,
      data: courseData,
      canEnroll: course.canEnroll(),
      userEnrolled: req.user 
        ? req.user.courseHistory.some(
            (enrollment) => enrollment.courseId.toString() === course._id.toString()
          )
        : false,
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
    const alreadyEnrolled = req.user.courseHistory.some(
      (enrollment) => enrollment.courseId.toString() === course._id.toString()
    );

    if (alreadyEnrolled) {
      return res.status(400).json({
        success: false,
        message: "Bạn đã đăng ký khóa học này rồi",
      });
    }

    // Enroll user
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        courseHistory: {
          courseId: course._id,
          enrolledAt: new Date(),
          progress: 0,
        },
      },
    });

    // Update course enrollment count
    await Course.findByIdAndUpdate(course._id, {
      $inc: { "enrollment.currentEnrollment": 1 },
    });

    res.json({
      success: true,
      message: "Đăng ký khóa học thành công",
    });
  } catch (error) {
    console.error("Enroll course error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi đăng ký khóa học",
    });
  }
});

// Update course progress
router.put("/:id/progress", auth, async (req, res) => {
  try {
    const { lessonId } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy khóa học",
      });
    }
    // Check if user is enrolled
    const enrollment = req.user.courseHistory.find(
      (enrollment) => enrollment.courseId.toString() === course._id.toString()
    );
    if (!enrollment) {
      return res.status(400).json({
        success: false,
        message: "Bạn chưa đăng ký khóa học này",
      });
    }
    // Add lessonId to completedLessons if not already present
    if (!enrollment.progress) enrollment.progress = { completedLessons: [], percent: 0 };
    if (!enrollment.progress.completedLessons) enrollment.progress.completedLessons = [];
    if (!enrollment.progress.completedLessons.includes(lessonId)) {
      enrollment.progress.completedLessons.push(lessonId);
    }
    enrollment.progress.lastLesson = lessonId;
    // Calculate percent progress
    const totalLessons = course.modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
    const completedCount = enrollment.progress.completedLessons.length;
    enrollment.progress.percent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
    // Mark completedAt if all lessons done
    if (completedCount === totalLessons && totalLessons > 0) {
      enrollment.completedAt = new Date();
    }
    // Save user
    await req.user.save();
    res.json({
      success: true,
      message: "Tiến độ đã được cập nhật",
      progress: enrollment.progress,
    });
  } catch (error) {
    console.error("Update progress error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật tiến độ",
    });
  }
});

// Get user's enrolled courses
router.get("/user/:userId/enrolled", auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { status = "all", page = 1, limit = 10 } = req.query;
    // Check if user can access this information
    if (req.user._id.toString() !== userId && !req.user.hasPermission("staff")) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền truy cập thông tin này",
      });
    }
    console.log("Fetching enrolled courses for userId:", userId);
    const user = await User.findById(userId).populate({
      path: "courseHistory.courseId",
      select: "title description thumbnail category level duration ratings modules isVisible",
    });
    if (!user) {
      console.error("User not found for userId:", userId);
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }
    let courseHistory = user.courseHistory;
    console.log("courseHistory after population:", JSON.stringify(courseHistory, null, 2));
    // Filter out entries with missing courseId (e.g., deleted courses)
    courseHistory = courseHistory.filter(entry => entry.courseId);
    console.log("courseHistory after filtering null courseId:", JSON.stringify(courseHistory, null, 2));
    // Filter by status
    if (status === "completed") {
      courseHistory = courseHistory.filter(course => course.completedAt);
    } else if (status === "in_progress") {
      courseHistory = courseHistory.filter(course => !course.completedAt && (course.progress?.percent > 0));
    } else if (status === "not_started") {
      courseHistory = courseHistory.filter(course => (course.progress?.percent || 0) === 0);
    }
    // Pagination
    const skip = (page - 1) * limit;
    const paginatedCourses = courseHistory.slice(skip, skip + parseInt(limit));
    // Return progress.completedLessons and percent for each course
    const data = paginatedCourses.map(enrollment => ({
      ...enrollment.toObject ? enrollment.toObject() : enrollment,
      progress: enrollment.progress || { completedLessons: [], percent: 0 },
    }));
    res.json({
      success: true,
      data,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(courseHistory.length / limit),
        count: paginatedCourses.length,
        totalResults: courseHistory.length,
      },
    });
  } catch (error) {
    console.error("Get enrolled courses error:", error, error?.stack);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách khóa học đã đăng ký",
      error: error?.message,
    });
  }
});

// Create new course (admin only)
router.post("/", auth, authorize("admin"), async (req, res) => {
  try {
    const course = new Course({
      ...req.body,
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
    
    if (req.body.isPublished && !req.body.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

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
    const course = await Course.findById(req.params.id);
    if (!course || course.isVisible === false) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy khóa học",
      });
    }
    // Check for visible modules
    const hasVisibleModules = (course.modules || []).some(m => m.isVisible !== false);
    if (hasVisibleModules) {
      return res.status(400).json({
        success: false,
        message: "Không thể xóa khóa học khi vẫn còn module. Hãy xóa tất cả module trước.",
      });
    }
    // Soft delete: set isVisible to false, isPublished to false, enrollment.isOpen to false
    course.isVisible = false;
    course.isPublished = false;
    course.enrollment.isOpen = false;
    await course.save();
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
      { $group: { _id: null, total: { $sum: "$enrollment.currentEnrollment" } } },
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

// Admin: Get all courses (published and unpublished) with filtering and pagination
router.get("/admin/all", auth, authorize("admin"), async (req, res) => {
  try {
    const {
      category,
      level,
      ageGroup,
      language,
      sort = "-createdAt",
      page = 1,
      limit = 20,
      search,
      isPublished,
    } = req.query;

    let query = { isVisible: { $ne: false } };
    if (language) query.language = language;
    if (category) query.category = category;
    if (level) query.level = level;
    if (ageGroup) query.targetAgeGroup = ageGroup;
    if (typeof isPublished !== "undefined" && isPublished !== "") {
      query.isPublished = isPublished === "true";
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }
    const skip = (page - 1) * limit;
    const courses = await Course.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);
    const total = await Course.countDocuments(query);
    // Filter modules/lessons for visibility
    const filteredCourses = courses.map(c => filterVisibleCourse(c.toObject ? c.toObject() : c));
    res.json({
      success: true,
      data: filteredCourses,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: filteredCourses.length,
        totalResults: total,
      },
      filters: {
        category,
        level,
        ageGroup,
        language,
        search,
        isPublished,
      },
    });
  } catch (error) {
    console.error("Admin get all courses error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách khóa học (admin)",
    });
  }
});

// Admin: Add a module to a course
router.post("/:id/modules", auth, authorize("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, order } = req.body;
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ success: false, message: "Không tìm thấy khóa học" });
    const newModule = { title, description, order, lessons: [], quiz: { questions: [] } };
    course.modules.push(newModule);
    await course.save();
    res.status(201).json({ success: true, message: "Đã thêm module", data: course.modules[course.modules.length - 1] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi khi thêm module", error: error.message });
  }
});

// Admin: Edit a module in a course
router.put("/:id/modules/:moduleId", auth, authorize("admin"), async (req, res) => {
  try {
    const { id, moduleId } = req.params;
    const { title, description, order } = req.body;
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ success: false, message: "Không tìm thấy khóa học" });
    const module = course.modules.id(moduleId);
    if (!module) return res.status(404).json({ success: false, message: "Không tìm thấy module" });
    if (title !== undefined) module.title = title;
    if (description !== undefined) module.description = description;
    if (order !== undefined) module.order = order;
    await course.save();
    res.json({ success: true, message: "Đã cập nhật module", data: module });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi khi cập nhật module", error: error.message });
  }
});

// Admin: Delete a module from a course (soft delete)
router.delete("/:id/modules/:moduleId", auth, authorize("admin"), async (req, res) => {
  try {
    const { id, moduleId } = req.params;
    const course = await Course.findById(id);
    if (!course || course.isVisible === false) return res.status(404).json({ success: false, message: "Không tìm thấy khóa học" });
    const module = course.modules.id(moduleId);
    if (!module || module.isVisible === false) return res.status(404).json({ success: false, message: "Không tìm thấy module" });
    // Check for visible lessons
    const hasVisibleLessons = (module.lessons || []).some(l => l.isVisible !== false);
    if (hasVisibleLessons) {
      return res.status(400).json({
        success: false,
        message: "Không thể xóa module khi vẫn còn bài học. Hãy xóa tất cả bài học trước.",
      });
    }
    module.isVisible = false;
    await course.save();
    res.json({ success: true, message: "Đã xóa module" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi khi xóa module", error: error.message });
  }
});

// Admin: Reorder modules in a course
router.put("/:id/modules/reorder", auth, authorize("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { moduleOrder } = req.body; // array of module IDs in new order
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ success: false, message: "Không tìm thấy khóa học" });
    if (!Array.isArray(moduleOrder)) return res.status(400).json({ success: false, message: "moduleOrder phải là mảng" });
    // Reorder modules
    course.modules = moduleOrder.map(id => course.modules.id(id)).filter(Boolean);
    await course.save();
    res.json({ success: true, message: "Đã sắp xếp lại module", data: course.modules });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi khi sắp xếp module", error: error.message });
  }
});

// Admin: Add a lesson to a module in a course
router.post("/:id/modules/:moduleId/lessons", auth, authorize("admin"), async (req, res) => {
  try {
    const { id, moduleId } = req.params;
    const lessonData = req.body;
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ success: false, message: "Không tìm thấy khóa học" });
    const module = course.modules.id(moduleId);
    if (!module) return res.status(404).json({ success: false, message: "Không tìm thấy module" });
    module.lessons.push(lessonData);
    await course.save();
    res.status(201).json({ success: true, message: "Đã thêm bài học", data: module.lessons[module.lessons.length - 1] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi khi thêm bài học", error: error.message });
  }
});

// Admin: Edit a lesson in a module
router.put("/:id/modules/:moduleId/lessons/:lessonId", auth, authorize("admin"), async (req, res) => {
  try {
    const { id, moduleId, lessonId } = req.params;
    const lessonData = req.body;
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ success: false, message: "Không tìm thấy khóa học" });
    const module = course.modules.id(moduleId);
    if (!module) return res.status(404).json({ success: false, message: "Không tìm thấy module" });
    const lesson = module.lessons.id(lessonId);
    if (!lesson) return res.status(404).json({ success: false, message: "Không tìm thấy bài học" });
    Object.assign(lesson, lessonData);
    await course.save();
    res.json({ success: true, message: "Đã cập nhật bài học", data: lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi khi cập nhật bài học", error: error.message });
  }
});

// Admin: Delete a lesson from a module (soft delete)
router.delete("/:id/modules/:moduleId/lessons/:lessonId", auth, authorize("admin"), async (req, res) => {
  try {
    const { id, moduleId, lessonId } = req.params;
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ success: false, message: "Không tìm thấy khóa học" });
    const module = course.modules.id(moduleId);
    if (!module) return res.status(404).json({ success: false, message: "Không tìm thấy module" });
    const lesson = module.lessons.id(lessonId);
    if (!lesson) return res.status(404).json({ success: false, message: "Không tìm thấy bài học" });
    lesson.isVisible = false;
    await course.save();
    res.json({ success: true, message: "Đã xóa bài học" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi khi xóa bài học", error: error.message });
  }
});

// Admin: Reorder lessons in a module
router.put("/:id/modules/:moduleId/lessons/reorder", auth, authorize("admin"), async (req, res) => {
  try {
    const { id, moduleId } = req.params;
    const { lessonOrder } = req.body; // array of lesson IDs in new order
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ success: false, message: "Không tìm thấy khóa học" });
    const module = course.modules.id(moduleId);
    if (!module) return res.status(404).json({ success: false, message: "Không tìm thấy module" });
    if (!Array.isArray(lessonOrder)) return res.status(400).json({ success: false, message: "lessonOrder phải là mảng" });
    module.lessons = lessonOrder.map(id => module.lessons.id(id)).filter(Boolean);
    await course.save();
    res.json({ success: true, message: "Đã sắp xếp lại bài học", data: module.lessons });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi khi sắp xếp bài học", error: error.message });
  }
});

// Filter out invisible items utility
function filterVisibleCourse(course) {
  if (!course) return course;
  // Filter modules
  course.modules = (course.modules || []).filter(m => m.isVisible !== false).map(module => ({
    ...module.toObject ? module.toObject() : module,
    lessons: (module.lessons || []).filter(l => l.isVisible !== false),
  }));
  return course;
}

module.exports = router;
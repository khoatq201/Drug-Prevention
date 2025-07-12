const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Course = require("../models/Course");
const Assessment = require("../models/Assessment");
const Appointment = require("../models/Appointment");
const { auth, authorize } = require("../middleware/auth");

// @route   GET /api/users
// @desc    Get all users with filtering and pagination (manager and above)
// @access  Private
router.get("/", auth, authorize("manager"), async (req, res) => {
  try {
    const {
      role,
      ageGroup,
      isActive,
      search,
      page = 1,
      limit = 20,
      sort = "-createdAt",
    } = req.query;

    let query = {};

    // Apply filters
    if (role) query.role = role;
    if (ageGroup) query.ageGroup = ageGroup;
    if (isActive !== undefined && isActive !== "") query.isActive = isActive === "true";

    // Search functionality
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    // Sort options
    let sortOptions = {};
    switch (sort) {
      case "name":
        sortOptions = { firstName: 1, lastName: 1 };
        break;
      case "email":
        sortOptions = { email: 1 };
        break;
      case "role":
        sortOptions = { role: 1 };
        break;
      case "oldest":
        sortOptions = { createdAt: 1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    const users = await User.find(query)
      .select("-password")
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: users.length,
        totalResults: total,
      },
      filters: {
        role,
        ageGroup,
        isActive,
        search,
        sort,
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách người dùng",
    });
  }
});

// @route   GET /api/users/stats
// @desc    Get current user's personal statistics
// @access  Private
router.get("/stats", auth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get AssessmentResult model
    const AssessmentResult = Assessment.AssessmentResult;

    // Get user with populated courseHistory and assessmentHistory
    const user = await User.findById(userId)
      .populate('courseHistory.courseId', 'title description thumbnail')
      .populate('assessmentHistory')
      .populate('appointmentHistory');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng"
      });
    }

    // Get additional data in parallel
    const [assessmentResults, appointmentsData] = await Promise.all([
      AssessmentResult.find({ userId }).sort({ completedAt: -1 }),
      Appointment.find({ userId })
    ]);

    // Calculate course stats from User.courseHistory
    const coursesEnrolled = user.courseHistory.length;
    const coursesCompleted = user.courseHistory.filter(course => 
      course.completedAt !== null && course.completedAt !== undefined
    ).length;

    // Calculate assessment stats from User.assessmentHistory
    const assessmentsCompleted = user.assessmentHistory.length;
    
    // Calculate total score from recent assessments (last 3)
    const recentAssessments = user.assessmentHistory.slice(-3);
    const totalScore = recentAssessments.reduce((sum, assessment) => {
      return sum + (assessment.score || 0);
    }, 0);

    // Calculate appointment stats
    const upcomingAppointments = appointmentsData.filter(apt => {
      const appointmentDate = new Date(apt.appointmentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return appointmentDate >= today && (apt.status === 'pending' || apt.status === 'confirmed');
    }).length;

    // Calculate average progress from courseHistory
    const averageProgress = user.courseHistory.length > 0 
      ? Math.round(user.courseHistory.reduce((sum, course) => sum + (course.progress || 0), 0) / user.courseHistory.length)
      : 0;

    const stats = {
      assessmentsCompleted,
      coursesEnrolled,
      coursesCompleted,
      upcomingAppointments,
      totalScore,
      averageProgress,
      // Additional detailed stats from User model
      courseProgress: user.courseHistory.map(course => ({
        courseId: course.courseId,
        title: course.courseId?.title || 'Unknown Course',
        progress: course.progress || 0,
        enrolledAt: course.enrolledAt,
        completedAt: course.completedAt,
        certificateUrl: course.certificateUrl
      })),
      recentAssessments: recentAssessments.map(assessment => ({
        assessmentType: assessment.assessmentType,
        score: assessment.score || 0,
        riskLevel: assessment.riskLevel || 'unknown',
        completedAt: assessment.completedAt
      })),
      // Additional user stats
      currentRiskLevel: user.getCurrentRiskLevel(),
      accountAge: Math.floor((new Date() - user.createdAt) / (1000 * 60 * 60 * 24)), // days
      lastLogin: user.lastLogin
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thống kê người dùng"
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check permissions - users can only see their own profile or staff can see others
    if (req.user._id.toString() !== id && !req.user.hasPermission("staff")) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền xem thông tin này",
      });
    }

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    // Get user statistics for staff and above
    let userStats = null;
    if (req.user.hasPermission("staff")) {
      const [courseCount, assessmentCount, appointmentCount] = await Promise.all([
        Course.countDocuments({
          "enrollments.userId": id,
        }),
        Assessment.countDocuments({
          userId: id,
        }),
        Appointment.countDocuments({
          userId: id,
        }),
      ]);

      userStats = {
        totalCourses: courseCount,
        totalAssessments: assessmentCount,
        totalAppointments: appointmentCount,
        lastLogin: user.lastLogin,
        accountAge: Math.floor(
          (new Date() - user.createdAt) / (1000 * 60 * 60 * 24)
        ),
      };
    }

    res.json({
      success: true,
      data: user,
      statistics: userStats,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin người dùng",
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user information
// @access  Private
router.put("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check permissions - users can only update their own profile or staff can update others
    if (req.user._id.toString() !== id && !req.user.hasPermission("staff")) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền chỉnh sửa thông tin này",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    // Define allowed fields based on user permissions
    let allowedFields = [
      "firstName",
      "lastName",
      "phone",
      "dateOfBirth",
      "gender",
      "avatar",
      "preferences",
    ];

    // Staff and above can update additional fields
    if (req.user.hasPermission("staff")) {
      allowedFields.push("ageGroup");
    }

    // Manager and above can update role and status
    if (req.user.hasPermission("manager")) {
      allowedFields.push("role", "isActive");
    }

    // Admin can update email verification
    if (req.user.hasPermission("admin")) {
      allowedFields.push("isEmailVerified");
    }

    // Filter update data to only allowed fields
    const updateData = {};
    Object.keys(req.body).forEach((key) => {
      if (allowedFields.includes(key)) {
        updateData[key] = req.body[key];
      }
    });

    // Role validation - cannot upgrade to higher than current user's role
    if (updateData.role && !req.user.hasPermission("admin")) {
      const userRoleHierarchy = ["guest", "member", "staff", "consultant", "manager", "admin"];
      const currentUserRoleIndex = userRoleHierarchy.indexOf(req.user.role);
      const targetRoleIndex = userRoleHierarchy.indexOf(updateData.role);

      if (targetRoleIndex >= currentUserRoleIndex) {
        return res.status(403).json({
          success: false,
          message: "Không thể cấp quyền cao hơn quyền hiện tại của bạn",
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    res.json({
      success: true,
      message: "Thông tin người dùng đã được cập nhật thành công",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update user error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ",
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật thông tin người dùng",
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Deactivate user account (admin only)
// @access  Private
router.delete("/:id", auth, authorize("admin"), async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user._id.toString() === id) {
      return res.status(400).json({
        success: false,
        message: "Không thể vô hiệu hóa tài khoản của chính mình",
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    res.json({
      success: true,
      message: "Tài khoản người dùng đã được vô hiệu hóa",
      data: user,
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi vô hiệu hóa tài khoản",
    });
  }
});

// @route   GET /api/users/:id/courses
// @desc    Get user's enrolled courses
// @access  Private
router.get("/:id/courses", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    // Check permissions
    if (req.user._id.toString() !== id && !req.user.hasPermission("staff")) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền xem thông tin này",
      });
    }

    let query = { "enrollments.userId": id };
    if (status) {
      query[`enrollments.$.status`] = status;
    }

    const skip = (page - 1) * limit;

    const courses = await Course.find(query)
      .select("title description level duration category enrollments.$")
      .limit(parseInt(limit))
      .skip(skip);

    // Filter and format enrollment data
    const userCourses = courses.map((course) => {
      const enrollment = course.enrollments.find(
        (e) => e.userId.toString() === id
      );
      return {
        course: {
          _id: course._id,
          title: course.title,
          description: course.description,
          level: course.level,
          duration: course.duration,
          category: course.category,
        },
        enrollment: enrollment || null,
      };
    });

    const total = await Course.countDocuments(query);

    res.json({
      success: true,
      data: userCourses,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: userCourses.length,
        totalResults: total,
      },
    });
  } catch (error) {
    console.error("Get user courses error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy khóa học của người dùng",
    });
  }
});

// @route   GET /api/users/:id/assessments
// @desc    Get user's assessment results
// @access  Private
router.get("/:id/assessments", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { type, page = 1, limit = 10 } = req.query;

    // Check permissions
    if (req.user._id.toString() !== id && !req.user.hasPermission("staff")) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền xem thông tin này",
      });
    }

    let query = { userId: id };
    if (type) {
      query.assessmentType = type;
    }

    const skip = (page - 1) * limit;

    const assessments = await Assessment.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Assessment.countDocuments(query);

    res.json({
      success: true,
      data: assessments,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: assessments.length,
        totalResults: total,
      },
    });
  } catch (error) {
    console.error("Get user assessments error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy kết quả đánh giá của người dùng",
    });
  }
});

// @route   GET /api/users/:id/appointments
// @desc    Get user's appointments
// @access  Private
router.get("/:id/appointments", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    // Check permissions
    if (req.user._id.toString() !== id && !req.user.hasPermission("staff")) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền xem thông tin này",
      });
    }

    let query = { userId: id };
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const appointments = await Appointment.find(query)
      .populate("counselorId", "firstName lastName")
      .sort({ appointmentDate: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Appointment.countDocuments(query);

    res.json({
      success: true,
      data: appointments,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: appointments.length,
        totalResults: total,
      },
    });
  } catch (error) {
    console.error("Get user appointments error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy lịch hẹn của người dùng",
    });
  }
});

// @route   GET /api/users/stats/overview
// @desc    Get user statistics overview (manager and above)
// @access  Private
router.get("/stats/overview", auth, authorize("manager"), async (req, res) => {
  try {
    const { startDate, endDate, role, ageGroup } = req.query;

    let matchConditions = {};

    if (startDate && endDate) {
      matchConditions.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (role) matchConditions.role = role;
    if (ageGroup) matchConditions.ageGroup = ageGroup;

    const stats = await User.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: {
            $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
          },
          verifiedUsers: {
            $sum: { $cond: [{ $eq: ["$isEmailVerified", true] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          totalUsers: 1,
          activeUsers: 1,
          verifiedUsers: 1,
          inactiveUsers: { $subtract: ["$totalUsers", "$activeUsers"] },
          verificationRate: {
            $round: [
              {
                $multiply: [
                  { $divide: ["$verifiedUsers", "$totalUsers"] },
                  100,
                ],
              },
              2,
            ],
          },
          _id: 0,
        },
      },
    ]);

    const roleStats = await User.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          role: "$_id",
          count: 1,
          _id: 0,
        },
      },
      { $sort: { count: -1 } },
    ]);

    const ageGroupStats = await User.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: "$ageGroup",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          ageGroup: "$_id",
          count: 1,
          _id: 0,
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {},
        roleBreakdown: roleStats,
        ageGroupBreakdown: ageGroupStats,
      },
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thống kê người dùng",
    });
  }
});

// ==================== ADMIN CRUD ROUTES ====================

// @route   GET /api/users/admin/all
// @desc    Get all users for admin (with pagination and filtering)
// @access  Private (Admin only)
router.get("/admin/all", auth, authorize("admin"), async (req, res) => {
  try {
    const {
      role,
      ageGroup,
      isActive,
      isEmailVerified,
      search,
      page = 1,
      limit = 20,
      sort = "-createdAt",
    } = req.query;

    let query = {};

    // Apply filters
    if (role) query.role = role;
    if (ageGroup) query.ageGroup = ageGroup;
    if (isActive !== undefined && isActive !== "") query.isActive = isActive === "true";
    if (isEmailVerified !== undefined && isEmailVerified !== "") query.isEmailVerified = isEmailVerified === "true";

    // Search functionality
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    // Sort options
    let sortOptions = {};
    switch (sort) {
      case "name":
        sortOptions = { firstName: 1, lastName: 1 };
        break;
      case "email":
        sortOptions = { email: 1 };
        break;
      case "role":
        sortOptions = { role: 1 };
        break;
      case "oldest":
        sortOptions = { createdAt: 1 };
        break;
      case "lastLogin":
        sortOptions = { lastLogin: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    const users = await User.find(query)
      .select("-password")
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: users.length,
        totalResults: total,
      },
      filters: {
        role,
        ageGroup,
        isActive,
        isEmailVerified,
        search,
        sort,
      },
    });
  } catch (error) {
    console.error("Admin get users error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách người dùng",
    });
  }
});

// @route   POST /api/users/admin/create
// @desc    Create new user (Admin only)
// @access  Private (Admin only)
router.post("/admin/create", auth, authorize("admin"), async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      dateOfBirth,
      gender,
      role,
      ageGroup,
      isActive,
      isEmailVerified,
    } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email đã tồn tại trong hệ thống",
      });
    }

    // Create user object
    const userData = {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      gender,
      role: role || "member",
      ageGroup,
      isActive: isActive !== undefined ? isActive : true,
      isEmailVerified: isEmailVerified !== undefined ? isEmailVerified : false,
    };

    // Add password if provided
    if (password) {
      userData.password = password;
    }

    const user = new User(userData);
    await user.save();

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: "Tạo người dùng thành công",
      data: userResponse,
    });
  } catch (error) {
    console.error("Admin create user error:", error);
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ",
        errors,
      });
    }
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo người dùng",
    });
  }
});

// @route   PUT /api/users/admin/:id
// @desc    Update user by admin
// @access  Private (Admin only)
router.put("/admin/:id", auth, authorize("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      dateOfBirth,
      gender,
      role,
      ageGroup,
      isActive,
      isEmailVerified,
    } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email đã tồn tại trong hệ thống",
        });
      }
    }

    // Update fields
    const updateData = {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      gender,
      role,
      ageGroup,
      isActive,
      isEmailVerified,
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Handle password update separately
    if (password) {
      user.password = password;
    }

    // Update user
    Object.assign(user, updateData);
    await user.save();

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: "Cập nhật người dùng thành công",
      data: userResponse,
    });
  } catch (error) {
    console.error("Admin update user error:", error);
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ",
        errors,
      });
    }
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật người dùng",
    });
  }
});

// @route   DELETE /api/users/admin/:id
// @desc    Delete user by admin (soft delete)
// @access  Private (Admin only)
router.delete("/admin/:id", auth, authorize("admin"), async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (req.user._id.toString() === id) {
      return res.status(400).json({
        success: false,
        message: "Không thể xóa tài khoản của chính mình",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    // Soft delete by setting isActive to false
    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: "Xóa người dùng thành công",
    });
  } catch (error) {
    console.error("Admin delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa người dùng",
    });
  }
});

// @route   POST /api/users/admin/:id/restore
// @desc    Restore deleted user by admin
// @access  Private (Admin only)
router.post("/admin/:id/restore", auth, authorize("admin"), async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    // Restore user by setting isActive to true
    user.isActive = true;
    await user.save();

    res.json({
      success: true,
      message: "Khôi phục người dùng thành công",
    });
  } catch (error) {
    console.error("Admin restore user error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi khôi phục người dùng",
    });
  }
});

// @route   GET /api/users/admin/stats
// @desc    Get user statistics for admin dashboard
// @access  Private (Admin only)
router.get("/admin/stats", auth, authorize("admin"), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let matchConditions = {};

    if (startDate && endDate) {
      matchConditions.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const stats = await User.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: {
            $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
          },
          verifiedUsers: {
            $sum: { $cond: [{ $eq: ["$isEmailVerified", true] }, 1, 0] },
          },
          newUsersThisMonth: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$createdAt", new Date(new Date().getFullYear(), new Date().getMonth(), 1)] },
                    { $lte: ["$createdAt", new Date()] }
                  ]
                },
                1,
                0
              ]
            }
          }
        },
      },
      {
        $project: {
          totalUsers: 1,
          activeUsers: 1,
          verifiedUsers: 1,
          inactiveUsers: { $subtract: ["$totalUsers", "$activeUsers"] },
          newUsersThisMonth: 1,
          verificationRate: {
            $round: [
              {
                $multiply: [
                  { $divide: ["$verifiedUsers", "$totalUsers"] },
                  100,
                ],
              },
              2,
            ],
          },
          _id: 0,
        },
      },
    ]);

    const roleStats = await User.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          role: "$_id",
          count: 1,
          _id: 0,
        },
      },
      { $sort: { count: -1 } },
    ]);

    const ageGroupStats = await User.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: "$ageGroup",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          ageGroup: "$_id",
          count: 1,
          _id: 0,
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Get recent registrations
    const recentUsers = await User.find()
      .select("firstName lastName email role createdAt")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {},
        roleBreakdown: roleStats,
        ageGroupBreakdown: ageGroupStats,
        recentUsers,
      },
    });
  } catch (error) {
    console.error("Admin get stats error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thống kê",
    });
  }
});

module.exports = router;

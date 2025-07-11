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
    if (isActive !== undefined) query.isActive = isActive === "true";

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

// @route   GET /api/users/stats
// @desc    Get current user's personal statistics
// @access  Private
router.get("/stats", auth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's stats in parallel
    const [assessmentsCompleted, coursesData, appointmentsData] = await Promise.all([
      Assessment.countDocuments({ userId }),
      Course.find({ "enrollments.userId": userId }).select("enrollments"),
      Appointment.find({ userId })
    ]);

    // Calculate course stats
    let coursesEnrolled = 0;
    let coursesCompleted = 0;
    
    coursesData.forEach(course => {
      const userEnrollment = course.enrollments.find(e => e.userId.toString() === userId.toString());
      if (userEnrollment) {
        coursesEnrolled++;
        if (userEnrollment.status === 'completed') {
          coursesCompleted++;
        }
      }
    });

    // Calculate appointment stats
    const upcomingAppointments = appointmentsData.filter(apt => {
      const appointmentDate = new Date(apt.appointmentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return appointmentDate >= today && (apt.status === 'pending' || apt.status === 'confirmed');
    }).length;

    // Get recent assessment scores for total score calculation
    const recentAssessments = await Assessment.find({ userId })
      .sort({ completedAt: -1 })
      .limit(3);
    
    let totalScore = 0;
    if (recentAssessments.length > 0) {
      totalScore = recentAssessments.reduce((sum, assessment) => {
        return sum + (assessment.score?.total || 0);
      }, 0);
    }

    const stats = {
      assessmentsCompleted,
      coursesEnrolled,
      coursesCompleted,
      upcomingAppointments,
      totalScore
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

module.exports = router;

const express = require("express");
const router = express.Router();
const Counselor = require("../models/Counselor");
const User = require("../models/User");
const Appointment = require("../models/Appointment");
const { auth, authorize, optionalAuth } = require("../middleware/auth");
const bcrypt = require("bcryptjs");

// Get all counselors with filtering (public + manager)
router.get("/", optionalAuth, async (req, res) => {
  try {
    const {
      specialization,
      language,
      clientType,
      minRating,
      isAvailable,
      page = 1,
      limit = 12,
      search,
      status,
      verificationStatus,
    } = req.query;

    let query = {};

    // For manager and above, show all counselors regardless of verification status
    if (req.user && req.user.hasPermission && req.user.hasPermission("manager")) {
      // Managers can see all counselors
      if (status) query.status = status;
      if (verificationStatus === "verified") {
        query["verificationStatus.isVerified"] = true;
      } else if (verificationStatus === "pending") {
        query["verificationStatus.isVerified"] = false;
      }
    } else {
      // For public access, only show verified and active counselors
      query.status = "active";
      query["verificationStatus.isVerified"] = true;
      query["settings.isPublicProfile"] = true;
    }

    // Apply filters
    if (specialization) query.specializations = specialization;
    if (language) query["languages.language"] = language;
    if (clientType) query.clientTypes = clientType;
    if (minRating) query["performance.averageRating"] = { $gte: parseFloat(minRating) };

    // Search functionality
    if (search) {
      const userQuery = {
        $or: [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      };
      
      const matchingUsers = await User.find(userQuery).select("_id");
      const userIds = matchingUsers.map(user => user._id);
      
      query.$or = [
        { userId: { $in: userIds } },
        { biography: { $regex: search, $options: "i" } },
        { areasOfExpertise: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const skip = (page - 1) * limit;

    // Build select fields based on permissions
    let selectFields = "";
    if (!(req.user && req.user.hasPermission && req.user.hasPermission("manager"))) {
      selectFields = "-reviews -notes";
    }

    const counselors = await Counselor.find(query)
      .populate("userId", "firstName lastName email avatar phone")
      .select(selectFields)
      .sort({ "performance.averageRating": -1, "performance.totalReviews": -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Counselor.countDocuments(query);

    res.json({
      success: true,
      data: counselors,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: counselors.length,
        totalResults: total,
      },
      filters: {
        specialization,
        language,
        clientType,
        minRating,
        search,
        status,
        verificationStatus,
      },
    });
  } catch (error) {
    console.error("Get counselors error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách chuyên viên tư vấn",
    });
  }
});

// Search counselors with advanced criteria
router.get("/search", async (req, res) => {
  try {
    const { 
      specialization, 
      language, 
      clientType, 
      minRating,
      availability,
      date,
      time,
      userId,
      limit = 10 
    } = req.query;

    const criteria = {};
    if (specialization) criteria.specialization = specialization;
    if (language) criteria.language = language;
    if (clientType) criteria.clientType = clientType;
    if (minRating) criteria.minRating = parseFloat(minRating);
    if (userId) criteria.userId = userId;

    let counselors = await Counselor.searchCounselor(criteria)
      .limit(parseInt(limit));

    // Filter by availability if date and time provided
    if (availability === "true" && date && time) {
      const appointmentDate = new Date(date);
      const [startTime, endTime] = time.split('-');
      
      counselors = counselors.filter(counselor => 
        counselor.isAvailable(appointmentDate, startTime, endTime)
      );
    }

    res.json({
      success: true,
      data: counselors,
      searchCriteria: criteria,
    });
  } catch (error) {
    console.error("Search counselors error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tìm kiếm chuyên viên tư vấn",
    });
  }
});

// Get counselor by user ID
router.get("/user/:userId", auth, async (req, res) => {
  try {
    const counselor = await Counselor.findOne({ userId: req.params.userId })
      .populate("userId", "firstName lastName email phone avatar");

    if (!counselor) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy hồ sơ chuyên viên",
      });
    }

    // Check access permissions
    const canAccess = 
      req.user._id.toString() === req.params.userId ||
      req.user.hasPermission("staff");
    
    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền truy cập hồ sơ này",
      });
    }

    res.json({
      success: true,
      data: counselor,
    });
  } catch (error) {
    console.error("Get counselor by user ID error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin chuyên viên tư vấn",
    });
  }
});

// Get counselor schedule by user ID
router.get("/user/:userId/schedule", auth, async (req, res) => {
  try {
    const { date, month } = req.query;
    
    const counselor = await Counselor.findOne({ userId: req.params.userId })
      .select("availability sessionSettings");

    if (!counselor) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy chuyên viên tư vấn",
      });
    }

    let scheduleData = counselor.availability;

    // If specific date requested, get available slots
    if (date) {
      const requestedDate = new Date(date);
      const availableSlots = counselor.getAvailableSlots(requestedDate);
      
      // Get existing appointments for the date
      const existingAppointments = await Appointment.find({
        counselorId: req.params.userId, // Use userId since appointments reference User
        appointmentDate: {
          $gte: new Date(requestedDate.setHours(0, 0, 0, 0)),
          $lte: new Date(requestedDate.setHours(23, 59, 59, 999)),
        },
        status: { $in: ["pending", "confirmed"] },
      }).select("appointmentTime");

      // Filter out booked slots
      const bookedTimes = existingAppointments.map(apt => apt.appointmentTime.start);
      const freeSlots = availableSlots.filter(slot => 
        !bookedTimes.includes(slot.start)
      );

      scheduleData = {
        date: requestedDate,
        availableSlots: freeSlots,
        bookedSlots: bookedTimes,
        sessionSettings: counselor.sessionSettings,
      };
    }

    res.json({
      success: true,
      data: scheduleData,
    });
  } catch (error) {
    console.error("Get schedule by user ID error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy lịch trình",
    });
  }
});

// Force refresh counselor stats
router.post("/:id/refresh-stats", auth, authorize("staff"), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Recalculate stats
    const totalSessions = await Appointment.countDocuments({ 
      counselorId: id,
      status: 'completed'
    });
    
    const totalAppointments = await Appointment.countDocuments({ 
      counselorId: id
    });
    
    const completionRate = totalAppointments > 0 ? Math.round((totalSessions / totalAppointments) * 100) : 0;
    
    // Update counselor stats
    await Counselor.findByIdAndUpdate(id, {
      $set: {
        'performance.totalSessions': totalSessions,
        'performance.totalClients': totalSessions,
        'performance.completionRate': completionRate
      }
    });
    
    res.json({
      success: true,
      message: "Thống kê đã được cập nhật",
      data: {
        totalSessions,
        totalAppointments,
        completionRate
      }
    });
  } catch (error) {
    console.error("Refresh stats error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật thống kê"
    });
  }
});

// Get counselor by ID
router.get("/:id", async (req, res) => {
  try {
    const counselor = await Counselor.findById(req.params.id)
      .populate("userId", "firstName lastName email phone avatar")
      .populate("reviews.clientId", "firstName lastName")
      .populate("reviews.appointmentId", "appointmentDate status");

    if (!counselor) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy chuyên viên tư vấn",
      });
    }

    // Check if profile is public or user has permission
    if (!counselor.settings.isPublicProfile) {
      if (!req.user || (!req.user.hasPermission("staff") && 
          req.user._id.toString() !== counselor.userId.toString())) {
        return res.status(403).json({
          success: false,
          message: "Hồ sơ này không công khai",
        });
      }
    }

    // Hide sensitive information for non-staff users
    let counselorData = counselor.toObject();
    
    if (!req.user || !req.user.hasPermission("staff")) {
      // Remove sensitive information
      delete counselorData.notes;
      delete counselorData.contactPreferences.businessPhone;
      delete counselorData.contactPreferences.businessEmail;
      
      // Filter reviews to only show public ones
      counselorData.reviews = counselorData.reviews.filter(review => 
        !review.isAnonymous || review.isVerified
      );
    }

    res.json({
      success: true,
      data: counselorData,
      statistics: {
        totalSessions: counselor.performance.totalSessions,
        totalClients: counselor.performance.totalClients,
        averageRating: counselor.performance.averageRating,
        totalReviews: counselor.performance.totalReviews,
        completionRate: counselor.performance.completionRate,
        responseTime: counselor.performance.responseTime,
      },
    });
  } catch (error) {
    console.error("Get counselor error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin chuyên viên tư vấn",
    });
  }
});

// Get counselor schedule/availability
router.get("/:id/schedule", async (req, res) => {
  try {
    const { date, month } = req.query;
    
    const counselor = await Counselor.findById(req.params.id)
      .select("availability sessionSettings");

    if (!counselor) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy chuyên viên tư vấn",
      });
    }

    let scheduleData = counselor.availability;

    // If specific date requested, get available slots
    if (date) {
      const requestedDate = new Date(date);
      const availableSlots = counselor.getAvailableSlots(requestedDate);
      
      // Get existing appointments for the date
      const existingAppointments = await Appointment.find({
        counselorId: counselor.userId,
        appointmentDate: {
          $gte: new Date(requestedDate.setHours(0, 0, 0, 0)),
          $lte: new Date(requestedDate.setHours(23, 59, 59, 999)),
        },
        status: { $in: ["pending", "confirmed"] },
      }).select("appointmentTime");

      // Filter out booked slots
      const bookedTimes = existingAppointments.map(apt => apt.appointmentTime.start);
      const freeSlots = availableSlots.filter(slot => 
        !bookedTimes.includes(slot.start)
      );

      scheduleData = {
        date: requestedDate,
        availableSlots: freeSlots,
        bookedSlots: bookedTimes,
        sessionSettings: counselor.sessionSettings,
      };
    }

    res.json({
      success: true,
      data: scheduleData,
    });
  } catch (error) {
    console.error("Get schedule error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy lịch trình",
    });
  }
});

// Create counselor profile (staff and above)
router.post("/", auth, authorize("staff"), async (req, res) => {
  try {
    const { userId, ...counselorData } = req.body;

    // Check if user exists and has consultant role
    const user = await User.findById(userId);
    if (!user || !user.hasPermission("consultant")) {
      return res.status(400).json({
        success: false,
        message: "User không tồn tại hoặc không có quyền tư vấn",
      });
    }

    // Check if counselor profile already exists
    const existingCounselor = await Counselor.findOne({ userId });
    if (existingCounselor) {
      return res.status(400).json({
        success: false,
        message: "Hồ sơ chuyên viên tư vấn đã tồn tại",
      });
    }

    const counselor = new Counselor({
      userId,
      ...counselorData,
    });

    await counselor.save();

    await counselor.populate("userId", "firstName lastName email");

    res.status(201).json({
      success: true,
      message: "Hồ sơ chuyên viên tư vấn đã được tạo thành công",
      data: counselor,
    });
  } catch (error) {
    console.error("Create counselor error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo hồ sơ chuyên viên tư vấn",
      error: error.message,
    });
  }
});

// Create counselor with user account (manager and above)
router.post("/create-with-user", auth, authorize("manager"), async (req, res) => {
  try {
    const {
      // User data
      firstName,
      lastName,
      email,
      password,
      phone,
      dateOfBirth,
      gender,
      ageGroup,
      // Counselor data
      biography,
      specializations,
      languages,
      experience,
      education,
      certifications,
      areasOfExpertise,
      availability,
      sessionSettings,
      settings,
    } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email đã tồn tại trong hệ thống",
      });
    }

    // Create user with consultant role
    const userData = {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      gender,
      role: "consultant",
      ageGroup: ageGroup || "other",
      isActive: true,
      isEmailVerified: true, // Auto-verify for manager-created users
    };

    // Add password if provided
    if (password) {
      userData.password = password;
    } else {
      // Generate a default password
      userData.password = `Consultant@${Date.now()}`;
    }

    const user = new User(userData);
    await user.save();

    // Create counselor profile
    const counselorProfile = new Counselor({
      userId: user._id,
      biography: biography || "",
      specializations: specializations || [],
      languages: languages || [{ language: "vi", proficiency: "native" }],
      experience: experience || {
        totalYears: 0,
        workHistory: []
      },
      education: education || [],
      certifications: certifications || [],
      areasOfExpertise: areasOfExpertise || [],
      availability: availability || {
        workingHours: {
          monday: { isAvailable: true, slots: [{ start: "09:00", end: "17:00" }] },
          tuesday: { isAvailable: true, slots: [{ start: "09:00", end: "17:00" }] },
          wednesday: { isAvailable: true, slots: [{ start: "09:00", end: "17:00" }] },
          thursday: { isAvailable: true, slots: [{ start: "09:00", end: "17:00" }] },
          friday: { isAvailable: true, slots: [{ start: "09:00", end: "17:00" }] },
          saturday: { isAvailable: false, slots: [] },
          sunday: { isAvailable: false, slots: [] },
        },
        exceptions: []
      },
      sessionSettings: sessionSettings || {
        defaultDuration: 60,
        breakBetweenSessions: 15,
        maxAppointmentsPerDay: 8,
        advanceBookingDays: 30
      },
      contactPreferences: {
        preferredContactMethod: "email",
        businessEmail: user.email,
        businessPhone: user.phone || ""
      },
      settings: settings || {
        isPublicProfile: true,
        allowOnlineConsultations: true,
        autoConfirmAppointments: false,
        sendReminders: true
      },
      verificationStatus: {
        isVerified: true, // Auto-verify for manager-created counselors
        verifiedAt: new Date(),
        verifiedBy: req.user._id,
        documents: []
      },
      status: "active"
    });
    
    await counselorProfile.save();
    await counselorProfile.populate("userId", "firstName lastName email");

    res.status(201).json({
      success: true,
      message: "Tạo tài khoản và hồ sơ chuyên viên thành công",
      data: {
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
        counselor: counselorProfile,
        temporaryPassword: password ? undefined : userData.password // Only return if auto-generated
      },
    });
  } catch (error) {
    console.error("Create counselor with user error:", error);
    
    // If user was created but counselor failed, delete the user
    if (error.message && error.message.includes("counselor")) {
      try {
        await User.findOneAndDelete({ email: req.body.email });
      } catch (deleteError) {
        console.error("Failed to rollback user creation:", deleteError);
      }
    }
    
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo tài khoản chuyên viên",
      error: error.message,
    });
  }
});

// Update counselor profile
router.put("/:id", auth, async (req, res) => {
  try {
    const counselor = await Counselor.findById(req.params.id);

    if (!counselor) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy hồ sơ chuyên viên tư vấn",
      });
    }

    // Check permissions
    const canUpdate = 
      req.user._id.toString() === counselor.userId.toString() ||
      req.user.hasPermission("manager");

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền chỉnh sửa hồ sơ này",
      });
    }

    // Remove sensitive fields if not admin
    const updateData = { ...req.body };
    if (!req.user.hasPermission("admin")) {
      delete updateData.verificationStatus;
      delete updateData.status;
      delete updateData.notes;
    }

    const updatedCounselor = await Counselor.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate("userId", "firstName lastName email");

    res.json({
      success: true,
      message: "Hồ sơ đã được cập nhật thành công",
      data: updatedCounselor,
    });
  } catch (error) {
    console.error("Update counselor error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật hồ sơ",
      error: error.message,
    });
  }
});

// Update counselor schedule by user ID
router.put("/user/:userId/schedule", auth, async (req, res) => {
  try {
    const counselor = await Counselor.findOne({ userId: req.params.userId });

    if (!counselor) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy hồ sơ chuyên viên",
      });
    }

    // Check permissions
    if (req.user._id.toString() !== req.params.userId && 
        !req.user.hasPermission("manager")) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền chỉnh sửa lịch trình này",
      });
    }

    const { workingHours, exceptions, sessionSettings } = req.body;

    if (workingHours) {
      counselor.availability.workingHours = workingHours;
    }

    if (exceptions) {
      counselor.availability.exceptions = exceptions;
    }

    if (sessionSettings) {
      counselor.sessionSettings = { ...counselor.sessionSettings, ...sessionSettings };
    }

    await counselor.save();

    res.json({
      success: true,
      message: "Lịch trình đã được cập nhật thành công",
      data: {
        availability: counselor.availability,
        sessionSettings: counselor.sessionSettings,
      },
    });
  } catch (error) {
    console.error("Update schedule error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật lịch trình",
    });
  }
});

// Update counselor schedule
router.put("/:id/schedule", auth, async (req, res) => {
  try {
    const counselor = await Counselor.findById(req.params.id);

    if (!counselor) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy chuyên viên tư vấn",
      });
    }

    // Check permissions
    if (req.user._id.toString() !== counselor.userId.toString() && 
        !req.user.hasPermission("manager")) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền chỉnh sửa lịch trình này",
      });
    }

    const { workingHours, exceptions, sessionSettings } = req.body;

    if (workingHours) {
      counselor.availability.workingHours = workingHours;
    }

    if (exceptions) {
      counselor.availability.exceptions = exceptions;
    }

    if (sessionSettings) {
      counselor.sessionSettings = { ...counselor.sessionSettings, ...sessionSettings };
    }

    await counselor.save();

    res.json({
      success: true,
      message: "Lịch trình đã được cập nhật thành công",
      data: {
        availability: counselor.availability,
        sessionSettings: counselor.sessionSettings,
      },
    });
  } catch (error) {
    console.error("Update schedule error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật lịch trình",
    });
  }
});

// Add review for counselor
router.post("/:id/reviews", auth, async (req, res) => {
  try {
    const { appointmentId, rating, comment, aspects, isAnonymous = true } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Đánh giá phải từ 1 đến 5 sao",
      });
    }

    const counselor = await Counselor.findById(req.params.id);
    if (!counselor) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy chuyên viên tư vấn",
      });
    }

    // Verify appointment exists and user participated
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment || 
        appointment.userId.toString() !== req.user._id.toString() ||
        appointment.counselorId.toString() !== counselor.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền đánh giá cuộc hẹn này",
      });
    }

    // Check if appointment is completed
    if (appointment.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Chỉ có thể đánh giá cuộc hẹn đã hoàn thành",
      });
    }

    // Check if review already exists
    const existingReview = counselor.reviews.find(
      review => review.appointmentId?.toString() === appointmentId
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "Bạn đã đánh giá cuộc hẹn này rồi",
      });
    }

    // Add review
    await counselor.addReview({
      appointmentId,
      clientId: req.user._id,
      rating,
      comment,
      aspects,
      isAnonymous,
      isVerified: true,
    });

    res.json({
      success: true,
      message: "Đánh giá đã được gửi thành công",
    });
  } catch (error) {
    console.error("Add review error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi gửi đánh giá",
    });
  }
});

// Verify counselor (admin only)
router.put("/:id/verify", auth, authorize("admin"), async (req, res) => {
  try {
    const { isVerified, documents } = req.body;

    const counselor = await Counselor.findByIdAndUpdate(
      req.params.id,
      {
        "verificationStatus.isVerified": isVerified,
        "verificationStatus.verifiedAt": isVerified ? new Date() : null,
        "verificationStatus.verifiedBy": isVerified ? req.user._id : null,
        "verificationStatus.documents": documents || counselor.verificationStatus.documents,
      },
      { new: true }
    ).populate("userId", "firstName lastName email");

    if (!counselor) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy chuyên viên tư vấn",
      });
    }

    res.json({
      success: true,
      message: `Chuyên viên tư vấn đã được ${isVerified ? "xác minh" : "hủy xác minh"}`,
      data: counselor,
    });
  } catch (error) {
    console.error("Verify counselor error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xác minh chuyên viên tư vấn",
    });
  }
});

// Get counselor statistics (manager and above)
router.get("/stats/overview", auth, authorize("manager"), async (req, res) => {
  try {
    const { startDate, endDate, counselorId } = req.query;

    let matchConditions = {
      status: "active",
      "verificationStatus.isVerified": true,
    };

    if (counselorId) {
      matchConditions._id = counselorId;
    }

    const stats = await Counselor.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: null,
          totalCounselors: { $sum: 1 },
          avgRating: { $avg: "$performance.averageRating" },
          totalSessions: { $sum: "$performance.totalSessions" },
          totalClients: { $sum: "$performance.totalClients" },
          avgResponseTime: { $avg: "$performance.responseTime" },
        },
      },
      {
        $project: {
          totalCounselors: 1,
          avgRating: { $round: ["$avgRating", 2] },
          totalSessions: 1,
          totalClients: 1,
          avgResponseTime: { $round: ["$avgResponseTime", 1] },
          _id: 0,
        },
      },
    ]);

    const specializationStats = await Counselor.aggregate([
      { $match: matchConditions },
      { $unwind: "$specializations" },
      {
        $group: {
          _id: "$specializations",
          count: { $sum: 1 },
          avgRating: { $avg: "$performance.averageRating" },
        },
      },
      {
        $project: {
          specialization: "$_id",
          count: 1,
          avgRating: { $round: ["$avgRating", 2] },
          _id: 0,
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {},
        specializationBreakdown: specializationStats,
      },
    });
  } catch (error) {
    console.error("Get counselor stats error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thống kê chuyên viên tư vấn",
    });
  }
});

// Delete/deactivate counselor (admin only)
router.delete("/:id", auth, authorize("admin"), async (req, res) => {
  try {
    const counselor = await Counselor.findByIdAndUpdate(
      req.params.id,
      { 
        status: "suspended",
        "settings.isPublicProfile": false,
      },
      { new: true }
    );

    if (!counselor) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy chuyên viên tư vấn",
      });
    }

    res.json({
      success: true,
      message: "Chuyên viên tư vấn đã được vô hiệu hóa",
    });
  } catch (error) {
    console.error("Delete counselor error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi vô hiệu hóa chuyên viên tư vấn",
    });
  }
});

module.exports = router;
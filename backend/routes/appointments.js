const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const { auth, authorize, authorizeOwnerOrAdmin } = require("../middleware/auth");

// Get all appointments (filtered by role)
router.get("/", auth, async (req, res) => {
  try {
    const { status, date, counselorId, userId, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    // Role-based filtering
    if (req.user.role === "member") {
      query.userId = req.user._id;
    } else if (req.user.role === "consultant") {
      query.counselorId = req.user._id;
    }
    // Staff, Manager, Admin can see all appointments
    
    // Additional filters
    if (status) query.status = status;
    if (counselorId) query.counselorId = counselorId;
    if (userId) query.userId = userId;
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.appointmentDate = { $gte: startDate, $lte: endDate };
    }
    
    const skip = (page - 1) * limit;
    
    const appointments = await Appointment.find(query)
      .populate("userId", "firstName lastName email phone ageGroup")
      .populate("counselorId", "firstName lastName email specialization")
      .sort({ appointmentDate: -1, "appointmentTime.start": 1 })
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
    console.error("Get appointments error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách cuộc hẹn",
    });
  }
});

// Get appointment by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("userId", "firstName lastName email phone ageGroup")
      .populate("counselorId", "firstName lastName email specialization")
      .populate("relatedAssessment", "score riskLevel completedAt");
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy cuộc hẹn",
      });
    }
    
    // Check access permissions
    const canAccess = 
      req.user._id.toString() === appointment.userId.toString() ||
      req.user._id.toString() === appointment.counselorId.toString() ||
      req.user.hasPermission("staff");
    
    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền truy cập cuộc hẹn này",
      });
    }
    
    res.json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error("Get appointment error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin cuộc hẹn",
    });
  }
});

// Create new appointment
router.post("/", auth, async (req, res) => {
  try {
    const {
      counselorId,
      appointmentDate,
      appointmentTime,
      type,
      reason,
      urgency,
      contactInfo,
      onlineInfo,
      locationInfo,
      relatedAssessment,
    } = req.body;
    
    // Validate required fields
    if (!counselorId || !appointmentDate || !appointmentTime || !type || !reason) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc",
      });
    }
    
    // Verify counselor exists and has consultant role
    const counselor = await User.findById(counselorId);
    if (!counselor || !counselor.hasPermission("consultant")) {
      return res.status(400).json({
        success: false,
        message: "Counselor không tồn tại hoặc không có quyền tư vấn",
      });
    }
    
    // Create appointment
    const appointment = new Appointment({
      userId: req.user._id,
      counselorId,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      type,
      reason,
      urgency: urgency || "medium",
      contactInfo: {
        ...contactInfo,
        email: contactInfo?.email || req.user.email,
        phoneNumber: contactInfo?.phoneNumber || req.user.phone,
      },
      onlineInfo: type === "online" ? onlineInfo : undefined,
      locationInfo: type === "in_person" ? locationInfo : undefined,
      relatedAssessment,
      createdBy: req.user._id,
    });
    
    // Check for conflicts
    const hasConflict = await appointment.hasConflict();
    if (hasConflict) {
      return res.status(409).json({
        success: false,
        message: "Thời gian đã được đặt trước, vui lòng chọn thời gian khác",
      });
    }
    
    await appointment.save();
    
    // Update user's appointment history
    await User.findByIdAndUpdate(req.user._id, {
      $push: { appointmentHistory: appointment._id },
    });
    
    // Populate and return
    await appointment.populate("counselorId", "firstName lastName email specialization");
    
    res.status(201).json({
      success: true,
      message: "Cuộc hẹn đã được đặt thành công",
      data: appointment,
    });
  } catch (error) {
    console.error("Create appointment error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo cuộc hẹn",
      error: error.message,
    });
  }
});

// Update appointment
router.put("/:id", auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy cuộc hẹn",
      });
    }
    
    // Check permissions
    const canUpdate = 
      req.user._id.toString() === appointment.userId.toString() ||
      req.user._id.toString() === appointment.counselorId.toString() ||
      req.user.hasPermission("staff");
    
    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền chỉnh sửa cuộc hẹn này",
      });
    }
    
    // Check if appointment can be modified
    if (appointment.status === "completed" || appointment.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Không thể chỉnh sửa cuộc hẹn đã hoàn thành hoặc đã hủy",
      });
    }
    
    // Update appointment
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { ...req.body, modifiedBy: req.user._id },
      { new: true, runValidators: true }
    ).populate("userId", "firstName lastName email phone")
     .populate("counselorId", "firstName lastName email specialization");
    
    res.json({
      success: true,
      message: "Cuộc hẹn đã được cập nhật thành công",
      data: updatedAppointment,
    });
  } catch (error) {
    console.error("Update appointment error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật cuộc hẹn",
      error: error.message,
    });
  }
});

// Cancel appointment
router.delete("/:id", auth, async (req, res) => {
  try {
    const { reason } = req.body;
    
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy cuộc hẹn",
      });
    }
    
    // Check permissions
    const canCancel = 
      req.user._id.toString() === appointment.userId.toString() ||
      req.user._id.toString() === appointment.counselorId.toString() ||
      req.user.hasPermission("staff");
    
    if (!canCancel) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền hủy cuộc hẹn này",
      });
    }
    
    // Check if appointment can be cancelled
    if (!appointment.canCancel) {
      return res.status(400).json({
        success: false,
        message: "Không thể hủy cuộc hẹn này do vượt quá thời gian cho phép",
      });
    }
    
    // Update appointment status
    appointment.status = "cancelled";
    appointment.modifiedBy = req.user._id;
    appointment.statusHistory.push({
      status: "cancelled",
      changedBy: req.user._id,
      reason: reason || "Hủy bởi người dùng",
    });
    
    await appointment.save();
    
    res.json({
      success: true,
      message: "Cuộc hẹn đã được hủy thành công",
    });
  } catch (error) {
    console.error("Cancel appointment error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi hủy cuộc hẹn",
    });
  }
});

// Get user appointments
router.get("/user/:userId", auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, limit = 10, page = 1 } = req.query;
    
    // Check if user can access these appointments
    if (req.user._id.toString() !== userId && !req.user.hasPermission("staff")) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền truy cập lịch hẹn này",
      });
    }
    
    let query = { userId };
    if (status) query.status = status;
    
    const skip = (page - 1) * limit;
    
    const appointments = await Appointment.find(query)
      .populate("counselorId", "firstName lastName email specialization")
      .sort({ appointmentDate: -1, "appointmentTime.start": 1 })
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
      message: "Lỗi khi lấy lịch hẹn người dùng",
    });
  }
});

// Get counselor appointments
router.get("/counselor/:counselorId", auth, async (req, res) => {
  try {
    const { counselorId } = req.params;
    const { status, date, limit = 10, page = 1 } = req.query;
    
    // Check if user can access these appointments
    if (req.user._id.toString() !== counselorId && !req.user.hasPermission("staff")) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền truy cập lịch hẹn này",
      });
    }
    
    let query = { counselorId };
    if (status) query.status = status;
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.appointmentDate = { $gte: startDate, $lte: endDate };
    }
    
    const skip = (page - 1) * limit;
    
    const appointments = await Appointment.find(query)
      .populate("userId", "firstName lastName email phone ageGroup")
      .populate("relatedAssessment", "score riskLevel completedAt")
      .sort({ appointmentDate: 1, "appointmentTime.start": 1 })
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
    console.error("Get counselor appointments error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy lịch hẹn counselor",
    });
  }
});

// Get available time slots
router.get("/available-slots/:counselorId", auth, async (req, res) => {
  try {
    const { counselorId } = req.params;
    const { date, duration = 60 } = req.query;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Ngày là bắt buộc",
      });
    }
    
    // Verify counselor exists
    const counselor = await User.findById(counselorId);
    if (!counselor || !counselor.hasPermission("consultant")) {
      return res.status(404).json({
        success: false,
        message: "Counselor không tồn tại",
      });
    }
    
    const availableSlots = await Appointment.findAvailableSlots(
      counselorId,
      date,
      parseInt(duration)
    );
    
    res.json({
      success: true,
      data: availableSlots,
    });
  } catch (error) {
    console.error("Get available slots error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thời gian trống",
    });
  }
});

// Submit appointment feedback
router.post("/:id/feedback", auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy cuộc hẹn",
      });
    }
    
    // Check if user participated in this appointment
    const canProvideFeedback = 
      req.user._id.toString() === appointment.userId.toString() ||
      req.user._id.toString() === appointment.counselorId.toString();
    
    if (!canProvideFeedback) {
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
    
    // Update feedback
    if (req.user._id.toString() === appointment.userId.toString()) {
      appointment.feedback.userRating = rating;
      appointment.feedback.userComment = comment;
    } else {
      appointment.feedback.counselorRating = rating;
      appointment.feedback.counselorComment = comment;
    }
    
    appointment.feedback.completedAt = new Date();
    await appointment.save();
    
    res.json({
      success: true,
      message: "Đánh giá đã được gửi thành công",
    });
  } catch (error) {
    console.error("Submit feedback error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi gửi đánh giá",
    });
  }
});

// Get appointment statistics (staff and above)
router.get("/stats/overview", auth, authorize("staff"), async (req, res) => {
  try {
    const { startDate, endDate, counselorId } = req.query;
    
    let matchConditions = {};
    
    if (startDate && endDate) {
      matchConditions.appointmentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    
    if (counselorId) {
      matchConditions.counselorId = counselorId;
    }
    
    const stats = await Appointment.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          avgRating: { $avg: "$feedback.userRating" },
        }
      },
      {
        $project: {
          status: "$_id",
          count: 1,
          avgRating: { $round: ["$avgRating", 2] },
          _id: 0,
        }
      }
    ]);
    
    const totalAppointments = await Appointment.countDocuments(matchConditions);
    
    res.json({
      success: true,
      data: {
        totalAppointments,
        statusDistribution: stats,
      },
    });
  } catch (error) {
    console.error("Get appointment stats error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thống kê cuộc hẹn",
    });
  }
});

module.exports = router;

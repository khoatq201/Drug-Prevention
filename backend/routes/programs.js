const express = require("express");
const router = express.Router();
const Program = require("../models/Program");
const User = require("../models/User");
const { AssessmentResult } = require("../models/Assessment");
const { auth, authorize } = require("../middleware/auth");

// Get all programs with filtering
router.get("/", async (req, res) => {
  try {
    const {
      category,
      type,
      status,
      ageGroup,
      location,
      upcoming,
      language = "vi",
      page = 1,
      limit = 12,
      search,
    } = req.query;

    let query = {
      visibility: "public",
      language,
    };

    // Apply filters
    if (category) query.category = category;
    if (type) query.type = type;
    if (status) query.status = status;
    if (location) query["location.type"] = location;
    if (ageGroup) {
      query["targetAudience.ageGroups"] = ageGroup;
    } else if (req.user && req.user.ageGroup) {
      query["targetAudience.ageGroups"] = req.user.ageGroup;
    }

    // Show only upcoming programs if requested
    if (upcoming === "true") {
      query["schedule.startDate"] = { $gte: new Date() };
      query.status = { $in: ["registration_open", "in_progress"] };
    }

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
        { "organizer.organization": { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const programs = await Program.find(query)
      .select("-participants.userId -evaluation.feedback.reviews")
      .populate("createdBy", "firstName lastName")
      .sort({ "schedule.startDate": 1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Program.countDocuments(query);

    res.json({
      success: true,
      data: programs,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: programs.length,
        totalResults: total,
      },
      filters: {
        category,
        type,
        status,
        ageGroup,
        location,
        upcoming,
        search,
      },
    });
  } catch (error) {
    console.error("Get programs error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách chương trình",
    });
  }
});

// Get upcoming programs
router.get("/upcoming", async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const programs = await Program.findUpcoming(parseInt(limit))
      .select("name description type schedule location capacity organizer")
      .populate("createdBy", "firstName lastName");

    res.json({
      success: true,
      data: programs,
    });
  } catch (error) {
    console.error("Get upcoming programs error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách chương trình sắp tới",
    });
  }
});

// Get program by ID
router.get("/:id", async (req, res) => {
  try {
    const program = await Program.findById(req.params.id)
      .populate("createdBy", "firstName lastName email")
      .populate("participants.userId", "firstName lastName ageGroup")
      .populate("evaluation.preAssessment.assessmentId", "name type")
      .populate("evaluation.postAssessment.assessmentId", "name type");

    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy chương trình",
      });
    }

    // Check visibility permissions
    if (program.visibility === "private" && !req.user) {
      return res.status(403).json({
        success: false,
        message: "Chương trình này không công khai",
      });
    }

    if (program.visibility === "restricted") {
      if (!req.user || !req.user.hasPermission("staff")) {
        return res.status(403).json({
          success: false,
          message: "Không có quyền truy cập chương trình này",
        });
      }
    }

    // Check if user's age group matches program target
    if (req.user && !program.targetAudience.ageGroups.includes(req.user.ageGroup)) {
      return res.status(403).json({
        success: false,
        message: "Chương trình này không dành cho nhóm tuổi của bạn",
      });
    }

    // Hide sensitive information for non-participants
    let programData = program.toObject();
    
    const isParticipant = req.user && program.participants.some(
      (participant) => participant.userId._id.toString() === req.user._id.toString()
    );
    
    const isStaff = req.user && req.user.hasPermission("staff");
    
    if (!isParticipant && !isStaff) {
      // Hide detailed participant information
      programData.participants = programData.participants.map(p => ({
        status: p.status,
        registeredAt: p.registeredAt,
      }));
      
      // Hide internal resources
      programData.resources = programData.resources.filter(r => r.isPublic);
    }

    const statistics = program.getStatistics();

    res.json({
      success: true,
      data: programData,
      statistics,
      canRegister: req.user ? program.canUserRegister(req.user._id) : false,
      isParticipant,
      userRegistrationStatus: isParticipant 
        ? program.participants.find(p => p.userId._id.toString() === req.user._id.toString())?.status 
        : null,
    });
  } catch (error) {
    console.error("Get program error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin chương trình",
    });
  }
});

// Join program
router.post("/:id/join", auth, async (req, res) => {
  try {
    const { preAssessmentAnswers } = req.body;
    
    const program = await Program.findById(req.params.id);

    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy chương trình",
      });
    }

    // Check if user can register
    if (!program.canUserRegister(req.user._id)) {
      // Try to add to waiting list if program is full
      if (program.isFull) {
        await program.addToWaitingList(req.user._id);
        return res.json({
          success: true,
          message: "Chương trình đã đầy. Bạn đã được thêm vào danh sách chờ.",
          waitingList: true,
        });
      }
      
      return res.status(400).json({
        success: false,
        message: "Không thể đăng ký chương trình này",
      });
    }

    // Check age group compatibility
    if (!program.targetAudience.ageGroups.includes(req.user.ageGroup)) {
      return res.status(403).json({
        success: false,
        message: "Chương trình này không dành cho nhóm tuổi của bạn",
      });
    }

    // Handle pre-assessment if required
    let preAssessmentId = null;
    if (program.evaluation.preAssessment.isRequired && preAssessmentAnswers) {
      // Create assessment result
      const assessmentResult = new AssessmentResult({
        userId: req.user._id,
        assessmentId: program.evaluation.preAssessment.assessmentId,
        answers: preAssessmentAnswers,
        score: { total: 0, breakdown: [] }, // Simplified - would calculate properly
        riskLevel: { level: "low", description: "Pre-program assessment" },
        recommendations: { actions: [], resources: [], urgency: "low" },
      });
      
      await assessmentResult.save();
      preAssessmentId = assessmentResult._id;
    }

    // Register user
    await program.registerUser(req.user._id, {
      preAssessmentId,
    });

    // Update user's program history
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        programHistory: {
          programId: program._id,
          joinedAt: new Date(),
          preAssessment: preAssessmentId ? {
            assessmentId: preAssessmentId,
            completedAt: new Date(),
          } : undefined,
        },
      },
    });

    res.json({
      success: true,
      message: "Đăng ký chương trình thành công",
      requiresApproval: program.registration.requiresApproval,
    });
  } catch (error) {
    console.error("Join program error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi đăng ký chương trình",
    });
  }
});

// Submit post-program assessment
router.post("/:id/assessment", auth, async (req, res) => {
  try {
    const { answers, feedback } = req.body;
    
    const program = await Program.findById(req.params.id);

    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy chương trình",
      });
    }

    // Check if user is a participant
    const participant = program.participants.find(
      (p) => p.userId.toString() === req.user._id.toString()
    );

    if (!participant) {
      return res.status(403).json({
        success: false,
        message: "Bạn không phải là người tham gia chương trình này",
      });
    }

    // Check if program is completed
    if (program.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Chương trình chưa hoàn thành",
      });
    }

    // Handle post-assessment
    let postAssessmentId = null;
    if (program.evaluation.postAssessment.isRequired && answers) {
      const assessmentResult = new AssessmentResult({
        userId: req.user._id,
        assessmentId: program.evaluation.postAssessment.assessmentId,
        answers: answers,
        score: { total: 0, breakdown: [] }, // Simplified
        riskLevel: { level: "low", description: "Post-program assessment" },
        recommendations: { actions: [], resources: [], urgency: "low" },
      });
      
      await assessmentResult.save();
      postAssessmentId = assessmentResult._id;
    }

    // Handle feedback
    if (feedback) {
      program.evaluation.feedback.reviews.push({
        userId: req.user._id,
        rating: feedback.rating,
        comment: feedback.comment,
        aspects: feedback.aspects,
        submittedAt: new Date(),
      });
      
      // Update overall rating
      const totalReviews = program.evaluation.feedback.reviews.length;
      const totalRating = program.evaluation.feedback.reviews.reduce(
        (sum, review) => sum + review.rating, 0
      );
      
      program.evaluation.feedback.overallRating = totalRating / totalReviews;
      program.evaluation.feedback.totalReviews = totalReviews;
    }

    // Update user's program history
    await User.findOneAndUpdate(
      { _id: req.user._id, "programHistory.programId": program._id },
      {
        $set: {
          "programHistory.$.postAssessment": postAssessmentId ? {
            assessmentId: postAssessmentId,
            completedAt: new Date(),
          } : undefined,
        },
      }
    );

    await program.save();

    res.json({
      success: true,
      message: "Đánh giá chương trình đã được gửi thành công",
    });
  } catch (error) {
    console.error("Submit assessment error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi gửi đánh giá chương trình",
    });
  }
});

// Get program participants (staff only)
router.get("/:id/participants", auth, authorize("staff"), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const program = await Program.findById(req.params.id)
      .populate("participants.userId", "firstName lastName email phone ageGroup")
      .populate("participants.attendedSessions.sessionId");

    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy chương trình",
      });
    }

    let participants = program.participants;
    
    // Filter by status if provided
    if (status) {
      participants = participants.filter(p => p.status === status);
    }

    // Pagination
    const skip = (page - 1) * limit;
    const paginatedParticipants = participants.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: paginatedParticipants,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(participants.length / limit),
        count: paginatedParticipants.length,
        totalResults: participants.length,
      },
      summary: {
        totalParticipants: program.participants.length,
        registered: program.participants.filter(p => p.status === "registered").length,
        confirmed: program.participants.filter(p => p.status === "confirmed").length,
        attended: program.participants.filter(p => p.status === "attended").length,
        cancelled: program.participants.filter(p => p.status === "cancelled").length,
      },
    });
  } catch (error) {
    console.error("Get participants error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách người tham gia",
    });
  }
});

// Update participant status (staff only)
router.put("/:id/participants/:userId", auth, authorize("staff"), async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const program = await Program.findById(req.params.id);

    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy chương trình",
      });
    }

    const participant = program.participants.find(
      (p) => p.userId.toString() === req.params.userId
    );

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người tham gia",
      });
    }

    // Update participant status
    participant.status = status;
    if (notes) participant.notes = notes;

    await program.save();

    res.json({
      success: true,
      message: "Cập nhật trạng thái người tham gia thành công",
    });
  } catch (error) {
    console.error("Update participant error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật trạng thái người tham gia",
    });
  }
});

// Create new program (staff and above)
router.post("/", auth, authorize("staff"), async (req, res) => {
  try {
    const program = new Program({
      ...req.body,
      createdBy: req.user._id,
    });

    await program.save();

    res.status(201).json({
      success: true,
      message: "Chương trình đã được tạo thành công",
      data: program,
    });
  } catch (error) {
    console.error("Create program error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo chương trình",
      error: error.message,
    });
  }
});

// Update program (staff and above)
router.put("/:id", auth, authorize("staff"), async (req, res) => {
  try {
    const program = await Program.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy chương trình",
      });
    }

    res.json({
      success: true,
      message: "Chương trình đã được cập nhật thành công",
      data: program,
    });
  } catch (error) {
    console.error("Update program error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật chương trình",
      error: error.message,
    });
  }
});

// Delete program (admin only)
router.delete("/:id", auth, authorize("admin"), async (req, res) => {
  try {
    const program = await Program.findByIdAndUpdate(
      req.params.id,
      { status: "cancelled", visibility: "private" },
      { new: true }
    );

    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy chương trình",
      });
    }

    res.json({
      success: true,
      message: "Chương trình đã được xóa thành công",
    });
  } catch (error) {
    console.error("Delete program error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa chương trình",
    });
  }
});

// Get program statistics (staff and above)
router.get("/stats/overview", auth, authorize("staff"), async (req, res) => {
  try {
    const { category, type, startDate, endDate } = req.query;
    
    let matchConditions = {};
    
    if (category) matchConditions.category = category;
    if (type) matchConditions.type = type;
    if (startDate && endDate) {
      matchConditions["schedule.startDate"] = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const stats = await Program.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalParticipants: { $sum: "$capacity.currentParticipants" },
          avgRating: { $avg: "$evaluation.feedback.overallRating" },
        },
      },
      {
        $project: {
          status: "$_id",
          count: 1,
          totalParticipants: 1,
          avgRating: { $round: ["$avgRating", 2] },
          _id: 0,
        },
      },
    ]);

    const categoryStats = await Program.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalParticipants: { $sum: "$capacity.currentParticipants" },
          avgRating: { $avg: "$evaluation.feedback.overallRating" },
        },
      },
      {
        $project: {
          category: "$_id",
          count: 1,
          totalParticipants: 1,
          avgRating: { $round: ["$avgRating", 2] },
          _id: 0,
        },
      },
    ]);

    const totalPrograms = await Program.countDocuments(matchConditions);
    
    res.json({
      success: true,
      data: {
        totalPrograms,
        statusDistribution: stats,
        categoryDistribution: categoryStats,
      },
    });
  } catch (error) {
    console.error("Get program stats error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thống kê chương trình",
    });
  }
});

module.exports = router;

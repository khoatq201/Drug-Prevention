const express = require("express");
const router = express.Router();
const Assessment = require("../models/Assessment");
const { AssessmentResult } = require("../models/Assessment");
const User = require("../models/User");
const { auth, authorize, authorizeResource } = require("../middleware/auth");

// Get all assessments (filtered by user's age group if authenticated)
router.get("/", async (req, res) => {
  try {
    const { type, ageGroup, language = "vi" } = req.query;
    
    let query = { isActive: true, language };
    
    // Filter by type if provided
    if (type) {
      query.type = type;
    }
    
    // Filter by age group if provided or use user's age group
    if (ageGroup) {
      query.targetAgeGroup = ageGroup;
    } else if (req.user && req.user.ageGroup) {
      query.targetAgeGroup = req.user.ageGroup;
    }
    
    const assessments = await Assessment.find(query)
      .select("-questions.options.value -scoring.riskLevels")
      .sort({ name: 1 });
    
    res.json({
      success: true,
      data: assessments,
      count: assessments.length,
    });
  } catch (error) {
    console.error("Get assessments error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách bài đánh giá",
    });
  }
});

// Get all assessments for admin (with pagination and filters)
router.get("/admin", auth, authorize("admin", "manager"), async (req, res) => {
  try {
    const { 
      type, 
      ageGroup, 
      isActive, 
      search, 
      page = 1, 
      limit = 20,
      language = "vi" 
    } = req.query;
    
    let query = { language };
    
    // Filter by type if provided
    if (type) {
      query.type = type;
    }
    
    // Filter by age group if provided
    if (ageGroup) {
      query.targetAgeGroup = ageGroup;
    }
    
    // Filter by active status if provided
    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }
    
    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
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
        total: Math.ceil(total / parseInt(limit)),
        count: assessments.length,
        totalResults: total,
      },
    });
  } catch (error) {
    console.error("Get admin assessments error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách bài đánh giá",
    });
  }
});

// Get user's own assessment results (must come before /:id route)
router.get("/my-assessments", auth, async (req, res) => {
  try {
    const { type, limit = 10, page = 1 } = req.query;
    
    let query = { userId: req.user._id };
    if (type) {
      const assessment = await Assessment.findOne({ type, isActive: true });
      if (assessment) {
        query.assessmentId = assessment._id;
      }
    }
    
    const skip = (page - 1) * limit;
    
    const results = await AssessmentResult.find(query)
      .populate("assessmentId", "name type description")
      .sort({ completedAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    const total = await AssessmentResult.countDocuments(query);
    
    res.json({
      success: true,
      data: results,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: results.length,
        totalResults: total,
      },
    });
  } catch (error) {
    console.error("Get my assessment results error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy kết quả đánh giá",
    });
  }
});

// Get assessment statistics (staff and above) (must come before /:id route)
router.get("/stats/overview", auth, authorize("staff"), async (req, res) => {
  try {
    const { startDate, endDate, type, ageGroup } = req.query;
    
    let matchConditions = {};
    
    if (startDate && endDate) {
      matchConditions.completedAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    
    if (type) {
      const assessment = await Assessment.findOne({ type, isActive: true });
      if (assessment) {
        matchConditions.assessmentId = assessment._id;
      }
    }
    
    const stats = await AssessmentResult.aggregate([
      { $match: matchConditions },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      ...(ageGroup ? [{ $match: { "user.ageGroup": ageGroup } }] : []),
      {
        $group: {
          _id: "$riskLevel.level",
          count: { $sum: 1 },
          averageScore: { $avg: "$score.total" },
        }
      },
      {
        $project: {
          riskLevel: "$_id",
          count: 1,
          averageScore: { $round: ["$averageScore", 2] },
          _id: 0,
        }
      }
    ]);
    
    const totalAssessments = await AssessmentResult.countDocuments(matchConditions);
    
    res.json({
      success: true,
      data: {
        totalAssessments,
        riskLevelDistribution: stats,
      },
    });
  } catch (error) {
    console.error("Get assessment stats error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thống kê đánh giá",
    });
  }
});

// Get assessment by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài đánh giá",
      });
    }
    
    if (!assessment.isActive) {
      return res.status(404).json({
        success: false,
        message: "Bài đánh giá này hiện không khả dụng",
      });
    }
    
    // Hide scoring details for non-admin users
    let responseData = assessment.toObject();
    if (!req.user.hasPermission("admin")) {
      responseData.scoring.riskLevels = responseData.scoring.riskLevels.map(level => ({
        level: level.level,
        description: level.description,
        color: level.color
      }));
      responseData.questions = responseData.questions.map(q => ({
        ...q,
        options: q.options.map(opt => ({
          text: opt.text,
          value: opt.value,
          isOther: opt.isOther
        }))
      }));
    }
    
    res.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Get assessment error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin bài đánh giá",
    });
  }
});

// Take assessment (submit answers)
router.post("/:id/submit", auth, async (req, res) => {
  try {
    const { answers } = req.body;
    
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu câu trả lời không hợp lệ",
      });
    }
    
    const assessment = await Assessment.findById(req.params.id);
    
    if (!assessment || !assessment.isActive) {
      return res.status(404).json({
        success: false,
        message: "Bài đánh giá không tồn tại hoặc không khả dụng",
      });
    }
    
    // Check if user's age group matches assessment target
    if (assessment.targetAgeGroup.length > 0 && !assessment.targetAgeGroup.includes(req.user.ageGroup)) {
      return res.status(403).json({
        success: false,
        message: "Bài đánh giá này không dành cho nhóm tuổi của bạn",
      });
    }
    
    // Calculate score
    let totalScore = 0;
    let categoryScores = {};
    
    for (const answer of answers) {
      const question = assessment.questions.find(q => q._id.toString() === answer.questionId);
      if (!question) continue;
      
      let questionScore = 0;
      
      if (question.type === "multiple_choice" || question.type === "yes_no") {
        const option = question.options.find(opt => opt.text === answer.answer);
        if (option) {
          questionScore = option.value || 0;
        }
      } else if (question.type === "scale") {
        questionScore = typeof answer.answer === "number" ? answer.answer : 0;
      }
      
      questionScore *= question.weightage;
      totalScore += questionScore;
      
      // Track category scores
      if (question.category) {
        categoryScores[question.category] = (categoryScores[question.category] || 0) + questionScore;
      }
    }
    
    // Determine risk level
    const riskLevelData = assessment.calculateRiskLevel(totalScore);
    const recommendations = assessment.getRecommendations(riskLevelData.level);
    
    // Save assessment result
    const assessmentResult = new AssessmentResult({
      userId: req.user._id,
      assessmentId: assessment._id,
      answers: answers,
      score: {
        total: totalScore,
        breakdown: Object.entries(categoryScores).map(([category, score]) => ({
          category,
          score
        }))
      },
      riskLevel: riskLevelData,
      recommendations: recommendations,
    });
    
    await assessmentResult.save();
    
    // Update user's assessment history
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        assessmentHistory: {
          assessmentType: assessment.type,
          score: totalScore,
          riskLevel: riskLevelData.level,
          recommendations: recommendations.actions,
          completedAt: new Date(),
        }
      }
    });
    
    res.json({
      success: true,
      message: "Đánh giá đã được hoàn thành thành công",
      data: {
        _id: assessmentResult._id,
        score: totalScore,
        maxScore: assessment.scoring.maxScore || totalScore,
        riskLevel: riskLevelData,
        recommendations: recommendations,
        resultId: assessmentResult._id,
      },
    });
  } catch (error) {
    console.error("Take assessment error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi thực hiện bài đánh giá",
    });
  }
});

// Get user assessment results
router.get("/results/:userId", auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, limit = 10, page = 1 } = req.query;
    
    // Check if user can access these results
    if (req.user._id.toString() !== userId && !req.user.hasPermission("staff")) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền truy cập kết quả này",
      });
    }
    
    let query = { userId };
    if (type) {
      const assessment = await Assessment.findOne({ type, isActive: true });
      if (assessment) {
        query.assessmentId = assessment._id;
      }
    }
    
    const skip = (page - 1) * limit;
    
    const results = await AssessmentResult.find(query)
      .populate("assessmentId", "name type description")
      .sort({ completedAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    const total = await AssessmentResult.countDocuments(query);
    
    res.json({
      success: true,
      data: results,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: results.length,
        totalResults: total,
      },
    });
  } catch (error) {
    console.error("Get assessment results error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy kết quả đánh giá",
    });
  }
});

// Get specific assessment result
router.get("/:assessmentId/result/:resultId", auth, async (req, res) => {
  try {
    const { assessmentId, resultId } = req.params;
    
    const result = await AssessmentResult.findOne({
      _id: resultId,
      assessmentId: assessmentId,
      userId: req.user._id
    }).populate("assessmentId", "name type description");
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy kết quả đánh giá",
      });
    }
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get assessment result error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy kết quả đánh giá",
    });
  }
});

// Create new assessment (admin only)
router.post("/", auth, authorize("admin", "manager"), async (req, res) => {
  try {
    const assessment = new Assessment(req.body);
    await assessment.save();
    
    res.status(201).json({
      success: true,
      message: "Bài đánh giá đã được tạo thành công",
      data: assessment,
    });
  } catch (error) {
    console.error("Create assessment error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo bài đánh giá",
      error: error.message,
    });
  }
});

// Update assessment (admin only)
router.put("/:id", auth, authorize("admin", "manager"), async (req, res) => {
  try {
    const assessment = await Assessment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài đánh giá",
      });
    }
    
    res.json({
      success: true,
      message: "Bài đánh giá đã được cập nhật thành công",
      data: assessment,
    });
  } catch (error) {
    console.error("Update assessment error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật bài đánh giá",
      error: error.message,
    });
  }
});

// Delete assessment (admin only)
router.delete("/:id", auth, authorize("admin", "manager"), async (req, res) => {
  try {
    const assessment = await Assessment.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài đánh giá",
      });
    }
    
    res.json({
      success: true,
      message: "Bài đánh giá đã được xóa thành công",
    });
  } catch (error) {
    console.error("Delete assessment error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa bài đánh giá",
    });
  }
});

// Toggle assessment active status (admin only)
router.patch("/:id/toggle-active", auth, authorize("admin", "manager"), async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const assessment = await Assessment.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );
    
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài đánh giá",
      });
    }
    
    res.json({
      success: true,
      message: `Bài đánh giá đã được ${isActive ? 'kích hoạt' : 'vô hiệu hóa'} thành công`,
      data: assessment,
    });
  } catch (error) {
    console.error("Toggle assessment active status error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi thay đổi trạng thái bài đánh giá",
    });
  }
});

module.exports = router;

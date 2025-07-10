const mongoose = require("mongoose");

const assessmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên bài đánh giá là bắt buộc"],
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Loại đánh giá là bắt buộc"],
      enum: ["ASSIST", "CRAFFT", "AUDIT", "DAST", "CUSTOM"],
    },
    description: {
      type: String,
      required: [true, "Mô tả bài đánh giá là bắt buộc"],
    },
    targetAgeGroup: [
      {
        type: String,
        enum: ["student", "university_student", "parent", "teacher", "other"],
        required: true,
      },
    ],
    questions: [
      {
        question: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ["multiple_choice", "yes_no", "scale", "text"],
          required: true,
        },
        options: [
          {
            text: String,
            value: Number,
            isOther: {
              type: Boolean,
              default: false,
            },
          },
        ],
        scale: {
          min: Number,
          max: Number,
          step: Number,
          labels: {
            min: String,
            max: String,
          },
        },
        isRequired: {
          type: Boolean,
          default: true,
        },
        order: {
          type: Number,
          required: true,
        },
        category: String, // Để phân loại câu hỏi (ví dụ: alcohol, drugs, behavioral)
        weightage: {
          type: Number,
          default: 1,
        },
      },
    ],
    scoring: {
      method: {
        type: String,
        enum: ["sum", "weighted_sum", "category_based", "custom"],
        default: "sum",
      },
      riskLevels: [
        {
          level: {
            type: String,
            enum: ["low", "moderate", "high", "severe"],
            required: true,
          },
          minScore: {
            type: Number,
            required: true,
          },
          maxScore: {
            type: Number,
            required: true,
          },
          description: String,
          color: {
            type: String,
            default: "#22c55e", // green for low risk
          },
        },
      ],
      maxScore: {
        type: Number,
        required: true,
      },
    },
    recommendations: [
      {
        riskLevel: {
          type: String,
          enum: ["low", "moderate", "high", "severe"],
          required: true,
        },
        actions: [String],
        resources: [
          {
            title: String,
            description: String,
            url: String,
            type: {
              type: String,
              enum: ["course", "article", "video", "counseling", "hotline"],
            },
          },
        ],
        urgency: {
          type: String,
          enum: ["low", "medium", "high", "immediate"],
          default: "low",
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    language: {
      type: String,
      enum: ["vi", "en"],
      default: "vi",
    },
    version: {
      type: String,
      default: "1.0",
    },
    author: {
      name: String,
      organization: String,
      email: String,
    },
    validationStudy: {
      sampleSize: Number,
      reliability: Number,
      validity: Number,
      reference: String,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for total questions count
assessmentSchema.virtual("totalQuestions").get(function () {
  return this.questions.length;
});

// Static method to find assessments by age group
assessmentSchema.statics.findByAgeGroup = function (ageGroup) {
  return this.find({
    targetAgeGroup: ageGroup,
    isActive: true,
  }).sort({ name: 1 });
};

// Method to calculate risk level based on score
assessmentSchema.methods.calculateRiskLevel = function (score) {
  const riskLevel = this.scoring.riskLevels.find(
    (level) => score >= level.minScore && score <= level.maxScore
  );

  return (
    riskLevel || {
      level: "unknown",
      description: "Không thể xác định mức độ rủi ro",
    }
  );
};

// Method to get recommendations for a risk level
assessmentSchema.methods.getRecommendations = function (riskLevel) {
  return (
    this.recommendations.find((rec) => rec.riskLevel === riskLevel) || {
      actions: ["Vui lòng liên hệ với chuyên gia để được tư vấn"],
      resources: [],
      urgency: "medium",
    }
  );
};

module.exports = mongoose.model("Assessment", assessmentSchema);

// Schema for storing user assessment results
const assessmentResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment",
      required: true,
    },
    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        answer: mongoose.Schema.Types.Mixed, // Can be string, number, or array
        answerText: String, // For 'other' options or text answers
      },
    ],
    score: {
      total: {
        type: Number,
        required: true,
      },
      breakdown: [
        {
          category: String,
          score: Number,
        },
      ],
    },
    riskLevel: {
      level: {
        type: String,
        enum: ["low", "moderate", "high", "severe"],
        required: true,
      },
      description: String,
    },
    recommendations: {
      actions: [String],
      resources: [
        {
          title: String,
          description: String,
          url: String,
          type: String,
        },
      ],
      urgency: String,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
    isSharedWithCounselor: {
      type: Boolean,
      default: false,
    },
    notes: String,
    followUpDate: Date,
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
assessmentResultSchema.index({ userId: 1, completedAt: -1 });
assessmentResultSchema.index({ assessmentId: 1, completedAt: -1 });

module.exports.AssessmentResult = mongoose.model(
  "AssessmentResult",
  assessmentResultSchema
);

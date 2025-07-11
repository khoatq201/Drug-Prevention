const mongoose = require("mongoose");

const programSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên chương trình là bắt buộc"],
      trim: true,
      maxlength: [200, "Tên chương trình không được vượt quá 200 ký tự"],
    },
    description: {
      type: String,
      required: [true, "Mô tả chương trình là bắt buộc"],
      maxlength: [2000, "Mô tả không được vượt quá 2000 ký tự"],
    },
    type: {
      type: String,
      required: [true, "Loại chương trình là bắt buộc"],
      enum: [
        "workshop", // Hội thảo
        "seminar", // Hội nghị
        "training", // Đào tạo
        "community_outreach", // Tiếp cận cộng đồng
        "awareness_campaign", // Chiến dịch tuyên truyền
        "support_group", // Nhóm hỗ trợ
        "prevention_program", // Chương trình phòng ngừa
        "rehabilitation", // Phục hồi
      ],
    },
    category: {
      type: String,
      required: [true, "Danh mục chương trình là bắt buộc"],
      enum: [
        "education", // Giáo dục
        "prevention", // Phòng ngừa
        "treatment", // Điều trị
        "support", // Hỗ trợ
        "advocacy", // Vận động
        "research", // Nghiên cứu
      ],
    },
    targetAudience: {
      ageGroups: [
        {
          type: String,
          enum: ["student", "university_student", "parent", "teacher", "other"],
        },
      ],
      demographics: [String], // Nhóm đối tượng cụ thể
      riskLevel: {
        type: String,
        enum: ["low", "moderate", "high", "all"],
        default: "all",
      },
    },
    schedule: {
      startDate: {
        type: Date,
        required: [true, "Ngày bắt đầu là bắt buộc"],
      },
      endDate: {
        type: Date,
        required: [true, "Ngày kết thúc là bắt buộc"],
      },
      duration: {
        type: Number, // Thời lượng tính bằng giờ
        required: [true, "Thời lượng chương trình là bắt buộc"],
      },
      sessions: [
        {
          title: {
            type: String,
            required: true,
          },
          description: String,
          date: {
            type: Date,
            required: true,
          },
          startTime: {
            type: String,
            required: true,
            match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Định dạng giờ không hợp lệ"],
          },
          endTime: {
            type: String,
            required: true,
            match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Định dạng giờ không hợp lệ"],
          },
          location: String,
          facilitator: String,
          maxParticipants: Number,
          currentParticipants: {
            type: Number,
            default: 0,
          },
          resources: [
            {
              title: String,
              type: {
                type: String,
                enum: ["document", "video", "audio", "link"],
              },
              url: String,
            },
          ],
          isCompleted: {
            type: Boolean,
            default: false,
          },
        },
      ],
    },
    location: {
      type: {
        type: String,
        enum: ["online", "offline", "hybrid"],
        default: "offline",
      },
      venue: String,
      address: String,
      city: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
      onlineDetails: {
        platform: String,
        meetingLink: String,
        meetingId: String,
        password: String,
      },
    },
    organizer: {
      organization: {
        type: String,
        required: true,
      },
      contact: {
        name: String,
        email: String,
        phone: String,
      },
      staffMembers: [
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          role: {
            type: String,
            enum: ["coordinator", "facilitator", "assistant", "volunteer"],
            default: "assistant",
          },
          responsibilities: [String],
        },
      ],
    },
    participants: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        registeredAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["registered", "confirmed", "attended", "cancelled", "no_show"],
          default: "registered",
        },
        attendedSessions: [
          {
            sessionId: mongoose.Schema.Types.ObjectId,
            attendedAt: Date,
            duration: Number, // minutes
          },
        ],
        completionRate: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },
        certificateIssued: {
          type: Boolean,
          default: false,
        },
        certificateUrl: String,
        notes: String,
      },
    ],
    capacity: {
      maxParticipants: {
        type: Number,
        required: [true, "Sức chứa tối đa là bắt buộc"],
        min: [1, "Sức chứa tối thiểu là 1"],
      },
      currentParticipants: {
        type: Number,
        default: 0,
      },
      waitingList: [
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          joinedAt: {
            type: Date,
            default: Date.now,
          },
          priority: {
            type: Number,
            default: 0,
          },
        },
      ],
    },
    registration: {
      isOpen: {
        type: Boolean,
        default: true,
      },
      openDate: Date,
      closeDate: Date,
      requiresApproval: {
        type: Boolean,
        default: false,
      },
      requirements: [String],
      fee: {
        amount: {
          type: Number,
          default: 0,
        },
        currency: {
          type: String,
          default: "VND",
        },
        isFree: {
          type: Boolean,
          default: true,
        },
      },
    },
    evaluation: {
      preAssessment: {
        isRequired: {
          type: Boolean,
          default: false,
        },
        assessmentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Assessment",
        },
        questions: [
          {
            question: String,
            type: {
              type: String,
              enum: ["text", "multiple_choice", "rating", "yes_no"],
            },
            options: [String],
            isRequired: {
              type: Boolean,
              default: false,
            },
          },
        ],
      },
      postAssessment: {
        isRequired: {
          type: Boolean,
          default: false,
        },
        assessmentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Assessment",
        },
        questions: [
          {
            question: String,
            type: {
              type: String,
              enum: ["text", "multiple_choice", "rating", "yes_no"],
            },
            options: [String],
            isRequired: {
              type: Boolean,
              default: false,
            },
          },
        ],
      },
      feedback: {
        overallRating: {
          type: Number,
          default: 0,
          min: 0,
          max: 5,
        },
        totalReviews: {
          type: Number,
          default: 0,
        },
        reviews: [
          {
            userId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
            },
            rating: {
              type: Number,
              min: 1,
              max: 5,
            },
            comment: String,
            aspects: {
              content: Number,
              delivery: Number,
              organization: Number,
              usefulness: Number,
            },
            submittedAt: {
              type: Date,
              default: Date.now,
            },
          },
        ],
      },
    },
    resources: [
      {
        title: {
          type: String,
          required: true,
        },
        description: String,
        type: {
          type: String,
          enum: ["document", "video", "audio", "link", "image"],
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        isPublic: {
          type: Boolean,
          default: false,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
        uploadedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    outcomes: {
      goals: [String],
      measurableOutcomes: [String],
      successMetrics: [
        {
          metric: String,
          target: Number,
          actual: Number,
          unit: String,
        },
      ],
      impact: {
        participantsSatisfaction: Number,
        knowledgeImprovement: Number,
        behaviorChange: Number,
        longTermImpact: String,
      },
    },
    status: {
      type: String,
      enum: ["planning", "registration_open", "in_progress", "completed", "cancelled"],
      default: "planning",
    },
    visibility: {
      type: String,
      enum: ["public", "private", "restricted"],
      default: "public",
    },
    tags: [String],
    language: {
      type: String,
      enum: ["vi", "en"],
      default: "vi",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for total sessions
programSchema.virtual("totalSessions").get(function () {
  return this.schedule.sessions.length;
});

// Virtual for completed sessions
programSchema.virtual("completedSessions").get(function () {
  return this.schedule.sessions.filter(session => session.isCompleted).length;
});

// Virtual for program progress
programSchema.virtual("progress").get(function () {
  if (this.totalSessions === 0) return 0;
  return Math.round((this.completedSessions / this.totalSessions) * 100);
});

// Virtual for average rating
programSchema.virtual("averageRating").get(function () {
  if (this.evaluation.feedback.totalReviews === 0) return 0;
  return this.evaluation.feedback.overallRating;
});

// Virtual for checking if registration is open
programSchema.virtual("isRegistrationOpen").get(function () {
  const now = new Date();
  return (
    this.registration.isOpen &&
    this.status === "registration_open" &&
    (!this.registration.closeDate || now <= this.registration.closeDate) &&
    this.capacity.currentParticipants < this.capacity.maxParticipants
  );
});

// Virtual for checking if program is full
programSchema.virtual("isFull").get(function () {
  return this.capacity.currentParticipants >= this.capacity.maxParticipants;
});

// Virtual for available spots
programSchema.virtual("availableSpots").get(function () {
  return Math.max(0, this.capacity.maxParticipants - this.capacity.currentParticipants);
});

// Index for efficient queries
programSchema.index({ status: 1, "schedule.startDate": 1 });
programSchema.index({ "targetAudience.ageGroups": 1, visibility: 1 });
programSchema.index({ category: 1, type: 1 });
programSchema.index({ "schedule.startDate": 1, "schedule.endDate": 1 });

// Pre-save middleware to update status based on dates
programSchema.pre("save", function (next) {
  const now = new Date();
  
  if (this.schedule.startDate > now && this.status === "planning") {
    this.status = "registration_open";
  } else if (this.schedule.startDate <= now && this.schedule.endDate > now && this.status === "registration_open") {
    this.status = "in_progress";
  } else if (this.schedule.endDate <= now && this.status === "in_progress") {
    this.status = "completed";
  }
  
  next();
});

// Static method to find programs by age group
programSchema.statics.findByAgeGroup = function (ageGroup) {
  return this.find({
    "targetAudience.ageGroups": ageGroup,
    visibility: "public",
    status: { $in: ["registration_open", "in_progress"] },
  });
};

// Static method to find upcoming programs
programSchema.statics.findUpcoming = function (limit = 10) {
  return this.find({
    "schedule.startDate": { $gte: new Date() },
    visibility: "public",
    status: { $in: ["registration_open", "in_progress"] },
  })
    .sort({ "schedule.startDate": 1 })
    .limit(limit);
};

// Method to check if user can register
programSchema.methods.canUserRegister = function (userId) {
  // Check if registration is open
  if (!this.isRegistrationOpen) return false;
  
  // Check if user is already registered
  const isRegistered = this.participants.some(
    (participant) => participant.userId.toString() === userId.toString()
  );
  if (isRegistered) return false;
  
  // Check if program is full
  if (this.isFull) return false;
  
  return true;
};

// Method to register user
programSchema.methods.registerUser = async function (userId, options = {}) {
  if (!this.canUserRegister(userId)) {
    throw new Error("Không thể đăng ký chương trình này");
  }
  
  this.participants.push({
    userId,
    status: this.registration.requiresApproval ? "registered" : "confirmed",
    ...options,
  });
  
  this.capacity.currentParticipants += 1;
  
  return this.save();
};

// Method to add user to waiting list
programSchema.methods.addToWaitingList = async function (userId, priority = 0) {
  const isInWaitingList = this.capacity.waitingList.some(
    (item) => item.userId.toString() === userId.toString()
  );
  
  if (isInWaitingList) {
    throw new Error("Bạn đã có trong danh sách chờ");
  }
  
  this.capacity.waitingList.push({
    userId,
    priority,
    joinedAt: new Date(),
  });
  
  // Sort waiting list by priority (higher priority first)
  this.capacity.waitingList.sort((a, b) => b.priority - a.priority);
  
  return this.save();
};

// Method to calculate completion rate for a participant
programSchema.methods.calculateParticipantCompletion = function (userId) {
  const participant = this.participants.find(
    (p) => p.userId.toString() === userId.toString()
  );
  
  if (!participant) return 0;
  
  const totalSessions = this.schedule.sessions.length;
  const attendedSessions = participant.attendedSessions.length;
  
  return totalSessions > 0 ? Math.round((attendedSessions / totalSessions) * 100) : 0;
};

// Method to get program statistics
programSchema.methods.getStatistics = function () {
  const totalParticipants = this.participants.length;
  const completedParticipants = this.participants.filter(p => p.completionRate >= 70).length;
  const averageCompletion = totalParticipants > 0 
    ? this.participants.reduce((sum, p) => sum + p.completionRate, 0) / totalParticipants 
    : 0;
  
  return {
    totalParticipants,
    completedParticipants,
    completionRate: Math.round(averageCompletion),
    sessionsCompleted: this.completedSessions,
    totalSessions: this.totalSessions,
    averageRating: this.averageRating,
    totalReviews: this.evaluation.feedback.totalReviews,
  };
};

module.exports = mongoose.model("Program", programSchema);
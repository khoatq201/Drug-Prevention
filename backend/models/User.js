const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Họ là bắt buộc"],
      trim: true,
      maxlength: [50, "Họ không được vượt quá 50 ký tự"],
    },
    lastName: {
      type: String,
      required: [true, "Tên là bắt buộc"],
      trim: true,
      maxlength: [50, "Tên không được vượt quá 50 ký tự"],
    },
    email: {
      type: String,
      required: [true, "Email là bắt buộc"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Email không hợp lệ",
      ],
    },
    password: {
      type: String,
      required: [true, "Mật khẩu là bắt buộc"],
      minlength: [6, "Mật khẩu phải có ít nhất 6 ký tự"],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[0-9+\-\s()]+$/, "Số điện thoại không hợp lệ"],
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
    },
    role: {
      type: String,
      enum: ["guest", "member", "staff", "consultant", "manager", "admin"],
      default: "guest",
    },
    ageGroup: {
      type: String,
      enum: ["student", "university_student", "parent", "teacher", "other"],
      required: [true, "Nhóm tuổi là bắt buộc"],
    },
    avatar: {
      type: String,
      default: null,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    // Lịch sử đánh giá rủi ro
    assessmentHistory: [
      {
        assessmentType: {
          type: String,
          enum: ["ASSIST", "CRAFFT", "AUDIT", "DAST"],
        },
        score: Number,
        riskLevel: {
          type: String,
          enum: ["low", "moderate", "high"],
        },
        recommendations: [String],
        completedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Lịch sử tham gia khóa học
    courseHistory: [
      {
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
        },
        enrolledAt: {
          type: Date,
          default: Date.now,
        },
        completedAt: Date,
        progress: {
          completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
          lastLesson: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson" },
          // Optionally, keep the old progress number for backward compatibility
          percent: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
          },
        },
        certificateUrl: String,
      },
    ],
    // Lịch sử đặt lịch hẹn
    appointmentHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment",
      },
    ],
    // Lịch sử tham gia chương trình
    programHistory: [
      {
        programId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Program",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        preAssessment: {
          score: Number,
          completedAt: Date,
        },
        postAssessment: {
          score: Number,
          completedAt: Date,
        },
      },
    ],
    preferences: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      smsNotifications: {
        type: Boolean,
        default: false,
      },
      language: {
        type: String,
        enum: ["vi", "en"],
        default: "vi",
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
userSchema.methods.checkPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Method to get current risk level
userSchema.methods.getCurrentRiskLevel = function () {
  if (this.assessmentHistory.length === 0) return "unknown";

  const latestAssessment =
    this.assessmentHistory[this.assessmentHistory.length - 1];
  return latestAssessment.riskLevel;
};

// Static method to find users by age group
userSchema.statics.findByAgeGroup = function (ageGroup) {
  return this.find({ ageGroup, isActive: true });
};

// Method to check role permissions
userSchema.methods.hasPermission = function (requiredRole) {
  const roleHierarchy = {
    guest: 0,
    member: 1,
    staff: 2,
    consultant: 3,
    manager: 4,
    admin: 5,
  };
  
  return roleHierarchy[this.role] >= roleHierarchy[requiredRole];
};

// Method to check if user can access resource
userSchema.methods.canAccess = function (resource) {
  const permissions = {
    guest: ['blog', 'courses', 'assessments'],
    member: ['blog', 'courses', 'assessments', 'appointments', 'profile'],
    staff: ['blog', 'courses', 'assessments', 'appointments', 'profile', 'programs'],
    consultant: ['blog', 'courses', 'assessments', 'appointments', 'profile', 'programs', 'counselor-management'],
    manager: ['blog', 'courses', 'assessments', 'appointments', 'profile', 'programs', 'counselor-management', 'user-management', 'reports'],
    admin: ['all'],
  };
  
  if (this.role === 'admin') return true;
  return permissions[this.role]?.includes(resource) || false;
};

module.exports = mongoose.model("User", userSchema);

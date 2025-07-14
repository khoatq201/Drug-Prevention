const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Tiêu đề khóa học là bắt buộc"],
      trim: true,
      maxlength: [200, "Tiêu đề không được vượt quá 200 ký tự"],
    },
    description: {
      type: String,
      required: [true, "Mô tả khóa học là bắt buộc"],
      maxlength: [1000, "Mô tả không được vượt quá 1000 ký tự"],
    },
    category: {
      type: String,
      required: [true, "Danh mục khóa học là bắt buộc"],
      enum: [
        "drug_awareness", // Nhận thức về ma túy
        "prevention_skills", // Kỹ năng phòng tránh
        "refusal_skills", // Kỹ năng từ chối
        "life_skills", // Kỹ năng sống
        "counseling", // Tư vấn
        "rehabilitation", // Phục hồi
      ],
    },
    targetAgeGroup: [
      {
        type: String,
        enum: ["student", "university_student", "parent", "teacher", "other"],
        required: true,
      },
    ],
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    duration: {
      type: Number, // Thời lượng tính bằng giờ
      required: [true, "Thời lượng khóa học là bắt buộc"],
      min: [0.5, "Thời lượng tối thiểu là 0.5 giờ"],
    },
    thumbnail: {
      type: String,
      default: null,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    modules: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
        },
        description: String,
        order: {
          type: Number,
          required: true,
        },
        isVisible: {
          type: Boolean,
          default: true,
        },
        lessons: [
          {
            title: {
              type: String,
              required: true,
              trim: true,
            },
            content: {
              type: String,
              required: true,
            },
            type: {
              type: String,
              enum: ["video", "text", "interactive", "quiz"],
              default: "text",
            },
            duration: Number, // Thời lượng bài học tính bằng phút
            videoUrl: String,
            resources: [
              {
                title: String,
                url: String,
                type: {
                  type: String,
                  enum: ["pdf", "doc", "video", "audio", "link"],
                },
              },
            ],
            order: {
              type: Number,
              required: true,
            },
            isVisible: {
              type: Boolean,
              default: true,
            },
          },
        ],
        quiz: {
          questions: [
            {
              question: {
                type: String,
                required: true,
              },
              options: [
                {
                  text: String,
                  isCorrect: Boolean,
                },
              ],
              explanation: String,
              points: {
                type: Number,
                default: 1,
              },
            },
          ],
          passingScore: {
            type: Number,
            default: 70,
          },
        },
      },
    ],
    instructors: [
      {
        name: {
          type: String,
          required: true,
        },
        bio: String,
        credentials: [String],
        avatar: String,
        contactEmail: String,
      },
    ],
    prerequisites: [String],
    learningObjectives: [String],
    certificate: {
      isAvailable: {
        type: Boolean,
        default: false,
      },
      template: String,
      requirements: {
        completionRate: {
          type: Number,
          default: 100,
        },
        minimumScore: {
          type: Number,
          default: 70,
        },
      },
    },
    enrollment: {
      isOpen: {
        type: Boolean,
        default: true,
      },
      maxStudents: {
        type: Number,
        default: null, // null means unlimited
      },
      currentEnrollment: {
        type: Number,
        default: 0,
      },
      enrollmentDeadline: Date,
    },
    pricing: {
      isFree: {
        type: Boolean,
        default: true,
      },
      price: {
        type: Number,
        default: 0,
      },
      currency: {
        type: String,
        default: "VND",
      },
    },
    ratings: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      totalReviews: {
        type: Number,
        default: 0,
      },
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: Date,
    tags: [String],
    language: {
      type: String,
      enum: ["vi", "en"],
      default: "vi",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for total lessons count
courseSchema.virtual("totalLessons").get(function () {
  if (!Array.isArray(this.modules)) return 0;
  return this.modules.reduce(
    (total, module) => total + (Array.isArray(module.lessons) ? module.lessons.length : 0),
    0
  );
});

// Virtual for estimated completion time
courseSchema.virtual("estimatedTime").get(function () {
  if (!Array.isArray(this.modules)) return 0;
  return this.modules.reduce((total, module) => {
    return (
      total +
      (Array.isArray(module.lessons)
        ? module.lessons.reduce((moduleTotal, lesson) => {
            return moduleTotal + (lesson.duration || 0);
          }, 0)
        : 0)
    );
  }, 0);
});

// Static method to find courses by age group
courseSchema.statics.findByAgeGroup = function (ageGroup) {
  return this.find({
    targetAgeGroup: ageGroup,
    isPublished: true,
    "enrollment.isOpen": true,
  });
};

// Static method to search courses
courseSchema.statics.searchCourses = function (query, filters = {}) {
  const searchCriteria = {
    isPublished: true,
    "enrollment.isOpen": true,
    ...filters,
  };

  if (query) {
    searchCriteria.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
      { tags: { $in: [new RegExp(query, "i")] } },
    ];
  }

  return this.find(searchCriteria);
};

// Method to check if user can enroll
courseSchema.methods.canEnroll = function () {
  if (!this.enrollment.isOpen) return false;
  if (!this.isPublished) return false;
  if (
    this.enrollment.enrollmentDeadline &&
    new Date() > this.enrollment.enrollmentDeadline
  )
    return false;
  if (
    this.enrollment.maxStudents &&
    this.enrollment.currentEnrollment >= this.enrollment.maxStudents
  )
    return false;

  return true;
};

module.exports = mongoose.model("Course", courseSchema);
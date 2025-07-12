const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Tiêu đề bài học là bắt buộc"],
      trim: true,
      maxlength: [200, "Tiêu đề không được vượt quá 200 ký tự"],
    },
    description: {
      type: String,
      maxlength: [1000, "Mô tả không được vượt quá 1000 ký tự"],
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course ID là bắt buộc"],
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Module ID là bắt buộc"],
    },
    type: {
      type: String,
      enum: ["video", "text", "interactive", "quiz", "document"],
      required: [true, "Loại bài học là bắt buộc"],
      default: "text",
    },
    content: {
      type: String,
      required: function() {
        return this.type === "text" || this.type === "interactive";
      },
    },
    videoUrl: {
      type: String,
      required: function() {
        return this.type === "video";
      },
      validate: {
        validator: function(v) {
          if (this.type !== "video") return true;
          // Support YouTube URLs, direct video URLs, and other video platforms
          const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
          const directVideoRegex = /\.(mp4|webm|ogg|avi|mov|wmv|flv|mkv)$/i;
          const vimeoRegex = /^(https?:\/\/)?(www\.)?(vimeo\.com\/)([0-9]+)/;
          
          return youtubeRegex.test(v) || directVideoRegex.test(v) || vimeoRegex.test(v);
        },
        message: "URL video không hợp lệ"
      }
    },
    videoDuration: {
      type: Number, // Duration in seconds
      default: 0,
    },
    videoThumbnail: {
      type: String,
    },
    documents: [
      {
        title: String,
        url: String,
        type: {
          type: String,
          enum: ["pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx"],
        },
        size: Number, // File size in bytes
      },
    ],
    quiz: {
      questions: [
        {
          question: {
            type: String,
            required: true,
          },
          type: {
            type: String,
            enum: ["multiple_choice", "true_false", "short_answer"],
            default: "multiple_choice",
          },
          options: [
            {
              text: String,
              isCorrect: Boolean,
            },
          ],
          correctAnswer: String, // For short answer questions
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
      timeLimit: {
        type: Number, // Time limit in minutes
        default: 0, // 0 means no time limit
      },
    },
    order: {
      type: Number,
      required: [true, "Thứ tự bài học là bắt buộc"],
    },
    duration: {
      type: Number, // Duration in minutes
      required: [true, "Thời lượng bài học là bắt buộc"],
      min: [1, "Thời lượng tối thiểu là 1 phút"],
    },
    prerequisites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
      },
    ],
    isPreview: {
      type: Boolean,
      default: false, // If true, lesson can be viewed without enrollment
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["active", "archived"],
      default: "active",
    },
    // Completion tracking
    completionCriteria: {
      type: String,
      enum: ["view", "time_spent", "quiz_passed", "manual"],
      default: "view",
    },
    minimumTimeSpent: {
      type: Number, // Minimum time in seconds to mark as completed
      default: 0,
    },
    // Resources and attachments
    resources: [
      {
        title: String,
        description: String,
        url: String,
        type: {
          type: String,
          enum: ["link", "download", "external"],
        },
      },
    ],
    // Notes for instructors
    instructorNotes: {
      type: String,
      maxlength: [2000, "Ghi chú không được vượt quá 2000 ký tự"],
    },
    // Metadata
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for YouTube video ID extraction
lessonSchema.virtual("youtubeVideoId").get(function () {
  if (this.type !== "video" || !this.videoUrl) return null;
  
  const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
  const match = this.videoUrl.match(youtubeRegex);
  return match ? match[1] : null;
});

// Virtual for embedded video URL
lessonSchema.virtual("embedVideoUrl").get(function () {
  if (this.type !== "video" || !this.videoUrl) return null;
  
  const youtubeId = this.youtubeVideoId;
  if (youtubeId) {
    return `https://www.youtube.com/embed/${youtubeId}`;
  }
  
  // For Vimeo
  const vimeoRegex = /vimeo\.com\/([0-9]+)/;
  const vimeoMatch = this.videoUrl.match(vimeoRegex);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  
  // For direct video URLs, return as is
  return this.videoUrl;
});

// Virtual for video thumbnail
lessonSchema.virtual("videoThumbnailUrl").get(function () {
  if (this.videoThumbnail) return this.videoThumbnail;
  
  const youtubeId = this.youtubeVideoId;
  if (youtubeId) {
    return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
  }
  
  return null;
});

// Index for efficient queries
lessonSchema.index({ courseId: 1, order: 1 });
lessonSchema.index({ moduleId: 1, order: 1 });
lessonSchema.index({ isPublished: 1, courseId: 1 });

// Pre-save middleware to auto-generate thumbnail for YouTube videos
lessonSchema.pre("save", function (next) {
  if (this.type === "video" && this.isModified("videoUrl") && !this.videoThumbnail) {
    const youtubeId = this.youtubeVideoId;
    if (youtubeId) {
      this.videoThumbnail = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
    }
  }
  next();
});

// Static method to find lessons by course
lessonSchema.statics.findByCourse = function (courseId, options = {}) {
  const query = {
    courseId,
    isPublished: true,
    ...options,
  };
  
  return this.find(query)
    .sort({ order: 1 })
    .populate("prerequisites", "title order");
};

// Static method to find lessons by module
lessonSchema.statics.findByModule = function (moduleId, options = {}) {
  const query = {
    moduleId,
    isPublished: true,
    ...options,
  };
  
  return this.find(query).sort({ order: 1 });
};

// Method to check if lesson is accessible for user
lessonSchema.methods.isAccessibleForUser = function (userProgress) {
  // If it's a preview lesson, always accessible
  if (this.isPreview) return true;
  
  // If no prerequisites, accessible
  if (!this.prerequisites || this.prerequisites.length === 0) return true;
  
  // Check if all prerequisites are completed
  const completedLessons = userProgress?.completedLessons || [];
  return this.prerequisites.every(prereqId => 
    completedLessons.some(completed => completed.lessonId.toString() === prereqId.toString())
  );
};

module.exports = mongoose.model("Lesson", lessonSchema);
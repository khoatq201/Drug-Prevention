const mongoose = require("mongoose");

const userProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID là bắt buộc"],
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course ID là bắt buộc"],
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["enrolled", "in_progress", "completed", "dropped"],
      default: "enrolled",
    },
    overallProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    completedLessons: [
      {
        lessonId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Lesson",
          required: true,
        },
        completedAt: {
          type: Date,
          default: Date.now,
        },
        timeSpent: {
          type: Number, // Time spent in seconds
          default: 0,
        },
        score: {
          type: Number, // Quiz score if applicable
          min: 0,
          max: 100,
        },
        attempts: {
          type: Number,
          default: 1,
        },
        notes: String, // User's personal notes for this lesson
      },
    ],
    currentLesson: {
      lessonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
      },
      startedAt: Date,
      lastPosition: {
        type: Number, // For video lessons, track last watched position in seconds
        default: 0,
      },
    },
    quizResults: [
      {
        lessonId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Lesson",
        },
        score: {
          type: Number,
          required: true,
        },
        totalQuestions: {
          type: Number,
          required: true,
        },
        correctAnswers: {
          type: Number,
          required: true,
        },
        timeSpent: Number, // Time spent on quiz in seconds
        answers: [
          {
            questionIndex: Number,
            selectedAnswer: mongoose.Schema.Types.Mixed,
            isCorrect: Boolean,
            timeSpent: Number,
          },
        ],
        completedAt: {
          type: Date,
          default: Date.now,
        },
        passed: {
          type: Boolean,
          required: true,
        },
      },
    ],
    totalTimeSpent: {
      type: Number, // Total time spent on course in seconds
      default: 0,
    },
    certificateIssued: {
      type: Boolean,
      default: false,
    },
    certificateIssuedAt: Date,
    certificateUrl: String,
    completedAt: Date,
    // Learning preferences
    preferences: {
      playbackSpeed: {
        type: Number,
        default: 1.0,
        min: 0.5,
        max: 2.0,
      },
      autoplay: {
        type: Boolean,
        default: false,
      },
      subtitles: {
        type: Boolean,
        default: false,
      },
    },
    // Bookmarks and notes
    bookmarks: [
      {
        lessonId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Lesson",
        },
        timestamp: Number, // For video lessons
        note: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Learning streaks and achievements
    learningStreak: {
      current: {
        type: Number,
        default: 0,
      },
      longest: {
        type: Number,
        default: 0,
      },
      lastStudyDate: Date,
    },
    achievements: [
      {
        type: {
          type: String,
          enum: ["first_lesson", "week_streak", "month_streak", "course_completed", "quiz_master"],
        },
        earnedAt: {
          type: Date,
          default: Date.now,
        },
        metadata: mongoose.Schema.Types.Mixed,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index for efficient queries
userProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });
userProgressSchema.index({ userId: 1, status: 1 });
userProgressSchema.index({ courseId: 1, status: 1 });

// Virtual for completion percentage
userProgressSchema.virtual("completionPercentage").get(function () {
  return this.overallProgress;
});

// Virtual for next lesson
userProgressSchema.virtual("nextLesson").get(function () {
  // This would be populated by the application logic
  return this._nextLesson;
});

// Method to mark lesson as completed
userProgressSchema.methods.completeLesson = async function (lessonId, data = {}) {
  const existingCompletion = this.completedLessons.find(
    completion => completion.lessonId.toString() === lessonId.toString()
  );

  if (existingCompletion) {
    // Update existing completion
    existingCompletion.timeSpent += data.timeSpent || 0;
    existingCompletion.score = data.score || existingCompletion.score;
    existingCompletion.attempts += 1;
    if (data.notes) existingCompletion.notes = data.notes;
  } else {
    // Add new completion
    this.completedLessons.push({
      lessonId,
      timeSpent: data.timeSpent || 0,
      score: data.score,
      notes: data.notes,
    });
  }

  this.totalTimeSpent += data.timeSpent || 0;
  this.lastAccessedAt = new Date();
  
  // Update learning streak
  this.updateLearningStreak();
  
  return this.save();
};

// Method to update current lesson
userProgressSchema.methods.updateCurrentLesson = async function (lessonId, position = 0) {
  this.currentLesson = {
    lessonId,
    startedAt: this.currentLesson?.lessonId?.toString() === lessonId.toString() 
      ? this.currentLesson.startedAt 
      : new Date(),
    lastPosition: position,
  };
  
  this.lastAccessedAt = new Date();
  
  if (this.status === "enrolled") {
    this.status = "in_progress";
  }
  
  return this.save();
};

// Method to calculate and update overall progress
userProgressSchema.methods.updateProgress = async function (totalLessons) {
  if (totalLessons === 0) {
    this.overallProgress = 0;
    return this.save();
  }
  
  const completedCount = this.completedLessons.length;
  this.overallProgress = Math.round((completedCount / totalLessons) * 100);
  
  // Check if course is completed
  if (this.overallProgress >= 100 && this.status !== "completed") {
    this.status = "completed";
    this.completedAt = new Date();
    
    // Award completion achievement
    this.achievements.push({
      type: "course_completed",
      metadata: { courseId: this.courseId },
    });
  }
  
  return this.save();
};

// Method to update learning streak
userProgressSchema.methods.updateLearningStreak = function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastStudy = this.learningStreak.lastStudyDate;
  
  if (!lastStudy) {
    // First time studying
    this.learningStreak.current = 1;
    this.learningStreak.longest = 1;
    this.learningStreak.lastStudyDate = today;
  } else {
    const lastStudyDate = new Date(lastStudy);
    lastStudyDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((today - lastStudyDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      // Consecutive day
      this.learningStreak.current += 1;
      this.learningStreak.longest = Math.max(
        this.learningStreak.longest,
        this.learningStreak.current
      );
      this.learningStreak.lastStudyDate = today;
      
      // Award streak achievements
      if (this.learningStreak.current === 7) {
        this.achievements.push({ type: "week_streak" });
      } else if (this.learningStreak.current === 30) {
        this.achievements.push({ type: "month_streak" });
      }
    } else if (daysDiff > 1) {
      // Streak broken
      this.learningStreak.current = 1;
      this.learningStreak.lastStudyDate = today;
    }
    // If daysDiff === 0, same day, no change needed
  }
};

// Method to add bookmark
userProgressSchema.methods.addBookmark = async function (lessonId, timestamp, note) {
  this.bookmarks.push({
    lessonId,
    timestamp,
    note,
  });
  
  return this.save();
};

// Method to remove bookmark
userProgressSchema.methods.removeBookmark = async function (bookmarkId) {
  this.bookmarks = this.bookmarks.filter(
    bookmark => bookmark._id.toString() !== bookmarkId.toString()
  );
  
  return this.save();
};

// Static method to get user progress for course
userProgressSchema.statics.findByUserAndCourse = function (userId, courseId) {
  return this.findOne({ userId, courseId })
    .populate("completedLessons.lessonId", "title type duration")
    .populate("currentLesson.lessonId", "title type duration")
    .populate("bookmarks.lessonId", "title");
};

// Static method to get user's enrolled courses
userProgressSchema.statics.findByUser = function (userId, options = {}) {
  const query = { userId, ...options };
  
  return this.find(query)
    .populate("courseId", "title description thumbnail level duration")
    .sort({ lastAccessedAt: -1 });
};

module.exports = mongoose.model("UserProgress", userProgressSchema);
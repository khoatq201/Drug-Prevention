const mongoose = require("mongoose");

const counselorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID là bắt buộc"],
      unique: true,
    },
    // Professional Information
    credentials: [
      {
        type: {
          type: String,
          enum: ["degree", "certificate", "license", "award", "training"],
          required: true,
        },
        title: {
          type: String,
          required: true,
          trim: true,
        },
        institution: {
          type: String,
          required: true,
          trim: true,
        },
        year: {
          type: Number,
          required: true,
        },
        expiryDate: Date,
        isActive: {
          type: Boolean,
          default: true,
        },
        documentUrl: String,
      },
    ],
    specializations: [
      {
        type: String,
        enum: [
          "addiction_counseling", // Tư vấn nghiện
          "youth_counseling", // Tư vấn trẻ em - thanh thiếu niên
          "family_therapy", // Trị liệu gia đình
          "group_therapy", // Trị liệu nhóm
          "cognitive_behavioral", // Liệu pháp nhận thức hành vi
          "motivational_interviewing", // Phỏng vấn thúc đẩy động lực
          "trauma_therapy", // Trị liệu chấn thương
          "crisis_intervention", // Can thiệp khủng hoảng
          "prevention_education", // Giáo dục phòng ngừa
          "harm_reduction", // Giảm thiểu tác hại
          "recovery_coaching", // Huấn luyện phục hồi
          "relapse_prevention", // Phòng ngừa tái phạm
        ],
      },
    ],
    languages: [
      {
        language: {
          type: String,
          enum: ["vi", "en", "zh", "fr", "ja", "ko"],
          required: true,
        },
        proficiency: {
          type: String,
          enum: ["basic", "intermediate", "advanced", "native"],
          default: "intermediate",
        },
      },
    ],
    experience: {
      totalYears: {
        type: Number,
        required: [true, "Số năm kinh nghiệm là bắt buộc"],
        min: [0, "Số năm kinh nghiệm không thể âm"],
      },
      workHistory: [
        {
          organization: {
            type: String,
            required: true,
            trim: true,
          },
          position: {
            type: String,
            required: true,
            trim: true,
          },
          startDate: {
            type: Date,
            required: true,
          },
          endDate: Date,
          isCurrent: {
            type: Boolean,
            default: false,
          },
          description: String,
          achievements: [String],
        },
      ],
    },
    // Professional Profile
    biography: {
      type: String,
      maxlength: [2000, "Tiểu sử không được vượt quá 2000 ký tự"],
    },
    approach: {
      type: String,
      maxlength: [1000, "Phương pháp tiếp cận không được vượt quá 1000 ký tự"],
    },
    areasOfExpertise: [String],
    clientTypes: [
      {
        type: String,
        enum: ["individual", "couple", "family", "group", "children", "adolescents", "adults", "seniors"],
      },
    ],
    // Availability and Schedule
    availability: {
      timezone: {
        type: String,
        default: "Asia/Ho_Chi_Minh",
      },
      workingHours: {
        monday: {
          isAvailable: { type: Boolean, default: true },
          slots: [
            {
              start: String, // "09:00"
              end: String, // "17:00"
            },
          ],
        },
        tuesday: {
          isAvailable: { type: Boolean, default: true },
          slots: [
            {
              start: String,
              end: String,
            },
          ],
        },
        wednesday: {
          isAvailable: { type: Boolean, default: true },
          slots: [
            {
              start: String,
              end: String,
            },
          ],
        },
        thursday: {
          isAvailable: { type: Boolean, default: true },
          slots: [
            {
              start: String,
              end: String,
            },
          ],
        },
        friday: {
          isAvailable: { type: Boolean, default: true },
          slots: [
            {
              start: String,
              end: String,
            },
          ],
        },
        saturday: {
          isAvailable: { type: Boolean, default: false },
          slots: [
            {
              start: String,
              end: String,
            },
          ],
        },
        sunday: {
          isAvailable: { type: Boolean, default: false },
          slots: [
            {
              start: String,
              end: String,
            },
          ],
        },
      },
      exceptions: [
        {
          date: Date,
          isAvailable: Boolean,
          reason: String,
          alternativeSlots: [
            {
              start: String,
              end: String,
            },
          ],
        },
      ],
    },
    // Session Settings
    sessionSettings: {
      defaultDuration: {
        type: Number,
        default: 60, // minutes
        min: [15, "Thời gian tối thiểu là 15 phút"],
        max: [180, "Thời gian tối đa là 180 phút"],
      },
      sessionTypes: [
        {
          type: String,
          enum: ["individual", "group", "family", "couple"],
          duration: Number,
          price: Number,
          isActive: {
            type: Boolean,
            default: true,
          },
        },
      ],
      breakBetweenSessions: {
        type: Number,
        default: 15, // minutes
      },
      maxAppointmentsPerDay: {
        type: Number,
        default: 8,
      },
      advanceBookingDays: {
        type: Number,
        default: 30,
      },
      cancellationPolicy: {
        allowCancellation: {
          type: Boolean,
          default: true,
        },
        minimumNoticeHours: {
          type: Number,
          default: 24,
        },
        cancellationFee: {
          type: Number,
          default: 0,
        },
      },
    },
    // Performance Metrics
    performance: {
      totalSessions: {
        type: Number,
        default: 0,
      },
      totalClients: {
        type: Number,
        default: 0,
      },
      averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      totalReviews: {
        type: Number,
        default: 0,
      },
      completionRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      responseTime: {
        type: Number, // hours
        default: 24,
      },
      successStories: [
        {
          description: String,
          outcome: String,
          anonymized: {
            type: Boolean,
            default: true,
          },
          date: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
    // Reviews and Feedback
    reviews: [
      {
        appointmentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Appointment",
        },
        clientId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        comment: String,
        aspects: {
          professionalism: Number,
          communication: Number,
          effectiveness: Number,
          empathy: Number,
          punctuality: Number,
        },
        isAnonymous: {
          type: Boolean,
          default: true,
        },
        isVerified: {
          type: Boolean,
          default: false,
        },
        submittedAt: {
          type: Date,
          default: Date.now,
        },
        response: {
          comment: String,
          respondedAt: Date,
        },
      },
    ],
    // Contact and Communication
    contactPreferences: {
      preferredContactMethod: {
        type: String,
        enum: ["email", "phone", "platform"],
        default: "email",
      },
      businessPhone: String,
      businessEmail: String,
      emergencyContact: {
        name: String,
        relationship: String,
        phone: String,
      },
    },
    // Professional Status
    status: {
      type: String,
      enum: ["active", "on_leave", "unavailable", "suspended"],
      default: "active",
    },
    verificationStatus: {
      isVerified: {
        type: Boolean,
        default: false,
      },
      verifiedAt: Date,
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      documents: [
        {
          type: String,
          url: String,
          uploadedAt: {
            type: Date,
            default: Date.now,
          },
          isVerified: {
            type: Boolean,
            default: false,
          },
        },
      ],
    },
    // Settings and Preferences
    settings: {
      isPublicProfile: {
        type: Boolean,
        default: true,
      },
      allowOnlineConsultations: {
        type: Boolean,
        default: true,
      },
      allowEmergencyConsultations: {
        type: Boolean,
        default: false,
      },
      autoConfirmAppointments: {
        type: Boolean,
        default: false,
      },
      sendReminders: {
        type: Boolean,
        default: true,
      },
      shareStatistics: {
        type: Boolean,
        default: true,
      },
    },
    // Metadata
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
    notes: String, // Internal notes (admin only)
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for active credentials
counselorSchema.virtual("activeCredentials").get(function () {
  return this.credentials.filter(cred => cred.isActive);
});

// Virtual for years of experience
counselorSchema.virtual("yearsOfExperience").get(function () {
  const now = new Date();
  const startYear = Math.min(
    ...this.experience.workHistory.map(work => work.startDate.getFullYear())
  );
  return now.getFullYear() - startYear;
});

// Virtual for current position
counselorSchema.virtual("currentPosition").get(function () {
  const currentJob = this.experience.workHistory.find(work => work.isCurrent);
  return currentJob ? `${currentJob.position} at ${currentJob.organization}` : null;
});

// Virtual for overall rating breakdown
counselorSchema.virtual("ratingBreakdown").get(function () {
  if (this.reviews.length === 0) return null;
  
  const breakdown = {
    professionalism: 0,
    communication: 0,
    effectiveness: 0,
    empathy: 0,
    punctuality: 0,
  };
  
  let count = 0;
  this.reviews.forEach(review => {
    if (review.aspects) {
      Object.keys(breakdown).forEach(aspect => {
        if (review.aspects[aspect]) {
          breakdown[aspect] += review.aspects[aspect];
          count++;
        }
      });
    }
  });
  
  if (count > 0) {
    Object.keys(breakdown).forEach(aspect => {
      breakdown[aspect] = Math.round((breakdown[aspect] / count) * 10) / 10;
    });
  }
  
  return breakdown;
});

// Virtual for availability summary
counselorSchema.virtual("availabilitySummary").get(function () {
  const days = Object.keys(this.availability.workingHours);
  const availableDays = days.filter(day => this.availability.workingHours[day].isAvailable);
  
  return {
    totalDays: days.length,
    availableDays: availableDays.length,
    workingDays: availableDays,
  };
});

// Index for efficient queries
counselorSchema.index({ userId: 1 });
counselorSchema.index({ specializations: 1 });
counselorSchema.index({ status: 1, "verificationStatus.isVerified": 1 });
counselorSchema.index({ "performance.averageRating": -1 });
counselorSchema.index({ "languages.language": 1 });

// Static method to find available counselors
counselorSchema.statics.findAvailable = function (filters = {}) {
  const query = {
    status: "active",
    "verificationStatus.isVerified": true,
    "settings.isPublicProfile": true,
    ...filters,
  };
  
  return this.find(query)
    .populate("userId", "firstName lastName avatar")
    .sort({ "performance.averageRating": -1, "performance.totalReviews": -1 });
};

// Static method to search counselors by criteria
counselorSchema.statics.searchCounselor = function (criteria) {
  const query = {
    status: "active",
    "verificationStatus.isVerified": true,
    "settings.isPublicProfile": true,
  };
  
  if (criteria.specialization) {
    query.specializations = criteria.specialization;
  }
  
  if (criteria.language) {
    query["languages.language"] = criteria.language;
  }
  
  if (criteria.clientType) {
    query.clientTypes = criteria.clientType;
  }
  
  if (criteria.minRating) {
    query["performance.averageRating"] = { $gte: criteria.minRating };
  }
  
  return this.find(query)
    .populate("userId", "firstName lastName avatar")
    .sort({ "performance.averageRating": -1 });
};

// Method to check availability for a specific date and time
counselorSchema.methods.isAvailable = function (date, startTime, endTime) {
  const dayOfWeek = [
    "sunday", "monday", "tuesday", "wednesday", 
    "thursday", "friday", "saturday"
  ][date.getDay()];
  
  const daySchedule = this.availability.workingHours[dayOfWeek];
  
  if (!daySchedule.isAvailable) return false;
  
  // Check if time falls within working hours
  const isInWorkingHours = daySchedule.slots.some(slot => {
    return startTime >= slot.start && endTime <= slot.end;
  });
  
  if (!isInWorkingHours) return false;
  
  // Check for exceptions
  const exception = this.availability.exceptions.find(exc => 
    exc.date.toDateString() === date.toDateString()
  );
  
  if (exception) {
    if (!exception.isAvailable) return false;
    
    if (exception.alternativeSlots.length > 0) {
      return exception.alternativeSlots.some(slot => 
        startTime >= slot.start && endTime <= slot.end
      );
    }
  }
  
  return true;
};

// Method to update performance metrics
counselorSchema.methods.updatePerformance = async function () {
  // This would typically be called after appointments or reviews
  // Implementation would calculate metrics from related data
  
  const totalReviews = this.reviews.length;
  if (totalReviews > 0) {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.performance.averageRating = Math.round((totalRating / totalReviews) * 10) / 10;
    this.performance.totalReviews = totalReviews;
  }
  
  this.lastActiveAt = new Date();
  return this.save();
};

// Method to add review
counselorSchema.methods.addReview = async function (reviewData) {
  this.reviews.push(reviewData);
  await this.updatePerformance();
  return this.save();
};

// Method to get available time slots for a date
counselorSchema.methods.getAvailableSlots = function (date, duration = 60) {
  const dayOfWeek = [
    "sunday", "monday", "tuesday", "wednesday", 
    "thursday", "friday", "saturday"
  ][date.getDay()];
  
  const daySchedule = this.availability.workingHours[dayOfWeek];
  
  if (!daySchedule.isAvailable) return [];
  
  const slots = [];
  const breakTime = this.sessionSettings.breakBetweenSessions;
  
  daySchedule.slots.forEach(slot => {
    const startTime = this.parseTime(slot.start);
    const endTime = this.parseTime(slot.end);
    
    let currentTime = startTime;
    while (currentTime + duration <= endTime) {
      slots.push({
        start: this.formatTime(currentTime),
        end: this.formatTime(currentTime + duration),
      });
      currentTime += duration + breakTime;
    }
  });
  
  return slots;
};

// Helper method to parse time string to minutes
counselorSchema.methods.parseTime = function (timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

// Helper method to format minutes to time string
counselorSchema.methods.formatTime = function (minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

module.exports = mongoose.model("Counselor", counselorSchema);
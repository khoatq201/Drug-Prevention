const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID là bắt buộc"],
    },
    counselorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Counselor ID là bắt buộc"],
    },
    appointmentDate: {
      type: Date,
      required: [true, "Ngày hẹn là bắt buộc"],
    },
    appointmentTime: {
      start: {
        type: String,
        required: [true, "Giờ bắt đầu là bắt buộc"],
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Định dạng giờ không hợp lệ"],
      },
      end: {
        type: String,
        required: [true, "Giờ kết thúc là bắt buộc"],
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Định dạng giờ không hợp lệ"],
      },
    },
    type: {
      type: String,
      enum: ["online", "in_person", "phone"],
      required: [true, "Loại cuộc hẹn là bắt buộc"],
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled", "no_show"],
      default: "pending",
    },
    reason: {
      type: String,
      required: [true, "Lý do đặt lịch là bắt buộc"],
      maxlength: [500, "Lý do không được vượt quá 500 ký tự"],
    },
    urgency: {
      type: String,
      enum: ["low", "medium", "high", "emergency"],
      default: "medium",
    },
    contactInfo: {
      preferredContact: {
        type: String,
        enum: ["email", "phone", "both"],
        default: "email",
      },
      phoneNumber: {
        type: String,
        match: [/^[0-9+\-\s()]+$/, "Số điện thoại không hợp lệ"],
      },
      email: {
        type: String,
        lowercase: true,
        trim: true,
        match: [
          /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
          "Email không hợp lệ",
        ],
      },
    },
    // Thông tin cuộc hẹn online
    onlineInfo: {
      meetingLink: String,
      meetingId: String,
      platform: {
        type: String,
        enum: ["zoom", "google_meet", "teams", "other"],
      },
    },
    // Thông tin cuộc hẹn trực tiếp
    locationInfo: {
      address: String,
      room: String,
      notes: String,
    },
    // Ghi chú và theo dõi
    notes: {
      userNotes: String, // Ghi chú của người dùng
      counselorNotes: String, // Ghi chú của counselor
      adminNotes: String, // Ghi chú của admin
    },
    // Đánh giá sau cuộc hẹn
    feedback: {
      userRating: {
        type: Number,
        min: 1,
        max: 5,
      },
      userComment: String,
      counselorRating: {
        type: Number,
        min: 1,
        max: 5,
      },
      counselorComment: String,
      completedAt: Date,
    },
    // Lịch sử thay đổi
    statusHistory: [
      {
        status: {
          type: String,
          enum: ["pending", "confirmed", "completed", "cancelled", "no_show"],
        },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
        reason: String,
      },
    ],
    // Thông tin nhắc nhở
    reminders: {
      email: {
        sent: {
          type: Boolean,
          default: false,
        },
        sentAt: Date,
      },
      sms: {
        sent: {
          type: Boolean,
          default: false,
        },
        sentAt: Date,
      },
    },
    // Metadata
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringPattern: {
      frequency: {
        type: String,
        enum: ["weekly", "biweekly", "monthly"],
      },
      endDate: Date,
      occurrences: Number,
    },
    // Liên kết với đánh giá rủi ro
    relatedAssessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AssessmentResult",
    },
    // Quyền riêng tư
    isPrivate: {
      type: Boolean,
      default: true,
    },
    // Cancellation policy
    cancellationPolicy: {
      canCancel: {
        type: Boolean,
        default: true,
      },
      cancellationDeadline: {
        type: Number, // hours before appointment
        default: 24,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for full appointment datetime
appointmentSchema.virtual("appointmentDateTime").get(function () {
  const date = new Date(this.appointmentDate);
  const [hours, minutes] = this.appointmentTime.start.split(":");
  date.setHours(parseInt(hours), parseInt(minutes));
  return date;
});

// Virtual for appointment duration in minutes
appointmentSchema.virtual("durationMinutes").get(function () {
  const start = this.appointmentTime.start.split(":");
  const end = this.appointmentTime.end.split(":");
  const startMinutes = parseInt(start[0]) * 60 + parseInt(start[1]);
  const endMinutes = parseInt(end[0]) * 60 + parseInt(end[1]);
  return endMinutes - startMinutes;
});

// Virtual for checking if appointment is upcoming
appointmentSchema.virtual("isUpcoming").get(function () {
  const now = new Date();
  const appointmentDateTime = this.appointmentDateTime;
  return appointmentDateTime > now && this.status === "confirmed";
});

// Virtual for checking if appointment can be cancelled
appointmentSchema.virtual("canCancel").get(function () {
  if (!this.cancellationPolicy.canCancel) return false;
  if (this.status !== "pending" && this.status !== "confirmed") return false;
  
  const now = new Date();
  const appointmentDateTime = this.appointmentDateTime;
  const hoursUntilAppointment = (appointmentDateTime - now) / (1000 * 60 * 60);
  
  return hoursUntilAppointment > this.cancellationPolicy.cancellationDeadline;
});

// Index for efficient queries
appointmentSchema.index({ userId: 1, appointmentDate: -1 });
appointmentSchema.index({ counselorId: 1, appointmentDate: -1 });
appointmentSchema.index({ status: 1, appointmentDate: -1 });
appointmentSchema.index({ appointmentDate: 1, "appointmentTime.start": 1 });

// Pre-save middleware to add status history
appointmentSchema.pre("save", function (next) {
  if (this.isModified("status") && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      changedBy: this.modifiedBy || this.createdBy,
      changedAt: new Date(),
    });
  }
  next();
});

// Static method to find available time slots
appointmentSchema.statics.findAvailableSlots = async function (
  counselorId,
  date,
  duration = 60
) {
  const Counselor = require('./Counselor');
  
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  // Find the counselor to get their availability
  const counselor = await Counselor.findOne({ userId: counselorId });
  if (!counselor) {
    return [];
  }
  
  // Get counselor's available slots for the date
  const requestedDate = new Date(date);
  const availableSlots = counselor.getAvailableSlots(requestedDate, duration);
  
  // Get existing appointments for the date
  const existingAppointments = await this.find({
    counselorId,
    appointmentDate: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
    status: { $in: ["pending", "confirmed"] },
  }).select("appointmentTime");
  
  // Filter out booked slots
  const bookedTimes = existingAppointments.map(apt => apt.appointmentTime.start);
  const freeSlots = availableSlots.filter(slot => 
    !bookedTimes.includes(slot.start)
  );
  
  return freeSlots;
};

// Static method to find appointments by date range
appointmentSchema.statics.findByDateRange = function (startDate, endDate, options = {}) {
  const query = {
    appointmentDate: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
    ...options,
  };
  
  return this.find(query)
    .populate("userId", "firstName lastName email phone")
    .populate("counselorId", "firstName lastName email specialization")
    .sort({ appointmentDate: 1, "appointmentTime.start": 1 });
};

// Method to send reminder
appointmentSchema.methods.sendReminder = async function (type = "email") {
  // Implementation for sending reminders would go here
  // This would integrate with email/SMS services
  console.log(`Sending ${type} reminder for appointment ${this._id}`);
};

// Method to check conflicts
appointmentSchema.methods.hasConflict = async function () {
  const conflicts = await this.constructor.find({
    _id: { $ne: this._id },
    counselorId: this.counselorId,
    appointmentDate: this.appointmentDate,
    status: { $in: ["pending", "confirmed"] },
    $or: [
      {
        "appointmentTime.start": {
          $lt: this.appointmentTime.end,
          $gte: this.appointmentTime.start,
        },
      },
      {
        "appointmentTime.end": {
          $gt: this.appointmentTime.start,
          $lte: this.appointmentTime.end,
        },
      },
    ],
  });
  
  return conflicts.length > 0;
};

module.exports = mongoose.model("Appointment", appointmentSchema);
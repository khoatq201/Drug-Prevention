const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    index: true,
  },
  otp: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["registration", "password_reset", "SET_PASSWORD"],
    index: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // Tự động xóa sau 10 phút
  },
});

// Index để tăng hiệu suất query
otpSchema.index({ email: 1, type: 1 });
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });

// Method để verify OTP
otpSchema.methods.verifyOTP = function (inputOTP) {
  // Convert cả hai về string và trim để đảm bảo không có khoảng trắng
  const input = String(inputOTP).trim();
  const stored = String(this.otp).trim();

  console.log("🔍 OTP Verification in model:", {
    input,
    stored,
    inputLength: input.length,
    storedLength: stored.length,
    isEqual: input === stored,
    verified: this.verified,
  });

  return input === stored && !this.verified;
};

// Static method để tìm OTP hợp lệ
otpSchema.statics.findValidOTP = function (email, type) {
  return this.findOne({
    email,
    type,
    verified: false,
    attempts: { $lt: 5 }, // Tối đa 5 lần thử
    createdAt: { $gt: new Date(Date.now() - 600000) }, // Trong vòng 10 phút
  });
};

// Static method để cleanup OTP cũ
otpSchema.statics.cleanupOldOTPs = function (email, type) {
  console.log("🧹 Cleaning up old OTPs for:", { email, type });
  // Xóa TẤT CẢ OTP cũ cho email và type này, không phân biệt trạng thái
  return this.deleteMany({
    email,
    type,
  });
};

// Static method để verify OTP
otpSchema.statics.verifyOTP = async function (email, inputOTP, type) {
  console.log("🔍 Verifying OTP:", { email, inputOTP, type });

  try {
    // Tìm OTP hợp lệ
    const otp = await this.findValidOTP(email, type);

    if (!otp) {
      console.log("❌ No valid OTP found");
      return false;
    }

    console.log("✅ Found OTP, verifying...");

    // Verify OTP
    const isValid = otp.verifyOTP(inputOTP);

    if (isValid) {
      // Mark as verified
      otp.verified = true;
      await otp.save();
      console.log("✅ OTP verified successfully");
      return true;
    } else {
      // Increment attempts
      otp.attempts += 1;
      await otp.save();
      console.log("❌ OTP verification failed");
      return false;
    }
  } catch (error) {
    console.error("❌ Error verifying OTP:", error);
    return false;
  }
};

const OTP = mongoose.model("OTP", otpSchema);

module.exports = OTP;

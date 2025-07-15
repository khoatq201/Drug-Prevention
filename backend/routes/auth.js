const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const OTP = require("../models/OTP");
const { auth } = require("../middleware/auth");
const passport = require("../config/passport");
const {
  generateOTP,
  sendRegistrationOTP,
  sendPasswordResetOTP,
} = require("../utils/emailService");

const router = express.Router();

// Utility function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "24h",
  });
};

// Utility function to generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || "7d",
  });
};

// @route   POST /api/auth/send-registration-otp
// @desc    Gửi OTP để xác thực đăng ký
// @access  Public
router.post("/send-registration-otp", async (req, res) => {
  try {
    const { email, firstName } = req.body;

    if (!email || !firstName) {
      return res.status(400).json({
        success: false,
        message: "Email và tên không được để trống",
      });
    }

    // Kiểm tra email đã tồn tại
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email đã được sử dụng",
      });
    }

    // Cleanup OTP cũ
    await OTP.cleanupOldOTPs(email, "registration");

    // Tạo OTP mới
    const otpCode = generateOTP();
    const otp = new OTP({
      email,
      otp: otpCode,
      type: "registration",
    });

    await otp.save();

    // Gửi email
    await sendRegistrationOTP(email, firstName, otpCode);

    res.json({
      success: true,
      message: "Mã xác thực đã được gửi đến email của bạn",
    });
  } catch (error) {
    console.error("Send registration OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Không thể gửi mã xác thực",
    });
  }
});

// @route   POST /api/auth/verify-registration-otp
// @desc    Xác thực OTP đăng ký
// @access  Public
router.post("/verify-registration-otp", async (req, res) => {
  try {
    const { email, otp: inputOTP } = req.body;

    if (!email || !inputOTP) {
      return res.status(400).json({
        success: false,
        message: "Email và mã OTP không được để trống",
      });
    }

    // Tìm OTP hợp lệ
    const otpRecord = await OTP.findValidOTP(email, "registration");
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Mã OTP không hợp lệ hoặc đã hết hạn",
      });
    }

    // Tăng số lần thử
    otpRecord.attempts += 1;

    if (!otpRecord.verifyOTP(inputOTP)) {
      await otpRecord.save();

      if (otpRecord.attempts >= 5) {
        return res.status(400).json({
          success: false,
          message: "Đã vượt quá số lần thử. Vui lòng yêu cầu mã mới",
        });
      }

      return res.status(400).json({
        success: false,
        message: `Mã OTP không đúng. Còn ${5 - otpRecord.attempts} lần thử`,
      });
    }

    // Đánh dấu OTP đã verified
    otpRecord.verified = true;
    await otpRecord.save();

    res.json({
      success: true,
      message: "Xác thực OTP thành công",
    });
  } catch (error) {
    console.error("Verify registration OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xác thực OTP",
    });
  }
});

// @route   POST /api/auth/register
// @desc    Đăng ký tài khoản mới (sau khi đã xác thực OTP)
// @access  Public
router.post("/register", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      dateOfBirth,
      gender,
      ageGroup,
    } = req.body;

    // Kiểm tra email đã tồn tại
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email đã được sử dụng",
      });
    }

    // Kiểm tra OTP đã được xác thực chưa
    const verifiedOTP = await OTP.findOne({
      email,
      type: "registration",
      verified: true,
      createdAt: { $gt: new Date(Date.now() - 600000) }, // Trong vòng 10 phút
    });

    if (!verifiedOTP) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng xác thực email trước khi đăng ký",
      });
    }

    // Tạo user mới
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      phone,
      dateOfBirth,
      gender,
      ageGroup,
      isEmailVerified: true, // Đánh dấu đã verify email qua OTP
    });

    await user.save();

    // Xóa OTP đã sử dụng
    await OTP.deleteMany({ email, type: "registration" });

    // Tạo tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Loại bỏ password khỏi response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công",
      user: userResponse,
      token,
      refreshToken,
    });
  } catch (error) {
    console.error("Register error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ",
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Lỗi server khi đăng ký",
    });
  }
});

// @route   POST /api/auth/login
// @desc    Đăng nhập
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập email và mật khẩu",
      });
    }

    // Tìm user và include password để kiểm tra
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    // Kiểm tra mật khẩu
    const isPasswordMatch = await user.checkPassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    // Kiểm tra tài khoản có bị vô hiệu hóa
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Tài khoản đã bị vô hiệu hóa",
      });
    }

    // Cập nhật last login
    user.lastLogin = new Date();
    await user.save();

    // Tạo tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Loại bỏ password khỏi response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: "Đăng nhập thành công",
      user: userResponse,
      token,
      refreshToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi đăng nhập",
    });
  }
});

// @route   GET /api/auth/profile
// @desc    Lấy thông tin profile hiện tại
// @access  Private
router.get("/profile", auth, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy thông tin profile",
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Cập nhật thông tin profile
// @access  Private
router.put("/profile", auth, async (req, res) => {
  try {
    const allowedUpdates = [
      "firstName",
      "lastName",
      "phone",
      "dateOfBirth",
      "gender",
      "ageGroup",
      "avatar",
      "preferences",
    ];

    const updates = {};
    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy user",
      });
    }

    res.json({
      success: true,
      message: "Cập nhật profile thành công",
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ",
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật profile",
    });
  }
});

// @route   POST /api/auth/change-password
// @desc    Đổi mật khẩu
// @access  Private
router.post("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin",
      });
    }

    // Lấy user với password
    const user = await User.findById(req.user._id).select("+password");

    // Kiểm tra mật khẩu hiện tại
    const isCurrentPasswordValid = await user.checkPassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu hiện tại không đúng",
      });
    }

    // Cập nhật mật khẩu mới
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: "Đổi mật khẩu thành công",
    });
  } catch (error) {
    console.error("Change password error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Mật khẩu mới không hợp lệ",
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Lỗi server khi đổi mật khẩu",
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Gửi OTP để reset mật khẩu
// @access  Public
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email không được để trống",
      });
    }

    // Kiểm tra user có tồn tại không
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài khoản với email này",
      });
    }

    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        message: "Tài khoản đã bị vô hiệu hóa",
      });
    }

    // Cleanup OTP cũ
    const cleanupResult = await OTP.cleanupOldOTPs(email, "password_reset");
    console.log("🧹 Cleanup result:", cleanupResult);

    // Tạo OTP mới
    const otpCode = generateOTP();

    const otp = new OTP({
      email,
      otp: otpCode,
      type: "password_reset",
    });

    await otp.save();

    // Gửi email
    await sendPasswordResetOTP(email, user.firstName, otpCode);

    res.json({
      success: true,
      message: "Mã xác thực đã được gửi đến email của bạn",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Không thể gửi mã xác thực",
    });
  }
});

// @route   POST /api/auth/verify-reset-otp
// @desc    Xác thực OTP reset mật khẩu
// @access  Public
router.post("/verify-reset-otp", async (req, res) => {
  try {
    const { email, otp: inputOTP } = req.body;

    console.log("🔍 Verify reset OTP - Input:", {
      email,
      inputOTP,
      inputOTPType: typeof inputOTP,
      inputOTPLength: inputOTP ? inputOTP.length : 0,
    });

    if (!email || !inputOTP) {
      return res.status(400).json({
        success: false,
        message: "Email và mã OTP không được để trống",
      });
    }

    // Tìm OTP hợp lệ
    const otpRecord = await OTP.findValidOTP(email, "password_reset");

    console.log("🔍 Found OTP record:", {
      found: !!otpRecord,
      storedOTP: otpRecord ? otpRecord.otp : null,
      storedOTPType: otpRecord ? typeof otpRecord.otp : null,
      storedOTPLength: otpRecord ? otpRecord.otp.length : 0,
      attempts: otpRecord ? otpRecord.attempts : null,
      verified: otpRecord ? otpRecord.verified : null,
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Mã OTP không hợp lệ hoặc đã hết hạn",
      });
    }

    // Tăng số lần thử
    otpRecord.attempts += 1;

    console.log("🔍 Comparing OTPs:", {
      input: inputOTP,
      stored: otpRecord.otp,
      isEqual: inputOTP === otpRecord.otp,
      trimmedEqual: inputOTP.trim() === otpRecord.otp.trim(),
      stringInput: String(inputOTP),
      stringStored: String(otpRecord.otp),
    });

    if (!otpRecord.verifyOTP(inputOTP)) {
      await otpRecord.save();

      if (otpRecord.attempts >= 5) {
        return res.status(400).json({
          success: false,
          message: "Đã vượt quá số lần thử. Vui lòng yêu cầu mã mới",
        });
      }

      return res.status(400).json({
        success: false,
        message: `Mã OTP không đúng. Còn ${5 - otpRecord.attempts} lần thử`,
      });
    }

    // Đánh dấu OTP đã verified
    otpRecord.verified = true;
    await otpRecord.save();

    res.json({
      success: true,
      message: "Xác thực OTP thành công",
    });
  } catch (error) {
    console.error("Verify reset OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xác thực OTP",
    });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Đặt lại mật khẩu mới (sau khi đã xác thực OTP)
// @access  Public
router.post("/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email và mật khẩu mới không được để trống",
      });
    }

    // Kiểm tra OTP đã được xác thực chưa
    const verifiedOTP = await OTP.findOne({
      email,
      type: "password_reset",
      verified: true,
      createdAt: { $gt: new Date(Date.now() - 600000) }, // Trong vòng 10 phút
    });

    if (!verifiedOTP) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng xác thực OTP trước khi đặt lại mật khẩu",
      });
    }

    // Tìm và cập nhật user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài khoản",
      });
    }

    // Cập nhật mật khẩu
    user.password = newPassword;
    await user.save();

    // Xóa OTP đã sử dụng
    await OTP.deleteMany({ email, type: "password_reset" });

    res.json({
      success: true,
      message: "Đặt lại mật khẩu thành công",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Mật khẩu mới không hợp lệ",
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Lỗi server khi đặt lại mật khẩu",
    });
  }
});

// @route   POST /api/auth/refresh-token
// @desc    Làm mới access token
// @access  Public
router.post("/refresh-token", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token không được cung cấp",
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Refresh token không hợp lệ",
      });
    }

    const newToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    res.json({
      success: true,
      token: newToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(401).json({
      success: false,
      message: "Refresh token không hợp lệ hoặc đã hết hạn",
    });
  }
});
// Google OAuth routes
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);
router.get("/google/callback", [
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONT_END_URL || "http://localhost:5173"}/login?error=Google login failed`,
  }),
  async (req, res) => {
    try {
      console.log("Google callback - User data:", req.user);

      // Tạo JWT token
      const accessToken = generateToken(req.user._id);
      const refreshToken = generateRefreshToken(req.user._id);

      // Tạo user response object
      const userResponse = {
        _id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        avatar: req.user.avatar,
        role: req.user.role,
        ageGroup: req.user.ageGroup,
        isEmailVerified: req.user.isEmailVerified,
        isActive: req.user.isActive,
      };

      console.log("Google login successful for user:", req.user.fullName);

      // Get frontend URL from environment
      const frontendUrl = process.env.FRONT_END_URL || "http://localhost:5173";
      console.log("Frontend URL from env:", frontendUrl);
      console.log("Redirecting to:", frontendUrl);

      // Encode user data and tokens for frontend
      const userData = encodeURIComponent(
        JSON.stringify({
          user: userResponse,
          token: accessToken,
          refreshToken: refreshToken,
        })
      );

      // Redirect to frontend with user data
      const redirectUrl = `${frontendUrl}/auth/google/success?data=${userData}`;
      console.log("Redirect URL:", redirectUrl);
      return res.redirect(redirectUrl);
    } catch (error) {
      console.error("Error in Google callback:", error);
      const frontendUrl = process.env.FRONT_END_URL || "http://localhost:5173";
      return res.redirect(
        `${frontendUrl}/login?error=${encodeURIComponent("Login failed. Please try again.")}`
      );
    }
  },
]);

// @route   POST /api/auth/send-set-password-otp
// @desc    Gửi OTP để đặt mật khẩu lần đầu cho user chưa verify email
// @access  Private (user phải đăng nhập)
router.post("/send-set-password-otp", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    // Chỉ cho phép gửi OTP nếu user chưa verify email hoặc chưa có password
    if (user.isEmailVerified && user.hasPassword()) {
      return res.status(400).json({
        success: false,
        message:
          "Tài khoản đã được xác thực và có mật khẩu. Vui lòng sử dụng chức năng đổi mật khẩu.",
      });
    }

    console.log(`Sending set password OTP to user: ${user.email}`);

    // Cleanup old OTPs
    await OTP.cleanupOldOTPs(user.email, "SET_PASSWORD");

    // Generate và gửi OTP
    const otpCode = generateOTP();

    const newOTP = new OTP({
      email: user.email,
      otp: otpCode,
      type: "SET_PASSWORD",
    });

    await newOTP.save();
    console.log(`OTP saved for ${user.email}: ${otpCode}`);

    // Gửi email với template phù hợp
    await sendPasswordResetOTP(user.email, user.firstName, otpCode);
    console.log(`Set password OTP sent successfully to ${user.email}`);

    res.json({
      success: true,
      message: "Mã OTP đã được gửi đến email của bạn",
      expiresIn: 600, // 10 phút
    });
  } catch (error) {
    console.error("Send set password OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi gửi mã OTP",
    });
  }
});

// @route   POST /api/auth/set-password-with-otp
// @desc    Đặt mật khẩu lần đầu sau khi verify OTP
// @access  Private (user phải đăng nhập)
router.post("/set-password-with-otp", auth, async (req, res) => {
  try {
    const { otp, newPassword } = req.body;

    if (!otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu phải có ít nhất 6 ký tự",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    console.log(
      `Verifying set password OTP for user: ${user.email}, OTP: ${otp}`
    );

    // Verify OTP
    const isValidOTP = await OTP.verifyOTP(user.email, otp, "SET_PASSWORD");

    if (!isValidOTP) {
      console.log(`Invalid OTP for ${user.email}: ${otp}`);
      return res.status(400).json({
        success: false,
        message: "Mã OTP không đúng hoặc đã hết hạn",
      });
    }

    console.log(`Valid OTP for ${user.email}, setting password`);

    // Đặt mật khẩu mới và verify email
    user.password = newPassword;
    user.isEmailVerified = true;
    await user.save();

    // Cleanup OTP sau khi sử dụng
    await OTP.cleanupOldOTPs(user.email, "SET_PASSWORD");

    console.log(`Password set successfully for ${user.email}`);

    res.json({
      success: true,
      message: "Đặt mật khẩu thành công! Tài khoản của bạn đã được xác thực.",
    });
  } catch (error) {
    console.error("Set password with OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi đặt mật khẩu",
    });
  }
});

// @route   PUT /api/auth/change-password
// @desc    Đổi mật khẩu cho user đã verify email
// @access  Private
router.put("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu mới phải có ít nhất 6 ký tự",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    // Kiểm tra user đã verify email
    if (!user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng xác thực email trước khi đổi mật khẩu",
      });
    }

    // Nếu user đã có mật khẩu, cần xác thực mật khẩu cũ
    if (user.hasPassword()) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng nhập mật khẩu hiện tại",
        });
      }

      const isValidPassword = await user.checkPassword(currentPassword);
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          message: "Mật khẩu hiện tại không đúng",
        });
      }
    }

    // Cập nhật mật khẩu mới
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: user.hasPassword()
        ? "Mật khẩu đã được thay đổi thành công"
        : "Mật khẩu đã được tạo thành công",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi thay đổi mật khẩu",
    });
  }
});

module.exports = router;

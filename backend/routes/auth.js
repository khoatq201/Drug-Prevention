const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { auth } = require("../middleware/auth");

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

// @route   POST /api/auth/register
// @desc    Đăng ký tài khoản mới
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
    });

    await user.save();

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

module.exports = router;

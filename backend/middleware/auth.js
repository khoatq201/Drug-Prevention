const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware xác thực token
const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token truy cập không được cung cấp",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Tài khoản đã bị vô hiệu hóa",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token đã hết hạn",
      });
    }

    res.status(500).json({
      success: false,
      message: "Lỗi xác thực",
    });
  }
};

// Middleware kiểm tra vai trò
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập để truy cập",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền truy cập",
      });
    }

    next();
  };
};

// Middleware kiểm tra quyền truy cập riêng tư (chỉ chính chủ hoặc admin)
const authorizeOwnerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Vui lòng đăng nhập để truy cập",
    });
  }

  const userId = req.params.userId || req.params.id;

  if (req.user.role === "admin" || req.user._id.toString() === userId) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Không có quyền truy cập thông tin này",
  });
};

// Middleware xác thực email (tuỳ chọn)
const requireEmailVerification = (req, res, next) => {
  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: "Vui lòng xác thực email trước khi tiếp tục",
      needEmailVerification: true,
    });
  }

  next();
};

module.exports = {
  auth,
  authorize,
  authorizeOwnerOrAdmin,
  requireEmailVerification,
};

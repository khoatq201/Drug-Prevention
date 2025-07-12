const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware xác thực token
const auth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    console.log("🔍 Auth header:", authHeader);

    const token = authHeader?.replace("Bearer ", "");
    console.log("🔍 Extracted token:", token ? "exists" : "missing");

    if (!token) {
      console.log("❌ No token provided");
      return res.status(401).json({
        success: false,
        message: "Token truy cập không được cung cấp",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token decoded:", decoded);

    const user = await User.findById(decoded.userId).select("-password");
    console.log("🔍 User found:", user ? user.email : "not found");

    if (!user) {
      console.log("❌ User not found for token");
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ",
      });
    }

    if (!user.isActive) {
      console.log("❌ User inactive");
      return res.status(401).json({
        success: false,
        message: "Tài khoản đã bị vô hiệu hóa",
      });
    }

    req.user = user;
    console.log("✅ Auth successful for:", user.email);
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

    // Check if user has any of the required roles using hierarchy
    const hasPermission = roles.some((role) => req.user.hasPermission(role));

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền truy cập",
      });
    }

    next();
  };
};

// Middleware kiểm tra quyền truy cập tài nguyên cụ thể
const authorizeResource = (resource) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập để truy cập",
      });
    }

    if (!req.user.canAccess(resource)) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền truy cập tài nguyên này",
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

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) {
      req.user = null;
      return next();
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    if (!user || !user.isActive) {
      req.user = null;
      return next();
    }
    req.user = user;
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

module.exports = {
  auth,
  authorize,
  authorizeResource,
  authorizeOwnerOrAdmin,
  requireEmailVerification,
  optionalAuth,
};

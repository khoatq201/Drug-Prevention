const express = require("express");
const router = express.Router();

// Temporary placeholder routes - will be implemented later

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Users routes placeholder",
    routes: [
      "GET /api/users - Get all users (admin only)",
      "GET /api/users/:id - Get user by ID",
      "PUT /api/users/:id - Update user",
      "DELETE /api/users/:id - Delete user (admin only)",
      "GET /api/users/:id/courses - Get user courses",
      "GET /api/users/:id/assessments - Get user assessments",
      "GET /api/users/:id/appointments - Get user appointments",
    ],
  });
});

module.exports = router;

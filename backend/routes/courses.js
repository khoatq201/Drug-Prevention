const express = require("express");
const router = express.Router();

// Temporary placeholder routes - will be implemented later

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Courses routes placeholder",
    routes: [
      "GET /api/courses - Get all courses",
      "GET /api/courses/:id - Get course by ID",
      "POST /api/courses - Create new course (admin only)",
      "PUT /api/courses/:id - Update course (admin only)",
      "DELETE /api/courses/:id - Delete course (admin only)",
      "POST /api/courses/:id/enroll - Enroll in course",
      "GET /api/courses/search - Search courses",
      "GET /api/courses/categories - Get course categories",
    ],
  });
});

module.exports = router;

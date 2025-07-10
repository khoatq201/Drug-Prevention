const express = require("express");
const router = express.Router();

// Temporary placeholder routes - will be implemented later

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Counselors routes placeholder",
    routes: [
      "GET /api/counselors - Get all counselors",
      "GET /api/counselors/:id - Get counselor by ID",
      "POST /api/counselors - Create new counselor (admin only)",
      "PUT /api/counselors/:id - Update counselor info",
      "DELETE /api/counselors/:id - Remove counselor (admin only)",
      "GET /api/counselors/:id/schedule - Get counselor schedule",
      "PUT /api/counselors/:id/schedule - Update counselor schedule",
      "GET /api/counselors/search - Search counselors by specialty",
    ],
  });
});

module.exports = router;

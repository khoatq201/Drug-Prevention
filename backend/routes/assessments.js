const express = require("express");
const router = express.Router();

// Temporary placeholder routes - will be implemented later

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Assessments routes placeholder",
    routes: [
      "GET /api/assessments - Get all assessments",
      "GET /api/assessments/:id - Get assessment by ID",
      "POST /api/assessments/:id/take - Take assessment",
      "GET /api/assessments/results/:userId - Get user assessment results",
      "POST /api/assessments - Create new assessment (admin only)",
      "PUT /api/assessments/:id - Update assessment (admin only)",
      "DELETE /api/assessments/:id - Delete assessment (admin only)",
    ],
  });
});

module.exports = router;

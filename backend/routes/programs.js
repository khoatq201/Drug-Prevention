const express = require("express");
const router = express.Router();

// Temporary placeholder routes - will be implemented later

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Programs routes placeholder",
    routes: [
      "GET /api/programs - Get all programs",
      "GET /api/programs/:id - Get program by ID",
      "POST /api/programs - Create new program (admin only)",
      "PUT /api/programs/:id - Update program (admin only)",
      "DELETE /api/programs/:id - Delete program (admin only)",
      "POST /api/programs/:id/join - Join program",
      "POST /api/programs/:id/assessment - Submit program assessment",
      "GET /api/programs/:id/participants - Get program participants",
    ],
  });
});

module.exports = router;

const express = require("express");
const router = express.Router();

// Temporary placeholder routes - will be implemented later

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Appointments routes placeholder",
    routes: [
      "GET /api/appointments - Get all appointments",
      "GET /api/appointments/:id - Get appointment by ID",
      "POST /api/appointments - Create new appointment",
      "PUT /api/appointments/:id - Update appointment",
      "DELETE /api/appointments/:id - Cancel appointment",
      "GET /api/appointments/user/:userId - Get user appointments",
      "GET /api/appointments/counselor/:counselorId - Get counselor appointments",
      "GET /api/appointments/available-slots - Get available time slots",
    ],
  });
});

module.exports = router;

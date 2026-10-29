const express = require("express");
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  cancelBooking,
  getBookingsForEvent,
} = require("../controllers/bookingController");
const { protect, admin } = require("../middleware/authMiddleware");

router.post("/", protect, createBooking);
router.get("/my", protect, getMyBookings);
router.put("/:id/cancel", protect, cancelBooking);
router.get("/event/:eventId", protect, admin, getBookingsForEvent);

module.exports = router;

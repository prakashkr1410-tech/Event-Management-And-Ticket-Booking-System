const QRCode = require("qrcode");
const crypto = require("crypto");
const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Event = require("../models/Event");

const generateBookingCode = () => {
  return "EMTBS-" + crypto.randomBytes(4).toString("hex").toUpperCase();
};

// @desc    Book tickets for an event
// @route   POST /api/bookings
const createBooking = async (req, res) => {
  let reservedEvent;
  let requested;

  try {
    const { eventId, numberOfTickets } = req.body;

    if (!mongoose.isValidObjectId(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    requested = Number(numberOfTickets);
    if (!Number.isSafeInteger(requested) || requested < 1) {
      return res.status(400).json({ message: "Invalid number of tickets" });
    }

    const bookingCode = generateBookingCode();
    const qrCode = await QRCode.toDataURL(bookingCode);

    reservedEvent = await Event.findOneAndUpdate(
      {
        _id: eventId,
        $expr: {
          $lte: [
            { $add: [{ $ifNull: ["$bookedSeats", 0] }, requested] },
            "$totalSeats",
          ],
        },
      },
      { $inc: { bookedSeats: requested } },
      { new: true }
    );

    if (!reservedEvent) {
      const event = await Event.findById(eventId).select("totalSeats bookedSeats");
      if (!event) return res.status(404).json({ message: "Event not found" });

      const availableSeats = Math.max(0, event.totalSeats - event.bookedSeats);
      return res.status(400).json({
        message: `Only ${availableSeats} seat(s) left for this event`,
      });
    }

    const booking = await Booking.create({
      user: req.user._id,
      event: reservedEvent._id,
      numberOfTickets: requested,
      totalAmount: requested * reservedEvent.price,
      bookingCode,
      qrCode,
      status: "confirmed",
      paymentStatus: "paid",
    });

    res.status(201).json(booking);
  } catch (error) {
    if (reservedEvent && requested) {
      try {
        const rollback = await Event.updateOne(
          { _id: reservedEvent._id, bookedSeats: { $gte: requested } },
          { $inc: { bookedSeats: -requested } }
        );
        if (rollback.modifiedCount !== 1) {
          console.error(`Could not release seats after failed booking for event ${reservedEvent._id}`);
        }
      } catch (rollbackError) {
        console.error(`Could not release seats after failed booking: ${rollbackError.message}`);
      }
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged-in user's bookings
// @route   GET /api/bookings/my
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("event", "title date time venue bannerImage")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
const cancelBooking = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    const booking = await Booking.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
        status: "confirmed",
      },
      {
        $set: { status: "cancelled", paymentStatus: "refunded" },
      },
      { new: true }
    );

    if (!booking) {
      const existingBooking = await Booking.findById(req.params.id);
      if (!existingBooking) return res.status(404).json({ message: "Booking not found" });
      if (existingBooking.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not authorized to cancel this booking" });
      }
      if (existingBooking.status === "cancelled") {
        return res.status(400).json({ message: "Booking already cancelled" });
      }
      return res.status(403).json({ message: "Not authorized to cancel this booking" });
    }

    try {
      const release = await Event.updateOne(
        { _id: booking.event, bookedSeats: { $gte: booking.numberOfTickets } },
        { $inc: { bookedSeats: -booking.numberOfTickets } }
      );
      if (release.modifiedCount !== 1) {
        throw new Error(`Could not release seats for cancelled booking ${booking._id}`);
      }
    } catch (error) {
      const restored = await Booking.updateOne(
        { _id: booking._id, status: "cancelled" },
        { $set: { status: "confirmed", paymentStatus: "paid" } }
      );
      if (restored.modifiedCount !== 1) {
        console.error(`Could not restore booking ${booking._id} after seat release failed`);
      }
      throw error;
    }

    res.json({ message: "Booking cancelled", booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bookings for an event (admin only)
// @route   GET /api/bookings/event/:eventId
const getBookingsForEvent = async (req, res) => {
  try {
    const bookings = await Booking.find({ event: req.params.eventId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createBooking, getMyBookings, cancelBooking, getBookingsForEvent };

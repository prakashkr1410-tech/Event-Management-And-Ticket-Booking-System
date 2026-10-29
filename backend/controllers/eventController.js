const Event = require("../models/Event");

// @desc    Create a new event (admin only)
// @route   POST /api/events
const createEvent = async (req, res) => {
  try {
    const { title, description, category, date, time, venue, bannerImage, price, totalSeats } = req.body;

    const event = await Event.create({
      title,
      description,
      category,
      date,
      time,
      venue,
      bannerImage,
      price,
      totalSeats,
      createdBy: req.user._id,
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all events (supports search & category filter)
// @route   GET /api/events?search=&category=
const getEvents = async (req, res) => {
  try {
    const { search, category } = req.query;
    const query = {};

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }
    if (category && category !== "All") {
      query.category = category;
    }

    const events = await Event.find(query).sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update event (admin only)
// @route   PUT /api/events/:id
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const editableFields = [
      "title",
      "description",
      "category",
      "date",
      "time",
      "venue",
      "bannerImage",
      "price",
      "totalSeats",
    ];
    for (const field of editableFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        event[field] = req.body[field];
      }
    }
    if (event.totalSeats < event.bookedSeats) {
      return res.status(400).json({
        message: `totalSeats cannot be lower than the ${event.bookedSeats} already booked seat(s)`,
      });
    }

    const updated = await event.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete event (admin only)
// @route   DELETE /api/events/:id
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    await event.deleteOne();
    res.json({ message: "Event removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get events created by logged-in admin
// @route   GET /api/events/admin/mine
const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ createdBy: req.user._id }).sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createEvent, getEvents, getEventById, updateEvent, deleteEvent, getMyEvents };

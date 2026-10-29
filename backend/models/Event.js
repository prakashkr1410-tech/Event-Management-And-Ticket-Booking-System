const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["Music", "Sports", "Conference", "Workshop", "Comedy", "Theatre", "Other"],
      default: "Other",
    },
    date: { type: Date, required: true },
    time: { type: String, required: true }, // e.g. "18:30"
    venue: { type: String, required: true },
    bannerImage: { type: String, default: "" }, // URL or path
    price: { type: Number, required: true, min: 0 },
    totalSeats: { type: Number, required: true, min: 1 },
    bookedSeats: { type: Number, default: 0, min: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

eventSchema.index({ date: 1 });
eventSchema.index({ category: 1, date: 1 });

// Virtual: seats still available
eventSchema.virtual("availableSeats").get(function () {
  return this.totalSeats - this.bookedSeats;
});

eventSchema.set("toJSON", { virtuals: true });
eventSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Event", eventSchema);

const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    numberOfTickets: { type: Number, required: true, min: 1 },
    totalAmount: { type: Number, required: true },
    bookingCode: { type: String, required: true, unique: true }, // e.g. EMTBS-XXXXXX
    qrCode: { type: String, default: "" }, // base64 data URL
    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "pending", "refunded"],
      default: "paid", // mock payment auto-confirms for this mini project
    },
  },
  { timestamps: true }
);

bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ event: 1, createdAt: -1 });

module.exports = mongoose.model("Booking", bookingSchema);

import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const EventDetails = () => {
  const { id } = useParams();
  const { userInfo } = useContext(AuthContext);
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState(1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchEvent = async () => {
    try {
      const { data } = await api.get(`/events/${id}`);
      setEvent(data);
    } catch (err) {
      setError("Event not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleBook = async () => {
    if (!userInfo) {
      navigate("/login");
      return;
    }
    setError("");
    setMessage("");
    setSubmitting(true);
    try {
      const { data } = await api.post("/bookings", { eventId: id, numberOfTickets: tickets });
      setBooking(data);
      setMessage("Booking confirmed! Your e-ticket is below.");
      fetchEvent(); // refresh seat count
    } catch (err) {
      setError(err.response?.data?.message || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!event) return <p className="text-center mt-10 text-red-600">{error}</p>;

  const seatsLeft = event.totalSeats - event.bookedSeats;
  const dateStr = new Date(event.date).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <img
        src={event.bannerImage || "https://placehold.co/800x300?text=Event"}
        alt={event.title}
        className="w-full h-64 object-cover rounded-xl mb-6"
      />
      <span className="text-sm font-semibold text-primary uppercase">{event.category}</span>
      <h1 className="text-3xl font-bold mt-1">{event.title}</h1>
      <p className="text-gray-600 mt-2">{event.description}</p>

      <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
        <p><strong>Date:</strong> {dateStr}</p>
        <p><strong>Time:</strong> {event.time}</p>
        <p><strong>Venue:</strong> {event.venue}</p>
        <p><strong>Price:</strong> ₹{event.price} / ticket</p>
        <p><strong>Seats left:</strong> {seatsLeft}</p>
      </div>

      {!booking && seatsLeft > 0 && (
        <div className="mt-8 bg-white p-6 rounded-xl shadow-md">
          <h3 className="font-semibold mb-3">Book Tickets</h3>
          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              max={seatsLeft}
              value={tickets}
              onChange={(e) => setTickets(Number(e.target.value))}
              className="w-20 border rounded-md px-3 py-2"
            />
            <span className="text-sm text-gray-500">
              Total: ₹{tickets * event.price}
            </span>
          </div>
          <button
            onClick={handleBook}
            disabled={submitting}
            className="mt-4 bg-primary text-white px-5 py-2 rounded-md font-medium hover:bg-indigo-700 disabled:opacity-60"
          >
            {submitting ? "Processing payment..." : "Pay & Book Now"}
          </button>
        </div>
      )}

      {seatsLeft === 0 && !booking && (
        <p className="mt-6 text-red-600 font-medium">This event is sold out.</p>
      )}

      {booking && (
        <div className="mt-8 bg-green-50 border border-green-200 p-6 rounded-xl text-center">
          <p className="text-green-700 font-medium mb-3">{message}</p>
          <p className="text-sm mb-1">Booking Code: <strong>{booking.bookingCode}</strong></p>
          <p className="text-sm mb-3">Tickets: {booking.numberOfTickets} • Paid: ₹{booking.totalAmount}</p>
          {booking.qrCode && (
            <img src={booking.qrCode} alt="Ticket QR Code" className="mx-auto w-40 h-40" />
          )}
        </div>
      )}
    </div>
  );
};

export default EventDetails;

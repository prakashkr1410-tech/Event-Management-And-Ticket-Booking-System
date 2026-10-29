import React, { useEffect, useState } from "react";
import api from "../api/axios";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const { data } = await api.get("/bookings/my");
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      await api.put(`/bookings/${id}/cancel`);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || "Cancellation failed");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Bookings</h1>
      {bookings.length === 0 ? (
        <p className="text-gray-500">You haven't booked any events yet.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b._id} className="bg-white rounded-xl shadow-md p-5 flex gap-4">
              <img
                src={b.event?.bannerImage || "https://placehold.co/120x120?text=Event"}
                alt={b.event?.title}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-bold">{b.event?.title || "Event removed"}</h3>
                <p className="text-sm text-gray-500">
                  {b.event?.date && new Date(b.event.date).toLocaleDateString()} • {b.event?.venue}
                </p>
                <p className="text-sm mt-1">
                  Tickets: {b.numberOfTickets} • Paid: ₹{b.totalAmount}
                </p>
                <p className="text-sm">
                  Code: <strong>{b.bookingCode}</strong> •{" "}
                  <span className={b.status === "cancelled" ? "text-red-600" : "text-green-600"}>
                    {b.status}
                  </span>
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                {b.qrCode && <img src={b.qrCode} alt="QR" className="w-16 h-16" />}
                {b.status === "confirmed" && (
                  <button
                    onClick={() => handleCancel(b._id)}
                    className="text-xs text-red-600 border border-red-600 rounded-md px-2 py-1 hover:bg-red-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;

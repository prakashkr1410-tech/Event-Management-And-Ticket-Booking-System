import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [bookings, setBookings] = useState([]);

  const fetchMyEvents = async () => {
    try {
      const { data } = await api.get("/events/admin/mine");
      setEvents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event? This cannot be undone.")) return;
    try {
      await api.delete(`/events/${id}`);
      fetchMyEvents();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete event");
    }
  };

  const toggleAttendees = async (eventId) => {
    if (expandedEvent === eventId) {
      setExpandedEvent(null);
      return;
    }
    try {
      const { data } = await api.get(`/bookings/event/${eventId}`);
      setBookings(data);
      setExpandedEvent(eventId);
    } catch (err) {
      console.error(err);
    }
  };

  const totalRevenue = events.reduce((sum, e) => sum + e.bookedSeats * e.price, 0);
  const totalTicketsSold = events.reduce((sum, e) => sum + e.bookedSeats, 0);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Link
          to="/admin/create-event"
          className="bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700"
        >
          + New Event
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-md p-4 text-center">
          <p className="text-2xl font-bold">{events.length}</p>
          <p className="text-sm text-gray-500">Events Created</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 text-center">
          <p className="text-2xl font-bold">{totalTicketsSold}</p>
          <p className="text-sm text-gray-500">Tickets Sold</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 text-center">
          <p className="text-2xl font-bold">₹{totalRevenue}</p>
          <p className="text-sm text-gray-500">Total Revenue</p>
        </div>
      </div>

      {events.length === 0 ? (
        <p className="text-gray-500">You haven't created any events yet.</p>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event._id} className="bg-white rounded-xl shadow-md p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">{event.title}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(event.date).toLocaleDateString()} • {event.venue}
                  </p>
                  <p className="text-sm mt-1">
                    {event.bookedSeats}/{event.totalSeats} seats booked • ₹{event.price}/ticket
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleAttendees(event._id)}
                    className="text-xs border border-primary text-primary rounded-md px-3 py-1 hover:bg-indigo-50"
                  >
                    {expandedEvent === event._id ? "Hide" : "View"} Attendees
                  </button>
                  <Link
                    to={`/admin/edit-event/${event._id}`}
                    className="text-xs border border-gray-400 text-gray-600 rounded-md px-3 py-1 hover:bg-gray-50"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(event._id)}
                    className="text-xs border border-red-600 text-red-600 rounded-md px-3 py-1 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {expandedEvent === event._id && (
                <div className="mt-4 border-t pt-4">
                  {bookings.length === 0 ? (
                    <p className="text-sm text-gray-500">No bookings yet.</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-500">
                          <th className="pb-2">Attendee</th>
                          <th className="pb-2">Email</th>
                          <th className="pb-2">Tickets</th>
                          <th className="pb-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((b) => (
                          <tr key={b._id} className="border-t">
                            <td className="py-2">{b.user?.name}</td>
                            <td className="py-2">{b.user?.email}</td>
                            <td className="py-2">{b.numberOfTickets}</td>
                            <td className="py-2">{b.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

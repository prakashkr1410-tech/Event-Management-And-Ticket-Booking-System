import React from "react";
import { Link } from "react-router-dom";

const EventCard = ({ event }) => {
  const dateStr = new Date(event.date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const seatsLeft = event.totalSeats - event.bookedSeats;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
      <img
        src={event.bannerImage || "https://placehold.co/400x200?text=Event"}
        alt={event.title}
        className="w-full h-40 object-cover"
      />
      <div className="p-4">
        <span className="text-xs font-semibold text-primary uppercase">{event.category}</span>
        <h3 className="text-lg font-bold mt-1">{event.title}</h3>
        <p className="text-sm text-gray-500 mt-1">
          {dateStr} • {event.time}
        </p>
        <p className="text-sm text-gray-500">{event.venue}</p>
        <div className="flex justify-between items-center mt-3">
          <span className="font-semibold">₹{event.price}</span>
          <span className={`text-xs ${seatsLeft > 0 ? "text-green-600" : "text-red-600"}`}>
            {seatsLeft > 0 ? `${seatsLeft} seats left` : "Sold out"}
          </span>
        </div>
        <Link
          to={`/events/${event._id}`}
          className="block mt-3 text-center bg-primary text-white rounded-md py-2 text-sm font-medium hover:bg-indigo-700"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default EventCard;

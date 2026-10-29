import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

const categories = ["Music", "Sports", "Conference", "Workshop", "Comedy", "Theatre", "Other"];

const CreateEvent = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // present when editing an existing event
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Music",
    date: "",
    time: "",
    venue: "",
    bannerImage: "",
    price: "",
    totalSeats: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (id) {
        await api.put(`/events/${id}`, form);
      } else {
        await api.post("/events", form);
      }
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{id ? "Edit Event" : "Create New Event"}</h1>
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow-md">
        <input
          type="text"
          name="title"
          placeholder="Event Title"
          className="w-full border rounded-md px-3 py-2"
          value={form.title}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          className="w-full border rounded-md px-3 py-2"
          rows={4}
          value={form.description}
          onChange={handleChange}
          required
        />
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2"
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="date"
            name="date"
            className="border rounded-md px-3 py-2"
            value={form.date}
            onChange={handleChange}
            required
          />
          <input
            type="time"
            name="time"
            className="border rounded-md px-3 py-2"
            value={form.time}
            onChange={handleChange}
            required
          />
        </div>
        <input
          type="text"
          name="venue"
          placeholder="Venue"
          className="w-full border rounded-md px-3 py-2"
          value={form.venue}
          onChange={handleChange}
          required
        />
        <input
          type="url"
          name="bannerImage"
          placeholder="Banner Image URL (optional)"
          className="w-full border rounded-md px-3 py-2"
          value={form.bannerImage}
          onChange={handleChange}
        />
        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            name="price"
            placeholder="Ticket Price (₹)"
            className="border rounded-md px-3 py-2"
            value={form.price}
            onChange={handleChange}
            min={0}
            required
          />
          <input
            type="number"
            name="totalSeats"
            placeholder="Total Seats"
            className="border rounded-md px-3 py-2"
            value={form.totalSeats}
            onChange={handleChange}
            min={1}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-2 rounded-md font-medium hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Saving..." : id ? "Update Event" : "Create Event"}
        </button>
      </form>
    </div>
  );
};

export default CreateEvent;

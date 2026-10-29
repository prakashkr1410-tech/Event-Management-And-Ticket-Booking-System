const mongoose = require("mongoose");

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required to connect to MongoDB");
  }

  const conn = await mongoose.connect(process.env.MONGO_URI, {
    dbName: process.env.MONGO_DB_NAME || "event_ticketing",
  });
  console.log(`MongoDB connected: ${conn.connection.host}`);
};

module.exports = connectDB;

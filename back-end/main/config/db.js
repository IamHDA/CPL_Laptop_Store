const mongoose = require("mongoose");

// Cache trên globalThis để cold start không mở connection mới mỗi lần.
const cache = (globalThis._mongooseCache ??= { conn: null, promise: null });

const connectDB = async () => {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 })
      .then((m) => {
        console.log("MongoDB connected");
        return m;
      })
      .catch((err) => {
        cache.promise = null; // cho phép request sau thử lại thay vì kẹt lỗi cũ
        throw err;
      });
  }

  cache.conn = await cache.promise;
  return cache.conn;
};

module.exports = connectDB;

require("dotenv").config();
const mongoose = require("mongoose");
const Voucher = require("./models/Voucher");

const day = (d) => new Date(Date.now() + d * 86400000);

const vouchers = [
  // ── Đang chạy ───────────────────────────────────────────────────────────────
  { code: "WELCOME5",   type: "percent", value: 5,       minOrderValue: 0,        maxDiscount: 1000000, usageLimit: null, usedCount: 0,  startsAt: day(-30), expiresAt: day(60), isActive: true },
  { code: "GIAM10",     type: "percent", value: 10,      minOrderValue: 15000000, maxDiscount: 3000000, usageLimit: 200,  usedCount: 47, startsAt: day(-14), expiresAt: day(30), isActive: true },
  { code: "LAPTOP500K", type: "fixed",   value: 500000,  minOrderValue: 10000000, maxDiscount: null,    usageLimit: 100,  usedCount: 62, startsAt: day(-7),  expiresAt: day(21), isActive: true },
  { code: "FREESHIP",   type: "fixed",   value: 35000,   minOrderValue: 0,        maxDiscount: null,    usageLimit: null, usedCount: 318, startsAt: day(-60), expiresAt: day(90), isActive: true },
  { code: "SINHVIEN",   type: "percent", value: 7,       minOrderValue: 8000000,  maxDiscount: 1500000, usageLimit: 500,  usedCount: 129, startsAt: day(-45), expiresAt: day(45), isActive: true },
  { code: "SETUPPC",    type: "fixed",   value: 1000000, minOrderValue: 25000000, maxDiscount: null,    usageLimit: 50,   usedCount: 8,  startsAt: day(-3),  expiresAt: day(14), isActive: true },

  // ── Sắp mở ──────────────────────────────────────────────────────────────────
  { code: "BLACKFRIDAY", type: "percent", value: 20,      minOrderValue: 20000000, maxDiscount: 5000000, usageLimit: 300, usedCount: 0,  startsAt: day(7),  expiresAt: day(12), isActive: true },

  // ── Đã hết lượt / hết hạn / bị tắt — để demo các trạng thái trong admin ─────
  { code: "HETLUOT",    type: "percent", value: 15,      minOrderValue: 5000000,  maxDiscount: 2000000, usageLimit: 50,  usedCount: 50, startsAt: day(-20), expiresAt: day(10), isActive: true },
  { code: "TET2025",    type: "fixed",   value: 888000,  minOrderValue: 12000000, maxDiscount: null,    usageLimit: 200, usedCount: 187, startsAt: day(-120), expiresAt: day(-60), isActive: true },
  { code: "TAMDUNG",    type: "percent", value: 12,      minOrderValue: 10000000, maxDiscount: 2000000, usageLimit: 100, usedCount: 3,  startsAt: day(-10), expiresAt: day(30), isActive: false },
];

async function main() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/ecommerce");
  console.log("✅ Đã kết nối MongoDB");

  await Voucher.deleteMany({});
  await Voucher.insertMany(vouchers);

  const now = new Date();
  const usable = vouchers.filter(
    (v) => v.isActive && v.startsAt <= now && v.expiresAt > now && (v.usageLimit === null || v.usedCount < v.usageLimit)
  );
  console.log(`🎟️  Đã tạo ${vouchers.length} voucher (${usable.length} mã dùng được ngay)`);
  console.log(`   Thử ngay: ${usable.map((v) => v.code).join(", ")}`);

  await mongoose.disconnect();
}

if (require.main === module) main().catch(async (err) => {
  console.error("❌ Lỗi khi seed voucher:", err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});

module.exports = { vouchers };

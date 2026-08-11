require("dotenv").config();
const mongoose = require("mongoose");
const ShippingZone = require("./models/ShippingZone");

// Tên tỉnh phải khớp chính xác chuỗi `province` trong User.addresses — CheckoutPage
// tự chọn vùng bằng cách so tên (so sánh lowercase), sai một chữ là không match.
const zones = [
  // Nội thành hai đầu — kho đặt tại đây nên phí thấp, giao nhanh
  { name: "TP Hồ Chí Minh", code: "HCM", fee: 20000, estimatedDays: 1 },
  { name: "Hà Nội",         code: "HN",  fee: 25000, estimatedDays: 2 },

  // Thành phố lớn
  { name: "Đà Nẵng",        code: "DN",  fee: 30000, estimatedDays: 3 },
  { name: "Hải Phòng",      code: "HP",  fee: 30000, estimatedDays: 3 },
  { name: "Cần Thơ",        code: "CT",  fee: 35000, estimatedDays: 3 },

  // Đông Nam Bộ & lân cận TP HCM
  { name: "Bình Dương",     code: "BD",  fee: 22000, estimatedDays: 2 },
  { name: "Đồng Nai",       code: "DNA", fee: 25000, estimatedDays: 2 },
  { name: "Bà Rịa - Vũng Tàu", code: "BRVT", fee: 30000, estimatedDays: 3 },
  { name: "Long An",        code: "LA",  fee: 28000, estimatedDays: 2 },

  // Miền Bắc
  { name: "Bắc Ninh",       code: "BN",  fee: 28000, estimatedDays: 3 },
  { name: "Quảng Ninh",     code: "QN",  fee: 35000, estimatedDays: 4 },
  { name: "Thanh Hóa",      code: "TH",  fee: 35000, estimatedDays: 4 },
  { name: "Nghệ An",        code: "NA",  fee: 38000, estimatedDays: 4 },

  // Miền Trung & Tây Nguyên
  { name: "Thừa Thiên Huế", code: "TTH", fee: 35000, estimatedDays: 4 },
  { name: "Khánh Hòa",      code: "KH",  fee: 35000, estimatedDays: 3 },
  { name: "Lâm Đồng",       code: "LD",  fee: 35000, estimatedDays: 3 },
  { name: "Đắk Lắk",        code: "DL",  fee: 40000, estimatedDays: 4 },

  // Miền Tây
  { name: "An Giang",       code: "AG",  fee: 38000, estimatedDays: 4 },
  { name: "Kiên Giang",     code: "KG",  fee: 40000, estimatedDays: 4 },
  { name: "Cà Mau",         code: "CM",  fee: 45000, estimatedDays: 5 },
];

async function main() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/ecommerce");
  console.log("✅ Đã kết nối MongoDB");

  await ShippingZone.deleteMany({});
  await ShippingZone.insertMany(zones.map((z) => ({ ...z, isActive: true })));

  const fees = zones.map((z) => z.fee);
  console.log(`🚚 Đã tạo ${zones.length} khu vực vận chuyển`);
  console.log(`   Phí từ ${Math.min(...fees).toLocaleString("vi-VN")}đ đến ${Math.max(...fees).toLocaleString("vi-VN")}đ · giao 1-5 ngày`);

  await mongoose.disconnect();
}

if (require.main === module) main().catch(async (err) => {
  console.error("❌ Lỗi khi seed khu vực vận chuyển:", err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});

module.exports = { zones };

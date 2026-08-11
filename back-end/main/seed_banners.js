require("dotenv").config();
const mongoose = require("mongoose");
const Banner = require("./models/Banner");

// Ảnh khổ ngang 1600x500 — cùng bộ ảnh Unsplash với seed.js, chỉ đổi tham số crop
const WIDE = (id) => `https://images.unsplash.com/${id}?w=1600&h=500&fit=crop&q=80`;

const banners = [
  // ── Trang chủ (carousel) ────────────────────────────────────────────────────
  { title: "Laptop Gaming RTX 40 Series - Giảm đến 18%", imageUrl: WIDE("photo-1603302576837-37561b2e2302"), linkUrl: "/categories/laptop-gaming",      position: "homepage", sortOrder: 1 },
  { title: "Back To School - Laptop Sinh Viên Từ 14 Triệu", imageUrl: WIDE("photo-1517336714731-489689fd1ca8"), linkUrl: "/categories/laptop-van-phong", position: "homepage", sortOrder: 2 },
  { title: "Workstation Đồ Họa - Trả Góp 0%",            imageUrl: WIDE("photo-1527443224154-c4a3942d3acf"), linkUrl: "/categories/laptop-do-hoa",     position: "homepage", sortOrder: 3 },
  { title: "Nâng Cấp SSD & RAM - Giá Chỉ Từ 990K",       imageUrl: WIDE("photo-1597872200969-2b65d56bd16b"), linkUrl: "/categories/ram-o-cung-ssd",    position: "homepage", sortOrder: 4 },
  { title: "Màn Hình Gaming 180Hz - Ưu Đãi Cuối Tuần",   imageUrl: WIDE("photo-1527814050087-3793815479db"), linkUrl: "/categories/man-hinh-may-tinh",  position: "homepage", sortOrder: 5 },
  { title: "Setup Gaming Trọn Bộ - Tặng Lót Chuột XXL",  imageUrl: WIDE("photo-1618384887929-16ec33fab9ef"), linkUrl: "/categories/phu-kien-gaming",   position: "homepage", sortOrder: 6 },

  // ── Banner từng danh mục ────────────────────────────────────────────────────
  { title: "ROG · Legion · Predator - Bảo hành 24 tháng", imageUrl: WIDE("photo-1615663245857-ac93bb7c39e7"), position: "laptop-gaming",     sortOrder: 1 },
  { title: "Laptop Gaming Dưới 25 Triệu",                 imageUrl: WIDE("photo-1591488320449-011701bb6704"), position: "laptop-gaming",     sortOrder: 2 },
  { title: "Ultrabook Mỏng Nhẹ Dưới 1.3kg",               imageUrl: WIDE("photo-1541807084-5c52b6b3adef"), position: "laptop-van-phong",  sortOrder: 1 },
  { title: "ThinkPad · XPS · Zenbook Chính Hãng",          imageUrl: WIDE("photo-1496181133206-80ce9b88a853"), position: "laptop-van-phong",  sortOrder: 2 },
  { title: "Màn Hình Chuẩn Màu 100% DCI-P3",              imageUrl: WIDE("photo-1593642632823-8f785ba67e45"), position: "laptop-do-hoa",     sortOrder: 1 },
  { title: "VGA RTX 40 SUPER - Hàng Chính Hãng",          imageUrl: WIDE("photo-1587202372775-e229f172b9d7"), position: "vga-card-do-hoa",   sortOrder: 1 },
  { title: "Intel Core & AMD Ryzen Thế Hệ Mới",           imageUrl: WIDE("photo-1555680202-c86f0e12f086"), position: "cpu-bo-vi-xu-ly",   sortOrder: 1 },
  { title: "SSD NVMe Gen4 - Đọc Tới 7450MB/s",            imageUrl: WIDE("photo-1625842268584-8f3296236761"), position: "ram-o-cung-ssd",    sortOrder: 1 },
  { title: "Màn Hình Ultrawide 49 inch",                  imageUrl: WIDE("photo-1593305841991-05c297ba4575"), position: "man-hinh-may-tinh", sortOrder: 1 },
  { title: "Bàn Phím Cơ Hot-swap - Bảo Hành 12 Tháng",    imageUrl: WIDE("photo-1547082299-de196ea013d6"), position: "phu-kien-gaming",   sortOrder: 1 },
];

async function main() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/ecommerce");
  console.log("✅ Đã kết nối MongoDB");

  await Banner.deleteMany({});
  await Banner.insertMany(banners.map((b) => ({ linkUrl: "", isActive: true, ...b })));
  console.log(`🖼️  Đã tạo ${banners.length} banner`);

  await mongoose.disconnect();
}

if (require.main === module) main().catch(async (err) => {
  console.error("❌ Lỗi khi seed banner:", err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});

module.exports = { banners };
